// Mobile menu toggle
function toggleMenu(){document.getElementById('navlinks').classList.toggle('open');}

// Sticky nav: transparent over hero on home, solid on scroll / inner pages
(function(){
  var nav=document.getElementById('nav');
  var isHome=document.body.classList.contains('home');
  function onScroll(){
    if(!isHome||window.scrollY>60){nav.classList.add('solid');}else{nav.classList.remove('solid');}
  }
  window.addEventListener('scroll',onScroll);
  onScroll();
})();

// Portfolio filter. "all" intentionally excludes the Before & After tab —
// those pairs only show up once that tab is selected directly.
function filt(btn,cat){
  document.querySelectorAll('.filter button').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  document.querySelectorAll('#masonry .m').forEach(function(m){
    var show = (cat==='all') ? (m.dataset.cat==='built'||m.dataset.cat==='render') : (m.dataset.cat===cat);
    // explicit 'block' (not '') — a default-hide CSS rule keeps the Before &
    // After tiles out of the initial view, and only an inline style beats it
    m.style.display = show ? 'block' : 'none';
  });
}

// "Book a Free Consultation": opens the Google Calendar appointment booking
// page in an on-page popup when an embeddable schedule URL is set
// (calendar.google.com/calendar/appointments/schedules/...), otherwise the
// link simply opens the booking page in a new tab.
(function(){
  var EMBED_URL = ''; // e.g. 'https://calendar.google.com/calendar/appointments/schedules/XXXX?gv=true'
  if(!EMBED_URL) return;
  var modal;
  function open(e){
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.button===1) return;
    e.preventDefault();
    if(!modal){
      modal=document.createElement('div');
      modal.className='book-modal';
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      modal.setAttribute('aria-label','Book a Free Consultation');
      modal.innerHTML='<div class="book-modal-box"><button class="book-modal-close" type="button">Close ✕</button><iframe title="Book a Free Consultation" loading="lazy"></iframe></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click',function(ev){if(ev.target===modal||ev.target.classList.contains('book-modal-close'))close();});
      document.addEventListener('keydown',function(ev){if(ev.key==='Escape')close();});
    }
    var f=modal.querySelector('iframe'); if(!f.src) f.src=EMBED_URL;
    modal.classList.add('open'); document.body.style.overflow='hidden';
  }
  function close(){ if(modal){modal.classList.remove('open'); document.body.style.overflow='';} }
  document.querySelectorAll('.js-book').forEach(function(a){a.addEventListener('click',open);});
})();
