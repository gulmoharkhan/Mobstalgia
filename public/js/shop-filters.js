// Mobile filter sheet — progressive enhancement. On wide viewports the
// filter fields already render inline via CSS, so this script only matters
// below the mobile breakpoint (see .filters-toggle / .filters-sheet in
// styles.css). Without JS the fields still submit fine as a plain GET form,
// they just aren't collapsible behind the icon on small screens.
(function () {
  const toggle = document.getElementById('filters-toggle');
  const sheet = document.getElementById('filters-sheet');
  const closeBtn = document.getElementById('filters-close');
  const backdrop = document.getElementById('filters-backdrop');
  if (!toggle || !sheet || !backdrop) return;

  function openSheet() {
    sheet.classList.add('is-open');
    backdrop.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeSheet() {
    sheet.classList.remove('is-open');
    backdrop.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    if (sheet.classList.contains('is-open')) closeSheet();
    else openSheet();
  });
  closeBtn?.addEventListener('click', closeSheet);
  backdrop.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet();
  });
})();
