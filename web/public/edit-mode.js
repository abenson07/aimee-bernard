/* Site editor hooks. Loaded only on a page opened inside the dashboard's Site editor (a request
   carrying a valid preview token); visitors never get this file. It outlines what can be edited,
   lets text be typed into directly, and talks to the dashboard (the parent window) by postMessage.
   Messages are only sent to, and accepted from, the dashboard's own origin.

   [data-edit="<page>:<key>"]  text or a photo written in the page (saved to the page's draft)
   [data-doc="<id>"]           an item from Sanity (award, press card, course tile, logo): opens a window
*/
(() => {
  const me = document.currentScript;
  const ORIGIN = me && me.dataset.origin;
  if (!ORIGIN || window.parent === window) return;
  const send = (msg) => window.parent.postMessage({ source: 'site-editor', ...msg }, ORIGIN);

  const style = document.createElement('style');
  style.textContent = `
    [data-edit], [data-doc] { cursor: pointer; outline: 2px dashed transparent; outline-offset: 4px; transition: outline-color .15s; }
    [data-edit]:hover { outline-color: #3b82f6; }
    [data-doc]:hover { outline-color: #a855f7; }
    [data-edit].se-selected { outline: 2px solid #3b82f6; }
    [data-edit][contenteditable] { outline: 2px solid #3b82f6; cursor: text; background: rgba(59,130,246,.08); }
    [data-edit].se-flash { outline: 3px solid #f59e0b !important; }
    [data-edit-type="image"] { position: relative; }
    [data-edit-type="image"]:hover::after, [data-doc]:hover::after { position: absolute; left: 8px; top: 8px; z-index: 50; color: #fff; font: 600 12px/1 system-ui; padding: 6px 10px; border-radius: 999px; pointer-events: none; white-space: nowrap; }
    [data-edit-type="image"]:hover::after { content: "Change photo"; background: #1d4ed8; }
    [data-doc] { position: relative; }
    [data-doc]:hover::after { content: "Edit " attr(data-doc-label); background: #7e22ce; }
  `;
  document.head.appendChild(style);

  const TAGS = { H1: 'Heading', H2: 'Heading', H3: 'Heading', H4: 'Heading', P: 'Paragraph', A: 'Link text', BUTTON: 'Button text' };
  /** "Programs · Heading": the section it sits in, then what kind of text it is. */
  const labelOf = (el) => {
    const section = el.closest('[aria-label]');
    const kind = el.dataset.editType === 'image' ? 'Photo' : TAGS[el.tagName] || (el.closest('a') ? 'Link text' : 'Text');
    return [section && section !== el ? section.getAttribute('aria-label') : '', kind].filter(Boolean).join(' · ');
  };
  const keyOf = (el) => el.dataset.edit.split(':')[1];
  const textOf = (el) => el.innerText.replace(/\s+\n/g, '\n').trim();

  let selected = null;
  const select = (el) => {
    if (selected && selected !== el) selected.classList.remove('se-selected');
    selected = el;
    if (el) el.classList.add('se-selected');
  };

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
      el.removeAttribute('contenteditable');
      const value = textOf(el);
      if (value && value !== original) send({ type: 'text', key: keyOf(el), value, label: labelOf(el) });
      else { el.textContent = original; send({ type: 'typing', key: keyOf(el), value: original }); }
    };
    el.addEventListener('input', onInput);
    el.addEventListener('blur', finish, { once: true });
    el.addEventListener('keydown', function onKey(k) {
      if (k.key === 'Enter' && !k.shiftKey) { k.preventDefault(); el.blur(); }
      if (k.key === 'Escape') { k.stopPropagation(); el.textContent = original; el.blur(); }
      if (!el.hasAttribute('contenteditable')) el.removeEventListener('keydown', onKey);
    });
  };

  // Links and buttons stay put while editing, so the page never navigates or opens a panel.
  document.addEventListener('click', (e) => {
    const target = e.target.closest ? e.target : e.target.parentElement;
    const el = target.closest('[data-edit]');
    const doc = !el && target.closest('[data-doc]');
    if (target.closest('a, button') || el || doc) { e.preventDefault(); e.stopPropagation(); }
    if (doc) {
      if (doc.dataset.doc) send({ type: 'doc', id: doc.dataset.doc, docType: doc.dataset.docType, label: doc.dataset.docLabel });
      return;
    }
    if (!el) { if (!target.closest('[data-edit][contenteditable]')) { select(null); send({ type: 'deselect' }); } return; }
    if (el.hasAttribute('contenteditable')) return;
    select(el);
    const kind = el.dataset.editType;
    const img = kind === 'image' && el.querySelector('img');
    send({
      type: 'select',
      key: keyOf(el),
      kind,
      label: labelOf(el),
      value: kind === 'image' ? '' : textOf(el),
      src: img ? img.currentSrc || img.src : '',
      extras: (el.dataset.editExtra || '').split(' ').filter(Boolean),
    });
    if (kind !== 'image') startTyping(el);
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.querySelector('[data-edit][contenteditable]')) { select(null); send({ type: 'deselect' }); }
  });

  const find = (key) => document.querySelector(`[data-edit$=":${CSS.escape(key)}"]`);

  window.addEventListener('message', (e) => {
    if (e.origin !== ORIGIN || !e.data || e.data.source !== 'site-editor-parent') return;
    const { type, key } = e.data;
    if (type === 'scroll-to') window.scrollTo(0, Number(e.data.y) || 0);
    const el = key && find(key);
    if (!el) return;
    if (type === 'focus') {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.classList.add('se-flash');
      setTimeout(() => el.classList.remove('se-flash'), 1400);
    }
    // Typed in the editor's side panel: show it on the page straight away.
    if (type === 'set-text' && !el.hasAttribute('contenteditable')) {
      const lines = String(e.data.value).split('\n');
      el.replaceChildren(...lines.flatMap((l, i) => (i ? [document.createElement('br'), l] : [l])));
    }
    if (type === 'set-image') {
      const img = el.querySelector('img');
      if (img) { img.removeAttribute('srcset'); img.src = e.data.src; img.style.objectPosition = e.data.pos; }
    }
  });

  // The editor reloads the page after some changes; it uses this to put the scroll back where it was.
  let t = 0;
  window.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => send({ type: 'scroll', y: window.scrollY }), 150); }, { passive: true });

  send({ type: 'ready' });
})();
