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
    this.drawAllRhumbLines();
    this.drawCardinalDirections();
    this.drawIntersectionPoints();
  }

  drawAllRhumbLines() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(this.width, this.height) / 2.5 - 5;

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

    // Draw additional rhumb lines from NE point
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    const neX = centerX + maxRadius * 0.707;
    const neY = centerY - maxRadius * 0.707;

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = getDistanceToEdge(neX, neY, angle);
      const endX = neX + Math.cos(angle) * distance;
      const endY = neY + Math.sin(angle) * distance;

      this.ctx.beginPath();
      this.ctx.moveTo(neX, neY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Draw additional rhumb lines from NW point
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    const nwX = centerX - maxRadius * 0.707;
    const nwY = centerY - maxRadius * 0.707;

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = getDistanceToEdge(nwX, nwY, angle);
      const endX = nwX + Math.cos(angle) * distance;
      const endY = nwY + Math.sin(angle) * distance;

      this.ctx.beginPath();
      this.ctx.moveTo(nwX, nwY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Draw additional rhumb lines from SE point
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    const seX = centerX + maxRadius * 0.707;
    const seY = centerY + maxRadius * 0.707;

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = getDistanceToEdge(seX, seY, angle);
      const endX = seX + Math.cos(angle) * distance;
      const endY = seY + Math.sin(angle) * distance;

      this.ctx.beginPath();
      this.ctx.moveTo(seX, seY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Draw additional rhumb lines from SW point
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    const swX = centerX - maxRadius * 0.707;
    const swY = centerY + maxRadius * 0.707;

    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = getDistanceToEdge(swX, swY, angle);
      const endX = swX + Math.cos(angle) * distance;
      const endY = swY + Math.sin(angle) * distance;

      this.ctx.beginPath();
      this.ctx.moveTo(swX, swY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }


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

  drawCardinalDirections() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(this.width, this.height) / 2.5 - 5;

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

    // Draw center label
    this.ctx.fillStyle = '#2C3E50';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('START', centerX, centerY + 25);

    // Draw additional source points
    const sourcePoints = [
      { x: centerX, y: centerY - maxRadius, color: '#FF0000', label: 'N' },
      { x: centerX, y: centerY + maxRadius, color: '#FF0000', label: 'S' },
      { x: centerX + maxRadius, y: centerY, color: '#FF0000', label: 'E' },
      { x: centerX - maxRadius, y: centerY, color: '#FF0000', label: 'W' },
      { x: centerX + maxRadius * 0.707, y: centerY - maxRadius * 0.707, color: '#FF0000', label: 'NE' },
      { x: centerX - maxRadius * 0.707, y: centerY - maxRadius * 0.707, color: '#FF0000', label: 'NW' },
      { x: centerX + maxRadius * 0.707, y: centerY + maxRadius * 0.707, color: '#FF0000', label: 'SE' },
      { x: centerX - maxRadius * 0.707, y: centerY + maxRadius * 0.707, color: '#FF0000', label: 'SW' },
      { x: centerX, y: centerY, color: '#FF0000', label: 'CENTER' }
    ];

    sourcePoints.forEach(point => {
      // Draw source point - all same size red circles
      this.ctx.fillStyle = point.color;
      this.ctx.strokeStyle = '#8B0000';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();

      // Draw source label
      this.ctx.fillStyle = '#2C3E50';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.fillText(point.label, point.x, point.y + 15);
    });
  }

  drawIntersectionPoints() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(this.width, this.height) / 2.5 - 5;

    // Define all line segments
    const lines = [];

    // Lines from center
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = this.getDistanceToEdge(centerX, centerY, angle);
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;
      lines.push({ x1: centerX, y1: centerY, x2: endX, y2: endY });
    }

    // Lines from North point
    const northX = centerX;
    const northY = centerY - maxRadius;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = this.getDistanceToEdge(northX, northY, angle);
      const endX = northX + Math.cos(angle) * distance;
      const endY = northY + Math.sin(angle) * distance;
      lines.push({ x1: northX, y1: northY, x2: endX, y2: endY });
    }

    // Lines from South point
    const southX = centerX;
    const southY = centerY + maxRadius;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = this.getDistanceToEdge(southX, southY, angle);
      const endX = southX + Math.cos(angle) * distance;
      const endY = southY + Math.sin(angle) * distance;
      lines.push({ x1: southX, y1: southY, x2: endX, y2: endY });
    }

    // Lines from East point
    const eastX = centerX + maxRadius;
    const eastY = centerY;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = this.getDistanceToEdge(eastX, eastY, angle);
      const endX = eastX + Math.cos(angle) * distance;
      const endY = eastY + Math.sin(angle) * distance;
      lines.push({ x1: eastX, y1: eastY, x2: endX, y2: endY });
    }

    // Lines from West point
    const westX = centerX - maxRadius;
    const westY = centerY;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = this.getDistanceToEdge(westX, westY, angle);
      const endX = westX + Math.cos(angle) * distance;
      const endY = westY + Math.sin(angle) * distance;
      lines.push({ x1: westX, y1: westY, x2: endX, y2: endY });
    }

    // Lines from NE point
    const neX = centerX + maxRadius * 0.707;
    const neY = centerY - maxRadius * 0.707;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = this.getDistanceToEdge(neX, neY, angle);
      const endX = neX + Math.cos(angle) * distance;
      const endY = neY + Math.sin(angle) * distance;
      lines.push({ x1: neX, y1: neY, x2: endX, y2: endY });
    }

    // Lines from NW point
    const nwX = centerX - maxRadius * 0.707;
    const nwY = centerY - maxRadius * 0.707;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = this.getDistanceToEdge(nwX, nwY, angle);
      const endX = nwX + Math.cos(angle) * distance;
      const endY = nwY + Math.sin(angle) * distance;
      lines.push({ x1: nwX, y1: nwY, x2: endX, y2: endY });
    }

    // Lines from SE point
    const seX = centerX + maxRadius * 0.707;
    const seY = centerY + maxRadius * 0.707;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = this.getDistanceToEdge(seX, seY, angle);
      const endX = seX + Math.cos(angle) * distance;
      const endY = seY + Math.sin(angle) * distance;
      lines.push({ x1: seX, y1: seY, x2: endX, y2: endY });
    }

    // Lines from SW point
    const swX = centerX - maxRadius * 0.707;
    const swY = centerY + maxRadius * 0.707;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const distance = this.getDistanceToEdge(swX, swY, angle);
      const endX = swX + Math.cos(angle) * distance;
      const endY = swY + Math.sin(angle) * distance;
      lines.push({ x1: swX, y1: swY, x2: endX, y2: endY });
    }

    // Find true 3-line intersections
    const threeLineIntersections = [];
    const threshold = 5; // Smaller threshold for more precise detection

    // Check all combinations of 3 lines
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        for (let k = j + 1; k < lines.length; k++) {
          const intersection1 = this.getLineIntersection(lines[i], lines[j]);
          const intersection2 = this.getLineIntersection(lines[j], lines[k]);
          const intersection3 = this.getLineIntersection(lines[i], lines[k]);

          if (intersection1 && intersection2 && intersection3) {
            // Check if all three intersections are close to each other (same point)
            const dist12 = Math.sqrt((intersection1.x - intersection2.x) ** 2 + (intersection1.y - intersection2.y) ** 2);
            const dist13 = Math.sqrt((intersection1.x - intersection3.x) ** 2 + (intersection1.y - intersection3.y) ** 2);
            const dist23 = Math.sqrt((intersection2.x - intersection3.x) ** 2 + (intersection2.y - intersection3.y) ** 2);

            if (dist12 < threshold && dist13 < threshold && dist23 < threshold) {
              // Calculate average position
              const avgX = (intersection1.x + intersection2.x + intersection3.x) / 3;
              const avgY = (intersection1.y + intersection2.y + intersection3.y) / 3;

              threeLineIntersections.push({
                x: avgX,
                y: avgY,
                lines: [i, j, k]
              });
            }
          }
        }
      }
    }

    // Remove duplicate intersections
    const uniqueIntersections = [];
    for (const intersection of threeLineIntersections) {
      let isDuplicate = false;
      for (const existing of uniqueIntersections) {
        const distance = Math.sqrt((intersection.x - existing.x) ** 2 + (intersection.y - existing.y) ** 2);
        if (distance < threshold) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        uniqueIntersections.push(intersection);
      }
    }

    // Draw red circles for true 3-line intersections
    this.ctx.fillStyle = '#FF0000';
    this.ctx.strokeStyle = '#8B0000';
    this.ctx.lineWidth = 3;

    uniqueIntersections.forEach(intersection => {
      this.ctx.beginPath();
      this.ctx.arc(intersection.x, intersection.y, 12, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    });
  }

  getLineIntersection(line1, line2) {
    const x1 = line1.x1, y1 = line1.y1, x2 = line1.x2, y2 = line1.y2;
    const x3 = line2.x1, y3 = line2.y1, x4 = line2.x2, y4 = line2.y2;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 0.001) return null; // Lines are parallel

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const x = x1 + t * (x2 - x1);
      const y = y1 + t * (y2 - y1);
      return { x, y };
    }

    return null;
  }

  getDistanceToEdge(startX, startY, angle) {
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
  }

  setupEventListeners() {
    // Map is now static - no regeneration functionality
  }
}

// Map initialization is now handled by TabManager when the map tab is selected 
