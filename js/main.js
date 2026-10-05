document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuButton = document.querySelector(".mobile-menu-button");
  const navMenu = document.querySelector(".nav-menu");
  const header = document.querySelector(".site-header");

  /* Mobile navigation */
  if (mobileMenuButton && navMenu) {
    mobileMenuButton.addEventListener("click", () => {
      const open = navMenu.classList.toggle("active");
      mobileMenuButton.setAttribute("aria-expanded", String(open));
      mobileMenuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    });

    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        mobileMenuButton.setAttribute("aria-expanded", "false");
        mobileMenuButton.setAttribute("aria-label", "Open navigation menu");
      });
    });
  }

  /* Header shadow on scroll */
  const updateHeader = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* Current year */
  document.querySelectorAll("[data-current-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* Reveal animation */
  const revealItems = document.querySelectorAll(".reveal, .fade-in, .animate-on-scroll");
  if ("IntersectionObserver" in window && revealItems.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible", "visible", "active", "show");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("show"));
  }

  /* Smooth in-page scrolling */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const id = link.getAttribute("href");
      if (!id || id === "#" || id === "#quotationModal") return;
      const target = document.querySelector(id);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* Active navigation */
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-menu a").forEach(link => {
    const href = link.getAttribute("href") || "";
    const page = href.split("/").pop().split("#")[0];
    if (page === current || (current === "" && page === "index.html")) link.classList.add("active");
  });

  /* Phone input sanitization */
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(0, 10);
    });
  });

  /* Prevent accidental image dragging */
  document.querySelectorAll("img").forEach(img => img.setAttribute("draggable", "false"));

  /* Coverage state selection + browser location */
  const stateSelect = document.querySelector('#recommendationForm select[name="state"]');
  const stateButtons = document.querySelectorAll('.state-tags [data-state]');
  const useMyLocation = document.querySelector('#useMyLocation');
  const locationStatus = document.querySelector('#locationStatus');
  const serviceMap = document.querySelector('#serviceMapFrame');
  const mapOpenLink = document.querySelector('#openServiceMap');
  function updateServiceMap(latitude, longitude, label = 'Selected location') {
    if (serviceMap) serviceMap.src = `https://www.google.com/maps?q=${encodeURIComponent(latitude + ',' + longitude)}&output=embed`;
    if (mapOpenLink) mapOpenLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(latitude + ',' + longitude)}`;
    if (locationStatus && label) locationStatus.textContent = label;
  }

  function setCoverageState(state) {
    if (!state) return;
    if (stateSelect) {
      const option = [...stateSelect.options].find(o => o.textContent.trim().toLowerCase() === state.trim().toLowerCase());
      if (option) stateSelect.value = option.value;
    }
    stateButtons.forEach(btn => btn.classList.toggle('is-selected', btn.dataset.state.toLowerCase() === state.toLowerCase()));
    if (locationStatus) locationStatus.textContent = `Selected service location: ${state}`;
  }

  stateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setCoverageState(btn.dataset.state);
      document.querySelector('#recommendationForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      stateSelect?.focus({ preventScroll: true });
    });
  });

  if (useMyLocation) {
    useMyLocation.addEventListener('click', async () => {
      if (!navigator.geolocation) {
        if (locationStatus) locationStatus.textContent = 'Location is not supported by this browser. Please select your state.';
        return;
      }
      useMyLocation.disabled = true;
      useMyLocation.textContent = 'Finding location…';
      if (locationStatus) locationStatus.textContent = 'Requesting your location permission…';
      navigator.geolocation.getCurrentPosition(async position => {
        const { latitude, longitude } = position.coords;
        updateServiceMap(latitude, longitude);
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=10&addressdetails=1`, {
            headers: { 'Accept': 'application/json' }
          });
          if (!response.ok) throw new Error('Reverse geocoding failed');
          const data = await response.json();
          const address = data.address || {};
          const state = address.state || '';
          const city = address.city || address.town || address.village || address.county || '';
          if (state) {
            setCoverageState(state);
            if (locationStatus) locationStatus.textContent = city ? `Detected: ${city}, ${state}` : `Detected: ${state}`;
          } else {
            if (locationStatus) locationStatus.textContent = 'Location found, but the state could not be identified. Please select it manually.';
          }
        } catch (error) {
          if (locationStatus) locationStatus.textContent = 'Could not identify the state automatically. Please select it manually.';
        } finally {
          useMyLocation.disabled = false;
          useMyLocation.textContent = 'Use my location';
        }
      }, error => {
        const message = error.code === 1 ? 'Location permission was denied. Please select your state.' : 'Unable to get your location. Please select your state.';
        if (locationStatus) locationStatus.textContent = message;
        useMyLocation.disabled = false;
        useMyLocation.textContent = 'Use my location';
      }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    });
  }

  /* Quotation modal */
  const modal = document.querySelector("#quotationModal");
  const firstModalInput = modal?.querySelector('input[name="name"]');

  const openModal = (event) => {
    event?.preventDefault();
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(() => firstModalInput?.focus(), 80);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  document.querySelectorAll("[data-quote-open]").forEach(trigger => {
    trigger.addEventListener("click", openModal);
  });
  document.querySelectorAll("[data-quote-close]").forEach(trigger => {
    trigger.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
  });

  /* WhatsApp form handoff */
  const whatsappNumber = (window.GK_MILL_CARE?.whatsappNumber || "919480024543").replace(/\D/g, "");

  function buildWhatsAppMessage(form, title, fields) {
    const lines = [title, ""];
    fields.forEach(({ label, selector }) => {
      const el = form.querySelector(selector);
      if (el && String(el.value).trim()) lines.push(`${label}: ${el.value.trim()}`);
    });
    return lines.join("\n");
  }

  function sendToWhatsApp(form, title, fields) {
    const required = fields.filter(item => item.required);
    for (const item of required) {
      const el = form.querySelector(item.selector);
      if (!el || !String(el.value).trim()) {
        alert("Please fill all required fields.");
        el?.focus();
        return;
      }
    }

    const phone = form.querySelector('input[type="tel"]');
    if (phone && !/^\d{10}$/.test(phone.value.trim())) {
      alert("Please enter a valid 10-digit mobile number.");
      phone.focus();
      return;
    }

    if (!whatsappNumber) {
      alert("The enquiry form is ready. Add the official GK Mill Care WhatsApp number in js/main.js to activate WhatsApp submission.");
      return;
    }

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(form, title, fields))}`;
    window.open(url, "_blank", "noopener");
  }

  const modalForm = document.querySelector("#quotationModalForm");
  if (modalForm) {
    modalForm.addEventListener("submit", event => {
      event.preventDefault();
      sendToWhatsApp(modalForm, "GK Mill Care - Quotation Enquiry", [
        { label: "Name", selector: '[name="name"]', required: true },
        { label: "Company", selector: '[name="company"]' },
        { label: "Phone", selector: '[name="phone"]', required: true },
        { label: "Email", selector: '[name="email"]' },
        { label: "Requirement", selector: '[name="message"]', required: true }
      ]);
    });
  }

  const quotationForm = document.querySelector("#quotationForm");
  if (quotationForm) {
    quotationForm.addEventListener("submit", event => {
      event.preventDefault();
      sendToWhatsApp(quotationForm, "GK Mill Care - Quotation Request", [
        { label: "Name", selector: '[name="name"]', required: true },
        { label: "Phone", selector: '[name="phone"]', required: true },
        { label: "Email", selector: '[name="email"]' },
        { label: "State", selector: '[name="state"]' },
        { label: "City", selector: '[name="city"]' },
        { label: "Requirement", selector: '[name="requirementType"]' },
        { label: "Machine", selector: '[name="machine"]' },
        { label: "Capacity", selector: '[name="capacity"]' },
        { label: "Project Status", selector: '[name="projectStatus"]' },
        { label: "Message", selector: '[name="message"]' }
      ]);
    });
  }

  const contactForm = document.querySelector("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", event => {
      event.preventDefault();
      sendToWhatsApp(contactForm, "GK Mill Care - Contact Enquiry", [
        { label: "Name", selector: '[name="name"]', required: true },
        { label: "Phone", selector: '[name="phone"]', required: true },
        { label: "Location", selector: '[name="location"]' },
        { label: "Subject", selector: '[name="subject"]' },
        { label: "Message", selector: '[name="message"]', required: true }
      ]);
    });
  }
});
