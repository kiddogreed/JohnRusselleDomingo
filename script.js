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
  const COUNT_DESKTOP = 75;
  const COUNT_MOBILE  = 28;
  const DIST  = 140;
  const mobile = window.matchMedia('(max-width: 600px)');

  let W, H, particles, raf;
  const mouse = { x: null, y: null };
  let hue = 0; // cycles 0–360 for dark-mode RGB hover effect
  let lastFrame = 0;

  // Always interactive: effect is enabled everywhere on the page
  function isEverywhere() {
    return true;
  }

  // Track mouse globally, but only trigger RGB effect if inside hero
  function updateMouse(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.inMain = isEverywhere();
  }
  function clearMouse() {
    mouse.x = mouse.y = null;
    mouse.inMain = false;
  }

  window.addEventListener('mousemove', updateMouse);
  window.addEventListener('mouseleave', clearMouse);
  window.addEventListener('touchmove', e => {
    if (e.touches && e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.inMain = isEverywhere();
    }
  }, { passive: true });
  window.addEventListener('touchend', clearMouse);

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
    const hovering  = mouse.x !== null && mouse.inMain;
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
    // Lower canvas resolution on mobile for better performance
    const dpr = window.devicePixelRatio || 1;
    const scale = mobile.matches ? 0.7 : 1;
    W = canvas.width  = Math.floor(canvas.offsetWidth * scale * dpr);
    H = canvas.height = Math.floor(canvas.offsetHeight * scale * dpr);
    canvas.style.width  = '';
    canvas.style.height = '';
    const n = mobile.matches ? COUNT_MOBILE : COUNT_DESKTOP;
    particles = Array.from({ length: n }, () => new Particle());
  }

  function drawLines() {
    const { r, g, b, lineA, mouseA } = cur;
    const ri = r|0, gi = g|0, bi = b|0;
    const isDark   = !document.body.classList.contains('light');
    const hovering = mouse.x !== null && mouse.inMain;

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

  function loop(now) {
    // Throttle frame rate on mobile (max ~30fps)
    if (mobile.matches && lastFrame && now - lastFrame < 33) {
      raf = requestAnimationFrame(loop);
      return;
    }
    lastFrame = now || performance.now();
    ctx.clearRect(0, 0, W, H);
    lerpColors();
    // advance RGB hue only in dark mode while mouse is over canvas
    if (!document.body.classList.contains('light') && mouse.x !== null && mouse.inMain) {
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


  // Interactivity everywhere: respond to mouse/touch on the whole page
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
  requestAnimationFrame(loop);
})();


/* ── 2. TYPING ANIMATION ───────────────────────────── */
(function initTyping() {
/* ── SPACE IMPACT GAME ───────────────────────────── */
(function initSpaceImpactGame() {
  const canvas = document.getElementById('spaceImpactCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Game state
  let running = true;
  let score = 0;
  let frame = 0;

  // Level state
  let inBoss = false;
  let boss = null;
  let level = 1;
  let bossDefeated = false;

  // Moving starfield background (parallax)
  const starLayers = [
    { count: 32, speed: 0.7, color: '#fff', size: 1.2, stars: [] },
    { count: 18, speed: 1.5, color: '#64ffda', size: 1.7, stars: [] },
    { count: 8,  speed: 2.5, color: '#ff4e50', size: 2.2, stars: [] }
  ];
  function initStars() {
    starLayers.forEach(layer => {
      layer.stars = Array.from({length: layer.count}, () => ({
        x: Math.random() * W,
        y: Math.random() * H
      }));
    });
  }
  initStars();

  // Helper to scroll to profile/hero section
  function scrollToProfile() {
    const hero = document.getElementById('home') || document.querySelector('.hero');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Player
  const player = {
    x: 40,
    y: H / 2 - 16,
    w: 32,
    h: 24,
    speed: 3.2,
    dy: 0,
    color: '#64ffda',
    bullets: [],
    cooldown: 0
  };

  // Enemies
  const enemies = [];
  function spawnEnemy() {
    if (inBoss) return;
    const size = Math.random() * 18 + 18;
    enemies.push({
      x: W + size,
      y: Math.random() * (H - size),
      w: size,
      h: size * 0.7,
      speed: 1.7 + Math.random() * 1.7 + level * 0.2,
      color: '#ff4e50',
      alive: true
    });
  }

  // Boss
  function spawnBoss() {
    inBoss = true;
    bossDefeated = false;
    boss = {
      x: W - 120,
      y: H / 2 - 48,
      w: 96,
      h: 96,
      color: '#f7b731',
      hp: 60 + 20 * level,
      maxHp: 60 + 20 * level,
      vy: 2.2,
      dir: 1,
      cooldown: 0,
      bullets: [],
      shape: level >= 2 ? 'circle' : 'rect'
    };
  }

  // Controls
  const keys = {};
  canvas.setAttribute('tabindex', '0');
  canvas.focus();
  canvas.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    // Prevent space/arrow keys from scrolling the page when game is running
    if (running && (e.key === ' ' || e.key === 'Spacebar' || e.key.startsWith('Arrow'))) {
      e.preventDefault();
    }
  });
  canvas.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  // Also listen globally for accessibility
  window.addEventListener('keydown', e => {
    if (document.activeElement === canvas) {
      keys[e.key.toLowerCase()] = true;
      if (running && (e.key === ' ' || e.key === 'Spacebar' || e.key.startsWith('Arrow'))) {
        e.preventDefault();
      }
    }
  });
  window.addEventListener('keyup', e => { if (document.activeElement === canvas) keys[e.key.toLowerCase()] = false; });

  function update() {
    // Move background stars
    starLayers.forEach(layer => {
      layer.stars.forEach(star => {
        star.x -= layer.speed;
        if (star.x < 0) {
          star.x = W;
          star.y = Math.random() * H;
        }
      });
    });
    // Player movement
    if (keys['arrowup'] || keys['w']) player.y -= player.speed;
    if (keys['arrowdown'] || keys['s']) player.y += player.speed;
    if (keys['arrowleft'] || keys['a']) player.x -= player.speed;
    if (keys['arrowright'] || keys['d']) player.x += player.speed;
    // Clamp
    player.x = Math.max(0, Math.min(W - player.w, player.x));
    player.y = Math.max(0, Math.min(H - player.h, player.y));

    // Shooting
    if ((keys[' '] || keys['space']) && player.cooldown <= 0) {
      player.bullets.push({ x: player.x + player.w, y: player.y + player.h / 2 - 2, w: 12, h: 4, speed: 6, color: '#fff' });
      player.cooldown = 13;
    }
    if (player.cooldown > 0) player.cooldown--;

    // Update bullets
    player.bullets.forEach(b => b.x += b.speed);
    player.bullets = player.bullets.filter(b => b.x < W + 20);

    // Spawn enemies or boss
    if (!inBoss) {
      if (frame % 55 === 0) spawnEnemy();
      enemies.forEach(e => { e.x -= e.speed; });
      // Remove off-screen
      while (enemies.length && enemies[0].x + enemies[0].w < 0) enemies.shift();
      // Trigger boss after score threshold
      if (score >= 120 * level) {
        enemies.length = 0;
        spawnBoss();
      }
    } else if (boss) {
      // Boss movement
      boss.y += boss.vy * boss.dir;
      if (boss.y < 10 || boss.y + boss.h > H - 10) boss.dir *= -1;
      // Boss shooting
      if (boss.cooldown <= 0) {
        boss.bullets.push({
          x: boss.x,
          y: boss.y + boss.h / 2 - 6,
          w: 18,
          h: 12,
          speed: 2.2 + level * 0.18, // slower projectile
          color: '#f7b731',
        });
        boss.cooldown = 38 - Math.min(level * 2, 18);
      } else {
        boss.cooldown--;
      }
      boss.bullets.forEach(b => b.x -= b.speed);
      boss.bullets = boss.bullets.filter(b => b.x + b.w > 0);
    }

    // Collisions
    if (!inBoss) {
      enemies.forEach(e => {
        if (!e.alive) return;
        // Player collision
        if (rectsCollide(player, e)) {
          running = false;
        }
        // Bullet collision
        player.bullets.forEach(b => {
          if (rectsCollide(b, e) && e.alive) {
            e.alive = false;
            score += 10;
          }
        });
      });
      // Remove dead enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        if (!enemies[i].alive) enemies.splice(i, 1);
      }
    } else if (boss) {
      // Player-boss collision
      if (rectsCollide(player, boss)) running = false;
      // Boss bullet collision with player
      boss.bullets.forEach(b => {
        if (rectsCollide(player, b)) running = false;
      });
      // Player bullet hits boss
      player.bullets.forEach(b => {
        if (rectsCollide(b, boss) && boss.hp > 0) {
          boss.hp -= 2;
          b.x = W + 100; // Remove bullet
        }
      });
      // Boss defeated
      if (boss.hp <= 0 && !bossDefeated) {
        bossDefeated = true;
        setTimeout(() => {
          inBoss = false;
          boss = null;
          level++;
          score += 100;
        }, 1200);
      }
    }
  }

  function rectsCollide(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function drawMilkyWay(ctx, W, H) {
    // Milky Way: a diagonal band of soft white/purple/blue
    ctx.save();
    ctx.globalAlpha = 0.10; // reduced opacity
    const grad = ctx.createLinearGradient(0, H * 0.2, W, H * 0.8);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.2, '#b3aaff');
    grad.addColorStop(0.5, '#a0e9ff');
    grad.addColorStop(0.8, '#e0c3fc');
    grad.addColorStop(1, '#fff');
    ctx.beginPath();
    ctx.ellipse(W/2, H/2, W*0.55, H*0.13, Math.PI/6, 0, Math.PI*2);
    ctx.fillStyle = grad;
    ctx.filter = 'blur(10px)';
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();
  }

  function drawBlackHole(ctx, W, H) {
    // Black hole: top right, swirling effect
    const x = W - 70, y = 70, r = 32;
    ctx.save();
    ctx.globalAlpha = 0.32; // reduced opacity
    // Event horizon
    const grad = ctx.createRadialGradient(x, y, r*0.3, x, y, r);
    grad.addColorStop(0, '#222');
    grad.addColorStop(0.5, '#222');
    grad.addColorStop(0.7, '#6a4cff');
    grad.addColorStop(0.85, '#fff');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = grad;
    ctx.fill();
    // Accretion disk (swirl)
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 7; i++) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Date.now()*0.0003 + i*0.7) % (Math.PI*2));
      ctx.beginPath();
      ctx.ellipse(0, 0, r+10+i*3, 7+i*1.5, 0, 0, Math.PI*2);
      ctx.strokeStyle = i%2===0 ? '#fff' : '#a0e9ff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  function drawAsteroidBelt(ctx, W, H) {
    // Asteroid belt: elliptical ring with small rocks
    ctx.save();
    ctx.globalAlpha = 0.18;
    const cx = 110, cy = H - 60, rx = 170, ry = 38;
    for (let i = 0; i < 38; i++) {
      const angle = (i / 38) * Math.PI * 2 + Math.sin(Date.now()*0.00013 + i);
      const r = rx + Math.sin(Date.now()*0.0007 + i) * 8;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * ry + Math.cos(Date.now()*0.0005 + i) * 2;
      ctx.beginPath();
      ctx.ellipse(x, y, 3 + Math.random()*1.5, 2 + Math.random(), 0, 0, Math.PI*2);
      ctx.fillStyle = '#b8b8b8';
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPlanets(ctx, W, H) {
    // Add several planets at different orbits
    const sunX = 60, sunY = H - 60;
    const planets = [
      { r: 38, color: '#e0c3fc', size: 7 }, // Mercury
      { r: 62, color: '#ffe066', size: 10 }, // Venus
      { r: 120, color: '#3fa7ff', size: 13 }, // Earth (already drawn, skip here)
      { r: 170, color: '#ffb300', size: 15 }, // Mars
      { r: 220, color: '#b3aaff', size: 18 }, // Jupiter
      { r: 270, color: '#a0e9ff', size: 14 }, // Saturn
      { r: 320, color: '#e0c3fc', size: 12 }, // Uranus
      { r: 370, color: '#fff', size: 10 }, // Neptune
    ];
    const t = Date.now() * 0.00013;
    planets.forEach((p, i) => {
      if (p.r === 120) return; // skip Earth (already drawn)
      const angle = t + i * 0.7;
      const x = sunX + Math.cos(angle) * p.r;
      const y = sunY - Math.sin(angle) * p.r * 0.7;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    });
  }

  function drawSolarSystemBackground() {
    // Sun (bottom left)
    const sunX = 60, sunY = H - 60, sunR = 48;
    const grad = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR);
    grad.addColorStop(0, '#fffbe6');
    grad.addColorStop(0.3, '#ffe066');
    grad.addColorStop(0.7, '#ffb300');
    grad.addColorStop(1, 'rgba(255,179,0,0)');
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Earth orbiting sun
    const t = Date.now() * 0.00018;
    const orbitR = 120;
    const earthX = sunX + Math.cos(t) * orbitR;
    const earthY = sunY - Math.sin(t) * orbitR * 0.7;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(earthX, earthY, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#3fa7ff';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    // Continents (simple green blob)
    ctx.beginPath();
    ctx.arc(earthX + 3, earthY - 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#3ec46d';
    ctx.fill();
    ctx.restore();
    // Orbit path
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(sunX, sunY, orbitR, orbitR * 0.7, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Milky Way band
    drawMilkyWay(ctx, W, H);
    // Black hole
    drawBlackHole(ctx, W, H);
    // Asteroid belt
    drawAsteroidBelt(ctx, W, H);
    // Planets
    drawPlanets(ctx, W, H);
    // Solar system background
    drawSolarSystemBackground();
    // Moving starfield background
    starLayers.forEach(layer => {
      ctx.save();
      ctx.globalAlpha = 0.5 + 0.2 * layer.size;
      ctx.fillStyle = layer.color;
      layer.stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, layer.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    });
    // Player
    ctx.save();
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.h / 2);
    ctx.lineTo(player.x + player.w, player.y);
    ctx.lineTo(player.x + player.w, player.y + player.h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Bullets
    player.bullets.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });
    // Enemies
    if (!inBoss) {
      enemies.forEach(e => {
        ctx.save();
        ctx.globalAlpha = e.alive ? 1 : 0.3;
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.restore();
      });
    }
    // Boss
    if (inBoss && boss) {
      ctx.save();
      ctx.shadowColor = '#f7b731';
      ctx.shadowBlur = 18;
      ctx.fillStyle = boss.color;
      if (boss.shape === 'circle') {
        // Draw a glowing circle boss for level 2+
        const cx = boss.x + boss.w / 2;
        const cy = boss.y + boss.h / 2;
        // Aura
        const grad = ctx.createRadialGradient(cx, cy, boss.w * 0.3, cx, cy, boss.w * 0.5);
        grad.addColorStop(0, '#fffbe6');
        grad.addColorStop(0.5, '#f7b731');
        grad.addColorStop(1, 'rgba(255,179,0,0)');
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.arc(cx, cy, boss.w * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
        // Main body
        ctx.beginPath();
        ctx.arc(cx, cy, boss.w * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = boss.color;
        ctx.fill();
      } else {
        // Default rectangle boss for level 1
        ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
      }
      ctx.restore();
      // Boss HP bar
      ctx.fillStyle = '#222';
      ctx.fillRect(boss.x, boss.y - 18, boss.w, 10);
      ctx.fillStyle = '#f7b731';
      ctx.fillRect(boss.x, boss.y - 18, boss.w * (boss.hp / boss.maxHp), 10);
      // Boss bullets
      boss.bullets.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      });
    }
    // Score & Level
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Fira Code, monospace';
    ctx.fillText('Score: ' + score, 12, 26);
    ctx.fillText('Level: ' + level, 12, 48);
    // Game over
    if (!running) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, H/2-40, W, 80);
      ctx.fillStyle = '#ff4e50';
      ctx.font = 'bold 32px Fira Code, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W/2, H/2);
      ctx.font = 'bold 18px Fira Code, monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText('Press R to Restart', W/2, H/2+32);
      ctx.textAlign = 'left';
    }
    // Boss defeated message
    if (bossDefeated && !running) {
      ctx.fillStyle = '#f7b731';
      ctx.font = 'bold 22px Fira Code, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Boss Defeated!', W/2, H/2+60);
      ctx.textAlign = 'left';
    }
  }

  function loop() {
    if (running) {
      update();
      draw();
      frame++;
      requestAnimationFrame(loop);
    } else {
      draw();
      // After a short delay, scroll to profile/hero section
      setTimeout(scrollToProfile, 900);
    }
  }

  // Restart
  function restart() {
    player.x = 40;
    player.y = H / 2 - 16;
    player.bullets = [];
    player.cooldown = 0;
    enemies.length = 0;
    score = 0;
    running = true;
    frame = 0;
    inBoss = false;
    boss = null;
    bossDefeated = false;
    level = 1;
    initStars();
    loop();
  }
  window.addEventListener('keydown', e => {
    if (!running && (e.key === 'r' || e.key === 'R')) {
      restart();
    }
  });

  // Focus canvas on click for keyboard controls
  canvas.addEventListener('click', () => canvas.focus());

  // Start game
  loop();
})();
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
