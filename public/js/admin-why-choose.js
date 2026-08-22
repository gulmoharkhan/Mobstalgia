document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.why-choose-input');
  if (!inputs.length) return;

  const successBox = document.getElementById('why-choose-success');

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  inputs.forEach((input) => {
    input.addEventListener('change', async () => {
      const index = Number(input.dataset.index);
      const file = input.files && input.files[0];
      if (!file) return;

      const errorBox = document.getElementById(`why-choose-error-${index}`);
      const preview = document.getElementById(`why-choose-preview-${index}`);
      if (errorBox) errorBox.hidden = true;
      if (successBox) successBox.hidden = true;

      const dataBase64 = await fileToBase64(file);
      if (preview) {
        preview.src = dataBase64;
        preview.hidden = false;
      }

      try {
        const res = await fetch('/admin/api/settings/why-choose-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index, dataBase64, filename: file.name }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Could not upload this image.');
        if (preview && result.url) preview.src = result.url;
        if (successBox) { successBox.textContent = 'Block image updated.'; successBox.hidden = false; }
      } catch (err) {
        if (errorBox) { errorBox.textContent = err.message; errorBox.hidden = false; }
      }
    });
  });
});
