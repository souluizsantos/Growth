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

  // ── Metric Counters (R$487K, -63%, 100%) ──
  function initMetricCounters() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var els = document.querySelectorAll('.ab-metric-num');
    if (!els.length) return;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function getLeadingTextNode(el) {
      for (var i = 0; i < el.childNodes.length; i++) {
        var n = el.childNodes[i];
        if (n && n.nodeType === 3 && String(n.nodeValue).trim() !== '') return n; // TEXT_NODE
      }
      return null;
    }

    function parsePrefixAndNumber(text) {
      // Example inputs: "R$487", "-63", "100"
      var m = String(text).match(/^(.*?)(-?\d+(?:[\.,]\d+)?)\s*$/);
      if (!m) return null;
      var prefix = m[1] || '';
      var numStr = m[2];
      var value = parseFloat(numStr.replace(',', '.'));
      if (!isFinite(value)) return null;
      return { prefix: prefix, value: value, decimals: (numStr.split(/[\.,]/)[1] || '').length };
    }

    function formatNumber(value, decimals) {
      if (decimals > 0) return value.toFixed(decimals);
      return String(Math.round(value));
    }

    function animateOne(el) {
      if (el.getAttribute('data-counted') === 'true') return;

      var textNode = getLeadingTextNode(el);
      if (!textNode) return;

      var parsed = parsePrefixAndNumber(textNode.nodeValue);
      if (!parsed) return;

      el.setAttribute('data-counted', 'true');

      var start = 0;
      var target = parsed.value;
      var duration = 950;
      var startTs = null;

      // Ensure we start visually at 0 with the same prefix.
      textNode.nodeValue = parsed.prefix + formatNumber(start, parsed.decimals);

      function step(ts) {
        if (startTs == null) startTs = ts;
        var p = Math.min(1, (ts - startTs) / duration);
        var eased = easeOutCubic(p);
        var v = start + (target - start) * eased;

        // Snap to final value at the end to avoid rounding drift.
        if (p >= 1) v = target;
        textNode.nodeValue = parsed.prefix + formatNumber(v, parsed.decimals);

        if (p < 1) window.requestAnimationFrame(step);
      }

      window.requestAnimationFrame(step);
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateOne(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45, rootMargin: '0px 0px -10% 0px' });

    els.forEach(function (el) { obs.observe(el); });
  }

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevealAnimations);
    document.addEventListener('DOMContentLoaded', initMetricCounters);
  } else {
    initRevealAnimations();
    initMetricCounters();
  }

  // ── Desktop Cursor Ring ──
  function initCursorRing() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);

    var x = -9999;
    var y = -9999;
    var hasMoved = false;

    function updateTransform() {
      ring.style.transform =
        'translate3d(' + x + 'px, ' + y + 'px, 0) translate(-50%, -50%)';
    }

    function onMove(e) {
      x = e.clientX;
      y = e.clientY;
      updateTransform();
      if (!hasMoved) {
        hasMoved = true;
        ring.classList.add('is-visible');
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', function () { ring.classList.add('is-down'); }, { passive: true });
    window.addEventListener('mouseup', function () { ring.classList.remove('is-down'); }, { passive: true });
    window.addEventListener('blur', function () { ring.classList.remove('is-down'); });

    // Hide when cursor leaves the page
    if (document.documentElement) {
      document.documentElement.addEventListener('mouseleave', function () {
        ring.classList.remove('is-visible');
        ring.classList.remove('is-hover');
      }, { passive: true });

      document.documentElement.addEventListener('mouseenter', function () {
        if (hasMoved) ring.classList.add('is-visible');
      }, { passive: true });
    }

    // Grow on interactive elements
    document.addEventListener('mouseover', function (e) {
      var el = e.target && e.target.closest
        ? e.target.closest('a, button, input, select, textarea, [role="button"], .nav-cta, .ab-btn-primary, .ab-btn-ghost, .ab-btn-cta')
        : null;
      ring.classList.toggle('is-hover', !!el);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursorRing);
  } else {
    initCursorRing();
  }

})();
