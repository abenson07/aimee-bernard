// Ambient "immune ninja" field for the footer. Cartoon germs and
// healthy cells float on the paper background between the prefooter and the
// footer. The cursor leaves a blade trail; a fast swipe slices germs (they
// split, splat and respawn later). Healthy cells can't be cut: the blade just
// nudges them aside. Slicing an antibody tags every germ in view, which pop
// one after another. There's no start button, score screen or lives — the
// canvas never takes pointer events, so scrolling and links work as normal.
// All art is inline SVG, rasterised once to offscreen canvases.
import { ART, KINDS, BAD, SELF } from './immune-art.js';

(() => {
  const zone = document.getElementById('cellField');
  if (!zone) return;
  const canvas = zone.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const counterEls = [...zone.querySelectorAll('[data-cleared]')];
  const scoreEl = zone.querySelector('.cell-field-score');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Art and kinds live in immune-art.js.


  // Rasterise each SVG at the device's pixel density.
  const SPRITE_PX = 200;
  const sprites = {};
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const loadSprites = Promise.all(Object.entries(ART).map(([key, markup]) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = Math.round(SPRITE_PX * dpr);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      sprites[key] = c;
      resolve();
    };
    img.onerror = resolve;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
  })));



  // ---------- Phone game mode ----------
  const phone = window.matchMedia('(max-width: 767px)');
  let playing = false, placeholder = null;

  // ---------- Sizing ----------
  let W = 0, H = 0, scale = 1;
  function resize() {
    W = zone.clientWidth; H = zone.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = playing ? 0.8 : Math.max(0.5, Math.min(1.15, W / 1300)); // bigger germs for thumbs in the full-screen game
  }

  // ---------- Population ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  let cells = [], halves = [], particles = [], splats = [], rings = [];
  let cleared = 0, antibodyTimer = rand(8, 14);
  const target = () => Math.round(Math.max(playing ? 10 : 7, Math.min(16, (W * H) / 90000)));

  // Spread cells out: try a few spots and keep the one farthest from the rest.
  function openSpot(r) {
    let bestSpot = null, bestD = -1;
    for (let i = 0; i < 14; i++) {
      const x = rand(r, W - r), y = rand(r * 1.4, H - r * 1.4);
      const d = cells.reduce((m, c) => Math.min(m, Math.hypot(c.x - x, c.y - y) - c.r), Infinity);
      if (d > bestD) { bestD = d; bestSpot = { x, y }; }
    }
    return bestSpot ?? { x: W / 2, y: H / 2 }; // a field with no size yet (hidden) has no open spot
  }

  function add(kind, fromEdge) {
    const k = KINDS[kind];
    const r = k.r * scale * rand(0.85, 1.1);
    let x, y;
    if (fromEdge) {
      // Drift in from just off the left or right edge.
      const left = Math.random() < 0.5;
      x = left ? -r * 1.5 : W + r * 1.5;
      y = rand(r * 1.4, H - r * 1.4);
    } else ({ x, y } = openSpot(r));
    // Germs hunt across the field (fast, darting, turning every second or two);
    // healthy cells cruise more calmly. Each keeps a left-or-right direction and
    // wanders up to ~60 degrees either side of it.
    const dir = fromEdge ? (x < 0 ? 1 : -1) : (Math.random() < 0.5 ? 1 : -1);
    const heading = (dir > 0 ? 0 : Math.PI) + rand(-0.8, 0.8);
    const base = k.role === 'self' ? rand(36, 60) : rand(90, 150);
    const speed = (reduceMotion ? 4 : base) * scale;
    cells.push({
      kind, role: k.role, r, x, y, dir, heading, turnT: rand(0.4, 1.8), dartT: rand(1.5, 4), dart: 0,
      vx: Math.cos(heading) * speed, vy: Math.sin(heading) * speed,
      cruise: speed, rot: rand(-0.4, 0.4), spin: k.role === 'self' ? 0 : rand(-0.35, 0.35),
      bob: rand(0, Math.PI * 2), bobAmp: rand(1.2, 3) * scale, age: 0, fadeIn: fromEdge ? 1 : 0,
      tagged: 0, nudge: 0,
    });
  }

  function populate() {
    cells = [];
    const n = target();
    for (let i = 0; i < n; i++) add(Math.random() < 0.68 ? pick(BAD) : pick(SELF), false);
  }

  // ---------- Blade ----------
  const blade = [];
  const BLADE_LIFE = 0.14;
  const MIN_SPEED = 500; // px/s before a movement counts as a slash
  let lastPt = null;

  function localPoint(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top, t: performance.now() / 1000, inside: clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom };
  }
  function track(clientX, clientY) {
    const p = localPoint(clientX, clientY);
    if (!p.inside) { lastPt = null; return; }
    if (lastPt) {
      const dt = Math.max(0.001, p.t - lastPt.t);
      const speed = Math.hypot(p.x - lastPt.x, p.y - lastPt.y) / dt;
      blade.push({ ...p, fast: speed > MIN_SPEED });
      if (speed > MIN_SPEED) sliceAlong(lastPt, p);
    }
    lastPt = p;
    wake();
  }
  // Where the cursor is (client coords), so germs can run from it. Touch has no hover, so no fleeing there.
  let cursor = null;
  // Listen on the window (the canvas itself is pointer-events: none).
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    // Phone-width layouts (including a narrow desktop window) are ambient until the full-screen game is open.
    if (phone.matches && !playing) { cursor = null; lastPt = null; return; }
    cursor = { x: e.clientX, y: e.clientY };
    track(e.clientX, e.clientY);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { cursor = null; });
  // Touch: on phones the field is ambient until the full-screen game is open, so scrolling with a thumb never swipes it.
  window.addEventListener('touchmove', (e) => {
    if (phone.matches && !playing) return;
    const t = e.touches[0];
    if (!t) return;
    if (playing) cursor = { x: t.clientX, y: t.clientY }; // germs shy away from the thumb too
    track(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchend', () => { lastPt = null; cursor = null; }, { passive: true });
  // In the game the page must not scroll under the finger.
  zone.addEventListener('touchmove', (e) => { if (playing) e.preventDefault(); }, { passive: false });

  // Scrolling moves the canvas under a still cursor; drop the last point so
  // that doesn't register as a swipe.
  window.addEventListener('scroll', () => { lastPt = null; }, { passive: true });

  function segDist(a, b, cx, cy) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((cx - a.x) * dx + (cy - a.y) * dy) / len2));
    return Math.hypot(a.x + dx * t - cx, a.y + dy * t - cy);
  }

  function sliceAlong(a, b) {
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    for (let i = cells.length - 1; i >= 0; i--) {
      const c = cells[i];
      if (segDist(a, b, c.x, c.y) > c.r * (c.role === 'self' ? 1.15 : 0.9)) continue;
      if (c.role === 'self') {
        // Healthy cells slip out of the way instead of being cut.
        const side = Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) || 1;
        const nx = (-(b.y - a.y) / len) * side, ny = ((b.x - a.x) / len) * side;
        c.vx += nx * 260 * scale; c.vy += ny * 260 * scale;
        c.nudge = 0.5;
        continue;
      }
      cells.splice(i, 1);
      cut(c, ang);
    }
  }

  function cut(c, ang) {
    const k = KINDS[c.kind];
    const rot = displayRot(c);
    const nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2);
    for (const side of [1, -1]) {
      halves.push({
        kind: c.kind, x: c.x, y: c.y, r: c.r, rot, cutAngStart: rot, cutAng: ang, side,
        vx: c.vx + nx * 120 * scale * side, vy: ny * 120 * scale * side - 160 * scale,
        spin: side * rand(1.5, 4), life: 1.4,
      });
    }
    for (let i = 0; i < 16; i++) {
      const a = rand(0, Math.PI * 2), s = rand(90, 380) * scale;
      particles.push({ x: c.x, y: c.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 100, r: rand(2, 6) * scale, color: k.juice, life: rand(0.35, 0.8) });
    }
    splats.push({ x: c.x, y: c.y, r: c.r * rand(1, 1.3), color: k.juice, life: 2.4, max: 2.4, seed: Math.random() * 1000 });

    if (c.role === 'power') {
      rings.push({ x: c.x, y: c.y, r: 10, life: 0.8, max: 0.8, color: k.juice });
      cells.filter((o) => o.role === 'bad').forEach((o, i) => { o.tagged = 0.3 + i * 0.12; });
    } else {
      cleared += 1;
      counterEls.forEach((el) => { el.textContent = cleared; });
      if (scoreEl) { scoreEl.classList.remove('is-pop'); void scoreEl.offsetWidth; scoreEl.classList.add('is-pop'); }
    }
    // A fresh germ drifts in from the side a little later.
    setTimeout(() => { if (cells.length < target()) add(pick(BAD), true); }, rand(1400, 3200));
  }

  // Healthy cells stay upright with a slight sway so their faces read.
  const displayRot = (c) => (c.role === 'self' ? Math.sin(c.bob * 0.7) * 0.1 : c.rot);

  // ---------- Loop ----------
  const GRAV = 1300;
  let visible = true, running = false, idleFor = 0, last = 0;
  function wake() { if (!running && visible) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) wake();
  }).observe(zone);

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    if (visible) requestAnimationFrame(frame);
    else running = false;
  }

  function update(dt) {
    // Cursor in this canvas's coordinates (recomputed each frame so scrolling under a still cursor counts).
    let fleeAt = null;
    if (cursor && !reduceMotion) {
      const r = canvas.getBoundingClientRect();
      const x = cursor.x - r.left, y = cursor.y - r.top;
      if (x > -120 && x < W + 120 && y > -120 && y < H + 120) fleeAt = { x, y };
    }
    // Cells: purposeful movement, easing back to cruising speed after a nudge.
    for (let i = cells.length - 1; i >= 0; i--) {
      const c = cells[i];
      c.age += dt;
      c.bob += dt * 2.6;
      c.rot += c.spin * dt;
      c.fadeIn = Math.max(0, c.fadeIn - dt * 1.5);
      c.nudge = Math.max(0, c.nudge - dt);
      // Pick a new heading every second or two, with the odd sprint.
      c.turnT -= dt;
      if (c.turnT <= 0) {
        c.turnT = rand(0.5, 2);
        c.heading = (c.dir > 0 ? 0 : Math.PI) + rand(-1.05, 1.05);
      }
      c.dartT -= dt;
      if (c.dartT <= 0 && c.role === 'bad') { c.dart = 0.45; c.dartT = rand(2.5, 5); }
      c.dart = Math.max(0, c.dart - dt);
      const speed = c.cruise * (c.dart > 0 ? 1.9 : 1);
      let wx = Math.cos(c.heading) * speed, wy = Math.sin(c.heading) * speed;
      // Germs run from the cursor (but slower than a swipe, so they can still be cut).
      if (fleeAt && c.role === 'bad') {
        const dx = c.x - fleeAt.x, dy = c.y - fleeAt.y, d = Math.hypot(dx, dy) || 1, R = 240 * scale;
        if (d < R) {
          const push = Math.pow(1 - d / R, 1.2) * 280 * scale;
          wx += (dx / d) * push; wy += (dy / d) * push;
        }
      }
      // Steer toward that heading; a nudge from a swipe fades out as the velocity eases back.
      const k = 1 - Math.exp(-dt * (c.dart > 0 ? 7 : 4));
      c.vx += (wx - c.vx) * k; c.vy += (wy - c.vy) * k;
      // Keep them inside the band vertically: turn away from the top/bottom
      // margins and ease back in if a nudge pushed them past.
      const top = c.r * 1.2 + c.bobAmp, bottom = H - c.r * 1.2 - c.bobAmp;
      if ((c.y < top && c.vy < 0) || (c.y > bottom && c.vy > 0)) { c.vy = -c.vy; c.heading = -c.heading; }
      if (c.y < top) c.y += (top - c.y) * Math.min(1, dt * 3);
      if (c.y > bottom) c.y -= (c.y - bottom) * Math.min(1, dt * 3);
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.tagged > 0) {
        c.tagged -= dt;
        if (c.tagged <= 0) { cells.splice(i, 1); cut(c, rand(0, Math.PI)); continue; }
      }
      const m = c.r * 2;
      if (c.x < -m || c.x > W + m || c.y < -m || c.y > H + m) {
        cells.splice(i, 1);
        add(c.role === 'self' ? pick(SELF) : pick(BAD), true);
      }
    }
    // Occasionally float an antibody through.
    antibodyTimer -= dt;
    if (antibodyTimer <= 0) {
      antibodyTimer = rand(14, 24);
      if (!cells.some((c) => c.role === 'power')) add('antibody', true);
    }
    while (cells.filter((c) => c.role !== 'power').length < target()) add(Math.random() < 0.7 ? pick(BAD) : pick(SELF), true);

    for (let i = halves.length - 1; i >= 0; i--) {
      const h = halves[i];
      h.vy += GRAV * scale * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.spin * dt; h.life -= dt;
      if (h.life <= 0 || h.y - h.r > H + 40) halves.splice(i, 1);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += GRAV * 0.6 * scale * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = splats.length - 1; i >= 0; i--) { splats[i].life -= dt; if (splats[i].life <= 0) splats.splice(i, 1); }
    for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.life -= dt; r.r += 700 * scale * dt; if (r.life <= 0) rings.splice(i, 1); }
    const t = performance.now() / 1000;
    while (blade.length && t - blade[0].t > BLADE_LIFE) blade.shift();
  }

  // ---------- Drawing ----------
  function drawSprite(kind, x, y, r, rot, alpha) {
    const img = sprites[kind];
    if (!img) return;
    const size = r * 2.25;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function drawHalf(h) {
    const img = sprites[h.kind];
    if (!img) return;
    const size = h.r * 2.25;
    ctx.save();
    ctx.globalAlpha = Math.min(1, h.life * 1.5);
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rot - h.cutAngStart);
    ctx.save();
    ctx.rotate(h.cutAng);
    ctx.beginPath();
    ctx.rect(-size, h.side > 0 ? 0 : -size, size * 2, size);
    ctx.clip();
    ctx.rotate(-h.cutAng + h.cutAngStart);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
    ctx.rotate(h.cutAng);
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-h.r * 0.95, 0); ctx.lineTo(h.r * 0.95, 0); ctx.stroke();
    ctx.restore();
  }

  function drawSplat(s) {
    ctx.save();
    ctx.globalAlpha = (s.life / s.max) * 0.28;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const ang = (i / n) * Math.PI * 2;
      const rr = s.r * (0.6 + 0.4 * Math.abs(Math.sin(s.seed + i * 1.7)));
      const px = s.x + Math.cos(ang) * rr, py = s.y + Math.sin(ang) * rr;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const ang = s.seed + i * 1.3, d = s.r * (1.1 + (i % 3) * 0.25);
      ctx.beginPath(); ctx.arc(s.x + Math.cos(ang) * d, s.y + Math.sin(ang) * d, s.r * 0.12, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // Tapered ink ribbon (thin at the tail, full at the tip) with a white
  // highlight down the middle — reads on the light paper.
  function drawBlade() {
    const t = performance.now() / 1000;
    const pts = blade.filter((p) => t - p.t < BLADE_LIFE);
    if (pts.length < 3) return;
    const n = pts.length;
    const left = [], right = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const life = 1 - (t - pts[i].t) / BLADE_LIFE;
      const w = 7 * Math.pow(i / (n - 1), 0.8) * Math.max(0.2, life);
      const nx = Math.cos(ang + Math.PI / 2) * w, ny = Math.sin(ang + Math.PI / 2) * w;
      left.push([pts[i].x + nx, pts[i].y + ny]);
      right.push([pts[i].x - nx, pts[i].y - ny]);
    }
    ctx.save();
    ctx.fillStyle = 'rgba(28,27,26,.9)';
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();
    ctx.fill();
    const tip = pts[n - 1];
    ctx.beginPath(); ctx.arc(tip.x, tip.y, Math.hypot(left[n - 1][0] - tip.x, left[n - 1][1] - tip.y), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[Math.floor(n * 0.35)].x, pts[Math.floor(n * 0.35)].y);
    for (let i = Math.floor(n * 0.35) + 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    splats.forEach(drawSplat);
    for (const c of cells) {
      const y = c.y + Math.sin(c.bob) * c.bobAmp;
      if (c.role === 'power') {
        ctx.save();
        ctx.globalAlpha = 0.28 + 0.12 * Math.sin(c.bob * 2);
        ctx.fillStyle = KINDS[c.kind].juice;
        ctx.beginPath(); ctx.arc(c.x, y, c.r * 1.35, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      const pulse = c.tagged > 0 ? 1 + 0.08 * Math.sin(c.age * 40) : 1 + c.nudge * 0.12;
      drawSprite(c.kind, c.x, y, c.r * pulse, displayRot(c), 1 - c.fadeIn);
      if (c.tagged > 0) {
        ctx.save();
        ctx.strokeStyle = '#e0a800'; ctx.lineWidth = 3; ctx.setLineDash([7, 6]);
        ctx.lineDashOffset = -c.age * 50;
        ctx.beginPath(); ctx.arc(c.x, y, c.r * 1.2, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    }
    halves.forEach(drawHalf);
    for (const p of particles) {
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const r of rings) {
      ctx.save();
      ctx.globalAlpha = r.life / r.max;
      ctx.strokeStyle = r.color; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    drawBlade();
  }

  // ---------- Press-and-hold to open the full-screen game (phones) ----------
  const holdBtn = zone.querySelector('.cell-field-hold');
  const menuBtn = document.getElementById('menuBtn');
  const HOLD_MS = 700;

  function setMenuBtn(open) {
    if (!menuBtn) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close game' : 'Menu');
  }
  function enterGame() {
    if (playing) return;
    playing = true;
    // Hold the field's place in the page so nothing jumps while it's fixed to the screen.
    placeholder = document.createElement('div');
    placeholder.style.height = zone.offsetHeight + 'px';
    zone.before(placeholder);
    document.body.classList.add('game-open');
    zone.classList.add('is-playing');
    setMenuBtn(true);
    resize(); populate(); wake();
    if (navigator.vibrate) navigator.vibrate(12);
  }
  function exitGame() {
    if (!playing || zone.classList.contains('is-leaving')) return;
    zone.classList.add('is-leaving');
    setTimeout(() => {
      zone.classList.remove('is-playing', 'is-leaving');
      if (placeholder) placeholder.remove();
      placeholder = null;
      document.body.classList.remove('game-open');
      setMenuBtn(false);
      playing = false;
      lastPt = null; cursor = null;
      resize(); populate();
    }, 300);
  }
  document.addEventListener('game:close', exitGame);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') exitGame(); });
  phone.addEventListener('change', (e) => { if (!e.matches && playing) exitGame(); });

  if (holdBtn) {
    let timer = 0;
    const cancel = () => { clearTimeout(timer); timer = 0; holdBtn.classList.remove('is-holding'); };
    holdBtn.addEventListener('pointerdown', () => {
      cancel();
      holdBtn.classList.add('is-holding');
      timer = setTimeout(() => { cancel(); enterGame(); }, HOLD_MS);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => holdBtn.addEventListener(ev, cancel));
    holdBtn.addEventListener('contextmenu', (e) => e.preventDefault());
    // Keyboard / assistive tech can't hold, so Enter or Space opens it straight away.
    holdBtn.addEventListener('click', (e) => { if (e.detail === 0) enterGame(); });
  }

  loadSprites.then(() => {
    resize();
    populate();
    let lastW = W;
    new ResizeObserver(() => {
      resize();
      if (Math.abs(W - lastW) > 80) { lastW = W; populate(); }
    }).observe(zone);
    wake();
  });
})();
