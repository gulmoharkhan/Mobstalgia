import { SITE_NAME, INSTAGRAM_URL } from '../config.js';

export function renderAbout() {
  return `
  <div class="about-hero container">
    <div class="hero-eyebrow">The craft behind the frames</div>
    <h1>Turning premium phones into permanent art</h1>
  </div>
  <div class="container about-body">
    <p>${SITE_NAME} started as a hobby: taking apart phones just to see what was inside, and realizing that the inside is often more beautiful than the outside. A logic board is a tiny city. A camera module looks like a jewel. A battery pack, laid open, has a strange industrial elegance to it.</p>
    <p>Every piece here begins with a real, working (or once-working) premium phone — a full teardown, screw by screw, layer by layer. Nothing is a replica unless it's explicitly listed as a printed piece.</p>

    <h2>How each handcrafted piece is made</h2>
    <div class="process-grid">
      <div class="process-step"><span>01</span><h3>Teardown</h3><p>The phone is fully disassembled by hand — display, board, battery, cameras, speakers, and chassis are separated and cleaned.</p></div>
      <div class="process-step"><span>02</span><h3>Composition</h3><p>Components are arranged to tell the story of the phone's engineering, balancing symmetry with the phone's actual internal layout.</p></div>
      <div class="process-step"><span>03</span><h3>Mounting</h3><p>Each part is secured into a gallery-ready frame, photographed from multiple angles, and checked for durability before listing.</p></div>
    </div>

    <h2>Handcrafted vs. printed</h2>
    <p><strong>Handcrafted</strong> pieces use the real, physical components from a torn-down phone — every piece is one of a kind, and once it's sold, it's gone for good.</p>
    <p><strong>Printed</strong> pieces are high-resolution photographic reproductions of a teardown, offered when a particular phone or composition is popular enough to make available to more than one collector.</p>

    <h2>Sourcing</h2>
    <p>Phones are sourced individually — some retired daily-drivers, some purchased specifically for teardown. Premium and flagship models are prioritized for their internal design quality, but requests for specific phones are always welcome via the <a href="/feedback">contact page</a>.</p>

    <h2>Follow along</h2>
    <p>New pieces, in-progress teardowns, and behind-the-scenes shots go up on Instagram first — <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer">@mobstalgia</a>.</p>
  </div>
  `;
}
