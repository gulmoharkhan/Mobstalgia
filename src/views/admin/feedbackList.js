import { escapeHtml } from '../../utils.js';

export function renderFeedbackList({ feedback }) {
  const rows = feedback
    .map(
      (f) => `
    <tr style="${f.is_read ? '' : 'background:#fbf8f0;'}">
      <td>${escapeHtml(f.name)}<div style="color:#8a8a8a;font-size:0.78rem;">${escapeHtml(f.email)}</div></td>
      <td style="max-width:420px;">${escapeHtml(f.message)}</td>
      <td>${f.rating ? f.rating + ' ★' : '—'}</td>
      <td>${new Date(f.created_at).toLocaleDateString('en-IN')}</td>
      <td>
        ${
          f.is_read
            ? '<span class="status-pill status-pill--confirmed">Read</span>'
            : `<form method="POST" action="/admin/feedback/${f.id}/read"><button type="submit" class="btn btn--sm btn--outline">Mark read</button></form>`
        }
      </td>
    </tr>`
    )
    .join('');

  return `
  <div class="admin-page-head">
    <div><h1>Feedback</h1><p>${feedback.length} message${feedback.length === 1 ? '' : 's'}</p></div>
  </div>
  ${
    feedback.length
      ? `<div class="admin-table-wrap"><table class="admin-table">
      <thead><tr><th>From</th><th>Message</th><th>Rating</th><th>Date</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`
      : `<div class="admin-empty">No feedback yet.</div>`
  }
  `;
}
