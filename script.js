"use strict";

(function () {
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
          const isSub =
            catKey === "breakfast" &&
            ["املت", "نیمرو", "بشقاب و خوراک"].includes(sectionName);
          if (isSub) {
            inner += `<div class="menu-subsection"><h3>${escapeHtml(sectionName)}</h3>`;
            inner += `<ul class="menu-list">${bySection.get(sectionName).map(renderLine).join("")}</ul></div>`;
          } else if (catKey === "breakfast" && sectionName !== "غذای ایرانی") {
            inner += `<ul class="menu-list">${bySection.get(sectionName).map(renderLine).join("")}</ul>`;
          } else if (catKey !== "breakfast") {
            if (sectionName !== meta?.label && sectionName !== "غذای ایرانی" && sectionName !== "کبابها") {
              inner += `<div class="menu-subsection"><h3>${escapeHtml(sectionName)}</h3>`;
              inner += `<ul class="menu-list">${bySection.get(sectionName).map(renderLine).join("")}</ul></div>`;
            } else {
              inner += `<ul class="menu-list">${bySection.get(sectionName).map(renderLine).join("")}</ul>`;
            }
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
const MENU_DATA = [
  {
    "title": "املت گوجه",
    "price": "300000",
    "desc": "تخم مرغ، گوجه، کره، دورچین، نان ،چای",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/04/املت-ساده.jpg",
    "section": "املت",
    "category": "breakfast"
  },
  {
    "title": "املت درباری",
    "price": "420000",
    "desc": "تخم مرغ، گوجه، کره،پنیر گودا، ژامبون، قارچ، خلال سیب زمینی وهویج، دورچین، نان ،چای",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/04/املت-درباری.jpg",
    "section": "املت",
    "category": "breakfast"
  },
  {
    "title": "املت تبریزی",
    "price": "350000",
    "desc": "تخم مرغ، گوجه، کره، پنیر، دورچین، نان ،چای",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-23-at-10.39.00-AM-1-e1748088952337.jpeg",
    "section": "املت",
    "category": "breakfast"
  },
  {
    "title": "املت شاپوری",
    "price": "350000",
    "desc": "تخم مرغ، گوجه، کره، پیازداغ، دورچین، نان ،چای",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-23-at-10.39.00-AM-2-e1748089048578.jpeg",
    "section": "املت",
    "category": "breakfast"
  },
  {
    "title": "املت سوسیس",
    "price": "350000",
    "desc": "تخم مرغ، گوجه، کره، سوسیس، دورچین، نان ،چای",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "املت",
    "category": "breakfast"
  },
  {
    "title": "املت قارچ و سوسیس",
    "price": "380000",
    "desc": "تخم مرغ، گوجه، کره، قارچ، سوسیس، دورچین، نان ،چای",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "املت",
    "category": "breakfast"
  },
  {
    "title": "نیمرو ساده",
    "price": "260000",
    "desc": "تخم مرغ، کره، دورچین، نان ،چای",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/04/نیمرو-ساده.jpg",
    "section": "نیمرو",
    "category": "breakfast"
  },
  {
    "title": "نیمرو قارچ و سوسیس",
    "price": "340000",
    "desc": "تخم مرغ، کره، قارچ، سوسیس، دورچین، نان ،چای",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/04/املت-قارچ-و-سوسیس.jpg",
    "section": "نیمرو",
    "category": "breakfast"
  },
  {
    "title": "نیمرو سوسیس سیب زمینی",
    "price": "380000",
    "desc": "تخم مرغ، کره، تن ماهی، قارچ، دورچین، نان ،چای",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نیمرو",
    "category": "breakfast"
  },
  {
    "title": "میز درباری",
    "price": "1600000",
    "desc": "4 نفره",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "بشقاب و خوراک",
    "category": "breakfast"
  },
  {
    "title": "بشقاب تست وسیب زمینی",
    "price": "380000",
    "desc": "سیب زمینی سرخ کرده، تست مغزدار پنیر و کالباس، سالاد",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "بشقاب و خوراک",
    "category": "breakfast"
  },
  {
    "title": "بشقاب ایرانی",
    "price": "380000",
    "desc": "تخم مرغ آب پز، خامه، پنیر،خیار، گوجه، کره، مربا، حلوا شکری",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/04/بشقاب-ایرانی.jpg",
    "section": "بشقاب و خوراک",
    "category": "breakfast"
  },
  {
    "title": "بشقاب ایرانی",
    "price": "380000",
    "desc": "تخم مرغ آب پز، خامه، پنیر،خیار، گوجه، کره، مربا، حلوا شکری",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/04/بشقاب-ایرانی.jpg",
    "section": "بشقاب و خوراک",
    "category": "breakfast"
  },
  {
    "title": "قیساوا",
    "price": "350000",
    "desc": "تخم مرغ، کره، خرما، دارچین، پودر گل سرخ، مغزهای خوراکی، نان، چای",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/04/قیساوا.jpg",
    "section": "بشقاب و خوراک",
    "category": "breakfast"
  },
  {
    "title": "خوراک لوبیا و قارچ",
    "price": "300000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "بشقاب و خوراک",
    "category": "breakfast"
  },
  {
    "title": "بورک مخصوص",
    "price": "350000",
    "desc": "بورک  5 عدد",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "بشقاب و خوراک",
    "category": "breakfast"
  },
  {
    "title": "باقالی پلو با ماهیچه",
    "price": "1850000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/1704372318515-e1746292580230.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "باقالی پلو با گوشت",
    "price": "1300000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/1704372318530-e1746443971850.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "چلو ماهیچه",
    "price": "1550000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "چلو گوشت",
    "price": "1200000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "باقالی پلو با مرغ ران",
    "price": "850000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/1704372318512.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "باقالی پلو با مرغ سینه",
    "price": "870000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "زرشک پلو درباری سینه",
    "price": "870000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/IMG_20240601_220854_468.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "زرشک پلو درباری ران",
    "price": "850000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-23-at-10.39.00-AM-4-e1748089615431.jpeg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "زرشک پلومخصوص ران",
    "price": "690000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "زرشک پلومخصوص سینه",
    "price": "710000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "خوراک مرغ ران",
    "price": "530000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "خوراک مرغ سینه",
    "price": "550000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "ته چین پلو با مرغ سینه",
    "price": "890000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/1704372318506-e1746445004744.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "ته چین پلو با مرغ ران",
    "price": "870000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "ته چین قالبی مرغ",
    "price": "750000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/1704372318533-e1746445122535.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "ته چین قالبی گوشت",
    "price": "840000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/1704372318602-e1746445288268.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "خورشت فسنجان ران",
    "price": "800000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "خورشت فسنجان سینه",
    "price": "820000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "خورشت قورمه سبزی",
    "price": "690000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/IMG_20241118_154008_773.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "خورشت قیمه",
    "price": "690000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/IMG_20241118_154017_729.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "میکس قیمه و قرمه سبزی",
    "price": "760000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "خورشت قیمه بادمجان",
    "price": "720000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "خورشت بادمجان",
    "price": "690000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/1704372318573-e1746445626312.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "ته چین با خورشت قرمه سبزی",
    "price": "790000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/1704372318538-e1746445680474.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "ته چین با خورشت قیمه",
    "price": "790000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "خورشت هویج با آلو گوشت",
    "price": "690000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/04/IMG_20240601_221649_902-e1748364526310.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "خورشت هویج با آلو ران",
    "price": "800000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "خورشت هویج با آلو سینه",
    "price": "820000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "غذای ایرانی",
    "category": "iranian"
  },
  {
    "title": "چلو برگ مخصوص",
    "price": "",
    "desc": "250 گرم راسته گوسفندی",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "کبابها",
    "category": "kebab"
  },
  {
    "title": "چلو برگ نیمه مخصوص",
    "price": "",
    "desc": "200 گرم راسته گوسفندی",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "کبابها",
    "category": "kebab"
  },
  {
    "title": "چلو کوبیده مخصوص",
    "price": "1150000",
    "desc": "220 گرم",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "کبابها",
    "category": "kebab"
  },
  {
    "title": "چلو کوبیده نیمه مخصوص",
    "price": "880000",
    "desc": "150 گرم",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "کبابها",
    "category": "kebab"
  },
  {
    "title": "چلو کوبیده دو سیخ",
    "price": "1600000",
    "desc": "دو سیخ 150 گرمی برنج ایرانی",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "کبابها",
    "category": "kebab"
  },
  {
    "title": "چلو جوجه کباب مخصوص",
    "price": "900000",
    "desc": "300 گرم",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "کبابها",
    "category": "kebab"
  },
  {
    "title": "چلو جوجه کباب نیمه مخصوص",
    "price": "730000",
    "desc": "200 گرم",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "کبابها",
    "category": "kebab"
  },
  {
    "title": "کباب تابه ای با چلو",
    "price": "980000",
    "desc": "150 گرم",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-23-at-10.39.00-AM-9-e1748089490728.jpeg",
    "section": "کبابها",
    "category": "kebab"
  },
  {
    "title": "چلوکره",
    "price": "230000",
    "desc": "300 گرم برنج ایرانی",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "کبابها",
    "category": "kebab"
  },
  {
    "title": "چیکن استراگانف",
    "price": "650000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "کوکو لوبیا",
    "price": "400000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "کشک بادمجان",
    "price": "400000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "گارنی یاریخ",
    "price": "450000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "خوراک زبان با سس قارچ",
    "price": "700000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "خوراک زبان",
    "price": "600000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/1704372318545-e1748365445924.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "بورک مخصوص",
    "price": "350000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "دلمه برگ مو",
    "price": "350000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/1704372318615.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "سیب زمینی",
    "price": "350000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "سوپ خامه",
    "price": "200000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "سوپ زعفران",
    "price": "200000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "ماست",
    "price": "100000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "زیتون",
    "price": "200000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "ترشی",
    "price": "200000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "سالاد فصل",
    "price": "200000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "سالاد شیرازی",
    "price": "200000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "پیش غذا ودسر",
    "category": "appetizer"
  },
  {
    "title": "آب پرتقال",
    "price": "200000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "فانتارز",
    "price": "170000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "کولالاو",
    "price": "160000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "موهیتو",
    "price": "195000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "سودا",
    "price": "90000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "سودا لیمو",
    "price": "115000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "لیموناد",
    "price": "200000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "چای قوری",
    "price": "200000",
    "desc": "سه نفره",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "چای",
    "price": "70000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "دوغ محلی لیوانی",
    "price": "130000",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "نوشابه فلزی",
    "price": "",
    "desc": "کوکا - فانتا -اسپرایت",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "دلستر فلزی",
    "price": "",
    "desc": "لیمو",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  },
  {
    "title": "آب معدنی کوچک",
    "price": "",
    "desc": "",
    "image": "https://chatreabi.ir/wp-content/uploads/2025/05/544a0f23-f561-4d51-8b65-a89da549a9d0.jpg",
    "section": "نوشیدنی",
    "category": "drinks"
  }
];