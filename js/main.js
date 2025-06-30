// Main application logic

class TabManager {
  constructor() {
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.wydarzeniaSection = document.getElementById('wydarzenia-section');
    this.planszaSection = document.getElementById('plansza-section');
    this.plansza2Section = document.getElementById('plansza2-section');
    this.mapaSection = document.getElementById('mapa-section');

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
      this.mapaSection.style.display = 'none';
    } else if (tab === 'plansza') {
      this.wydarzeniaSection.style.display = 'none';
      this.planszaSection.style.display = '';
      this.plansza2Section.style.display = 'none';
      this.mapaSection.style.display = 'none';
    } else if (tab === 'plansza2') {
      this.wydarzeniaSection.style.display = 'none';
      this.planszaSection.style.display = 'none';
      this.plansza2Section.style.display = '';
      this.mapaSection.style.display = 'none';
    } else if (tab === 'mapa') {
      this.wydarzeniaSection.style.display = 'none';
      this.planszaSection.style.display = 'none';
      this.plansza2Section.style.display = 'none';
      this.mapaSection.style.display = '';
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
  }

  renderResourceChances() {
    const chancesDisplay = document.getElementById('chances-display');
    if (!chancesDisplay) return;

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
            name: resource.name,
            chance: parseFloat(chance),
            cost: resource.cost
          };
        })
        .filter(resource => resource.chance > 0)
        .sort((a, b) => b.chance - a.chance); // Sort by chance descending

      if (resourcesWithChances.length > 0) {
        resourcesWithChances.forEach(resource => {
          html += `
            <div class="chance-resource-item">
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
  const resourceChancesManager = new ResourceChancesManager(config);
  const eventManager = new EventManager();
});
