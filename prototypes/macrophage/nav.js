/* Notch nav + cell mascot behavior (extracted from shared.js for pages that do not load it). */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* pill nav (humaan.com-style): a solid pill sits under the current page's
     link; a faint pill glides to whichever link is hovered or focused. Both
     are absolutely positioned under the links and moved with transform/width
     so CSS can spring them. The nav is fixed; while the banner is still on
     screen it sits just below it, then settles at 20px from the top. */
  const pillNav = document.getElementById('pillNav');
  if (pillNav) {
    const list = pillNav.querySelector('.pill-nav__list');
    const links = [...pillNav.querySelectorAll('.pill-nav__link')];
    const hoverPill = pillNav.querySelector('.pill-nav__pill--hover');
    const activePill = pillNav.querySelector('.pill-nav__pill--active');
    let active = links.find((l) => l.classList.contains('is-current'));
    let hovered = null;

    const place = (pill, link) => {
      if (!link) { pill.style.opacity = '0'; return; }
      const nr = pillNav.getBoundingClientRect();
      const lr = link.getBoundingClientRect();
      pill.style.setProperty('--x', `${lr.left - nr.left}px`);
      pill.style.setProperty('--w', `${lr.width}px`);
      if (pill === activePill) pill.style.opacity = '1';
    };
    const layout = () => { place(activePill, active); if (hovered) place(hoverPill, hovered); };

    links.forEach((link) => {
      const enter = () => {
        // First hover after leaving: jump the faint pill into place, then fade
        // it in, so it doesn't sweep across from the last link it was on.
        if (!pillNav.classList.contains('is-hovering')) {
          pillNav.classList.add('no-anim');
          place(hoverPill, link);
          hoverPill.getBoundingClientRect();
          pillNav.classList.remove('no-anim');
        } else place(hoverPill, link);
        hovered = link;
        pillNav.classList.add('is-hovering');
      };
      link.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') enter(); });
      link.addEventListener('focus', enter);
      link.addEventListener('blur', () => { hovered = null; pillNav.classList.remove('is-hovering'); });
      // Clicking a real link slides the solid pill over before the page changes.
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#' || link === active || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        links.forEach((l) => l.classList.toggle('is-current', l === link));
        active = link;
        place(activePill, link);
        setTimeout(() => { location.href = href; }, reduce ? 0 : 320);
      });
    });
    pillNav.addEventListener('pointerleave', () => { hovered = null; pillNav.classList.remove('is-hovering'); });
    list.addEventListener('scroll', layout, { passive: true });

    // Park the nav just under the banner until the banner scrolls off.
    const banner = document.querySelector('.site-header .banner');
    const desktop = window.matchMedia('(min-width: 768px)');
    const setTop = () => {
      const b = banner && desktop.matches ? banner.getBoundingClientRect().bottom : 0;
      pillNav.style.setProperty('--pill-top', `${Math.max(20, b + 18)}px`);
    };
    window.addEventListener('scroll', setTop, { passive: true });
    window.addEventListener('resize', () => { setTop(); layout(); });
    desktop.addEventListener('change', () => { setTop(); layout(); });

    pillNav.classList.add('no-anim');
    setTop(); layout();
    // Re-measure once the web fonts land (link widths change), then allow motion.
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      layout();
      requestAnimationFrame(() => pillNav.classList.remove('no-anim'));
    });
  }

  /* nav mascot: the T cell in the header tilts toward the pointer. Pull it
     down (drag) and it stretches like it's on a cord; let go and it springs
     back and says something. Clicking it also says hi. Every 3–5 pokes the
     current guy pops out and a new one from the cast pops in with new facts. */
  const mascot = document.getElementById('navMascot');
  if (mascot) {
    const body = mascot.querySelector('.nav-mascot__body');
    const img = body.querySelector('img');
    const bubble = mascot.querySelector('.nav-mascot__bubble');
    const cast = [
      { file: 't-cell', name: 'T cell', lines: [
        'Hi! I\u2019m a T cell. I patrol for infected cells.',
        'Wheee! T cells mature in the thymus.',
        'Each T cell recognizes one specific antigen.',
        'Careful, I\u2019m on duty!',
        'Some of us become memory cells and stick around for years.',
      ] },
      { file: 'neutrophil', name: 'neutrophil', lines: [
        'Neutrophil here! I\u2019m usually first on the scene.',
        'I\u2019m the most common white blood cell in your body.',
        'I eat bacteria whole. It\u2019s called phagocytosis.',
        'Pus? That\u2019s mostly us. Sorry.',
      ] },
      { file: 'red-blood-cell', name: 'red blood cell', lines: [
        'Hey! Red blood cell, just passing through.',
        'I carry oxygen with a protein called hemoglobin.',
        'No nucleus! It leaves more room for oxygen.',
        'I do a full lap of your body in about a minute.',
      ] },
      { file: 'antibody', name: 'antibody', lines: [
        'Antibody reporting! B cells made me.',
        'I\u2019m Y-shaped. Each tip grabs one exact target.',
        'I tag germs so other cells know what to eat.',
        'Vaccines teach your body to make more of me.',
      ] },
      { file: 'interferon', name: 'interferon', lines: [
        'Interferon! I\u2019m a warning signal between cells.',
        'I tell nearby cells: \u201cVirus around, lock it down!\u201d',
        'I\u2019m part of why you feel achy when sick.',
      ] },
      { file: 'vaccine', name: 'vaccine', lines: [
        'Hi, I\u2019m a vaccine. Think of me as a practice round.',
        'I show your immune system a harmless preview of a germ.',
        'Then your memory cells are ready for the real thing.',
      ] },
      { file: 'rhinovirus', name: 'rhinovirus', lines: [
        'Uh oh. Rhinovirus. I cause most common colds.',
        'There are over 160 kinds of me. Good luck.',
        'I like the cooler air inside your nose.',
      ] },
      { file: 'influenza', name: 'influenza virus', lines: [
        'Influenza here. The flu, that\u2019s me.',
        'I change my coat a little every year.',
        'That\u2019s why there\u2019s a new flu shot each fall.',
      ] },
      { file: 'coronavirus', name: 'coronavirus', lines: [
        'Coronavirus. Named for my crown of spikes.',
        'My spike proteins unlock the doors to your cells.',
        'Some of my cousins just cause ordinary colds.',
      ] },
      { file: 'e-coli', name: 'E. coli', lines: [
        'E. coli! Most of us are harmless gut residents.',
        'I swim by spinning my tail, called a flagellum.',
        'A few strains are trouble. Wash your veggies!',
      ] },
      { file: 'staph', name: 'staph', lines: [
        'Staph! We grow in grape-like clusters.',
        'Lots of people carry us on their skin or in their nose.',
        'Through a cut, we can cause an infection.',
      ] },
    ];
    const src = (c) => `../src/cells/${c.file}.svg`;
    cast.forEach((c) => { new Image().src = src(c); });

    let who = 0, lineIdx = 0, pokes = 0, bubbleTimer = 0, swapping = false;
    const nextSwapAt = () => 3 + Math.floor(Math.random() * 3);
    let swapAt = nextSwapAt();
    // Shuffled order of newcomers so repeat visits don't feel scripted.
    let queue = [];
    const nextGuy = () => {
      if (!queue.length) queue = cast.map((_, i) => i).filter((i) => i !== who).sort(() => Math.random() - 0.5);
      return queue.shift();
    };
    const speak = (text) => {
      bubble.textContent = text;
      bubble.classList.add('is-on');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubble.classList.remove('is-on'), 2600);
    };
    const swap = () => {
      swapping = true;
      bubble.classList.remove('is-on');
      who = nextGuy(); lineIdx = 0; pokes = 0; swapAt = nextSwapAt();
      const arrive = () => {
        img.src = src(cast[who]);
        mascot.setAttribute('aria-label', `Say hi to the ${cast[who].name}`);
        img.classList.remove('is-leaving');
        img.classList.add('is-arriving');
        swapping = false;
        setTimeout(() => img.classList.remove('is-arriving'), reduce ? 0 : 520);
        speak(cast[who].lines[lineIdx++]);
      };
      if (reduce) { arrive(); return; }
      img.classList.add('is-leaving');
      setTimeout(arrive, 280);
    };
    const say = () => {
      if (swapping) return;
      if (++pokes >= swapAt) { swap(); return; }
      const lines = cast[who].lines;
      speak(lines[lineIdx++ % lines.length]);
    };

    // Spring state: pull (px down), tilt (deg).
    let pull = 0, pullV = 0, tilt = 0, tiltV = 0, tiltTarget = 0;
    let dragging = false, startY = 0, pullTarget = 0, raf = 0, justPulled = false;
    const tick = () => {
      const k = 180, d = 12, dt = 1 / 60;
      const target = dragging ? pullTarget : 0;
      pullV += ((target - pull) * k - pullV * d) * dt; pull += pullV * dt;
      tiltV += ((tiltTarget - tilt) * 120 - tiltV * 14) * dt; tilt += tiltV * dt;
      const stretch = 1 + Math.max(0, pull) / 160;
      body.style.transform = `translateY(${pull * 0.6}px) rotate(${tilt}deg) scale(${1 / Math.sqrt(stretch)}, ${stretch})`;
      const settled = !dragging && Math.abs(pull) < 0.1 && Math.abs(pullV) < 0.1 && Math.abs(tilt - tiltTarget) < 0.05 && Math.abs(tiltV) < 0.05;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf && !reduce) raf = requestAnimationFrame(tick); };

    if (!reduce) {
      window.addEventListener('pointermove', (e) => {
        if (dragging || e.pointerType !== 'mouse') return;
        const r = mascot.getBoundingClientRect();
        if (r.bottom < 0) return;
        const dx = e.clientX - (r.left + r.width / 2);
        tiltTarget = Math.max(-18, Math.min(18, dx / 30));
        kick();
      }, { passive: true });
    }
    mascot.addEventListener('pointerdown', (e) => {
      dragging = true; startY = e.clientY; pullTarget = 0;
      mascot.setPointerCapture(e.pointerId);
      kick();
    });
    mascot.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      // Rubber-band: easy at first, stiffer the further you pull.
      pullTarget = dy > 0 ? 90 * (1 - Math.exp(-dy / 90)) : dy * 0.15;
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      justPulled = pullTarget > 24;
      if (justPulled) { pullV = -Math.min(900, pullTarget * 14); say(); }
      pullTarget = 0;
      kick();
    };
    mascot.addEventListener('pointerup', release);
    mascot.addEventListener('pointercancel', release);
    mascot.addEventListener('click', (e) => {
      // Keyboard activation or a plain tap (no real pull) also says hi.
      if (justPulled) { justPulled = false; return; }
      if (e.detail === 0 || Math.abs(pull) < 6) { say(); if (!reduce) { pullV = 260; kick(); } }
    });
  }
})();
