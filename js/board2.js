// Generates a regular grid board and marks the middle tile

class Board2 {
  constructor() {
    this.boardContainer = document.getElementById('plansza2-content');
    this.numRows = 21;
    this.numCols = 21;
    this.squareSize = 32; // px
    this.board = document.createElement('div');

    // Find the middle tile coordinates
    this.midRow = Math.floor(this.numRows / 2);
    this.midCol = Math.floor(this.numCols / 2);

    // Track ship position
    this.shipRow = this.midRow;
    this.shipCol = this.midCol;

    // Wind settings
    this.windVectors = {
      '↑': [-1, 0],
      '↗': [-1, 1],
      '→': [0, 1],
      '↘': [1, 1],
      '↓': [1, 0],
      '↙': [1, -1],
      '←': [0, -1],
      '↖': [-1, -1],
      '0': [0, 0], // no wind
    };
    this.selectedWind = '0';

    this.moveInput = null;
    this.stepInput = null;

    this.init();
  }

  init() {
    if (!this.boardContainer) return;

    this.createBoard();
    this.createSidePanel();
    this.setupEventListeners();

    // Initial render
    this.renderShip();
    this.updateMovementRange();
  }

  createBoard() {
    this.board.className = 'game-board';

    for (let row = 0; row < this.numRows; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'board-row';
      for (let col = 0; col < this.numCols; col++) {
        const square = document.createElement('div');
        square.className = 'board-tile';
        square.style.width = this.squareSize + 'px';
        square.style.height = this.squareSize + 'px';

        // Mark the middle tile
        if (row === this.midRow && col === this.midCol) {
          square.title = 'Środek';
          // Add pirate ship icon
          const ship = document.createElement('span');
          ship.textContent = '⛵️';
          ship.className = 'ship-icon';
          square.appendChild(ship);
        }
        rowDiv.appendChild(square);
      }
      this.board.appendChild(rowDiv);
    }
    this.boardContainer.innerHTML = '';
    this.boardContainer.appendChild(this.board);
  }

  createSidePanel() {
    const sidePanel = document.createElement('div');
    sidePanel.className = 'board-side-panel';
    sidePanel.innerHTML = this.renderSidePanelTemplate();

    this.boardContainer.classList.add('board-container');
    this.boardContainer.appendChild(sidePanel);

    this.moveInput = sidePanel.querySelector('#move-input');
    this.stepInput = sidePanel.querySelector('#step-input');

    // Wind button logic
    const windBtns = sidePanel.querySelectorAll('.wind-btn');
    windBtns.forEach(btn => {
      if (btn.dataset.dir === '0') btn.classList.add('wind-selected');

      btn.addEventListener('click', () => {
        windBtns.forEach(b => b.classList.remove('wind-selected'));
        btn.classList.add('wind-selected');
        this.selectedWind = btn.dataset.dir;
        this.updateMovementRange(); // update highlights on wind change
      });
    });
  }

  setupEventListeners() {
    // Movement range update
    this.moveInput.addEventListener('input', () => this.updateMovementRange());
    this.stepInput.addEventListener('input', () => this.updateMovementRange());

    // Ship movement
    for (let r = 0; r < this.numRows; r++) {
      const rowDiv = this.board.children[r];
      if (!rowDiv) continue;
      for (let c = 0; c < rowDiv.children.length; c++) {
        const tile = rowDiv.children[c];
        if (!tile) continue;
        tile.addEventListener('click', () => {
          this.shipRow = r;
          this.shipCol = c;
          this.updateMovementRange();
        });
      }
    }
  }

  renderShip() {
    // Remove all ships
    for (let r = 0; r < this.numRows; r++) {
      const rowDiv = this.board.children[r];
      if (!rowDiv) continue;
      for (let c = 0; c < rowDiv.children.length; c++) {
        const tile = rowDiv.children[c];
        if (!tile) continue;
        // Remove any ship icon
        const ship = tile.querySelector('.ship-icon');
        if (ship) tile.removeChild(ship);
        // Restore tile styling
        tile.classList.remove('ship-tile');
      }
    }
    // Add ship to current position
    const rowDiv = this.board.children[this.shipRow];
    if (rowDiv) {
      const tile = rowDiv.children[this.shipCol];
      if (tile) {
        const ship = document.createElement('span');
        ship.textContent = '⛵️';
        ship.className = 'ship-icon';
        tile.appendChild(ship);
        tile.classList.add('ship-tile');
      }
    }
  }

  getAdjacent(row, col) {
    const adj = [];
    const dirs = [
      [-1, 0], // N
      [-1, 1], // NE
      [0, 1],  // E
      [1, 1],  // SE
      [1, 0],  // S
      [1, -1], // SW
      [0, -1], // W
      [-1, -1] // NW
    ];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < this.numRows && nc >= 0 && nc < this.numCols) {
        adj.push([nr, nc]);
      }
    }
    return adj;
  }

  getDirection(fromRow, fromCol, toRow, toCol) {
    const dr = toRow - fromRow;
    const dc = toCol - fromCol;
    if (dr === -1 && dc === 0) return '↑';
    if (dr === -1 && dc === 1) return '↗';
    if (dr === 0 && dc === 1) return '→';
    if (dr === 1 && dc === 1) return '↘';
    if (dr === 1 && dc === 0) return '↓';
    if (dr === 1 && dc === -1) return '↙';
    if (dr === 0 && dc === -1) return '←';
    if (dr === -1 && dc === -1) return '↖';
    return null;
  }

  clearMovementRange() {
    for (let r = 0; r < this.numRows; r++) {
      const rowDiv = this.board.children[r];
      if (!rowDiv) continue;
      for (let c = 0; c < rowDiv.children.length; c++) {
        const tile = rowDiv.children[c];
        tile.classList.remove('movement-range');
        for (let s = 1; s <= 5; s++) {
          tile.classList.remove(`step-${s}`);
        }
      }
    }
  }

  updateMovementRange() {
    this.clearMovementRange();
    this.renderShip();
    const moveVal = parseFloat(this.moveInput.value);
    const stepVal = parseInt(this.stepInput.value);
    if (isNaN(moveVal) || moveVal <= 0 || isNaN(stepVal) || stepVal <= 0) return;

    // For each step, calculate reachable tiles with wind and diagonal cost
    const greenShades = ['#a5d6a7', '#66bb6a', '#43a047', '#2e7d32', '#1b5e20'];
    // Track which step each tile is first reached at
    const stepReached = Array.from({ length: this.numRows }, () => Array(this.numCols).fill(0));
    for (let s = 1; s <= stepVal; s++) {
      // Dijkstra for this step
      const costs = Array.from({ length: this.numRows }, () => Array(this.numCols).fill(Infinity));
      const queue = [];
      queue.push({ row: this.shipRow, col: this.shipCol, cost: 0 });
      costs[this.shipRow][this.shipCol] = 0;
      while (queue.length > 0) {
        const { row, col, cost } = queue.shift();
        const adj = this.getAdjacent(row, col);
        for (const [nr, nc] of adj) {
          const dr = nr - row;
          const dc = nc - col;
          let moveCost = (Math.abs(dr) === 1 && Math.abs(dc) === 1) ? 1.5 : 1;
          // Wind logic: cheaper in wind dir, more expensive in opposite
          if (this.selectedWind !== '0') {
            const dir = this.getDirection(row, col, nr, nc);
            if (dir === this.selectedWind) moveCost *= 0.5;
            else {
              // Opposite direction
              const windOrder = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
              const oppDir = windOrder[(windOrder.indexOf(this.selectedWind) + 4) % 8];
              if (dir === oppDir) moveCost *= 2;
            }
          }
          const newCost = cost + moveCost;
          if (newCost <= moveVal * s && newCost < costs[nr][nc]) {
            costs[nr][nc] = newCost;
            queue.push({ row: nr, col: nc, cost: newCost });
            // Mark the first step this tile is reached at
            if (stepReached[nr][nc] === 0 && !(nr === this.shipRow && nc === this.shipCol)) {
              stepReached[nr][nc] = s;
            }
          }
        }
      }
    }
    // Highlight all reachable tiles for each step except the ship's current position
    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        const s = stepReached[r][c];
        if (s > 0) {
          const tile = this.board.children[r].children[c];
          tile.classList.add('movement-range');
          tile.classList.add(`step-${s}`);
        }
      }
    }
  }

  renderSidePanelTemplate() {
    return `
      <label for="move-input" class="board-input-label">Ruch</label>
      <input id="move-input" type="number" min="0" value="2" class="board-input">
      <label for="step-input" class="board-input-label">Kroki</label>
      <input id="step-input" type="number" min="1" max="5" value="1" class="board-input">
      <div class="wind-label">Wiatr</div>
      <div id="wind-buttons" class="wind-button-grid">
        <button type="button" class="wind-btn" data-dir="↖" title="NW">↖</button>
        <button type="button" class="wind-btn" data-dir="↑" title="N">↑</button>
        <button type="button" class="wind-btn" data-dir="↗" title="NE">↗</button>
        <button type="button" class="wind-btn" data-dir="←" title="W">←</button>
        <button type="button" class="wind-btn" data-dir="0" title="Brak wiatru">•</button>
        <button type="button" class="wind-btn" data-dir="→" title="E">→</button>
        <button type="button" class="wind-btn" data-dir="↙" title="SW">↙</button>
        <button type="button" class="wind-btn" data-dir="↓" title="S">↓</button>
        <button type="button" class="wind-btn" data-dir="↘" title="SE">↘</button>
      </div>
    `;
  }
}

// Initialize the board when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  new Board2();
});
