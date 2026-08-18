import { escapeHtml, formatCurrency } from '../utils.js';
import { PAYMENT_INSTRUCTIONS } from '../config.js';

export function renderOrderConfirm({ order }) {
  if (!order) {
    return `
    <div class="confirm-box">
      <h1>Order not found</h1>
      <p>We couldn't find that order. If you just placed it, check your email confirmation or <a href="/track">track your order</a>.</p>
      <a href="/shop" class="btn">Back to Shop</a>
    </div>`;
  }

  const itemsHtml = order.items
    .map(
      (item) => `<div class="row"><span>${escapeHtml(item.title_snapshot)} × ${item.quantity}</span><span>${formatCurrency(item.price_snapshot * item.quantity)}</span></div>`
    )
    .join('');

  return `
  <div class="confirm-box">
    <div class="detail-eyebrow">Thank you, ${escapeHtml(order.customer_name)}</div>
    <h1>Your order has been placed</h1>
    <div class="order-number">${escapeHtml(order.order_number)}</div>
    <p>We've reserved these pieces for you. Save your order number and email — you'll need them to track your order.</p>
    <div class="order-items-list" style="text-align:left;">
      ${itemsHtml}
      <div class="row" style="font-weight:600;border-top:1px solid #ececea;margin-top:8px;padding-top:12px;">
        <span>Total</span><span>${formatCurrency(order.total_amount)}</span>
      </div>
    </div>
    <div class="payment-note" style="text-align:left;">
      ${PAYMENT_INSTRUCTIONS.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
    </div>
    <div style="margin-top:30px;display:flex;gap:14px;justify-content:center;">
      <a href="/track?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(order.email)}" class="btn btn--outline">Track this order</a>
      <a href="/shop" class="btn">Continue Shopping</a>
    </div>
  </div>
  `;
}
