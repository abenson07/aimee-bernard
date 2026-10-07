

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

  function setCards(kind) {
    const list = cards.filter((card) => kind === 'all' || card.dataset.kind === kind);
    layoutGrid(list);
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
