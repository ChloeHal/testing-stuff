// ─── State ──────────────────────────────────────────────────

const state = {
  tool: "stitch",
  stitchColor: "#dc2626",
  threadColor: "#171717",
  stitchType: "cross",
  threadStyle: "solid",
  gridRows: 20,
  gridCols: 20,
  stitches: new Map(),      // key -> color
  stitchTypes: new Map(),   // key -> type
  threads: [],              // { from, to, color, style }
  threadStart: null,
};

let CELL_SIZE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 28;
const THREAD_SPREAD = 5;
const gridEl = document.getElementById("grid");
const canvas = document.getElementById("thread-canvas");
const ctx = canvas.getContext("2d");

const marqueeEl = document.createElement("div");
marqueeEl.className = "selection-marquee";
marqueeEl.style.display = "none";
document.querySelector(".editor").appendChild(marqueeEl);

// ─── Thread style dash patterns ─────────────────────────────

const THREAD_STYLE_DASHES = {
  solid:      [],
  dashed:     [8, 4],
  dotted:     [2, 3],
  "dash-dot": [8, 3, 2, 3],
  "long-dash":[14, 6],
};

function getThreadStyleDash(style) {
  return THREAD_STYLE_DASHES[style] || [];
}

// ─── Stitch SVG rendering ────────────────────────────────────

function stitchSVG(type, color) {
  const s = 22;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", s);
  svg.setAttribute("height", s);
  svg.setAttribute("viewBox", `0 0 ${s} ${s}`);
  svg.classList.add("stitch");

  function line(x1, y1, x2, y2, w) {
    const el = document.createElementNS(ns, "line");
    el.setAttribute("x1", x1); el.setAttribute("y1", y1);
    el.setAttribute("x2", x2); el.setAttribute("y2", y2);
    el.setAttribute("stroke", color);
    el.setAttribute("stroke-width", w || 2.2);
    el.setAttribute("stroke-linecap", "round");
    return el;
  }

  switch (type) {
    case "cross":
      svg.append(line(4, 4, 18, 18), line(18, 4, 4, 18));
      break;
    case "half-cross":
      svg.append(line(4, 18, 18, 4));
      break;
    case "quarter":
      svg.append(line(11, 11, 18, 4));
      break;
    case "knot": {
      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", 11); circle.setAttribute("cy", 11); circle.setAttribute("r", 3.5);
      circle.setAttribute("fill", color);
      const ring = document.createElementNS(ns, "circle");
      ring.setAttribute("cx", 11); ring.setAttribute("cy", 11); ring.setAttribute("r", 6);
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", color);
      ring.setAttribute("stroke-width", 1.2);
      ring.setAttribute("stroke-dasharray", "3.5 2");
      ring.setAttribute("stroke-linecap", "round");
      svg.append(circle, ring);
      break;
    }
    case "straight-h":
      svg.append(line(3, 11, 19, 11));
      break;
    case "straight-v":
      svg.append(line(11, 3, 11, 19));
      break;
    default:
      svg.append(line(4, 4, 18, 18), line(18, 4, 4, 18));
  }

  return svg;
}

// Draw a stitch on canvas for export
function drawStitchOnCanvas(c, cx, cy, type, color, half) {
  const h = half * 0.72;
  c.strokeStyle = color;
  c.lineWidth = 2;
  c.lineCap = "round";
  switch (type) {
    case "cross":
      c.beginPath();
      c.moveTo(cx - h, cy - h); c.lineTo(cx + h, cy + h);
      c.moveTo(cx + h, cy - h); c.lineTo(cx - h, cy + h);
      c.stroke();
      break;
    case "half-cross":
      c.beginPath();
      c.moveTo(cx - h, cy + h); c.lineTo(cx + h, cy - h);
      c.stroke();
      break;
    case "quarter":
      c.beginPath();
      c.moveTo(cx, cy); c.lineTo(cx + h, cy - h);
      c.stroke();
      break;
    case "knot":
      c.beginPath();
      c.arc(cx, cy, h * 0.55, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();
      break;
    case "straight-h":
      c.beginPath();
      c.moveTo(cx - h, cy); c.lineTo(cx + h, cy);
      c.stroke();
      break;
    case "straight-v":
      c.beginPath();
      c.moveTo(cx, cy - h); c.lineTo(cx, cy + h);
      c.stroke();
      break;
    default:
      c.beginPath();
      c.moveTo(cx - h, cy - h); c.lineTo(cx + h, cy + h);
      c.moveTo(cx + h, cy - h); c.lineTo(cx - h, cy + h);
      c.stroke();
  }
}

// ─── Custom cursors ─────────────────────────────────────────

function svgCursor(svg, hx = 12, hy = 12) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hx} ${hy}, crosshair`;
}

const CURSORS = {
  stitch:   svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'><line x1='5' y1='5' x2='19' y2='19'/><line x1='19' y1='5' x2='5' y2='19'/></svg>`),
  thread:   svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='19' cy='5' r='2'/><circle cx='5' cy='19' r='2'/><path d='M5 17A12 12 0 0 1 17 5'/></svg>`),
  rotate:   svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 4a8 8 0 1 1-5.5 2.5' fill='none' stroke='black' stroke-width='2'/><polygon points='4,3 6.5,7.5 9.5,4' fill='black'/></svg>`),
  move:     svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2'/><path d='M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2'/><path d='M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8'/><path d='M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'/></svg>`),
  moveGrab: svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4'/><path d='M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2'/><path d='M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5'/><path d='M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2'/><path d='M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0'/></svg>`),
  eraser:   svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21'/><path d='m5.082 11.09 8.828 8.828'/></svg>`, 12, 18),
  select:   svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='4' y='4' width='16' height='16' rx='1' stroke-dasharray='4 2'/></svg>`),
};

function updateCursor() {
  gridEl.style.cursor = CURSORS[state.tool] || "default";
}

// ─── History ────────────────────────────────────────────────

const history = [];
let historyIdx = -1;

function snapshot() {
  return {
    stitches: new Map(state.stitches),
    stitchTypes: new Map(state.stitchTypes),
    threads: state.threads.map(t => ({ from: [...t.from], to: [...t.to], color: t.color, style: t.style })),
  };
}

function pushHistory() {
  history.length = historyIdx + 1;
  history.push(snapshot());
  historyIdx++;
  if (history.length > 100) { history.shift(); historyIdx--; }
}

function restoreSnapshot(snap) {
  clearSelection();
  state.stitches = new Map(snap.stitches);
  state.stitchTypes = new Map(snap.stitchTypes || []);
  state.threads = snap.threads.map(t => ({ from: [...t.from], to: [...t.to], color: t.color, style: t.style }));
  state.threadStart = null;
  refreshAllStitches();
  redrawAll();
}

function undo() { if (historyIdx > 0) { historyIdx--; restoreSnapshot(history[historyIdx]); } }
function redo() { if (historyIdx < history.length - 1) { historyIdx++; restoreSnapshot(history[historyIdx]); } }

function resetAll() {
  state.stitches.clear();
  state.stitchTypes.clear();
  state.threads.length = 0;
  state.threadStart = null;
  refreshAllStitches();
  redrawAll();
  pushHistory();
}

// ─── Tool switching ──────────────────────────────────────────

function setTool(tool) {
  document.querySelectorAll(".tool-btn").forEach(b => b.classList.remove("active"));
  const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
  if (btn) btn.classList.add("active");
  state.tool = tool;
  state.threadStart = null;
  clearSelection();
  redrawAll();
  updateCursor();
}

// ─── Grid ───────────────────────────────────────────────────

function computeGridSize() {
  const editor = document.querySelector(".editor");
  state.gridCols = Math.floor(editor.clientWidth / CELL_SIZE);
  state.gridRows = Math.floor(editor.clientHeight / CELL_SIZE);
}

function buildGrid() {
  clearSelection();
  gridEl.style.gridTemplateColumns = `repeat(${state.gridCols}, var(--cell-size))`;
  gridEl.innerHTML = "";
  for (let r = 0; r < state.gridRows; r++) {
    for (let c = 0; c < state.gridCols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      gridEl.appendChild(cell);
    }
  }
  resizeCanvas();
  updateCursor();
}

function resizeCanvas() {
  canvas.width = gridEl.offsetWidth;
  canvas.height = gridEl.offsetHeight;
  redrawAll();
}

function cellCenter(r, c) {
  return { x: c * CELL_SIZE + CELL_SIZE / 2, y: r * CELL_SIZE + CELL_SIZE / 2 };
}

function getCell(r, c) {
  return gridEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
}

function inBounds(r, c) {
  return r >= 0 && r < state.gridRows && c >= 0 && c < state.gridCols;
}

// ─── Stitches ───────────────────────────────────────────────

function renderStitch(cell, color, type) {
  cell.innerHTML = "";
  const key = `${cell.dataset.row},${cell.dataset.col}`;
  if (!type) type = state.stitchTypes.get(key) || "cross";
  cell.appendChild(stitchSVG(type, color));
}

function clearStitch(cell) { cell.innerHTML = ""; }

function placeStitch(r, c, color, type) {
  if (!inBounds(r, c)) return;
  const key = `${r},${c}`;
  state.stitches.set(key, color || state.stitchColor);
  state.stitchTypes.set(key, type || state.stitchType);
  const cell = getCell(r, c);
  if (cell) renderStitch(cell, color || state.stitchColor, type || state.stitchType);
}

function refreshAllStitches() {
  document.querySelectorAll(".cell").forEach(cell => {
    const key = `${cell.dataset.row},${cell.dataset.col}`;
    if (state.stitches.has(key)) renderStitch(cell, state.stitches.get(key), state.stitchTypes.get(key));
    else clearStitch(cell);
  });
}

// ─── Thread spread computation ───────────────────────────────

function endpointKey(r, c) { return `${r},${c}`; }

function computeThreadOffsets() {
  const offsets = new Map();

  const segByPair = new Map();
  function pairKey(r1, c1, r2, c2) {
    const a = `${r1},${c1}`, b = `${r2},${c2}`;
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }
  state.threads.forEach((t, i) => {
    const pk = pairKey(t.from[0], t.from[1], t.to[0], t.to[1]);
    if (!segByPair.has(pk)) segByPair.set(pk, []);
    segByPair.get(pk).push(i);
  });

  for (const [pk, segs] of segByPair) {
    if (segs.length < 2) continue;
    const [a, b] = pk.split("|");
    const [r1, c1] = a.split(",").map(Number);
    const [r2, c2] = b.split(",").map(Number);
    const dx = c2 - c1, dy = r2 - r1;
    const len = Math.hypot(dx, dy);
    if (len === 0) continue;
    const nx = -dy / len, ny = dx / len;
    const n = segs.length;
    for (let i = 0; i < n; i++) {
      const idx = segs[i];
      const spread = (i - (n - 1) / 2) * THREAD_SPREAD;
      const ox = nx * spread, oy = ny * spread;
      if (!offsets.has(idx)) offsets.set(idx, { fromOff: { x: 0, y: 0 }, toOff: { x: 0, y: 0 } });
      const entry = offsets.get(idx);
      entry.fromOff = { x: ox, y: oy };
      entry.toOff = { x: ox, y: oy };
    }
  }

  const epSegs = new Map();
  state.threads.forEach((t, i) => {
    const fk = endpointKey(t.from[0], t.from[1]);
    const tk = endpointKey(t.to[0], t.to[1]);
    if (!epSegs.has(fk)) epSegs.set(fk, []);
    if (!epSegs.has(tk)) epSegs.set(tk, []);
    epSegs.get(fk).push({ idx: i, otherR: t.to[0], otherC: t.to[1] });
    epSegs.get(tk).push({ idx: i, otherR: t.from[0], otherC: t.from[1] });
  });

  for (const [key, segs] of epSegs) {
    if (segs.length < 2) continue;
    const dests = new Set(segs.map(s => `${s.otherR},${s.otherC}`));
    if (dests.size < 2) continue;
    const [kr, kc] = key.split(",").map(Number);
    segs.sort((a, b) => Math.atan2(a.otherR - kr, a.otherC - kc) - Math.atan2(b.otherR - kr, b.otherC - kc));
    const n = segs.length;
    for (let i = 0; i < n; i++) {
      const seg = segs[i];
      const spread = (i - (n - 1) / 2) * THREAD_SPREAD;
      const dx = seg.otherC - kc, dy = seg.otherR - kr;
      const len = Math.hypot(dx, dy);
      if (len === 0) continue;
      const perpX = -dy / len * spread, perpY = dx / len * spread;
      if (!offsets.has(seg.idx)) offsets.set(seg.idx, { fromOff: { x: 0, y: 0 }, toOff: { x: 0, y: 0 } });
      const entry = offsets.get(seg.idx);
      const td = state.threads[seg.idx];
      if (td.from[0] === kr && td.from[1] === kc) {
        entry.fromOff = { x: entry.fromOff.x + perpX, y: entry.fromOff.y + perpY };
      } else {
        entry.toOff = { x: entry.toOff.x + perpX, y: entry.toOff.y + perpY };
      }
    }
  }

  return offsets;
}

// ─── Chain finding for smooth thread paths ───────────────────

function findChains() {
  const threadsByGroup = new Map();
  state.threads.forEach((t, i) => {
    const gk = `${t.color}|${t.style || "solid"}`;
    if (!threadsByGroup.has(gk)) threadsByGroup.set(gk, []);
    threadsByGroup.get(gk).push(i);
  });

  const chains = [];
  const used = new Set();

  for (const [groupKey, indices] of threadsByGroup) {
    const [color, style] = groupKey.split("|");
    const adj = new Map();
    for (const i of indices) {
      const t = state.threads[i];
      const fk = endpointKey(t.from[0], t.from[1]);
      const tk = endpointKey(t.to[0], t.to[1]);
      if (!adj.has(fk)) adj.set(fk, []);
      if (!adj.has(tk)) adj.set(tk, []);
      adj.get(fk).push({ threadIdx: i, otherKey: tk });
      adj.get(tk).push({ threadIdx: i, otherKey: fk });
    }

    for (const startIdx of indices) {
      if (used.has(startIdx)) continue;
      const t0 = state.threads[startIdx];
      const fk = endpointKey(t0.from[0], t0.from[1]);
      let chainStart = fk;
      if ((adj.get(fk) || []).filter(a => !used.has(a.threadIdx)).length > 1) {
        const tk = endpointKey(t0.to[0], t0.to[1]);
        if ((adj.get(tk) || []).filter(a => !used.has(a.threadIdx)).length <= 1) chainStart = tk;
      }

      const points = [chainStart];
      let current = chainStart;
      while (true) {
        const neighbors = (adj.get(current) || []).filter(a => !used.has(a.threadIdx));
        if (neighbors.length === 0) break;
        const next = neighbors[0];
        used.add(next.threadIdx);
        points.push(next.otherKey);
        current = next.otherKey;
        if (current === chainStart) break;
      }

      if (points.length >= 2) {
        chains.push({ color, style: style || "solid", points: points.map(k => k.split(",").map(Number)) });
      }
    }
  }

  return chains;
}

// ─── Canvas drawing ──────────────────────────────────────────

function redrawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const offsets = computeThreadOffsets();
  const chains = findChains();

  for (const chain of chains) {
    drawChain(ctx, chain.points, chain.color, offsets, chain.style);
  }

  // Draw thread start indicator
  if (state.threadStart && state.tool === "thread") {
    const { x, y } = cellCenter(state.threadStart[0], state.threadStart[1]);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.strokeStyle = state.threadColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawChain(c, points, color, offsets, threadStyle) {
  if (points.length < 2) return;
  const ROUND_RADIUS = CELL_SIZE * 0.35;
  const styleDash = getThreadStyleDash(threadStyle || "solid");
  const centers = points.map(([r, col]) => cellCenter(r, col));

  if (points.length === 2) {
    const tIdx = state.threads.findIndex(t =>
      t.color === color &&
      ((t.from[0] === points[0][0] && t.from[1] === points[0][1] && t.to[0] === points[1][0] && t.to[1] === points[1][1]) ||
       (t.from[0] === points[1][0] && t.from[1] === points[1][1] && t.to[0] === points[0][0] && t.to[1] === points[0][1]))
    );
    const off = tIdx >= 0 ? offsets.get(tIdx) : null;
    const f = centers[0], t = centers[1];
    let fOff = { x: 0, y: 0 }, tOff = { x: 0, y: 0 };
    if (off) {
      const td = state.threads[tIdx];
      if (td.from[0] === points[0][0] && td.from[1] === points[0][1]) {
        fOff = off.fromOff; tOff = off.toOff;
      } else {
        fOff = off.toOff; tOff = off.fromOff;
      }
    }
    c.beginPath();
    c.moveTo(f.x + fOff.x, f.y + fOff.y);
    c.lineTo(t.x + tOff.x, t.y + tOff.y);
    c.strokeStyle = color;
    c.lineWidth = 1.8;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.setLineDash(styleDash);
    c.stroke();
    c.setLineDash([]);
    return;
  }

  c.beginPath();
  c.moveTo(centers[0].x, centers[0].y);
  for (let i = 1; i < centers.length - 1; i++) {
    c.arcTo(centers[i].x, centers[i].y, centers[i + 1].x, centers[i + 1].y, ROUND_RADIUS);
  }
  c.lineTo(centers[centers.length - 1].x, centers[centers.length - 1].y);
  c.strokeStyle = color;
  c.lineWidth = 1.8;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.setLineDash(styleDash);
  c.stroke();
  c.setLineDash([]);
}

// ─── Helpers ─────────────────────────────────────────────────

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1, lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function findNearestThread(mx, my) {
  let bestIdx = -1, bestDist = Infinity;
  state.threads.forEach((t, i) => {
    const a = cellCenter(t.from[0], t.from[1]), b = cellCenter(t.to[0], t.to[1]);
    const d = distToSegment(mx, my, a.x, a.y, b.x, b.y);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  });
  return { idx: bestIdx, dist: bestDist };
}

function eraseNearThread(mx, my) {
  const { idx, dist } = findNearestThread(mx, my);
  if (idx >= 0 && dist < 10) {
    state.threads.splice(idx, 1);
    redrawAll();
    return true;
  }
  return false;
}

// ─── Connected component + rotation ─────────────────────────

function findComponent(startKey) {
  const visited = new Set();
  const queue = [startKey];
  while (queue.length) {
    const key = queue.shift();
    if (visited.has(key)) continue;
    visited.add(key);
    for (const t of state.threads) {
      const fk = `${t.from[0]},${t.from[1]}`, tk = `${t.to[0]},${t.to[1]}`;
      if (fk === key && !visited.has(tk)) queue.push(tk);
      if (tk === key && !visited.has(fk)) queue.push(fk);
    }
  }
  return visited;
}

function rotateComponent(r, c) {
  const startKey = `${r},${c}`;
  if (!state.stitches.has(startKey)) return;
  const comp = findComponent(startKey);
  if (comp.size < 2) return;

  const positions = [...comp].map(k => k.split(",").map(Number));
  const cr = positions.reduce((s, p) => s + p[0], 0) / positions.length;
  const cc = positions.reduce((s, p) => s + p[1], 0) / positions.length;

  function rot(pr, pc) {
    return [Math.round(cr + (pc - cc)), Math.round(cc - (pr - cr))];
  }

  const stitchColors = new Map(), stitchTypesSnap = new Map();
  for (const key of comp) {
    if (state.stitches.has(key)) stitchColors.set(key, state.stitches.get(key));
    if (state.stitchTypes.has(key)) stitchTypesSnap.set(key, state.stitchTypes.get(key));
  }

  const compThreads = state.threads.filter(t =>
    comp.has(`${t.from[0]},${t.from[1]}`) && comp.has(`${t.to[0]},${t.to[1]}`)
  );

  for (const key of comp) { state.stitches.delete(key); state.stitchTypes.delete(key); }
  state.threads = state.threads.filter(t =>
    !(comp.has(`${t.from[0]},${t.from[1]}`) && comp.has(`${t.to[0]},${t.to[1]}`))
  );

  for (const [key, color] of stitchColors) {
    const [br, bc] = key.split(",").map(Number);
    const [nr, nc] = rot(br, bc);
    if (inBounds(nr, nc)) {
      const nk = `${nr},${nc}`;
      state.stitches.set(nk, color);
      if (stitchTypesSnap.has(key)) state.stitchTypes.set(nk, stitchTypesSnap.get(key));
    }
  }
  for (const t of compThreads) {
    state.threads.push({ from: rot(t.from[0], t.from[1]), to: rot(t.to[0], t.to[1]), color: t.color, style: t.style });
  }

  refreshAllStitches();
  redrawAll();
  pushHistory();
}

// ─── Dragging helpers ────────────────────────────────────────

let movingStitch = null;
let movingComp = null;
let isDragging = false;
let dragChanged = false;

// ─── Selection state ─────────────────────────────────────────

let selectionRect = null;
let selectionStitches = null;
let selectionSnap = null;
let selectionAnchor = null;
let selectionLastDelta = null;
let selectionPhase = "idle";

function handleDrag(e) {
  const cell = e.target.closest(".cell");
  if (!cell) return;
  const r = parseInt(cell.dataset.row), c = parseInt(cell.dataset.col);
  const key = `${r},${c}`;

  if (state.tool === "select") {
    if (selectionPhase === "selecting" && selectionRect) {
      selectionRect.endR = r;
      selectionRect.endC = c;
      updateMarquee(selectionRect.startR, selectionRect.startC, r, c);
    } else if (selectionPhase === "dragging" && selectionAnchor) {
      const dr = r - selectionAnchor.r;
      const dc = c - selectionAnchor.c;
      if (dr !== selectionLastDelta.dr || dc !== selectionLastDelta.dc) {
        moveSelection(dr, dc);
        selectionLastDelta = { dr, dc };
        dragChanged = true;
      }
    }
    return;
  }

  if (state.tool === "move") {
    if (movingComp) {
      const dr = r - movingComp.anchorR;
      const dc = c - movingComp.anchorC;
      if (dr !== movingComp.lastDR || dc !== movingComp.lastDC) {
        moveComponent(movingComp, dr, dc);
        movingComp.lastDR = dr;
        movingComp.lastDC = dc;
        dragChanged = true;
      }
    } else if (movingStitch) {
      const newKey = key;
      if (newKey !== (movingStitch.currentKey || movingStitch.origKey)) {
        const lastKey = movingStitch.currentKey || movingStitch.origKey;
        if (state.stitches.has(lastKey) && state.stitches.get(lastKey) === movingStitch.color) {
          const oldType = state.stitchTypes.get(lastKey);
          state.stitches.delete(lastKey);
          state.stitchTypes.delete(lastKey);
          const oldCell = getCell(...lastKey.split(",").map(Number));
          if (oldCell) clearStitch(oldCell);
          state.stitchTypes.set(newKey, oldType || "cross");
        }
        state.stitches.set(newKey, movingStitch.color);
        renderStitch(cell, movingStitch.color, state.stitchTypes.get(newKey) || "cross");
        const [lastR, lastC] = lastKey.split(",").map(Number);
        for (const t of state.threads) {
          if (t.from[0] === lastR && t.from[1] === lastC) { t.from = [r, c]; }
          if (t.to[0] === lastR && t.to[1] === lastC) { t.to = [r, c]; }
        }
        movingStitch.currentKey = newKey;
        redrawAll();
        dragChanged = true;
      }
    }
  } else if (state.tool === "stitch") {
    if (!state.stitches.has(key) || state.stitches.get(key) !== state.stitchColor) {
      placeStitch(r, c, state.stitchColor, state.stitchType);
      dragChanged = true;
    }
  } else if (state.tool === "eraser") {
    if (state.stitches.has(key)) {
      state.stitches.delete(key);
      state.stitchTypes.delete(key);
      clearStitch(cell);
      state.threads = state.threads.filter(t =>
        !(t.from[0] === r && t.from[1] === c) && !(t.to[0] === r && t.to[1] === c)
      );
      redrawAll();
      dragChanged = true;
    } else {
      const rect = gridEl.getBoundingClientRect();
      if (eraseNearThread(e.clientX - rect.left, e.clientY - rect.top)) {
        dragChanged = true;
      }
    }
  }
}

// ─── Component move helpers ──────────────────────────────────

function snapshotComponent(comp) {
  const stitches = new Map(), types = new Map();
  for (const key of comp) {
    if (state.stitches.has(key)) stitches.set(key, state.stitches.get(key));
    if (state.stitchTypes.has(key)) types.set(key, state.stitchTypes.get(key));
  }
  const threads = state.threads.filter(t =>
    comp.has(`${t.from[0]},${t.from[1]}`) || comp.has(`${t.to[0]},${t.to[1]}`)
  ).map(t => ({ from: [...t.from], to: [...t.to], color: t.color, style: t.style }));
  return { stitches, types, threads };
}

function moveComponent(mc, dr, dc) {
  for (const key of mc.comp) { state.stitches.delete(key); state.stitchTypes.delete(key); }
  state.threads = state.threads.filter(t =>
    !(mc.comp.has(`${t.from[0]},${t.from[1]}`) || mc.comp.has(`${t.to[0]},${t.to[1]}`))
  );

  const newComp = new Set();
  for (const [key, color] of mc.stitchSnap) {
    const [or, oc] = key.split(",").map(Number);
    const nr = or + dr, nc = oc + dc;
    if (inBounds(nr, nc)) {
      const nk = `${nr},${nc}`;
      state.stitches.set(nk, color);
      if (mc.typeSnap && mc.typeSnap.has(key)) state.stitchTypes.set(nk, mc.typeSnap.get(key));
      newComp.add(nk);
    }
  }
  for (const t of mc.threadSnap) {
    state.threads.push({ from: [t.from[0] + dr, t.from[1] + dc], to: [t.to[0] + dr, t.to[1] + dc], color: t.color, style: t.style });
  }

  mc.comp = newComp;
  refreshAllStitches();
  redrawAll();
}

// ─── Selection helpers ───────────────────────────────────────

function clearSelection() {
  selectionStitches = null;
  selectionSnap = null;
  selectionAnchor = null;
  selectionLastDelta = null;
  selectionPhase = "idle";
  selectionRect = null;
  marqueeEl.style.display = "none";
  document.querySelectorAll(".cell.selected").forEach(c => c.classList.remove("selected"));
}

function updateMarquee(startR, startC, endR, endC) {
  const minR = Math.min(startR, endR), maxR = Math.max(startR, endR);
  const minC = Math.min(startC, endC), maxC = Math.max(startC, endC);
  const w = (maxC - minC + 1) * CELL_SIZE;
  const h = (maxR - minR + 1) * CELL_SIZE;
  marqueeEl.style.display = "block";
  marqueeEl.style.left = (minC * CELL_SIZE) + "px";
  marqueeEl.style.top = (minR * CELL_SIZE) + "px";
  marqueeEl.style.width = w + "px";
  marqueeEl.style.height = h + "px";
  const rx = 4;
  marqueeEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${w + 4} ${h + 4}">
    <rect class="marquee-glow" x="0" y="0" width="${w}" height="${h}" rx="${rx}"/>
    <rect class="marquee-fill" x="0" y="0" width="${w}" height="${h}" rx="${rx}"/>
    <rect class="marquee-border" x="0" y="0" width="${w}" height="${h}" rx="${rx}"/>
  </svg>`;
}

function finalizeSelection(startR, startC, endR, endC) {
  const minR = Math.min(startR, endR), maxR = Math.max(startR, endR);
  const minC = Math.min(startC, endC), maxC = Math.max(startC, endC);
  const selected = new Set();
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const key = `${r},${c}`;
      if (state.stitches.has(key)) selected.add(key);
    }
  }
  if (selected.size === 0) { clearSelection(); return; }
  selectionStitches = selected;
  selectionPhase = "selected";
  marqueeEl.style.display = "none";
  for (const key of selectionStitches) {
    const [r, c] = key.split(",").map(Number);
    const cell = getCell(r, c);
    if (cell) cell.classList.add("selected");
  }
  selectionSnap = snapshotSelection(selectionStitches);
}

function snapshotSelection(selected) {
  const stitches = new Map(), types = new Map();
  for (const key of selected) {
    if (state.stitches.has(key)) stitches.set(key, state.stitches.get(key));
    if (state.stitchTypes.has(key)) types.set(key, state.stitchTypes.get(key));
  }
  const threads = state.threads.filter(t =>
    selected.has(`${t.from[0]},${t.from[1]}`) && selected.has(`${t.to[0]},${t.to[1]}`)
  ).map(t => ({ from: [...t.from], to: [...t.to], color: t.color, style: t.style }));
  return { stitches, types, threads };
}

function moveSelection(dr, dc) {
  for (const key of selectionStitches) { state.stitches.delete(key); state.stitchTypes.delete(key); }
  state.threads = state.threads.filter(t =>
    !(selectionStitches.has(`${t.from[0]},${t.from[1]}`) && selectionStitches.has(`${t.to[0]},${t.to[1]}`))
  );
  const newSelected = new Set();
  for (const [key, color] of selectionSnap.stitches) {
    const [or, oc] = key.split(",").map(Number);
    const nr = or + dr, nc = oc + dc;
    if (inBounds(nr, nc)) {
      const nk = `${nr},${nc}`;
      state.stitches.set(nk, color);
      if (selectionSnap.types && selectionSnap.types.has(key)) state.stitchTypes.set(nk, selectionSnap.types.get(key));
      newSelected.add(nk);
    }
  }
  for (const t of selectionSnap.threads) {
    state.threads.push({ from: [t.from[0] + dr, t.from[1] + dc], to: [t.to[0] + dr, t.to[1] + dc], color: t.color, style: t.style });
  }
  document.querySelectorAll(".cell.selected").forEach(c => c.classList.remove("selected"));
  selectionStitches = newSelected;
  for (const key of selectionStitches) {
    const [r, c] = key.split(",").map(Number);
    const cell = getCell(r, c);
    if (cell) cell.classList.add("selected");
  }
  refreshAllStitches();
  redrawAll();
}

function findNearestThreadEndpoint(mx, my) {
  const { idx, dist } = findNearestThread(mx, my);
  if (idx < 0 || dist >= 10) return null;
  const t = state.threads[idx];
  return `${t.from[0]},${t.from[1]}`;
}

// ─── Input handling ──────────────────────────────────────────

gridEl.addEventListener("mousedown", (e) => {
  const tools = ["stitch", "eraser", "move", "select", "rotate", "thread"];
  if (!tools.includes(state.tool)) return;

  const cell = e.target.closest(".cell");
  if (!cell) return;
  const r = parseInt(cell.dataset.row), c = parseInt(cell.dataset.col);
  const key = `${r},${c}`;

  if (state.tool === "select") {
    if (selectionPhase === "selected" && selectionStitches && selectionStitches.has(key)) {
      selectionPhase = "dragging";
      selectionAnchor = { r, c };
      selectionLastDelta = { dr: 0, dc: 0 };
      isDragging = true;
      dragChanged = false;
      gridEl.style.cursor = CURSORS.moveGrab;
    } else {
      clearSelection();
      selectionRect = { startR: r, startC: c, endR: r, endC: c };
      selectionPhase = "selecting";
      isDragging = true;
      dragChanged = false;
      updateMarquee(r, c, r, c);
    }
    return;
  }

  if (state.tool === "move") {
    if (state.stitches.has(key)) {
      movingStitch = { origKey: key, origR: r, origC: c, color: state.stitches.get(key), currentKey: key };
      movingComp = null;
      isDragging = true;
      dragChanged = false;
      gridEl.style.cursor = CURSORS.moveGrab;
      return;
    }
    const rect = gridEl.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const threadKey = findNearestThreadEndpoint(mx, my);
    if (threadKey) {
      const comp = findComponent(threadKey);
      if (comp.size >= 1) {
        const snap = snapshotComponent(comp);
        movingComp = { comp, anchorR: r, anchorC: c, lastDR: 0, lastDC: 0, stitchSnap: snap.stitches, typeSnap: snap.types, threadSnap: snap.threads };
        movingStitch = null;
        isDragging = true;
        dragChanged = false;
        gridEl.style.cursor = CURSORS.moveGrab;
        return;
      }
    }
    return;
  }

  isDragging = true;
  dragChanged = false;

  if (state.tool === "thread") {
    if (!state.threadStart) {
      state.threadStart = [r, c];
      redrawAll();
    } else {
      const [fr, fc] = state.threadStart;
      if (!(fr === r && fc === c)) {
        state.threads.push({ from: [fr, fc], to: [r, c], color: state.threadColor, style: state.threadStyle });
        redrawAll();
        pushHistory();
      }
      state.threadStart = null;
      redrawAll();
    }
    isDragging = false;
    return;
  }

  if (state.tool === "rotate") {
    rotateComponent(r, c);
    isDragging = false;
    return;
  }

  if (state.tool === "stitch") {
    const existingColor = state.stitches.get(key);
    const existingType = state.stitchTypes.get(key);
    if (existingColor === state.stitchColor && existingType === state.stitchType) {
      state.stitches.delete(key);
      state.stitchTypes.delete(key);
      clearStitch(cell);
    } else {
      placeStitch(r, c, state.stitchColor, state.stitchType);
    }
    dragChanged = true;
    return;
  }

  if (state.tool === "eraser") {
    if (state.stitches.has(key)) {
      state.stitches.delete(key);
      state.stitchTypes.delete(key);
      clearStitch(cell);
      state.threads = state.threads.filter(t =>
        !(t.from[0] === r && t.from[1] === c) && !(t.to[0] === r && t.to[1] === c)
      );
      redrawAll();
      dragChanged = true;
    } else {
      const rect = gridEl.getBoundingClientRect();
      if (eraseNearThread(e.clientX - rect.left, e.clientY - rect.top)) dragChanged = true;
    }
  }
});

gridEl.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  handleDrag(e);
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;

  if (state.tool === "select") {
    if (selectionPhase === "selecting" && selectionRect) {
      finalizeSelection(selectionRect.startR, selectionRect.startC, selectionRect.endR, selectionRect.endC);
    } else if (selectionPhase === "dragging") {
      selectionPhase = "selected";
      gridEl.style.cursor = CURSORS.select;
      if (dragChanged) pushHistory();
    }
  } else if (state.tool === "move") {
    movingStitch = null;
    movingComp = null;
    gridEl.style.cursor = CURSORS.move;
    if (dragChanged) pushHistory();
  } else {
    if (dragChanged) pushHistory();
  }

  dragChanged = false;
});

// ─── Keyboard shortcuts ──────────────────────────────────────

document.addEventListener("keydown", (e) => {
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
  if (ctrl && (e.key === "Z" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
  if (ctrl && e.key === "y") { e.preventDefault(); redo(); }
  if (e.key === "Escape") {
    if (state.threadStart) { state.threadStart = null; redrawAll(); return; }
    if (selectionPhase !== "idle") clearSelection();
  }
  // Tool shortcuts
  if (!ctrl && !e.altKey) {
    if (e.key === "s" || e.key === "S") setTool("stitch");
    if (e.key === "e" || e.key === "E") setTool("eraser");
    if (e.key === "m" || e.key === "M") setTool("move");
    if (e.key === "r" || e.key === "R") setTool("rotate");
    if (e.key === "a" || e.key === "A") setTool("select");
  }
});

// ─── Tool buttons ────────────────────────────────────────────

document.querySelectorAll(".tool-btn[data-tool]").forEach(btn => {
  btn.addEventListener("click", () => setTool(btn.dataset.tool));
});

document.getElementById("btn-undo").addEventListener("click", undo);
document.getElementById("btn-redo").addEventListener("click", redo);
document.getElementById("btn-reset").addEventListener("click", () => {
  if (confirm("Effacer tout le patron ?")) resetAll();
});

// ─── Stitch type dropdown ────────────────────────────────────

const stitchTypeToggle = document.getElementById("stitch-type-toggle");
const stitchTypeDropdown = document.getElementById("stitch-type-dropdown");
const stitchTypeIcon = document.getElementById("stitch-type-icon");

stitchTypeToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  document.querySelectorAll(".split-dropdown.open").forEach(d => { if (d !== stitchTypeDropdown) d.classList.remove("open"); });
  document.querySelectorAll(".palette-popover.open").forEach(p => p.classList.remove("open"));
  stitchTypeDropdown.classList.toggle("open");
});

const STITCH_TYPE_ICONS = {
  "cross":       `<line x1="4" y1="4" x2="14" y2="14" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="4" x2="4" y2="14" stroke-width="2" stroke-linecap="round"/>`,
  "half-cross":  `<line x1="4" y1="14" x2="14" y2="4" stroke-width="2" stroke-linecap="round"/>`,
  "quarter":     `<line x1="9" y1="9" x2="14" y2="4" stroke-width="2" stroke-linecap="round"/>`,
  "knot":        `<circle cx="9" cy="9" r="3" fill="currentColor"/><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2" stroke-linecap="round"/>`,
  "straight-h":  `<line x1="3" y1="9" x2="15" y2="9" stroke-width="2.2" stroke-linecap="round"/>`,
  "straight-v":  `<line x1="9" y1="3" x2="9" y2="15" stroke-width="2.2" stroke-linecap="round"/>`,
};

document.querySelectorAll("[data-stitch-type]").forEach(opt => {
  opt.addEventListener("click", () => {
    state.stitchType = opt.dataset.stitchType;
    document.querySelectorAll("[data-stitch-type]").forEach(o => o.classList.remove("active"));
    opt.classList.add("active");
    stitchTypeIcon.innerHTML = STITCH_TYPE_ICONS[state.stitchType] || STITCH_TYPE_ICONS["cross"];
    stitchTypeDropdown.classList.remove("open");
    setTool("stitch");
  });
});

// ─── Thread style dropdown ───────────────────────────────────

const threadStyleToggle = document.getElementById("thread-style-toggle");
const threadStyleDropdown = document.getElementById("thread-style-dropdown");
const threadStyleIcon = document.getElementById("thread-style-icon");

threadStyleToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  document.querySelectorAll(".split-dropdown.open").forEach(d => { if (d !== threadStyleDropdown) d.classList.remove("open"); });
  document.querySelectorAll(".palette-popover.open").forEach(p => p.classList.remove("open"));
  threadStyleDropdown.classList.toggle("open");
});

const THREAD_STYLE_ICONS = {
  "solid":     `<path d="M2 9 L16 9" stroke-width="2" stroke-linecap="round"/>`,
  "dashed":    `<path d="M2 9 L16 9" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 3"/>`,
  "dotted":    `<path d="M2 9 L16 9" stroke-width="2" stroke-linecap="round" stroke-dasharray="1.5 3"/>`,
  "dash-dot":  `<path d="M2 9 L16 9" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 2 1.5 2"/>`,
  "long-dash": `<path d="M2 9 L16 9" stroke-width="2" stroke-linecap="round" stroke-dasharray="7 3"/>`,
};

document.querySelectorAll("[data-thread-style]").forEach(opt => {
  opt.addEventListener("click", () => {
    state.threadStyle = opt.dataset.threadStyle;
    document.querySelectorAll("[data-thread-style]").forEach(o => o.classList.remove("active"));
    opt.classList.add("active");
    threadStyleIcon.innerHTML = THREAD_STYLE_ICONS[state.threadStyle] || THREAD_STYLE_ICONS["solid"];
    threadStyleDropdown.classList.remove("open");
    setTool("thread");
  });
});

// Close dropdowns on outside click
document.addEventListener("click", () => {
  document.querySelectorAll(".split-dropdown.open").forEach(d => d.classList.remove("open"));
});

// ─── Export ──────────────────────────────────────────────────

function exportPNG(showGrid, watermark) {
  const exportCanvas = document.createElement("canvas");
  const scale = 2;
  exportCanvas.width = state.gridCols * CELL_SIZE * scale;
  exportCanvas.height = state.gridRows * CELL_SIZE * scale;
  const ec = exportCanvas.getContext("2d");
  ec.scale(scale, scale);

  // Background
  ec.fillStyle = "#fdf8f0";
  ec.fillRect(0, 0, state.gridCols * CELL_SIZE, state.gridRows * CELL_SIZE);

  // Grid
  if (showGrid) {
    ec.strokeStyle = "rgba(180,140,90,0.18)";
    ec.lineWidth = 0.5;
    for (let r = 0; r <= state.gridRows; r++) {
      ec.beginPath();
      ec.moveTo(0, r * CELL_SIZE);
      ec.lineTo(state.gridCols * CELL_SIZE, r * CELL_SIZE);
      ec.stroke();
    }
    for (let c = 0; c <= state.gridCols; c++) {
      ec.beginPath();
      ec.moveTo(c * CELL_SIZE, 0);
      ec.lineTo(c * CELL_SIZE, state.gridRows * CELL_SIZE);
      ec.stroke();
    }
  }

  // Threads
  for (const t of state.threads) {
    const a = cellCenter(t.from[0], t.from[1]);
    const b = cellCenter(t.to[0], t.to[1]);
    ec.beginPath();
    ec.moveTo(a.x, a.y);
    ec.lineTo(b.x, b.y);
    ec.strokeStyle = t.color;
    ec.lineWidth = 1.8;
    ec.lineCap = "round";
    ec.setLineDash(getThreadStyleDash(t.style || "solid"));
    ec.stroke();
    ec.setLineDash([]);
  }

  // Stitches
  for (const [key, color] of state.stitches) {
    const [r, c] = key.split(",").map(Number);
    const { x, y } = cellCenter(r, c);
    const type = state.stitchTypes.get(key) || "cross";
    drawStitchOnCanvas(ec, x, y, type, color, CELL_SIZE / 2);
  }

  // Watermark
  if (watermark) {
    ec.font = "bold 11px Inter, sans-serif";
    ec.fillStyle = "rgba(40,24,10,0.25)";
    ec.textAlign = "right";
    ec.fillText("chlohal.com", state.gridCols * CELL_SIZE - 8, state.gridRows * CELL_SIZE - 8);
  }

  const link = document.createElement("a");
  link.download = "broderie-patron.png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}

document.getElementById("export-grid").addEventListener("click", () => exportPNG(true, true));
document.getElementById("export-no-grid").addEventListener("click", () => exportPNG(false, true));
document.getElementById("export-clean").addEventListener("click", () => {
  const pw = prompt("Mot de passe :");
  if (pw === "chlohal") exportPNG(false, false);
  else if (pw !== null) alert("Mot de passe incorrect.");
});

// ─── Resize ──────────────────────────────────────────────────

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    CELL_SIZE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 28;
    computeGridSize();
    buildGrid();
    refreshAllStitches();
    redrawAll();
  }, 120);
});

// ─── Init ────────────────────────────────────────────────────

computeGridSize();
buildGrid();
pushHistory();
