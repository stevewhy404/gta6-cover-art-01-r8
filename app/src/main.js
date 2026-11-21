// Coral Bay Cover Studio — editor wiring (no network, no randomness).
import { renderCover, renderCoverToBlob } from './cover.js';

const params = new URLSearchParams(location.search);

if (params.has('shot')) {
  const { runShot } = await import('./shots.js');
  runShot(params);
} else {
  initEditor();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image: ' + src));
    img.src = src;
  });
}

function initEditor() {
  const canvas = document.getElementById('cover');
  const status = document.getElementById('status');
  const SAMPLES = { boulevard: 'samples/boulevard.jpg', pier: 'samples/pier.jpg' };

  const state = {
    layout: 'hero',
    grade: 'vice',
    photoName: 'boulevard',
    photo: null,
    uploaded: null,
    title: 'Coral Bay',
    subtitle: 'A Vice City story',
    badge: 'GTA VI',
    zoom: 1,
    panX: 0,
    panY: 0,
  };

  function render() {
    renderCover(canvas, { ...state, photo: state.uploaded || state.photo });
  }

  function markActive(container, button) {
    container.querySelectorAll('.choice').forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
  }

  // Text inputs — live re-render.
  for (const [id, key] of [['title', 'title'], ['subtitle', 'subtitle'], ['badge', 'badge']]) {
    document.getElementById(id).addEventListener('input', (e) => {
      state[key] = e.target.value;
      render();
    });
  }

  // Layout picker.
  const layouts = document.getElementById('layouts');
  layouts.addEventListener('click', (e) => {
    const b = e.target.closest('[data-layout]');
    if (!b) return;
    state.layout = b.dataset.layout;
    markActive(layouts, b);
    render();
  });

  // Grade picker.
  const grades = document.getElementById('grades');
  grades.addEventListener('click', (e) => {
    const b = e.target.closest('[data-grade]');
    if (!b) return;
    state.grade = b.dataset.grade;
    markActive(grades, b);
    render();
  });

  // Photo picker + upload.
  const photos = document.getElementById('photos');
  photos.addEventListener('click', (e) => {
    const b = e.target.closest('[data-photo]');
    if (!b) return;
    state.photoName = b.dataset.photo;
    state.uploaded = null;
    state.photo = null;
    markActive(photos, b);
    loadImage(SAMPLES[state.photoName]).then((img) => { state.photo = img; render(); });
  });
  document.getElementById('upload').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      loadImage(reader.result).then((img) => {
        state.uploaded = img;
        photos.querySelectorAll('.choice').forEach((b) => b.classList.remove('active'));
        render();
        status.textContent = 'Photo loaded: ' + file.name;
      });
    };
    reader.readAsDataURL(file);
  });

  // Zoom / pan.
  document.getElementById('zoom').addEventListener('input', (e) => {
    state.zoom = Number(e.target.value) / 100;
    render();
  });
  document.getElementById('panx').addEventListener('input', (e) => { state.panX = Number(e.target.value); render(); });
  document.getElementById('pany').addEventListener('input', (e) => { state.panY = Number(e.target.value); render(); });

  // Export.
  document.getElementById('export').addEventListener('click', async () => {
    const [w, h] = document.getElementById('size').value.split('x').map(Number);
    status.textContent = 'Rendering ' + w + ' × ' + h + '…';
    try {
      const blob = await renderCoverToBlob({ ...state, photo: state.uploaded || state.photo }, w, h);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'coral-bay-' + w + 'x' + h + '.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      status.textContent = 'Exported coral-bay-' + w + 'x' + h + '.png (' + (blob.size / 1024).toFixed(0) + ' KiB)';
    } catch (err) {
      status.textContent = 'Export failed: ' + err.message;
    }
  });

  // Load fonts, then the default photo, then render.
  Promise.all([
    document.fonts.load('40px Anton'),
    document.fonts.load('40px "Bebas Neue"'),
    document.fonts.load('40px Pacifico'),
    document.fonts.ready,
  ]).catch(() => {}).finally(() => {
    loadImage(SAMPLES.boulevard).then((img) => { state.photo = img; render(); });
  });
  render();
}
