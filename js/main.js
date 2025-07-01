// Main application logic

class TabManager {
  constructor() {
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.wydarzeniaSection = document.getElementById('wydarzenia-section');
    this.mapaSection = document.getElementById('mapa-section');
    this.szanseSection = document.getElementById('szanse-section');
    this.wrogowieSection = document.getElementById('wrogowie-section');
    this.mapInitialized = false;

    // Clear any old tab values from localStorage and default to wydarzenia
    const lastTab = localStorage.getItem('selectedTab');
    if (lastTab && !document.getElementById('tab-' + lastTab)) {
      localStorage.removeItem('selectedTab');
      this.lastTab = 'wydarzenia';
    } else {
      this.lastTab = lastTab || 'wydarzenia';
    }

    this.init();
  }

  init() {
    this.selectTab(this.lastTab);

    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectTab(btn.dataset.tab);
      });
    });
  }

  selectTab(tab) {
    // Check if the tab exists before trying to select it
    const tabElement = document.getElementById('tab-' + tab);
    if (!tabElement) {
      tab = 'wydarzenia';
    }

    this.tabBtns.forEach(b => b.setAttribute('aria-selected', 'false'));
    document.getElementById('tab-' + tab).setAttribute('aria-selected', 'true');

    // Hide all sections first
    this.wydarzeniaSection.style.display = 'none';
    this.mapaSection.style.display = 'none';
    this.szanseSection.style.display = 'none';
    this.wrogowieSection.style.display = 'none';

    if (tab === 'wydarzenia') {
      this.wydarzeniaSection.style.display = '';
    } else if (tab === 'mapa') {
      this.mapaSection.style.display = '';

      // Initialize map if not already done
      if (!this.mapInitialized) {
        const mapCanvas = document.getElementById('nautical-map-canvas');
        if (mapCanvas) {
          this.rhumbLinesMap = new RhumbLinesMap('nautical-map-canvas');
          this.mapInitialized = true;
        } else {
          console.error('Map canvas not found');
        }
      }
    } else if (tab === 'szanse') {
      this.szanseSection.style.display = '';
    } else if (tab === 'wrogowie') {
      this.wrogowieSection.style.display = '';
    }

    localStorage.setItem('selectedTab', tab);
  }
}

class ResourceChancesManager {
  constructor(config) {
    this.config = config;
    this.init();
  }

  init() {
    this.renderResourceChances();
    this.renderResourceDetails();
  }

  renderResourceChances() {
    const chancesDisplay = document.getElementById('chances-display');
    if (!chancesDisplay) {
      return;
    }

    // Calculate total weights for each level
    const totalWeights = {};
    Object.values(this.config.resources).forEach(r => {
      [1, 2, 3].forEach(level => {
        if (!totalWeights[level]) totalWeights[level] = 0;
        totalWeights[level] += r.weight[level];
      });
    });

    let html = '';

    // Create sections for each deck level
    [1, 2, 3].forEach(level => {
      const levelNames = ['Normalne (1)', 'Trudne (2)', 'Epickie (3)'];
      const levelColors = ['#4caf50', '#ff9800', '#f44336'];

      html += `
        <div class="chance-level-section">
          <h3 style="color: ${levelColors[level - 1]}">${levelNames[level - 1]}</h3>
          <div class="chance-resources">
      `;

      // Get all resources with their chances for this level
      const resourcesWithChances = Object.entries(this.config.resources)
        .map(([key, resource]) => {
          const total = totalWeights[level];
          const chance = total > 0 ? ((resource.weight[level] / total) * 100).toFixed(1) : '0.0';
          return {
            key: key,
            name: resource.name,
            chance: parseFloat(chance),
            cost: resource.cost
          };
        })
        .filter(resource => resource.chance > 0)
        .sort((a, b) => b.chance - a.chance); // Sort by chance descending

      if (resourcesWithChances.length > 0) {
        resourcesWithChances.forEach(resource => {
          const resourceData = this.config.resources[resource.key];
          const symbol = this.config.getResourceSymbol(resourceData.symbol);
          const symbolHtml = this.renderSymbol(symbol, resourceData.color);

          html += `
            <div class="chance-resource-item">
              <div class="resource-symbol">${symbolHtml}</div>
              <span class="resource-name">${resource.name}</span>
              <span class="resource-chance">${resource.chance}%</span>
              <span class="resource-cost">(koszt: ${resource.cost})</span>
            </div>
          `;
        });
      } else {
        html += '<div class="chance-resource-item">Brak dostępnych zasobów</div>';
      }

      html += `
          </div>
        </div>
      `;
    });

    chancesDisplay.innerHTML = html;
  }

  renderResourceDetails() {
    const resourcesList = document.getElementById('resources-list');
    if (!resourcesList) {
      return;
    }

    let html = '';

    // Get all resources and sort them by cost (ascending)
    const allResources = Object.entries(this.config.resources)
      .map(([key, resource]) => ({
        key,
        name: resource.name,
        cost: resource.cost
      }))
      .sort((a, b) => a.cost - b.cost);

    allResources.forEach(resource => {
      const resourceData = this.config.resources[resource.key];
      const symbol = this.config.getResourceSymbol(resourceData.symbol);
      const symbolHtml = this.renderSymbol(symbol, resourceData.color);

      html += `
        <div class="resource-card">
          <div class="resource-header">
            <div class="resource-symbol">${symbolHtml}</div>
            <span class="resource-name">${resource.name}</span>
          </div>
          <div class="resource-value">
            <div class="value-info">
              <span class="value-label">Punkty nagród:</span>
              <span class="value-points">${resource.cost}</span>
            </div>
          </div>
        </div>
      `;
    });

    resourcesList.innerHTML = html;
  }

  renderSymbol(symbol, color) {
    const size = 12; // Size of each square
    const gap = 2; // Gap between squares
    const borderWidth = 1; // Border width of squares

    // Calculate container dimensions with padding for borders
    const maxCols = Math.max(...symbol.map(row => row.length));
    const maxRows = symbol.length;
    const containerWidth = maxCols * (size + gap) - gap + borderWidth * 2;
    const containerHeight = maxRows * (size + gap) - gap + borderWidth * 2;

    let html = `<div class="tetris-symbol" style="width: ${containerWidth}px; height: ${containerHeight}px; padding: ${borderWidth}px;">`;
    symbol.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          html += `<div class="tetris-square" style="
            width: ${size}px; 
            height: ${size}px; 
            background-color: ${color}; 
            position: absolute; 
            left: ${colIndex * (size + gap)}px; 
            top: ${rowIndex * (size + gap)}px;
            border: 1px solid rgba(0,0,0,0.2);
          "></div>`;
        }
      });
    });
    html += '</div>';
    return html;
  }
}

class EventManager {
  constructor() {
    this.currentEventDiv = document.getElementById("current-event");
    this.eventLogDiv = document.getElementById("event-log");
    this.eventSystem = eventSystem;

    this.init();
  }

  init() {
    document.querySelectorAll(".draw-card").forEach((button) => {
      button.addEventListener("click", (element) => {
        const level = parseInt(element.target.getAttribute("data-level"));
        const event = this.eventSystem.createEvent(level);

        if (this.currentEventDiv.innerHTML.trim() !== "") {
          this.eventLogDiv.innerHTML = this.currentEventDiv.innerHTML + this.eventLogDiv.innerHTML;
        }

        this.currentEventDiv.innerHTML = event.body;
      });
    });
  }

  clearEvents() {
    this.currentEventDiv.innerHTML = "";
    this.eventLogDiv.innerHTML = "";
  }
}

class EnemyOverviewManager {
  constructor(config) {
    this.config = config;
    this.init();
  }

  init() {
    this.renderEnemyOverview();
  }

  renderEnemyOverview() {
    const enemiesOverview = document.getElementById('enemies-overview');
    if (!enemiesOverview) {
      return;
    }

    let html = '';

    // Get all enemy types
    const enemyTypes = this.config.getAllEnemyTypes();

    enemyTypes.forEach(typeKey => {
      const enemyType = this.config.getEnemyType(typeKey);

      html += `
        <div class="enemy-type-section">
          <h2 class="enemy-type-header">${enemyType.name}</h2>
          <div class="enemy-type-description">${enemyType.description}</div>
          <div class="enemy-levels-grid">
      `;

      // Add cards for each level
      [1, 2, 3].forEach(level => {
        const levelData = enemyType.levels[level];
        const phaseDescriptions = {
          1: "Ostrożny",
          2: "Zbalansowany",
          3: "Agresywny"
        };

        html += `
          <div class="enemy-level-card">
            <div class="enemy-level-title">Poziom ${level}</div>
            <div class="enemy-stats">
              <div class="enemy-stat">
                <span class="enemy-stat-label">Zdrowie:</span>
                <span class="enemy-stat-value">${levelData.health}</span>
              </div>
              <div class="enemy-stat">
                <span class="enemy-stat-label">Punkty nagrody:</span>
                <span class="enemy-stat-value">${levelData.rewardPoints}</span>
              </div>
            </div>
            <div class="enemy-phases">
              <div class="enemy-phases-title">Etapy walki:</div>
        `;

        // Add phases
        [1, 2, 3].forEach(phase => {
          const phaseData = levelData.phases[phase];
          html += `
            <div class="enemy-phase">
              <span class="enemy-phase-name">Etap ${phase}</span>
              <div class="enemy-phase-stats">
                <div class="enemy-phase-stat">
                  <span class="enemy-phase-stat-label">Atak:</span>
                  <span class="enemy-phase-stat-value">${phaseData.attack}</span>
                </div>
                <div class="enemy-phase-stat">
                  <span class="enemy-phase-stat-label">Obrona:</span>
                  <span class="enemy-phase-stat-value">${phaseData.defence}</span>
                </div>
              </div>
            </div>
          `;
        });

        html += `
            </div>
            <div class="reward-points">
              Nagroda: ${levelData.rewardPoints} punktów
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    enemiesOverview.innerHTML = html;
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  const tabManager = new TabManager();
  const resourceChancesManager = new ResourceChancesManager(config);
  const eventManager = new EventManager();
  const enemyOverviewManager = new EnemyOverviewManager(config);
});
