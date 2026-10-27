/* Smooth (eased) scrolling for mouse and trackpad on desktop, using Lenis (vendored, MIT; see src/vendor).
   Touch devices keep their normal native scrolling. Exposed as window.__lenis so scripts that scroll the page
   (the Work filter dock) can use lenis.scrollTo instead of the browser's own smooth scroll. */
import Lenis from '../vendor/lenis.mjs';

(() => {
  if (window.__lenis) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const desktop = matchMedia('(min-width: 768px) and (hover: hover)');

  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, anchors: true });
  window.__lenis = lenis;
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  // Hold still whenever the page itself is locked (phone menu, germ game, course panel) or the window is phone-sized.
  const sync = () => {
    const locked = document.body.classList.contains('menu-open') || document.body.classList.contains('game-open') || document.body.classList.contains('panel-open') || !desktop.matches;
    locked ? lenis.stop() : lenis.start();
  };
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  desktop.addEventListener('change', sync);
  sync();
})();
