

  // ---- Filter: single-select kind tiles. Like floema, the grid fades
  // fully out, swaps which cards are hidden while invisible, then fades
  // back in — instead of cards abruptly popping in/out mid-view. ----
  const tiles = [...document.querySelectorAll('.kind-tile')];
  const cards = [...document.querySelectorAll('.work-card')];
  const countEl = document.getElementById('workCount');
  const workGrid = document.getElementById('workGrid');
  const reduceMotionWork = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FADE_MS = 250;

  // Floema's rule: cycle through fixed block layouts (6, 3, 6, 3 cards) and
  // let the slot decide each card's shape. Layer on a content rule: within a
  // block, the wide slot goes to the card with the most text, the tall slot to
  // a photo card (else the next most text), and the rest fill the squares.
  const LAYOUTS = [
    { name: 'l1', slots: ['s1', 'v', 's2', 's3', 's4', 'h'] },
    { name: 'l2', slots: ['h', 's1', 's2'] },
    { name: 'l3', slots: ['h', 'v', 's1', 's2', 's3', 's4'] },
    { name: 'l4', slots: ['s1', 's2', 'h'] },
  ];
  const textLen = (c) => c.textContent.replace(/\s+/g, ' ').trim().length;

  function fillBlock(block, chunk, slots) {
    const pool = chunk.slice();
    const take = (pred) => { const i = pool.findIndex(pred); return i < 0 ? null : pool.splice(i, 1)[0]; };
    const byLen = () => pool.reduce((best, c) => (!best || textLen(c) > textLen(best) ? c : best), null);
    const assign = {};
    if (slots.includes('h')) { const c = byLen(); pool.splice(pool.indexOf(c), 1); assign.h = c; }
    if (slots.includes('v')) {
      const c = take((x) => x.classList.contains('has-photo')) || (() => { const b = byLen(); pool.splice(pool.indexOf(b), 1); return b; })();
      assign.v = c;
    }
    slots.forEach((slot) => { if (!assign[slot]) assign[slot] = pool.shift(); });
    slots.forEach((slot) => {
      const card = assign[slot];
      card.className = card.className.replace(/\bslot-\S+/g, '').trim() + ' slot-' + slot;
      block.appendChild(card);
    });
  }

  function layoutGrid(list) {
    workGrid.replaceChildren();
    const rest = list.slice();
    let li = 0;
    while (rest.length) {
      let pick = null;
      for (let k = 0; k < LAYOUTS.length; k++) {
        const L = LAYOUTS[(li + k) % LAYOUTS.length];
        if (L.slots.length <= rest.length) { pick = L; li = (li + k + 1) % LAYOUTS.length; break; }
      }
      const block = document.createElement('div');
      if (pick) {
        block.className = 'work-block ' + pick.name;
        fillBlock(block, rest.splice(0, pick.slots.length), pick.slots);
      } else {
        block.className = 'work-block sq';
        rest.splice(0).forEach((c) => { c.className = c.className.replace(/\bslot-\S+/g, '').trim(); block.appendChild(c); });
      }
      workGrid.appendChild(block);
    }
  }

  // A few random cards each hold one cell that floats behind the text, like the
  // cells in the home footer. It drifts slowly and gets pushed by scrolling, as if
  // the card were full of liquid: scroll down and it lags downward, scroll up and
  // it lags upward, then settles back to drifting. Reassigned on every grid layout.
  // Only cells and germs (no vials, antibodies or signal molecules).
  const PALS = ['t-cell', 'neutrophil', 'red-blood-cell', 'coronavirus', 'influenza', 'rhinovirus', 'e-coli', 'staph'];
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  let pals = [];
  let lastArt = '';
  let palRaf = 0, lastT = 0, lastScroll = window.scrollY;

  const palIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { const p = pals.find((q) => q.card === e.target); if (p) p.visible = e.isIntersecting; });
    wakePals();
  }, { rootMargin: '120px 0px' });

  function assignPals(list) {
    pals.forEach((p) => { p.el.remove(); palIO.unobserve(p.card); });
    pals = [];
    let i = Math.floor(rand(1, 5));
    while (i < list.length) {
      const card = list[i];
      const el = document.createElement('img');
      el.className = 'work-pal';
      el.alt = '';
      el.setAttribute('aria-hidden', 'true');
      let art = PALS[Math.floor(Math.random() * PALS.length)];
      if (art === lastArt) art = PALS[(PALS.indexOf(art) + 1) % PALS.length];
      lastArt = art;
      el.src = '/site/cells/' + art + '.svg';
      const size = Math.round(rand(56, 84));
      el.style.setProperty('--s', size + 'px');
      card.appendChild(el);
      const w = Math.max(card.clientWidth - size, 1), h = Math.max(card.clientHeight - size, 1);
      const heading = rand(0, Math.PI * 2), speed = rand(7, 14);
      pals.push({
        el, card, size, visible: false,
        x: rand(0.1, 0.9) * w, y: rand(0.1, 0.9) * h,
        ax: Math.cos(heading) * speed, ay: Math.sin(heading) * speed,   // ambient drift
        vx: 0, vy: 0, rot: rand(-20, 20), vr: rand(-6, 6),
      });
      pals[pals.length - 1].vx = pals[pals.length - 1].ax;
      pals[pals.length - 1].vy = pals[pals.length - 1].ay;
      palIO.observe(card);
      i += Math.floor(rand(7, 12));
    }
    placePals();
  }

  function placePals() {
    pals.forEach((p) => { p.el.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0) rotate(' + p.rot.toFixed(1) + 'deg)'; });
  }

  function palFrame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000) || 0.016;
    lastT = now;
    const dy = clamp(window.scrollY - lastScroll, -90, 90);
    lastScroll = window.scrollY;
    let any = false;
    for (const p of pals) {
      if (!p.visible) continue;
      any = true;
      const w = Math.max(p.card.clientWidth - p.size, 1), h = Math.max(p.card.clientHeight - p.size, 1);
      // Fluid response: the cell trails the scroll, with a little sideways wobble.
      p.vy += dy * 4;
      p.vx += (Math.random() - 0.5) * Math.abs(dy) * 1.2;
      p.vr += dy * 0.15;
      // Ease back to the slow ambient drift.
      const k = Math.min(1, dt * 1.6);
      p.vx += (p.ax - p.vx) * k; p.vy += (p.ay - p.vy) * k; p.vr += (0 - p.vr) * k * 0.5;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      // Soft walls: bounce off the card edges and turn the ambient drift around.
      if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) * 0.6; p.ax = Math.abs(p.ax); }
      if (p.x > w) { p.x = w; p.vx = -Math.abs(p.vx) * 0.6; p.ax = -Math.abs(p.ax); }
      if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) * 0.6; p.ay = Math.abs(p.ay); }
      if (p.y > h) { p.y = h; p.vy = -Math.abs(p.vy) * 0.6; p.ay = -Math.abs(p.ay); }
    }
    placePals();
    palRaf = any ? requestAnimationFrame(palFrame) : 0;
  }

  function wakePals() {
    if (reduceMotionWork || palRaf || !pals.some((p) => p.visible)) return;
    lastT = performance.now(); lastScroll = window.scrollY;
    palRaf = requestAnimationFrame(palFrame);
  }

  function setCards(kind) {
    const list = cards.filter((card) => kind === 'all' || card.dataset.kind === kind);
    layoutGrid(list);
    assignPals(list);
    countEl.textContent = list.length;
  }
  setCards('all');

  function applyFilter(kind) {
    if (reduceMotionWork) { setCards(kind); return; }
    workGrid.classList.add('is-filtering');
    setTimeout(() => {
      setCards(kind);
      // Force a reflow so the browser registers the opacity:0 state before
      // the class comes off, or the fade-back-in never plays.
      void workGrid.offsetHeight;
      workGrid.classList.remove('is-filtering');
    }, FADE_MS);
  }

  tiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      tiles.forEach((t) => {
        const active = t === tile;
        t.classList.toggle('is-active', active);
        const existingCheck = t.querySelector('.tile-check');
        if (active && !existingCheck) {
          const check = document.createElement('span');
          check.className = 'tile-check';
          check.innerHTML = '&#10003;';
          t.prepend(check);
        } else if (!active && existingCheck) {
          existingCheck.remove();
        }
      });
      applyFilter(tile.dataset.filterValue);
    });
  });
