/* ============================================================
   Sea Breeze — поведение интерфейса
     • инициализация локализации
     • прилипающая шапка
     • мобильное меню (бургер)
     • появление блоков при скролле
     • отсчёт чисел в блоке «Инвестиции»
     • слайдеры проектов
     • плавающее меню-таблетка
     • мягкий плавный скролл (Lenis, только десктоп)
   ============================================================ */

import { initI18n } from './i18n.js';

initI18n();

/* прилипающая шапка */
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* мобильное меню */
const burger = document.getElementById('burger');
const menu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  })
);

/* появление при скролле */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* плавный отсчёт чисел в блоке «Почему стоит инвестировать» (от 1 до значения) */
(function initCounters() {
  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const bigs = document.querySelectorAll('.invest-item .big');
  if (!bigs.length) return;

  function run(el) {
    if (el.dataset.finalText == null) el.dataset.finalText = el.textContent;
    if (reduce) {
      el.textContent = el.dataset.finalText;
      return;
    }
    const DUR = 1700;
    let start = null;
    if (el._raf) cancelAnimationFrame(el._raf);
    function frame(t) {
      if (start === null) start = t;
      const p = Math.min((t - start) / DUR, 1);
      const e = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
      const src = el.dataset.finalText;
      el.textContent = src.replace(/\d+/g, (m) => {
        const target = parseInt(m, 10);
        if (p >= 1) return String(target);
        const v = Math.round(target * e);
        return String(v < 1 ? 1 : v);
      });
      if (p < 1) el._raf = requestAnimationFrame(frame);
      else el._raf = null;
    }
    el._raf = requestAnimationFrame(frame);
  }

  const co = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          co.unobserve(e.target);
        }
      });
    },
    { threshold: 0.45 }
  );
  bigs.forEach((el) => co.observe(el));

  /* при смене языка держим финальные значения счётчиков в актуальном языке */
  document.addEventListener('i18n:change', () => {
    document.querySelectorAll('.invest-item .big').forEach((el) => {
      el.dataset.finalText = el.textContent;
    });
  });
})();

/* слайдеры проектов */
document.querySelectorAll('.slider').forEach((sl) => {
  const track = sl.querySelector('.slides');
  const step = () => {
    const img = track.querySelector('img');
    return img ? img.getBoundingClientRect().width + 14 : 300;
  };
  const prev = sl.querySelector('.s-prev');
  const next = sl.querySelector('.s-next');
  prev && prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next && next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
});

/* показываем таблетку только после загрузки шрифтов — чтобы не «расширялась» при старте */
(function revealDock() {
  const dock = document.getElementById('dock');
  if (!dock) return;
  const show = () => dock.classList.add('ready');
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(show));
  }
  setTimeout(show, 1200);
})();

/* нежный плавный скролл — только на десктопе с курсором; на тач-устройствах остаётся нативный */
(function initSmoothScroll() {
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (typeof Lenis === 'undefined' || !fine || reduce) return;
  const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1, smoothWheel: true });
  window.lenis = lenis;
  document.documentElement.style.scrollBehavior = 'auto';
  function raf(t) {
    lenis.raf(t);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length < 2) return;
      const target = href === '#top' ? 0 : document.querySelector(href);
      if (target !== null) {
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.4 });
      }
    });
  });
})();

/* кнопка «наверх» */
const backtop = document.querySelector('.backtop');
backtop &&
  backtop.addEventListener('click', () => {
    if (window.lenis) window.lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
