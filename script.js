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

// Portfolio filter
function filt(btn,cat){
  document.querySelectorAll('.filter button').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  document.querySelectorAll('#masonry .m').forEach(function(m){
    m.style.display=(cat==='all'||m.dataset.cat===cat)?'':'none';
  });
}
