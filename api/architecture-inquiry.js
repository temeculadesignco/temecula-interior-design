// /api/architecture-inquiry
// Handles submissions from /architecture's contact form:
//   1. Uploads any attached files to Vercel Blob
//   2. Creates a row in the Notion "Form Submissions" database
//   3. Emails the inquiry to owner@temeculainteriordesign.com via FormSubmit's AJAX endpoint
//
// Requires the NOTION_API_KEY environment variable to be set in Vercel
// (Project Settings -> Environment Variables). The Notion integration must
// be shared with the "Form Submissions" database.

export const config = { api: { bodyParser: false } };

const NOTION_DB_ID = "00f60a29-9398-4993-a1df-bdd7d0feaa39";
const NOTION_VERSION = "2022-06-28";
const OWNER_EMAIL = "owner@temeculainteriordesign.com";

async function readMultipart(req) {
  const { default: Busboy } = await import("busboy");
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    const bb = Busboy({ headers: req.headers, limits: { fileSize: 20 * 1024 * 1024 } });

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (name, stream, info) => {
      const chunks = [];
      stream.on("data", (c) => chunks.push(c));
      stream.on("end", () => {
        if (chunks.length) {
          files.push({
            fieldname: name,
            filename: info.filename,
            mimeType: info.mimeType,
            buffer: Buffer.concat(chunks),
          });
        }
      });
    });

    bb.on("error", reject);
    bb.on("finish", () => resolve({ fields, files }));
    req.pipe(bb);
  });
}

async function uploadToBlob(file) {
  const { put } = await import("@vercel/blob");
  const safeName = `architecture-inquiries/${Date.now()}-${file.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const blob = await put(safeName, file.buffer, {
    access: "public",
    contentType: file.mimeType,
  });
  return blob.url;
}

async function createNotionPage({ name, email, phone, message, sourcePage, fileUrls }) {
  const properties = {
    Name: { title: [{ text: { content: name || "Website inquiry" } }] },
    Email: email ? { email } : undefined,
    Phone: phone ? { phone_number: phone } : undefined,
    Message: message ? { rich_text: [{ text: { content: message.slice(0, 1900) } }] } : undefined,
    "Source Page": { select: { name: sourcePage || "Architecture Page" } },
    "Submitted At": { date: { start: new Date().toISOString() } },
    Status: { select: { name: "New" } },
  };
  if (fileUrls.length) {
    properties.Attachments = {
      files: fileUrls.map((url, i) => ({
        type: "external",
        name: `attachment-${i + 1}`,
        external: { url },
      })),
    };
  }
  Object.keys(properties).forEach((k) => properties[k] === undefined && delete properties[k]);

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_DB_ID },
      properties,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Notion API error ${res.status}: ${body}`);
  }
  return res.json();
}

async function sendEmail({ name, email, phone, message, fileUrls }) {
  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Message: ${message || "(none)"}`,
    fileUrls.length ? `Attachments:\n${fileUrls.join("\n")}` : "Attachments: (none)",
  ].join("\n\n");

  const res = await fetch(`https://formsubmit.co/ajax/${OWNER_EMAIL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      _subject: "New Architecture Page Inquiry — Temecula Interior Design",
      name,
      email,
      phone,
      message: lines,
    }),
  });
  return res.ok;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const { fields, files } = await readMultipart(req);
    const { name, email, phone, message, project_type, source_page } = fields;

    if (!name || !phone || !email) {
      res.status(400).json({ ok: false, error: "Missing required fields" });
      return;
    }

    let fileUrls = [];
    if (files.length) {
      fileUrls = await Promise.all(files.map(uploadToBlob));
    }

    const fullMessage = project_type ? `Project Type: ${project_type}\n\n${message || ""}` : message;

    if (!process.env.NOTION_API_KEY) {
      console.error("NOTION_API_KEY not set — architecture inquiry not persisted to Notion", {
        name,
        email,
        phone,
      });
    } else {
      await createNotionPage({
        name,
        email,
        phone,
        message: fullMessage,
        sourcePage: source_page || "Architecture Page",
        fileUrls,
      });
    }

    await sendEmail({ name, email, phone, message: fullMessage, fileUrls }).catch((e) =>
      console.error("Email relay failed", e)
    );

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("architecture-inquiry error", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
}
