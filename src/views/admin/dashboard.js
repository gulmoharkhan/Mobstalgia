import { escapeHtml, formatCurrency } from '../../utils.js';

export function renderDashboard({ stats }) {
  const orderRows = stats.recentOrders
    .map(
      (o) => `<tr>
        <td><a href="/admin/orders/${o.id}">${escapeHtml(o.order_number)}</a></td>
        <td>${escapeHtml(o.customer_name)}</td>
        <td>${formatCurrency(o.total_amount)}</td>
        <td><span class="status-pill status-pill--${o.status}">${o.status}</span></td>
        <td>${new Date(o.created_at).toLocaleDateString('en-IN')}</td>
      </tr>`
    )
    .join('');

  const feedbackRows = stats.recentFeedback
    .map(
      (f) => `<tr>
        <td>${escapeHtml(f.name)}</td>
        <td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(f.message)}</td>
        <td>${f.rating ? f.rating + ' ★' : '—'}</td>
        <td>${f.is_read ? 'Read' : '<strong>New</strong>'}</td>
      </tr>`
    )
    .join('');

  return `
  <div class="admin-page-head">
    <div><h1>Dashboard</h1><p>Overview of your shop</p></div>
  </div>

  <div class="admin-stat-grid">
    <div class="admin-stat-card"><strong>${stats.totalFrames}</strong><span>Total frames</span></div>
    <div class="admin-stat-card"><strong>${stats.availableFrames}</strong><span>Available</span></div>
    <div class="admin-stat-card"><strong>${stats.totalOrders}</strong><span>Total orders</span></div>
    <div class="admin-stat-card"><strong>${stats.pendingOrders}</strong><span>Pending orders</span></div>
  </div>
  <div class="admin-stat-grid" style="grid-template-columns:repeat(2,1fr);">
    <div class="admin-stat-card"><strong>${formatCurrency(stats.revenue)}</strong><span>Revenue (paid orders)</span></div>
    <div class="admin-stat-card"><strong>${stats.unreadFeedback}</strong><span>Unread feedback</span></div>
  </div>

  <div class="admin-panel">
    <h3>Recent orders</h3>
    ${
      stats.recentOrders.length
        ? `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>${orderRows}</tbody></table></div>`
        : '<div class="admin-empty">No orders yet.</div>'
    }
  </div>

  <div class="admin-panel">
    <h3>Recent feedback</h3>
    ${
      stats.recentFeedback.length
        ? `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Name</th><th>Message</th><th>Rating</th><th>Status</th></tr></thead><tbody>${feedbackRows}</tbody></table></div>`
        : '<div class="admin-empty">No feedback yet.</div>'
    }
  </div>
  `;
}
