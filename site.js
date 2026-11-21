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


  // Project filters
  var filterBtns = document.querySelectorAll('.filters button');
  var projects = document.querySelectorAll('#work .entry');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', b === btn); });
      projects.forEach(function (el) {
        var show = f === 'all' || (el.getAttribute('data-cat') || '').split(' ').indexOf(f) > -1;
        if (show) { el.hidden = false; requestAnimationFrame(function () { el.classList.remove('filtered-out'); }); }
        else { el.classList.add('filtered-out'); setTimeout(function () { if (el.classList.contains('filtered-out')) el.hidden = true; }, reduce ? 0 : 220); }
      });
    });
  });

  // Copy email with a small confirmation
  var toast = document.querySelector('.toast');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  document.querySelectorAll('.copy-email').forEach(function (b) {
    b.addEventListener('click', function () {
      var email = b.getAttribute('data-email');
      var done = function () { showToast('Email copied: ' + email); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(done, function () { window.location.href = 'mailto:' + email; });
      else window.location.href = 'mailto:' + email;
    });
  });

  // Soft spotlight that follows the cursor on cards
  document.querySelectorAll('.interests li, .stats li').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Count-up for the at-a-glance numbers
  function countUp(el) {
    var end = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = 900;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

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

  // Count-up when the numbers come into view
  if (!reduce) {
    var nums = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); nums.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (n) { nums.observe(n); });
  }

  // Gentle fade-up as content scrolls into view
  if (reduce) return;
  var items = document.querySelectorAll('.stats li, .filters, section > h2, .prose > p, .interests li, .entry, .cv-row, h3.sub, .skills, .beyond > div, .contact-links, .location');
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
    if (el.matches('.interests li, .stats li')) el.style.transitionDelay = (sibs * 90) + 'ms';
    el.classList.add('reveal');
    io.observe(el);
  });
})();
