// Ambient "immune ninja" field for the footer. Cartoon germs and
// healthy cells float on the paper background between the prefooter and the
// footer. The cursor leaves a blade trail; a fast swipe slices germs (they
// split, splat and respawn later). Healthy cells can't be cut: the blade just
// nudges them aside. Slicing an antibody tags every germ in view, which pop
// one after another. There's no start button, score screen or lives — the
// canvas never takes pointer events, so scrolling and links work as normal.
// All art is inline SVG, rasterised once to offscreen canvases.
(() => {
  const zone = document.getElementById('cellField');
  if (!zone) return;
  const canvas = zone.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const counterEl = zone.querySelector('[data-cleared]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Art ----------
  const OUT = '#1d1a2e';
  const eyes = (cx, cy, gap, r, mood) => {
    const brow = mood === 'mean'
      ? `<path d="M${cx - gap - r * 1.3} ${cy - r * 2.1} L${cx - gap + r * 1.2} ${cy - r * 1.1}" stroke="${OUT}" stroke-width="${r * 0.8}" stroke-linecap="round"/>
         <path d="M${cx + gap + r * 1.3} ${cy - r * 2.1} L${cx + gap - r * 1.2} ${cy - r * 1.1}" stroke="${OUT}" stroke-width="${r * 0.8}" stroke-linecap="round"/>`
      : '';
    const eye = (x) => `<ellipse cx="${x}" cy="${cy}" rx="${r}" ry="${r * 1.25}" fill="${OUT}"/><circle cx="${x + r * 0.35}" cy="${cy - r * 0.45}" r="${r * 0.38}" fill="#fff"/>`;
    return brow + eye(cx - gap) + eye(cx + gap);
  };
  const grin = (cx, cy, w) => `<path d="M${cx - w} ${cy} Q${cx} ${cy + w * 0.9} ${cx + w} ${cy}" fill="${OUT}" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><path d="M${cx - w * 0.55} ${cy + 2} l${w * 0.28} ${w * 0.3} l${w * 0.28} ${-w * 0.3} M${cx + 2} ${cy + 2} l${w * 0.28} ${w * 0.3} l${w * 0.28} ${-w * 0.3}" fill="#fff"/>`;
  const smile = (cx, cy, w) => `<path d="M${cx - w} ${cy} Q${cx} ${cy + w * 0.8} ${cx + w} ${cy}" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>`;
  const blush = (cx, cy, gap, c) => `<ellipse cx="${cx - gap}" cy="${cy}" rx="9" ry="5" fill="${c}" opacity=".55"/><ellipse cx="${cx + gap}" cy="${cy}" rx="9" ry="5" fill="${c}" opacity=".55"/>`;
  const shine = (cx, cy, r) => `<ellipse cx="${cx - r * 0.38}" cy="${cy - r * 0.45}" rx="${r * 0.28}" ry="${r * 0.16}" transform="rotate(-35 ${cx - r * 0.38} ${cy - r * 0.45})" fill="#fff" opacity=".55"/>`;
  const ring = (n, fn) => Array.from({ length: n }, (_, i) => fn((i / n) * Math.PI * 2, i)).join('');
  const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${body}</svg>`;

  const ART = {
    flu: svg(`
      ${ring(16, (a, i) => {
        const x1 = 100 + Math.cos(a) * 58, y1 = 100 + Math.sin(a) * 58;
        const x2 = 100 + Math.cos(a) * 84, y2 = 100 + Math.sin(a) * 84;
        const cap = i % 2
          ? `<circle cx="${x2}" cy="${y2}" r="8" fill="#ffb347" stroke="${OUT}" stroke-width="4"/>`
          : `<rect x="${x2 - 8}" y="${y2 - 6}" width="16" height="12" rx="3" transform="rotate(${(a * 180) / Math.PI + 90} ${x2} ${y2})" fill="#7ee0c3" stroke="${OUT}" stroke-width="4"/>`;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${OUT}" stroke-width="5"/>${cap}`;
      })}
      <circle cx="100" cy="100" r="62" fill="#9a7cf0" stroke="${OUT}" stroke-width="6"/>
      <circle cx="100" cy="100" r="50" fill="#b39cff" opacity=".45"/>
      ${shine(100, 100, 62)}
      ${eyes(100, 94, 20, 8, 'mean')}${grin(100, 122, 20)}`),
    corona: svg(`
      ${ring(14, (a) => {
        const x1 = 100 + Math.cos(a) * 60, y1 = 100 + Math.sin(a) * 60;
        const x2 = 100 + Math.cos(a) * 82, y2 = 100 + Math.sin(a) * 82;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${OUT}" stroke-width="10" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ff9f8f" stroke-width="4" stroke-linecap="round"/>
          <ellipse cx="${x2}" cy="${y2}" rx="13" ry="9" transform="rotate(${(a * 180) / Math.PI + 90} ${x2} ${y2})" fill="#ff6b5e" stroke="${OUT}" stroke-width="4"/>`;
      })}
      <circle cx="100" cy="100" r="64" fill="#ff7a6b" stroke="${OUT}" stroke-width="6"/>
      ${ring(7, (a) => `<circle cx="${100 + Math.cos(a + 0.4) * 40}" cy="${100 + Math.sin(a + 0.4) * 40}" r="6" fill="#e0493c" opacity=".55"/>`)}
      ${shine(100, 100, 64)}
      ${eyes(100, 96, 21, 8, 'mean')}${grin(100, 124, 18)}`),
    rhino: svg(`
      <polygon points="${ring(6, (a) => `${100 + Math.cos(a) * 80},${100 + Math.sin(a) * 80} `)}" fill="#4cc7d6" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>
      <polygon points="${ring(6, (a) => `${100 + Math.cos(a + Math.PI / 6) * 44},${100 + Math.sin(a + Math.PI / 6) * 44} `)}" fill="#7fe0ea" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
      ${ring(6, (a) => `<line x1="${100 + Math.cos(a) * 80}" y1="${100 + Math.sin(a) * 80}" x2="${100 + Math.cos(a + Math.PI / 6) * 44}" y2="${100 + Math.sin(a + Math.PI / 6) * 44}" stroke="${OUT}" stroke-width="4"/><line x1="${100 + Math.cos(a) * 80}" y1="${100 + Math.sin(a) * 80}" x2="${100 + Math.cos(a - Math.PI / 6) * 44}" y2="${100 + Math.sin(a - Math.PI / 6) * 44}" stroke="${OUT}" stroke-width="4"/>`)}
      ${shine(100, 100, 70)}
      ${eyes(100, 96, 18, 7, 'mean')}${grin(100, 118, 15)}`),
    ecoli: svg(`
      <path d="M150 100 C168 80, 176 120, 192 96" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>
      <path d="M146 116 C166 112, 170 146, 190 136" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>
      <path d="M146 84 C160 66, 178 78, 186 58" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>
      <rect x="18" y="62" width="140" height="76" rx="38" fill="#8fd16a" stroke="${OUT}" stroke-width="6"/>
      <rect x="30" y="72" width="116" height="30" rx="15" fill="#b6e79a" opacity=".6"/>
      ${[40, 64, 92, 120].map((x) => `<line x1="${x}" y1="62" x2="${x - 4}" y2="52" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/><line x1="${x + 8}" y1="138" x2="${x + 12}" y2="148" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>`).join('')}
      ${eyes(78, 96, 17, 7, 'mean')}${grin(78, 118, 14)}`),
    staph: svg(`
      ${[[62, 64], [118, 58], [150, 104], [44, 116], [96, 110], [120, 150], [70, 156]].map(([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="30" fill="#f7c948" stroke="${OUT}" stroke-width="6"/>${shine(x, y, 30)}`).join('')}
      ${eyes(96, 106, 14, 6, 'mean')}${grin(96, 124, 11)}`),

    rbc: svg(`
      <ellipse cx="100" cy="104" rx="80" ry="66" fill="#b8323a" stroke="${OUT}" stroke-width="6"/>
      <ellipse cx="100" cy="100" rx="80" ry="66" fill="#e5484d" stroke="${OUT}" stroke-width="6"/>
      <ellipse cx="100" cy="102" rx="44" ry="34" fill="#c93a40"/>
      ${shine(100, 100, 74)}
      ${eyes(100, 98, 18, 7, 'happy')}${smile(100, 114, 12)}${blush(100, 112, 34, '#ffb3b8')}`),
    tcell: svg(`
      ${ring(26, (a) => `<circle cx="${100 + Math.cos(a) * 72}" cy="${100 + Math.sin(a) * 72}" r="9" fill="#6aa8ff" stroke="${OUT}" stroke-width="4"/>`)}
      <circle cx="100" cy="100" r="70" fill="#8ec0ff" stroke="${OUT}" stroke-width="6"/>
      <circle cx="112" cy="90" r="36" fill="#5b8fe0" opacity=".45"/>
      ${ring(4, (a) => {
        const x = 100 + Math.cos(a + 0.8) * 70, y = 100 + Math.sin(a + 0.8) * 70, d = (a + 0.8) * 180 / Math.PI + 90;
        return `<g transform="translate(${x} ${y}) rotate(${d})"><path d="M0 0 V-14 M0 -14 L-7 -24 M0 -14 L7 -24" stroke="${OUT}" stroke-width="4" stroke-linecap="round" fill="none"/></g>`;
      })}
      ${shine(100, 100, 70)}
      ${eyes(100, 98, 20, 8, 'happy')}${smile(100, 118, 14)}${blush(100, 116, 38, '#ffd0e0')}`),
    neutro: svg(`
      <circle cx="100" cy="100" r="78" fill="#f3d9ff" stroke="${OUT}" stroke-width="6"/>
      ${ring(22, (a) => `<circle cx="${100 + Math.cos(a) * (40 + (a * 37) % 26)}" cy="${100 + Math.sin(a) * (40 + (a * 37) % 26)}" r="3" fill="#c79be0"/>`)}
      <path d="M58 82 C52 58, 84 52, 88 72 C92 52, 124 52, 120 76 C140 64, 156 88, 138 102" fill="#a86fd1" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
      ${shine(100, 100, 78)}
      ${eyes(100, 114, 20, 8, 'happy')}${smile(100, 134, 13)}${blush(100, 130, 38, '#ffb3d9')}`),

    antibody: svg(`
      <circle cx="100" cy="100" r="92" fill="#ffe27a" opacity=".35"/>
      <g stroke="${OUT}" stroke-width="6" stroke-linejoin="round">
        <rect x="86" y="96" width="28" height="84" rx="12" fill="#ffd23f"/>
        <rect x="86" y="96" width="28" height="84" rx="12" fill="none"/>
        <rect x="40" y="26" width="26" height="86" rx="12" transform="rotate(-38 53 69)" fill="#ffd23f"/>
        <rect x="134" y="26" width="26" height="86" rx="12" transform="rotate(38 147 69)" fill="#ffd23f"/>
        <rect x="26" y="36" width="16" height="52" rx="8" transform="rotate(-38 34 62)" fill="#fff3b0"/>
        <rect x="158" y="36" width="16" height="52" rx="8" transform="rotate(38 166 62)" fill="#fff3b0"/>
      </g>
      <circle cx="100" cy="98" r="10" fill="#fff3b0" stroke="${OUT}" stroke-width="5"/>`),
  };


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


  // `r` is the hit radius in design px (scaled per zone width).
  const KINDS = {
    flu:      { role: 'bad',   r: 40, juice: '#a88bff' },
    corona:   { role: 'bad',   r: 42, juice: '#ff7a6b' },
    rhino:    { role: 'bad',   r: 36, juice: '#4cc7d6' },
    ecoli:    { role: 'bad',   r: 44, juice: '#8fd16a' },
    staph:    { role: 'bad',   r: 42, juice: '#f7c948' },
    rbc:      { role: 'self',  r: 42, juice: '#e5484d' },
    tcell:    { role: 'self',  r: 42, juice: '#8ec0ff' },
    neutro:   { role: 'self',  r: 44, juice: '#d8a8f5' },
    antibody: { role: 'power', r: 38, juice: '#ffd23f' },
  };
  const BAD = ['flu', 'corona', 'rhino', 'ecoli', 'staph'];
  const SELF = ['rbc', 'tcell', 'neutro'];
  // The hero swipe game (immune-swipe.js) reuses this art and these kinds.
  window.ImmuneArt = { ART, KINDS, BAD, SELF };

  // ---------- Sizing ----------
  let W = 0, H = 0, scale = 1;
  function resize() {
    W = zone.clientWidth; H = zone.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.max(0.78, Math.min(1.15, W / 1300));
  }

  // ---------- Population ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  let cells = [], halves = [], particles = [], splats = [], rings = [];
  let cleared = 0, antibodyTimer = rand(8, 14);
  const target = () => Math.round(Math.max(7, Math.min(16, (W * H) / 90000)));

  // Spread cells out: try a few spots and keep the one farthest from the rest.
  function openSpot(r) {
    let bestSpot = null, bestD = -1;
    for (let i = 0; i < 14; i++) {
      const x = rand(r, W - r), y = rand(r * 1.4, H - r * 1.4);
      const d = cells.reduce((m, c) => Math.min(m, Math.hypot(c.x - x, c.y - y) - c.r), Infinity);
      if (d > bestD) { bestD = d; bestSpot = { x, y }; }
    }
    return bestSpot;
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
    const heading = fromEdge ? (x < 0 ? rand(-0.5, 0.5) : Math.PI + rand(-0.5, 0.5)) : rand(0, Math.PI * 2);
    const speed = (reduceMotion ? 4 : rand(10, 22)) * scale;
    cells.push({
      kind, role: k.role, r, x, y,
      vx: Math.cos(heading) * speed, vy: Math.sin(heading) * speed * 0.5,
      cruise: speed, rot: rand(-0.4, 0.4), spin: k.role === 'self' ? 0 : rand(-0.35, 0.35),
      bob: rand(0, Math.PI * 2), bobAmp: rand(4, 9) * scale, age: 0, fadeIn: fromEdge ? 1 : 0,
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
  // Listen on the window (the canvas itself is pointer-events: none).
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    track(e.clientX, e.clientY);
  }, { passive: true });
  // Touch: slice along the finger while the page scrolls as usual.
  window.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) track(t.clientX, t.clientY); }, { passive: true });
  window.addEventListener('touchend', () => { lastPt = null; }, { passive: true });
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
      if (counterEl) counterEl.textContent = cleared;
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
    // Cells: gentle drift + bob, easing back to cruising speed after a nudge.
    for (let i = cells.length - 1; i >= 0; i--) {
      const c = cells[i];
      c.age += dt;
      c.bob += dt * 1.3;
      c.rot += c.spin * dt;
      c.fadeIn = Math.max(0, c.fadeIn - dt * 1.5);
      c.nudge = Math.max(0, c.nudge - dt);
      const sp = Math.hypot(c.vx, c.vy) || 1;
      const k = Math.min(1, dt * 1.6);
      const want = sp + (c.cruise - sp) * k;
      c.vx *= want / sp; c.vy *= want / sp;
      // Keep them inside the band vertically: bounce off the top/bottom
      // margins and ease back in if a nudge pushed them past.
      const top = c.r * 1.2 + c.bobAmp, bottom = H - c.r * 1.2 - c.bobAmp;
      if ((c.y < top && c.vy < 0) || (c.y > bottom && c.vy > 0)) c.vy = -c.vy;
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
