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

    // Calculate stats for each phase
    this.stages = [];
    for (let phase = 1; phase <= 3; phase++) {
      const stats = config.getEnemyStats(this.typeKey, level, phase);
      this.stages.push({
        attack: stats.attack,
        defence: stats.defence,
        phase: phase
      });
    }

    // Get base stats for health and reward points
    const baseStats = config.getEnemyStats(this.typeKey, level, 2); // Use phase 2 as base
    this.health = baseStats.health;
    this.points = baseStats.rewardPoints;
  }

  renderTemplate() {
    return `
      <h4>${this.enemyType.name}</h4>
      <p><em>${this.enemyType.description}</em></p>
      <p>Trudność: ${this.points} punktów</p>
      <p>Zdrowie: ${this.health}</p>
      <h5>Etapy walki:</h5>
      <ol>
      ${this.stages.map((stage, i) => {
      const phaseDescriptions = {
        1: "Ostrożny",
        2: "Zbalansowany",
        3: "Agresywny"
      };
      return `<li>Etap ${i + 1} (${phaseDescriptions[stage.phase]}): Atak: ${stage.attack}, Obrona: ${stage.defence}</li>`;
    }).join('')}
      </ol>
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
        <p>Poziom: ${this.level}</p>
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
