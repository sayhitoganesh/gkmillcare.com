document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#recommendationForm");
  const result = document.querySelector("#recommendationResult");
  if (!form || !result) return;

  const machines = {
    dust: {
      name: "Pulse Jet Bag Filter",
      category: "Filtration",
      description: "Dust collection equipment for cleaner and more controlled mill environments.",
      reason: "A strong fit when dust collection is the main requirement."
    },
    filters: {
      name: "Filter Bags & Cages",
      category: "Filter components",
      description: "Replacement and support components for dust collection systems.",
      reason: "Useful for maintenance, replacement and filtration-system support."
    },
    air: {
      name: "Centrifugal Blowers",
      category: "Air handling",
      description: "Industrial air movement solutions for process and mill applications.",
      reason: "Recommended when your project needs dependable air movement."
    },
    storage: {
      name: "Grain Storage Silos",
      category: "Grain handling",
      description: "Storage solutions for grain handling and mill operations.",
      reason: "Suitable when storage capacity and organized grain handling are priorities."
    },
    boiler: {
      name: "Boilers",
      category: "Steam systems",
      description: "Boiler solutions for process steam requirements and integrated projects.",
      reason: "Recommended when your mill project includes process steam requirements."
    },
    project: {
      name: "Complete Rice Mill Projects",
      category: "Complete solution",
      description: "Integrated project support for customers planning or expanding rice mill facilities.",
      reason: "A suitable starting point when you are planning a broader mill project."
    }
  };

  function recommendations(requirement, capacity) {
    const r = requirement.toLowerCase();
    const cap = parseFloat(capacity) || 0;
    if (r.includes("dust")) return [machines.dust, machines.filters];
    if (r.includes("air")) return [machines.air];
    if (r.includes("storage")) return [machines.storage];
    if (r.includes("boiler") || r.includes("steam")) return [machines.boiler];
    if (r.includes("spares") || r.includes("support")) return [machines.filters, machines.air];
    if (r.includes("complete")) return [machines.project, machines.dust, machines.air];
    return cap >= 5 ? [machines.project] : [machines.dust, machines.air];
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const state = form.querySelector('[name="state"]')?.value.trim();
    const capacity = form.querySelector('[name="capacity"]')?.value.trim();
    const requirement = form.querySelector('[name="requirement"]')?.value.trim();

    if (!state || !capacity || !requirement) {
      result.innerHTML = `<div class="recommendation-empty"><h3>Complete the three selections</h3><p>Select your state, mill capacity and requirement to see a tailored starting point.</p></div>`;
      return;
    }

    result.innerHTML = `<div class="recommendation-loading"><div class="loading-spinner"></div><p>Finding suitable equipment...</p></div>`;

    setTimeout(() => {
      const list = recommendations(requirement, capacity);
      result.innerHTML = `
        <div class="recommendation-header">
          <span class="recommendation-label">GK MILL CARE RECOMMENDATION</span>
          <h3>A practical starting point for your project</h3>
          <p>Based on the information you selected, these current GK Mill Care offerings may be relevant.</p>
        </div>
        <div class="recommendation-summary">
          <div><strong>Location</strong><span>${state.replace(/-/g," ")}</span></div>
          <div><strong>Capacity</strong><span>${capacity}</span></div>
          <div><strong>Requirement</strong><span>${requirement.replace(/-/g," ")}</span></div>
        </div>
        <div class="recommendation-list">
          ${list.map(machine => `
            <div class="recommendation-card">
              <div class="recommendation-icon">⚙</div>
              <div class="recommendation-card-content">
                <span class="recommendation-category">${machine.category}</span>
                <h3>${machine.name}</h3>
                <p>${machine.description}</p>
                <div class="recommendation-reason"><strong>Why this may suit you</strong><span>${machine.reason}</span></div>
              </div>
            </div>`).join("")}
        </div>
        <div class="recommendation-action">
          <p>Want a more specific recommendation for your mill?</p>
          <button type="button" class="btn btn-primary" data-quote-open>Talk to GK Mill Care →</button>
        </div>
      `;
      const btn=result.querySelector("[data-quote-open]");
      btn?.addEventListener("click", () => {
        document.querySelector("[data-quote-open]")?.click();
      });
    }, 500);
  });
});
