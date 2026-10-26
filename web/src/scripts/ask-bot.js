/* "Ask me a Q?" B cell: the button, the panel and the conversation log. The answers come from ask-engine.js
   using the content index at /api/ask-index.json (read the first time the panel opens).
   Testing: the "Demo" switch at the foot of the panel flips between the two versions
   (Search = one question, one answer; Chat = remembers and offers follow-ups). ?bot=search or ?bot=chat also works. */
import { createEngine } from './ask-engine.js';

(() => {
  const btn = document.getElementById('askBtn');
  const panel = document.getElementById('askPanel');
  if (!btn || !panel) return;
  const log = document.getElementById('askLog');
  const chipsEl = document.getElementById('askChips');
  const form = document.getElementById('askForm');
  const input = document.getElementById('askInput');
  const closeBtn = document.getElementById('askClose');
  const demo = document.getElementById('askDemo');

  let index = null;
  let loading = null;
  let engine = null;
  let state = null;
  let mode = 'chat';
  try {
    const q = new URLSearchParams(location.search).get('bot');
    const saved = localStorage.getItem('askMode');
    mode = q === 'search' || q === 'chat' ? q : saved === 'search' || saved === 'chat' ? saved : 'chat';
  } catch (e) { /* storage blocked: stay on chat */ }

  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const scrollDown = () => { log.scrollTop = log.scrollHeight; };

  function loadIndex() {
    if (loading) return loading;
    loading = fetch('/api/ask-index.json')
      .then((r) => { if (!r.ok) throw new Error('index ' + r.status); return r.json(); })
      .then((j) => { index = j; });
    return loading;
  }

  function build() {
    engine = createEngine(index, { mode });
    state = engine.initialState();
  }

  function cardNode(c, withMore) {
    const inner = [];
    const title = el('div', 'ask-card__title', c.title);
    if (c.href) title.append(el('span', 'ask-card__go', '↗'));
    inner.push(title);
    if (c.meta) inner.push(el('div', 'ask-card__meta', c.meta));
    if (c.desc) inner.push(el('div', 'ask-card__desc', c.desc));
    let node;
    if (c.href) {
      node = el('a', 'ask-card');
      node.href = c.href;
      if (/^https?:/.test(c.href)) { node.target = '_blank'; node.rel = 'noopener'; }
    } else node = el('div', 'ask-card');
    inner.forEach((n) => node.append(n));
    if (withMore) {
      const wrap = el('div');
      wrap.append(node);
      return wrap;
    }
    return node;
  }

  function renderReply(reply) {
    reply.blocks.forEach((b) => {
      if (b.t === 'text') {
        log.append(el('div', 'ask-msg ask-msg--bot', b.text));
      } else {
        const wrap = el('div', 'ask-cards');
        b.cards.forEach((c) => {
          const n = cardNode(c, false);
          if (b.link) n.classList.add('ask-card--link');
          wrap.append(n);
          if (mode === 'chat' && !b.link && c.id) {
            const more = el('button', 'ask-card__more', 'More about this');
            more.type = 'button';
            more.addEventListener('click', () => run(engine.act('item:' + c.id, state), 'More about “' + c.title.slice(0, 40) + '”'));
            n.after(more);
          }
        });
        log.append(wrap);
      }
    });
    chipsEl.replaceChildren();
    reply.chips.forEach((c) => {
      let n;
      if (c.href) { n = el('a', 'ask-chip', c.label); n.href = c.href; }
      else {
        n = el('button', 'ask-chip', c.label);
        n.type = 'button';
        n.addEventListener('click', () => (c.say ? ask(c.say, c.label) : run(engine.act(c.act, state), c.label)));
      }
      chipsEl.append(n);
    });
    scrollDown();
  }

  function run(reply, userText) {
    // Search mode behaves like a search page: each search replaces the last, and the question isn't echoed back.
    if (mode === 'search') log.replaceChildren();
    else if (userText) log.append(el('div', 'ask-msg ask-msg--me', userText));
    state = reply.state;
    renderReply(reply);
  }

  function ask(text, shown) {
    if (!engine) return;
    if (mode === 'search') input.value = shown ?? text;
    run(engine.say(text, state), shown ?? text);
  }

  function resetConversation() {
    log.replaceChildren();
    chipsEl.replaceChildren();
    if (!index) return;
    build();
    const g = engine.greet();
    state = g.state;
    renderReply(g);
  }

  function markMode() {
    panel.dataset.mode = mode;
    demo.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    input.placeholder = mode === 'chat' ? 'Ask, or tap a button…' : 'Try “podcasts” or “talks 2024”';
  }

  async function open() {
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('ask-open');
    markMode();
    if (!index) {
      log.replaceChildren(el('div', 'ask-typing', '…'));
      try { await loadIndex(); } catch (err) {
        log.replaceChildren(el('div', 'ask-msg ask-msg--bot', 'I can’t reach my notes right now. You can still look around the Work page, or send Aimee a note.'));
        const c = el('a', 'ask-chip', 'Contact Aimee'); c.href = '/contact'; chipsEl.replaceChildren(c);
        loading = null;
        return;
      }
      resetConversation();
    } else if (!log.children.length) resetConversation();
    input.focus({ preventScroll: true });
  }

  function close() {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('ask-open');
    btn.focus({ preventScroll: true });
  }

  // First pop is quick (0.8s after load); after a hover or a close it waits 2.5s before popping back.
  const slowPop = () => btn.style.setProperty('--ask-delay', '2.5s');
  btn.addEventListener('mouseenter', slowPop);
  btn.addEventListener('focus', slowPop);
  btn.addEventListener('click', slowPop);
  btn.addEventListener('click', () => (panel.hidden ? open() : close()));
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) menuBtn.addEventListener('click', () => { if (!panel.hidden) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('ask-open'); } });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v || !engine) return;
    if (mode !== 'search') input.value = '';
    ask(v);
  });
  demo.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => {
      mode = b.dataset.mode;
      try { localStorage.setItem('askMode', mode); } catch (e) { /* ignore */ }
      markMode();
      resetConversation();
    })
  );
  // Prefetch the index once the page is idle so the first open is instant.
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 2500));
  idle(() => { loadIndex().catch(() => { loading = null; }); });
})();
