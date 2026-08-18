document.addEventListener('DOMContentLoaded', async () => {
  const summaryRoot = document.getElementById('checkout-summary');
  const form = document.getElementById('checkout-form');
  const errorBox = document.getElementById('checkout-error');
  if (!summaryRoot || !form) return;

  function formatCurrency(paise) {
    const rupees = Math.round(paise) / 100;
    return '₹' + rupees.toLocaleString('en-IN');
  }

  const cart = window.TDFCart.getCart();
  if (cart.length === 0) {
    window.location.href = '/cart';
    return;
  }

  const ids = cart.map((i) => i.frameId).join(',');
  const res = await fetch(`/api/frames?ids=${encodeURIComponent(ids)}`);
  const data = await res.json();
  const frames = data.frames || [];

  const validCart = cart.filter((i) => frames.find((f) => f.id === i.frameId && f.status === 'available'));
  if (validCart.length === 0) {
    summaryRoot.innerHTML = `<p>None of the items in your cart are still available. <a href="/shop">Return to shop</a>.</p>`;
    form.style.display = 'none';
    return;
  }

  const rows = validCart
    .map((item) => {
      const frame = frames.find((f) => f.id === item.frameId);
      return `<div class="cart-summary-row"><span>${frame.title} × ${item.quantity}</span><span>${formatCurrency(frame.price * item.quantity)}</span></div>`;
    })
    .join('');
  const total = validCart.reduce((sum, item) => {
    const frame = frames.find((f) => f.id === item.frameId);
    return sum + frame.price * item.quantity;
  }, 0);

  summaryRoot.innerHTML = `${rows}<div class="cart-summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div>`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    const submitBtn = form.querySelector('button[type=submit]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing order…';

    const fd = new FormData(form);
    const payload = {
      customer: Object.fromEntries(fd.entries()),
      items: validCart.map((i) => ({ frameId: i.frameId, quantity: i.quantity })),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Something went wrong placing your order.');
      window.TDFCart.clear();
      window.location.href = `/order-confirmation?order=${encodeURIComponent(result.orderNumber)}`;
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
  });
});
