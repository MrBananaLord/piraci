// Configuration for the event generator and game settings

class ConfigData {
  constructor() {
    this.directions = ["↑", "↓", "→", "←", "↗", "↖", "↘", "↙"];
    this.enemyScaling = 3;

    // Enemy ship types configuration with static values
    this.enemyTypes = {
      warship: {
        name: "Okręt Wojenny",
        description: "Potężny okręt z grubym pancerzem, ale powolny i niezdarny",
        levels: {
          1: {
            health: 1,
            rewardPoints: 6,
            totalAttack: 2,
            totalDefence: 2
          },
          2: {
            health: 6,
            rewardPoints: 12,
            totalAttack: 12,
            totalDefence: 6
          },
          3: {
            health: 9,
            rewardPoints: 18,
            totalAttack: 15,
            totalDefence: 12
          }
        }
      },
      merchant: {
        name: "Statek Handlowy",
        description: "Zwinny i szybki, ale łatwy do zniszczenia",
        levels: {
          1: {
            health: 2,
            rewardPoints: 6,
            totalAttack: 2,
            totalDefence: 2
          },
          2: {
            health: 4,
            rewardPoints: 12,
            totalAttack: 6,
            totalDefence: 12
          },
          3: {
            health: 6,
            rewardPoints: 18,
            totalAttack: 9,
            totalDefence: 18
          }
        }
      }
    };

    this.resources = {
      epic_story: {
        name: "Epicka historia",
        cost: 8,
        color: "#E91E63",
        symbol: "epic_story",
        weight: {
          1: 0,
          2: 0,
          3: 16
        }
      },
      character: {
        name: "Postać",
        cost: 4,
        color: "#9E9E9E",
        symbol: "character",
        weight: {
          1: 0,
          2: 2,
          3: 4
        }
      },
      gold: {
        name: "Złoto",
        cost: 1,
        color: "#FFD700",
        symbol: "gold",
        weight: {
          1: 3,
          2: 2,
          3: 1
        }
      },
      wood: {
        name: "Drewno",
        cost: 1,
        color: "#8D6E63",
        symbol: "wood",
        weight: {
          1: 1,
          2: 2,
          3: 1
        }
      },
      grain: {
        name: "Zboże",
        cost: 2,
        color: "#FF9800",
        symbol: "grain",
        weight: {
          1: 0,
          2: 1,
          3: 2
        }
      },
      gunpowder: {
        name: "Proch",
        cost: 2,
        color: "#212121",
        symbol: "gunpowder",
        weight: {
          1: 0,
          2: 1,
          3: 2
        }
      },
      iron: {
        name: "Żelazo",
        cost: 2,
        color: "#607D8B",
        symbol: "iron",
        weight: {
          1: 0,
          2: 1,
          3: 2
        }
      },
      cotton: {
        name: "Bawełna",
        cost: 2,
        color: "#F5F5F5",
        symbol: "cotton",
        weight: {
          1: 0,
          2: 1,
          3: 2
        }
      },
      fruit: {
        name: "Owoc",
        cost: 0.5,
        color: "#F44336",
        symbol: "fruit",
        weight: {
          1: 1,
          2: 1,
          3: 1
        }
      },
      rum: {
        name: "Rum",
        cost: 1,
        color: "#4CAF50",
        symbol: "rum",
        weight: {
          1: 1,
          2: 1,
          3: 1
        }
      },
      silver: {
        name: "Srebro",
        cost: 0.5,
        color: "#C0C0C0",
        symbol: "silver",
        weight: {
          1: 2,
          2: 1,
          3: 1
        }
      }
    };

    // Enemy-specific reward weights
    this.enemyRewardWeights = {
      warship: {
        // Warships drop military and valuable resources
        epic_story: { 1: 0, 2: 0, 3: 8 },
        character: { 1: 0, 2: 4, 3: 6 },
        gold: { 1: 2, 2: 3, 3: 2 },
        wood: { 1: 1, 2: 1, 3: 1 },
        grain: { 1: 0, 2: 1, 3: 2 },
        gunpowder: { 1: 0, 2: 3, 3: 4 },
        iron: { 1: 0, 2: 2, 3: 3 },
        cotton: { 1: 0, 2: 1, 3: 1 },
        fruit: { 1: 0, 2: 0, 3: 0 },
        rum: { 1: 0, 2: 1, 3: 1 },
        silver: { 1: 1, 2: 2, 3: 2 }
      },
      merchant: {
        // Merchant ships drop trade goods and basic resources
        epic_story: { 1: 0, 2: 0, 3: 2 },
        character: { 1: 0, 2: 1, 3: 2 },
        gold: { 1: 4, 2: 3, 3: 2 },
        wood: { 1: 3, 2: 4, 3: 3 },
        grain: { 1: 2, 2: 3, 3: 4 },
        gunpowder: { 1: 0, 2: 0, 3: 1 },
        iron: { 1: 0, 2: 1, 3: 2 },
        cotton: { 1: 2, 2: 3, 3: 4 },
        fruit: { 1: 3, 2: 2, 3: 1 },
        rum: { 1: 2, 2: 3, 3: 2 },
        silver: { 1: 3, 2: 2, 3: 1 }
      }
    };
  }

  getResourceByKey(key) {
    return this.resources[key];
  }

  getAllResources() {
    return Object.values(this.resources);
  }

  getAllResourceKeys() {
    return Object.keys(this.resources);
  }

  // Enemy type methods
  getEnemyType(typeKey) {
    return this.enemyTypes[typeKey];
  }

  getAllEnemyTypes() {
    return Object.keys(this.enemyTypes);
  }

  getEnemyStats(typeKey, level, phase) {
    const enemyType = this.enemyTypes[typeKey];
    if (!enemyType) return null;

    const levelData = enemyType.levels[level];
    if (!levelData) return null;

    // Distribute total attack and defence across 3 phases
    const totalAttack = levelData.totalAttack;
    const totalDefence = levelData.totalDefence;

    // Create distribution patterns for different phases
    const attackDistribution = this.getPhaseDistribution(totalAttack, phase);
    const defenceDistribution = this.getPhaseDistribution(totalDefence, phase);

    return {
      health: levelData.health,
      attack: attackDistribution,
      defence: defenceDistribution,
      rewardPoints: levelData.rewardPoints
    };
  }

  getPhaseDistribution(total, phase) {
    // Fully randomize distribution across 3 phases while maintaining total sum
    if (phase === 1) {
      // For phase 1, generate a random distribution for all 3 phases
      this.currentDistribution = this.generateRandomDistribution(total);
    }

    return this.currentDistribution[phase] || 0;
  }

  generateRandomDistribution(total) {
    if (total === 0) return { 1: 0, 2: 0, 3: 0 };

    // Generate random values for phases 1 and 2
    const phase1 = Math.floor(Math.random() * (total + 1));
    const remainingAfterPhase1 = total - phase1;
    const phase2 = Math.floor(Math.random() * (remainingAfterPhase1 + 1));
    const phase3 = remainingAfterPhase1 - phase2;

    return { 1: phase1, 2: phase2, 3: phase3 };
  }

  getRandomEnemyType() {
    const types = this.getAllEnemyTypes();
    return types[Math.floor(Math.random() * types.length)];
  }

  getEnemyRewardWeights(enemyType) {
    return this.enemyRewardWeights[enemyType] || this.enemyRewardWeights.merchant;
  }

  getResourceWeightForEnemy(resourceKey, enemyType, level) {
    const enemyWeights = this.getEnemyRewardWeights(enemyType);
    return enemyWeights[resourceKey]?.[level] || 0;
  }

  getResourceSymbol(symbolType) {
    const symbols = {
      epic_story: [
        [1, 1]
      ],
      character: [
        [1, 1],
        [1, 1]
      ],
      gold: [
        [1]
      ],
      wood: [
        [1, 1, 1]
      ],
      grain: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      gunpowder: [
        [1, 1, 1],
        [0, 1, 0]
      ],
      iron: [
        [1, 0],
        [1, 0],
        [1, 1]
      ],
      cotton: [
        [1, 1],
        [1, 1]
      ],
      fruit: [
        [1]
      ],
      rum: [
        [1, 1]
      ],
      silver: [
        [1]
      ]
    };

    return symbols[symbolType] || symbols.gold;
  }
}

// Create a single instance of the config to be used across the application
const config = new ConfigData();
