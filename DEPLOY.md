# Deploying Temecula Interior Design to Vercel

This is a plain static site (HTML/CSS/JS). It drops straight into Vercel — no build step.

## Files in this folder
- `index.html` — Home
- `services.html` — Services  → served at `/services`
- `portfolio.html` — Portfolio → served at `/portfolio`
- `about.html` — About & Contact → served at `/about`
- `media.html` — Media → served at `/media`
- `styles.css`, `script.js` — shared styling and behavior
- `favicon.svg` — gold "T" browser icon
- `sitemap.xml`, `robots.txt` — SEO / crawler files
- `vercel.json` — clean URLs (drops `.html`) + caching + security headers

## Option A — Drag & drop (fastest, no tools)
1. Zip this `temecula-site` folder (or keep it as a folder).
2. Go to vercel.com → **Add New… → Project → Deploy** (the drag-and-drop / "deploy a folder" flow).
3. Drop the folder in. Vercel publishes it in seconds to a `*.vercel.app` URL.

## Option B — Vercel CLI
```
npm i -g vercel
cd temecula-site
vercel          # preview deploy
vercel --prod   # production deploy
```

## Connect your domain (temeculainteriordesign.com)
1. In the Vercel project → **Settings → Domains → Add** → enter `temeculainteriordesign.com` and `www.temeculainteriordesign.com`.
2. Vercel shows the DNS records to set (an A record / CNAME). Add them at your domain registrar.
3. SSL is issued automatically. Done.

## Turn on the contact form (2 minutes)
The form on the About page needs an endpoint to email you submissions (static sites can't email on their own).
1. Create a free form at **formspree.io** using `admin@temeculainteriordesign.com`.
2. In `about.html`, replace `https://formspree.io/f/your-form-id` with the endpoint Formspree gives you.
That's it — submissions land in your inbox.

## Final SEO steps after going live
1. Add the site to **Google Search Console** and submit `sitemap.xml`.
2. Create/claim your **Google Business Profile** for the Winchester Rd address — this plus the LocalBusiness schema already in `index.html` drives local "interior designer Temecula" results.
3. Swap the placeholder Unsplash photos for your real project images (keep the descriptive `alt` text — it helps SEO).
4. Add a real `og-image.jpg` (1200×630) to this folder for link previews on social/text.
