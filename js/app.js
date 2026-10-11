(function () {
  const CATEGORY_LABELS = {
    breakfast: "صبحانه",
    iranian: "غذای ایرانی",
    kebab: "کباب",
    appetizer: "پیش‌غذا و دسر",
    drinks: "نوشیدنی",
    other: "سایر",
  };

  const SIGNATURE_PICKS = [
    "املت درباری",
    "بشقاب ایرانی",
    "چلو کوبیده مخصوص",
    "باقالی پلو با ماهیچه",
  ];

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
  const signatureGrid = document.getElementById("signature-grid");

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

  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const renderSignature = () => {
    if (!signatureGrid) return;
    const items = getItems();
    const picks = SIGNATURE_PICKS
      .map((title) => items.find((i) => i.title.trim() === title))
      .filter(Boolean);

    const fallback = items.filter((i) => i.image).slice(0, 4);
    const showcase = picks.length >= 3 ? picks : fallback;

    signatureGrid.innerHTML = showcase
      .map(
        (item) => `
      <article class="signature-card reveal">
        ${
          item.image
            ? `<img src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async" />`
            : `<div style="min-height:16rem;background:linear-gradient(145deg,#1e3a8a,#0f172a)"></div>`
        }
        <div class="signature-card-overlay">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.desc || item.section)}</p>
          <span class="signature-price">${escapeHtml(formatPrice(item.price))}</span>
        </div>
      </article>
    `
      )
      .join("");

    observeReveal(signatureGrid.querySelectorAll(".reveal"));
  };

  const renderMenu = () => {
    const items = filterItems();
    menuGrid.innerHTML = "";

    menuCount.textContent = `${items.length.toLocaleString("fa-IR")} مورد نمایش داده می‌شود`;
    menuEmpty.hidden = items.length > 0;

    items.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "menu-card" + (item.image ? "" : " no-image");
      card.style.animationDelay = `${Math.min(index * 0.035, 0.45)}s`;

      const sectionLabel = item.section || CATEGORY_LABELS[item.category] || "";
      const price = formatPrice(item.price);
      const title = escapeHtml(item.title);
      const desc = item.desc ? `<p class="menu-card-desc">${escapeHtml(item.desc)}</p>` : "";

      let mediaHtml = "";
      if (item.image) {
        mediaHtml = `
          <div class="menu-card-media">
            <span class="menu-card-badge">${escapeHtml(sectionLabel)}</span>
            <img src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async" />
          </div>`;
      }

      card.innerHTML = `
        ${mediaHtml}
        <div class="menu-card-body">
          <div class="menu-card-row">
            <h3 class="menu-card-title">${title}</h3>
            <span class="menu-card-leader" aria-hidden="true"></span>
            <span class="menu-card-price">${escapeHtml(price)}</span>
          </div>
          ${!item.image ? `<p class="menu-card-meta">${escapeHtml(sectionLabel)}</p>` : ""}
          ${desc}
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

  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    const scrolled = window.scrollY > 12;
    header.classList.toggle("is-scrolled", scrolled);
    header.style.boxShadow = scrolled ? "var(--shadow-md)" : "none";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const observeReveal = (nodes) => {
    const targets = nodes || document.querySelectorAll(".reveal:not(.is-visible)");
    if (!targets.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => io.observe(el));
  };

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  renderSignature();
  renderMenu();
  observeReveal(document.querySelectorAll(".reveal"));
})();
