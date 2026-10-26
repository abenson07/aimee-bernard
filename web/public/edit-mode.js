/* Site editor hooks. Loaded only on a page opened inside the dashboard's Site editor (a request
   carrying a valid preview token); visitors never get this file. It draws the hover and selection
   boxes, lets text be typed into directly, reports the page's sections for the editor's Navigator,
   and talks to the dashboard (the parent window) by postMessage. Messages are only sent to, and
   accepted from, the dashboard's own origin.

   [data-edit="<page>:<key>"]  text or a photo written in the page (saved to the page's draft)
   [data-doc="<id>"]           an item from Sanity (award, press card, course tile, logo): opens a window
*/
(() => {
  const me = document.currentScript;
  const ORIGIN = me && me.dataset.origin;
  if (!ORIGIN || window.parent === window) return;
  const send = (msg) => window.parent.postMessage({ source: 'site-editor', ...msg }, ORIGIN);

  const BLUE = '#6aa8ff';
  const PURPLE = '#8b5cf6';
  const PICK = '[data-edit], [data-doc]';

  const style = document.createElement('style');
  style.textContent = `
    [data-edit], [data-doc] { cursor: pointer; }
    [data-edit][contenteditable] { cursor: text; outline: none; caret-color: ${BLUE}; }
    #se-layer { position: fixed; inset: 0; pointer-events: none; z-index: 2147483000; }
    #se-layer .se-box { position: absolute; display: none; outline: 1px solid ${BLUE}; outline-offset: -1px; }
    #se-layer .se-box.sel { outline-width: 2px; }
    #se-layer .se-box.doc { outline-color: ${PURPLE}; }
    #se-layer .se-tag { position: absolute; left: 0; top: 0; transform: translateY(-100%); background: ${BLUE}; color: #0b1b33; font: 600 11px/1 -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif; padding: 3px 6px 4px; border-radius: 4px 4px 4px 0; white-space: nowrap; }
    #se-layer .se-box.doc .se-tag { background: ${PURPLE}; color: #fff; }
    #se-layer .se-tag.inside { transform: none; border-radius: 0 0 4px 0; }
    #se-layer .se-box.hover .se-tag { background: transparent; color: ${BLUE}; padding-left: 0; }
    #se-layer .se-box.hover.doc .se-tag { color: ${PURPLE}; }
    #se-layer .se-box.flash { outline: 3px solid #f59e0b; }
  `;
  document.head.appendChild(style);

  const layer = document.createElement('div');
  layer.id = 'se-layer';
  const makeBox = (cls) => {
    const box = document.createElement('div');
    box.className = `se-box ${cls}`;
    const tag = document.createElement('span');
    tag.className = 'se-tag';
    box.appendChild(tag);
    layer.appendChild(box);
    return box;
  };
  const hoverBox = makeBox('hover');
  const selBox = makeBox('sel');
  document.body.appendChild(layer);

  /* ---- What each editable thing is called ---- */
  const TAGS = { H1: 'Heading', H2: 'Heading', H3: 'Heading', H4: 'Heading', P: 'Paragraph' };
  const kindOf = (el) => (el.dataset.doc !== undefined ? 'doc' : el.dataset.editType === 'image' ? 'image' : 'text');
  const nameOf = (el) => {
    const kind = kindOf(el);
    if (kind === 'doc') return el.dataset.docLabel || 'Item';
    if (kind === 'image') return 'Photo';
    if (TAGS[el.tagName]) return TAGS[el.tagName];
    return el.closest('a, button') ? 'Button text' : 'Text';
  };
  /** The outermost labelled section an element sits in: the Navigator's top level. */
  const sectionOf = (el) => {
    let found = null;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      if (n.matches('section[aria-label], [data-se-section]')) found = n;
    }
    return found;
  };
  const sectionName = (s) => (s ? s.getAttribute('aria-label') || s.dataset.seSection : 'Page');
  const keyOf = (el) => (el.dataset.edit || '').split(':')[1] || '';
  const textOf = (el) => el.innerText.replace(/\s+\n/g, '\n').trim();
  const preview = (el) => {
    const kind = kindOf(el);
    if (kind === 'image') return (el.querySelector('img') || {}).alt || '';
    return textOf(el).replace(/\s+/g, ' ').slice(0, 70);
  };

  /* ---- The list of editable things, for the Navigator ---- */
  let items = [];
  const scan = () => {
    // Logo strips repeat each logo to loop; only the first copy is listed.
    const seen = new Set();
    items = [...document.querySelectorAll(PICK)].filter((el) => {
      if (el.closest('#se-layer')) return false;
      const id = el.dataset.edit || `doc:${el.dataset.doc}`;
      if (!el.dataset.edit && !el.dataset.doc) return false;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    const groups = [];
    const bySection = new Map();
    items.forEach((el, ref) => {
      el.dataset.seRef = String(ref);
      const s = sectionOf(el);
      if (!bySection.has(s)) {
        const g = { name: sectionName(s), items: [] };
        bySection.set(s, g);
        groups.push(g);
      }
      bySection.get(s).items.push({ ref, kind: kindOf(el), name: nameOf(el), text: preview(el), key: keyOf(el) });
    });
    send({ type: 'structure', sections: groups });
  };
  let scanTimer = 0;
  let lastCount = -1;
  new MutationObserver(() => {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      // Server islands (awards, press, courses) arrive after the page; rescan when they do.
      const count = document.querySelectorAll(PICK).length;
      if (count !== lastCount) { lastCount = count; scan(); }
    }, 250);
  }).observe(document.body, { childList: true, subtree: true });

  /* ---- Hover and selection boxes ---- */
  let hovered = null;
  let selected = null;
  const place = (box, el) => {
    if (!el || !el.isConnected) { box.style.display = 'none'; return; }
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    box.style.left = `${r.left}px`;
    box.style.top = `${r.top}px`;
    box.style.width = `${r.width}px`;
    box.style.height = `${r.height}px`;
    box.classList.toggle('doc', kindOf(el) === 'doc');
    const tag = box.firstChild;
    tag.textContent = nameOf(el);
    tag.classList.toggle('inside', r.top < 20);
  };
  // Pages here scroll smoothly and animate, so the boxes follow every frame while shown.
  const tick = () => {
    place(selBox, selected);
    place(hoverBox, hovered && hovered !== selected ? hovered : null);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest && e.target.closest(PICK);
    if (el !== hovered) {
      hovered = el;
      send({ type: 'hover', ref: el ? Number(el.dataset.seRef) : null });
    }
  });
  document.addEventListener('mouseleave', () => { hovered = null; send({ type: 'hover', ref: null }); });

  const selectMsg = (el) => ({
    type: 'select',
    ref: Number(el.dataset.seRef),
    key: keyOf(el),
    kind: kindOf(el) === 'image' ? 'image' : 'text',
    name: nameOf(el),
    section: sectionName(sectionOf(el)),
    value: kindOf(el) === 'image' ? '' : textOf(el),
    src: (() => { const img = el.querySelector('img'); return img ? img.currentSrc || img.src : ''; })(),
    alt: (el.querySelector('img') || {}).alt || '',
    extras: (el.dataset.editExtra || '').split(' ').filter(Boolean),
  });
  const docMsg = (el) => ({ type: 'doc', ref: Number(el.dataset.seRef), id: el.dataset.doc, docType: el.dataset.docType, label: el.dataset.docLabel });

  const choose = (el) => {
    selected = el;
    if (!el) { send({ type: 'deselect' }); return; }
    send(kindOf(el) === 'doc' ? docMsg(el) : selectMsg(el));
  };

  /* ---- Typing straight onto the page ---- */
  const startTyping = (el) => {
    const original = textOf(el);
    el.setAttribute('contenteditable', 'plaintext-only');
    el.focus();
    // Start with everything selected, so typing replaces it.
    const range = document.createRange(); range.selectNodeContents(el);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    const onInput = () => send({ type: 'typing', key: keyOf(el), value: textOf(el) });
    const finish = () => {
      el.removeEventListener('input', onInput);
      el.removeEventListener('keydown', onKey);
      el.removeAttribute('contenteditable');
      const value = textOf(el);
      if (value && value !== original) send({ type: 'text', key: keyOf(el), value, label: `${sectionName(sectionOf(el))} · ${nameOf(el)}` });
      else { el.textContent = original; send({ type: 'typing', key: keyOf(el), value: original }); }
    };
    const onKey = (k) => {
      if (k.key === 'Enter' && !k.shiftKey) { k.preventDefault(); el.blur(); }
      if (k.key === 'Escape') { k.stopPropagation(); el.textContent = original; el.blur(); }
    };
    el.addEventListener('input', onInput);
    el.addEventListener('keydown', onKey);
    el.addEventListener('blur', finish, { once: true });
  };

  // Links and buttons stay put while editing, so the page never navigates or opens a panel.
  document.addEventListener('click', (e) => {
    const target = e.target.closest ? e.target : e.target.parentElement;
    const el = target.closest(PICK);
    if (target.closest('a, button') || el) { e.preventDefault(); e.stopPropagation(); }
    if (el && el.hasAttribute('contenteditable')) return;
    choose(el);
    if (el && kindOf(el) === 'text') startTyping(el);
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.querySelector('[data-edit][contenteditable]')) choose(null);
  });

  /* ---- Messages from the editor ---- */
  const byKey = (key) => document.querySelector(`[data-edit$=":${CSS.escape(key)}"]`);
  const byRef = (ref) => items[Number(ref)];

  window.addEventListener('message', (e) => {
    if (e.origin !== ORIGIN || !e.data || e.data.source !== 'site-editor-parent') return;
    const d = e.data;
    if (d.type === 'scroll-to') window.scrollTo(0, Number(d.y) || 0);
    // Picked in the Navigator: show it and select it (text is then edited in the side panel).
    if (d.type === 'select-ref') {
      const el = byRef(d.ref);
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      choose(el);
    }
    if (d.type === 'hover-ref') hovered = d.ref === null ? null : byRef(d.ref) || null;
    if (d.type === 'deselect') selected = null;
    const el = d.key && byKey(d.key);
    if (!el) return;
    if (d.type === 'focus') {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      selBox.classList.add('flash');
      setTimeout(() => selBox.classList.remove('flash'), 1200);
    }
    // Typed in the editor's side panel: show it on the page straight away.
    if (d.type === 'set-text' && !el.hasAttribute('contenteditable')) {
      const lines = String(d.value).split('\n');
      el.replaceChildren(...lines.flatMap((l, i) => (i ? [document.createElement('br'), l] : [l])));
    }
    if (d.type === 'set-image') {
      const img = el.querySelector('img');
      if (img) {
        if (d.src) { img.removeAttribute('srcset'); img.src = d.src; }
        if (d.pos) img.style.objectPosition = d.pos;
        if (typeof d.alt === 'string') img.alt = d.alt;
      }
    }
  });

  // The editor reloads the page after some changes; it uses this to put the scroll back where it was.
  let scrollTimer = 0;
  window.addEventListener('scroll', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(() => send({ type: 'scroll', y: window.scrollY }), 150); }, { passive: true });

  lastCount = document.querySelectorAll(PICK).length;
  scan();
  send({ type: 'ready' });
})();
