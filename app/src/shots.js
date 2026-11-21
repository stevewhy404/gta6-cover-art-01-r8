// Coral Bay Cover Studio — deterministic ?shot= mode for screenshots.
// Query: ?shot=cover|editor&photo=boulevard|pier&caption=...&subtitle=...&badge=...
//   &layout=hero|split|triptych|grid&grade=vice|neon|golden|midnight&w=1080&h=1080
// Renders once fonts are ready, then sets document.title = 'shot-ready'.
import { renderCover } from './cover.js';

const SAMPLES = { boulevard: 'samples/boulevard.jpg', pier: 'samples/pier.jpg' };
const DEFAULT_SUBTITLES = {
  hero: 'A Vice City story',
  split: 'Two sides of the bay',
  triptych: 'Three acts, one city',
  grid: 'Every corner has a story',
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image: ' + src));
    img.src = src;
  });
}

export async function runShot(params) {
  const mode = params.get('shot') || 'cover';
  const photoName = params.get('photo') || 'boulevard';
  const title = params.get('caption') || 'Coral Bay';
  const layout = params.get('layout') || 'hero';
  const grade = params.get('grade') || 'vice';
  const subtitle = params.get('subtitle') || DEFAULT_SUBTITLES[layout] || '';
  const badge = params.get('badge') || 'GTA VI';
  const w = Number(params.get('w') || 1080);
  const h = Number(params.get('h') || 1080);

  const canvas = document.getElementById('cover');
  if (mode === 'cover') {
    document.body.classList.add('shot-cover');
    canvas.width = w;
    canvas.height = h;
  }

  try {
    await Promise.all([
      document.fonts.load('40px Anton'),
      document.fonts.load('40px "Bebas Neue"'),
      document.fonts.load('40px Pacifico'),
      document.fonts.ready,
    ]);
  } catch (e) { /* fall back to system fonts rather than failing the shot */ }

  const photo = await loadImage(SAMPLES[photoName] || SAMPLES.boulevard);
  renderCover(canvas, { photo, layout, grade, title, subtitle, badge, zoom: 1, panX: 0, panY: 0 });

  // Keep the editor controls in sync for editor shots.
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  setVal('title', title);
  setVal('subtitle', subtitle);
  setVal('badge', badge);
  document.querySelectorAll('#layouts [data-layout]').forEach((b) => b.classList.toggle('active', b.dataset.layout === layout));
  document.querySelectorAll('#grades [data-grade]').forEach((b) => b.classList.toggle('active', b.dataset.grade === grade));
  document.querySelectorAll('#photos [data-photo]').forEach((b) => b.classList.toggle('active', b.dataset.photo === photoName));

  document.title = 'shot-ready';
}
