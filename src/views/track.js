import { escapeHtml, formatCurrency } from '../utils.js';

export function renderTrack({ order, submitted, prefill = {} }) {
  let resultHtml = '';
  if (submitted && !order) {
    resultHtml = `<div class="flash flash--error" style="border-radius:4px;padding:12px 16px;margin-top:20px;">We couldn't find an order with that number and email. Double-check both and try again.</div>`;
  } else if (order) {
    const itemsHtml = order.items
      .map(
        (item) => `<div class="row"><span>${escapeHtml(item.title_snapshot)} × ${item.quantity}</span><span>${formatCurrency(item.price_snapshot * item.quantity)}</span></div>`
      )
      .join('');
    resultHtml = `
    <div class="track-result">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="margin:0;">${escapeHtml(order.order_number)}</h3>
        <span class="status-pill status-pill--${order.status}">${order.status}</span>
      </div>
      <p style="color:#8a8a8a;margin-bottom:16px;">Placed ${new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · Payment: <span class="status-pill status-pill--${order.payment_status}">${order.payment_status}</span></p>
      <div class="order-items-list">
        ${itemsHtml}
        <div class="row" style="font-weight:600;border-top:1px solid #ececea;margin-top:8px;padding-top:12px;">
          <span>Total</span><span>${formatCurrency(order.total_amount)}</span>
        </div>
      </div>
    </div>`;
  }

  return `
  <div class="container narrow">
    <h1>Track Your Order</h1>
    <p>Enter your order number and the email you used at checkout.</p>
    <form method="GET" action="/track">
      <div class="form-field">
        <label for="order">Order number</label>
        <input type="text" id="order" name="order" placeholder="TDF-20260101-AB12CD" value="${escapeHtml(prefill.order || '')}" required>
      </div>
      <div class="form-field">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" value="${escapeHtml(prefill.email || '')}" required>
      </div>
      <button type="submit" class="btn">Track Order</button>
    </form>
    ${resultHtml}
  </div>
  `;
}
