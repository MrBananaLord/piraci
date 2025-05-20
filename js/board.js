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
      }
      rowDiv.appendChild(square);
    }
    board.appendChild(rowDiv);
  }
  boardContainer.innerHTML = '';
  boardContainer.appendChild(board);

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
