// ─── Peyote Bead Grid Editor ──────────────────────────────
// Canvas-based staggered (brick/peyote) bead layout.
// Odd rows (0-indexed) are offset right by half a bead cell.

(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────────
  const BEAD_W = 20;   // bead width (px)  — flat beads are square
  const BEAD_H = 20;   // bead height (px)
  const GAP    = 2;    // gap between beads (px)
  let GRID_COLS = 30;
  let GRID_ROWS = 24;

  const STEP_X = BEAD_W + GAP;
  const STEP_Y = BEAD_H + GAP;
  const OFFSET = STEP_X / 2;  // horizontal shift for odd rows

  const PADDING_X = 10;  // left padding so first bead isn't clipped
  const PADDING_Y = 10;  // top padding

  // ── State ─────────────────────────────────────────────────
  const state = {
    tool: 'bead',           // 'bead' | 'eraser'
    beadColor: '#c2410c',
    beads: new Map(),       // key = "row,col" → color string
    gridCols: GRID_COLS,
    gridRows: GRID_ROWS,
  };

  // ── History ───────────────────────────────────────────────
  const MAX_HISTORY = 80;
  let history = [];
  let historyIndex = -1;

  function serializeState() {
    return JSON.stringify([...state.beads.entries()]);
  }

  function pushHistory() {
    // Drop any redo tail
    if (historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }
    history.push(serializeState());
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
    updateUndoRedo();
  }

  function applySnapshot(snap) {
    state.beads = new Map(JSON.parse(snap));
    renderAll();
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      applySnapshot(history[historyIndex]);
      updateUndoRedo();
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      applySnapshot(history[historyIndex]);
      updateUndoRedo();
    }
  }

  function updateUndoRedo() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.style.opacity = historyIndex > 0 ? '1' : '0.35';
    if (btnRedo) btnRedo.style.opacity = historyIndex < history.length - 1 ? '1' : '0.35';
  }

  // ── Coordinate helpers ────────────────────────────────────

  /**
   * Returns the canvas pixel center {x, y} for the bead at (row, col).
   * Odd rows are shifted right by OFFSET.
   */
  function cellToPixel(row, col) {
    const x = PADDING_X + col * STEP_X + BEAD_W / 2 + (row % 2 === 1 ? OFFSET : 0);
    const y = PADDING_Y + row * STEP_Y + BEAD_H / 2;
    return { x, y };
  }

  /**
   * Given a canvas pixel (px, py), returns the nearest {row, col} or null
   * if the click is outside the grid boundaries.
   */
  function pixelToCell(px, py) {
    // Estimate row first (y is independent of offset)
    const row = Math.floor((py - PADDING_Y) / STEP_Y);
    if (row < 0 || row >= GRID_ROWS) return null;

    const shift = row % 2 === 1 ? OFFSET : 0;
    const col = Math.floor((px - PADDING_X - shift) / STEP_X);
    if (col < 0 || col >= GRID_COLS) return null;

    // Rectangular hit test (flat beads are square)
    const center = cellToPixel(row, col);
    const half = (BEAD_W + 2) / 2;  // slightly generous hit area
    if (Math.abs(px - center.x) > half || Math.abs(py - center.y) > half) {
      // Check neighboring columns
      for (const dc of [-1, 1]) {
        const nc = col + dc;
        if (nc < 0 || nc >= GRID_COLS) continue;
        const nc2 = cellToPixel(row, nc);
        if (Math.abs(px - nc2.x) <= half && Math.abs(py - nc2.y) <= half) return { row, col: nc };
      }
      // Check adjacent rows
      for (const dr of [-1, 1]) {
        const nr = row + dr;
        if (nr < 0 || nr >= GRID_ROWS) continue;
        const nshift = nr % 2 === 1 ? OFFSET : 0;
        const nc = Math.floor((px - PADDING_X - nshift) / STEP_X);
        if (nc < 0 || nc >= GRID_COLS) continue;
        const nc2 = cellToPixel(nr, nc);
        if (Math.abs(px - nc2.x) <= half && Math.abs(py - nc2.y) <= half) return { row: nr, col: nc };
      }
    }
    return { row, col };
  }

  function cellKey(row, col) { return `${row},${col}`; }

  // ── Drawing ───────────────────────────────────────────────

  /**
   * Draw a single bead as a filled ellipse with a specular highlight arc.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cx  Center x
   * @param {number} cy  Center y
   * @param {string} color  Fill color
   * @param {boolean} ghost  If true, draw as empty ghost outline
   */
  function drawBead(ctx, cx, cy, color, ghost) {
    const s = BEAD_W;
    const r = 3.5;  // corner radius
    const x = cx - s / 2;
    const y = cy - s / 2;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, r);

    if (ghost) {
      ctx.strokeStyle = 'rgba(100,110,130,0.16)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // Main fill
      ctx.fillStyle = color;
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(0,0,0,0.14)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Subtle top-left highlight to give slight 3D depth
      const grad = ctx.createLinearGradient(x, y, x + s * 0.6, y + s * 0.6);
      grad.addColorStop(0, 'rgba(255,255,255,0.30)');
      grad.addColorStop(1, 'rgba(0,0,0,0.0)');
      ctx.beginPath();
      ctx.roundRect(x, y, s, s, r);
      ctx.fillStyle = grad;
      ctx.fill();

      // Small specular square in top-left corner
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, s * 0.28, s * 0.16, 1.5);
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      ctx.fill();
    }

    ctx.restore();
  }

  let canvas, ctx;

  function renderAll() {
    if (!canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f2f4f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ghost grid first
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const { x, y } = cellToPixel(r, c);
        const key = cellKey(r, c);
        if (!state.beads.has(key)) {
          drawBead(ctx, x, y, null, true);
        }
      }
    }

    // Draw placed beads on top
    for (const [key, color] of state.beads) {
      const [r, c] = key.split(',').map(Number);
      const { x, y } = cellToPixel(r, c);
      drawBead(ctx, x, y, color, false);
    }
  }

  // ── Mouse / touch input ───────────────────────────────────

  let isDown = false;
  let lastKey = null;
  let pendingPush = false;   // push history on mouseup after any change

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      px: (clientX - rect.left) * scaleX,
      py: (clientY - rect.top) * scaleY,
    };
  }

  function applyAtPixel(px, py) {
    const cell = pixelToCell(px, py);
    if (!cell) return;
    const key = cellKey(cell.row, cell.col);
    if (key === lastKey) return;  // don't re-process same cell during drag
    lastKey = key;

    if (state.tool === 'eraser') {
      if (state.beads.has(key)) {
        state.beads.delete(key);
        pendingPush = true;
        renderAll();
      }
    } else {
      const existing = state.beads.get(key);
      if (existing === state.beadColor && isDown) return;  // skip same color re-paint
      state.beads.set(key, state.beadColor);
      pendingPush = true;
      renderAll();
    }
  }

  function onPointerDown(e) {
    e.preventDefault();
    isDown = true;
    lastKey = null;
    pendingPush = false;
    const { px, py } = getCanvasPos(e);
    applyAtPixel(px, py);
  }

  function onPointerMove(e) {
    e.preventDefault();
    if (!isDown) return;
    const { px, py } = getCanvasPos(e);
    applyAtPixel(px, py);
  }

  function onPointerUp(e) {
    if (!isDown) return;
    isDown = false;
    if (pendingPush) {
      pushHistory();
      pendingPush = false;
    }
  }

  // ── Export PNG ────────────────────────────────────────────

  function exportPNG() {
    // Find bounding box of placed beads + small margin
    if (state.beads.size === 0) {
      alert('Place some beads first!');
      return;
    }

    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    for (const key of state.beads.keys()) {
      const [r, c] = key.split(',').map(Number);
      minR = Math.min(minR, r); maxR = Math.max(maxR, r);
      minC = Math.min(minC, c); maxC = Math.max(maxC, c);
    }

    // Pixel bounds
    const margin = STEP_X;
    let px1 = Infinity, py1 = Infinity, px2 = -Infinity, py2 = -Infinity;
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const { x, y } = cellToPixel(r, c);
        px1 = Math.min(px1, x - BEAD_W / 2);
        py1 = Math.min(py1, y - BEAD_H / 2);
        px2 = Math.max(px2, x + BEAD_W / 2);
        py2 = Math.max(py2, y + BEAD_H / 2);
      }
    }
    px1 -= margin; py1 -= margin; px2 += margin; py2 += margin;

    const w = px2 - px1;
    const h = py2 - py1;

    const offscreen = document.createElement('canvas');
    offscreen.width = w * 2;   // 2× for retina
    offscreen.height = h * 2;
    const octx = offscreen.getContext('2d');
    octx.scale(2, 2);
    octx.fillStyle = '#f2f4f7';
    octx.fillRect(0, 0, w, h);
    octx.translate(-px1, -py1);

    // Draw all ghosts
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const { x, y } = cellToPixel(r, c);
        const key = cellKey(r, c);
        if (!state.beads.has(key)) drawBead(octx, x, y, null, true);
      }
    }
    // Draw placed beads
    for (const [key, color] of state.beads) {
      const [r, c] = key.split(',').map(Number);
      if (r < minR || r > maxR || c < minC || c > maxC) continue;
      const { x, y } = cellToPixel(r, c);
      drawBead(octx, x, y, color, false);
    }

    offscreen.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'peyote-pattern.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // ── Tool UI ───────────────────────────────────────────────

  function setTool(tool) {
    state.tool = tool;
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
  }

  function setColor(color) {
    state.beadColor = color;
    const dot = document.getElementById('bead-color-dot');
    if (dot) dot.style.background = color;
    // Mark active swatch
    document.querySelectorAll('#bead-palette .swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.color === color);
    });
  }

  // ── Canvas sizing ─────────────────────────────────────────

  function computeGridSize() {
    const editor = document.querySelector('.editor');
    if (!editor || !canvas) return;
    const w = editor.clientWidth;
    const h = editor.clientHeight;
    GRID_COLS = Math.max(4, Math.floor((w - OFFSET - PADDING_X * 2) / STEP_X));
    GRID_ROWS = Math.max(4, Math.floor((h - PADDING_Y * 2) / STEP_Y));
    canvas.width  = GRID_COLS * STEP_X + OFFSET + PADDING_X * 2;
    canvas.height = GRID_ROWS * STEP_Y + PADDING_Y * 2;
    state.gridCols = GRID_COLS;
    state.gridRows = GRID_ROWS;
  }

  // ── Init ──────────────────────────────────────────────────

  function init() {
    canvas = document.getElementById('peyote-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Size canvas to fill editor
    computeGridSize();

    // Mouse events
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('mouseleave', onPointerUp);

    // Touch events
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchmove', onPointerMove, { passive: false });
    canvas.addEventListener('touchend', onPointerUp);

    // Tool buttons
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => setTool(btn.dataset.tool));
    });

    // Undo / Redo / Reset
    document.getElementById('btn-undo')?.addEventListener('click', undo);
    document.getElementById('btn-redo')?.addEventListener('click', redo);
    document.getElementById('btn-reset')?.addEventListener('click', () => {
      if (state.beads.size === 0) return;
      if (!confirm('Clear all beads?')) return;
      state.beads.clear();
      pushHistory();
      renderAll();
    });

    // Export
    document.getElementById('export-btn')?.addEventListener('click', exportPNG);

    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        computeGridSize();
        renderAll();
      }, 120);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'z' || e.key === 'Z') {
        if (e.ctrlKey || e.metaKey) {
          if (e.shiftKey) redo(); else undo();
          e.preventDefault();
        }
      }
      if (e.key === 'y' || e.key === 'Y') {
        if (e.ctrlKey || e.metaKey) { redo(); e.preventDefault(); }
      }
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 'b' || e.key === 'B') setTool('bead');
        if (e.key === 'e' || e.key === 'E') setTool('eraser');
      }
    });

    // Initial history snapshot
    pushHistory();
    renderAll();
    updateUndoRedo();
  }

  // Expose helpers for tutorial
  window.peyoteState  = state;
  window.peyoteRender = renderAll;
  window.pushHistory  = pushHistory;
  window.setBeadColor = setColor;
  window.setBeadTool  = setTool;
  window.cellKey      = cellKey;

  document.addEventListener('DOMContentLoaded', init);
})();
