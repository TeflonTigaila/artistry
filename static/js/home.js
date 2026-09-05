/* ══════════════════════════
   home.js — optimizat
   Diferențe față de original:
   1. buildSlide() rulează DOAR pt slide-ul activ la init, nu pt toate 5.
      Slide-urile video vecine se construiesc doar când devin active (goTo)
      sau sunt "preîncărcate" cu preload=metadata, nu auto.
   2. phone video: IntersectionObserver -> se încarcă/pornește doar când
      intră în viewport, nu la load-ul paginii (era în afara ecranului inițial).
══════════════════════════ */

const isMobile = () => window.innerWidth <= 768;

const slideEls = Array.from(document.querySelectorAll('.slide'));
const dotEls   = Array.from(document.querySelectorAll('.dot'));
let cur_ = 0, autoTimer = null;

function buildSlide(el) {
  if (el.dataset.built === '1') return; // nu reconstrui dacă deja există
  el.innerHTML = '';
  const type = el.dataset.type;
  const src  = isMobile() ? el.dataset.mobile : el.dataset.desktop;
  if (!src) return;

  if (type === 'video') {
    const v = document.createElement('video');
    v.src = src; v.muted = true; v.loop = true; v.playsInline = true;
    v.preload = el.classList.contains('active') ? 'auto' : 'metadata';
    v.setAttribute('playsinline', '');
    v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none';
    el.appendChild(v);
    if (el.classList.contains('active')) v.play().catch(() => {});
  } else {
    const d = document.createElement('div');
    d.className = 'slide-img';
    d.style.backgroundImage = `url('${src}')`;
    el.appendChild(d);
  }
  el.dataset.built = '1';
}

function goTo(idx) {
  slideEls[cur_].querySelector('video')?.pause();
  slideEls[cur_].classList.remove('active');
  dotEls[cur_].classList.remove('active');

  cur_ = ((idx % slideEls.length) + slideEls.length) % slideEls.length;

  slideEls[cur_].classList.add('active');
  dotEls[cur_].classList.add('active');
  buildSlide(slideEls[cur_]); // lazy: se construiește abia acum dacă n-a fost încă
  slideEls[cur_].querySelector('video')?.play().catch(() => {});

  // preîncarcă doar metadata pt slide-ul următor, nu tot fișierul
  const next = slideEls[(cur_ + 1) % slideEls.length];
  buildSlide(next);
}

function startAuto() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => goTo(cur_ + 1), 6000);
}

/* init: doar slide-ul activ + preload metadata pt următorul */
buildSlide(slideEls[cur_]);
buildSlide(slideEls[(cur_ + 1) % slideEls.length]);
startAuto();

dotEls.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startAuto(); }));
document.querySelector('.tap-left')?.addEventListener('click',  () => { goTo(cur_ - 1); startAuto(); });
document.querySelector('.tap-right')?.addEventListener('click', () => { goTo(cur_ + 1); startAuto(); });

let touchStartX = 0;
const hero = document.querySelector('.hero');
hero?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
hero?.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) { goTo(dx < 0 ? cur_ + 1 : cur_ - 1); startAuto(); }
}, { passive: true });

let rTimer;
window.addEventListener('resize', () => {
  clearTimeout(rTimer);
  rTimer = setTimeout(() => {
    slideEls.forEach(el => { el.dataset.built = '0'; }); // forțează rebuild pe breakpoint nou
    buildSlide(slideEls[cur_]);
    slideEls[cur_].querySelector('video')?.play().catch(() => {});
  }, 300);
}, { passive: true });

/* ─────────────────────────────────────
   PHONE VIDEO — lazy load la scroll
   Necesită în index.html:
   <video id="phone-video" data-desktop="/static/videos/phone-reel.mp4"
          data-mobile="/static/videos/phone-reel.mp4"
          muted loop playsinline controls></video>
   (elimină <source> hardcodat din HTML, se setează din JS ca și hero-ul)
───────────────────────────────────── */
const phoneVid = document.getElementById('phone-video');

if (phoneVid) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const src = isMobile() ? phoneVid.dataset.mobile : phoneVid.dataset.desktop;
        if (src && phoneVid.getAttribute('src') !== src) {
          phoneVid.src = src;
          phoneVid.load();
          phoneVid.play().catch(() => {});
        }
        io.unobserve(phoneVid); // o singură dată, nu trebuie re-triggeruit
      }
    });
  }, { threshold: 0.25 });
  io.observe(phoneVid);
}

/* ─────────────────────────────────────
   SERVICE CARD GIFS — neschimbat, era deja corect
───────────────────────────────────── */
document.querySelectorAll('.svc-card').forEach(card => {
  const img = card.querySelector('.svc-gif-img');
  if (!img) return;
  const gifSrc = img.dataset.gif;
  if (!gifSrc) return;

  const play = () => { img.src = gifSrc + '?t=' + Date.now(); };
  const stop = () => { img.removeAttribute('src'); };

  card.addEventListener('mouseenter', play);
  card.addEventListener('mouseleave', stop);
  card.addEventListener('focusin', play);
  card.addEventListener('focusout', stop);
});
