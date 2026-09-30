/* Cursor buddies: hovering a [data-buddy] element swaps the pointer for a
   little immune-cell character with a speech bubble. It fades in, scales up
   and trails the mouse. Characters are a cell SVG from ../src/cells/ plus an
   overlay of props (book, test tube, mic, ninja gear) drawn on the same
   200x200 grid. Add a new one by adding an entry to CAST and data-buddy="key". */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INK = '#1d1a2e';
  const S = `stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;
  const hand = (x, y, c) => `<circle cx="${x}" cy="${y}" r="10" fill="${c}" ${S}/>`;

  const CAST = {
    educator: {
      cell: 't-cell', skin: '#8ec0ff', say: 'Class is in session! Today: how your immune system works.',
      props: `
        <circle cx="80" cy="98" r="16" fill="#fff" fill-opacity=".35" ${S}/><circle cx="120" cy="98" r="16" fill="#fff" fill-opacity=".35" ${S}/><path d="M96 98 H104" ${S} fill="none"/>
        <g class="bd-bob" transform="translate(150 150) rotate(-14)">
          <rect x="-26" y="-22" width="52" height="44" rx="5" fill="#e5484d" ${S}/>
          <rect x="-20" y="-16" width="40" height="32" rx="2" fill="#fff8e6" stroke="none"/>
          <path d="M-14 -8 H14 M-14 0 H14 M-14 8 H6" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".55"/>
          <path d="M-26 -22 V22" ${S} fill="none"/>
        </g>
        ${hand(128, 152, '#8ec0ff')}`,
    },
    immunologist: {
      cell: 'neutrophil', skin: '#f3d9ff', say: 'Immunologist! I study how the body fights off germs.',
      props: `
        <g class="bd-bob" transform="translate(152 140) rotate(22)">
          <path d="M-11 -34 V26 a11 11 0 0 0 22 0 V-34 Z" fill="#fff" fill-opacity=".55" ${S}/>
          <path d="M-11 -2 H11 V26 a11 11 0 0 1 -22 0 Z" fill="#5fd88a" stroke="none"/>
          <path d="M-11 -34 V26 a11 11 0 0 0 22 0 V-34" fill="none" ${S}/>
          <rect x="-15" y="-42" width="30" height="9" rx="4" fill="#ffd23f" ${S}/>
          <circle class="bd-fizz" cx="-3" cy="10" r="3" fill="#fff"/><circle class="bd-fizz bd-fizz--2" cx="4" cy="16" r="2.4" fill="#fff"/>
        </g>
        ${hand(138, 152, '#f3d9ff')}`,
    },
    communicator: {
      cell: 'red-blood-cell', skin: '#e5484d', say: 'Mic check! Making science make sense for everyone.',
      props: `
        <g class="bd-bob" transform="translate(148 140) rotate(-28)">
          <rect x="-6" y="-12" width="12" height="46" rx="6" fill="#3a3654" ${S}/>
          <circle cx="0" cy="-28" r="17" fill="#d9d9e0" ${S}/>
          <path d="M-16 -28 H16 M0 -45 V-11 M-11 -40 Q0 -28 -11 -16 M11 -40 Q0 -28 11 -16" stroke="${INK}" stroke-width="2.4" fill="none" opacity=".5"/>
        </g>
        <path class="bd-wave" d="M164 92 q8 6 0 12 M172 86 q12 12 0 24" ${S} stroke-width="3.5" fill="none"/>
        ${hand(140, 146, '#e5484d')}`,
    },
    ninja: {
      cell: 't-cell', skin: '#8ec0ff', say: 'Shh. Immuninja at work.',
      props: `
        <defs><clipPath id="bdFace"><circle cx="100" cy="100" r="70"/></clipPath></defs>
        <g clip-path="url(#bdFace)"><rect x="20" y="70" width="160" height="17" fill="#2a2740"/><path d="M20 116 Q100 108 180 116 V180 H20 Z" fill="#2a2740"/></g>
        <path d="M30 70 A70 70 0 0 1 170 70" fill="none" stroke="none"/>
        <rect x="84" y="71" width="32" height="15" rx="3" fill="#c9ced6" ${S} stroke-width="3"/><path d="M100 74 l2 4 4 .5 -3 3 .8 4 -3.8 -2 -3.8 2 .8 -4 -3 -3 4 -.5 Z" fill="${INK}"/>
        <g class="bd-tails"><path d="M166 76 Q186 60 198 68 M166 82 Q188 90 196 104" ${S} stroke="#e5484d" stroke-width="7" fill="none"/></g>
        
        <g class="bd-star" transform="translate(154 152)"><path d="M0 -18 L5 -5 18 0 5 5 0 18 -5 5 -18 0 -5 -5 Z" fill="#c9ced6" ${S} stroke-width="3.5"/><circle r="3.5" fill="${INK}"/></g>`,
    },
    since: {
      cell: 'red-blood-cell', skin: '#e5484d', say: null,
      props: `<path d="M64 84 q16 -10 32 0 M104 84 q16 -10 32 0" ${S} stroke-width="3" fill="none" transform="translate(0 -6)"/>`,
    },
  };

  const style = document.createElement('style');
  style.textContent = `
    .buddy { position: fixed; left: 0; top: 0; z-index: 9999; width: 0; height: 0; pointer-events: none; }
    .buddy__in { position: absolute; left: -28px; top: -28px; width: 56px; height: 56px; opacity: 0; transform: scale(.2) rotate(-14deg); transform-origin: 50% 50%;
      transition: opacity .22s ease, transform .42s cubic-bezier(.3,1.5,.5,1); }
    .buddy.is-on .buddy__in { opacity: 1; transform: none; }
    .buddy__in img, .buddy__in svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
    .buddy__in { animation: bd-float 2.4s ease-in-out infinite; }
    .buddy__bubble { position: absolute; left: 24px; top: -52px; width: max-content; max-width: 210px; padding: 9px 13px; border-radius: 14px 14px 14px 4px; background: #fff; color: ${INK};
      border: 2px solid ${INK}; font: 500 13px/1.35 "IBM Plex Sans", sans-serif; opacity: 0; transform: translateY(6px) scale(.8); transform-origin: 0 100%;
      transition: opacity .22s ease .08s, transform .4s cubic-bezier(.3,1.5,.5,1) .08s; }
    .buddy.is-on .buddy__bubble { opacity: 1; transform: none; }
    .buddy.is-flip .buddy__bubble { left: auto; right: 24px; border-radius: 14px 14px 4px 14px; transform-origin: 100% 100%; }
    .buddy.is-low .buddy__bubble { top: 38px; border-radius: 4px 14px 14px 14px; transform-origin: 0 0; }
    .buddy.is-flip.is-low .buddy__bubble { border-radius: 14px 4px 14px 14px; transform-origin: 100% 0; }
    .buddy__bubble b { font: 600 15px "Instrument Sans", sans-serif; }
    [data-buddy], [data-buddy] * { cursor: none !important; }
    .bd-bob { animation: bd-bob 1.1s ease-in-out infinite; transform-box: fill-box; }
    .bd-wave { animation: bd-wave .9s ease-in-out infinite; }
    .bd-tails { animation: bd-tails .5s ease-in-out infinite alternate; transform-origin: 166px 80px; }
    .bd-star { animation: bd-spin .9s linear infinite; }
    .bd-fizz { animation: bd-fizz 1.2s ease-in infinite; } .bd-fizz--2 { animation-delay: .5s; }
    @keyframes bd-float { 50% { translate: 0 -4px; } }
    @keyframes bd-bob { 50% { translate: 0 -3px; } }
    @keyframes bd-wave { 50% { opacity: .35; } }
    @keyframes bd-tails { to { transform: rotate(8deg); } }
    @keyframes bd-spin { to { transform: translate(154px,152px) rotate(360deg); } }
    @keyframes bd-fizz { 0% { transform: translateY(6px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-14px); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .buddy__in, .buddy__in * { animation: none !important; } }`;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.className = 'buddy'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="buddy__in"></div><div class="buddy__bubble"></div>';
  document.body.appendChild(el);
  const face = el.querySelector('.buddy__in'), bubble = el.querySelector('.buddy__bubble');

  let x = -100, y = -100, tx = -100, ty = -100, raf = 0, active = null, snap = false;
  const loop = () => {
    x += (tx - x) * (snap ? 1 : 0.22); y += (ty - y) * (snap ? 1 : 0.22); snap = false;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    el.classList.toggle('is-flip', x > innerWidth - 270);
    el.classList.toggle('is-low', y < 130);
    raf = active ? requestAnimationFrame(loop) : 0;
  };
  const show = (t, e) => {
    const key = t.dataset.buddy, c = CAST[key];
    if (!c) return;
    active = t; tx = e.clientX; ty = e.clientY;
    if (!el.classList.contains('is-on')) { x = tx; y = ty; }
    face.innerHTML = `<img src="../src/cells/${c.cell}.svg" alt="" draggable="false"><svg viewBox="0 0 200 200">${c.props}</svg>`;
    bubble.innerHTML = 'buddySay' in t.dataset ? t.dataset.buddySay : (c.say || '');
    bubble.style.display = bubble.innerHTML ? '' : 'none';
    el.classList.add('is-on');
    if (!raf) raf = requestAnimationFrame(loop);
  };
  const hide = () => { active = null; el.classList.remove('is-on'); };

  document.addEventListener('pointermove', (e) => {
    const t = e.target.closest && e.target.closest('[data-buddy]');
    if (!t) { if (active) hide(); return; }
    if (t !== active) show(t, e);
    tx = e.clientX; ty = e.clientY;
  }, { passive: true });
  document.addEventListener('pointerleave', hide);
  addEventListener('blur', hide);
})();
