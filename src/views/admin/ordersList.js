import { escapeHtml, formatCurrency } from '../../utils.js';
import { ORDER_STATUSES } from '../../config.js';

export function renderOrdersList({ orders, statusFilter }) {
  const rows = orders
    .map(
      (o) => `
    <tr>
      <td><a href="/admin/orders/${o.id}">${escapeHtml(o.order_number)}</a></td>
      <td>${escapeHtml(o.customer_name)}<div style="color:#8a8a8a;font-size:0.78rem;">${escapeHtml(o.email)}</div></td>
      <td>${formatCurrency(o.total_amount)}</td>
      <td><span class="status-pill status-pill--${o.status}">${o.status}</span></td>
      <td><span class="status-pill status-pill--${o.payment_status}">${o.payment_status}</span></td>
      <td>${new Date(o.created_at).toLocaleDateString('en-IN')}</td>
      <td><a class="link-btn" href="/admin/orders/${o.id}">View</a></td>
    </tr>`
    )
    .join('');

  const filterOpt = (value, label) =>
    `<option value="${value}" ${value === (statusFilter || '') ? 'selected' : ''}>${label}</option>`;

  return `
  <div class="admin-page-head">
    <div><h1>Orders</h1><p>${orders.length} order${orders.length === 1 ? '' : 's'}</p></div>
    <form method="GET" action="/admin/orders">
      <select name="status" onchange="this.form.submit()" style="padding:9px 12px;border:1px solid #d8d8d5;border-radius:4px;">
        ${filterOpt('', 'All statuses')}
        ${ORDER_STATUSES.map((s) => filterOpt(s, s[0].toUpperCase() + s.slice(1))).join('')}
      </select>
    </form>
  </div>
  ${
    orders.length
      ? `<div class="admin-table-wrap"><table class="admin-table">
      <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`
      : `<div class="admin-empty">No orders yet.</div>`
  }
  `;
}
