document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('wall-track');
  if (!track) return;
  const slides = Array.from(track.children);
  const dots = Array.from(document.querySelectorAll('.wall-dot'));
  const prevBtn = document.getElementById('wall-prev');
  const nextBtn = document.getElementById('wall-next');
  let current = 0;

  function setActive(index) {
    current = Math.max(0, Math.min(index, slides.length - 1));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  function goTo(index) {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    track.scrollTo({ left: slides[clamped].offsetLeft, behavior: 'smooth' });
    setActive(clamped);
  }

  dots.forEach((dot) => dot.addEventListener('click', () => goTo(Number(dot.dataset.index))));
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  let scrollTimeout;
  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        let closest = 0;
        let closestDist = Infinity;
        slides.forEach((slide, i) => {
          const dist = Math.abs(slide.offsetLeft - track.scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        setActive(closest);
      }, 100);
    },
    { passive: true }
  );
});
