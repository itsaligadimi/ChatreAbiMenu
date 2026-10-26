"use strict";

(function () {
  const REVIEW_TEXT = "استعلام قیمت روز";
  const FALLBACK_IMG = "images/food/baghali-mahiche-pro.jpg";

  const items = Array.isArray(window.MENU_DATA) ? window.MENU_DATA : [];
  const itemById = new Map(items.map((item, idx) => [item.id || `item-${idx}`, item]));

  const toPersianDigits = (val) =>
    String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

  const formatPrice = (raw) => {
    const digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return null;
    return Number(digits).toLocaleString("fa-IR");
  };

  const normalize = (t) =>
    String(t || "")
      .toLowerCase()
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/\u200c/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const escapeHtml = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  /* ─── 1. Smooth Scroll & Topbar State ─── */
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
      () => topbar.classList.toggle("is-scrolled", window.scrollY > 20),
      { passive: true }
    );
  }

  /* ─── 2. Theme Toggle (Light Marble / Royal Dark) ─── */
  const themeToggle = document.getElementById("theme-toggle");
  const rootHtml = document.documentElement;
  const savedTheme = localStorage.getItem("chatreabi-theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    rootHtml.setAttribute("data-theme", savedTheme);
  }

  themeToggle?.addEventListener("click", () => {
    const next = rootHtml.getAttribute("data-theme") === "dark" ? "light" : "dark";
    rootHtml.setAttribute("data-theme", next);
    localStorage.setItem("chatreabi-theme", next);
  });

  /* ─── 3. Interactive Hero Orbital Stage ─── */
  const orbitButtons = Array.from(document.querySelectorAll(".orbit-plate"));
  const heroMainPlate = document.getElementById("hero-main-plate");
  const heroActiveImg = document.getElementById("hero-active-img");
  const heroPhotoBadge = document.getElementById("hero-photo-badge");
  const heroDishTag = document.getElementById("hero-dish-tag");
  const heroDishTitle = document.getElementById("hero-dish-title");
  const heroDishDesc = document.getElementById("hero-dish-desc");
  const heroDishPrice = document.getElementById("hero-dish-price");
  const heroAddBtn = document.getElementById("hero-add-btn");
  const heroCompareBtn = document.getElementById("hero-compare-btn");
  const heroStage = document.getElementById("hero-stage");

  let activeHeroId = "ir-baghali-mahiche";
  let heroShowingOriginal = false;
  let heroAutoTimer = null;

  const updateHeroStage = (dishId, animate = true) => {
    const dish = itemById.get(dishId);
    if (!dish) return;
    activeHeroId = dishId;
    heroShowingOriginal = false;

    orbitButtons.forEach((btn) => {
      const isMatch = btn.dataset.dishId === dishId;
      btn.classList.toggle("is-active", isMatch);
      btn.setAttribute("aria-selected", isMatch ? "true" : "false");
    });

    if (animate && heroMainPlate) {
      heroMainPlate.classList.add("is-switching");
      setTimeout(() => {
        if (heroActiveImg) {
          heroActiveImg.src = dish.image || FALLBACK_IMG;
          heroActiveImg.alt = dish.title;
        }
        heroMainPlate.classList.remove("is-switching");
      }, 180);
    } else if (heroActiveImg) {
      heroActiveImg.src = dish.image || FALLBACK_IMG;
      heroActiveImg.alt = dish.title;
    }

    if (heroPhotoBadge) {
      heroPhotoBadge.textContent = "عکاسی استودیویی بازطراحی‌شده ✨";
    }
    if (heroCompareBtn) {
      heroCompareBtn.hidden = !dish.originalImage;
      heroCompareBtn.classList.remove("is-comparing");
      heroCompareBtn.textContent = "مقایسه با عکس اصلی";
    }
    if (heroDishTag) heroDishTag.textContent = dish.badge || dish.section || "ویژه چتر آبی";
    if (heroDishTitle) heroDishTitle.textContent = dish.title;
    if (heroDishDesc) heroDishDesc.textContent = dish.desc || "پخت روزانه با مواد اولیه تازه در رستوران چتر آبی";
    if (heroDishPrice) {
      const p = formatPrice(dish.price);
      heroDishPrice.innerHTML = p ? `${escapeHtml(p)} <small>تومان</small>` : REVIEW_TEXT;
    }
    if (heroAddBtn) {
      heroAddBtn.dataset.id = dish.id;
    }
  };

  orbitButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.dishId;
      if (id) updateHeroStage(id, true);
    });
  });

  heroCompareBtn?.addEventListener("click", () => {
    const dish = itemById.get(activeHeroId);
    if (!dish || !dish.originalImage || !heroActiveImg) return;
    heroShowingOriginal = !heroShowingOriginal;
    heroActiveImg.src = heroShowingOriginal ? dish.originalImage : dish.image;
    heroCompareBtn.classList.toggle("is-comparing", heroShowingOriginal);
    heroCompareBtn.textContent = heroShowingOriginal
      ? "بازگشت به عکس استودیویی ✨"
      : "مقایسه با عکس اصلی";
    if (heroPhotoBadge) {
      heroPhotoBadge.textContent = heroShowingOriginal
        ? "عکس اولیه منوی رستوران"
        : "عکاسی استودیویی بازطراحی‌شده ✨";
    }
  });

  heroAddBtn?.addEventListener("click", () => {
    const id = heroAddBtn.dataset.id;
    if (id) addToTray(id, 1);
  });

  const startHeroCycle = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stopHeroCycle();
    heroAutoTimer = setInterval(() => {
      if (heroShowingOriginal) return;
      const ids = orbitButtons.map((b) => b.dataset.dishId).filter(Boolean);
      const idx = ids.indexOf(activeHeroId);
      const nextId = ids[(idx + 1) % ids.length];
      if (nextId) updateHeroStage(nextId, true);
    }, 5200);
  };

  const stopHeroCycle = () => {
    if (heroAutoTimer) {
      clearInterval(heroAutoTimer);
      heroAutoTimer = null;
    }
  };

  heroStage?.addEventListener("mouseenter", stopHeroCycle);
  heroStage?.addEventListener("mouseleave", startHeroCycle);
  startHeroCycle();

  /* ─── 4. Chef's Signature Showcase (Featured Grid) ─── */
  const featuredGrid = document.getElementById("featured-grid");
  const modeStudioBtn = document.getElementById("mode-studio-btn");
  const modeOriginalBtn = document.getElementById("mode-original-btn");
  let featuredPhotoMode = "studio"; // "studio" | "original"

  const renderFeatured = () => {
    if (!featuredGrid) return;
    const featuredItems = items.filter((item) => item.featured);
    featuredGrid.innerHTML = featuredItems
      .map((item) => {
        const imgSrc =
          featuredPhotoMode === "original" && item.originalImage
            ? item.originalImage
            : item.image || FALLBACK_IMG;
        const priceFormatted = formatPrice(item.price);
        const priceHtml = priceFormatted
          ? `<span class="featured-price">${escapeHtml(priceFormatted)} <small>تومان</small></span>`
          : `<span class="featured-price">${REVIEW_TEXT}</span>`;

        return `
          <article class="featured-card" data-dish-id="${escapeHtml(item.id)}">
            <div class="featured-media" data-open-modal="${escapeHtml(item.id)}">
              <img
                src="${escapeHtml(imgSrc)}"
                alt="${escapeHtml(item.title)}"
                loading="lazy"
                onerror="this.onerror=null;this.src='${FALLBACK_IMG}';"
              />
              <span class="featured-badge-top">${escapeHtml(item.badge || item.section)}</span>
              <span class="featured-zoom-hint">بزرگ‌نمایی و مقایسه 🔎</span>
            </div>
            <div class="featured-body">
              <h3 class="featured-title">${escapeHtml(item.title)}</h3>
              <p class="featured-desc">${escapeHtml(item.desc || "سرو شده با دورچین تازه در رستوران چتر آبی")}</p>
              <div class="featured-foot">
                ${priceHtml}
                <button type="button" class="btn-add-mini" data-add-id="${escapeHtml(item.id)}">
                  + افزودن به میز
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  };

  modeStudioBtn?.addEventListener("click", () => {
    featuredPhotoMode = "studio";
    modeStudioBtn.classList.add("is-active");
    modeOriginalBtn?.classList.remove("is-active");
    renderFeatured();
  });

  modeOriginalBtn?.addEventListener("click", () => {
    featuredPhotoMode = "original";
    modeOriginalBtn.classList.add("is-active");
    modeStudioBtn?.classList.remove("is-active");
    renderFeatured();
  });

  /* ─── 5. Complete Digital Menu Filtering, Sorting & Rendering ─── */
  const board = document.getElementById("menu-board");
  const emptyEl = document.getElementById("menu-empty");
  const searchInput = document.getElementById("menu-search");
  const searchClear = document.getElementById("search-clear");
  const featuredFilterBtn = document.getElementById("filter-featured-only");
  const sortSelect = document.getElementById("menu-sort");
  const resetFiltersBtn = document.getElementById("reset-filters-btn");
  const summaryEl = document.getElementById("menu-result-summary");
  const tabs = Array.from(document.querySelectorAll(".menu-tab"));
  const viewButtons = Array.from(document.querySelectorAll(".view-btn"));

  let activeCategory = "all";
  let searchQuery = "";
  let featuredOnly = false;
  let sortMode = "default";

  const CATEGORY_LABEL = {
    breakfast: "صبحانه و تابه‌های مسی",
    iranian: "غذاهای اصیل ایرانی",
    kebab: "کباب‌های ذغالی و چلو",
    appetizer: "پیش‌غذا، سوپ و سالاد",
    drinks: "چای و نوشیدنی‌های سرد",
  };

  const updateTabCounts = () => {
    document.querySelectorAll("[data-count-for]").forEach((el) => {
      const cat = el.getAttribute("data-count-for");
      const count =
        cat === "all" ? items.length : items.filter((i) => i.category === cat).length;
      el.textContent = toPersianDigits(count);
    });
  };

  const getFilteredItems = () => {
    const q = normalize(searchQuery);
    let result = items.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (featuredOnly && !item.featured && !item.badge) return false;
      if (!q) return true;
      const hay = normalize(`${item.title} ${item.desc} ${item.section} ${item.badge || ""}`);
      return hay.includes(q);
    });

    if (sortMode === "price-asc") {
      result = [...result].sort((a, b) => {
        const pa = Number(a.price) || 999999999;
        const pb = Number(b.price) || 999999999;
        return pa - pb;
      });
    } else if (sortMode === "price-desc") {
      result = [...result].sort((a, b) => {
        const pa = Number(a.price) || 0;
        const pb = Number(b.price) || 0;
        return pb - pa;
      });
    }
    return result;
  };

  const renderMenuCard = (item, idx) => {
    const price = formatPrice(item.price);
    const priceHtml = price
      ? `<span class="item-price">${escapeHtml(price)} <small>تومان</small></span>`
      : `<span class="item-price is-tbd">${REVIEW_TEXT}</span>`;

    const badgeHtml = item.badge
      ? `<span class="item-badge">${escapeHtml(item.badge)}</span>`
      : "";
    const descHtml = item.desc
      ? `<p class="item-desc">${escapeHtml(item.desc)}</p>`
      : "";
    const qtyInTray = trayState.get(item.id) || 0;
    const btnLabel = qtyInTray > 0 ? `✓ در میز (${toPersianDigits(qtyInTray)})` : "+ انتخاب";
    const btnClass = qtyInTray > 0 ? "item-add-btn in-tray" : "item-add-btn";
    const delayMs = Math.min(idx * 25, 250);

    return `
      <li class="menu-item-card" style="animation-delay: ${delayMs}ms">
        <button
          type="button"
          class="item-thumb-btn"
          data-open-modal="${escapeHtml(item.id)}"
          aria-label="مشاهده تصویر بزرگ ${escapeHtml(item.title)}"
        >
          <img
            src="${escapeHtml(item.image || FALLBACK_IMG)}"
            alt="${escapeHtml(item.title)}"
            loading="lazy"
            onerror="this.onerror=null;this.src='${FALLBACK_IMG}';"
          />
        </button>
        <div class="item-content">
          <div class="item-top-row">
            <h4 class="item-name">${escapeHtml(item.title)}</h4>
            ${badgeHtml}
          </div>
          ${descHtml}
          <div class="item-bottom-row">
            ${priceHtml}
            <button type="button" class="${btnClass}" data-add-id="${escapeHtml(item.id)}">
              ${btnLabel}
            </button>
          </div>
        </div>
      </li>
    `;
  };

  const renderMenu = () => {
    if (!board) return;
    const filtered = getFilteredItems();
    board.innerHTML = "";

    if (summaryEl) {
      summaryEl.textContent = `نمایش ${toPersianDigits(filtered.length)} مورد از ${toPersianDigits(items.length)} عنوان منو`;
    }
    if (emptyEl) emptyEl.hidden = filtered.length > 0;
    if (!filtered.length) return;

    const byCat = new Map();
    filtered.forEach((item) => {
      const c = item.category || "other";
      if (!byCat.has(c)) byCat.set(c, []);
      byCat.get(c).push(item);
    });

    const order = ["breakfast", "iranian", "kebab", "appetizer", "drinks"];
    let globalIdx = 0;

    order.forEach((catKey) => {
      const catItems = byCat.get(catKey);
      if (!catItems?.length) return;

      const block = document.createElement("section");
      block.className = "menu-block";
      block.innerHTML = `
        <div class="menu-block-header">
          <h3 class="menu-block-title">${escapeHtml(CATEGORY_LABEL[catKey] || catKey)}</h3>
          <span>${toPersianDigits(catItems.length)} مورد</span>
        </div>
      `;

      const bySection = new Map();
      catItems.forEach((item) => {
        const s = item.section || "منو";
        if (!bySection.has(s)) bySection.set(s, []);
        bySection.get(s).push(item);
      });

      bySection.forEach((sectionItems, sectionName) => {
        const sub = document.createElement("div");
        sub.className = "menu-sub-block";
        const showSubHeading = bySection.size > 1;
        sub.innerHTML = `
          ${showSubHeading ? `<h4 class="menu-subtitle">${escapeHtml(sectionName)}</h4>` : ""}
          <ul class="menu-items">
            ${sectionItems.map((it) => renderMenuCard(it, globalIdx++)).join("")}
          </ul>
        `;
        block.appendChild(sub);
      });

      board.appendChild(block);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeCategory = tab.dataset.category || "all";
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      renderMenu();
    });
  });

  searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    if (searchClear) searchClear.hidden = !searchQuery;
    renderMenu();
  });

  searchClear?.addEventListener("click", () => {
    if (!searchInput) return;
    searchInput.value = "";
    searchQuery = "";
    searchClear.hidden = true;
    searchInput.focus();
    renderMenu();
  });

  featuredFilterBtn?.addEventListener("click", () => {
    featuredOnly = !featuredOnly;
    featuredFilterBtn.setAttribute("aria-pressed", featuredOnly ? "true" : "false");
    renderMenu();
  });

  sortSelect?.addEventListener("change", (e) => {
    sortMode = e.target.value;
    renderMenu();
  });

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      viewButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
      board?.classList.toggle("is-compact", view === "compact");
    });
  });

  resetFiltersBtn?.addEventListener("click", () => {
    activeCategory = "all";
    searchQuery = "";
    featuredOnly = false;
    sortMode = "default";
    if (searchInput) searchInput.value = "";
    if (searchClear) searchClear.hidden = true;
    if (featuredFilterBtn) featuredFilterBtn.setAttribute("aria-pressed", "false");
    if (sortSelect) sortSelect.value = "default";
    tabs.forEach((t) => {
      const on = t.dataset.category === "all";
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderMenu();
  });

  /* ─── 6. Table Selection Tray ("میز من") ─── */
  const trayState = new Map(); // id -> quantity
  const headerTrayCount = document.getElementById("header-tray-count");
  const floatingTrayBar = document.getElementById("floating-tray-bar");
  const floatingTrayCount = document.getElementById("floating-tray-count");
  const floatingTrayTotal = document.getElementById("floating-tray-total");
  const trayBackdrop = document.getElementById("tray-drawer-backdrop");
  const trayItemsList = document.getElementById("tray-items-list");
  const trayTotalAmount = document.getElementById("tray-total-amount");
  const trayWaLink = document.getElementById("tray-wa-link");

  const updateTrayUI = () => {
    let totalCount = 0;
    let totalPrice = 0;
    const lines = [];

    trayState.forEach((qty, id) => {
      const item = itemById.get(id);
      if (!item || qty <= 0) return;
      totalCount += qty;
      const unitPrice = Number(String(item.price || "").replace(/\D/g, "")) || 0;
      totalPrice += unitPrice * qty;
      lines.push(`• ${item.title} (${toPersianDigits(qty)} عدد)`);
    });

    if (headerTrayCount) {
      headerTrayCount.hidden = totalCount === 0;
      headerTrayCount.textContent = toPersianDigits(totalCount);
    }

    if (floatingTrayBar) {
      floatingTrayBar.hidden = totalCount === 0;
    }
    if (floatingTrayCount) {
      floatingTrayCount.textContent = `${toPersianDigits(totalCount)} مورد در میز انتخابی شما`;
    }
    if (floatingTrayTotal) {
      floatingTrayTotal.textContent = `${totalPrice.toLocaleString("fa-IR")} تومان`;
    }
    if (trayTotalAmount) {
      trayTotalAmount.textContent = `${totalPrice.toLocaleString("fa-IR")} تومان`;
    }

    if (trayItemsList) {
      if (totalCount === 0) {
        trayItemsList.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:2rem 0;">هنوز غذایی به میز خود اضافه نکرده‌اید.</p>`;
      } else {
        const rowsHtml = [];
        trayState.forEach((qty, id) => {
          const item = itemById.get(id);
          if (!item) return;
          const p = formatPrice(item.price);
          rowsHtml.push(`
            <div class="tray-row">
              <div>
                <h4 class="tray-row-title">${escapeHtml(item.title)}</h4>
                <span class="tray-row-price">${p ? `${escapeHtml(p)} تومان` : REVIEW_TEXT}</span>
              </div>
              <div class="tray-qty-controls">
                <button type="button" class="qty-btn" data-tray-dec="${escapeHtml(id)}">−</button>
                <strong>${toPersianDigits(qty)}</strong>
                <button type="button" class="qty-btn" data-tray-inc="${escapeHtml(id)}">+</button>
              </div>
            </div>
          `);
        });
        trayItemsList.innerHTML = rowsHtml.join("");
      }
    }

    if (trayWaLink) {
      const msg = [
        "سلام رستوران چتر آبی، سفارش/انتخاب من از منوی دیجیتال:",
        ...lines,
        `جمع تخمینی: ${totalPrice.toLocaleString("fa-IR")} تومان`,
      ].join("\n");
      trayWaLink.href = `https://wa.me/989122794809?text=${encodeURIComponent(msg)}`;
    }

    renderMenu();
  };

  const addToTray = (id, delta = 1) => {
    const current = trayState.get(id) || 0;
    const next = current + delta;
    if (next <= 0) {
      trayState.delete(id);
    } else {
      trayState.set(id, next);
    }
    updateTrayUI();
  };

  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add-id]");
    if (addBtn) {
      addToTray(addBtn.getAttribute("data-add-id"), 1);
      return;
    }

    const incBtn = e.target.closest("[data-tray-inc]");
    if (incBtn) {
      addToTray(incBtn.getAttribute("data-tray-inc"), 1);
      return;
    }

    const decBtn = e.target.closest("[data-tray-dec]");
    if (decBtn) {
      addToTray(decBtn.getAttribute("data-tray-dec"), -1);
      return;
    }

    const modalTrigger = e.target.closest("[data-open-modal]");
    if (modalTrigger) {
      openDishModal(modalTrigger.getAttribute("data-open-modal"));
    }
  });

  const openTrayDrawer = () => {
    if (trayBackdrop) trayBackdrop.hidden = false;
  };
  const closeTrayDrawer = () => {
    if (trayBackdrop) trayBackdrop.hidden = true;
  };

  document.getElementById("tray-open-btn")?.addEventListener("click", openTrayDrawer);
  document.getElementById("floating-tray-open")?.addEventListener("click", openTrayDrawer);
  document.getElementById("tray-close-btn")?.addEventListener("click", closeTrayDrawer);
  document.getElementById("tray-clear-btn")?.addEventListener("click", () => {
    trayState.clear();
    updateTrayUI();
  });
  trayBackdrop?.addEventListener("click", (e) => {
    if (e.target === trayBackdrop) closeTrayDrawer();
  });

  /* ─── 7. Dish Lightbox & Photo Comparison Modal ─── */
  const modalBackdrop = document.getElementById("dish-modal-backdrop");
  const modalImg = document.getElementById("modal-dish-img");
  const modalTitle = document.getElementById("modal-dish-title");
  const modalDesc = document.getElementById("modal-dish-desc");
  const modalSection = document.getElementById("modal-dish-section");
  const modalBadge = document.getElementById("modal-dish-badge");
  const modalPrice = document.getElementById("modal-dish-price");
  const modalAddBtn = document.getElementById("modal-add-btn");
  const modalCompareBar = document.getElementById("modal-compare-bar");
  const modalBtnStudio = document.getElementById("modal-btn-studio");
  const modalBtnOrig = document.getElementById("modal-btn-orig");

  let activeModalDish = null;

  const openDishModal = (id) => {
    const dish = itemById.get(id);
    if (!dish || !modalBackdrop) return;
    activeModalDish = dish;

    if (modalImg) {
      modalImg.src = dish.image || FALLBACK_IMG;
      modalImg.alt = dish.title;
    }
    if (modalTitle) modalTitle.textContent = dish.title;
    if (modalDesc) {
      modalDesc.textContent =
        dish.desc || "پخت روزانه با مواد اولیه تازه و درجه یک در رستوران چتر آبی.";
    }
    if (modalSection) modalSection.textContent = dish.section || "";
    if (modalBadge) {
      modalBadge.hidden = !dish.badge;
      modalBadge.textContent = dish.badge || "";
    }
    if (modalPrice) {
      const p = formatPrice(dish.price);
      modalPrice.textContent = p ? `${p} تومان` : REVIEW_TEXT;
    }
    if (modalCompareBar) {
      modalCompareBar.hidden = !dish.originalImage;
      modalBtnStudio?.classList.add("is-active");
      modalBtnOrig?.classList.remove("is-active");
    }

    modalBackdrop.hidden = false;
  };

  const closeDishModal = () => {
    if (modalBackdrop) modalBackdrop.hidden = true;
    activeModalDish = null;
  };

  modalBtnStudio?.addEventListener("click", () => {
    if (!activeModalDish || !modalImg) return;
    modalImg.src = activeModalDish.image || FALLBACK_IMG;
    modalBtnStudio.classList.add("is-active");
    modalBtnOrig?.classList.remove("is-active");
  });

  modalBtnOrig?.addEventListener("click", () => {
    if (!activeModalDish?.originalImage || !modalImg) return;
    modalImg.src = activeModalDish.originalImage;
    modalBtnOrig.classList.add("is-active");
    modalBtnStudio?.classList.remove("is-active");
  });

  modalAddBtn?.addEventListener("click", () => {
    if (activeModalDish) {
      addToTray(activeModalDish.id, 1);
      closeDishModal();
    }
  });

  document.getElementById("modal-close-btn")?.addEventListener("click", closeDishModal);
  modalBackdrop?.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeDishModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDishModal();
      closeTrayDrawer();
    }
  });

  /* ─── 8. Share Button & Footer Year ─── */
  document.getElementById("share-menu-btn")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "منوی دیجیتال رستوران چتر آبی",
          url: shareUrl,
        });
        return;
      } catch (_) {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      const prev = btn.textContent;
      btn.textContent = "لینک منو کپی شد ✓";
      setTimeout(() => {
        btn.textContent = prev;
      }, 2000);
    } catch (_) {}
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = toPersianDigits(new Date().getFullYear());

  /* Initial Render */
  updateTabCounts();
  renderFeatured();
  renderMenu();
})();
