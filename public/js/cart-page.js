document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('cart-root');
  if (!root) return;

  const cart = window.TDFCart.getCart();
  if (cart.length === 0) {
    root.innerHTML = `<div class="empty-state"><h2>Your cart is empty</h2><p>Browse the gallery to find a piece worth framing.</p><a href="/shop" class="btn">Go to Shop</a></div>`;
    return;
  }

  const ids = cart.map((i) => i.frameId).join(',');
  let frames = [];
  try {
    const res = await fetch(`/api/frames?ids=${encodeURIComponent(ids)}`);
    const data = await res.json();
    frames = data.frames || [];
  } catch {
    root.innerHTML = `<div class="empty-state"><p>Could not load your cart. Please try again.</p></div>`;
    return;
  }

  function render() {
    const currentCart = window.TDFCart.getCart();
    const rows = currentCart
      .map((item) => {
        const frame = frames.find((f) => f.id === item.frameId);
        if (!frame) return '';
        const lineTotal = frame.price * item.quantity;
        const unavailable = frame.status !== 'available';
        return `
        <tr data-frame-id="${frame.id}">
          <td>
            <div class="cart-item">
              <img src="${frame.image || '/img/placeholder.svg'}" alt="">
              <div>
                <div class="product-card-title">${frame.title}</div>
                <div class="product-card-sub">${frame.phoneModel}${unavailable ? ' · <strong style="color:#9a2a20">no longer available</strong>' : ''}</div>
              </div>
            </div>
          </td>
          <td>${formatCurrency(frame.price)}</td>
          <td>
            <input type="number" min="1" value="${item.quantity}" class="qty-input cart-qty-input" data-frame-id="${frame.id}" ${unavailable ? 'disabled' : ''}>
          </td>
          <td>${formatCurrency(lineTotal)}</td>
          <td><button class="link-btn remove-item-btn" data-frame-id="${frame.id}">Remove</button></td>
        </tr>`;
      })
      .join('');

    const validItems = currentCart.filter((item) => frames.find((f) => f.id === item.frameId && f.status === 'available'));
    const total = validItems.reduce((sum, item) => {
      const frame = frames.find((f) => f.id === item.frameId);
      return sum + (frame ? frame.price * item.quantity : 0);
    }, 0);

    root.innerHTML = `
      <table class="cart-table">
        <thead><tr><th>Piece</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="cart-summary">
        <div class="cart-summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
        <a href="/checkout" class="btn btn--block" style="margin-top:16px;${validItems.length === 0 ? 'pointer-events:none;opacity:.5;' : ''}">Proceed to Checkout</a>
        <a href="/shop" class="link-btn" style="display:block;text-align:center;margin-top:14px;">Continue browsing</a>
      </div>
    `;

    root.querySelectorAll('.cart-qty-input').forEach((input) => {
      input.addEventListener('change', () => {
        const id = Number(input.dataset.frameId);
        const qty = Math.max(1, parseInt(input.value, 10) || 1);
        window.TDFCart.updateQty(id, qty);
        render();
      });
    });
    root.querySelectorAll('.remove-item-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.TDFCart.removeItem(Number(btn.dataset.frameId));
        render();
      });
    });
  }

  function formatCurrency(paise) {
    const rupees = Math.round(paise) / 100;
    return '₹' + rupees.toLocaleString('en-IN');
  }

  render();
});
