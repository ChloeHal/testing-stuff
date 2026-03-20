const preview = document.getElementById('preview');
const wordInput = document.getElementById('wordInput');
const pauseBtn = document.getElementById('pauseBtn');
const fontSelectEl = document.getElementById('fontSelect');
const easingEl = document.getElementById('easing');

// Custom select logic
function initCustomSelect(el, onChange) {
  const trigger = el.querySelector('.custom-select-trigger');
  const options = el.querySelectorAll('.custom-select-option');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close all other selects
    document.querySelectorAll('.custom-select.open').forEach(s => {
      if (s !== el) s.classList.remove('open');
    });
    el.classList.toggle('open');
  });

  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = opt.dataset.value;
      el.dataset.value = val;
      trigger.textContent = opt.textContent;
      el.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      el.classList.remove('open');
      if (onChange) onChange(val);
    });
  });
}

// Close selects on outside click
document.addEventListener('click', () => {
  document.querySelectorAll('.custom-select.open').forEach(s => s.classList.remove('open'));
});

const controls = {
  wghtMin: document.getElementById('wghtMin'),
  wghtMax: document.getElementById('wghtMax'),
  gradMin: document.getElementById('gradMin'),
  gradMax: document.getElementById('gradMax'),
  slntMin: document.getElementById('slntMin'),
  slntMax: document.getElementById('slntMax'),
  rondMin: document.getElementById('rondMin'),
  rondMax: document.getElementById('rondMax'),
  speed: document.getElementById('speed'),
  size: document.getElementById('size'),
  letterOffset: document.getElementById('letterOffset'),
};

// Font configs: axis ranges and which axes are supported
const fontConfigs = {
  'Google Sans Flex': {
    axes: ['wght', 'GRAD', 'slnt', 'ROND'],
    ranges: {
      wght: [1, 1000], GRAD: [0, 100], slnt: [-10, 0], ROND: [0, 100]
    }
  },
  'Roboto Flex': {
    axes: ['wght', 'GRAD', 'slnt'],
    ranges: {
      wght: [100, 1000], GRAD: [-200, 150], slnt: [-10, 0]
    }
  }
};

function getFont() {
  return fontSelectEl.dataset.value;
}

function getEasing() {
  return easingEl.dataset.value;
}

function applyFontConfig(fontName) {
  const config = fontConfigs[fontName];
  if (!config) return;

  const r = config.ranges;
  if (r.wght) {
    controls.wghtMin.min = r.wght[0]; controls.wghtMin.max = r.wght[1];
    controls.wghtMax.min = r.wght[0]; controls.wghtMax.max = r.wght[1];
  }
  if (r.GRAD) {
    controls.gradMin.min = r.GRAD[0]; controls.gradMin.max = r.GRAD[1];
    controls.gradMax.min = r.GRAD[0]; controls.gradMax.max = r.GRAD[1];
    controls.gradMin.value = r.GRAD[0]; controls.gradMax.value = r.GRAD[1];
    values.gradMin.textContent = r.GRAD[0];
    values.gradMax.textContent = r.GRAD[1];
  }
  if (r.slnt) {
    controls.slntMin.min = r.slnt[0]; controls.slntMin.max = r.slnt[1];
    controls.slntMax.min = r.slnt[0]; controls.slntMax.max = r.slnt[1];
  }

  const hasRond = config.axes.includes('ROND');
  const rondRow = document.getElementById('rondRow');
  if (rondRow) rondRow.style.display = hasRond ? '' : 'none';

  preview.querySelectorAll('.letter').forEach(el => {
    el.style.fontFamily = `'${fontName}', sans-serif`;
  });
}

// Init custom selects
initCustomSelect(fontSelectEl, (val) => applyFontConfig(val));
initCustomSelect(easingEl);

const values = {
  wghtMin: document.getElementById('wghtMinVal'),
  wghtMax: document.getElementById('wghtMaxVal'),
  gradMin: document.getElementById('gradMinVal'),
  gradMax: document.getElementById('gradMaxVal'),
  slntMin: document.getElementById('slntMinVal'),
  slntMax: document.getElementById('slntMaxVal'),
  rondMin: document.getElementById('rondMinVal'),
  rondMax: document.getElementById('rondMaxVal'),
  speed: document.getElementById('speedVal'),
  size: document.getElementById('sizeVal'),
  letterOffset: document.getElementById('letterOffsetVal'),
};

// Sync displayed values
Object.keys(controls).forEach(key => {
  controls[key].addEventListener('input', () => {
    values[key].textContent = controls[key].value;
  });
});

// Build letter spans from word
function buildLetters(word) {
  preview.innerHTML = '';
  const fontName = getFont();
  for (const ch of word) {
    const span = document.createElement('span');
    span.className = 'letter';
    span.style.fontFamily = `'${fontName}', sans-serif`;
    if (ch === ' ') {
      span.innerHTML = '&nbsp;';
    } else {
      span.textContent = ch;
    }
    preview.appendChild(span);
  }
  updateSize();
}

function updateSize() {
  const size = controls.size.value + 'px';
  preview.querySelectorAll('.letter').forEach(el => {
    el.style.fontSize = size;
  });
}

wordInput.addEventListener('input', () => {
  const word = wordInput.value || 'A';
  buildLetters(word);
});

controls.size.addEventListener('input', updateSize);

// Easing functions: map t [0,1] → [0,1]
const easings = {
  linear: t => t,
  cubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  elastic: t => {
    if (t === 0 || t === 1) return t;
    return t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2 + 1;
  },
  bounce: t => {
    const bounceOut = t => {
      const n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    };
    return t < 0.5
      ? (1 - bounceOut(1 - 2 * t)) / 2
      : (1 + bounceOut(2 * t - 1)) / 2;
  },
};

function getPingPong(time, cycleDuration) {
  const raw = ((time % (cycleDuration * 2)) + cycleDuration * 2) % (cycleDuration * 2) / cycleDuration;
  return raw <= 1 ? raw : 2 - raw;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

let paused = false;
let startTime = performance.now();
let pauseTime = 0;

pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? 'Lecture' : 'Pause';
  pauseBtn.classList.toggle('paused', paused);
  if (paused) {
    pauseTime = performance.now();
  } else {
    startTime += performance.now() - pauseTime;
  }
});

function animate(now) {
  requestAnimationFrame(animate);
  if (paused) return;

  const letters = preview.querySelectorAll('.letter');
  if (letters.length === 0) return;

  const cycleDuration = parseFloat(controls.speed.value) * 1000;
  const letterOffsetRatio = parseFloat(controls.letterOffset.value) / 100;
  const easeFn = easings[getEasing()] || easings.cubic;

  const wghtMin = parseFloat(controls.wghtMin.value);
  const wghtMax = parseFloat(controls.wghtMax.value);
  const gradMin = parseFloat(controls.gradMin.value);
  const gradMax = parseFloat(controls.gradMax.value);
  const slntMin = parseFloat(controls.slntMin.value);
  const slntMax = parseFloat(controls.slntMax.value);
  const rondMin = parseFloat(controls.rondMin.value);
  const rondMax = parseFloat(controls.rondMax.value);

  const elapsed = now - startTime;
  const count = letters.length;

  letters.forEach((el, i) => {
    const letterPhase = count > 1 ? (i / (count - 1)) * letterOffsetRatio * cycleDuration : 0;
    const t = easeFn(getPingPong(elapsed + letterPhase, cycleDuration));

    const wght = lerp(wghtMin, wghtMax, t);
    const grad = lerp(gradMin, gradMax, t);
    const slnt = lerp(slntMin, slntMax, t);
    const rond = lerp(rondMin, rondMax, t);

    const config = fontConfigs[getFont()];
    let fvs = `"wght" ${wght}, "GRAD" ${grad}, "slnt" ${slnt}`;
    if (config && config.axes.includes('ROND')) {
      fvs += `, "ROND" ${rond}`;
    }
    el.style.fontVariationSettings = fvs;
  });
}

requestAnimationFrame(animate);
