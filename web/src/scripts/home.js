import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


  gsap.registerPlugin(ScrollTrigger);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  // ---- Reveal on scroll (stats/marquee/awards heading) ----
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  // ---- "By the numbers" pinned panel-swap: the header (label + statement)
  // stays put while the panel underneath cross-fades between the stats,
  // the logo marquee, and the awards grid as the visitor scrolls. Only
  // pins above the mobile stack breakpoint — below it, CSS shows every
  // panel stacked normally and this matchMedia branch never runs. ----
  ScrollTrigger.matchMedia({
    '(min-width: 768px)': function () {
      const panels = gsap.utils.toArray('.stats-pin__panel');
      let activeIndex = 0;

      const trigger = ScrollTrigger.create({
        trigger: '.stats-pin__pin-target',
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * 1.1 * panels.length),
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const idx = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
          if (idx === activeIndex) return;
          activeIndex = idx;
          panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
        },
      });

      return () => trigger.kill();
    },
  });

  // ---- Hero identity-word hover: background swap (from Dendrite) ----
  const heroEl = document.getElementById('hero-section');
  const roleBgLayers = document.querySelectorAll('.hero-role-bg');
  const identityList = document.getElementById('identityWords');
  const identityWords = document.querySelectorAll('.identity-word');

  identityWords.forEach((word) => { const img = new Image(); img.src = word.dataset.bg; });

  let activeLayer = 0;
  function showRoleBg(url) {
    const incoming = roleBgLayers[1 - activeLayer];
    const outgoing = roleBgLayers[activeLayer];
    incoming.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55)), url('${url}')`;
    incoming.style.opacity = '1';
    outgoing.style.opacity = '0';
    activeLayer = 1 - activeLayer;
  }

  // ---- Mascot placeholder: rides directly on the cursor, but only while
  // hovering one of the highlighted persona words — hidden the rest of the
  // time, per the "only appear on something we're highlighting" note. ----
  const mascot = document.getElementById('mascot');
  const mascotInner = document.getElementById('mascotInner');
  const mascotBubble = document.getElementById('mascotBubble');

  function showMascot(text) {
    mascotBubble.textContent = text;
    mascotInner.classList.add('is-visible');
  }
  function hideMascot() { mascotInner.classList.remove('is-visible'); }

  // GSAP quickTo chases the pointer with a short lag instead of teleporting —
  // set/setY animate the OUTER element's translate; the inner element's own
  // transform (centering + is-visible scale) is left alone so the two never
  // fight. No offset: the shape sits right on top of the cursor.
  const setMascotX = reduceMotion ? (v) => gsap.set(mascot, { x: v }) : gsap.quickTo(mascot, 'x', { duration: 0.4, ease: 'power3.out' });
  const setMascotY = reduceMotion ? (v) => gsap.set(mascot, { y: v }) : gsap.quickTo(mascot, 'y', { duration: 0.4, ease: 'power3.out' });

  let followingCursor = false;
  function trackCursor(e) { setMascotX(e.clientX); setMascotY(e.clientY); }

  identityWords.forEach((word) => {
    word.addEventListener('click', (e) => e.preventDefault());
    word.addEventListener('mouseenter', (e) => {
      heroEl.classList.add('role-hover');
      showRoleBg(word.dataset.bg);
      gsap.set(mascot, { x: e.clientX, y: e.clientY });
      showMascot(word.dataset.text);
      followingCursor = true;
      document.addEventListener('mousemove', trackCursor);
    });
  });
  identityList.addEventListener('mouseleave', () => {
    heroEl.classList.remove('role-hover');
    roleBgLayers.forEach((layer) => { layer.style.opacity = '0'; });
    hideMascot();
    if (followingCursor) { document.removeEventListener('mousemove', trackCursor); followingCursor = false; }
  });

  // ---- Mission statement: each row fades in one at a time ----
  (() => {
    const root = document.querySelector('.byq-gem--inline-media-text-01');
    if (!root) return;
    const P = 'byq-gem--inline-media-text-01';
    const narrowMQ = window.matchMedia('(max-width: 700px)');
    const setStagger = () => {
      if (narrowMQ.matches) root.querySelectorAll(`.${P}__seg`).forEach((seg, i) => seg.style.setProperty('--d', i));
      else root.querySelectorAll(`.${P}__row`).forEach((row, i) => row.querySelectorAll(`.${P}__seg`).forEach((seg) => seg.style.setProperty('--d', i)));
    };
    setStagger();
    narrowMQ.addEventListener('change', setStagger);
    const io2 = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { root.classList.add('is-in'); io2.disconnect(); }
    }, { rootMargin: '0px 0px -15% 0px' });
    io2.observe(root);
  })();
