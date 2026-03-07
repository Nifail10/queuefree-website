/* QueueFree — main.js */

(function () {
  'use strict';

  /* ── Active Nav Link ─────────────────── */
  function setActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__links a').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ── Scroll: Nav Background ──────────── */
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        nav.style.background = 'rgba(13, 15, 16, 0.96)';
      } else {
        nav.style.background = 'rgba(13, 15, 16, 0.80)';
      }
    }, { passive: true });
  }

  /* ── Intersection Observer: Fade-in ─── */
  function initFadeObserver() {
    const els = document.querySelectorAll('.observe-fade');
    if (!els.length) return;
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) {
      el.style.opacity = '0';
      observer.observe(el);
    });
  }



  /* ── Init ─────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initNavScroll();
    initFadeObserver();

  });
})();
