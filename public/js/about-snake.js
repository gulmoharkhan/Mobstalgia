document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('snake-overlay');
  const startBtn = document.getElementById('snake-start');
  const scoreEl = document.getElementById('snake-score');
  const dpadBtns = document.querySelectorAll('.nokia-dpad-btn[data-dir]');
  const leaderboardRoot = document.querySelector('.snake-leaderboard');
  const leaderboardListEl = document.getElementById('snake-leaderboard-list');
  const accountPrompt = document.getElementById('snake-account-prompt');
  const saveStatusEl = document.getElementById('snake-save-status');

  const isLoggedIn = leaderboardRoot?.dataset.loggedIn === 'true';

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
    // No movement until the player makes their first move — starting the
    // snake off already sliding toward the wall meant it could die before
    // someone had a chance to react.
    dir = { x: 0, y: 0 };
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

  function setOverlay(hidden) {
    if (!overlay) return;
    overlay.hidden = hidden;
    // Belt-and-suspenders: some browsers/CSS specificity setups can let an
    // author `display` rule beat the UA `[hidden]` rule, so also toggle a
    // class the stylesheet gives higher priority.
    overlay.classList.toggle('is-hidden', hidden);
  }

  function step() {
    dir = nextDir;
    if (dir.x === 0 && dir.y === 0) {
      // Waiting for the player's first direction — hold still instead of
      // ticking toward a wall with no input.
      return;
    }
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

  async function submitScore(finalScore) {
    if (!isLoggedIn || finalScore <= 0) return;
    if (saveStatusEl) {
      saveStatusEl.hidden = false;
      saveStatusEl.textContent = 'Saving your score…';
    }
    try {
      const res = await fetch('/api/snake-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: finalScore }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Could not save your score.');
      if (leaderboardListEl && Array.isArray(result.leaderboard)) {
        renderLeaderboard(result.leaderboard);
      }
      if (saveStatusEl) saveStatusEl.textContent = `Saved — your best is ${result.best}.`;
    } catch (err) {
      if (saveStatusEl) saveStatusEl.textContent = err.message;
    }
  }

  function renderLeaderboard(rows) {
    if (!leaderboardListEl) return;
    if (!rows.length) {
      leaderboardListEl.innerHTML = '<p class="snake-leaderboard-empty">No scores yet — be the first on the board.</p>';
      return;
    }
    leaderboardListEl.innerHTML = `<ol class="snake-leaderboard-list">${rows
      .map(
        (row, i) => `<li>
          <span class="snake-leaderboard-rank">${i + 1}</span>
          <span class="snake-leaderboard-name">${escapeHtml(row.displayName)}</span>
          <span class="snake-leaderboard-score">${row.score}</span>
        </li>`
      )
      .join('')}</ol>`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function gameOver() {
    running = false;
    clearInterval(timer);
    const finalScore = score;
    if (overlay) {
      overlay.innerHTML = `<p class="nokia-overlay-title">GAME OVER</p><p class="nokia-overlay-hint">Score: ${finalScore}</p><p class="nokia-overlay-hint">Press start to retry</p>`;
    }
    setOverlay(false);
    if (startBtn) startBtn.textContent = 'Start';
    submitScore(finalScore);
  }

  function startGame() {
    resetState();
    setOverlay(true);
    running = true;
    clearInterval(timer);
    draw();
    timer = setInterval(step, TICK_MS);
    if (startBtn) startBtn.textContent = 'Reset';
    if (saveStatusEl) saveStatusEl.hidden = true;
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
  setOverlay(false);
});
