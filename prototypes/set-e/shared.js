/* Set E (round 3) — shared behavior. No libraries. Modules key off data-* attributes. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* nav: full-screen menu overlay (ported from Cytokine) */
  const menuToggle = document.getElementById('menuToggle');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuToggleLabel = menuToggle?.querySelector('.menu-toggle__label');
  if (menuToggle && menuOverlay) {
    const setOpen = (open) => {
      menuOverlay.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      if (menuToggleLabel) menuToggleLabel.textContent = open ? menuToggleLabel.dataset.close : menuToggleLabel.dataset.open;
    };
    menuToggle.addEventListener('click', () => setOpen(!menuOverlay.classList.contains('is-open')));
    menuOverlay.querySelectorAll('a.menu-link').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  }

  /* reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.fade, [data-reveal]').forEach((el) => io.observe(el));

  /* identity words swap the background photo (Home A / Home B hero) */
  document.querySelectorAll('[data-role-swap]').forEach((root) => {
    const layers = [...root.querySelectorAll('.role-bg')];
    const words = [...root.querySelectorAll('.identity-word')];
    const list = root.querySelector('.identity-words');
    const hasDefault = root.dataset.default !== undefined;
    let cur = 0;
    words.forEach((w) => { const i = new Image(); i.src = w.dataset.bg; });
    const show = (url) => {
      const inc = layers[1 - cur], out = layers[cur];
      inc.style.backgroundImage = `url('${url}')`;
      inc.style.opacity = '1'; out.style.opacity = '0'; cur = 1 - cur;
    };
    const setActive = (w) => words.forEach((x) => x.classList.toggle('is-active', x === w));
    if (hasDefault) { layers[0].style.backgroundImage = `url('${words[0].dataset.bg}')`; layers[0].style.opacity = '1'; setActive(words[0]); }
    words.forEach((w) => {
      w.addEventListener('mouseenter', () => { root.classList.add('role-hover'); show(w.dataset.bg); setActive(w); });
      w.addEventListener('focus', () => { root.classList.add('role-hover'); show(w.dataset.bg); setActive(w); });
    });
    list.addEventListener('mouseleave', () => {
      root.classList.remove('role-hover');
      if (hasDefault) { show(words[0].dataset.bg); setActive(words[0]); }
      else { layers.forEach((l) => { l.style.opacity = '0'; }); setActive(null); }
    });
  });

  /* prefooter: icons drift with the cursor (translate, so it never fights rotate) */
  document.querySelectorAll('.prefooter, .mission-sec').forEach((sec) => {
    if (reduce) return;
    const icons = [...sec.querySelectorAll('[data-mx]')];
    sec.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 768) return;
      const r = sec.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      icons.forEach((el) => { el.style.translate = `${nx * el.dataset.mx}px ${ny * el.dataset.my}px`; });
    });
    sec.addEventListener('mouseleave', () => icons.forEach((el) => { el.style.translate = '0 0'; }));
  });

  /* mission text: split into masked words, reveal on scroll */
  document.querySelectorAll('[data-mission]').forEach((el) => {
    let n = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'mw';
            const i = document.createElement('span'); i.textContent = part; i.style.setProperty('--d', (n++ * 0.045).toFixed(3) + 's');
            w.appendChild(i); frag.appendChild(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && !c.classList.contains('m-el')) walk(c);
      });
    };
    walk(el);
    io.observe(el);
  });

  /* persona stack: earlier cards scale back and fade as the next slides over */
  document.querySelectorAll('[data-stack]').forEach((list) => {
    const cards = [...list.querySelectorAll('.stack__card')];
    if (reduce || cards.length < 2) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const on = window.innerWidth >= 768, vh = window.innerHeight;
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        if (!next) return;
        if (!on) { c.style.transform = ''; c.style.opacity = ''; return; }
        const p = Math.min(1, Math.max(0, (vh - next.getBoundingClientRect().top) / (vh - 96)));
        c.style.transformOrigin = '50% 0';
        c.style.transform = `scale(${(1 - 0.08 * p).toFixed(4)}) translateY(${(-24 * p).toFixed(1)}px)`;
        c.style.opacity = (1 - p).toFixed(3);
      });
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
  });

  /* TEDx: a full-bleed photo scrubs down into the framed image while scrolling (plain JS) */
  document.querySelectorAll('[data-tedx]').forEach((sec) => {
    const track = sec.querySelector('.tedx__track'), stage = sec.querySelector('.tedx__stage');
    const frame = sec.querySelector('.tedx__frame'), cover = sec.querySelector('.tedx__cover');
    const head = sec.querySelector('.tedx__head');
    if (!track || !stage || !frame || !cover) return;
    if (reduce || window.innerWidth < 768) return;
    sec.classList.add('is-live');
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    let target = 0, cur = 0, raf = 0, box = null;
    const measure = () => {
      const s = stage.getBoundingClientRect(), f = frame.getBoundingClientRect();
      box = { x: f.left - s.left, y: f.top - s.top, w: f.width, h: f.height, sw: s.width, sh: s.height };
    };
    const progress = () => {
      const r = track.getBoundingClientRect();
      return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
    };
    const paint = () => {
      if (!box) measure();
      const e = ease(Math.min(1, cur / 0.7));
      cover.style.left = (box.x * e) + 'px';
      cover.style.top = (box.y * e) + 'px';
      cover.style.width = (box.sw + (box.w - box.sw) * e) + 'px';
      cover.style.height = (box.sh + (box.h - box.sh) * e) + 'px';
      cover.style.borderRadius = (16 * e) + 'px';
      const h = Math.min(1, Math.max(0, (cur - 0.5) / 0.3));
      head.style.opacity = h; head.style.transform = `translateY(${(1 - h) * 24}px)`;
    };
    const tick = () => {
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      paint();
      raf = cur !== target ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => { target = progress(); if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { box = null; measure(); onScroll(); });
    measure(); onScroll(); cur = target; paint();
  });

  /* video stack: sticky cards; earlier cards scale down + dim as later ones arrive (scroll progress, plain JS) */
  document.querySelectorAll('[data-vstack]').forEach((list) => {
    const cards = [...list.querySelectorAll('.vcard')];
    if (reduce || cards.length < 3) return;
    const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
    let raf = 0;
    const update = () => {
      raf = 0;
      if (window.innerWidth < 768) { cards.forEach((c) => { c.style.transform = ''; c.style.filter = ''; }); return; }
      const r = list.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      const t1 = seg(p, 0.2, 0.3), t2 = seg(p, 0.5, 0.6), t3 = seg(p, 0.7, 0.8);
      cards[0].style.transform = `scale(${1 - 0.3 * t1})`; cards[0].style.filter = `brightness(${1 - 0.5 * t1})`;
      cards[1].style.transform = `scale(${1 - 0.2 * t2})`; cards[1].style.filter = `brightness(${1 - 0.5 * t2})`;
      cards[2].style.transform = `scale(${1 - 0.15 * t3})`;
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
  });

  /* course panels: a sheet rises from the bottom over a dimmed, pushed-back page */
  const panels = [...document.querySelectorAll('.cpanel')];
  if (panels.length) {
    let openEl = null, trigger = null;
    const focusables = (root) => [...root.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')].filter((e) => !e.disabled && e.offsetParent !== null);
    const open = (id, from) => {
      const p = document.getElementById(id); if (!p) return;
      openEl = p; trigger = from;
      p.classList.add('is-open'); p.setAttribute('aria-hidden', 'false');
      document.body.classList.add('panel-open');
      p.querySelector('.cpanel__scroll').scrollTop = 0;
      setTimeout(() => p.querySelector('.cpanel__close').focus({ preventScroll: true }), 60);
    };
    const close = () => {
      if (!openEl) return;
      openEl.classList.remove('is-open'); openEl.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('panel-open');
      if (trigger) trigger.focus({ preventScroll: true });
      openEl = null; trigger = null;
    };
    document.querySelectorAll('[data-panel]').forEach((t) => t.addEventListener('click', (e) => { e.preventDefault(); open(t.dataset.panel, t); }));
    panels.forEach((p) => {
      p.querySelector('.cpanel__close').addEventListener('click', close);
      p.querySelector('.cpanel__scrim').addEventListener('click', close);
    });
    document.addEventListener('keydown', (e) => {
      if (!openEl) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        const f = focusables(openEl); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
})();

/* Stats count-up: every .stat__num counts from 0 to its number in 0.3s when it scrolls into view */
(function () {
  const nums = document.querySelectorAll('.stat__num');
  if (!nums.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DURATION = 300;
  const run = (el) => {
    const m = el.dataset.final.match(/^(\D*)([\d,.]+)(.*)$/);
    if (!m) return;
    const target = parseFloat(m[2].replace(/,/g, ''));
    const decimals = (m[2].split('.')[1] || '').length;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / DURATION);
      const v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = m[1] + (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US').replace(/,/g, m[2].includes(',') ? ',' : '')) + m[3];
      if (p < 1) requestAnimationFrame(tick); else el.textContent = el.dataset.final;
    };
    requestAnimationFrame(tick);
  };
  nums.forEach((el) => { el.dataset.final = el.textContent.trim(); el.style.minWidth = el.offsetWidth + 'px'; });
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); run(e.target); } });
  }, { threshold: 0.6 });
  nums.forEach((el) => { el.textContent = el.dataset.final.replace(/\d/g, '0'); io.observe(el); });
})();

/* Hero scrub (About): the pinned photo card widens from 70% to 100% over the first 30% of the scroll runway, like Set A's mission video */
(function () {
  const master = document.querySelector('[data-hero-scrub]');
  if (!master) return;
  const box = master.querySelector('.page-hero__img');
  const mobile = () => window.matchMedia('(max-width: 767px)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let ticking = false;
  const update = () => {
    ticking = false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = master.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = clamp(-r.top / total, 0, 1);
    const from = mobile() ? 84 : 70;
    box.style.width = (from + clamp(p / 0.3, 0, 1) * (100 - from)) + '%';
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* course timeline: one dot+rule per event, one tick per topic — measured from
   the real content instead of a fixed-interval repeating background, so the
   marks always match the actual number of courses/sessions. Course panels
   start visibility:hidden until opened, so also rebuild right after open. */
(function () {
  const panels = [...document.querySelectorAll('.ctl')];
  if (!panels.length) return;
  const builders = [];
  panels.forEach((panel) => {
    const lines = panel.querySelector('.ctl__lines');
    const events = panel.querySelector('.ctl__events');
    if (!lines || !events) return;
    const build = () => {
      lines.innerHTML = '';
      const top = events.getBoundingClientRect().top;
      events.querySelectorAll('.ctl__event').forEach((ev) => {
        const label = ev.querySelector('.ctl__label');
        if (label) {
          const y = label.getBoundingClientRect().top + label.offsetHeight / 2 - top;
          const dot = document.createElement('span');
          dot.className = 'ctl-dot';
          dot.style.top = y + 'px';
          const rule = document.createElement('span');
          rule.className = 'ctl-rule';
          rule.style.top = y + 'px';
          lines.append(dot, rule);
        }
        ev.querySelectorAll('.ctl__topics p').forEach((p) => {
          const y = p.getBoundingClientRect().top + p.offsetHeight / 2 - top;
          const tick = document.createElement('span');
          tick.className = 'ctl-tick';
          tick.style.top = y + 'px';
          lines.append(tick);
        });
      });
    };
    builders.push(build);
    build();
    document.fonts?.ready.then(build);
  });
  window.addEventListener('resize', () => builders.forEach((b) => b()));
  document.querySelectorAll('.cpanel').forEach((p) => {
    p.addEventListener('transitionend', () => builders.forEach((b) => b()));
  });
  document.querySelectorAll('[data-panel]').forEach((t) => {
    t.addEventListener('click', () => setTimeout(() => builders.forEach((b) => b()), 50));
  });
})();

/* Prefooter height (its top to the page's bottom), so .page-main stops painting its background there */
(() => {
  const main = document.getElementById('pageMain');
  const pre = main && main.querySelector('.prefooter');
  if (!pre) return;
  const size = () => document.documentElement.style.setProperty('--prefooter-h', (main.getBoundingClientRect().bottom - pre.getBoundingClientRect().top) + 'px');
  size();
  addEventListener('resize', size);
  if (window.ResizeObserver) new ResizeObserver(size).observe(main);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
})();

/* Footer reveal: the page's bottom margin matches the footer height; the footer content rises into place as the page scrolls off it */
(() => {
  const footer = document.getElementById('siteFooter');
  const main = document.getElementById('pageMain');
  const inner = footer && footer.querySelector('.site-footer__inner');
  if (!inner || !main || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const size = () => document.documentElement.style.setProperty('--footer-h', footer.offsetHeight + 'px');
  const update = () => {
    const h = footer.offsetHeight;
    const visible = Math.min(h, Math.max(0, innerHeight - main.getBoundingClientRect().bottom));
    inner.style.transform = `translateY(${((h - visible) * 0.35).toFixed(1)}px)`;
  };
  size(); update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => { size(); update(); });
  if (window.ResizeObserver) new ResizeObserver(() => { size(); update(); }).observe(footer);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { size(); update(); });
})();
