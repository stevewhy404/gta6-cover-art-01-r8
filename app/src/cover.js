// Coral Bay Cover Studio — cover renderer (canvas 2D, deterministic, no network).
// Layouts: hero | split | triptych | grid. Grades: vice | neon | golden | midnight.

export const GRADES = {
  vice: {
    name: 'Vice Sunset',
    stops: ['#ff2e88', '#ff9a3d'],
    tint: 'rgba(255, 46, 136, 0.20)',
    band: '#200b38',
    ink: '#ffffff',
  },
  neon: {
    name: 'Neon Nights',
    stops: ['#00e5ff', '#7b2ff7'],
    tint: 'rgba(0, 229, 255, 0.18)',
    band: '#0a1030',
    ink: '#ffffff',
  },
  golden: {
    name: 'Golden Hour',
    stops: ['#ffb347', '#ff6b35'],
    tint: 'rgba(255, 179, 71, 0.20)',
    band: '#2b1503',
    ink: '#ffffff',
  },
  midnight: {
    name: 'Midnight',
    stops: ['#0f2027', '#2c5364'],
    tint: 'rgba(15, 32, 39, 0.28)',
    band: '#08131c',
    ink: '#dff4ff',
  },
};

export const LAYOUTS = ['hero', 'split', 'triptych', 'grid'];

function coverFit(ctx, img, x, y, w, h, zoom, panX, panY) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = x + (w - dw) / 2 + (panX / 100) * w * 0.25;
  const dy = y + (h - dh) / 2 + (panY / 100) * h * 0.25;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function gradeWash(ctx, w, h, grade, alpha) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, GRADES[grade].stops[0]);
  g.addColorStop(1, GRADES[grade].stops[1]);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function bottomFade(ctx, w, h, color, fromY) {
  const g = ctx.createLinearGradient(0, fromY, 0, h);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, fromY, w, h - fromY);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBadge(ctx, text, x, y, h, grade) {
  if (!text) return;
  const pad = h * 0.42;
  ctx.save();
  ctx.font = `${Math.round(h * 0.62)}px "Bebas Neue", sans-serif`;
  try { ctx.letterSpacing = '3px'; } catch (e) { /* older canvas */ }
  const tw = ctx.measureText(text.toUpperCase()).width;
  const w = tw + pad * 2;
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, GRADES[grade].stops[0]);
  g.addColorStop(1, GRADES[grade].stops[1]);
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), x + pad, y + h / 2 + h * 0.03);
  ctx.restore();
}

function drawTitle(ctx, text, x, y, size, maxW, align, color) {
  ctx.save();
  ctx.font = `${Math.round(size)}px Anton, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  try { ctx.letterSpacing = '1px'; } catch (e) { /* older canvas */ }
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = Math.max(3, size / 16);
  ctx.strokeText(text.toUpperCase(), x, y);
  ctx.fillStyle = color;
  ctx.fillText(text.toUpperCase(), x, y);
  ctx.restore();
}

function drawSubtitle(ctx, text, x, y, size, maxW, align, color) {
  if (!text) return;
  ctx.save();
  ctx.font = `${Math.round(size)}px Pacifico, cursive`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = Math.max(4, size / 6);
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function wrapLines(ctx, text, maxW) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? cur + ' ' + word : word;
    if (ctx.measureText(test).width <= maxW || !cur) cur = test;
    else { lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawHero(ctx, W, H, o) {
  coverFit(ctx, o.photo, 0, 0, W, H, o.zoom, o.panX, o.panY);
  ctx.fillStyle = GRADES[o.grade].tint;
  ctx.fillRect(0, 0, W, H);
  bottomFade(ctx, W, H, GRADES[o.grade].band, H * 0.42);
  const m = W * 0.055;
  const titleSize = W * 0.115;
  drawTitle(ctx, o.title, m, H * 0.83, titleSize, W - 2 * m, 'left', GRADES[o.grade].ink);
  drawSubtitle(ctx, o.subtitle, m, H * 0.90, W * 0.042, W - 2 * m, 'left', '#ffe9c9');
  drawBadge(ctx, o.badge, W - m - W * 0.21, H * 0.055, H * 0.052, o.grade);
}

function drawSplit(ctx, W, H, o) {
  const splitX = Math.round(W * 0.56);
  coverFit(ctx, o.photo, 0, 0, splitX, H, o.zoom, o.panX, o.panY);
  const g = ctx.createLinearGradient(splitX, 0, W, H);
  g.addColorStop(0, GRADES[o.grade].stops[0]);
  g.addColorStop(1, GRADES[o.grade].stops[1]);
  ctx.fillStyle = g;
  ctx.fillRect(splitX, 0, W - splitX, H);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(splitX, 0, 4, H);
  const cx = splitX + (W - splitX) / 2;
  const maxW = (W - splitX) * 0.82;
  ctx.save();
  ctx.font = `${Math.round(W * 0.075)}px Anton, sans-serif`;
  const lines = wrapLines(ctx, o.title.toUpperCase(), maxW);
  ctx.restore();
  const lineH = W * 0.082;
  const blockH = lines.length * lineH;
  let y = H / 2 - blockH / 2 + lineH * 0.72;
  for (const line of lines) {
    drawTitle(ctx, line, cx, y, W * 0.075, maxW, 'center', GRADES[o.grade].ink);
    y += lineH;
  }
  drawSubtitle(ctx, o.subtitle, cx, y + W * 0.045, W * 0.038, maxW, 'center', '#ffe9c9');
  drawBadge(ctx, o.badge, cx - W * 0.085, H * 0.07, H * 0.05, o.grade);
}

function drawTriptych(ctx, W, H, o) {
  const gap = Math.round(W * 0.012);
  const colW = Math.round((W - gap * 2) / 3);
  const topH = Math.round(H * 0.68);
  const zooms = [1.15, 1.0, 1.25];
  const pans = [[-18, 0], [0, -6], [16, 8]];
  for (let i = 0; i < 3; i++) {
    const x = i * (colW + gap);
    coverFit(ctx, o.photo, x, 0, colW, topH, o.zoom * zooms[i], o.panX + pans[i][0], o.panY + pans[i][1]);
  }
  ctx.fillStyle = GRADES[o.grade].tint;
  ctx.fillRect(0, 0, W, topH);
  ctx.fillStyle = GRADES[o.grade].band;
  ctx.fillRect(0, topH, W, H - topH);
  const bandY = topH + (H - topH) * 0.42;
  drawTitle(ctx, o.title, W / 2, bandY, W * 0.085, W * 0.9, 'center', GRADES[o.grade].ink);
  drawSubtitle(ctx, o.subtitle, W / 2, bandY + W * 0.062, W * 0.038, W * 0.9, 'center', '#ffe9c9');
  drawBadge(ctx, o.badge, W * 0.05, H * 0.045, H * 0.05, o.grade);
}

function drawGrid(ctx, W, H, o) {
  ctx.fillStyle = '#0c0616';
  ctx.fillRect(0, 0, W, H);
  const gap = Math.round(W * 0.012);
  const tile = Math.round((W - gap) / 2);
  const bandH = Math.round(H * 0.24);
  const tiles = [
    { x: 0, y: bandH, z: 1.3, p: [-22, -14] },
    { x: tile + gap, y: bandH, z: 1.1, p: [20, 6] },
    { x: 0, y: bandH + tile + gap, z: 1.0, p: [0, 18] },
    { x: tile + gap, y: bandH + tile + gap, z: 1.45, p: [14, -20] },
  ];
  for (const t of tiles) {
    coverFit(ctx, o.photo, t.x, t.y, tile, tile, o.zoom * t.z, o.panX + t.p[0], o.panY + t.p[1]);
  }
  ctx.fillStyle = GRADES[o.grade].tint;
  ctx.fillRect(0, bandH, W, H - bandH);
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, GRADES[o.grade].stops[0]);
  g.addColorStop(1, GRADES[o.grade].stops[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, bandH);
  // Anton's ascent is ~0.95em, so a 0.082W title on a 0.52*bandH baseline
  // clipped its caps at the top edge (seen in shot 4). Smaller title, lower baseline.
  drawTitle(ctx, o.title, W * 0.05, bandH * 0.62, W * 0.072, W * 0.9, 'left', '#ffffff');
  drawSubtitle(ctx, o.subtitle, W * 0.05, bandH * 0.88, W * 0.034, W * 0.9, 'left', '#ffe9c9');
  drawBadge(ctx, o.badge, W - W * 0.05 - W * 0.19, H - H * 0.075, H * 0.048, o.grade);
}

const LAYOUT_DRAW = { hero: drawHero, split: drawSplit, triptych: drawTriptych, grid: drawGrid };

export function renderCover(canvas, opts) {
  const o = {
    layout: 'hero',
    grade: 'vice',
    title: 'Coral Bay',
    subtitle: '',
    badge: '',
    zoom: 1,
    panX: 0,
    panY: 0,
    ...opts,
  };
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);
  if (!o.photo) {
    ctx.fillStyle = '#888888';
    ctx.font = `${Math.round(W * 0.03)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('No photo — pick a sample or upload one', W / 2, H / 2);
    return;
  }
  LAYOUT_DRAW[o.layout](ctx, W, H, o);
}

export function renderCoverToBlob(opts, width, height) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    renderCover(canvas, opts);
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG export failed'));
    }, 'image/png');
  });
}
