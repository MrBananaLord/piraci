// Configuration for the event generator and game settings

class ConfigData {
  constructor() {
    this.directions = ["↑", "↓", "→", "←", "↗", "↖", "↘", "↙"];
    this.enemyScaling = 3;

    // Enemy ship types configuration with static values
    this.enemyTypes = {
      heavy: {
        name: "Okręt Liniowy",
        description: "Potężny okręt z grubym pancerzem, ale powolny i niezdarny",
        levels: {
          1: {
            health: 8,
            rewardPoints: 6,
            phases: {
              1: { attack: 3, defence: 2 }, // Cautious
              2: { attack: 4, defence: 2 }, // Balanced
              3: { attack: 5, defence: 1 }  // Aggressive
            }
          },
          2: {
            health: 10,
            rewardPoints: 8,
            phases: {
              1: { attack: 4, defence: 2 },
              2: { attack: 5, defence: 2 },
              3: { attack: 6, defence: 1 }
            }
          },
          3: {
            health: 13,
            rewardPoints: 12,
            phases: {
              1: { attack: 5, defence: 2 },
              2: { attack: 6, defence: 2 },
              3: { attack: 7, defence: 1 }
            }
          }
        }
      },
      light: {
        name: "Szybki Kuter",
        description: "Zwinny i szybki, ale łatwy do zniszczenia",
        levels: {
          1: {
            health: 3,
            rewardPoints: 4,
            phases: {
              1: { attack: 1, defence: 9 }, // Defensive
              2: { attack: 2, defence: 7 }, // Balanced
              3: { attack: 3, defence: 5 }  // Desperate
            }
          },
          2: {
            health: 4,
            rewardPoints: 6,
            phases: {
              1: { attack: 2, defence: 10 },
              2: { attack: 3, defence: 8 },
              3: { attack: 4, defence: 6 }
            }
          },
          3: {
            health: 5,
            rewardPoints: 9,
            phases: {
              1: { attack: 3, defence: 11 },
              2: { attack: 4, defence: 9 },
              3: { attack: 5, defence: 7 }
            }
          }
        }
      },
      average: {
        name: "Fregata",
        description: "Wszechstronny okręt z zrównoważonymi statystykami",
        levels: {
          1: {
            health: 5,
            rewardPoints: 5,
            phases: {
              1: { attack: 4, defence: 6 }, // Slightly defensive
              2: { attack: 5, defence: 5 }, // Balanced
              3: { attack: 6, defence: 4 }  // Slightly aggressive
            }
          },
          2: {
            health: 6,
            rewardPoints: 7,
            phases: {
              1: { attack: 5, defence: 7 },
              2: { attack: 6, defence: 6 },
              3: { attack: 7, defence: 5 }
            }
          },
          3: {
            health: 7,
            rewardPoints: 10,
            phases: {
              1: { attack: 6, defence: 8 },
              2: { attack: 7, defence: 7 },
              3: { attack: 8, defence: 6 }
            }
          }
        }
      },
      destroyer: {
        name: "Niszczyciel",
        description: "Specjalizuje się w niszczących atakach, ale jest kruchy",
        levels: {
          1: {
            health: 4,
            rewardPoints: 5,
            phases: {
              1: { attack: 9, defence: 3 }, // Aggressive
              2: { attack: 8, defence: 3 }, // Balanced
              3: { attack: 10, defence: 2 } // Berserk
            }
          },
          2: {
            health: 5,
            rewardPoints: 7,
            phases: {
              1: { attack: 10, defence: 3 },
              2: { attack: 9, defence: 3 },
              3: { attack: 12, defence: 2 }
            }
          },
          3: {
            health: 6,
            rewardPoints: 11,
            phases: {
              1: { attack: 11, defence: 3 },
              2: { attack: 10, defence: 3 },
              3: { attack: 14, defence: 2 }
            }
          }
        }
      }
    };

    this.resources = {
      epic_story: {
        name: "Epicka historia",
        cost: 8,
        weight: {
          1: 0,
          2: 0,
          3: 16
        }
      },
      character: {
        name: "Postać",
        cost: 4,
        weight: {
          1: 0,
          2: 2,
          3: 4
        }
      },
      gold: {
        name: "Złoto",
        cost: 1,
        weight: {
          1: 2,
          2: 2,
          3: 1
        }
      },
      wood: {
        name: "Drewno",
        cost: 1,
        weight: {
          1: 1,
          2: 2,
          3: 1
        }
      },
      grain: {
        name: "Zboże",
        cost: 2,
        weight: {
          1: 0,
          2: 1,
          3: 2
        }
      },
      gunpowder: {
        name: "Proch",
        cost: 2,
        weight: {
          1: 0,
          2: 1,
          3: 2
        }
      },
      iron: {
        name: "Żelazo",
        cost: 2,
        weight: {
          1: 0,
          2: 1,
          3: 2
        }
      },
      cotton: {
        name: "Bawełna",
        cost: 2,
        weight: {
          1: 0,
          2: 1,
          3: 2
        }
      },
      fruit: {
        name: "Owoc",
        cost: 1,
        weight: {
          1: 1,
          2: 1,
          3: 1
        }
      },
      rum: {
        name: "Rum",
        cost: 1,
        weight: {
          1: 1,
          2: 1,
          3: 1
        }
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

    const phaseData = levelData.phases[phase];
    if (!phaseData) return null;

    return {
      health: levelData.health,
      attack: phaseData.attack,
      defence: phaseData.defence,
      rewardPoints: levelData.rewardPoints
    };
  }

  getRandomEnemyType() {
    const types = this.getAllEnemyTypes();
    return types[Math.floor(Math.random() * types.length)];
  }
}

// Create a single instance of the config to be used across the application
const config = new ConfigData();
