// Configuration for the event generator and game settings

class ConfigData {
  constructor() {
    this.directions = ["↑", "↓", "→", "←", "↗", "↖", "↘", "↙"];
    this.enemyScaling = 3;
    this.resources = {
      epic_story: {
        name: "Epicka historia",
        cost: 8,
        weight: {
          1: 0,
          2: 1,
          3: 4
        }
      },
      character: {
        name: "Postać",
        cost: 4,
        weight: {
          1: 0,
          2: 2,
          3: 3
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
        cost: 2,
        weight: {
          1: 1,
          2: 2,
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
}

// Create a single instance of the config to be used across the application
const config = new ConfigData();
