document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cover-image-form');
  if (!form) return;

  const fileInput = document.getElementById('cover-image-input');
  const preview = document.getElementById('cover-image-preview');
  const errorBox = document.getElementById('cover-image-error');
  const successBox = document.getElementById('cover-image-success');
  let dataBase64 = null;
  let filename = null;

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      dataBase64 = await fileToBase64(file);
      filename = file.name;
      if (preview) {
        preview.src = dataBase64;
        preview.hidden = false;
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBox) errorBox.hidden = true;
    if (successBox) successBox.hidden = true;
    if (!dataBase64) {
      if (errorBox) { errorBox.textContent = 'Choose an image first.'; errorBox.hidden = false; }
      return;
    }
    const submitBtn = form.querySelector('button[type=submit]');
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Uploading…';

    try {
      const res = await fetch('/admin/api/settings/cover-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataBase64, filename }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Could not upload this image.');
      if (successBox) { successBox.textContent = 'Cover image updated.'; successBox.hidden = false; }
    } catch (err) {
      if (errorBox) { errorBox.textContent = err.message; errorBox.hidden = false; }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
});
