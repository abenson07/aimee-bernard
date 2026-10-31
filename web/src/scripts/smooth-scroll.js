/* Smooth (eased) scrolling for mouse and trackpad on desktop, using Lenis (vendored, MIT; see src/vendor).
   Phone-sized and touch windows get no Lenis at all and keep normal native scrolling: a stopped Lenis cancels
   wheel and touch events, which froze scrolling on phones and in Chrome's device preview.
   Exposed as window.__lenis while it runs so scripts that scroll the page (the Work filter dock) can use
   lenis.scrollTo instead of the browser's own smooth scroll. */
import Lenis from '../vendor/lenis.mjs';

(() => {
  if (window.__lenis) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const desktop = matchMedia('(min-width: 768px) and (hover: hover)');

  let lenis = null;
  let frame = 0;
  const raf = (t) => { lenis.raf(t); frame = requestAnimationFrame(raf); };

  const sync = () => {
    if (desktop.matches && !lenis) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, anchors: true });
      window.__lenis = lenis;
      frame = requestAnimationFrame(raf);
    } else if (!desktop.matches && lenis) {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenis = null;
      window.__lenis = undefined;
    }
    // Hold still whenever the page itself is locked (germ game).
    if (lenis) (document.body.classList.contains('menu-open') || document.body.classList.contains('game-open') || document.body.classList.contains('panel-open')) ? lenis.stop() : lenis.start();
  };
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  desktop.addEventListener('change', sync);
  sync();
})();
