export function renderFeedback({ submitted }) {
  if (submitted) {
    return `
    <div class="confirm-box">
      <h1>Thank you!</h1>
      <p>Your feedback has been received. We read every message.</p>
      <a href="/shop" class="btn">Back to Shop</a>
    </div>`;
  }

  return `
  <div class="container narrow">
    <h1>Feedback &amp; Contact</h1>
    <p>Got a question about a piece, a custom request, or thoughts on your order? Send a note below.</p>
    <form method="POST" action="/feedback">
      <div class="form-grid">
        <div class="form-field">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-field">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
        </div>
      </div>
      <div class="form-field">
        <label>How would you rate your experience? (optional)</label>
        <div class="rating-select">
          ${[1, 2, 3, 4, 5]
            .map(
              (n) => `<label><input type="radio" name="rating" value="${n}"><span>${n} ★</span></label>`
            )
            .join('')}
        </div>
      </div>
      <div class="form-field">
        <label for="message">Message</label>
        <textarea id="message" name="message" required placeholder="Tell us what's on your mind…"></textarea>
      </div>
      <button type="submit" class="btn">Send Feedback</button>
    </form>
  </div>
  `;
}
