// Event system classes and event generation logic

// Helper function to render resource symbols
function renderResourceSymbols(resourceNames) {
  return resourceNames.map(resourceName => {
    // Find the resource by name
    const resourceKey = Object.keys(config.resources).find(key =>
      config.resources[key].name === resourceName
    );

    if (!resourceKey) {
      return `<span class="resource-item">${resourceName}</span>`;
    }

    const resource = config.resources[resourceKey];
    const symbol = config.getResourceSymbol(resource.symbol);
    const symbolHtml = renderSymbol(symbol, resource.color);

    return `<span class="resource-item">
      <div class="resource-symbol">${symbolHtml}</div>
      <span class="resource-name">${resourceName}</span>
    </span>`;
  }).join('');
}

function renderSymbol(symbol, color) {
  const size = 10; // Smaller size for event cards
  const gap = 1; // Smaller gap for event cards
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

class RewardsGenerator {
  constructor(level, points, enemyType = null) {
    this.level = level;
    this.points = points;
    this.enemyType = enemyType;
    this.rewardsPool = config.getAllResources();
  }

  rewards() {
    const rewards = [];
    let remainingPoints = this.points;

    while (remainingPoints > 0) {
      // Use enemy-specific weights if available, otherwise fall back to default weights
      const weightedPool = this.rewardsPool.filter(reward => {
        const weight = this.enemyType
          ? config.getResourceWeightForEnemy(reward.symbol, this.enemyType, this.level)
          : reward.weight[this.level];
        return reward.cost <= remainingPoints && weight > 0;
      }).flatMap(reward => {
        const weight = this.enemyType
          ? config.getResourceWeightForEnemy(reward.symbol, this.enemyType, this.level)
          : reward.weight[this.level];
        return Array(weight).fill(reward);
      });

      if (weightedPool.length === 0) break;

      const selectedReward = weightedPool[Math.floor(Math.random() * weightedPool.length)];
      rewards.push(selectedReward.name);
      remainingPoints -= selectedReward.cost;
    }

    return rewards;
  }
}

class Enemy {
  constructor(name, level) {
    this.name = name;
    this.level = level;

    // Select random enemy role (warship or merchant) for reward chances
    this.role = Math.random() < 0.5 ? 'warship' : 'merchant';

    // Select random enemy ship type for combat stats
    this.typeKey = config.getRandomEnemyType();
    this.enemyType = config.getEnemyType(this.typeKey);

    // Get all stages for this enemy type and level using the new distribution system
    this.stages = [];
    for (let phase = 1; phase <= 3; phase++) {
      const stats = config.getEnemyStats(this.typeKey, level, phase);
      this.stages.push({
        attack: stats.attack,
        defence: stats.defence,
        phase: phase
      });
    }

    // Shuffle the stages
    this.shuffleStages();

    // Get base stats for health and reward points
    this.health = this.enemyType.levels[level].health;
    this.points = this.enemyType.levels[level].rewardPoints;
  }

  shuffleStages() {
    // Fisher-Yates shuffle algorithm
    for (let i = this.stages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.stages[i], this.stages[j]] = [this.stages[j], this.stages[i]];
    }
  }

  renderTemplate() {
    const roleNames = {
      'warship': 'Okręt Wojenny',
      'merchant': 'Statek Handlowy'
    };

    return `
      <h4>${this.enemyType.name}</h4>
      <p><em>${this.enemyType.description}</em></p>
      <p><strong>Typ: ${roleNames[this.role]}</strong></p>
      <p><strong>Zdrowie: ${this.health}</strong></p>
      <div class="enemy-phases">
        ${this.stages.map((stage, i) => `
          <div class="enemy-phase">
            <span class="enemy-phase-name">Etap ${i + 1}</span>
            <div class="enemy-phase-stats">
              <div class="enemy-phase-stat">
                <span class="enemy-phase-stat-label">Atak:</span>
                <span class="enemy-phase-stat-value">${stage.attack}</span>
              </div>
              <div class="enemy-phase-stat">
                <span class="enemy-phase-stat-label">Obrona:</span>
                <span class="enemy-phase-stat-value">${stage.defence}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

class Fight {
  constructor(level = 1) {
    this.name = "Walka!";
    this.enemy = new Enemy("Wróg", level);
    this.rewards = new RewardsGenerator(level, this.enemy.points, this.enemy.role).rewards();
  }

  renderTemplate() {
    return `
      <h3>${this.name}</h3>
      ${this.enemy.renderTemplate()}
      <h4>Nagroda</h4> 
      <div class="rewards-display">
        ${renderResourceSymbols(this.rewards)}
      </div>
    `;
  }
}

class Island {
  constructor(level = 1) {
    this.name = "Wyspa!";
    this.level = level;
    this.rewards = this.generateRewards();
  }

  generateRewards() {
    const islandResources = ['Owoc', 'Rum', 'Drewno'];
    const selectedResource = islandResources[Math.floor(Math.random() * islandResources.length)];
    return [selectedResource];
  }

  renderTemplate() {
    const specialMessage = this.rewards.includes('Rum')
      ? '<p>Wpłynąłeś na suchego przestwór oceanu. Nurzasz się w rumowość</p>'
      : '<p>Odkryłeś wyspę! Możesz znaleźć zasoby na brzegu.</p>';

    return `
      <h3>${this.name}</h3>
      ${specialMessage}
      <h4>Znalezione zasoby</h4> 
      <div class="rewards-display">
        ${renderResourceSymbols(this.rewards)}
      </div>
    `;
  }
}

class FloatingDebris {
  constructor(level = 1) {
    this.name = "Pływające śmieci";
    this.level = level;
    this.rewards = this.generateRewards();
  }

  generateRewards() {
    let debrisResources;

    if (this.level === 1) {
      debrisResources = ['Owoc', 'Rum', 'Drewno'];
    } else if (this.level === 2) {
      debrisResources = ['Żelazo', 'Proch', 'Bawełna', 'Zboże'];
    } else if (this.level === 3) {
      debrisResources = ['Postać'];
    }

    const selectedResource = debrisResources[Math.floor(Math.random() * debrisResources.length)];
    return [selectedResource];
  }

  renderTemplate() {
    return `
      <h3>${this.name}</h3>
      <p>Widzisz pływające śmieci na powierzchni wody. Może znajdziesz coś użytecznego.</p>
      <h4>Znalezione przedmioty</h4> 
      <div class="rewards-display">
        ${renderResourceSymbols(this.rewards)}
      </div>
    `;
  }
}

class EventSystem {
  constructor() {
    this.events = [];
  }

  createEvent(level = 1) {
    return new Event(level);
  }

  addEvent(event) {
    this.events.push(event);
    return event;
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }
}

class Event {
  constructor(level = 1) {
    this.level = level;

    // Event type probabilities:
    // 15% chance for FloatingDebris event
    // 15% chance for Island event  
    // 70% chance for Fight event
    const random = Math.random();
    if (random < 0.15) {
      this.action = new FloatingDebris(level);
    } else if (random < 0.30) {
      this.action = new Island(level);
    } else {
      this.action = new Fight(level);
    }

    this.created = new Date();
  }

  renderTemplate() {
    return `
      <div class="card">
        <div class="level-badge level-${this.level}">${this.level}</div>
        ${this.action.renderTemplate()}
      </div>
    `;
  }

  get body() {
    return this.renderTemplate();
  }
}

// Initialize the event system
const eventSystem = new EventSystem();
