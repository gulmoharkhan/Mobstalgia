document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('wall-canvas');
  if (!canvas) return;

  const MAX_FRAMES = 4;
  const initial = window.__WALL_INITIAL__ || { id: null, background: '', placements: [] };

  const urlInput = document.getElementById('wall-bg-url');
  const uploadInput = document.getElementById('wall-bg-upload');
  const paletteItems = Array.from(document.querySelectorAll('.wall-palette-item'));
  const saveBtn = document.getElementById('wall-save');
  const saveMsg = document.getElementById('wall-save-msg');
  const flash = document.getElementById('wall-editor-flash');

  let currentBackground = initial.background || '';
  let backgroundFilename = '';
  let placements = (initial.placements || []).map((p, i) => ({ ...p, cid: `p${i}-${Date.now()}` }));
  let nextZ = placements.reduce((max, p) => Math.max(max, p.z || 0), 0) + 1;

  function showFlash(message) {
    if (!flash) return;
    flash.textContent = message;
    flash.hidden = false;
  }

  function clearEmptyState() {
    const empty = document.getElementById('wall-canvas-empty');
    if (empty) empty.remove();
  }

  function setBackground(url) {
    currentBackground = url;
    canvas.style.backgroundImage = url ? `url('${url}')` : '';
    if (url) clearEmptyState();
  }

  function updatePaletteState() {
    const full = placements.length >= MAX_FRAMES;
    paletteItems.forEach((item) => item.classList.toggle('disabled', full));
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  if (urlInput) {
    urlInput.addEventListener('input', () => {
      backgroundFilename = '';
      setBackground(urlInput.value.trim());
    });
  }

  if (uploadInput) {
    uploadInput.addEventListener('change', async () => {
      const file = uploadInput.files && uploadInput.files[0];
      if (!file) return;
      const dataUrl = await fileToBase64(file);
      backgroundFilename = file.name;
      if (urlInput) urlInput.value = '';
      setBackground(dataUrl);
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function renderPlacement(p) {
    const el = document.createElement('div');
    el.className = 'wall-placement';
    el.style.left = `${p.x}%`;
    el.style.top = `${p.y}%`;
    el.style.width = `${p.width}%`;
    el.style.transform = `rotate(${p.rotation || 0}deg)`;
    el.style.zIndex = p.z || 1;
    el.dataset.cid = p.cid;

    const img = document.createElement('img');
    img.src = p.image;
    img.alt = p.title || '';
    el.appendChild(img);

    const removeBtn = document.createElement('div');
    removeBtn.className = 'wall-placement-remove';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove from wall';
    el.appendChild(removeBtn);

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'wall-placement-resize';
    el.appendChild(resizeHandle);

    const rotateHandle = document.createElement('div');
    rotateHandle.className = 'wall-placement-rotate';
    el.appendChild(rotateHandle);

    canvas.appendChild(el);

    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      placements = placements.filter((pl) => pl.cid !== p.cid);
      el.remove();
      updatePaletteState();
    });

    // Move: drag anywhere on the placement except the handles/remove button.
    el.addEventListener('pointerdown', (e) => {
      if (e.target !== el && e.target !== img) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = p.x;
      const startTop = p.y;

      function onMove(ev) {
        const dxPct = ((ev.clientX - startX) / rect.width) * 100;
        const dyPct = ((ev.clientY - startY) / rect.height) * 100;
        p.x = clamp(startLeft + dxPct, -5, 96);
        p.y = clamp(startTop + dyPct, -5, 92);
        el.style.left = `${p.x}%`;
        el.style.top = `${p.y}%`;
      }
      function onUp(ev) {
        el.releasePointerCapture(e.pointerId);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
      }
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
    });

    resizeHandle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      resizeHandle.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      const startX = e.clientX;
      const startWidth = p.width;

      function onMove(ev) {
        const dxPct = ((ev.clientX - startX) / rect.width) * 100;
        p.width = clamp(startWidth + dxPct, 6, 45);
        el.style.width = `${p.width}%`;
      }
      function onUp() {
        resizeHandle.releasePointerCapture(e.pointerId);
        resizeHandle.removeEventListener('pointermove', onMove);
        resizeHandle.removeEventListener('pointerup', onUp);
      }
      resizeHandle.addEventListener('pointermove', onMove);
      resizeHandle.addEventListener('pointerup', onUp);
    });

    rotateHandle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      rotateHandle.setPointerCapture(e.pointerId);

      function onMove(ev) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = (Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * 180) / Math.PI;
        p.rotation = Math.round(angle + 90);
        el.style.transform = `rotate(${p.rotation}deg)`;
      }
      function onUp() {
        rotateHandle.releasePointerCapture(e.pointerId);
        rotateHandle.removeEventListener('pointermove', onMove);
        rotateHandle.removeEventListener('pointerup', onUp);
      }
      rotateHandle.addEventListener('pointermove', onMove);
      rotateHandle.addEventListener('pointerup', onUp);
    });

    return el;
  }

  function addPlacement({ frameId, image, title, x, y }) {
    if (placements.length >= MAX_FRAMES) return;
    const p = {
      cid: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      frameId,
      image,
      title,
      x: clamp(x, -5, 90),
      y: clamp(y, -5, 88),
      width: 15,
      rotation: Math.round(Math.random() * 6 - 3),
      z: nextZ++,
    };
    placements.push(p);
    renderPlacement(p);
    updatePaletteState();
  }

  // Initial render.
  placements.forEach(renderPlacement);
  updatePaletteState();

  // Palette drag-and-drop onto the canvas (native HTML5 drag/drop).
  paletteItems.forEach((item) => {
    item.addEventListener('dragstart', (e) => {
      if (item.classList.contains('disabled')) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData(
        'text/plain',
        JSON.stringify({ frameId: Number(item.dataset.frameId), image: item.dataset.image, title: item.dataset.title })
      );
    });
  });

  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100 - 7;
    const y = ((e.clientY - rect.top) / rect.height) * 100 - 7;
    addPlacement({ ...data, x, y });
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (flash) flash.hidden = true;
      if (saveMsg) saveMsg.textContent = '';
      if (!currentBackground) return showFlash('Add a background photo first.');
      if (!placements.length) return showFlash('Drag at least one frame onto the wall.');

      const payload = {
        background: currentBackground,
        backgroundFilename,
        frames: placements.map((p) => ({
          frameId: p.frameId,
          x: Math.round(p.x * 10) / 10,
          y: Math.round(p.y * 10) / 10,
          width: Math.round(p.width * 10) / 10,
          rotation: p.rotation,
          z: p.z,
        })),
      };

      const url = initial.id ? `/admin/api/walls/${encodeURIComponent(initial.id)}` : '/admin/api/walls';
      saveBtn.disabled = true;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Could not save this wall.');
        window.location.href = '/admin/walls';
      } catch (err) {
        showFlash(err.message);
      } finally {
        saveBtn.disabled = false;
      }
    });
  }
});
