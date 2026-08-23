document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('frame-form');
  if (!form) return;

  const fileInput = document.getElementById('image-input');
  const previewGrid = document.getElementById('image-preview-grid');
  const errorBox = document.getElementById('frame-form-error');

  // images: array of { kind: 'existing'|'new', id?, url (for preview), dataBase64?, filename? }
  const existing = window.TDF_EXISTING_IMAGES || [];
  let images = existing.map((img) => ({ kind: 'existing', id: img.id, url: img.url }));

  function renderPreviews() {
    previewGrid.innerHTML = images
      .map(
        (img, idx) => `
      <div class="image-preview" data-idx="${idx}">
        <img src="${img.url}" alt="">
        <button type="button" class="remove-image-btn" data-idx="${idx}" title="Remove">×</button>
      </div>`
      )
      .join('');
    previewGrid.querySelectorAll('.remove-image-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        images.splice(Number(btn.dataset.idx), 1);
        renderPreviews();
      });
    });
  }
  renderPreviews();

  if (fileInput) {
    fileInput.addEventListener('change', async () => {
      const files = Array.from(fileInput.files || []);
      for (const file of files) {
        const dataBase64 = await fileToBase64(file);
        images.push({ kind: 'new', url: dataBase64, dataBase64, filename: file.name });
      }
      fileInput.value = '';
      renderPreviews();
    });
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Highlights repeater: each item is { title, body, image (URL or data: URL), filename? }
  const highlightList = document.getElementById('highlight-list');
  const addHighlightBtn = document.getElementById('add-highlight-btn');
  let highlights = (window.TDF_EXISTING_HIGHLIGHTS || []).map((h) => ({
    title: h.title || '',
    body: h.body || '',
    image: h.image || '',
  }));

  function renderHighlights() {
    if (!highlightList) return;
    highlightList.innerHTML = highlights
      .map(
        (h, idx) => `
      <div class="highlight-editor-row" data-idx="${idx}" style="border:1px solid var(--admin-border,#e2e2e2);border-radius:8px;padding:14px;margin-bottom:12px;">
        <div class="form-grid">
          <div class="form-field">
            <label>Title</label>
            <input type="text" class="hl-title" value="${escAttr(h.title)}" placeholder="A real hard disk, inside a phone">
          </div>
          <div class="form-field">
            <label>Image</label>
            <label class="image-upload-zone hl-image-upload">${h.image ? 'Change image' : 'Upload image'}</label>
            <input type="file" accept="image/*" class="hl-image-input" style="display:none;">
          </div>
        </div>
        <div class="form-field">
          <label>Description</label>
          <textarea class="hl-body" placeholder="Long before flash storage took over...">${escText(h.body)}</textarea>
        </div>
        ${h.image ? `<img src="${h.image}" alt="" style="max-width:120px;border-radius:6px;display:block;margin-bottom:8px;">` : ''}
        <button type="button" class="btn btn--outline hl-remove-btn">Remove highlight</button>
      </div>`
      )
      .join('');

    highlightList.querySelectorAll('.highlight-editor-row').forEach((row) => {
      const idx = Number(row.dataset.idx);
      row.querySelector('.hl-title').addEventListener('input', (e) => {
        highlights[idx].title = e.target.value;
      });
      row.querySelector('.hl-body').addEventListener('input', (e) => {
        highlights[idx].body = e.target.value;
      });
      row.querySelector('.hl-remove-btn').addEventListener('click', () => {
        highlights.splice(idx, 1);
        renderHighlights();
      });
      const hlFileInput = row.querySelector('.hl-image-input');
      hlFileInput.addEventListener('change', async () => {
        const file = hlFileInput.files && hlFileInput.files[0];
        if (!file) return;
        highlights[idx].image = await fileToBase64(file);
        highlights[idx].filename = file.name;
        renderHighlights();
      });
    });
  }

  function escAttr(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
  function escText(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  renderHighlights();

  if (addHighlightBtn) {
    addHighlightBtn.addEventListener('click', () => {
      highlights.push({ title: '', body: '', image: '' });
      renderHighlights();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    const submitBtn = form.querySelector('button[type=submit]');
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Saving…';

    const fd = new FormData(form);
    const payload = {
      title: fd.get('title'),
      brand: fd.get('brand'),
      phoneModel: fd.get('phoneModel'),
      description: fd.get('description'),
      price: fd.get('price'),
      type: fd.get('type'),
      status: fd.get('status'),
      stock: fd.get('stock'),
      featured: fd.get('featured') === 'on',
      existingImageIds: images.filter((i) => i.kind === 'existing').map((i) => i.id),
      newImages: images.filter((i) => i.kind === 'new').map((i) => ({ dataBase64: i.dataBase64, filename: i.filename })),
      imageOrder: images.map((i) => (i.kind === 'existing' ? `e:${i.id}` : `n:${i.filename}`)),
      material: fd.get('material'),
      sizeLabel: fd.get('sizeLabel'),
      unitsLabel: fd.get('unitsLabel'),
      boxContents: String(fd.get('boxContentsText') || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      highlights: highlights.map((h) => ({ title: h.title, body: h.body, image: h.image, filename: h.filename })),
    };

    try {
      const res = await fetch(form.dataset.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Could not save this frame.');
      window.location.href = '/admin/frames';
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
});
