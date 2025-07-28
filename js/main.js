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
    this.renderEnemyRewardChances();
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

  renderEnemyRewardChances() {
    const resourcesContent = document.getElementById('resources-content');
    if (!resourcesContent) {
      return;
    }

    // Add enemy reward chances section to the resources content
    const enemyRewardSection = document.createElement('div');
    enemyRewardSection.innerHTML = `
      <div class="enemy-reward-chances-section">
        <h2>Szanse na nagrody według typu wroga</h2>
        <div class="enemy-reward-chances-grid">
          ${this.renderEnemyRewardChancesContent()}
        </div>
      </div>
    `;

    // Insert at the beginning of the resources content
    resourcesContent.insertBefore(enemyRewardSection, resourcesContent.firstChild);
  }

  renderEnemyRewardChancesContent() {
    let html = '';

    // Define the roles and their display names
    const roles = [
      { key: 'warship', name: 'Okręt Wojenny', description: 'Military vessels that drop combat and valuable resources' },
      { key: 'merchant', name: 'Statek Handlowy', description: 'Trade vessels that drop commercial and basic resources' }
    ];

    roles.forEach(role => {
      const enemyWeights = this.config.getEnemyRewardWeights(role.key);

      html += `
        <div class="enemy-reward-chances-card">
          <h3>${role.name}</h3>
          <p class="enemy-reward-description">${role.description}</p>
      `;

      // Create sections for each deck level
      [1, 2, 3].forEach(level => {
        const levelNames = ['Normalne (1)', 'Trudne (2)', 'Epickie (3)'];
        const levelColors = ['#4caf50', '#ff9800', '#f44336'];

        html += `
          <div class="enemy-chance-level-section">
            <h4 style="color: ${levelColors[level - 1]}">${levelNames[level - 1]}</h4>
            <div class="enemy-chance-resources">
        `;

        // Calculate total weights for this role and level
        let totalWeight = 0;
        Object.keys(enemyWeights).forEach(resourceKey => {
          totalWeight += enemyWeights[resourceKey][level] || 0;
        });

        // Get all resources with their chances for this role and level
        const resourcesWithChances = Object.entries(enemyWeights)
          .map(([resourceKey, weights]) => {
            const resource = this.config.getResourceByKey(resourceKey);
            if (!resource) return null;

            const weight = weights[level] || 0;
            const chance = totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(1) : '0.0';

            return {
              key: resourceKey,
              name: resource.name,
              chance: parseFloat(chance),
              cost: resource.cost
            };
          })
          .filter(resource => resource && resource.chance > 0)
          .sort((a, b) => b.chance - a.chance);

        if (resourcesWithChances.length > 0) {
          resourcesWithChances.forEach(resource => {
            const resourceData = this.config.getResourceByKey(resource.key);
            const symbol = this.config.getResourceSymbol(resourceData.symbol);
            const symbolHtml = this.renderSymbol(symbol, resourceData.color);

            html += `
              <div class="enemy-chance-resource-item">
                <div class="resource-symbol">${symbolHtml}</div>
                <span class="resource-name">${resource.name}</span>
                <span class="resource-chance">${resource.chance}%</span>
                <span class="resource-cost">(koszt: ${resource.cost})</span>
              </div>
            `;
          });
        } else {
          html += '<div class="enemy-chance-resource-item">Brak dostępnych zasobów</div>';
        }

        html += `
            </div>
          </div>
        `;
      });

      html += `
        </div>
      `;
    });

    return html;
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
    this.cardStorage = new CardStorageManager();

    this.init();
  }

  init() {
    document.querySelectorAll(".draw-card").forEach((button) => {
      button.addEventListener("click", (element) => {
        const level = parseInt(element.target.getAttribute("data-level"));
        const event = this.eventSystem.createEvent(level);

        // Store the card data
        this.cardStorage.storeCard(event);

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
    this.setupEventListeners();
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

        // Calculate reward points using the formula: 2*hp + defence + 0.5*attack
        const rewardPoints = new Enemy(enemyType.name, level).calculateRewardPoints();

        html += `
          <div class="enemy-level-card" data-type="${typeKey}" data-level="${level}">
            <div class="enemy-level-title">Poziom ${level}</div>
            <div class="enemy-stats">
              <div class="enemy-stat">
                <span class="enemy-stat-label">Zdrowie:</span>
                <span class="enemy-stat-value">${levelData.health}</span>
              </div>
              <div class="enemy-stat">
                <span class="enemy-stat-label">Punkty nagrody:</span>
                <span class="enemy-stat-value">${rewardPoints}</span>
              </div>
              <div class="enemy-stat">
                <span class="enemy-stat-label">Całkowity atak:</span>
                <span class="enemy-stat-value">${levelData.totalAttack}</span>
              </div>
              <div class="enemy-stat">
                <span class="enemy-stat-label">Całkowita obrona:</span>
                <span class="enemy-stat-value">${levelData.totalDefence}</span>
              </div>
            </div>
            <div class="enemy-phases">
              <div class="enemy-phases-title">
                Etapy walki:
                <button class="reroll-phases-btn" data-type="${typeKey}" data-level="${level}">
                  🔄 Reroll
                </button>
              </div>
        `;

        // Add phases
        [1, 2, 3].forEach(phase => {
          const stats = this.config.getEnemyStats(typeKey, level, phase);
          html += `
            <div class="enemy-phase">
              <span class="enemy-phase-name">Etap ${phase}</span>
              <div class="enemy-phase-stats">
                <div class="enemy-phase-stat">
                  <span class="enemy-phase-stat-label">Atak:</span>
                  <span class="enemy-phase-stat-value">${stats.attack}</span>
                </div>
                <div class="enemy-phase-stat">
                  <span class="enemy-phase-stat-label">Obrona:</span>
                  <span class="enemy-phase-stat-value">${stats.defence}</span>
                </div>
              </div>
            </div>
          `;
        });

        html += `
            </div>
            <div class="reward-points">
              Nagroda: ${rewardPoints} punktów
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

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('reroll-phases-btn')) {
        const typeKey = e.target.dataset.type;
        const level = parseInt(e.target.dataset.level);
        this.rerollPhases(typeKey, level, e.target);
      }
    });
  }

  rerollPhases(typeKey, level, button) {
    // Clear the specific distributions for this enemy type and level
    if (this.config.distributions) {
      delete this.config.distributions[`${typeKey}_${level}_attack`];
      delete this.config.distributions[`${typeKey}_${level}_defence`];
    }

    // Get the enemy card
    const enemyCard = button.closest('.enemy-level-card');
    const phasesContainer = enemyCard.querySelector('.enemy-phases');

    // Regenerate phases HTML
    let phasesHtml = `
      <div class="enemy-phases-title">
        Etapy walki:
        <button class="reroll-phases-btn" data-type="${typeKey}" data-level="${level}">
          🔄 Reroll
        </button>
      </div>
    `;

    // Add phases
    [1, 2, 3].forEach(phase => {
      const stats = this.config.getEnemyStats(typeKey, level, phase);
      phasesHtml += `
        <div class="enemy-phase">
          <span class="enemy-phase-name">Etap ${phase}</span>
          <div class="enemy-phase-stats">
            <div class="enemy-phase-stat">
              <span class="enemy-phase-stat-label">Atak:</span>
              <span class="enemy-phase-stat-value">${stats.attack}</span>
            </div>
            <div class="enemy-phase-stat">
              <span class="enemy-phase-stat-label">Obrona:</span>
              <span class="enemy-phase-stat-value">${stats.defence}</span>
            </div>
          </div>
        </div>
      `;
    });

    phasesContainer.innerHTML = phasesHtml;

    // Add visual feedback
    button.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      button.style.transform = 'rotate(0deg)';
    }, 300);
  }
}

class CardStorageManager {
  constructor() {
    this.storageKey = 'piraci_drawn_cards';
    this.init();
  }

  init() {
    // Add download button to the UI
    this.addDownloadButton();
  }

  addDownloadButton() {
    const eventDeck = document.getElementById('event-deck');
    if (eventDeck) {
      // Create container for buttons
      const buttonContainer = document.createElement('div');
      buttonContainer.style.marginBottom = '15px';
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '10px';
      buttonContainer.style.justifyContent = 'center';
      buttonContainer.style.flexWrap = 'wrap';

      // Download button
      const downloadButton = document.createElement('button');
      downloadButton.id = 'download-cards-csv';
      downloadButton.textContent = '📊 Pobierz statystyki kart (CSV)';
      downloadButton.addEventListener('click', () => this.downloadCardsCSV());

      // Clear data button
      const clearButton = document.createElement('button');
      clearButton.id = 'clear-cards-data';
      clearButton.textContent = '🗑️ Wyczyść dane kart';
      clearButton.style.backgroundColor = '#e74c3c';
      clearButton.addEventListener('click', () => this.clearStoredCardsWithConfirm());

      // Statistics button
      const statsButton = document.createElement('button');
      statsButton.id = 'show-cards-stats';
      statsButton.textContent = '📈 Pokaż statystyki';
      statsButton.style.backgroundColor = '#9b59b6';
      statsButton.addEventListener('click', () => this.showStatistics());

      // Add buttons to container
      buttonContainer.appendChild(downloadButton);
      buttonContainer.appendChild(statsButton);
      buttonContainer.appendChild(clearButton);

      // Insert before the draw card buttons
      const drawButtons = eventDeck.querySelectorAll('.draw-card');
      if (drawButtons.length > 0) {
        drawButtons[0].parentNode.insertBefore(buttonContainer, drawButtons[0]);
      } else {
        // If no draw buttons, insert at the beginning of the event deck
        eventDeck.insertBefore(buttonContainer, eventDeck.firstChild);
      }
    }
  }

  storeCard(event) {
    const cardData = this.extractCardData(event);
    const storedCards = this.getStoredCards();
    storedCards.push(cardData);
    this.saveCards(storedCards);
  }

  extractCardData(event) {
    const cardData = {
      timestamp: new Date().toISOString(),
      level: event.level,
      eventType: this.getEventType(event.action),
      eventName: event.action.name || event.action.kind || 'Unknown',
      rewards: this.extractRewards(event.action),
      details: this.extractDetails(event.action)
    };

    return cardData;
  }

  getEventType(action) {
    if (action instanceof Fight) return 'Fight';
    if (action instanceof Island) return 'Island';
    if (action instanceof Exploration) return 'Exploration';
    return 'Unknown';
  }

  extractRewards(action) {
    if (action.rewards && Array.isArray(action.rewards)) {
      return action.rewards.join(', ');
    }
    return '';
  }

  extractDetails(action) {
    const details = {};

    if (action instanceof Fight) {
      details.enemyType = action.enemy.enemyType.name;
      details.enemyRole = action.enemy.role;
      details.enemyHealth = action.enemy.health;
      details.enemyStages = action.enemy.stages.map(stage =>
        `Phase ${stage.phase}: Atk ${stage.attack}, Def ${stage.defence}`
      ).join('; ');
    } else if (action instanceof Exploration) {
      details.coordinates = `${action.targetCoordinates.x}, ${action.targetCoordinates.y}`;
    } else if (action instanceof Island) {
      details.islandType = 'Standard Island';
    }

    return details;
  }

  getStoredCards() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  saveCards(cards) {
    localStorage.setItem(this.storageKey, JSON.stringify(cards));
  }

  downloadCardsCSV() {
    const cards = this.getStoredCards();

    if (cards.length === 0) {
      alert('Brak zapisanych kart do pobrania.');
      return;
    }

    const csvContent = this.generateCSV(cards);
    this.downloadFile(csvContent, 'piraci_cards_statistics.csv', 'text/csv');
  }

  generateCSV(cards) {
    const headers = [
      'Data i czas',
      'Poziom',
      'Typ wydarzenia',
      'Nazwa wydarzenia',
      'Nagrody',
      'Typ wroga',
      'Rola wroga',
      'Zdrowie wroga',
      'Etapy walki',
      'Współrzędne',
      'Typ wyspy',
      'Punkty nagrody'
    ];

    const rows = cards.map(card => {
      let rewardPoints = '';

      // Calculate reward points based on event type
      if (card.eventType === 'Fight') {
        rewardPoints = card.details.enemyHealth ? (2 * card.details.enemyHealth + 0.5 * 10 + 5).toFixed(1) : '';
      } else if (card.eventType === 'Exploration') {
        rewardPoints = (card.level * 4).toString();
      } else if (card.eventType === 'Island') {
        rewardPoints = '1'; // Standard island reward
      }

      return [
        new Date(card.timestamp).toLocaleString('pl-PL'),
        card.level,
        this.translateEventType(card.eventType),
        card.eventName,
        card.rewards,
        card.details.enemyType || '',
        this.translateRole(card.details.enemyRole) || '',
        card.details.enemyHealth || '',
        card.details.enemyStages || '',
        card.details.coordinates || '',
        card.details.islandType || '',
        rewardPoints
      ];
    });

    const csv = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csv;
  }

  translateEventType(eventType) {
    const translations = {
      'Fight': 'Walka',
      'Island': 'Wyspa',
      'Exploration': 'Eksploracja',
      'Unknown': 'Nieznany'
    };
    return translations[eventType] || eventType;
  }

  translateRole(role) {
    const translations = {
      'warship': 'Okręt Wojenny',
      'merchant': 'Statek Handlowy'
    };
    return translations[role] || role;
  }

  downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  clearStoredCards() {
    localStorage.removeItem(this.storageKey);
  }

  clearStoredCardsWithConfirm() {
    const count = this.getCardCount();
    if (count === 0) {
      alert('Brak zapisanych kart do wyczyszczenia.');
      return;
    }

    const confirmed = confirm(`Czy na pewno chcesz usunąć wszystkie zapisane karty (${count} kart)? Ta operacja nie może być cofnięta.`);
    if (confirmed) {
      this.clearStoredCards();
      this.updateButtonTexts();
      alert('Wszystkie zapisane karty zostały usunięte.');
    }
  }

  updateButtonTexts() {
    const count = this.getCardCount();
    const downloadButton = document.getElementById('download-cards-csv');
    if (downloadButton) {
      downloadButton.textContent = `📊 Pobierz statystyki kart (CSV) - ${count} kart`;
    }
  }

  getCardCount() {
    return this.getStoredCards().length;
  }

  showStatistics() {
    const cards = this.getStoredCards();

    if (cards.length === 0) {
      alert('Brak zapisanych kart do analizy.');
      return;
    }

    const stats = this.calculateStatistics(cards);
    this.displayStatistics(stats);
  }

  calculateStatistics(cards) {
    const stats = {
      totalCards: cards.length,
      byLevel: {},
      byEventType: {},
      byEnemyRole: {},
      totalRewardPoints: 0,
      averageRewardPoints: 0,
      mostCommonRewards: {},
      dateRange: {
        first: null,
        last: null
      }
    };

    const rewardPoints = [];
    const allRewards = [];

    cards.forEach(card => {
      // Level statistics
      stats.byLevel[card.level] = (stats.byLevel[card.level] || 0) + 1;

      // Event type statistics
      stats.byEventType[card.eventType] = (stats.byEventType[card.eventType] || 0) + 1;

      // Enemy role statistics
      if (card.details.enemyRole) {
        stats.byEnemyRole[card.details.enemyRole] = (stats.byEnemyRole[card.details.enemyRole] || 0) + 1;
      }

      // Reward points calculation
      let points = 0;
      if (card.eventType === 'Fight') {
        points = card.details.enemyHealth ? (2 * card.details.enemyHealth + 0.5 * 10 + 5) : 0;
      } else if (card.eventType === 'Exploration') {
        points = card.level * 4;
      } else if (card.eventType === 'Island') {
        points = 1;
      }
      rewardPoints.push(points);

      // Individual rewards
      if (card.rewards) {
        card.rewards.split(', ').forEach(reward => {
          if (reward.trim()) {
            allRewards.push(reward.trim());
            stats.mostCommonRewards[reward.trim()] = (stats.mostCommonRewards[reward.trim()] || 0) + 1;
          }
        });
      }

      // Date range
      const cardDate = new Date(card.timestamp);
      if (!stats.dateRange.first || cardDate < stats.dateRange.first) {
        stats.dateRange.first = cardDate;
      }
      if (!stats.dateRange.last || cardDate > stats.dateRange.last) {
        stats.dateRange.last = cardDate;
      }
    });

    stats.totalRewardPoints = rewardPoints.reduce((sum, points) => sum + points, 0);
    stats.averageRewardPoints = stats.totalRewardPoints / cards.length;

    return stats;
  }

  displayStatistics(stats) {
    const eventTypeNames = {
      'Fight': 'Walki',
      'Island': 'Wyspy',
      'Exploration': 'Eksploracje'
    };

    const roleNames = {
      'warship': 'Okręty Wojenne',
      'merchant': 'Statki Handlowe'
    };

    let statsHtml = `
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-bottom: 20px;">📊 Statystyki kart (${stats.totalCards} kart)</h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
            <h4 style="color: #495057; margin-bottom: 10px;">🎯 Podział według poziomów</h4>
            ${Object.entries(stats.byLevel).map(([level, count]) =>
      `<div style="margin: 5px 0;">Poziom ${level}: ${count} kart</div>`
    ).join('')}
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
            <h4 style="color: #495057; margin-bottom: 10px;">⚔️ Typy wydarzeń</h4>
            ${Object.entries(stats.byEventType).map(([type, count]) =>
      `<div style="margin: 5px 0;">${eventTypeNames[type] || type}: ${count} kart</div>`
    ).join('')}
          </div>
          
          ${Object.keys(stats.byEnemyRole).length > 0 ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
              <h4 style="color: #495057; margin-bottom: 10px;">🚢 Role wrogów</h4>
              ${Object.entries(stats.byEnemyRole).map(([role, count]) =>
      `<div style="margin: 5px 0;">${roleNames[role] || role}: ${count} kart</div>`
    ).join('')}
            </div>
          ` : ''}
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
            <h4 style="color: #495057; margin-bottom: 10px;">💰 Punkty nagród</h4>
            <div style="margin: 5px 0;">Łącznie: ${stats.totalRewardPoints.toFixed(1)} punktów</div>
            <div style="margin: 5px 0;">Średnio: ${stats.averageRewardPoints.toFixed(1)} punktów na kartę</div>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
            <h4 style="color: #495057; margin-bottom: 10px;">📅 Zakres dat</h4>
            <div style="margin: 5px 0;">Od: ${stats.dateRange.first.toLocaleDateString('pl-PL')}</div>
            <div style="margin: 5px 0;">Do: ${stats.dateRange.last.toLocaleDateString('pl-PL')}</div>
          </div>
          
        </div>
        
        ${Object.keys(stats.mostCommonRewards).length > 0 ? `
          <div style="margin-top: 20px; background: #f8f9fa; padding: 15px; border-radius: 6px;">
            <h4 style="color: #495057; margin-bottom: 10px;">🏆 Najczęstsze nagrody</h4>
            ${Object.entries(stats.mostCommonRewards)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([reward, count]) =>
            `<div style="margin: 5px 0;">${reward}: ${count} razy</div>`
          ).join('')}
          </div>
        ` : ''}
        
      </div>
    `;

    // Create modal or replace content
    const currentEvent = document.getElementById('current-event');
    if (currentEvent) {
      currentEvent.innerHTML = statsHtml;
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  const tabManager = new TabManager();
  const resourceChancesManager = new ResourceChancesManager(config);
  const eventManager = new EventManager();
  const enemyOverviewManager = new EnemyOverviewManager(config);

  // Add card count display
  const cardStorage = eventManager.cardStorage;
  const updateCardCount = () => {
    cardStorage.updateButtonTexts();
  };

  // Update count initially and after each card draw
  updateCardCount();

  // Override the original click handler to update count
  document.querySelectorAll(".draw-card").forEach((button) => {
    const originalClick = button.onclick;
    button.addEventListener("click", () => {
      setTimeout(updateCardCount, 100); // Update count after card is stored
    });
  });
});
