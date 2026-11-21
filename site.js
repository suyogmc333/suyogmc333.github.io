(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle (light / dark), remembered per visitor
  var toggle = document.querySelector('.theme-toggle');
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function syncToggle() {
    if (!toggle) return;
    var dark = isDark();
    toggle.innerHTML = dark ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>' : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  if (toggle) {
    syncToggle();
    toggle.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncToggle();
    });
  }

  // Reading progress bar, nav shadow, back-to-top button
  var bar = document.querySelector('.progress');
  var nav = document.querySelector('.nav');
  var topBtn = document.querySelector('.to-top');
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (topBtn) topBtn.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (topBtn) topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  if (!('IntersectionObserver' in window)) return;

  // Highlight the nav link for the section in view
  var links = {};
  document.querySelectorAll('.nav nav a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });

  // Gentle fade-up as content scrolls into view
  if (reduce) return;
  var items = document.querySelectorAll('section > h2, .prose > p, .interests li, .entry, .cv-row, h3.sub, .skills, .beyond > div, .contact-links, .location');
  root.classList.add('reveal-ready');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  items.forEach(function (el) {
    var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    if (el.matches('.interests li')) el.style.transitionDelay = (sibs * 90) + 'ms';
    el.classList.add('reveal');
    io.observe(el);
  });
})();
