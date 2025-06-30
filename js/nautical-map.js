// Rhumb Lines Map Generator
class RhumbLinesMap {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.init();
  }

  init() {
    this.drawRhumbLines();
    this.setupEventListeners();
  }

  drawRhumbLines() {
    this.clearCanvas();
    this.drawBackground();
    this.drawCompassRose();
    this.drawRhumbLines();
    this.drawCardinalDirections();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawBackground() {
    // Simple light blue background
    this.ctx.fillStyle = '#E6F3FF';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawCompassRose() {
    const x = this.width - 80;
    const y = 80;
    const radius = 40;

    // Draw compass rose
    this.ctx.strokeStyle = '#2C3E50';
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = '#FFFFFF';

    // Outer circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();

    // Inner circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius * 0.6, 0, 2 * Math.PI);
    this.ctx.stroke();

    // Cardinal directions
    const directions = ['N', 'E', 'S', 'W'];
    const angles = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];

    directions.forEach((dir, i) => {
      const angle = angles[i];
      const textX = x + Math.cos(angle) * (radius - 15);
      const textY = y + Math.sin(angle) * (radius - 15);

      this.ctx.fillStyle = '#2C3E50';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(dir, textX, textY + 5);
    });

    // Center point
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  drawRhumbLines() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(this.width, this.height) / 2 - 50;

    // Function to calculate distance to canvas edge
    const getDistanceToEdge = (startX, startY, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      let distance = Infinity;

      // Check intersection with left edge (x = 0)
      if (cos < 0) {
        const d = -startX / cos;
        if (d > 0 && startY + d * sin >= 0 && startY + d * sin <= this.height) {
          distance = Math.min(distance, d);
        }
      }

      // Check intersection with right edge (x = this.width)
      if (cos > 0) {
        const d = (this.width - startX) / cos;
        if (d > 0 && startY + d * sin >= 0 && startY + d * sin <= this.height) {
          distance = Math.min(distance, d);
        }
      }

      // Check intersection with top edge (y = 0)
      if (sin < 0) {
        const d = -startY / sin;
        if (d > 0 && startX + d * cos >= 0 && startX + d * cos <= this.width) {
          distance = Math.min(distance, d);
        }
      }

      // Check intersection with bottom edge (y = this.height)
      if (sin > 0) {
        const d = (this.height - startY) / sin;
        if (d > 0 && startX + d * cos >= 0 && startX + d * cos <= this.width) {
          distance = Math.min(distance, d);
        }
      }

      return distance;
    };

    // Draw rhumb lines from center
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;

    // Draw lines from center in 16 directions (every 22.5 degrees)
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = getDistanceToEdge(centerX, centerY, angle);
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Draw additional rhumb lines from North point
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    const northX = centerX;
    const northY = centerY - maxRadius;

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = getDistanceToEdge(northX, northY, angle);
      const endX = northX + Math.cos(angle) * distance;
      const endY = northY + Math.sin(angle) * distance;

      this.ctx.beginPath();
      this.ctx.moveTo(northX, northY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Draw additional rhumb lines from South point
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    const southX = centerX;
    const southY = centerY + maxRadius;

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = getDistanceToEdge(southX, southY, angle);
      const endX = southX + Math.cos(angle) * distance;
      const endY = southY + Math.sin(angle) * distance;

      this.ctx.beginPath();
      this.ctx.moveTo(southX, southY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Draw additional rhumb lines from East point
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    const eastX = centerX + maxRadius;
    const eastY = centerY;

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = getDistanceToEdge(eastX, eastY, angle);
      const endX = eastX + Math.cos(angle) * distance;
      const endY = eastY + Math.sin(angle) * distance;

      this.ctx.beginPath();
      this.ctx.moveTo(eastX, eastY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Draw additional rhumb lines from West point
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    const westX = centerX - maxRadius;
    const westY = centerY;

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = getDistanceToEdge(westX, westY, angle);
      const endX = westX + Math.cos(angle) * distance;
      const endY = westY + Math.sin(angle) * distance;

      this.ctx.beginPath();
      this.ctx.moveTo(westX, westY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Draw concentric circles for distance reference
    this.ctx.strokeStyle = '#BDC3C7';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);

    for (let i = 1; i <= 5; i++) {
      const radius = (maxRadius / 5) * i;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      this.ctx.stroke();
    }

    this.ctx.setLineDash([]); // Reset line dash
  }

  drawCardinalDirections() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(this.width, this.height) / 2 - 50;

    // Draw cardinal direction labels
    const directions = [
      { text: 'N', angle: 0 },
      { text: 'NE', angle: Math.PI / 4 },
      { text: 'E', angle: Math.PI / 2 },
      { text: 'SE', angle: 3 * Math.PI / 4 },
      { text: 'S', angle: Math.PI },
      { text: 'SW', angle: 5 * Math.PI / 4 },
      { text: 'W', angle: 3 * Math.PI / 2 },
      { text: 'NW', angle: 7 * Math.PI / 4 }
    ];

    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';

    directions.forEach(dir => {
      const x = centerX + Math.cos(dir.angle) * (maxRadius + 30);
      const y = centerY + Math.sin(dir.angle) * (maxRadius + 30);

      this.ctx.fillText(dir.text, x, y + 5);
    });

    // Draw center point
    this.ctx.fillStyle = '#E74C3C';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
    this.ctx.fill();

    // Draw center label
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('START', centerX, centerY + 25);

    // Draw additional source points
    const sourcePoints = [
      { x: centerX, y: centerY - maxRadius, color: '#E74C3C', label: 'N' },
      { x: centerX, y: centerY + maxRadius, color: '#27AE60', label: 'S' },
      { x: centerX + maxRadius, y: centerY, color: '#F39C12', label: 'E' },
      { x: centerX - maxRadius, y: centerY, color: '#9B59B6', label: 'W' }
    ];

    sourcePoints.forEach(point => {
      // Draw source point
      this.ctx.fillStyle = point.color;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      this.ctx.fill();

      // Draw source label
      this.ctx.fillStyle = '#2C3E50';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.fillText(point.label, point.x, point.y + 15);
    });
  }

  setupEventListeners() {
    // Map is now static - no regeneration functionality
  }
}

// Initialize rhumb lines map when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  const mapCanvas = document.getElementById('nautical-map-canvas');
  if (mapCanvas) {
    const rhumbLinesMap = new RhumbLinesMap('nautical-map-canvas');
  }
}); 
