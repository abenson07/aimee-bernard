// Swipe game embedded in the mission sentence. Cartoon cells and pathogens
// sit inline where photos would go; the cursor leaves the same blade trail as the footer. A
// fast swipe over a pathogen explodes it, a swipe over a healthy cell just
// makes it shake. Every few seconds one character shrinks away and a new one
// (cell or pathogen) pops up in its place. Art comes from immune-art.js.
// No start button or score screen, and the canvas never takes pointer
// events, so scrolling and links work as normal.
import { ART, KINDS, BAD, SELF } from './immune-art.js';

(() => {
  const arena = document.getElementById('ninja');
  if (!arena) return;
  const canvas = arena.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const countEl = arena.querySelector('[data-popped]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SWAP_MS = 5000;
  const MIN_SPEED = 500;      // px/s before a movement counts as a swipe
  const BLADE_LIFE = 0.14;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const uri = (kind) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ART[kind]);
  const isBad = (kind) => KINDS[kind].role === 'bad';

  // ---------- Slots: the spans embedded in the mission sentence ----------
  const slots = [...arena.querySelectorAll('.ninja__slot')].map((el) => {
    el.classList.add('is-out');
    el.style.setProperty('--rot', rand(-8, 8).toFixed(1) + 'deg');
    const img = new Image();
    img.alt = '';
    img.draggable = false;
    el.appendChild(img);
    return { el, img, kind: null, busy: true, shakeAt: 0 };
  });

  // Keep a mix: at least two of each, otherwise anything goes. Avoid
  // repeating a character that's already on screen.
  function nextKind(slot) {
    const others = slots.filter((s) => s !== slot && s.kind);
    const bad = others.filter((s) => isBad(s.kind)).length;
    const self = others.length - bad;
    const wantBad = bad < 2 ? true : self < 2 ? false : Math.random() < 0.5;
    const pool = (wantBad ? BAD : SELF).filter((k) => !others.some((s) => s.kind === k));
    return pick(pool.length ? pool : wantBad ? BAD : SELF);
  }

  function pop(slot) {
    slot.kind = nextKind(slot);
    slot.img.src = uri(slot.kind);
    slot.el.classList.remove('is-out', 'is-burst', 'is-shake');
    slot.el.classList.add('is-in');
    setTimeout(() => { slot.el.classList.remove('is-in'); slot.busy = false; }, reduce ? 0 : 520);
  }

  function swap(slot) {
    slot.busy = true;
    slot.el.classList.add('is-out');
    setTimeout(() => pop(slot), reduce ? 0 : 380);
  }

  // ---------- Timer: one character swaps every few seconds ----------
  let visible = false, timer = 0, started = false;
  function tick() {
    const free = slots.filter((s) => !s.busy);
    if (free.length) swap(pick(free));
  }
  function setTimer() {
    clearInterval(timer);
    if (visible && !document.hidden) timer = setInterval(tick, SWAP_MS);
  }
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !started) {
      started = true;
      slots.forEach((s, i) => setTimeout(() => pop(s), reduce ? 0 : 120 + i * 110));
    }
    setTimer();
    if (visible) wake();
  }, { threshold: 0.15 }).observe(arena);
  document.addEventListener('visibilitychange', setTimer);

  // ---------- Canvas: blade trail, burst particles, splats ----------
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  function resize() {
    W = arena.clientWidth; H = arena.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  new ResizeObserver(resize).observe(arena);

  const blade = [];
  let particles = [], splats = [], rings = [];
  let lastPt = null, popped = 0, running = false, last = 0;

  function localPoint(cx, cy) {
    const r = arena.getBoundingClientRect();
    return { x: cx - r.left, y: cy - r.top, t: performance.now() / 1000,
      inside: cx >= r.left - 40 && cx <= r.right + 40 && cy >= r.top - 40 && cy <= r.bottom + 40 };
  }
  function track(cx, cy) {
    const p = localPoint(cx, cy);
    if (!p.inside) { lastPt = null; return; }
    if (lastPt) {
      const dt = Math.max(0.001, p.t - lastPt.t);
      const speed = Math.hypot(p.x - lastPt.x, p.y - lastPt.y) / dt;
      if (!reduce) blade.push(p);
      if (speed > MIN_SPEED) swipe(lastPt, p);
    }
    lastPt = p;
    wake();
  }
  window.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') track(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) track(t.clientX, t.clientY); }, { passive: true });
  window.addEventListener('touchend', () => { lastPt = null; }, { passive: true });
  window.addEventListener('scroll', () => { lastPt = null; }, { passive: true });

  function segDist(a, b, cx, cy) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((cx - a.x) * dx + (cy - a.y) * dy) / len2));
    return Math.hypot(a.x + dx * t - cx, a.y + dy * t - cy);
  }

  function swipe(a, b) {
    const ar = arena.getBoundingClientRect();
    const now = performance.now();
    for (const slot of slots) {
      if (slot.busy || !slot.kind) continue;
      const r = slot.img.getBoundingClientRect();
      const cx = r.left + r.width / 2 - ar.left, cy = r.top + r.height / 2 - ar.top;
      const bad = isBad(slot.kind);
      if (segDist(a, b, cx, cy) > r.width * (bad ? 0.4 : 0.46)) continue;
      if (bad) explode(slot, cx, cy, r.width / 2);
      else if (now - slot.shakeAt > 500) shake(slot, now);
    }
  }

  function shake(slot, now) {
    slot.shakeAt = now;
    slot.el.classList.remove('is-shake');
    void slot.el.offsetWidth;   // restart the animation
    slot.el.classList.add('is-shake');
  }

  function explode(slot, x, y, r) {
    const juice = KINDS[slot.kind].juice;
    slot.busy = true;
    slot.el.classList.add('is-burst');
    for (let i = 0; i < 26; i++) {
      const ang = rand(0, Math.PI * 2), sp = rand(120, 480);
      particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 80, r: rand(2.5, 7), color: juice, life: rand(0.4, 0.9) });
    }
    splats.push({ x, y, r: r * 1.15, color: juice, life: 2.2, max: 2.2, seed: Math.random() * 1000 });
    rings.push({ x, y, r: r * 0.5, life: 0.45, max: 0.45, color: juice });
    popped += 1;
    if (countEl) countEl.textContent = popped;
    // A new character pops up in the empty spot a moment later.
    setTimeout(() => pop(slot), rand(1500, 2600));
    wake();
  }

  // ---------- Loop (only runs while something is animating) ----------
  function wake() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 1100 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = splats.length - 1; i >= 0; i--) { splats[i].life -= dt; if (splats[i].life <= 0) splats.splice(i, 1); }
    for (let i = rings.length - 1; i >= 0; i--) { const g = rings[i]; g.life -= dt; g.r += 420 * dt; if (g.life <= 0) rings.splice(i, 1); }
    const t = performance.now() / 1000;
    while (blade.length && t - blade[0].t > BLADE_LIFE) blade.shift();
    draw();
    if (particles.length || splats.length || rings.length || blade.length) requestAnimationFrame(frame);
    else running = false;
  }

  function drawSplat(s) {
    ctx.save();
    ctx.globalAlpha = (s.life / s.max) * 0.3;
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

  // Tapered ink ribbon, thin at the tail and full at the tip, same as the footer.
  function drawBlade() {
    const t = performance.now() / 1000;
    const pts = blade.filter((p) => t - p.t < BLADE_LIFE);
    if (pts.length < 3) return;
    const n = pts.length, left = [], right = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const life = 1 - (t - pts[i].t) / BLADE_LIFE;
      const w = 7 * Math.pow(i / (n - 1), 0.8) * Math.max(0.2, life);
      left.push([pts[i].x + Math.cos(ang + Math.PI / 2) * w, pts[i].y + Math.sin(ang + Math.PI / 2) * w]);
      right.push([pts[i].x - Math.cos(ang + Math.PI / 2) * w, pts[i].y - Math.sin(ang + Math.PI / 2) * w]);
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
    ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath();
    const from = Math.floor(n * 0.35);
    ctx.moveTo(pts[from].x, pts[from].y);
    for (let i = from + 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    splats.forEach(drawSplat);
    for (const p of particles) {
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const g of rings) {
      ctx.save();
      ctx.globalAlpha = g.life / g.max;
      ctx.strokeStyle = g.color; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    drawBlade();
  }
})();
