(function () {
  const menuGrid = document.getElementById("menu-grid");
  const menuCount = document.getElementById("menu-count");
  const menuEmpty = document.getElementById("menu-empty");
  const searchInput = document.getElementById("menu-search");
  const filterButtons = Array.from(document.querySelectorAll(".rail-filter"));

  let activeCategory = "all";
  let searchQuery = "";

  const formatPrice = (raw) => {
    const digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return "—";
    return Number(digits).toLocaleString("fa-IR");
  };

  const normalize = (text) =>
    String(text || "")
      .toLowerCase()
      .replace(/\u200c/g, "")
      .trim();

  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

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

  const groupBySection = (items) => {
    const map = new Map();
    items.forEach((item) => {
      const key = item.section || "منو";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return map;
  };

  const renderLine = (item) => {
    const thumb = item.image
      ? `<img class="menu-thumb" src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async" />`
      : "";
    const thumbClass = item.image ? " has-thumb" : "";
    const desc = item.desc ? `<p class="menu-line-desc">${escapeHtml(item.desc)}</p>` : "";
    const price = formatPrice(item.price);

    return `
      <li class="menu-line${thumbClass}">
        ${thumb}
        <div class="menu-line-body">
          <h3 class="menu-line-title">${escapeHtml(item.title)}</h3>
          ${desc}
        </div>
        <span class="menu-line-price">${escapeHtml(price)}</span>
      </li>
    `;
  };

  const renderMenu = () => {
    const items = filterItems();
    menuGrid.innerHTML = "";
    menuCount.textContent = `${items.length.toLocaleString("fa-IR")} مورد · تومان`;
    menuEmpty.hidden = items.length > 0;

    if (!items.length) return;

    const groups = groupBySection(items);
    groups.forEach((sectionItems, sectionName) => {
      const block = document.createElement("section");
      block.className = "menu-section-block";
      block.innerHTML = `
        <h3 class="menu-section-head">${escapeHtml(sectionName)}</h3>
        <ul class="menu-list">
          ${sectionItems.map(renderLine).join("")}
        </ul>
      `;
      menuGrid.appendChild(block);
    });
  };

  const setActiveCategory = (category) => {
    activeCategory = category;
    filterButtons.forEach((btn) => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    renderMenu();
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => setActiveCategory(btn.dataset.category || "all"));
  });

  searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderMenu();
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  renderMenu();
})();
