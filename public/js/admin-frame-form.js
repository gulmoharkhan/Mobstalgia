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
