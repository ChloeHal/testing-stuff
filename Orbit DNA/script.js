const DURATION = 6;
let currentPauseAngle = null; // null = playing

/* ── Build rung elements ─────────────────────────── */
function buildRungs(count) {
  document.documentElement.style.setProperty('--rung-count', count);
  const targets = [document.getElementById('dna'), document.getElementById('dna-icon')];
  targets.forEach(dna => { dna.innerHTML = ''; });
  const step = 180 / (count - 1);

  for (let i = 0; i < count; i++) {
    const k = i - (count - 1) / 2;
    const angle = k * step;
    const delay = -(((angle % 360) + 360) % 360) / 360 * DURATION;

    targets.forEach(dna => {
      const rung = document.createElement('div');
      rung.className = 'rung';
      rung.dataset.base = delay.toFixed(4);
      rung.style.setProperty('--mult', k);
      rung.style.setProperty('--delay', delay.toFixed(4) + 's');
      rung.innerHTML = '<div class="rod"></div><div class="ball ball-a"></div><div class="ball ball-b"></div>';
      dna.appendChild(rung);
    });
  }

  if (currentPauseAngle !== null) {
    pauseAt(currentPauseAngle);
  }
}

/* ── Generate @keyframes with hardcoded px ────────── */
function buildKeyframes() {
  const rod = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rod-length'));
  const p   = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--perspective'));
  const h   = rod / 2;

  const sFront = p / (p - h);
  const sBack  = p / (p + h);

  document.getElementById('kf').textContent = `
    @keyframes flat-a {
      0%   { transform: translate(-50%,-50%) translateZ(${h}px) rotateY(0deg)    scale(${sFront.toFixed(4)}); }
      25%  { transform: translate(-50%,-50%) translateZ(${h}px) rotateY(-90deg)  scale(1); }
      50%  { transform: translate(-50%,-50%) translateZ(${h}px) rotateY(-180deg) scale(${sBack.toFixed(4)}); }
      75%  { transform: translate(-50%,-50%) translateZ(${h}px) rotateY(-270deg) scale(1); }
      100% { transform: translate(-50%,-50%) translateZ(${h}px) rotateY(-360deg) scale(${sFront.toFixed(4)}); }
    }
    @keyframes flat-b {
      0%   { transform: translate(-50%,-50%) translateZ(${-h}px) rotateY(0deg)    scale(${sBack.toFixed(4)}); }
      25%  { transform: translate(-50%,-50%) translateZ(${-h}px) rotateY(-90deg)  scale(1); }
      50%  { transform: translate(-50%,-50%) translateZ(${-h}px) rotateY(-180deg) scale(${sFront.toFixed(4)}); }
      75%  { transform: translate(-50%,-50%) translateZ(${-h}px) rotateY(-270deg) scale(1); }
      100% { transform: translate(-50%,-50%) translateZ(${-h}px) rotateY(-360deg) scale(${sBack.toFixed(4)}); }
    }
  `;
}

/* ── Slider handlers ─────────────────────────────── */
function setVar(name, value, input) {
  document.documentElement.style.setProperty(name, value);
  input.closest('.control').querySelector('.val').textContent = value;
  if (name === '--rod-length' || name === '--perspective') buildKeyframes();
}

function setRungs(count, input) {
  input.closest('.control').querySelector('.val').textContent = count;
  buildRungs(count);
}

/* ── Pause / Play ───────────────────────────────── */
function setActiveBtn(id) {
  document.querySelectorAll('.pause-btns button').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function togglePlay() {
  if (currentPauseAngle === null) {
    currentPauseAngle = 'free';
    document.querySelectorAll('.scene').forEach(s => s.classList.add('paused'));
    document.getElementById('btn-play').textContent = 'Play';
  } else {
    document.querySelectorAll('.rung').forEach(rung => {
      rung.style.setProperty('--delay', rung.dataset.base + 's');
    });
    document.body.classList.add('reset-anim');
    void document.body.offsetWidth;
    document.body.classList.remove('reset-anim');
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('paused'));
    currentPauseAngle = null;
    document.getElementById('btn-play').textContent = 'Pause';
  }
  setActiveBtn('btn-play');
}

function pauseAt(angle) {
  currentPauseAngle = angle;
  const shift = -(angle / 360) * DURATION;
  document.querySelectorAll('.rung').forEach(rung => {
    const base = parseFloat(rung.dataset.base);
    rung.style.setProperty('--delay', (base + shift) + 's');
  });
  document.querySelectorAll('.scene').forEach(s => s.classList.remove('paused'));
  document.body.classList.add('reset-anim');
  void document.body.offsetWidth;
  document.body.classList.remove('reset-anim');
  document.querySelectorAll('.scene').forEach(s => s.classList.add('paused'));
  document.getElementById('btn-play').textContent = 'Play';
  setActiveBtn('btn-' + angle);
}

/* ── Icon scale ────────────────────────────────── */
function setIconScale(val) {
  const s = val / 100;
  const scene = document.getElementById('icon-scene');
  scene.style.transform = `scale(${s})`;
  const orig = scene.offsetWidth;
  const margin = orig * (s - 1) / 2;
  scene.style.margin = `${margin}px`;
  document.getElementById('icon-scale-val').textContent = val + '%';
}

/* ── Init ────────────────────────────────────────── */
buildKeyframes();
buildRungs(5);
setIconScale(30);
