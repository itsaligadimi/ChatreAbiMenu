"use strict";

(function () {
  const REVIEW = "نیاز به بررسی";

  const formatPrice = (raw) => {
    const digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return null;
    return Number(digits).toLocaleString("fa-IR");
  };

  const normalize = (t) =>
    String(t || "")
      .toLowerCase()
      .replace(/\u200c/g, "")
      .trim();

  const escapeHtml = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const items = typeof MENU_DATA !== "undefined" ? MENU_DATA : [];

  /* Scroll targets */
  document.querySelectorAll("[data-scroll]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-scroll");
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const topbar = document.getElementById("topbar");
  if (topbar) {
    window.addEventListener(
      "scroll",
      () => topbar.classList.toggle("is-scrolled", window.scrollY > 24),
      { passive: true }
    );
  }

  /* Hero parallax */
  const stage = document.getElementById("hero-stage");
  const hero = document.getElementById("hero");
  const plates = stage ? Array.from(stage.querySelectorAll(".plate")) : [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;

  if (!reducedMotion && plates.length) {
    document.addEventListener(
      "mousemove",
      (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        mouseX = (e.clientX - cx) / cx;
        mouseY = (e.clientY - cy) / cy;
      },
      { passive: true }
    );

    window.addEventListener("scroll", () => {
      scrollY = window.scrollY;
    }, { passive: true });

    const updatePlates = () => {
      const heroH = hero ? hero.offsetHeight : 600;
      const scrollFactor = Math.min(scrollY / heroH, 1);

      plates.forEach((plate, i) => {
        const depth = parseFloat(plate.dataset.depth || "0.4");
        const mx = mouseX * depth * 28;
        const my = mouseY * depth * 22;
        const sy = scrollFactor * depth * 120 * (i % 2 === 0 ? 1 : -1);
        const rot = mouseX * depth * 6 + (i - 2) * 2;
        const scale = 1 - scrollFactor * 0.08;
        plate.style.transform = `translate3d(${mx}px, ${my + sy}px, 0) rotate(${rot}deg) scale(${scale})`;
      });
      requestAnimationFrame(updatePlates);
    };
    requestAnimationFrame(updatePlates);
  }

  /* Orbit card glow follow */
  document.querySelectorAll(".orbit-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  });

  /* Menu */
  const board = document.getElementById("menu-board");
  const emptyEl = document.getElementById("menu-empty");
  const searchInput = document.getElementById("menu-search");
  const tabs = Array.from(document.querySelectorAll(".menu-tab"));

  let category = "all";
  let query = "";

  const CATEGORY_LABEL = {
    breakfast: "صبحانه",
    iranian: "غذای ایرانی",
    kebab: "کباب‌ها",
    appetizer: "پیش‌غذا و دسر",
    drinks: "نوشیدنی",
  };

  const filterItems = () =>
    items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!query) return true;
      const hay = normalize(`${item.title} ${item.desc} ${item.section}`);
      return hay.includes(normalize(query));
    });

  const renderLine = (item) => {
    const price = formatPrice(item.price);
    const priceHtml = price
      ? `<span class="menu-item-price">${escapeHtml(price)} تومان</span>`
      : `<span class="menu-item-price is-tbd">${REVIEW}</span>`;
    const desc = item.desc ? `<p class="menu-item-desc">${escapeHtml(item.desc)}</p>` : "";
    return `<li class="menu-item"><h3 class="menu-item-name">${escapeHtml(item.title)}</h3>${desc}${priceHtml}</li>`;
  };

  const renderMenu = () => {
    if (!board) return;
    const filtered = filterItems();
    board.innerHTML = "";
    if (emptyEl) emptyEl.hidden = filtered.length > 0;
    if (!filtered.length) return;

    const byCat = new Map();
    filtered.forEach((item) => {
      const c = item.category || "other";
      if (!byCat.has(c)) byCat.set(c, []);
      byCat.get(c).push(item);
    });

    const order = ["breakfast", "iranian", "kebab", "appetizer", "drinks"];
    order.forEach((catKey) => {
      const catItems = byCat.get(catKey);
      if (!catItems?.length) return;

      const block = document.createElement("div");
      block.className = "menu-block";
      block.innerHTML = `<h3 class="menu-block-title">${escapeHtml(CATEGORY_LABEL[catKey] || catKey)}</h3>`;

      const bySection = new Map();
      catItems.forEach((item) => {
        const s = item.section || "منو";
        if (!bySection.has(s)) bySection.set(s, []);
        bySection.get(s).push(item);
      });

      bySection.forEach((sectionItems, sectionName) => {
        const showSub =
          catKey === "breakfast" && ["املت", "نیمرو", "بشقاب و خوراک"].includes(sectionName);
        if (showSub) {
          const sub = document.createElement("div");
          sub.innerHTML = `<h4 class="menu-subtitle">${escapeHtml(sectionName)}</h4><ul class="menu-items">${sectionItems.map(renderLine).join("")}</ul>`;
          block.appendChild(sub);
        } else {
          const ul = document.createElement("ul");
          ul.className = "menu-items";
          ul.innerHTML = sectionItems.map(renderLine).join("");
          block.appendChild(ul);
        }
      });

      board.appendChild(block);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      category = tab.dataset.category || "all";
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      renderMenu();
    });
  });

  searchInput?.addEventListener("input", (e) => {
    query = e.target.value;
    renderMenu();
  });

  renderMenu();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
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