(function () {
  'use strict';

  const REVEAL_THRESHOLD = 0.1;

  // ── Smooth Scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      var targetEl = document.querySelector(targetId);
      if (targetEl && targetId !== '#') {
        e.preventDefault();
        var navHeight = document.querySelector('nav').offsetHeight;
        window.scrollTo({
          top: targetEl.offsetTop - navHeight,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── Active Navigation + Scroll State ──
  var sections = document.querySelectorAll('section[id], div[id], aside[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var navbar = document.querySelector('nav');
  var isScrollTicking = false;

  function updateScrollState() {
    var current = '';
    var scrollPos = window.scrollY + 150;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });

    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  }

  function requestScrollUpdate() {
    if (isScrollTicking) return;
    isScrollTicking = true;
    window.requestAnimationFrame(function () {
      updateScrollState();
      isScrollTicking = false;
    });
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  updateScrollState();

  // ── Mobile Menu ──
  var menuToggle = document.querySelector('.menu-toggle');
  var navMenu = document.querySelector('.nav-links');

  if (menuToggle && navMenu) {
    function toggleMenu(isOpen) {
      navMenu.classList.toggle('open', isOpen);
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('menu-open', isOpen);
    }

    menuToggle.addEventListener('click', function () {
      toggleMenu(!navMenu.classList.contains('open'));
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { toggleMenu(false); });
    });

    document.addEventListener('click', function (e) {
      if (navMenu.classList.contains('open') &&
          !navMenu.contains(e.target) &&
          !menuToggle.contains(e.target)) {
        toggleMenu(false);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        toggleMenu(false);
        menuToggle.focus();
      }
    });
  }

  // ── Reveal on Scroll ──
  function initRevealAnimations() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: REVEAL_THRESHOLD,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevealAnimations);
  } else {
    initRevealAnimations();
  }

})();
