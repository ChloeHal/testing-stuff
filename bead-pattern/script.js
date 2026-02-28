const state = {
  tool: "bead",
  beadColor: "#ffffff",
  wireColor: "#000000",
  gridSize: 20,
  beads: new Map(),
  wires: [],
  wireStart: null,
};

const gridEl = document.getElementById("grid");
const canvas = document.getElementById("wire-canvas");
const ctx = canvas.getContext("2d");

// --- Grid setup ---
function buildGrid() {
  gridEl.style.gridTemplateColumns = `repeat(${state.gridSize}, var(--cell-size))`;
  gridEl.innerHTML = "";
  for (let r = 0; r < state.gridSize; r++) {
    for (let c = 0; c < state.gridSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      gridEl.appendChild(cell);
    }
  }
  resizeCanvas();
}

function resizeCanvas() {
  canvas.width = gridEl.offsetWidth;
  canvas.height = gridEl.offsetHeight;
  redrawWires();
}

// --- Cell center position ---
function cellCenter(r, c) {
  const cellSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--cell-size"));
  // Account for 1px grid border
  const x = 1 + c * cellSize + cellSize / 2;
  const y = 1 + r * cellSize + cellSize / 2;
  return { x, y };
}

// --- Render beads ---
function renderBead(cell, color) {
  cell.innerHTML = "";
  const bead = document.createElement("div");
  bead.className = "bead";
  const lighter = lighten(color, 40);
  bead.style.background = `radial-gradient(circle at 35% 35%, ${lighter}, ${color} 70%)`;
  bead.style.boxShadow = `inset -2px -2px 4px rgba(0,0,0,0.25), 1px 1px 2px rgba(0,0,0,0.15)`;
  cell.appendChild(bead);
}

function clearBead(cell) {
  cell.innerHTML = "";
}

function refreshBeads() {
  document.querySelectorAll(".cell").forEach((cell) => {
    const key = `${cell.dataset.row},${cell.dataset.col}`;
    if (state.beads.has(key)) {
      renderBead(cell, state.beads.get(key));
    } else {
      clearBead(cell);
    }
  });
}

// --- Wire drawing ---
function redrawWires() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const wire of state.wires) {
    const from = cellCenter(wire.from[0], wire.from[1]);
    const to = cellCenter(wire.to[0], wire.to[1]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = wire.color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

let previewRAF = null;

function drawPreview(startR, startC, mouseX, mouseY) {
  redrawWires();
  const from = cellCenter(startR, startC);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(mouseX, mouseY);
  ctx.strokeStyle = state.wireColor;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

// --- Color helpers ---
function lighten(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = Math.min(255, ((num >> 16) & 0xff) + amount);
  let g = Math.min(255, ((num >> 8) & 0xff) + amount);
  let b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

// --- Distance from point to segment (for eraser on wires) ---
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

// --- Event: grid clicks ---
gridEl.addEventListener("click", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;
  const r = parseInt(cell.dataset.row);
  const c = parseInt(cell.dataset.col);
  const key = `${r},${c}`;

  if (state.tool === "bead") {
    state.beads.set(key, state.beadColor);
    renderBead(cell, state.beadColor);
  } else if (state.tool === "eraser") {
    if (state.beads.has(key)) {
      state.beads.delete(key);
      clearBead(cell);
      // Also remove any wires connected to this bead
      state.wires = state.wires.filter(
        (w) =>
          !(w.from[0] === r && w.from[1] === c) &&
          !(w.to[0] === r && w.to[1] === c)
      );
      redrawWires();
    }
  } else if (state.tool === "wire") {
    if (!state.beads.has(key)) return; // must click on a bead
    if (!state.wireStart) {
      state.wireStart = [r, c];
      canvas.classList.add("active");
    } else {
      const [sr, sc] = state.wireStart;
      if (sr !== r || sc !== c) {
        state.wires.push({
          from: [sr, sc],
          to: [r, c],
          color: state.wireColor,
        });
      }
      state.wireStart = null;
      canvas.classList.remove("active");
      redrawWires();
    }
  }
});

// --- Wire preview on mouse move ---
gridEl.addEventListener("mousemove", (e) => {
  if (state.tool !== "wire" || !state.wireStart) return;
  const rect = gridEl.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  if (previewRAF) cancelAnimationFrame(previewRAF);
  previewRAF = requestAnimationFrame(() => {
    drawPreview(state.wireStart[0], state.wireStart[1], mx, my);
  });
});

// --- Canvas click for eraser on wires ---
canvas.addEventListener("click", (e) => {
  if (state.tool === "wire") {
    // Handled by grid click (canvas is pointer-events:auto only during wire preview,
    // but grid click event still fires from cell underneath for bead selection)
    // Forward click to grid if we're in wire mode
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Find if click is on a bead cell
    const cellSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--cell-size"));
    const col = Math.floor((mx - 1) / cellSize);
    const row = Math.floor((my - 1) / cellSize);
    if (row >= 0 && row < state.gridSize && col >= 0 && col < state.gridSize) {
      const key = `${row},${col}`;
      if (state.beads.has(key)) {
        if (!state.wireStart) {
          state.wireStart = [row, col];
        } else {
          const [sr, sc] = state.wireStart;
          if (sr !== row || sc !== col) {
            state.wires.push({
              from: [sr, sc],
              to: [row, col],
              color: state.wireColor,
            });
          }
          state.wireStart = null;
          canvas.classList.remove("active");
          redrawWires();
        }
      }
    }
    return;
  }
});

// --- Eraser on canvas (wires) ---
gridEl.parentElement.addEventListener("click", (e) => {
  if (state.tool !== "eraser") return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // Check if near any wire
  let closest = -1;
  let closestDist = Infinity;
  for (let i = 0; i < state.wires.length; i++) {
    const w = state.wires[i];
    const from = cellCenter(w.from[0], w.from[1]);
    const to = cellCenter(w.to[0], w.to[1]);
    const d = distToSegment(mx, my, from.x, from.y, to.x, to.y);
    if (d < closestDist) {
      closestDist = d;
      closest = i;
    }
  }
  if (closest >= 0 && closestDist < 8) {
    state.wires.splice(closest, 1);
    redrawWires();
  }
});

// --- Toolbar: tool buttons ---
document.querySelectorAll(".tool-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tool-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.tool = btn.dataset.tool;
    // Cancel wire in progress
    state.wireStart = null;
    canvas.classList.remove("active");
    redrawWires();
  });
});

// --- Bead palette ---
document.querySelectorAll("#bead-palette .swatch").forEach((sw) => {
  sw.addEventListener("click", () => {
    document.querySelectorAll("#bead-palette .swatch").forEach((s) => s.classList.remove("active"));
    sw.classList.add("active");
    state.beadColor = sw.dataset.color;
    document.getElementById("bead-custom-color").value = sw.dataset.color;
  });
});

document.getElementById("bead-custom-color").addEventListener("input", (e) => {
  state.beadColor = e.target.value;
  document.querySelectorAll("#bead-palette .swatch").forEach((s) => s.classList.remove("active"));
});

// --- Wire palette ---
document.querySelectorAll("#wire-palette .swatch").forEach((sw) => {
  sw.addEventListener("click", () => {
    document.querySelectorAll("#wire-palette .swatch").forEach((s) => s.classList.remove("active"));
    sw.classList.add("active");
    state.wireColor = sw.dataset.color;
    document.getElementById("wire-custom-color").value = sw.dataset.color;
  });
});

document.getElementById("wire-custom-color").addEventListener("input", (e) => {
  state.wireColor = e.target.value;
  document.querySelectorAll("#wire-palette .swatch").forEach((s) => s.classList.remove("active"));
});

// --- Cancel wire with Escape ---
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.wireStart) {
    state.wireStart = null;
    canvas.classList.remove("active");
    redrawWires();
  }
});

// --- Init ---
buildGrid();
