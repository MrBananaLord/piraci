// Main application logic

class TabManager {
  constructor() {
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.wydarzeniaSection = document.getElementById('wydarzenia-section');
    this.planszaSection = document.getElementById('plansza-section');
    this.plansza2Section = document.getElementById('plansza2-section');

    // Restore last selected tab from localStorage
    this.lastTab = localStorage.getItem('selectedTab') || 'wydarzenia';

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
    this.tabBtns.forEach(b => b.setAttribute('aria-selected', 'false'));
    document.getElementById('tab-' + tab).setAttribute('aria-selected', 'true');

    if (tab === 'wydarzenia') {
      this.wydarzeniaSection.style.display = '';
      this.planszaSection.style.display = 'none';
      this.plansza2Section.style.display = 'none';
    } else if (tab === 'plansza') {
      this.wydarzeniaSection.style.display = 'none';
      this.planszaSection.style.display = '';
      this.plansza2Section.style.display = 'none';
    } else if (tab === 'plansza2') {
      this.wydarzeniaSection.style.display = 'none';
      this.planszaSection.style.display = 'none';
      this.plansza2Section.style.display = '';
    }

    localStorage.setItem('selectedTab', tab);
  }
}

class ConfigManager {
  constructor(config) {
    this.config = config;
    this.enemyScalingInput = document.getElementById('enemy-scaling-input');
    this.resourcesConfigDiv = document.getElementById('resources-config');

    this.init();
  }

  init() {
    this.enemyScalingInput.value = this.config.enemyScaling;
    this.enemyScalingInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val) && val > 0) {
        this.config.enemyScaling = val;
      }
    });

    this.renderResourcesConfig();
  }

  renderResourcesConfig() {
    this.resourcesConfigDiv.innerHTML = '';

    Object.entries(this.config.resources).forEach(([key, resource]) => {
      const resourceDiv = document.createElement('div');
      resourceDiv.className = 'resource-config-item';
      resourceDiv.innerHTML = this.renderResourceTemplate(key, resource);
      this.resourcesConfigDiv.appendChild(resourceDiv);
    });

    // Add event listeners
    this.resourcesConfigDiv.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', (e) => {
        const resourceKey = e.target.getAttribute('data-resource');
        const type = e.target.getAttribute('data-type');

        if (type === 'cost') {
          const val = parseInt(e.target.value);
          if (!isNaN(val) && val >= 0) {
            this.config.resources[resourceKey].cost = val;
          }
        } else if (type === 'weight') {
          const weightLevel = e.target.getAttribute('data-weight');
          const val = parseInt(e.target.value);
          if (!isNaN(val) && val >= 0) {
            this.config.resources[resourceKey].weight[weightLevel] = val;
          }
        }
      });
    });
  }

  renderResourceTemplate(key, resource) {
    return `
      <strong>${resource.name}</strong><br>
      Koszt: <input type="number" min="0" value="${resource.cost}" data-resource="${key}" data-type="cost" class="resource-cost-input">
      <br>
      Wagi: 
      <div>1: <input type="number" min="0" value="${resource.weight[1]}" data-resource="${key}" data-type="weight" data-weight="1" class="resource-weight-input"></div>
      <div>2: <input type="number" min="0" value="${resource.weight[2]}" data-resource="${key}" data-type="weight" data-weight="2" class="resource-weight-input"></div>
      <div>3: <input type="number" min="0" value="${resource.weight[3]}" data-resource="${key}" data-type="weight" data-weight="3" class="resource-weight-input"></div>
    `;
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  const tabManager = new TabManager();
  const configManager = new ConfigManager(config);
  const eventManager = new EventManager();
});
