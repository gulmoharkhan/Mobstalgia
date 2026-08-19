(function () {
  var table = document.getElementById('frames-table');
  if (!table) return;

  var selectAll = document.getElementById('select-all-frames');
  var bulkBar = document.getElementById('bulk-bar');
  var bulkCount = document.getElementById('bulk-count');
  var deleteBtn = document.getElementById('bulk-delete-btn');
  var clearBtn = document.getElementById('bulk-clear-btn');

  function checkboxes() {
    return Array.prototype.slice.call(table.querySelectorAll('.frame-select'));
  }

  function selected() {
    return checkboxes().filter(function (cb) {
      return cb.checked;
    });
  }

  function updateBar() {
    var all = checkboxes();
    var n = selected().length;
    bulkBar.hidden = n === 0;
    bulkCount.textContent = n + (n === 1 ? ' selected' : ' selected');
    selectAll.checked = all.length > 0 && n === all.length;
    selectAll.indeterminate = n > 0 && n < all.length;
  }

  table.addEventListener('change', function (e) {
    if (e.target.classList.contains('frame-select')) updateBar();
  });

  selectAll.addEventListener('change', function () {
    checkboxes().forEach(function (cb) {
      cb.checked = selectAll.checked;
    });
    updateBar();
  });

  clearBtn.addEventListener('click', function () {
    checkboxes().forEach(function (cb) {
      cb.checked = false;
    });
    updateBar();
  });

  deleteBtn.addEventListener('click', function () {
    var ids = selected().map(function (cb) {
      return Number(cb.value);
    });
    if (!ids.length) return;

    var msg =
      ids.length === 1 ? 'Delete this frame? This cannot be undone.' : 'Delete these ' + ids.length + ' frames? This cannot be undone.';
    if (!confirm(msg)) return;

    deleteBtn.disabled = true;
    var originalLabel = deleteBtn.textContent;
    deleteBtn.textContent = 'Deleting…';

    fetch('/admin/api/frames/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ids }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || 'Something went wrong.');
          return data;
        });
      })
      .then(function () {
        window.location.reload();
      })
      .catch(function (err) {
        alert(err.message || 'Could not delete the selected frames.');
        deleteBtn.disabled = false;
        deleteBtn.textContent = originalLabel;
      });
  });

  updateBar();
})();
