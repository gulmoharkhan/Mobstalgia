import { SITE_NAME, INSTAGRAM_URL } from '../config.js';

export function renderAbout() {
  return `
  <div class="about-hero container">
    <h1>Your phone still has a story. We just help you frame it.</h1>
  </div>
  <div class="container about-body">
    <p>Somewhere in a drawer, a bag, or the back of a cupboard, there's an old phone you haven't turned on in years. It isn't doing much there. But it holds a real part of your story — the calls, the photos, the years you carried it everywhere. That phone was never just a device. It's a reflection of the choices you made, with a character all its own.</p>
    <p>That phone doesn't need to stay hidden. ${SITE_NAME} gives it a second life — as a piece you see every day, on a wall or a desk, instead of a device gathering dust in a box.</p>

    <h2>How the frame kit works</h2>
    <div class="process-grid">
      <div class="process-step"><span>01</span><h3>Pick your style</h3><p>Casual to open the phone and see every component, or Expert if you want to open those components too.</p></div>
      <div class="process-step"><span>02</span><h3>We ship the frame</h3><p>Your kit arrives with the frame, mounting hardware, and a simple guide for taking your device apart safely.</p></div>
      <div class="process-step"><span>03</span><h3>You dismantle it</h3><p>Screw by screw, layer by layer — your phone, in your hands. This is where you get to admire the work of the engineers who actually built it.</p></div>
      <div class="process-step"><span>04</span><h3>You arrange &amp; mount</h3><p>Lay the components into the frame however you like — there's no wrong way to tell your phone's story.</p></div>
      <div class="process-step"><span>05</span><h3>Hang it up</h3><p>What used to sit in a drawer now sits on your wall — a small, honest piece of inspiration instead of forgotten history.</p></div>
    </div>

    <h2>Why frame it yourself?</h2>
    <p>We could tear phones apart for you and ship you a finished piece — plenty of places do exactly that. But taking it apart yourself is the whole point. It's a few quiet, satisfying hours with a screwdriver and a device that actually means something to you, and it ends with something you made, not something you bought pre-made. Next time you spot an old phone lying around, you'll probably see it differently, too.</p>

    <h2>Casual Kit vs. Expert Kit</h2>
    <p><strong>Casual Kit</strong> is your first teardown — open the phone and see every component laid out whole: main board, battery, display, camera, speaker. A clean, satisfying build with no specialist tools required.</p>
    <p><strong>Expert Kit</strong> is for the ones who don't stop at "that's a camera module." It opens the components themselves — the camera taken apart into its lens assembly, autofocus system, and image sensor; the Taptic Engine opened to see what's actually inside it. Bring a set of precision screwdrivers and some patience.</p>

    <h2>Need inspiration first?</h2>
    <p>Not sure where to start? Browse a few devices we've framed ourselves for inspiration — Nokia bricks, early iPhones, an iPod Classic and more — then order the kit that matches your phone via the <a href="/shop">shop</a>.</p>

    <h2>Follow along</h2>
    <p>New kits, in-progress teardowns from our own collection, and behind-the-scenes shots go up on Instagram first — <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer">@mobstalgia</a>.</p>
  </div>
  `;
}
