document.addEventListener("DOMContentLoaded", function () {
  const dashboard = document.getElementById("dashboard");
  const gridBackground = document.getElementById("grid-background");
  const addWidgetBtn = document.getElementById("add-widget");
  const addColumnBtn = document.getElementById("add-column");
  const removeColumnBtn = document.getElementById("remove-column");
  const gapSlider = document.getElementById("gap-slider");
  const gapValue = document.getElementById("gap-value");

  let widgetCounter = 1;
  let columnCount = 1;
  let gap = 10;
  let cellSize = 50; // Taille d'une cellule de la grille

  // Initialisation
  updateGrid();

  // Configuration d'Interact.js pour le magnétisme strict
  interact(".widget")
    .draggable({
      inertia: false,
      autoScroll: true,
      onmove: dragMoveListener,
      modifiers: [
        interact.modifiers.snap({
          targets: [
            interact.snappers.grid({ x: cellSize + gap, y: cellSize + gap }),
          ],
          range: Infinity,
          relativePoints: [{ x: 0, y: 0 }],
        }),
        interact.modifiers.restrictRect({
          restriction: "parent",
          endOnly: true,
        }),
      ],
    })
    .resizable({
      edges: { right: true, bottom: true },
      listeners: { move: resizeMoveListener },
      modifiers: [
        interact.modifiers.snap({
          targets: [
            interact.snappers.grid({ x: cellSize + gap, y: cellSize + gap }),
          ],
          range: Infinity,
        }),
        interact.modifiers.restrictSize({
          min: { width: cellSize, height: cellSize },
        }),
      ],
    });

  // Ajouter un widget
  addWidgetBtn.addEventListener("click", function () {
    const widget = document.createElement("div");
    widget.className = "widget";
    widget.innerHTML = `
            <div class="widget-header">Widget ${widgetCounter++}</div>
            <div class="resize-handle"></div>
        `;
    widget.style.width = `${cellSize * 2 + gap}px`;
    widget.style.height = `${cellSize * 2 + gap}px`;
    dashboard.appendChild(widget);
    interact(widget)
      .draggable({ onmove: dragMoveListener })
      .resizable({
        edges: { right: true, bottom: true },
        listeners: { move: resizeMoveListener },
      });
  });

  // Ajouter une colonne
  addColumnBtn.addEventListener("click", function () {
    columnCount++;
    updateGrid();
  });

  // Retirer une colonne
  removeColumnBtn.addEventListener("click", function () {
    if (columnCount > 1) {
      columnCount--;
      updateGrid();
    }
  });

  // Modifier le gap
  gapSlider.addEventListener("input", function () {
    gap = parseInt(this.value);
    gapValue.textContent = gap;
    dashboard.style.gap = `${gap}px`;
    updateGrid();
  });

  // Mise à jour de la grille et du fond
  function updateGrid() {
    dashboard.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
    gridBackground.style.backgroundSize = `${cellSize + gap}px ${cellSize + gap}px`;
  }

  // Déplacement avec magnétisme
  function dragMoveListener(event) {
    const target = event.target;
    const x =
      Math.round(
        (parseFloat(target.getAttribute("data-x")) || 0) +
          event.dx / (cellSize + gap),
      ) *
      (cellSize + gap);
    const y =
      Math.round(
        (parseFloat(target.getAttribute("data-y")) || 0) +
          event.dy / (cellSize + gap),
      ) *
      (cellSize + gap);
    target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
  }

  // Redimensionnement avec magnétisme
  function resizeMoveListener(event) {
    const target = event.target;
    const width =
      Math.round(event.rect.width / (cellSize + gap)) * (cellSize + gap);
    const height =
      Math.round(event.rect.height / (cellSize + gap)) * (cellSize + gap);
    target.style.width = `${width}px`;
    target.style.height = `${height}px`;
  }
});
