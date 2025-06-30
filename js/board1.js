// Generates a hex-like offset board and marks the middle tile

class Board1 {
  constructor() {
    this.boardContainer = document.getElementById('plansza1-content');
    this.numRows = 21;
    this.squaresPerRow = [21, 20]; // even: 21, odd: 20
    this.squareSize = 32; // px
    this.board = document.createElement('div');

    // Find the middle tile coordinates
    this.midRow = Math.floor(this.numRows / 2);
    this.midCol = 10; // for 21-squares row, 0-based

    // Track ship position
    this.shipRow = this.midRow;
    this.shipCol = this.midCol;

    // Wind settings
    this.windVectors = {
      '↑': [-1, 0],
      '→': [0, 1],
      '↓': [1, 0],
      '←': [0, -1],
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
      const isEven = row % 2 === 0;
      const rowDiv = document.createElement('div');
      rowDiv.className = 'board-row';
      const numSquares = isEven ? 21 : 20;
      for (let col = 0; col < numSquares; col++) {
        const square = document.createElement('div');
        square.className = 'board-tile';
        square.style.width = this.squareSize + 'px';
        square.style.height = this.squareSize + 'px';

        // Mark the middle tile
        if (row === this.midRow && isEven && col === this.midCol) {
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
    // Even row: offset right, Odd row: offset left
    // For even rows, the NE/SE are (row-1,col+1)/(row+1,col+1)
    // For odd rows, the NE/SE are (row-1,col)/(row+1,col)
    const isEven = row % 2 === 0;
    const adj = [];
    // N
    if (row > 0) adj.push([row - 1, col]);
    // S
    if (row < this.numRows - 1) adj.push([row + 1, col]);
    // W
    if (col > 0) adj.push([row, col - 1]);
    // E
    if ((isEven && col < 20) || (!isEven && col < 19)) adj.push([row, col + 1]);
    // NW
    if (row > 0) adj.push([row - 1, isEven ? col - 1 : col]);
    // NE
    if (row > 0) adj.push([row - 1, isEven ? col : col + 1]);
    // SW
    if (row < this.numRows - 1) adj.push([row + 1, isEven ? col - 1 : col]);
    // SE
    if (row < this.numRows - 1) adj.push([row + 1, isEven ? col : col + 1]);
    // Filter out-of-bounds
    return adj.filter(([r, c]) => {
      const even = r % 2 === 0;
      const maxCol = even ? 20 : 19;
      return r >= 0 && r < this.numRows && c >= 0 && c <= maxCol;
    });
  }

  getDirection(fromRow, fromCol, toRow, toCol) {
    // For offset grid, direction is tricky. We'll use the difference and row parity.
    const dr = toRow - fromRow;
    const dc = toCol - fromCol;
    const even = fromRow % 2 === 0;
    // Map to one of 8 directions
    if (dr === -1 && dc === 0) return '↑';
    if (dr === 1 && dc === 0) return '↓';
    if (dc === 1 && dr === 0) return '→';
    if (dc === -1 && dr === 0) return '←';
    if (dr === -1 && ((even && dc === 0) || (!even && dc === 1))) return '↗';
    if (dr === -1 && ((even && dc === -1) || (!even && dc === 0))) return '↖';
    if (dr === 1 && ((even && dc === 0) || (!even && dc === 1))) return '↘';
    if (dr === 1 && ((even && dc === -1) || (!even && dc === 0))) return '↙';
    return null;
  }

  showMovementRange(startRow, startCol, movement, step, maxStep) {
    // BFS to find all tiles within movement points
    const visited = Array.from({ length: this.numRows }, (_, r) =>
      Array(r % 2 === 0 ? 21 : 20).fill(false)
    );
    const queue = [[startRow, startCol, 0]];
    visited[startRow][startCol] = true;
    while (queue.length) {
      const [r, c, dist] = queue.shift();
      if (dist > movement) continue;
      // Mark tile visually (skip ship tile)
      if (!(r === startRow && c === startCol) && dist > (movement - (parseInt(this.moveInput.value) || 1))) {
        const rowDiv = this.board.children[r];
        if (rowDiv) {
          const tile = rowDiv.children[c];
          if (tile) {
            // Add movement highlight
            tile.classList.add('movement-range');
            tile.classList.add(`step-${step}`);
          }
        }
      }
      if (dist === movement) continue;
      for (const [nr, nc] of this.getAdjacent(r, c)) {
        if (!visited[nr][nc]) {
          // Wind logic: get direction from (r,c) to (nr,nc)
          let cost = 1;
          if (this.selectedWind !== '0') {
            // Use getDirection to determine the move direction
            const dir = this.getDirection(r, c, nr, nc);
            if (this.selectedWind === '←') {
              if (dir === '←') cost = 0.5;
              else if (dir === '→') cost = 2;
            } else if (this.selectedWind === '→') {
              if (dir === '→') cost = 0.5;
              else if (dir === '←') cost = 2;
            } else if (this.selectedWind === '↑') {
              if (dir === '↑') cost = 0.5;
              else if (dir === '↓') cost = 2;
            } else if (this.selectedWind === '↓') {
              if (dir === '↓') cost = 0.5;
              else if (dir === '↑') cost = 2;
            }
            // All diagonal/offset moves are always cost 1
          }
          // Only allow if within movement points
          if (dist + cost <= movement) {
            visited[nr][nc] = true;
            queue.push([nr, nc, dist + cost]);
          }
        }
      }
    }
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
    const moveVal = parseInt(this.moveInput.value);
    const stepVal = parseInt(this.stepInput.value);
    if (!isNaN(moveVal) && moveVal > 0 && !isNaN(stepVal) && stepVal > 0) {
      for (let s = 1; s <= stepVal; s++) {
        this.showMovementRange(this.shipRow, this.shipCol, moveVal * s, s, stepVal);
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
        <div></div>
        <button type="button" class="wind-btn" data-dir="↑" title="Północ">↑</button>
        <div></div>
        <button type="button" class="wind-btn" data-dir="←" title="Zachód">←</button>
        <button type="button" class="wind-btn" data-dir="0" title="Brak wiatru">•</button>
        <button type="button" class="wind-btn" data-dir="→" title="Wschód">→</button>
        <div></div>
        <button type="button" class="wind-btn" data-dir="↓" title="Południe">↓</button>
        <div></div>
      </div>
    `;
  }
}

// Initialize the board when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  new Board1();
});
