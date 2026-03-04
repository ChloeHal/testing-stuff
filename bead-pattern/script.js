// ─── State ──────────────────────────────────────────────────

const state = {
  tool: "bead",
  beadColor: "#ffffff",
  wireColor: "#171717",
  gridRows: 20,
  gridCols: 20,
  beads: new Map(),
  wires: [],
  torsades: [],
  wireStart: null,
  loopCount: 6,
  torsadeTwists: 3,
  colorblind: false,
};

const CELL_SIZE = 28;
const WIRE_SPREAD = 6;
const gridEl = document.getElementById("grid");
const canvas = document.getElementById("wire-canvas");
const ctx = canvas.getContext("2d");

const marqueeEl = document.createElement("div");
marqueeEl.className = "selection-marquee";
marqueeEl.style.display = "none";
document.querySelector(".editor").appendChild(marqueeEl);

// ─── Colorblind maps ────────────────────────────────────────

const BEAD_SYMBOLS = {
  "#ffffff": "○", "#d4d4d4": "–", "#737373": "□", "#171717": "●",
  "#ef4444": "△", "#e11d48": "♥", "#fb7185": "◇", "#ec4899": "★",
  "#d946ef": "✕", "#a855f7": "▲", "#8b5cf6": "+", "#6366f1": "◆",
  "#3b82f6": "▽", "#0ea5e9": "◎", "#06b6d4": "≡", "#14b8a6": "⬡",
  "#22c55e": "✦", "#84cc16": "◈", "#eab308": "⊕", "#f59e0b": "⊗",
  "#f97316": "⊞", "#d4a017": "✧",
};

const WIRE_DASHES = {
  "#171717": [],       "#ffffff": [8, 4],
  "#737373": [2, 2],   "#ef4444": [12, 4, 2, 4],
  "#ec4899": [6, 3],   "#d946ef": [4, 4],
  "#3b82f6": [10, 5],  "#06b6d4": [2, 4],
  "#22c55e": [8, 2, 2, 2], "#eab308": [14, 4],
  "#f97316": [4, 2],   "#8b5cf6": [8, 2, 2, 2, 2, 2],
  "#78350f": [6, 6],   "#d4a017": [12, 2],
  "#a8a8a8": [3, 3],
};

function getBeadSymbol(color) {
  return BEAD_SYMBOLS[color] || "?";
}

function getWireDash(color) {
  return WIRE_DASHES[color] || [5, 5];
}

function isLightColor(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Custom cursors ─────────────────────────────────────────

function svgCursor(svg, hx = 12, hy = 12) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hx} ${hy}, crosshair`;
}

const CURSORS = {
  bead: svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='7' fill='none' stroke='black' stroke-width='2'/><circle cx='12' cy='12' r='2' fill='black'/></svg>`),
  wire: svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='19' cy='5' r='2'/><circle cx='5' cy='19' r='2'/><path d='M5 17A12 12 0 0 1 17 5'/></svg>`),
  torsade: svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='18' r='3'/><circle cx='6' cy='6' r='3'/><circle cx='18' cy='6' r='3'/><path d='M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9'/><path d='M12 12v3'/></svg>`),
  loop: svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='9' fill='none' stroke='black' stroke-width='2' stroke-dasharray='4 3'/></svg>`),
  rotate: svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 4a8 8 0 1 1-5.5 2.5' fill='none' stroke='black' stroke-width='2'/><polygon points='4,3 6.5,7.5 9.5,4' fill='black'/></svg>`),
  move: svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2'/><path d='M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2'/><path d='M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8'/><path d='M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'/></svg>`),
  moveGrab: svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4'/><path d='M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2'/><path d='M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5'/><path d='M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2'/><path d='M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0'/></svg>`),
  arrow: svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M9 6 L15 12 L9 18'/></svg>`),
  eraser: svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21'/><path d='m5.082 11.09 8.828 8.828'/></svg>`, 12, 18),
  select: svgCursor(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='4' y='4' width='16' height='16' rx='1' stroke-dasharray='4 2'/></svg>`),
};

function updateCursor() {
  gridEl.style.cursor = CURSORS[state.tool] || "default";
}

// ─── History ────────────────────────────────────────────────

const history = [];
let historyIdx = -1;

function snapshot() {
  return {
    beads: new Map(state.beads),
    wires: state.wires.map(w => ({ from: [...w.from], to: [...w.to], color: w.color, arrow: w.arrow })),
    torsades: state.torsades.map(t => ({ from: [...t.from], to: [...t.to], color: t.color, twists: t.twists })),
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
  state.beads = new Map(snap.beads);
  state.wires = snap.wires.map(w => ({ from: [...w.from], to: [...w.to], color: w.color, arrow: w.arrow }));
  state.torsades = snap.torsades.map(t => ({ from: [...t.from], to: [...t.to], color: t.color, twists: t.twists }));
  state.wireStart = null;
  refreshAllBeads();
  redrawAll();
}

function undo() { if (historyIdx > 0) { historyIdx--; restoreSnapshot(history[historyIdx]); } }
function redo() { if (historyIdx < history.length - 1) { historyIdx++; restoreSnapshot(history[historyIdx]); } }

function resetAll() {
  state.beads.clear();
  state.wires.length = 0;
  state.torsades.length = 0;
  state.wireStart = null;
  refreshAllBeads();
  redrawAll();
  pushHistory();
}

// ─── Tool switching helper ──────────────────────────────────

function setTool(tool) {
  document.querySelectorAll(".tool-btn").forEach(b => b.classList.remove("active"));
  const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
  if (btn) btn.classList.add("active");
  state.tool = tool;
  state.wireStart = null;
  clearSelection();
  redrawAll();
  updateToolOptions();
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

// ─── Beads ──────────────────────────────────────────────────

function renderBead(cell, color) {
  cell.innerHTML = "";
  const bead = document.createElement("div");
  bead.className = "bead";
  if (state.colorblind) {
    bead.style.background = hexToRgba(color, 0.25);
    bead.style.borderColor = color;
    bead.style.borderWidth = "2px";
    const sym = document.createElement("span");
    sym.className = "bead-symbol";
    sym.textContent = getBeadSymbol(color);
    sym.style.color = "#000";
    bead.appendChild(sym);
  } else {
    bead.style.background = color;
  }
  cell.appendChild(bead);
}

function clearBead(cell) { cell.innerHTML = ""; }

function placeBead(r, c, color) {
  if (!inBounds(r, c)) return;
  state.beads.set(`${r},${c}`, color);
  const cell = getCell(r, c);
  if (cell) renderBead(cell, color);
}

function refreshAllBeads() {
  document.querySelectorAll(".cell").forEach(cell => {
    const key = `${cell.dataset.row},${cell.dataset.col}`;
    if (state.beads.has(key)) renderBead(cell, state.beads.get(key));
    else clearBead(cell);
  });
}

// ─── Wire spread computation ────────────────────────────────

function endpointKey(r, c) { return `${r},${c}`; }

function computeWireOffsets() {
  const offsets = { wire: new Map(), torsade: new Map() };

  // 1. Group segments that share the same pair of cells (overlapping segments)
  const segByPair = new Map(); // "minKey|maxKey" -> [{type, idx}]
  function pairKey(r1, c1, r2, c2) {
    const a = `${r1},${c1}`, b = `${r2},${c2}`;
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }
  state.wires.forEach((w, i) => {
    const pk = pairKey(w.from[0], w.from[1], w.to[0], w.to[1]);
    if (!segByPair.has(pk)) segByPair.set(pk, []);
    segByPair.get(pk).push({ type: "wire", idx: i });
  });
  state.torsades.forEach((t, i) => {
    const pk = pairKey(t.from[0], t.from[1], t.to[0], t.to[1]);
    if (!segByPair.has(pk)) segByPair.set(pk, []);
    segByPair.get(pk).push({ type: "torsade", idx: i });
  });

  // Apply perpendicular spread to overlapping segments
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
      const seg = segs[i];
      const spread = (i - (n - 1) / 2) * WIRE_SPREAD;
      const ox = nx * spread, oy = ny * spread;
      if (!offsets[seg.type].has(seg.idx)) {
        offsets[seg.type].set(seg.idx, { fromOff: { x: 0, y: 0 }, toOff: { x: 0, y: 0 } });
      }
      const entry = offsets[seg.type].get(seg.idx);
      entry.fromOff = { x: ox, y: oy };
      entry.toOff = { x: ox, y: oy };
    }
  }

  // 2. Group endpoints by cell for segments that share an endpoint but go to different cells
  const endpointSegments = new Map();
  function addSeg(key, otherR, otherC, type, idx) {
    if (!endpointSegments.has(key)) endpointSegments.set(key, []);
    endpointSegments.get(key).push({ type, idx, otherR, otherC });
  }
  state.wires.forEach((w, i) => {
    addSeg(endpointKey(w.from[0], w.from[1]), w.to[0], w.to[1], "wire", i);
    addSeg(endpointKey(w.to[0], w.to[1]), w.from[0], w.from[1], "wire", i);
  });
  state.torsades.forEach((t, i) => {
    addSeg(endpointKey(t.from[0], t.from[1]), t.to[0], t.to[1], "torsade", i);
    addSeg(endpointKey(t.to[0], t.to[1]), t.from[0], t.from[1], "torsade", i);
  });

  for (const [key, segs] of endpointSegments) {
    if (segs.length < 2) continue;
    // Skip if all segments go to the same destination (handled by overlap above)
    const destinations = new Set(segs.map(s => `${s.otherR},${s.otherC}`));
    if (destinations.size < 2) continue;

    const [kr, kc] = key.split(",").map(Number);
    segs.sort((a, b) => {
      const angA = Math.atan2(a.otherR - kr, a.otherC - kc);
      const angB = Math.atan2(b.otherR - kr, b.otherC - kc);
      return angA - angB;
    });
    const n = segs.length;
    for (let i = 0; i < n; i++) {
      const seg = segs[i];
      const spread = (i - (n - 1) / 2) * WIRE_SPREAD;
      const dx = seg.otherC - kc, dy = seg.otherR - kr;
      const len = Math.hypot(dx, dy);
      if (len === 0) continue;
      const perpX = -dy / len * spread;
      const perpY = dx / len * spread;

      if (!offsets[seg.type].has(seg.idx)) {
        offsets[seg.type].set(seg.idx, { fromOff: { x: 0, y: 0 }, toOff: { x: 0, y: 0 } });
      }
      const entry = offsets[seg.type].get(seg.idx);
      const segData = seg.type === "wire" ? state.wires[seg.idx] : state.torsades[seg.idx];
      if (segData.from[0] === kr && segData.from[1] === kc) {
        entry.fromOff = { x: entry.fromOff.x + perpX, y: entry.fromOff.y + perpY };
      } else {
        entry.toOff = { x: entry.toOff.x + perpX, y: entry.toOff.y + perpY };
      }
    }
  }

  return offsets;
}

// ─── Chain finding for rounded corners ──────────────────────

function findChains() {
  // Group same-color wires into chains (sequences of connected segments)
  // A chain is a list of points where consecutive points are wire endpoints
  const wiresByColor = new Map();
  state.wires.forEach((w, i) => {
    if (!wiresByColor.has(w.color)) wiresByColor.set(w.color, []);
    wiresByColor.get(w.color).push(i);
  });

  const chains = [];
  const used = new Set();

  for (const [color, indices] of wiresByColor) {
    // Build adjacency: endpoint -> [{wireIdx, otherEnd}]
    const adj = new Map();
    for (const i of indices) {
      const w = state.wires[i];
      const fk = endpointKey(w.from[0], w.from[1]);
      const tk = endpointKey(w.to[0], w.to[1]);
      if (!adj.has(fk)) adj.set(fk, []);
      if (!adj.has(tk)) adj.set(tk, []);
      adj.get(fk).push({ wireIdx: i, otherKey: tk });
      adj.get(tk).push({ wireIdx: i, otherKey: fk });
    }

    // Find chains by following adjacency
    for (const startIdx of indices) {
      if (used.has(startIdx)) continue;
      // Start from an endpoint that has degree 1 or hasn't been used
      const w0 = state.wires[startIdx];
      const fk = endpointKey(w0.from[0], w0.from[1]);
      const tk = endpointKey(w0.to[0], w0.to[1]);

      // Find a chain start (degree 1 node, or any node)
      let chainStart = fk;
      if ((adj.get(fk) || []).filter(a => !used.has(a.wireIdx)).length <= 1) {
        chainStart = fk;
      } else if ((adj.get(tk) || []).filter(a => !used.has(a.wireIdx)).length <= 1) {
        chainStart = tk;
      }

      // Walk the chain
      const points = [chainStart];
      let current = chainStart;
      while (true) {
        const neighbors = (adj.get(current) || []).filter(a => !used.has(a.wireIdx));
        if (neighbors.length === 0) break;
        // Pick the first unused neighbor
        const next = neighbors[0];
        used.add(next.wireIdx);
        points.push(next.otherKey);
        current = next.otherKey;
        // Stop if we reach a node with no more unused edges or if we loop back
        if (current === chainStart) break;
      }

      if (points.length >= 2) {
        chains.push({ color, points: points.map(k => k.split(",").map(Number)) });
      }
    }
  }

  return chains;
}

// ─── Canvas drawing ─────────────────────────────────────────

function redrawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const offsets = computeWireOffsets();
  const chains = findChains();

  // Draw wire chains with rounded corners
  for (const chain of chains) {
    drawChain(ctx, chain.points, chain.color, offsets);
  }

  // Draw torsades
  for (let i = 0; i < state.torsades.length; i++) {
    const t = state.torsades[i];
    const from = cellCenter(t.from[0], t.from[1]);
    const to = cellCenter(t.to[0], t.to[1]);
    const off = offsets.torsade.get(i);
    const fx = from.x + (off ? off.fromOff.x : 0);
    const fy = from.y + (off ? off.fromOff.y : 0);
    const tx = to.x + (off ? off.toOff.x : 0);
    const ty = to.y + (off ? off.toOff.y : 0);
    drawTorsade(ctx, { x: fx, y: fy }, { x: tx, y: ty }, t.color, t.twists);
  }

  // Draw arrowheads on wires
  drawWireArrows(ctx, offsets);
}

function drawWireArrows(c, offsets) {
  for (let i = 0; i < state.wires.length; i++) {
    const w = state.wires[i];
    if (!w.arrow) continue;
    const from = cellCenter(w.from[0], w.from[1]);
    const to = cellCenter(w.to[0], w.to[1]);
    const off = offsets.wire.get(i);
    let fOff = { x: 0, y: 0 }, tOff = { x: 0, y: 0 };
    if (off) { fOff = off.fromOff; tOff = off.toOff; }
    const fx = from.x + fOff.x, fy = from.y + fOff.y;
    const tx = to.x + tOff.x, ty = to.y + tOff.y;
    const mx = (fx + tx) / 2, my = (fy + ty) / 2;
    const color = state.colorblind ? hexToRgba(w.color, 0.6) : w.color;
    const angle = w.arrow === "end"
      ? Math.atan2(ty - fy, tx - fx)
      : Math.atan2(fy - ty, fx - tx);
    drawChevron(c, mx, my, angle, color);
  }
}

function drawChain(c, points, color, offsets) {
  if (points.length < 2) return;
  const ROUND_RADIUS = CELL_SIZE * 0.4;

  // Get offset centers for each point
  const centers = points.map(([r, col]) => cellCenter(r, col));

  // For chains of 2 points, just draw a straight line (with offsets)
  if (points.length === 2) {
    // Find the wire index for this pair
    const wIdx = state.wires.findIndex(w =>
      w.color === color &&
      ((w.from[0] === points[0][0] && w.from[1] === points[0][1] && w.to[0] === points[1][0] && w.to[1] === points[1][1]) ||
       (w.from[0] === points[1][0] && w.from[1] === points[1][1] && w.to[0] === points[0][0] && w.to[1] === points[0][1]))
    );
    const off = wIdx >= 0 ? offsets.wire.get(wIdx) : null;
    const f = centers[0], t = centers[1];
    // Check which direction matches from/to
    let fOff = { x: 0, y: 0 }, tOff = { x: 0, y: 0 };
    if (off) {
      const w = state.wires[wIdx];
      if (w.from[0] === points[0][0] && w.from[1] === points[0][1]) {
        fOff = off.fromOff; tOff = off.toOff;
      } else {
        fOff = off.toOff; tOff = off.fromOff;
      }
    }
    c.beginPath();
    c.moveTo(f.x + fOff.x, f.y + fOff.y);
    c.lineTo(t.x + tOff.x, t.y + tOff.y);
    c.strokeStyle = state.colorblind ? hexToRgba(color, 0.4) : color;
    c.lineWidth = 2;
    c.lineCap = "round";
    c.lineJoin = "round";
    if (state.colorblind) c.setLineDash(getWireDash(color));
    c.stroke();
    c.setLineDash([]);
    return;
  }

  // For chains of 3+ points, use arcTo for rounded corners
  c.beginPath();
  c.moveTo(centers[0].x, centers[0].y);
  for (let i = 1; i < centers.length - 1; i++) {
    const prev = centers[i - 1];
    const curr = centers[i];
    const next = centers[i + 1];
    // Use arcTo for a rounded corner at curr
    c.arcTo(curr.x, curr.y, next.x, next.y, ROUND_RADIUS);
  }
  c.lineTo(centers[centers.length - 1].x, centers[centers.length - 1].y);
  c.strokeStyle = state.colorblind ? hexToRgba(color, 0.4) : color;
  c.lineWidth = 2;
  c.lineCap = "round";
  c.lineJoin = "round";
  if (state.colorblind) c.setLineDash(getWireDash(color));
  c.stroke();
  c.setLineDash([]);
}

function drawTorsade(c, from, to, color, twists) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const nx = -dy / len, ny = dx / len;
  const amp = 4, steps = twists * 14;
  for (let strand = 0; strand < 2; strand++) {
    const phase = strand * Math.PI;
    c.beginPath();
    c.moveTo(from.x, from.y);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const wave = Math.sin(t * twists * Math.PI * 2 + phase) * amp;
      c.lineTo(from.x + dx * t + nx * wave, from.y + dy * t + ny * wave);
    }
    c.strokeStyle = state.colorblind ? hexToRgba(color, 0.4) : color;
    c.lineWidth = 2;
    c.lineCap = "round";
    if (state.colorblind) c.setLineDash(getWireDash(color));
    c.stroke();
    c.setLineDash([]);
  }
}

// ─── Boucle ─────────────────────────────────────────────────

function placeLoop(centerR, centerC) {
  const n = state.loopCount;
  const radius = Math.max(2, Math.ceil(n * 0.25));
  const positions = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const r = Math.round(centerR + radius * Math.sin(angle));
    const c = Math.round(centerC + radius * Math.cos(angle));
    if (!inBounds(r, c)) continue;
    if (positions.some(([pr, pc]) => pr === r && pc === c)) continue;
    positions.push([r, c]);
    placeBead(r, c, state.beadColor);
  }
  for (let i = 0; i < positions.length; i++) {
    state.wires.push({ from: positions[i], to: positions[(i + 1) % positions.length], color: state.wireColor });
  }
  redrawAll();
}

// ─── Helpers ────────────────────────────────────────────────

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1, lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function findNearestSegment(mx, my) {
  let bestIdx = -1, bestDist = Infinity, bestType = null;
  state.wires.forEach((w, i) => {
    const a = cellCenter(w.from[0], w.from[1]), b = cellCenter(w.to[0], w.to[1]);
    const d = distToSegment(mx, my, a.x, a.y, b.x, b.y);
    if (d < bestDist) { bestDist = d; bestIdx = i; bestType = "wire"; }
  });
  state.torsades.forEach((t, i) => {
    const a = cellCenter(t.from[0], t.from[1]), b = cellCenter(t.to[0], t.to[1]);
    const d = distToSegment(mx, my, a.x, a.y, b.x, b.y);
    if (d < bestDist) { bestDist = d; bestIdx = i; bestType = "torsade"; }
  });
  return { idx: bestIdx, dist: bestDist, type: bestType };
}

function eraseNearSegment(mx, my) {
  const { idx, dist, type } = findNearestSegment(mx, my);
  if (idx >= 0 && dist < 10) {
    if (type === "wire") state.wires.splice(idx, 1);
    else state.torsades.splice(idx, 1);
    redrawAll();
    return true;
  }
  return false;
}

function convertWireToTorsade(mx, my) {
  let bestIdx = -1, bestDist = Infinity;
  state.wires.forEach((w, i) => {
    const a = cellCenter(w.from[0], w.from[1]), b = cellCenter(w.to[0], w.to[1]);
    const d = distToSegment(mx, my, a.x, a.y, b.x, b.y);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  });
  if (bestIdx >= 0 && bestDist < 10) {
    const wire = state.wires.splice(bestIdx, 1)[0];
    state.torsades.push({ from: wire.from, to: wire.to, color: wire.color, twists: state.torsadeTwists });
    redrawAll();
    pushHistory();
  }
}

function toggleArrow(mx, my) {
  const { idx, dist, type } = findNearestSegment(mx, my);
  if (idx < 0 || dist >= 10 || type !== "wire") return;
  const w = state.wires[idx];
  const cycle = [undefined, "end", "start"];
  const cur = cycle.indexOf(w.arrow);
  w.arrow = cycle[(cur + 1) % cycle.length];
  redrawAll();
  pushHistory();
}

function drawChevron(c, cx, cy, angle, color, size) {
  size = size || 5;
  c.save();
  c.translate(cx, cy);
  c.rotate(angle);
  c.beginPath();
  c.moveTo(-size, -size);
  c.lineTo(size * 0.4, 0);
  c.lineTo(-size, size);
  c.strokeStyle = color;
  c.lineWidth = 2.2;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.stroke();
  c.restore();
}

// ─── Connected component + rotation ─────────────────────────

function findComponent(startKey) {
  const visited = new Set();
  const queue = [startKey];
  while (queue.length) {
    const key = queue.shift();
    if (visited.has(key)) continue;
    visited.add(key);
    for (const w of state.wires) {
      const fk = `${w.from[0]},${w.from[1]}`, tk = `${w.to[0]},${w.to[1]}`;
      if (fk === key && !visited.has(tk)) queue.push(tk);
      if (tk === key && !visited.has(fk)) queue.push(fk);
    }
    for (const t of state.torsades) {
      const fk = `${t.from[0]},${t.from[1]}`, tk = `${t.to[0]},${t.to[1]}`;
      if (fk === key && !visited.has(tk)) queue.push(tk);
      if (tk === key && !visited.has(fk)) queue.push(fk);
    }
  }
  return visited;
}

function rotateComponent(r, c) {
  const startKey = `${r},${c}`;
  if (!state.beads.has(startKey)) return;
  const comp = findComponent(startKey);
  if (comp.size < 2) return;

  const positions = [...comp].map(k => k.split(",").map(Number));
  const cr = positions.reduce((s, p) => s + p[0], 0) / positions.length;
  const cc = positions.reduce((s, p) => s + p[1], 0) / positions.length;

  function rot(pr, pc) {
    return [Math.round(cr + (pc - cc)), Math.round(cc - (pr - cr))];
  }

  const beadColors = new Map();
  for (const key of comp) if (state.beads.has(key)) beadColors.set(key, state.beads.get(key));

  const compWires = state.wires.filter(w =>
    comp.has(`${w.from[0]},${w.from[1]}`) && comp.has(`${w.to[0]},${w.to[1]}`)
  );
  const compTorsades = state.torsades.filter(t =>
    comp.has(`${t.from[0]},${t.from[1]}`) && comp.has(`${t.to[0]},${t.to[1]}`)
  );

  for (const key of comp) state.beads.delete(key);
  state.wires = state.wires.filter(w =>
    !(comp.has(`${w.from[0]},${w.from[1]}`) && comp.has(`${w.to[0]},${w.to[1]}`))
  );
  state.torsades = state.torsades.filter(t =>
    !(comp.has(`${t.from[0]},${t.from[1]}`) && comp.has(`${t.to[0]},${t.to[1]}`))
  );

  for (const [key, color] of beadColors) {
    const [br, bc] = key.split(",").map(Number);
    const [nr, nc] = rot(br, bc);
    if (inBounds(nr, nc)) state.beads.set(`${nr},${nc}`, color);
  }
  for (const w of compWires) {
    state.wires.push({ from: rot(w.from[0], w.from[1]), to: rot(w.to[0], w.to[1]), color: w.color, arrow: w.arrow });
  }
  for (const t of compTorsades) {
    state.torsades.push({ from: rot(t.from[0], t.from[1]), to: rot(t.to[0], t.to[1]), color: t.color, twists: t.twists });
  }

  refreshAllBeads();
  redrawAll();
  pushHistory();
}

// ─── Dragging (move bead/component, paint, erase) ───────────

let movingBead = null;   // {origKey, origR, origC, color, currentKey}
let movingComp = null;   // {comp: Set, anchorR, anchorC, lastDR, lastDC, beadSnap, wireSnap, torsadeSnap}
let isDragging = false;
let dragChanged = false;

// ─── Selection state ─────────────────────────────────────────
let selectionRect = null;
let selectionBeads = null;
let selectionSnap = null;
let selectionAnchor = null;
let selectionLastDelta = null;
let selectionPhase = "idle"; // "idle" | "selecting" | "selected" | "dragging"

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
    } else if (movingBead) {
      const newKey = key;
      if (newKey !== (movingBead.currentKey || movingBead.origKey)) {
        const lastKey = movingBead.currentKey || movingBead.origKey;
        if (state.beads.has(lastKey) && state.beads.get(lastKey) === movingBead.color) {
          state.beads.delete(lastKey);
          const oldCell = getCell(...lastKey.split(",").map(Number));
          if (oldCell) clearBead(oldCell);
        }
        state.beads.set(newKey, movingBead.color);
        renderBead(cell, movingBead.color);
        const [lastR, lastC] = lastKey.split(",").map(Number);
        for (const w of state.wires) {
          if (w.from[0] === lastR && w.from[1] === lastC) { w.from = [r, c]; }
          if (w.to[0] === lastR && w.to[1] === lastC) { w.to = [r, c]; }
        }
        for (const t of state.torsades) {
          if (t.from[0] === lastR && t.from[1] === lastC) { t.from = [r, c]; }
          if (t.to[0] === lastR && t.to[1] === lastC) { t.to = [r, c]; }
        }
        movingBead.currentKey = newKey;
        redrawAll();
        dragChanged = true;
      }
    }
  } else if (state.tool === "bead") {
    if (!state.beads.has(key) || state.beads.get(key) !== state.beadColor) {
      placeBead(r, c, state.beadColor);
      dragChanged = true;
    }
  } else if (state.tool === "eraser") {
    if (state.beads.has(key)) {
      state.beads.delete(key);
      clearBead(cell);
      state.wires = state.wires.filter(w =>
        !(w.from[0] === r && w.from[1] === c) && !(w.to[0] === r && w.to[1] === c)
      );
      state.torsades = state.torsades.filter(t =>
        !(t.from[0] === r && t.from[1] === c) && !(t.to[0] === r && t.to[1] === c)
      );
      redrawAll();
      dragChanged = true;
    } else {
      const rect = gridEl.getBoundingClientRect();
      if (eraseNearSegment(e.clientX - rect.left, e.clientY - rect.top)) {
        dragChanged = true;
      }
    }
  }
}

// ─── Component move helpers ─────────────────────────────────

function snapshotComponent(comp) {
  const beads = new Map();
  for (const key of comp) if (state.beads.has(key)) beads.set(key, state.beads.get(key));
  const wires = state.wires.filter(w =>
    comp.has(`${w.from[0]},${w.from[1]}`) || comp.has(`${w.to[0]},${w.to[1]}`)
  ).map(w => ({ from: [...w.from], to: [...w.to], color: w.color, arrow: w.arrow }));
  const torsades = state.torsades.filter(t =>
    comp.has(`${t.from[0]},${t.from[1]}`) || comp.has(`${t.to[0]},${t.to[1]}`)
  ).map(t => ({ from: [...t.from], to: [...t.to], color: t.color, twists: t.twists }));
  return { beads, wires, torsades };
}

function moveComponent(mc, dr, dc) {
  // Remove current positions
  for (const key of mc.comp) state.beads.delete(key);
  state.wires = state.wires.filter(w =>
    !(mc.comp.has(`${w.from[0]},${w.from[1]}`) || mc.comp.has(`${w.to[0]},${w.to[1]}`))
  );
  state.torsades = state.torsades.filter(t =>
    !(mc.comp.has(`${t.from[0]},${t.from[1]}`) || mc.comp.has(`${t.to[0]},${t.to[1]}`))
  );

  // Place at new positions from snapshot
  const newComp = new Set();
  for (const [key, color] of mc.beadSnap) {
    const [or, oc] = key.split(",").map(Number);
    const nr = or + dr, nc = oc + dc;
    if (inBounds(nr, nc)) {
      state.beads.set(`${nr},${nc}`, color);
      newComp.add(`${nr},${nc}`);
    }
  }
  for (const w of mc.wireSnap) {
    const nw = { from: [w.from[0] + dr, w.from[1] + dc], to: [w.to[0] + dr, w.to[1] + dc], color: w.color, arrow: w.arrow };
    state.wires.push(nw);
  }
  for (const t of mc.torsadeSnap) {
    const nt = { from: [t.from[0] + dr, t.from[1] + dc], to: [t.to[0] + dr, t.to[1] + dc], color: t.color, twists: t.twists };
    state.torsades.push(nt);
  }

  // Update comp keys to new positions
  mc.comp = newComp;
  refreshAllBeads();
  redrawAll();
}

// ─── Selection tool helpers ──────────────────────────────────

function clearSelection() {
  selectionBeads = null;
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
      if (state.beads.has(key)) selected.add(key);
    }
  }
  if (selected.size === 0) { clearSelection(); return; }
  selectionBeads = selected;
  selectionPhase = "selected";
  marqueeEl.style.display = "none";
  for (const key of selectionBeads) {
    const [r, c] = key.split(",").map(Number);
    const cell = getCell(r, c);
    if (cell) cell.classList.add("selected");
  }
  selectionSnap = snapshotSelection(selectionBeads);
}

function snapshotSelection(selected) {
  const beads = new Map();
  for (const key of selected) if (state.beads.has(key)) beads.set(key, state.beads.get(key));
  const wires = state.wires.filter(w =>
    selected.has(`${w.from[0]},${w.from[1]}`) && selected.has(`${w.to[0]},${w.to[1]}`)
  ).map(w => ({ from: [...w.from], to: [...w.to], color: w.color, arrow: w.arrow }));
  const torsades = state.torsades.filter(t =>
    selected.has(`${t.from[0]},${t.from[1]}`) && selected.has(`${t.to[0]},${t.to[1]}`)
  ).map(t => ({ from: [...t.from], to: [...t.to], color: t.color, twists: t.twists }));
  return { beads, wires, torsades };
}

function moveSelection(dr, dc) {
  for (const key of selectionBeads) state.beads.delete(key);
  state.wires = state.wires.filter(w =>
    !(selectionBeads.has(`${w.from[0]},${w.from[1]}`) && selectionBeads.has(`${w.to[0]},${w.to[1]}`))
  );
  state.torsades = state.torsades.filter(t =>
    !(selectionBeads.has(`${t.from[0]},${t.from[1]}`) && selectionBeads.has(`${t.to[0]},${t.to[1]}`))
  );
  const newSelected = new Set();
  for (const [key, color] of selectionSnap.beads) {
    const [or, oc] = key.split(",").map(Number);
    const nr = or + dr, nc = oc + dc;
    if (inBounds(nr, nc)) {
      state.beads.set(`${nr},${nc}`, color);
      newSelected.add(`${nr},${nc}`);
    }
  }
  for (const w of selectionSnap.wires) {
    state.wires.push({ from: [w.from[0] + dr, w.from[1] + dc], to: [w.to[0] + dr, w.to[1] + dc], color: w.color, arrow: w.arrow });
  }
  for (const t of selectionSnap.torsades) {
    state.torsades.push({ from: [t.from[0] + dr, t.from[1] + dc], to: [t.to[0] + dr, t.to[1] + dc], color: t.color, twists: t.twists });
  }
  document.querySelectorAll(".cell.selected").forEach(c => c.classList.remove("selected"));
  selectionBeads = newSelected;
  for (const key of selectionBeads) {
    const [r, c] = key.split(",").map(Number);
    const cell = getCell(r, c);
    if (cell) cell.classList.add("selected");
  }
  refreshAllBeads();
  redrawAll();
}

function findNearestWireEndpoint(mx, my) {
  // Find the nearest wire/torsade endpoint to a pixel position (for clicking on a wire to grab the component)
  const { idx, dist, type } = findNearestSegment(mx, my);
  if (idx < 0 || dist >= 10) return null;
  const seg = type === "wire" ? state.wires[idx] : state.torsades[idx];
  return `${seg.from[0]},${seg.from[1]}`;
}

gridEl.addEventListener("mousedown", (e) => {
  if (state.tool !== "bead" && state.tool !== "eraser" && state.tool !== "move" && state.tool !== "select") return;

  const cell = e.target.closest(".cell");
  if (!cell) return;
  const r = parseInt(cell.dataset.row), c = parseInt(cell.dataset.col);
  const key = `${r},${c}`;

  if (state.tool === "select") {
    if (selectionPhase === "selected" && selectionBeads && selectionBeads.has(key)) {
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
    // Clicking on a bead → move just that bead (wires follow)
    if (state.beads.has(key)) {
      movingBead = { origKey: key, origR: r, origC: c, color: state.beads.get(key), currentKey: key };
      movingComp = null;
      isDragging = true;
      dragChanged = false;
      gridEl.style.cursor = CURSORS.moveGrab;
      return;
    }

    // Clicking on a wire/torsade → move the whole connected component
    const rect = gridEl.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const wireKey = findNearestWireEndpoint(mx, my);
    if (wireKey) {
      const comp = findComponent(wireKey);
      if (comp.size >= 1) {
        const snap = snapshotComponent(comp);
        movingComp = { comp, anchorR: r, anchorC: c, lastDR: 0, lastDC: 0, beadSnap: snap.beads, wireSnap: snap.wires, torsadeSnap: snap.torsades };
        movingBead = null;
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
  movingBead = null;
  movingComp = null;
  handleDrag(e);
});

gridEl.addEventListener("mousemove", (e) => {
  if (isDragging) { handleDrag(e); return; }

  // wire preview
  if (!state.wireStart) return;
  if (state.tool !== "wire") return;
  const rect = gridEl.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  if (previewRAF) cancelAnimationFrame(previewRAF);
  previewRAF = requestAnimationFrame(() => {
    redrawAll();
    const from = cellCenter(state.wireStart[0], state.wireStart[1]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(mx, my);
    ctx.strokeStyle = state.wireColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  });
});

document.addEventListener("mouseup", () => {
  if (state.tool === "select" && isDragging) {
    if (selectionPhase === "selecting" && selectionRect) {
      finalizeSelection(selectionRect.startR, selectionRect.startC, selectionRect.endR, selectionRect.endC);
      selectionRect = null;
    } else if (selectionPhase === "dragging") {
      selectionPhase = "selected";
      selectionAnchor = null;
      if (dragChanged) pushHistory();
      selectionSnap = snapshotSelection(selectionBeads);
    }
    isDragging = false;
    dragChanged = false;
    gridEl.style.cursor = CURSORS.select;
    return;
  }
  if (isDragging) {
    const wasMoving = state.tool === "move";
    isDragging = false;
    movingBead = null;
    movingComp = null;
    if (dragChanged) pushHistory();
    dragChanged = false;
    if (wasMoving) gridEl.style.cursor = CURSORS.move;
  }
});

// ─── Grid click (tools that need click, not drag) ───────────

gridEl.addEventListener("click", (e) => {
  // bead, eraser and select are handled by drag handlers
  if (state.tool === "bead" || state.tool === "eraser" || state.tool === "select") return;

  const cell = e.target.closest(".cell");
  if (!cell) return;
  const r = parseInt(cell.dataset.row), c = parseInt(cell.dataset.col);

  const rect = gridEl.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;

  switch (state.tool) {
    case "wire":
      if (!state.wireStart) {
        state.wireStart = [r, c];
      } else {
        const [sr, sc] = state.wireStart;
        if (sr !== r || sc !== c) {
          state.wires.push({ from: [sr, sc], to: [r, c], color: state.wireColor });
          redrawAll();
          pushHistory();
        }
        // Chain mode: keep going from the last point
        state.wireStart = [r, c];
      }
      break;

    case "torsade":
      convertWireToTorsade(mx, my);
      break;

    case "arrow":
      toggleArrow(mx, my);
      break;

    case "loop":
      placeLoop(r, c);
      pushHistory();
      break;

    case "rotate":
      rotateComponent(r, c);
      break;
  }
});

// ─── Double-click stops wire ────────────────────────────────

gridEl.addEventListener("dblclick", () => {
  if (state.wireStart) {
    state.wireStart = null;
    redrawAll();
  }
});

// ─── Preview RAF ────────────────────────────────────────────

let previewRAF = null;

// ─── Keyboard shortcuts ─────────────────────────────────────

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (selectionPhase !== "idle") { clearSelection(); return; }
    if (state.wireStart) { state.wireStart = null; redrawAll(); return; }
  }
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
  if ((e.ctrlKey || e.metaKey) && (k === "y" || (k === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
});

// ─── Toolbar ────────────────────────────────────────────────

const loopOpts = document.getElementById("loop-options");
const torsadeOpts = document.getElementById("torsade-options");

function updateToolOptions() {
  loopOpts.classList.toggle("visible", state.tool === "loop");
  torsadeOpts.classList.toggle("visible", state.tool === "torsade");
}

document.querySelectorAll(".tool-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    setTool(btn.dataset.tool);
  });
});

document.getElementById("loop-count").addEventListener("input", (e) => {
  state.loopCount = Math.max(3, Math.min(35, parseInt(e.target.value) || 6));
});

document.querySelectorAll(".twist-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".twist-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.torsadeTwists = parseInt(btn.dataset.twists);
  });
});

// undo / redo / reset
document.getElementById("btn-undo").addEventListener("click", undo);
document.getElementById("btn-redo").addEventListener("click", redo);
document.getElementById("btn-reset").addEventListener("click", resetAll);

// colorblind toggle
document.getElementById("btn-colorblind").addEventListener("click", () => {
  state.colorblind = !state.colorblind;
  document.getElementById("btn-colorblind").classList.toggle("toggle-on", state.colorblind);
  refreshPaletteSwatches();
  refreshAllBeads();
  redrawAll();
});

function refreshPaletteSwatches() {
  // Bead swatches: show symbol on transparent color
  document.querySelectorAll("#bead-palette .swatch").forEach(sw => {
    const color = sw.dataset.color;
    if (state.colorblind) {
      sw.style.background = hexToRgba(color, 0.25);
      sw.style.borderColor = color;
      sw.style.color = "#000";
      sw.textContent = getBeadSymbol(color);
    } else {
      sw.style.background = color;
      sw.style.borderColor = "";
      sw.style.color = "transparent";
      sw.textContent = "";
    }
  });
  // Wire swatches: show dash pattern on transparent color
  document.querySelectorAll("#wire-palette .swatch").forEach(sw => {
    const color = sw.dataset.color;
    const existing = sw.querySelector(".wire-dash");
    if (existing) existing.remove();

    if (state.colorblind) {
      sw.style.background = hexToRgba(color, 0.25);
      sw.style.borderColor = color;
      const dash = getWireDash(color);
      const dashStr = dash.length ? dash.join(",") : "none";
      const div = document.createElement("div");
      div.className = "wire-dash";
      div.style.display = "block";
      div.innerHTML = `<svg viewBox="0 0 20 20"><line x1="2" y1="10" x2="18" y2="10" stroke="${color}" stroke-width="2.5" stroke-linecap="round" ${dashStr !== "none" ? `stroke-dasharray="${dashStr}"` : ""}/></svg>`;
      sw.appendChild(div);
    } else {
      sw.style.background = color;
      sw.style.borderColor = "";
    }
  });
}

// ─── Palettes ───────────────────────────────────────────────

// Bead palette: clicking a swatch also switches to bead tool
document.querySelectorAll("#bead-palette .swatch").forEach(sw => {
  sw.addEventListener("click", () => {
    document.querySelectorAll("#bead-palette .swatch").forEach(s => s.classList.remove("active"));
    sw.classList.add("active");
    state.beadColor = sw.dataset.color;
    document.getElementById("bead-custom-color").value = sw.dataset.color;
    setTool("bead");
  });
});
document.getElementById("bead-custom-color").addEventListener("input", (e) => {
  state.beadColor = e.target.value;
  document.querySelectorAll("#bead-palette .swatch").forEach(s => s.classList.remove("active"));
  setTool("bead");
});

// Wire palette: clicking a swatch also switches to wire tool
document.querySelectorAll("#wire-palette .swatch").forEach(sw => {
  sw.addEventListener("click", () => {
    document.querySelectorAll("#wire-palette .swatch").forEach(s => s.classList.remove("active"));
    sw.classList.add("active");
    state.wireColor = sw.dataset.color;
    document.getElementById("wire-custom-color").value = sw.dataset.color;
    setTool("wire");
  });
});
document.getElementById("wire-custom-color").addEventListener("input", (e) => {
  state.wireColor = e.target.value;
  document.querySelectorAll("#wire-palette .swatch").forEach(s => s.classList.remove("active"));
  setTool("wire");
});

// ─── Export PNG ──────────────────────────────────────────────

function getContentBounds() {
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const [key] of state.beads) {
    const [r, c] = key.split(",").map(Number);
    minR = Math.min(minR, r); maxR = Math.max(maxR, r);
    minC = Math.min(minC, c); maxC = Math.max(maxC, c);
  }
  for (const w of state.wires) {
    minR = Math.min(minR, w.from[0], w.to[0]); maxR = Math.max(maxR, w.from[0], w.to[0]);
    minC = Math.min(minC, w.from[1], w.to[1]); maxC = Math.max(maxC, w.from[1], w.to[1]);
  }
  for (const t of state.torsades) {
    minR = Math.min(minR, t.from[0], t.to[0]); maxR = Math.max(maxR, t.from[0], t.to[0]);
    minC = Math.min(minC, t.from[1], t.to[1]); maxC = Math.max(maxC, t.from[1], t.to[1]);
  }
  if (minR === Infinity) return null;
  // Add 3-cell margin
  const margin = 3;
  minR = Math.max(0, minR - margin);
  maxR = Math.min(state.gridRows - 1, maxR + margin);
  minC = Math.max(0, minC - margin);
  maxC = Math.min(state.gridCols - 1, maxC + margin);
  return { minR, maxR, minC, maxC };
}

function exportPNG(withGrid) {
  const bounds = getContentBounds();
  if (!bounds) return; // nothing to export

  const cols = bounds.maxC - bounds.minC + 1;
  const rows = bounds.maxR - bounds.minR + 1;
  const w = cols * CELL_SIZE, h = rows * CELL_SIZE;
  const offX = bounds.minC * CELL_SIZE;
  const offY = bounds.minR * CELL_SIZE;

  const off = document.createElement("canvas");
  off.width = w; off.height = h;
  const oc = off.getContext("2d");

  oc.fillStyle = "#ffffff";
  oc.fillRect(0, 0, w, h);

  if (withGrid) {
    oc.strokeStyle = "#e5e5e5"; oc.lineWidth = 1;
    for (let i = 0; i <= cols; i++) { oc.beginPath(); oc.moveTo(i * CELL_SIZE, 0); oc.lineTo(i * CELL_SIZE, h); oc.stroke(); }
    for (let i = 0; i <= rows; i++) { oc.beginPath(); oc.moveTo(0, i * CELL_SIZE); oc.lineTo(w, i * CELL_SIZE); oc.stroke(); }
  }

  // Translate so cellCenter coordinates map to the export canvas
  oc.save();
  oc.translate(-offX, -offY);

  // Draw wires with chains + rounded corners (same as on-screen)
  const expOffsets = computeWireOffsets();
  const expChains = findChains();
  for (const chain of expChains) {
    drawChain(oc, chain.points, chain.color, expOffsets);
  }

  // Draw torsades with offsets
  for (let i = 0; i < state.torsades.length; i++) {
    const t = state.torsades[i];
    const from = cellCenter(t.from[0], t.from[1]);
    const to = cellCenter(t.to[0], t.to[1]);
    const tOff = expOffsets.torsade.get(i);
    const fx = from.x + (tOff ? tOff.fromOff.x : 0);
    const fy = from.y + (tOff ? tOff.fromOff.y : 0);
    const tx = to.x + (tOff ? tOff.toOff.x : 0);
    const ty = to.y + (tOff ? tOff.toOff.y : 0);
    drawTorsade(oc, { x: fx, y: fy }, { x: tx, y: ty }, t.color, t.twists);
  }

  // Draw arrowheads
  drawWireArrows(oc, expOffsets);

  // Draw beads
  for (const [key, color] of state.beads) {
    const [r, c] = key.split(",").map(Number);
    const p = cellCenter(r, c);
    oc.beginPath();
    oc.arc(p.x, p.y, 10, 0, Math.PI * 2);
    if (state.colorblind) {
      oc.fillStyle = hexToRgba(color, 0.25);
      oc.fill();
      oc.strokeStyle = color;
      oc.lineWidth = 2;
      oc.stroke();
    } else {
      oc.fillStyle = color;
      oc.fill();
      oc.strokeStyle = "rgba(0,0,0,0.1)";
      oc.lineWidth = 1.5;
      oc.stroke();
    }
    if (state.colorblind) {
      oc.fillStyle = "#000";
      oc.font = "bold 11px Inter, sans-serif";
      oc.textAlign = "center";
      oc.textBaseline = "middle";
      oc.fillText(getBeadSymbol(color), p.x, p.y);
    }
  }

  oc.restore();

  const a = document.createElement("a");
  a.download = withGrid ? "pattern-grid.png" : "pattern.png";
  a.href = off.toDataURL("image/png");
  a.click();
}

document.getElementById("export-grid").addEventListener("click", () => exportPNG(true));
document.getElementById("export-no-grid").addEventListener("click", () => exportPNG(false));

// ─── Init ───────────────────────────────────────────────────

computeGridSize();
buildGrid();
pushHistory();
