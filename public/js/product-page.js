document.addEventListener('DOMContentLoaded', () => {
  // Gallery: chevron navigation, thumbnail switching, and tap-to-enlarge — all kept in sync
  const mainImg = document.getElementById('gallery-main-img');
  const thumbs = Array.from(document.querySelectorAll('.gallery-thumbs img'));
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const zoomBtn = document.getElementById('gallery-zoom');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  if (mainImg && thumbs.length) {
    let current = Math.max(
      0,
      thumbs.findIndex((t) => t.classList.contains('active'))
    );

    const show = (index) => {
      current = (index + thumbs.length) % thumbs.length;
      thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
      mainImg.src = thumbs[current].dataset.full;
      if (lightboxImg && lightbox && !lightbox.hidden) lightboxImg.src = thumbs[current].dataset.full;
    };

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => show(i));
    });

    if (prevBtn) prevBtn.addEventListener('click', () => show(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => show(current + 1));

    const openLightbox = () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = thumbs[current].dataset.full;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    const closeLightbox = () => {
      if (!lightbox) return;
      lightbox.hidden = true;
      document.body.style.overflow = '';
    };

    mainImg.addEventListener('click', openLightbox);
    if (zoomBtn) zoomBtn.addEventListener('click', openLightbox);
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => show(current - 1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => show(current + 1));
    if (lightbox) {
      // Click on the dark backdrop (not the image or buttons) closes it.
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
      if (thumbs.length > 1) {
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
      }
    });

    // Basic touch-swipe support on the main image for mobile shoppers.
    if (thumbs.length > 1) {
      const galleryMain = mainImg.closest('.gallery-main');
      let touchStartX = null;
      if (galleryMain) {
        galleryMain.addEventListener(
          'touchstart',
          (e) => {
            touchStartX = e.changedTouches[0].clientX;
          },
          { passive: true }
        );
        galleryMain.addEventListener(
          'touchend',
          (e) => {
            if (touchStartX === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
            touchStartX = null;
          },
          { passive: true }
        );
      }
    }
  }

  // Quantity stepper
  const qtyInputEl = document.getElementById('qty-input');
  const qtyDecBtn = document.getElementById('qty-dec');
  const qtyIncBtn = document.getElementById('qty-inc');
  if (qtyInputEl && qtyDecBtn && qtyIncBtn) {
    const min = parseInt(qtyInputEl.min, 10) || 1;
    const max = parseInt(qtyInputEl.max, 10) || Infinity;
    const clamp = (n) => Math.min(max, Math.max(min, n));
    const setQty = (n) => {
      qtyInputEl.value = clamp(n);
      qtyDecBtn.disabled = clamp(n) <= min;
      qtyIncBtn.disabled = clamp(n) >= max;
    };
    setQty(parseInt(qtyInputEl.value, 10) || min);
    qtyDecBtn.addEventListener('click', () => setQty((parseInt(qtyInputEl.value, 10) || min) - 1));
    qtyIncBtn.addEventListener('click', () => setQty((parseInt(qtyInputEl.value, 10) || min) + 1));
    qtyInputEl.addEventListener('change', () => setQty(parseInt(qtyInputEl.value, 10) || min));
  }

  // Add to cart
  const addBtn = document.getElementById('add-to-cart-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const frameId = Number(addBtn.dataset.frameId);
      const qtyInput = document.getElementById('qty-input');
      const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
      window.TDFCart.addItem(frameId, qty);
      addBtn.textContent = 'Added ✓';
      setTimeout(() => {
        addBtn.textContent = addBtn.dataset.originalLabel || 'Add to Cart';
      }, 1600);
    });
  }
});
