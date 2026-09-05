/* ══════════════════════════
   main.js — shared
══════════════════════════ */

/* Cursor (desktop only) */
const cur  = document.getElementById('cur');
const curR = document.getElementById('cur-r');
if (cur && curR) {
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });
  setInterval(() => {
    curR.style.left = mx + 'px';
    curR.style.top  = my + 'px';
  }, 80);
}

/* Preloader */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('preloader')?.classList.add('hidden'), 2400);
});

/* Nav scroll */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav?.classList.toggle('sc', scrollY > 50), { passive: true });

/* Hamburger */
const ham    = document.getElementById('ham');
const drawer = document.getElementById('drawer');
ham?.addEventListener('click', () => {
  ham.classList.toggle('open');
  drawer.classList.toggle('open');
});
document.getElementById('dclose')?.addEventListener('click', () => {
  ham.classList.remove('open');
  drawer.classList.remove('open');
});
drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  ham.classList.remove('open');
  drawer.classList.remove('open');
}));

/* Scroll reveal */
const obs = new IntersectionObserver(entries => {
  entries.forEach(x => { if (x.isIntersecting) { x.target.classList.add('on'); obs.unobserve(x.target); } });
}, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.rv,.rv-l,.rv-r,.rv-s').forEach(el => obs.observe(el));
