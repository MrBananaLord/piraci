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
});
