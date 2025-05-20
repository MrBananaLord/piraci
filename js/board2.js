// js/board.js
// Generates a hex-like offset board and marks the middle tile

document.addEventListener('DOMContentLoaded', function () {
  const boardContainer = document.getElementById('plansza2-content');
  const numRows = 21;
  const numCols = 21;
  const squareSize = 32; // px
  const board = document.createElement('div');
  board.style.display = 'flex';
  board.style.flexDirection = 'column';
  board.style.alignItems = 'center';
  board.style.justifyContent = 'center';
  board.style.margin = '0 auto';

  // Find the middle tile coordinates
  const midRow = Math.floor(numRows / 2);
  const midCol = Math.floor(numCols / 2);

  for (let row = 0; row < numRows; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.style.display = 'flex';
    rowDiv.style.marginBottom = '0';
    for (let col = 0; col < numCols; col++) {
      const square = document.createElement('div');
      square.style.width = squareSize + 'px';
      square.style.height = squareSize + 'px';
      square.style.border = '1px solid #bbb';
      square.style.background = '#f4f4f4';
      square.style.boxSizing = 'border-box';
      square.style.display = 'inline-block';
      square.style.position = 'relative';
      // Mark the middle tile
      if (row === midRow && col === midCol) {
        square.title = 'Środek';
        // No special background or border for the center tile
        // Add pirate ship icon
        const ship = document.createElement('span');
        ship.textContent = '⛵️';
        ship.className = 'ship-icon';
        ship.style.position = 'absolute';
        ship.style.left = '50%';
        ship.style.top = '50%';
        ship.style.transform = 'translate(-50%, -50%)';
        ship.style.fontSize = '1.5em';
        square.appendChild(ship);
      }
      rowDiv.appendChild(square);
    }
    board.appendChild(rowDiv);
  }
  boardContainer.innerHTML = '';
  boardContainer.appendChild(board);

  // Track ship position
  let shipRow = midRow;
  let shipCol = midCol;

  // Helper to render the ship at the current position
  function renderShip() {
    // Remove all ships
    for (let r = 0; r < numRows; r++) {
      const rowDiv = board.children[r];
      if (!rowDiv) continue;
      for (let c = 0; c < rowDiv.children.length; c++) {
        const tile = rowDiv.children[c];
        if (!tile) continue;
        // Remove any ship icon
        const ship = tile.querySelector('.ship-icon');
        if (ship) tile.removeChild(ship);
        // Restore center tile background if needed
        if (r === midRow && c === midCol) {
          tile.style.background = '#f4f4f4';
          tile.style.border = '1px solid #bbb';
        } else {
          tile.style.background = '#f4f4f4';
          tile.style.border = '1px solid #bbb';
        }
      }
    }
    // Add ship to current position
    const rowDiv = board.children[shipRow];
    if (rowDiv) {
      const tile = rowDiv.children[shipCol];
      if (tile) {
        const ship = document.createElement('span');
        ship.textContent = '⛵️';
        ship.className = 'ship-icon';
        ship.style.position = 'absolute';
        ship.style.left = '50%';
        ship.style.top = '50%';
        ship.style.transform = 'translate(-50%, -50%)';
        ship.style.fontSize = '1.5em';
        tile.appendChild(ship);
        tile.style.background = '#ffe082';
        tile.style.border = '2px solid #ff9800';
      }
    }
  }

  // Helper: get adjacent tiles for regular grid (8 directions)
  function getAdjacent(row, col) {
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
      if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols) {
        adj.push([nr, nc]);
      }
    }
    return adj;
  }

  // Map wind directions to movement vectors (N, NE, E, SE, S, SW, W, NW, 0)
  const windVectors = {
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
  let selectedWind = '0';

  // Helper to get direction between two tiles on a regular grid (8 directions)
  function getDirection(fromRow, fromCol, toRow, toCol) {
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

  // Clear previous highlights
  function clearMovementRange() {
    for (let r = 0; r < numRows; r++) {
      const rowDiv = board.children[r];
      if (!rowDiv) continue;
      for (let c = 0; c < rowDiv.children.length; c++) {
        rowDiv.children[c].style.boxShadow = '';
      }
    }
  }

  // Add side input for "Ruch" and "Wiatr"
  const sidePanel = document.createElement('div');
  sidePanel.style.position = 'absolute';
  sidePanel.style.top = '32px';
  sidePanel.style.right = '32px';
  sidePanel.style.background = '#fff';
  sidePanel.style.border = '1px solid #ccc';
  sidePanel.style.borderRadius = '8px';
  sidePanel.style.padding = '16px 20px';
  sidePanel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  sidePanel.style.display = 'flex';
  sidePanel.style.flexDirection = 'column';
  sidePanel.style.alignItems = 'center';
  sidePanel.innerHTML = `
    <label for="move-input" style="font-weight:bold; margin-bottom:6px;">Ruch</label>
    <input id="move-input" type="number" min="0" value="2" style="width:60px; text-align:center; font-size:1.1em; margin-bottom:18px;">
    <label for="step-input" style="font-weight:bold; margin-bottom:6px;">Kroki</label>
    <input id="step-input" type="number" min="1" max="5" value="1" style="width:60px; text-align:center; font-size:1.1em; margin-bottom:18px;">
    <div style="margin-bottom:6px; font-weight:bold;">Wiatr</div>
    <div id="wind-buttons" style="display:grid; grid-template-columns:repeat(3,32px); grid-template-rows:repeat(3,32px); grid-gap:4px; margin-bottom:6px; justify-items:center; align-items:center; justify-content:center;">
      <button type="button" class="wind-btn" data-dir="↖" title="NW" style="width:32px; height:32px; font-size:1.2em; padding:0;">↖</button>
      <button type="button" class="wind-btn" data-dir="↑" title="N" style="width:32px; height:32px; font-size:1.2em; padding:0;">↑</button>
      <button type="button" class="wind-btn" data-dir="↗" title="NE" style="width:32px; height:32px; font-size:1.2em; padding:0;">↗</button>
      <button type="button" class="wind-btn" data-dir="←" title="W" style="width:32px; height:32px; font-size:1.2em; padding:0;">←</button>
      <button type="button" class="wind-btn" data-dir="0" title="Brak wiatru" style="width:32px; height:32px; font-size:1.2em; padding:0;">•</button>
      <button type="button" class="wind-btn" data-dir="→" title="E" style="width:32px; height:32px; font-size:1.2em; padding:0;">→</button>
      <button type="button" class="wind-btn" data-dir="↙" title="SW" style="width:32px; height:32px; font-size:1.2em; padding:0;">↙</button>
      <button type="button" class="wind-btn" data-dir="↓" title="S" style="width:32px; height:32px; font-size:1.2em; padding:0;">↓</button>
      <button type="button" class="wind-btn" data-dir="↘" title="SE" style="width:32px; height:32px; font-size:1.2em; padding:0;">↘</button>
    </div>
  `;

  // Initial movement range
  const moveInput = sidePanel.querySelector('#move-input');
  const stepInput = sidePanel.querySelector('#step-input');
  function updateMovementRange() {
    clearMovementRange();
    renderShip();
    const moveVal = parseFloat(moveInput.value);
    const stepVal = parseInt(stepInput.value);
    if (isNaN(moveVal) || moveVal <= 0 || isNaN(stepVal) || stepVal <= 0) return;

    // For each step, calculate reachable tiles with wind and diagonal cost
    const greenShades = ['#a5d6a7', '#66bb6a', '#43a047', '#2e7d32', '#1b5e20'];
    // Track which step each tile is first reached at
    const stepReached = Array.from({ length: numRows }, () => Array(numCols).fill(0));
    for (let s = 1; s <= stepVal; s++) {
      // Dijkstra for this step
      const costs = Array.from({ length: numRows }, () => Array(numCols).fill(Infinity));
      const queue = [];
      queue.push({ row: shipRow, col: shipCol, cost: 0 });
      costs[shipRow][shipCol] = 0;
      while (queue.length > 0) {
        const { row, col, cost } = queue.shift();
        const adj = getAdjacent(row, col);
        for (const [nr, nc] of adj) {
          const dr = nr - row;
          const dc = nc - col;
          let moveCost = (Math.abs(dr) === 1 && Math.abs(dc) === 1) ? 1.5 : 1;
          // Wind logic: cheaper in wind dir, more expensive in opposite
          if (selectedWind !== '0') {
            const dir = getDirection(row, col, nr, nc);
            if (dir === selectedWind) moveCost *= 0.5;
            else {
              // Opposite direction
              const windOrder = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
              const oppDir = windOrder[(windOrder.indexOf(selectedWind) + 4) % 8];
              if (dir === oppDir) moveCost *= 2;
            }
          }
          const newCost = cost + moveCost;
          if (newCost <= moveVal * s && newCost < costs[nr][nc]) {
            costs[nr][nc] = newCost;
            queue.push({ row: nr, col: nc, cost: newCost });
            // Mark the first step this tile is reached at
            if (stepReached[nr][nc] === 0 && !(nr === shipRow && nc === shipCol)) {
              stepReached[nr][nc] = s;
            }
          }
        }
      }
    }
    // Highlight all reachable tiles for each step except the ship's current position
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const s = stepReached[r][c];
        if (s > 0) {
          const tile = board.children[r].children[c];
          const idx = Math.min(s - 1, greenShades.length - 1);
          tile.style.boxShadow = `0 0 0 3px ${greenShades[idx]} inset`;
        }
      }
    }
  }

  moveInput.addEventListener('input', updateMovementRange);
  stepInput.addEventListener('input', updateMovementRange);
  updateMovementRange();

  // Only add to board tab
  if (boardContainer) {
    boardContainer.style.position = 'relative';
    boardContainer.appendChild(sidePanel);
  }
  // Wind button logic
  const windBtns = sidePanel.querySelectorAll('.wind-btn');

  windBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      windBtns.forEach(b => b.style.background = '');
      btn.style.background = '#ffe082';
      selectedWind = btn.dataset.dir;
      updateMovementRange(); // update highlights on wind change
    });
  });
  // Set default wind to 'no wind'
  windBtns.forEach(btn => {
    if (btn.dataset.dir === '0') btn.style.background = '#ffe082';
  });

  // Add click handler to move ship
  for (let r = 0; r < numRows; r++) {
    const rowDiv = board.children[r];
    if (!rowDiv) continue;
    for (let c = 0; c < rowDiv.children.length; c++) {
      const tile = rowDiv.children[c];
      if (!tile) continue;
      tile.addEventListener('click', function () {
        // Remove ship from previous position
        const prevRowDiv = board.children[shipRow];
        if (prevRowDiv) {
          const prevTile = prevRowDiv.children[shipCol];
          if (prevTile) {
            const prevShip = prevTile.querySelector('.ship-icon');
            if (prevShip) prevTile.removeChild(prevShip);
          }
        }
        shipRow = r;
        shipCol = c;
        updateMovementRange();
      });
    }
  }

  // Initial render
  renderShip();
  moveInput.addEventListener('input', updateMovementRange);
  stepInput.addEventListener('input', updateMovementRange);
  updateMovementRange();
});
