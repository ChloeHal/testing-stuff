const TRACKS = {
  top_p1:    [{ t: 0, x: 4, y: 4 },   { t: 0.38, x: 24, y: 4 },  { t: 1, x: 25, y: 4 }],
  top_p2:    [{ t: 0, x: 24, y: 4 },   { t: 0.38, x: 24, y: 4 },  { t: 1, x: 25, y: 4 }],
  left_p1:   [{ t: 0, x: 4, y: 24 },   { t: 0.38, x: 4, y: 24 },  { t: 1, x: 2, y: 13 }],
  left_p2:   [{ t: 0, x: 4, y: 4 },    { t: 0.38, x: 4, y: 24 },  { t: 1, x: 2, y: 13 }],
  right_p1:  [{ t: 0, x: 24, y: 4 },   { t: 0.35, x: 24, y: 4 },  { t: 0.45, x: 23, y: 6 },  { t: 1, x: 10, y: 21 }],
  right_p2:  [{ t: 0, x: 24, y: 24 },  { t: 0.35, x: 24, y: 24 }, { t: 0.45, x: 24, y: 20 }, { t: 1, x: 25, y: 4 }],
  bottom_p1: [{ t: 0, x: 24, y: 24 },  { t: 0.35, x: 24, y: 24 }, { t: 0.45, x: 20, y: 24 }, { t: 1, x: 2, y: 13 }],
  bottom_p2: [{ t: 0, x: 4, y: 24 },   { t: 0.35, x: 4, y: 24 },  { t: 0.45, x: 6, y: 23 },  { t: 1, x: 10, y: 21 }],
};

const NS = "http://www.w3.org/2000/svg";
let slow = false;

function sampleTrack(track, t) {
  if (t <= track[0].t) return { x: track[0].x, y: track[0].y };
  if (t >= track[track.length - 1].t) return { x: track[track.length - 1].x, y: track[track.length - 1].y };
  let i = 0;
  while (i < track.length - 1 && track[i + 1].t < t) i++;
  const a = track[i], b = track[i + 1];
  const s = (t - a.t) / (b.t - a.t);
  const smooth = s * s * (3 - 2 * s);
  return { x: a.x + (b.x - a.x) * smooth, y: a.y + (b.y - a.y) * smooth };
}

function getLines(t) {
  const s = (n) => sampleTrack(TRACKS[n], t);
  return {
    top:    { x1: s("top_p1").x,    y1: s("top_p1").y,    x2: s("top_p2").x,    y2: s("top_p2").y },
    right:  { x1: s("right_p1").x,  y1: s("right_p1").y,  x2: s("right_p2").x,  y2: s("right_p2").y },
    bottom: { x1: s("bottom_p1").x, y1: s("bottom_p1").y, x2: s("bottom_p2").x, y2: s("bottom_p2").y },
    left:   { x1: s("left_p1").x,   y1: s("left_p1").y,   x2: s("left_p2").x,   y2: s("left_p2").y },
  };
}

function lineLen(l) {
  return Math.sqrt((l.x2 - l.x1) ** 2 + (l.y2 - l.y1) ** 2);
}

function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

/* ── Per-task checkbox instance ──────────────── */
function initCheckbox(row) {
  const svg = row.querySelector("svg");
  const label = row.querySelector(".task-label");
  const lines = {};
  let checked = false;
  let progress = 0;
  let animId = null;

  ["top", "right", "bottom", "left"].forEach(name => {
    const line = document.createElementNS(NS, "line");
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);
    lines[name] = line;
  });

  function render(t) {
    const data = getLines(t);
    const r = Math.round(212 + (22 - 212) * t);
    const g = Math.round(212 + (163 - 212) * t);
    const b = Math.round(216 + (74 - 216) * t);
    const color = `rgb(${r},${g},${b})`;
    const sw = 1.8 + 0.5 * t;

    for (const [name, l] of Object.entries(data)) {
      const el = lines[name];
      el.setAttribute("x1", l.x1);
      el.setAttribute("y1", l.y1);
      el.setAttribute("x2", l.x2);
      el.setAttribute("y2", l.y2);
      el.setAttribute("stroke", color);
      el.setAttribute("stroke-width", sw);
      if (name === "top" || name === "left") {
        el.setAttribute("opacity", Math.min(1, lineLen(l) / 3));
      }
    }
  }

  function animate() {
    if (animId) cancelAnimationFrame(animId);
    const duration = slow ? 1800 : 700;
    const startTime = performance.now();
    const startVal = progress;
    const endVal = checked ? 1 : 0;

    function tick(now) {
      const rawT = Math.min((now - startTime) / duration, 1);
      progress = startVal + (endVal - startVal) * easeInOutQuart(rawT);
      render(progress);
      if (rawT < 1) animId = requestAnimationFrame(tick);
    }
    animId = requestAnimationFrame(tick);
  }

  row.addEventListener("click", () => {
    checked = !checked;
    label.classList.toggle("done", checked);
    animate();
  });

  render(0);
}

/* ── Init all tasks ──────────────────────────── */
document.querySelectorAll("[data-task]").forEach(initCheckbox);

/* ── Slow motion toggle ──────────────────────── */
const switchBtn = document.getElementById("slow-switch");
switchBtn.addEventListener("click", () => {
  slow = !slow;
  switchBtn.classList.toggle("on", slow);
  document.body.classList.toggle("slow", slow);
});
