/* Phone menu: the top-right button opens a full-screen sheet with every page. Loaded by SiteHeader. */
(() => {
  const btn = document.getElementById('menuBtn');
  const sheet = document.getElementById('menuSheet');
  if (!btn || !sheet) return;

  const setOpen = (open) => {
    sheet.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    document.body.classList.toggle('menu-open', open);
  };
  btn.addEventListener('click', () => setOpen(sheet.hidden));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sheet.hidden) { setOpen(false); btn.focus(); }
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });

  // Sit just under the banner until it scrolls off, then stick to the top.
  const banner = document.querySelector('.site-header .banner');
  const place = () => {
    const b = banner ? Math.max(0, banner.getBoundingClientRect().bottom) : 0;
    btn.style.setProperty('--menu-top', `${Math.max(12, b + 8)}px`);
  };
  window.addEventListener('scroll', place, { passive: true });
  window.addEventListener('resize', place);
  place();
})();
