/* ════════════════════════════════════════════════════
   Numvexa — PDF Tools shared helpers
   Loaded ONLY on /pdf-tools/*.html tool pages.
   Every identifier below is prefixed "pdftools" so it can
   never collide with anything in the site's script.js.
   This file does not modify or depend on script.js.
════════════════════════════════════════════════════ */
'use strict';

function pdftoolsFormatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  var units = ['B', 'KB', 'MB', 'GB'];
  var i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  var val = bytes / Math.pow(1024, i);
  return (i === 0 ? val : val.toFixed(val < 10 ? 2 : 1)) + ' ' + units[i];
}

/* Wires click-to-browse + drag & drop on a dropzone element.
   onFiles(fileArray) is called whenever new files are picked/dropped. */
function pdftoolsSetupDropzone(dropzoneEl, inputEl, onFiles) {
  if (!dropzoneEl || !inputEl) return;
  dropzoneEl.addEventListener('click', function (e) {
    if (e.target.closest('.pdftools-file-remove')) return;
    inputEl.click();
  });
  inputEl.addEventListener('change', function (e) {
    if (e.target.files && e.target.files.length) onFiles(Array.from(e.target.files));
    e.target.value = '';
  });
  ['dragenter', 'dragover'].forEach(function (evt) {
    dropzoneEl.addEventListener(evt, function (e) {
      e.preventDefault(); e.stopPropagation();
      dropzoneEl.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    dropzoneEl.addEventListener(evt, function (e) {
      e.preventDefault(); e.stopPropagation();
      dropzoneEl.classList.remove('dragover');
    });
  });
  dropzoneEl.addEventListener('drop', function (e) {
    var dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) onFiles(Array.from(dt.files));
  });
}

function pdftoolsShowStatus(el, msg) {
  if (!el) return;
  var span = el.querySelector('span:last-child');
  if (span) span.textContent = msg;
  el.classList.add('show');
}
function pdftoolsHideStatus(el) { if (el) el.classList.remove('show'); }

function pdftoolsShowError(el, msg) {
  if (!el) return;
  el.textContent = '⚠️ ' + msg;
  el.classList.add('show');
}
function pdftoolsHideError(el) { if (el) el.classList.remove('show'); }

function pdftoolsShowResult(el) { if (el) el.classList.add('show'); }
function pdftoolsHideResult(el) { if (el) el.classList.remove('show'); }

/* Builds a styled download link for a Blob result. Caller appends it
   into a .pdftools-result-files container. */
function pdftoolsMakeDownloadLink(blob, filename, label) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.className = 'btn-primary';
  a.href = url;
  a.download = filename;
  a.textContent = label || ('⬇ Download ' + filename);
  a.style.display = 'inline-flex';
  a.style.alignItems = 'center';
  a.style.gap = '.4rem';
  a.style.width = 'fit-content';
  return a;
}

/* Reads a File as an HTMLImageElement (resolves with the loaded image + an
   object URL that the caller is responsible for revoking later). */
function pdftoolsLoadImage(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () { resolve({ img: img, url: url, width: img.naturalWidth, height: img.naturalHeight }); };
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Could not read "' + file.name + '" — the file may be corrupted or not a valid image.')); };
    img.src = url;
  });
}

/* Reads a File as an ArrayBuffer (used for PDF inputs with pdf-lib / pdf.js). */
function pdftoolsReadAsArrayBuffer(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () { resolve(new Uint8Array(reader.result)); };
    reader.onerror = function () { reject(new Error('Could not read "' + file.name + '".')); };
    reader.readAsArrayBuffer(file);
  });
}
