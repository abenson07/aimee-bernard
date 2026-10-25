/* Site editor hooks. Loaded only on a page opened inside the dashboard's Site editor (a request
   carrying a valid preview token); visitors never get this file. It marks editable parts, lets
   headings be typed into directly, and talks to the dashboard (the parent window) by postMessage.
   Messages are only sent to, and accepted from, the dashboard's own origin. */
(() => {
  const me = document.currentScript;
  const ORIGIN = me && me.dataset.origin;
  if (!ORIGIN || window.parent === window) return;
  const send = (msg) => window.parent.postMessage({ source: 'site-editor', ...msg }, ORIGIN);

  const style = document.createElement('style');
  style.textContent = `
    [data-edit] { cursor: pointer; transition: outline-color .15s; outline: 2px dashed transparent; outline-offset: 4px; }
    [data-edit]:hover { outline-color: #3b82f6; }
    [data-edit][contenteditable="plaintext-only"], [data-edit][contenteditable="true"] { outline: 2px solid #3b82f6; cursor: text; background: rgba(59,130,246,.08); }
    [data-edit].se-flash { outline: 3px solid #f59e0b !important; }
    [data-edit-type="image"]:hover::after { content: "Change photo"; position: absolute; left: 8px; top: 8px; z-index: 50; background: #1d4ed8; color: #fff; font: 600 13px/1 system-ui; padding: 6px 10px; border-radius: 999px; pointer-events: none; }
    [data-edit-type="image"] { position: relative; }
  `;
  document.head.appendChild(style);

  const editing = () => document.querySelector('[data-edit][contenteditable]');

  const finishText = (el, original) => {
    el.removeAttribute('contenteditable');
    const value = el.innerText.replace(/\s+\n/g, '\n').trim();
    if (value && value !== original) send({ type: 'text', key: el.dataset.edit, value });
    else el.textContent = original;
  };

  // Links stay put while editing, so she cannot wander off the page.
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a');
    const el = e.target.closest && e.target.closest('[data-edit]');
    if (link || el) e.preventDefault();
    if (!el) return;
    if (el.dataset.editType === 'image') {
      send({ type: 'image', key: el.dataset.edit });
      return;
    }
    if (el.hasAttribute('contenteditable')) return;
    const original = el.innerText.trim();
    el.setAttribute('contenteditable', 'plaintext-only');
    el.focus();
    const done = () => finishText(el, original);
    el.addEventListener('blur', done, { once: true });
    el.addEventListener('keydown', (k) => {
      if (k.key === 'Enter' && !k.shiftKey) { k.preventDefault(); el.blur(); }
      if (k.key === 'Escape') { el.removeEventListener('blur', done); el.textContent = original; el.removeAttribute('contenteditable'); }
    });
  }, true);

  window.addEventListener('message', (e) => {
    if (e.origin !== ORIGIN || !e.data || e.data.source !== 'site-editor-parent') return;
    if (e.data.type === 'focus') {
      const el = document.querySelector(`[data-edit="${CSS.escape(e.data.key)}"]`);
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.classList.add('se-flash');
      setTimeout(() => el.classList.remove('se-flash'), 1400);
    }
  });

  send({ type: 'ready', keys: [...document.querySelectorAll('[data-edit]')].map((n) => n.dataset.edit), editing: !!editing() });
})();
