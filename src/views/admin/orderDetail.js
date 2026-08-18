import { escapeHtml, formatCurrency } from '../../utils.js';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../config.js';

export function renderOrderDetail({ order }) {
  const itemsRows = order.items
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.title_snapshot)}</td>
        <td>${formatCurrency(item.price_snapshot)}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.price_snapshot * item.quantity)}</td>
      </tr>`
    )
    .join('');

  const opt = (options, current) =>
    options.map((o) => `<option value="${o}" ${o === current ? 'selected' : ''}>${o[0].toUpperCase() + o.slice(1)}</option>`).join('');

  return `
  <div class="admin-page-head">
    <div><h1>${escapeHtml(order.order_number)}</h1><p>Placed ${new Date(order.created_at).toLocaleString('en-IN')}</p></div>
    <a href="/admin/orders" class="link-btn">← Back to orders</a>
  </div>

  <div class="admin-panel">
    <h3>Items</h3>
    <div class="admin-table-wrap"><table class="admin-table">
      <thead><tr><th>Piece</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
      <tbody>${itemsRows}</tbody>
      <tfoot><tr><td colspan="3" style="text-align:right;font-weight:600;">Total</td><td style="font-weight:600;">${formatCurrency(order.total_amount)}</td></tr></tfoot>
    </table></div>
  </div>

  <div class="admin-panel">
    <h3>Customer &amp; shipping</h3>
    <p style="margin:0 0 4px;"><strong>${escapeHtml(order.customer_name)}</strong></p>
    <p style="margin:0 0 4px;">${escapeHtml(order.email)} · ${escapeHtml(order.phone)}</p>
    <p style="margin:0;">${escapeHtml(order.address)}, ${escapeHtml(order.city)}, ${escapeHtml(order.state)} ${escapeHtml(order.zip)}, ${escapeHtml(order.country)}</p>
    ${order.notes ? `<p style="margin-top:14px;"><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ''}
  </div>

  <div class="admin-panel">
    <h3>Update status</h3>
    <form method="POST" action="/admin/orders/${order.id}/status">
      <div class="form-grid">
        <div class="form-field">
          <label for="status">Order status</label>
          <select id="status" name="status">${opt(ORDER_STATUSES, order.status)}</select>
        </div>
        <div class="form-field">
          <label for="paymentStatus">Payment status</label>
          <select id="paymentStatus" name="paymentStatus">${opt(PAYMENT_STATUSES, order.payment_status)}</select>
        </div>
      </div>
      <button type="submit" class="btn">Update Order</button>
    </form>
  </div>
  `;
}
