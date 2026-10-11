"use strict";

(function () {
  document.documentElement.classList.add("js");

  const REVIEW_LABEL = "نیاز به بررسی";

  const formatPrice = (raw) => {
    const digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return null;
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

  const getMenuItems = () => (typeof MENU_DATA !== "undefined" ? MENU_DATA : []);

  /* ——— Header & navigation ——— */
  const initHeader = () => {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");

    if (header) {
      const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (toggle && nav) {
      const closeNav = () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        document.body.style.overflow = "";
      };

      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        nav.classList.toggle("is-open", open);
        document.body.style.overflow = open ? "hidden" : "";
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => closeNav());
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNav();
      });
    }
  };

  /* ——— Smooth scroll for in-page anchors ——— */
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  };

  /* ——— Reveal on scroll ——— */
  const initReveal = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  };

  /* ——— Menu page ——— */
  const MENU_CATEGORY_MAP = {
    breakfast: { id: "cat-breakfast", label: "صبحانه" },
    iranian: { id: "cat-iranian", label: "غذای ایرانی" },
    kebab: { id: "cat-kebab", label: "کباب‌ها" },
    appetizer: { id: "cat-appetizer", label: "پیش‌غذا و دسر" },
    drinks: { id: "cat-drinks", label: "نوشیدنی" },
  };

  const SECTION_ORDER = [
    "املت",
    "نیمرو",
    "بشقاب و خوراک",
    "غذای ایرانی",
    "کبابها",
    "پیش غذا ودسر",
    "نوشیدنی",
  ];

  const initMenuPage = () => {
    const root = document.getElementById("menu-sections");
    if (!root) return;

    const searchInput = document.getElementById("menu-search");
    const countEl = document.getElementById("menu-count");
    const emptyEl = document.getElementById("menu-empty");
    const catButtons = Array.from(document.querySelectorAll(".menu-cat-btn"));

    let activeCategory = "all";
    let searchQuery = "";

    const filterItems = () => {
      const q = normalize(searchQuery);
      return getMenuItems().filter((item) => {
        const catOk = activeCategory === "all" || item.category === activeCategory;
        if (!catOk) return false;
        if (!q) return true;
        const haystack = normalize(`${item.title} ${item.desc} ${item.section}`);
        return haystack.includes(q);
      });
    };

    const renderLine = (item) => {
      const thumb = item.image
        ? `<img class="menu-thumb" src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async" />`
        : "";
      const thumbClass = item.image ? " has-thumb" : "";
      const desc = item.desc ? `<p class="menu-line-desc">${escapeHtml(item.desc)}</p>` : "";
      const formatted = formatPrice(item.price);
      const priceHtml = formatted
        ? `<span class="menu-line-price">${escapeHtml(formatted)} <span class="unit">تومان</span></span>`
        : `<span class="menu-line-price is-review">${REVIEW_LABEL}</span>`;

      return `
        <li class="menu-line${thumbClass}">
          ${thumb}
          <div class="menu-line-body">
            <h4 class="menu-line-title">${escapeHtml(item.title)}</h4>
            ${desc}
          </div>
          ${priceHtml}
        </li>
      `;
    };

    const renderMenu = () => {
      const items = filterItems();
      root.innerHTML = "";
      if (countEl) {
        countEl.textContent = `${items.length.toLocaleString("fa-IR")} مورد`;
      }
      if (emptyEl) emptyEl.hidden = items.length > 0;

      if (!items.length) return;

      const byCategory = new Map();
      items.forEach((item) => {
        const key = item.category || "other";
        if (!byCategory.has(key)) byCategory.set(key, []);
        byCategory.get(key).push(item);
      });

      const categoryOrder = ["breakfast", "iranian", "kebab", "appetizer", "drinks"];
      const breakfastSubs = ["املت", "نیمرو", "بشقاب و خوراک"];

      categoryOrder.forEach((catKey) => {
        const catItems = byCategory.get(catKey);
        if (!catItems || !catItems.length) return;

        const meta = MENU_CATEGORY_MAP[catKey];
        const section = document.createElement("section");
        section.className = "menu-section-block";
        section.id = meta ? meta.id : `cat-${catKey}`;
        section.setAttribute("aria-labelledby", `${section.id}-title`);

        const bySection = new Map();
        catItems.forEach((item) => {
          const sec = item.section || "منو";
          if (!bySection.has(sec)) bySection.set(sec, []);
          bySection.get(sec).push(item);
        });

        const orderedSections = [...bySection.keys()].sort((a, b) => {
          const ia = SECTION_ORDER.indexOf(a);
          const ib = SECTION_ORDER.indexOf(b);
          if (ia === -1 && ib === -1) return a.localeCompare(b, "fa");
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });

        let inner = `<h2 id="${section.id}-title">${escapeHtml(meta ? meta.label : catKey)}</h2>`;

        orderedSections.forEach((sectionName) => {
          const lines = bySection.get(sectionName).map(renderLine).join("");
          if (catKey === "breakfast" && breakfastSubs.includes(sectionName)) {
            inner += `<div class="menu-subsection"><h3>${escapeHtml(sectionName)}</h3><ul class="menu-list">${lines}</ul></div>`;
          } else {
            inner += `<ul class="menu-list">${lines}</ul>`;
          }
        });

        section.innerHTML = inner;
        root.appendChild(section);
      });
    };

    const setCategory = (category) => {
      activeCategory = category;
      catButtons.forEach((btn) => {
        const isActive = btn.dataset.category === category;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      renderMenu();
    };

    catButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.category || "all";
        setCategory(cat);
        if (cat !== "all") {
          const meta = MENU_CATEGORY_MAP[cat];
          const target = meta ? document.getElementById(meta.id) : null;
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    searchInput?.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderMenu();
    });

    renderMenu();

    const hash = window.location.hash.replace("#", "");
    if (hash && document.getElementById(hash)) {
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  /* ——— Gallery lightbox ——— */
  const initGallery = () => {
    const grid = document.querySelector(".gallery-grid");
    const lightbox = document.getElementById("lightbox");
    if (!grid || !lightbox) return;

    const items = Array.from(grid.querySelectorAll(".gallery-item"));
    const imgEl = lightbox.querySelector("img");
    const captionEl = lightbox.querySelector(".lightbox-caption");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-prev");
    const nextBtn = lightbox.querySelector(".lightbox-next");
    let index = 0;

    const show = (i) => {
      index = (i + items.length) % items.length;
      const btn = items[index];
      const full = btn.dataset.full || btn.querySelector("img")?.src || "";
      const alt = btn.querySelector("img")?.alt || "";
      if (imgEl) {
        imgEl.src = full;
        imgEl.alt = alt;
      }
      if (captionEl) captionEl.textContent = alt;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn?.focus();
    };

    const hide = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    items.forEach((btn, i) => {
      btn.addEventListener("click", () => show(i));
    });

    closeBtn?.addEventListener("click", hide);
    prevBtn?.addEventListener("click", () => show(index - 1));
    nextBtn?.addEventListener("click", () => show(index + 1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) hide();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowRight") show(index - 1);
      if (e.key === "ArrowLeft") show(index + 1);
    });
  };

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  initHeader();
  initSmoothScroll();
  initReveal();
  initMenuPage();
  initGallery();
})();
