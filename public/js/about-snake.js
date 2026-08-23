document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('snake-overlay');
  const startBtn = document.getElementById('snake-start');
  const scoreEl = document.getElementById('snake-score');
  const dpadBtns = document.querySelectorAll('.nokia-dpad-btn[data-dir]');

  const GRID = 11;
  const CELL = canvas.width / GRID;
  const BG = '#9aa87d';
  const FG = '#2b3a26';
  const TICK_MS = 170;

  let snake, dir, nextDir, food, score, running, timer;

  function resetState() {
    snake = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    dir = { x: 1, y: 0 };
    nextDir = dir;
    score = 0;
    placeFood();
    updateScore();
  }

  function placeFood() {
    let candidate;
    do {
      candidate = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snake.some((s) => s.x === candidate.x && s.y === candidate.y));
    food = candidate;
  }

  function updateScore() {
    if (scoreEl) scoreEl.textContent = String(score).padStart(3, '0');
  }

  function drawCell(x, y, filled) {
    const px = x * CELL;
    const py = y * CELL;
    if (filled) {
      ctx.fillStyle = FG;
      ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
    }
  }

  function draw() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCell(food.x, food.y, true);
    snake.forEach((seg) => drawCell(seg.x, seg.y, true));
  }

  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    const hitWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID;
    const hitSelf = snake.some((seg) => seg.x === head.x && seg.y === head.y);
    if (hitWall || hitSelf) {
      gameOver();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      updateScore();
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function gameOver() {
    running = false;
    clearInterval(timer);
    if (overlay) {
      overlay.hidden = false;
      overlay.innerHTML = `<p class="nokia-overlay-title">GAME OVER</p><p class="nokia-overlay-hint">Score: ${score}</p><p class="nokia-overlay-hint">Press start to retry</p>`;
    }
    if (startBtn) startBtn.textContent = 'Start';
  }

  function startGame() {
    resetState();
    if (overlay) overlay.hidden = true;
    running = true;
    clearInterval(timer);
    draw();
    timer = setInterval(step, TICK_MS);
    if (startBtn) startBtn.textContent = 'Reset';
  }

  function setDirection(name) {
    if (!running) return;
    const map = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    const requested = map[name];
    if (!requested) return;
    // Prevent reversing directly into the snake's own body.
    if (requested.x === -dir.x && requested.y === -dir.y) return;
    nextDir = requested;
  }

  if (startBtn) startBtn.addEventListener('click', startGame);

  dpadBtns.forEach((btn) => {
    btn.addEventListener('click', () => setDirection(btn.dataset.dir));
  });

  const KEY_MAP = {
    ArrowUp: 'up', w: 'up', W: 'up',
    ArrowDown: 'down', s: 'down', S: 'down',
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right',
  };

  document.addEventListener('keydown', (e) => {
    const direction = KEY_MAP[e.key];
    if (!direction) return;
    // Only hijack arrow/WASD scrolling when the game section is in view.
    const rect = canvas.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    e.preventDefault();
    setDirection(direction);
  });

  // Draw an idle frame so the screen isn't blank before the first Start press.
  resetState();
  draw();
  if (overlay) overlay.hidden = false;
});
