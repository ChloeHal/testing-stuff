// === Perlin Noise (improved, classic implementation) ===
const perm = new Uint8Array(512);
const grad3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
];

function seed(s) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  // Fisher-Yates with seed
  let m = s;
  for (let i = 255; i > 0; i--) {
    m = (m * 16807 + 0) % 2147483647;
    const j = m % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + t * (b - a); }

function perlin2(x, y) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = perm[perm[X] + Y];
  const ab = perm[perm[X] + Y + 1];
  const ba = perm[perm[X + 1] + Y];
  const bb = perm[perm[X + 1] + Y + 1];

  const dot = (g, x, y) => grad3[g % 12][0] * x + grad3[g % 12][1] * y;

  return lerp(
    lerp(dot(aa, xf, yf), dot(ba, xf - 1, yf), u),
    lerp(dot(ab, xf, yf - 1), dot(bb, xf - 1, yf - 1), u),
    v
  );
}

function perlin3(x, y, z) {
  // Simple 3D via 2D slices
  const a = perlin2(x + z * 31.7, y + z * 17.3);
  const b = perlin2(x + z * 47.1 + 100, y + z * 23.9 + 100);
  return (a + b) * 0.5;
}

function fbm(x, y, z, octaves, persistence, lacunarity) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * perlin3(x * frequency, y * frequency, z);
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return value / maxValue;
}

// === DOM ===
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colCanvas = document.querySelector('.col-canvas');

const ctrl = {
  octaves: document.getElementById('octaves'),
  persistence: document.getElementById('persistence'),
  frequency: document.getElementById('frequency'),
  lacunarity: document.getElementById('lacunarity'),
  speed: document.getElementById('speed'),
  resolution: document.getElementById('resolution'),
};

const vals = {
  octaves: document.getElementById('octavesVal'),
  persistence: document.getElementById('persistenceVal'),
  frequency: document.getElementById('frequencyVal'),
  lacunarity: document.getElementById('lacunarityVal'),
  speed: document.getElementById('speedVal'),
  resolution: document.getElementById('resolutionVal'),
};

Object.keys(ctrl).forEach(key => {
  ctrl[key].addEventListener('input', () => {
    const v = parseFloat(ctrl[key].value);
    vals[key].textContent = Number.isInteger(v) ? v : v.toFixed(key === 'persistence' || key === 'speed' ? 2 : 1);
  });
});

const colorA = document.getElementById('colorA');
const colorB = document.getElementById('colorB');

// Custom select
const renderModeEl = document.getElementById('renderMode');
function initCustomSelect(el, onChange) {
  const trigger = el.querySelector('.custom-select-trigger');
  const options = el.querySelectorAll('.custom-select-option');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.custom-select.open').forEach(s => {
      if (s !== el) s.classList.remove('open');
    });
    el.classList.toggle('open');
  });
  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      el.dataset.value = opt.dataset.value;
      trigger.textContent = opt.textContent;
      el.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      el.classList.remove('open');
      if (onChange) onChange(opt.dataset.value);
    });
  });
}
document.addEventListener('click', () => {
  document.querySelectorAll('.custom-select.open').forEach(s => s.classList.remove('open'));
});
initCustomSelect(renderModeEl);

// Pause
const pauseBtn = document.getElementById('pauseBtn');
let paused = false;
pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? 'Lecture' : 'Pause';
  pauseBtn.classList.toggle('paused', paused);
  if (!paused) {
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }
});

// Random seed
let currentSeed = Math.floor(Math.random() * 100000);
seed(currentSeed);

document.getElementById('randomBtn').addEventListener('click', () => {
  currentSeed = Math.floor(Math.random() * 100000);
  seed(currentSeed);
});

// Export
document.getElementById('exportBtn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'perlin-noise.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Resize
let w, h;
function resize() {
  const rect = colCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  w = rect.width;
  h = rect.height;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// Color helpers
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Render
let zOffset = 0;
let lastTime = performance.now();

function render() {
  const octaves = parseInt(ctrl.octaves.value);
  const persistence = parseFloat(ctrl.persistence.value);
  const freq = parseFloat(ctrl.frequency.value);
  const lac = parseFloat(ctrl.lacunarity.value);
  const res = parseInt(ctrl.resolution.value);
  const mode = renderModeEl.dataset.value;
  const cA = hexToRgb(colorA.value);
  const cB = hexToRgb(colorB.value);

  const cols = Math.ceil(w / res);
  const rows = Math.ceil(h / res);
  const imageData = ctx.createImageData(cols, rows);
  const data = imageData.data;

  for (let py = 0; py < rows; py++) {
    for (let px = 0; px < cols; px++) {
      const nx = (px / cols) * freq;
      const ny = (py / rows) * freq;
      let n = fbm(nx, ny, zOffset, octaves, persistence, lac);

      // Normalize from [-1,1] to [0,1]
      n = n * 0.5 + 0.5;
      n = Math.max(0, Math.min(1, n));

      let r, g, b;

      if (mode === 'gradient') {
        [r, g, b] = lerpColor(cA, cB, n);
      } else if (mode === 'mono') {
        const v = Math.round(n * 255);
        r = g = b = v;
      } else if (mode === 'hue') {
        [r, g, b] = hslToRgb(n * 360, 80, 55);
      } else if (mode === 'contour') {
        const lines = 12;
        const edge = Math.abs(Math.sin(n * lines * Math.PI));
        const v = edge < 0.15 ? 0 : 1;
        [r, g, b] = lerpColor(cA, cB, v);
      } else if (mode === 'wood') {
        const grain = (n * 20) % 1;
        [r, g, b] = lerpColor(cA, cB, grain);
      } else if (mode === 'flow') {
        // Flow field: use noise as angle, draw as directional brightness
        const angle = n * Math.PI * 2;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        // Second noise layer for intensity
        const intensity = fbm(nx + 100, ny + 100, zOffset, Math.max(1, octaves - 1), persistence, lac) * 0.5 + 0.5;
        const bright = (dx * 0.5 + 0.5) * intensity;
        [r, g, b] = lerpColor(cA, cB, Math.max(0, Math.min(1, bright)));
      }

      const idx = (py * cols + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  // Draw scaled up
  const offscreen = new OffscreenCanvas(cols, rows);
  const offCtx = offscreen.getContext('2d');
  offCtx.putImageData(imageData, 0, 0);

  ctx.imageSmoothingEnabled = res <= 2;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(offscreen, 0, 0, w, h);
}

function loop(now) {
  if (paused) return;

  const dt = (now - lastTime) / 1000;
  lastTime = now;

  const speed = parseFloat(ctrl.speed.value);
  zOffset += dt * speed;

  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
