(function () {
  const CATEGORY_LABELS = {
    breakfast: "صبحانه",
    iranian: "غذای ایرانی",
    kebab: "کباب",
    appetizer: "پیش‌غذا و دسر",
    drinks: "نوشیدنی",
    other: "سایر",
  };

  const formatPrice = (raw) => {
    const digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return "—";
    return `${Number(digits).toLocaleString("fa-IR")} تومان`;
  };

  const normalize = (text) =>
    String(text || "")
      .toLowerCase()
      .replace(/\u200c/g, "")
      .trim();

  const menuGrid = document.getElementById("menu-grid");
  const menuCount = document.getElementById("menu-count");
  const menuEmpty = document.getElementById("menu-empty");
  const searchInput = document.getElementById("menu-search");
  const filterChips = Array.from(document.querySelectorAll(".filter-chip"));
  const categoryJumpCards = Array.from(document.querySelectorAll("[data-jump-category]"));

  let activeCategory = "all";
  let searchQuery = "";

  const getItems = () => (window.MENU_DATA ? window.MENU_DATA : []);

  const filterItems = () => {
    const q = normalize(searchQuery);
    return getItems().filter((item) => {
      const catOk = activeCategory === "all" || item.category === activeCategory;
      if (!catOk) return false;
      if (!q) return true;
      const haystack = normalize(`${item.title} ${item.desc} ${item.section}`);
      return haystack.includes(q);
    });
  };

  const renderMenu = () => {
    const items = filterItems();
    menuGrid.innerHTML = "";

    menuCount.textContent = `${items.length.toLocaleString("fa-IR")} مورد نمایش داده می‌شود`;
    menuEmpty.hidden = items.length > 0;

    items.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "menu-card" + (item.image ? " has-image" : "");
      card.style.animationDelay = `${Math.min(index * 0.04, 0.4)}s`;

      let mediaHtml = "";
      if (item.image) {
        mediaHtml = `<div class="menu-card-media"><img src="${item.image}" alt="" loading="lazy" decoding="async" /></div>`;
      }

      const sectionLabel = item.section || CATEGORY_LABELS[item.category] || "";
      const price = formatPrice(item.price);

      card.innerHTML = `
        ${mediaHtml}
        <div class="menu-card-body">
          <div class="menu-card-top">
            <h3 class="menu-card-title">${item.title}</h3>
            <span class="menu-card-price">${price}</span>
          </div>
          <p class="menu-card-meta">${sectionLabel}</p>
          ${item.desc ? `<p class="menu-card-desc">${item.desc}</p>` : ""}
        </div>
      `;

      menuGrid.appendChild(card);
    });
  };

  const setActiveChip = (category) => {
    activeCategory = category;
    filterChips.forEach((chip) => {
      const isActive = chip.dataset.category === category;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    renderMenu();
  };

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => setActiveChip(chip.dataset.category || "all"));
  });

  searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderMenu();
  });

  categoryJumpCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      const cat = card.getAttribute("data-jump-category");
      if (!cat) return;
      e.preventDefault();
      setActiveChip(cat);
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Mobile nav
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", open ? "false" : "true");
    if (mobileNav) mobileNav.hidden = open;
  });

  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.hidden = true;
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Header shadow on scroll
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.style.boxShadow = window.scrollY > 8 ? "var(--shadow-md)" : "none";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  renderMenu();
})();
