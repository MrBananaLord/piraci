// js/board.js
// Generates a hex-like offset board and marks the middle tile

document.addEventListener('DOMContentLoaded', function () {
  const boardContainer = document.getElementById('plansza-content');
  const numRows = 21;
  const squaresPerRow = [21, 20]; // even: 21, odd: 20
  const squareSize = 32; // px
  const board = document.createElement('div');
  board.style.display = 'flex';
  board.style.flexDirection = 'column';
  board.style.alignItems = 'center';
  board.style.justifyContent = 'center';
  board.style.margin = '0 auto';

  // Find the middle tile coordinates
  const midRow = Math.floor(numRows / 2);
  const midCol = 10; // for 21-squares row, 0-based

  for (let row = 0; row < numRows; row++) {
    const isEven = row % 2 === 0;
    const rowDiv = document.createElement('div');
    rowDiv.style.display = 'flex';
    rowDiv.style.marginBottom = '0'; // removed spacing between rows
    const numSquares = isEven ? 21 : 20;
    for (let col = 0; col < numSquares; col++) {
      const square = document.createElement('div');
      square.style.width = squareSize + 'px';
      square.style.height = squareSize + 'px';
      square.style.border = '1px solid #bbb';
      square.style.background = '#f4f4f4';
      square.style.boxSizing = 'border-box';
      square.style.display = 'inline-block';
      square.style.position = 'relative';
      // Mark the middle tile
      if (row === midRow && isEven && col === midCol) {
        square.style.background = '#ffe082';
        square.style.border = '2px solid #ff9800';
        square.title = 'Środek';
        // Add pirate ship icon
        const ship = document.createElement('span');
        ship.textContent = '⛵️';
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
          tile.style.background = '#ffe082';
          tile.style.border = '2px solid #ff9800';
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

  // Helper: get adjacent tiles for offset grid
  function getAdjacent(row, col) {
    // Even row: offset right, Odd row: offset left
    // For even rows, the NE/SE are (row-1,col+1)/(row+1,col+1)
    // For odd rows, the NE/SE are (row-1,col)/(row+1,col)
    const isEven = row % 2 === 0;
    const adj = [];
    // N
    if (row > 0) adj.push([row - 1, col]);
    // S
    if (row < numRows - 1) adj.push([row + 1, col]);
    // W
    if (col > 0) adj.push([row, col - 1]);
    // E
    if ((isEven && col < 20) || (!isEven && col < 19)) adj.push([row, col + 1]);
    // NW
    if (row > 0) adj.push([row - 1, isEven ? col - 1 : col]);
    // NE
    if (row > 0) adj.push([row - 1, isEven ? col : col + 1]);
    // SW
    if (row < numRows - 1) adj.push([row + 1, isEven ? col - 1 : col]);
    // SE
    if (row < numRows - 1) adj.push([row + 1, isEven ? col : col + 1]);
    // Filter out-of-bounds
    return adj.filter(([r, c]) => {
      const even = r % 2 === 0;
      const maxCol = even ? 20 : 19;
      return r >= 0 && r < numRows && c >= 0 && c <= maxCol;
    });
  }

  // Map wind directions to movement vectors (N, S, W, E only)
  const windVectors = {
    '↑': [-1, 0],
    '→': [0, 1],
    '↓': [1, 0],
    '←': [0, -1],
    '0': [0, 0], // no wind
  };
  let selectedWind = '0';

  // Helper to get direction vector between two tiles
  function getDirection(fromRow, fromCol, toRow, toCol) {
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

  // Visualize movement range from (midRow, midCol)
  function showMovementRange(startRow, startCol, movement, step, maxStep) {
    // BFS to find all tiles within movement points
    const visited = Array.from({ length: numRows }, (_, r) =>
      Array(r % 2 === 0 ? 21 : 20).fill(false)
    );
    const queue = [[startRow, startCol, 0]];
    visited[startRow][startCol] = true;
    while (queue.length) {
      const [r, c, dist] = queue.shift();
      if (dist > movement) continue;
      // Mark tile visually (skip ship tile)
      if (!(r === startRow && c === startCol) && dist > (movement - (parseInt(moveInput.value) || 1))) {
        const rowDiv = board.children[r];
        if (rowDiv) {
          const tile = rowDiv.children[c];
          if (tile) {
            // Calculate green shade based on step
            const greenShades = ['#a5d6a7', '#66bb6a', '#43a047', '#2e7d32', '#1b5e20'];
            const idx = Math.min(step - 1, greenShades.length - 1);
            tile.style.boxShadow = `0 0 0 3px ${greenShades[idx]} inset`;
          }
        }
      }
      if (dist === movement) continue;
      for (const [nr, nc] of getAdjacent(r, c)) {
        if (!visited[nr][nc]) {
          // Wind logic: get direction from (r,c) to (nr,nc)
          const dir = getDirection(r, c, nr, nc);
          let cost = 1;
          if (selectedWind !== '0') {
            // Determine movement axis, handle offset grid for left/right
            const colChange = nc - c;
            const rowChange = nr - r;
            // For left/right, treat as left if colChange < 0 or (colChange === 0 and rowChange !== 0 and nc !== c)
            // For right, treat as right if colChange > 0 or (colChange === 0 and rowChange !== 0 and nc !== c)
            const isLeft = (colChange < 0) || (colChange === 0 && rowChange !== 0 && nc < c);
            const isRight = (colChange > 0) || (colChange === 0 && rowChange !== 0 && nc > c);
            if (selectedWind === '↑' && nr < r) {
              cost = 0.5;
            } else if (selectedWind === '↓' && nr > r) {
              cost = 0.5;
            } else if (selectedWind === '←' && isLeft) {
              cost = 0.5;
            } else if (selectedWind === '→' && isRight) {
              cost = 0.5;
            } else if (selectedWind === '↑' && nr > r) {
              cost = 2;
            } else if (selectedWind === '↓' && nr < r) {
              cost = 2;
            } else if (selectedWind === '←' && isRight) {
              cost = 2;
            } else if (selectedWind === '→' && isLeft) {
              cost = 2;
            }
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
      <div></div>
      <button type="button" class="wind-btn" data-dir="↑" title="Północ" style="width:32px; height:32px; font-size:1.2em; padding:0;">↑</button>
      <div></div>
      <button type="button" class="wind-btn" data-dir="←" title="Zachód" style="width:32px; height:32px; font-size:1.2em; padding:0;">←</button>
      <button type="button" class="wind-btn" data-dir="0" title="Brak wiatru" style="width:32px; height:32px; font-size:1.2em; padding:0;">•</button>
      <button type="button" class="wind-btn" data-dir="→" title="Wschód" style="width:32px; height:32px; font-size:1.2em; padding:0;">→</button>
      <div></div>
      <button type="button" class="wind-btn" data-dir="↓" title="Południe" style="width:32px; height:32px; font-size:1.2em; padding:0;">↓</button>
      <div></div>
    </div>
  `;

  // Initial movement range
  const moveInput = sidePanel.querySelector('#move-input');
  const stepInput = sidePanel.querySelector('#step-input');
  function updateMovementRange() {
    clearMovementRange();
    renderShip();
    const moveVal = parseInt(moveInput.value);
    const stepVal = parseInt(stepInput.value);
    if (!isNaN(moveVal) && moveVal > 0 && !isNaN(stepVal) && stepVal > 0) {
      for (let s = 1; s <= stepVal; s++) {
        showMovementRange(shipRow, shipCol, moveVal * s, s, stepVal);
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
