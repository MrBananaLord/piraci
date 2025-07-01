// Event system classes and event generation logic

class RewardsGenerator {
  constructor(level, points) {
    this.level = level;
    this.points = points;
    this.rewardsPool = config.getAllResources();
  }

  rewards() {
    const rewards = [];
    let remainingPoints = this.points;

    while (remainingPoints > 0) {
      const weightedPool = this.rewardsPool.filter(reward => reward.cost <= remainingPoints)
        .flatMap(reward => Array(reward.weight[this.level]).fill(reward));

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

    // Select random enemy type
    this.typeKey = config.getRandomEnemyType();
    this.enemyType = config.getEnemyType(this.typeKey);

    // Get all stages for this enemy type and level
    this.stages = [];
    for (let phase = 1; phase <= 3; phase++) {
      const phaseData = this.enemyType.levels[level].phases[phase];
      this.stages.push({
        attack: phaseData.attack,
        defence: phaseData.defence,
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
    return `
      <h4>${this.enemyType.name}</h4>
      <p><em>${this.enemyType.description}</em></p>
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
    this.rewards = new RewardsGenerator(level, this.enemy.points).rewards();
  }

  renderTemplate() {
    return `
      <h3>${this.name}</h3>
      ${this.enemy.renderTemplate()}
      <h4>Nagroda</h4> 
      <p>${this.rewards.join(", ")}</p>
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
      <p>${this.rewards.join(", ")}</p>
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
      <p>${this.rewards.join(", ")}</p>
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
