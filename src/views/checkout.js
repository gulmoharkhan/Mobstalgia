import { PAYMENT_INSTRUCTIONS } from '../config.js';

export function renderCheckout() {
  return `
  <div class="container" style="padding:50px 0 90px;">
    <h1 style="margin-bottom:34px;">Checkout</h1>
    <div class="checkout-grid">
      <div>
        <div id="checkout-error" class="flash flash--error" hidden style="border-radius:4px;padding:12px 16px;margin-bottom:20px;"></div>
        <form id="checkout-form">
          <h3>Contact &amp; shipping details</h3>
          <div class="form-field">
            <label for="name">Full name</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-field">
              <label for="phone">Phone</label>
              <input type="tel" id="phone" name="phone" required>
            </div>
          </div>
          <div class="form-field">
            <label for="address">Address</label>
            <input type="text" id="address" name="address" required>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="city">City</label>
              <input type="text" id="city" name="city" required>
            </div>
            <div class="form-field">
              <label for="state">State</label>
              <input type="text" id="state" name="state" required>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="zip">PIN / ZIP code</label>
              <input type="text" id="zip" name="zip" required>
            </div>
            <div class="form-field">
              <label for="country">Country</label>
              <input type="text" id="country" name="country" value="India" required>
            </div>
          </div>
          <div class="form-field">
            <label for="notes">Order notes (optional)</label>
            <textarea id="notes" name="notes" placeholder="Anything we should know?"></textarea>
          </div>
          <button type="submit" class="btn btn--block">Place Order</button>
        </form>
      </div>
      <div>
        <div class="order-summary-box">
          <h3>Order summary</h3>
          <div id="checkout-summary"><p style="color:#8a8a8a;">Loading…</p></div>
        </div>
        <div class="payment-note">
          ${PAYMENT_INSTRUCTIONS.map((p) => `<p>${p}</p>`).join('')}
        </div>
      </div>
    </div>
  </div>
  <script src="/js/checkout-page.js"></script>
  `;
}
