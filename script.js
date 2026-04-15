/* =====================================================
   PORTFOLIO — script.js
   John Russelle Domingo
===================================================== */

'use strict';

/* ── 0. THEME TOGGLE (DARK / LIGHT) ────────────────── */
(function initTheme() {
  const btn  = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!btn || !icon) return;

  // Determine initial preference: saved > system
  const saved  = localStorage.getItem('theme');
  const prefer = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const initial = saved || prefer;

  function apply(theme) {
    if (theme === 'light') {
      document.body.classList.add('light');
      icon.className = 'fas fa-moon';
      btn.setAttribute('aria-label', 'Switch to dark mode');
    } else {
      document.body.classList.remove('light');
      icon.className = 'fas fa-sun';
      btn.setAttribute('aria-label', 'Switch to light mode');
    }
    localStorage.setItem('theme', theme);
  }

  apply(initial);

  btn.addEventListener('click', () => {
    const next = document.body.classList.contains('light') ? 'dark' : 'light';
    apply(next);
  });

  // Auto-cycle dark ↔ light every 30 seconds
  setInterval(() => {
    const next = document.body.classList.contains('light') ? 'dark' : 'light';
    apply(next);
  }, 30000);
})();


/* ── 0b. PHOTO AUTO-FLIP every 5 s ─────────────────── */
(function initPhotoFlip() {
  const flipper = document.getElementById('photoFlipper');
  const badge   = document.getElementById('photoBadge');
  if (!flipper) return;

  const labels = [
    '<span>📸</span> Personal',
    '<span>👤</span> GitHub',
  ];

  let flipped = false;

  setInterval(() => {
    flipped = !flipped;
    flipper.classList.toggle('is-flipped', flipped);
    if (badge) badge.innerHTML = labels[flipped ? 1 : 0];
  }, 5000);
})();


/* ── 1. HERO CANVAS — PARTICLE NETWORK ────────────── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  const COUNT  = 75;
  const DIST   = 140;
  const mobile = window.matchMedia('(max-width: 600px)');

  let W, H, particles, raf;
  const mouse = { x: null, y: null };
  let hue = 0; // cycles 0–360 for dark-mode RGB hover effect

  // Target palette per theme
  const THEME_DARK  = { r: 100, g: 255, b: 218, dotA: 0.45, lineA: 0.18, mouseA: 0.42 };
  const THEME_LIGHT = { r:   0, g:  80, b: 200, dotA: 0.70, lineA: 0.50, mouseA: 0.90 };

  // Current interpolated values (start at dark)
  let cur = { ...THEME_DARK };

  // Lerp helper
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Called every frame — smoothly moves cur toward the active theme target
  function lerpColors() {
    const target = document.body.classList.contains('light') ? THEME_LIGHT : THEME_DARK;
    const t = 0.04; // speed: lower = slower transition
    cur.r      = lerp(cur.r,      target.r,      t);
    cur.g      = lerp(cur.g,      target.g,      t);
    cur.b      = lerp(cur.b,      target.b,      t);
    cur.dotA   = lerp(cur.dotA,   target.dotA,   t);
    cur.lineA  = lerp(cur.lineA,  target.lineA,  t);
    cur.mouseA = lerp(cur.mouseA, target.mouseA, t);
  }

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.r  = Math.random() * 1.8 + 0.8;
    this.a  = Math.random() * 0.45 + 0.18;
  };
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };
  Particle.prototype.draw = function () {
    const isDark    = !document.body.classList.contains('light');
    const hovering  = mouse.x !== null;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    if (isDark && hovering) {
      // each dot shifts hue slightly based on its position → scattered rainbow
      const h = (hue + (this.x / W) * 80 + (this.y / H) * 40) % 360;
      ctx.fillStyle = `hsla(${h|0},100%,72%,${this.a.toFixed(3)})`;
    } else {
      const { r, g, b, dotA } = cur;
      ctx.fillStyle = `rgba(${r|0},${g|0},${b|0},${(this.a * (dotA / 0.45)).toFixed(3)})`;
    }
    ctx.fill();
  };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    const n = mobile.matches ? Math.floor(COUNT * 0.55) : COUNT;
    particles = Array.from({ length: n }, () => new Particle());
  }

  function drawLines() {
    const { r, g, b, lineA, mouseA } = cur;
    const ri = r|0, gi = g|0, bi = b|0;
    const isDark   = !document.body.classList.contains('light');
    const hovering = mouse.x !== null;

    for (let i = 0; i < particles.length; i++) {
      const pi = particles[i];

      // particle–particle connections
      for (let j = i + 1; j < particles.length; j++) {
        const pj  = particles[j];
        const dx  = pi.x - pj.x;
        const dy  = pi.y - pj.y;
        const d   = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          if (isDark && hovering) {
            // lines between dots shift hue slowly across the canvas
            const h = (hue + i * 5) % 360;
            ctx.strokeStyle = `hsla(${h|0},100%,65%,${((1 - d / DIST) * 0.28).toFixed(3)})`;
          } else {
            ctx.strokeStyle = `rgba(${ri},${gi},${bi},${((1 - d / DIST) * lineA).toFixed(3)})`;
          }
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // particle–mouse connections
      if (hovering) {
        const dx = pi.x - mouse.x;
        const dy = pi.y - mouse.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        const md = DIST * 1.6;
        if (d < md) {
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(mouse.x, mouse.y);
          if (isDark) {
            // each spoke gets a different hue → burst of rainbow from cursor
            const h = (hue + i * 14) % 360;
            ctx.strokeStyle = `hsla(${h|0},100%,68%,${((1 - d / md) * 0.85).toFixed(3)})`;
            ctx.lineWidth   = 1.1;
          } else {
            ctx.strokeStyle = `rgba(${ri},${gi},${bi},${((1 - d / md) * mouseA).toFixed(3)})`;
            ctx.lineWidth   = 0.9;
          }
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    lerpColors();
    // advance RGB hue only in dark mode while mouse is over canvas
    if (!document.body.classList.contains('light') && mouse.x !== null) {
      hue = (hue + 1.4) % 360;
    }
    drawLines();
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  // Debounce resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(raf);
      resize();
      loop();
    }, 150);
  });

  canvas.addEventListener('mousemove', e => {
    const r  = canvas.getBoundingClientRect();
    mouse.x  = e.clientX - r.left;
    mouse.y  = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = mouse.y = null; });

  // Touch support
  canvas.addEventListener('touchmove', e => {
    const r  = canvas.getBoundingClientRect();
    mouse.x  = e.touches[0].clientX - r.left;
    mouse.y  = e.touches[0].clientY - r.top;
  }, { passive: true });
  canvas.addEventListener('touchend', () => { mouse.x = mouse.y = null; });

  resize();
  loop();
})();


/* ── 2. TYPING ANIMATION ───────────────────────────── */
(function initTyping() {
  const el = document.getElementById('heroSubtitle');
  if (!el) return;

  const phrases = [
    'Software Engineer.',
    'AI Enthusiast.',
    'Full-Stack Developer.',
    'DevOps Explorer.',
  ];

  const textNode = document.createTextNode('');
  const cursor   = document.createElement('span');
  cursor.className = 'cursor';
  el.appendChild(textNode);
  el.appendChild(cursor);

  let idx      = 0;
  let charIdx  = 0;
  let deleting = false;
  let timer;

  function tick() {
    const phrase = phrases[idx];

    if (!deleting) {
      charIdx++;
      textNode.nodeValue = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        timer = setTimeout(tick, 2200);
        return;
      }
    } else {
      charIdx--;
      textNode.nodeValue = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        idx = (idx + 1) % phrases.length;
        timer = setTimeout(tick, 450);
        return;
      }
    }

    timer = setTimeout(tick, deleting ? 55 : 95);
  }

  // Start after hero animations settle
  timer = setTimeout(tick, 900);
})();


/* ── 3. NAVBAR SCROLL EFFECT ───────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load in case page is pre-scrolled
})();


/* ── 4. MOBILE NAV TOGGLE ──────────────────────────── */
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  function close() {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on any link click
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close on Escape key
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) close();
  });
})();


/* ── 5. SCROLL REVEAL ──────────────────────────────── */
(function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    // Fallback: make all visible immediately
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  // Containers whose children should reveal with a stagger
  const STAGGER_SELECTOR = '.projects-grid, .social-links, .about-grid';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el     = entry.target;
      const parent = el.parentElement;
      let   delay  = 0;

      if (parent && parent.matches(STAGGER_SELECTOR)) {
        const siblings = [...parent.children].filter(c => c.classList.contains('reveal'));
        delay = siblings.indexOf(el) * 90;
      }

      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  items.forEach(el => observer.observe(el));
})();


/* ── 6. SKILL BAR ANIMATION ────────────────────────── */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-bar__fill');
  if (!fills.length || !('IntersectionObserver' in window)) {
    fills.forEach(f => { f.style.width = f.dataset.width + '%'; });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
      observer.unobserve(bar);
    });
  }, { threshold: 0.5 });

  fills.forEach(f => observer.observe(f));
})();


/* ── 7. SCROLL SPY — HIGHLIGHT ACTIVE NAV LINK ─────── */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__links a[href^="#"]');
  if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    });
  }, { threshold: 0.45 });

  sections.forEach(s => observer.observe(s));
})();
