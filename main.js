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

(function () {
  const toggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav__links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('nav--open');
    toggle.classList.toggle('nav--open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close menu when a nav link is clicked (single-page navigation)
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('nav--open');
      toggle.classList.remove('nav--open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();
