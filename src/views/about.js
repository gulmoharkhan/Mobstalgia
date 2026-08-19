import { SITE_NAME, INSTAGRAM_URL } from '../config.js';

export function renderAbout() {
  return `
  <div class="about-hero container" data-reveal>
    <span class="about-kicker">The Mobstalgia Story</span>
    <h1>Your phone still has a story. We just help you frame it.</h1>
  </div>

  <div class="container about-lede-wrap">
    <p class="about-lede" data-reveal>Somewhere in a drawer, a bag, or the back of a cupboard, there's an old phone you haven't turned on in years.</p>
    <div class="about-lede-support" data-reveal style="--reveal-delay:80ms">
      <p>It isn't doing much there. But it holds a real part of your story — the calls, the photos, the years you carried it everywhere. That phone was never just a device. It's a reflection of the choices you made, with a character all its own.</p>
      <p>That phone doesn't need to stay hidden. ${SITE_NAME} gives it a second life — as a piece you see every day, on a wall or a desk, instead of a device gathering dust in a box.</p>
    </div>
  </div>

  <section class="about-timeline-section">
    <div class="container">
      <div class="section-head" data-reveal>
        <h2>How the frame kit works</h2>
        <p>Five steps, from forgotten drawer to something on your wall.</p>
      </div>
      <div class="about-timeline">
        ${[
          ['Pick your style', 'Casual to open the phone and see every component, or Expert if you want to open those components too.'],
          ['We ship the frame', 'Your kit arrives with the frame, mounting hardware, and a simple guide for taking your device apart safely.'],
          ['You dismantle it', 'Screw by screw, layer by layer — your phone, in your hands. This is where you get to admire the work of the engineers who actually built it.'],
          ['You arrange &amp; mount', "Lay the components into the frame however you like — there's no wrong way to tell your phone's story."],
          ['Hang it up', 'What used to sit in a drawer now sits on your wall — a small, honest piece of inspiration instead of forgotten history.'],
        ]
          .map(
            ([title, body], i) => `
        <div class="about-timeline-step" data-reveal style="--reveal-delay:${i * 70}ms">
          <div class="about-timeline-marker"><span>${String(i + 1).padStart(2, '0')}</span></div>
          <div class="about-timeline-content"><h3>${title}</h3><p>${body}</p></div>
        </div>`
          )
          .join('')}
      </div>
    </div>
  </section>

  <section class="about-manifesto">
    <div class="container about-manifesto-inner" data-reveal>
      <p class="about-manifesto-lead">We could tear phones apart for you and ship you a finished piece — plenty of places do exactly that.</p>
      <p class="about-manifesto-body">But taking it apart yourself is the whole point. It's a few quiet, satisfying hours with a screwdriver and a device that actually means something to you, and it ends with something you made, not something you bought pre-made. Next time you spot an old phone lying around, you'll probably see it differently, too.</p>
    </div>
  </section>

  <div class="container about-body">
    <div class="section-head" data-reveal><h2>Casual Kit vs. Expert Kit</h2></div>
    <div class="about-compare-grid">
      <div class="about-compare-card" data-reveal>
        <span class="about-compare-flag">Casual Kit</span>
        <p>Your first teardown — open the phone and see every component laid out whole: main board, battery, display, camera, speaker. A clean, satisfying build with no specialist tools required.</p>
      </div>
      <div class="about-compare-card about-compare-card--expert" data-reveal style="--reveal-delay:80ms">
        <span class="about-compare-flag">Expert Kit</span>
        <p>For the ones who don't stop at "that's a camera module." It opens the components themselves — the camera taken apart into its lens assembly, autofocus system, and image sensor; the Taptic Engine opened to see what's actually inside it. Bring a set of precision screwdrivers and some patience.</p>
      </div>
    </div>
  </div>

  <section class="about-cta-band">
    <div class="container about-cta-inner" data-reveal>
      <h2>Not sure where to start?</h2>
      <p>Browse a few devices we've framed ourselves for inspiration — Nokia bricks, early iPhones, an iPod Classic and more — then order the kit that matches your phone. New teardowns and behind-the-scenes shots go up on Instagram first.</p>
      <div class="about-cta-actions">
        <a href="/shop" class="btn">Browse the shop</a>
        <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" class="link-btn">@mobstalgia on Instagram →</a>
      </div>
    </div>
  </section>
  `;
}
