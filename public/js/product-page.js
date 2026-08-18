document.addEventListener('DOMContentLoaded', () => {
  // Gallery thumbnail switching
  const mainImg = document.getElementById('gallery-main-img');
  document.querySelectorAll('.gallery-thumbs img').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.gallery-thumbs img').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
      if (mainImg) mainImg.src = thumb.dataset.full;
    });
  });

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
