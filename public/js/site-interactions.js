document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll-reveal: fade + rise elements marked with [data-reveal] into view once.
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  // Magnetic buttons: a subtle nudge toward the cursor on elements marked [data-magnetic].
  const canHoverPrecisely = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduceMotion && canHoverPrecisely) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      let raf = null;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${x * 0.16}px, ${y * 0.28}px)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = '';
      });
    });
  }

  // Mobile nav: hamburger toggle opens the nav as a dropdown panel under the header.
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const navBackdrop = document.getElementById('nav-backdrop');
  if (navToggle && mainNav && navBackdrop) {
    const closeNav = () => {
      mainNav.classList.remove('is-open');
      navBackdrop.classList.remove('is-open');
      navBackdrop.hidden = true;
      navToggle.setAttribute('aria-expanded', 'false');
    };
    const openNav = () => {
      mainNav.classList.add('is-open');
      navBackdrop.hidden = false;
      navBackdrop.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
    };
    navToggle.addEventListener('click', () => {
      if (mainNav.classList.contains('is-open')) closeNav();
      else openNav();
    });
    navBackdrop.addEventListener('click', closeNav);
    mainNav.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', closeNav));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) closeNav();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeNav();
    });
  }
});
