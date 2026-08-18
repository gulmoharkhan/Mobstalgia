// Core cart storage — a lightweight client-side "shopping cart" backed by localStorage.
// Cart items only store {frameId, quantity}; prices/details are always re-fetched from
// the server so nothing can be tampered with client-side before checkout.
(function () {
  const KEY = 'tdf_cart_v1';

  function getCart() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setCart(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
    updateBadge();
  }

  function addItem(frameId, qty = 1) {
    const cart = getCart();
    const existing = cart.find((i) => i.frameId === frameId);
    if (existing) existing.quantity += qty;
    else cart.push({ frameId, quantity: qty });
    setCart(cart);
  }

  function removeItem(frameId) {
    setCart(getCart().filter((i) => i.frameId !== frameId));
  }

  function updateQty(frameId, qty) {
    const cart = getCart();
    const item = cart.find((i) => i.frameId === frameId);
    if (!item) return;
    if (qty <= 0) return setCart(cart.filter((i) => i.frameId !== frameId));
    item.quantity = qty;
    setCart(cart);
  }

  function clear() {
    localStorage.removeItem(KEY);
    updateBadge();
  }

  function totalCount() {
    return getCart().reduce((sum, i) => sum + i.quantity, 0);
  }

  function updateBadge() {
    const el = document.getElementById('cart-count');
    if (!el) return;
    const count = totalCount();
    el.textContent = String(count);
    el.hidden = count === 0;
  }

  window.TDFCart = { getCart, setCart, addItem, removeItem, updateQty, clear, totalCount, updateBadge };

  document.addEventListener('DOMContentLoaded', updateBadge);
})();
