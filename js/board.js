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

  // Visualize movement range from (midRow, midCol)
  function showMovementRange(startRow, startCol, movement) {
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
      if (!(r === startRow && c === startCol)) {
        const rowDiv = board.children[r];
        if (rowDiv) {
          const tile = rowDiv.children[c];
          if (tile) tile.style.boxShadow = '0 0 0 3px #43a047 inset'; // green
        }
      }
      if (dist === movement) continue;
      for (const [nr, nc] of getAdjacent(r, c)) {
        if (!visited[nr][nc]) {
          visited[nr][nc] = true;
          queue.push([nr, nc, dist + 1]);
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
    <div style="margin-bottom:6px; font-weight:bold;">Wiatr</div>
    <div id="wind-buttons" style="display:grid; grid-template-columns:repeat(3,32px); grid-gap:4px; margin-bottom:6px; justify-items:center; align-items:center; justify-content:center;">
      <button type="button" class="wind-btn" data-dir="↖" title="Północny zachód" style="width:32px; height:32px; font-size:1.2em; padding:0;">↖</button>
      <button type="button" class="wind-btn" data-dir="↑" title="Północ" style="width:32px; height:32px; font-size:1.2em; padding:0;">↑</button>
      <button type="button" class="wind-btn" data-dir="↗" title="Północny wschód" style="width:32px; height:32px; font-size:1.2em; padding:0;">↗</button>
      <button type="button" class="wind-btn" data-dir="←" title="Zachód" style="width:32px; height:32px; font-size:1.2em; padding:0;">←</button>
      <button type="button" class="wind-btn" data-dir="0" title="Brak wiatru" style="width:32px; height:32px; font-size:1.2em; padding:0;">•</button>
      <button type="button" class="wind-btn" data-dir="→" title="Wschód" style="width:32px; height:32px; font-size:1.2em; padding:0;">→</button>
      <button type="button" class="wind-btn" data-dir="↙" title="Południowy zachód" style="width:32px; height:32px; font-size:1.2em; padding:0;">↙</button>
      <button type="button" class="wind-btn" data-dir="↓" title="Południe" style="width:32px; height:32px; font-size:1.2em; padding:0;">↓</button>
      <button type="button" class="wind-btn" data-dir="↘" title="Południowy wschód" style="width:32px; height:32px; font-size:1.2em; padding:0;">↘</button>
    </div>
  `;

  // Initial movement range
  const moveInput = sidePanel.querySelector('#move-input');
  function updateMovementRange() {
    clearMovementRange();
    const val = parseInt(moveInput.value);
    if (!isNaN(val) && val > 0) {
      showMovementRange(midRow, midCol, val);
    }
  }
  moveInput.addEventListener('input', updateMovementRange);
  updateMovementRange();

  // Only add to board tab
  if (boardContainer) {
    boardContainer.style.position = 'relative';
    boardContainer.appendChild(sidePanel);
  }
  // Wind button logic
  const windBtns = sidePanel.querySelectorAll('.wind-btn');
  let selectedWind = '0';
  windBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      windBtns.forEach(b => b.style.background = '');
      btn.style.background = '#ffe082';
      selectedWind = btn.dataset.dir;
    });
  });
  // Set default wind to 'no wind'
  windBtns.forEach(btn => {
    if (btn.dataset.dir === '0') btn.style.background = '#ffe082';
  });
});
