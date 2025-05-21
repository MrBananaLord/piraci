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

    let points = (level - 1) * config.enemyScaling + Math.floor(Math.random() * config.enemyScaling) + 1;
    this.points = points;

    this.health = Math.floor(Math.random() * config.enemyScaling) + 1;
    this.stages = [];

    let stagePoints = this.points;
    for (let i = 0; i < 3; i++) {
      let stageAttack = Math.floor(Math.random() * stagePoints);
      let stageDefence = Math.floor(Math.random() * (stagePoints - stageAttack));
      this.stages.push({
        attack: stageAttack,
        defence: stageDefence
      });
    }

    // Balance the points
    let totalAttack = this.stages.reduce((sum, s) => sum + s.attack, 0);
    let totalDefence = this.stages.reduce((sum, s) => sum + s.defence, 0);
    let diff = this.points - (totalAttack + totalDefence);
    if (diff > 0) {
      this.stages[0].attack += diff;
    }
  }

  renderTemplate() {
    return `
      <h4>${this.name}</h4>
      <p>Trudność: ${this.points}</p>
      <h5>Etapy walki:</h5>
      <ol>
      ${this.stages.map((stage, i) => `
        <li>Etap ${i + 1}: Atak: ${stage.attack}, Obrona: ${stage.defence}</li>
      `).join('')}
      </ol>
      <p>Zdrowie: ${this.health}<p>
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
    this.action = new Fight(level);
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
