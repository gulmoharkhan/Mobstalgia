import { SITE_NAME, INSTAGRAM_URL } from '../config.js';

export function renderAbout() {
  return `
  <div class="about-hero container">
    <div class="hero-eyebrow">The story behind the frame</div>
    <h1>Your phone still has a story. We just help you frame it.</h1>
  </div>
  <div class="container about-body">
    <p>Somewhere in a drawer, a bag, or the back of a cupboard, you have an old phone. It isn't doing anything there. But it represents a real part of your journey — the calls, the photos, the years you carried it everywhere. Your phone was never just a device. It was a reflection of the choices you made, and it has a character all its own.</p>
    <p>That phone doesn't need to stay hidden. ${SITE_NAME} exists to give it a second life — as a piece you actually see every day, on a wall or a desk, instead of a device you forgot in a drawer.</p>

    <h2>How the frame kit works</h2>
    <div class="process-grid">
      <div class="process-step"><span>01</span><h3>Choose your kit</h3><p>Pick the size that fits your device — Compact for watches and small devices, Classic for phones and up.</p></div>
      <div class="process-step"><span>02</span><h3>We ship the frame</h3><p>Your kit arrives with the frame, mounting hardware, and a simple guide for taking your device apart safely.</p></div>
      <div class="process-step"><span>03</span><h3>You dismantle it</h3><p>Screw by screw, layer by layer — your phone, in your hands. This is where you get to admire the work of the engineers who actually built it.</p></div>
      <div class="process-step"><span>04</span><h3>You arrange &amp; mount</h3><p>Lay the components into the frame however tells your phone's story best. There's no wrong way to do it.</p></div>
      <div class="process-step"><span>05</span><h3>Hang it up</h3><p>What used to sit in a drawer now sits on your wall — a small, honest piece of inspiration instead of forgotten history.</p></div>
    </div>

    <h2>Why frame it yourself?</h2>
    <p>We could tear phones apart for you and ship you a finished piece. Plenty of places do exactly that. But taking it apart yourself is the whole point — it's a few quiet, satisfying hours with a screwdriver and a device that actually means something to you, and it ends with something you made, not something you bought pre-made. It should inspire you to look at the next old phone in your drawer differently, too.</p>

    <h2>Compact Kit vs. Classic Kit</h2>
    <p><strong>Compact Kit</strong> is sized for smaller, denser devices like the Apple Watch — built for the tight internal layouts these tend to pack in.</p>
    <p><strong>Classic Kit</strong> is sized for phones and larger devices, from iPod Classics to modern flagships, with room to lay a full board and camera module out properly.</p>

    <h2>Need inspiration first?</h2>
    <p>Not sure where to start? Browse a few devices we've framed ourselves for inspiration — Nokia bricks, early iPhones, an iPod Classic and more — then order the kit sized for your own phone via the <a href="/shop">shop</a>.</p>

    <h2>Follow along</h2>
    <p>New kits, in-progress teardowns from our own collection, and behind-the-scenes shots go up on Instagram first — <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer">@mobstalgia</a>.</p>
  </div>
  `;
}
