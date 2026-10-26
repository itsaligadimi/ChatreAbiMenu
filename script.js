"use strict";

(function () {
  const REVIEW_TEXT = "استعلام قیمت روز";
  const FALLBACK_IMG = "images/food/baghali-mahiche-pro.jpg";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ─── 1. Smooth Scroll, Scroll Progress & Scroll-Driven Hero Physics ─── */
  document.querySelectorAll("[data-scroll]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-scroll");
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const topbar = document.getElementById("topbar");
  const scrollProgressBar = document.getElementById("scroll-progress-bar");
  const heroStage = document.getElementById("hero-stage");
  const orbitalPlates = document.getElementById("orbital-plates");

  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let orbitAngleOffset = 0;

  const updateScrollEffects = () => {
    const y = window.scrollY;
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    const progress = Math.min(Math.max(y / maxScroll, 0), 1);

    if (topbar) {
      topbar.classList.toggle("is-scrolled", y > 20);
    }
    if (scrollProgressBar) {
      scrollProgressBar.style.setProperty("--scroll-progress", progress.toFixed(4));
    }

    if (!prefersReducedMotion) {
      const heroRatio = Math.min(y / 520, 1);
      if (heroStage) {
        heroStage.style.setProperty("--cloche-lift", `${(heroRatio * 42).toFixed(1)}px`);
        heroStage.style.setProperty("--cloche-scale", (1 + heroRatio * 0.08).toFixed(3));
        heroStage.style.setProperty("--cloche-fade", (heroRatio * 0.85).toFixed(3));
      }

      const dy = y - lastScrollY;
      scrollVelocity = dy * 0.14;
      orbitAngleOffset = (orbitAngleOffset + scrollVelocity) % 360;
      if (orbitalPlates) {
        orbitalPlates.style.setProperty(
          "--orbit-offset",
          `${(y * 0.045).toFixed(2)}deg`
        );
      }
    }
    lastScrollY = y;
  };

  window.addEventListener("scroll", updateScrollEffects, { passive: true });
  updateScrollEffects();

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

  /* ─── 3. Interactive Hero Orbital Stage + 3D Platter Tilt ─── */
  const orbitButtons = Array.from(document.querySelectorAll(".orbit-plate"));
  const heroMainPlate = document.getElementById("hero-main-plate");
  const stageTurntable = document.getElementById("stage-turntable");
  const heroActiveImg = document.getElementById("hero-active-img");
  const heroPhotoBadge = document.getElementById("hero-photo-badge");
  const heroDishTag = document.getElementById("hero-dish-tag");
  const heroDishTitle = document.getElementById("hero-dish-title");
  const heroDishDesc = document.getElementById("hero-dish-desc");
  const heroDishPrice = document.getElementById("hero-dish-price");
  const heroAddBtn = document.getElementById("hero-add-btn");
  const heroCompareBtn = document.getElementById("hero-compare-btn");

  let activeHeroId = "ir-baghali-mahiche";
  let heroShowingOriginal = false;
  let heroAutoTimer = null;

  /* 3D Perspective Tilt & Specular Glare on the Hero Platter */
  if (!prefersReducedMotion && stageTurntable && heroMainPlate) {
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let tiltRaf = null;

    const animateTilt = () => {
      currentTiltX += (targetTiltX - currentTiltX) * 0.14;
      currentTiltY += (targetTiltY - currentTiltY) * 0.14;
      heroMainPlate.style.setProperty("--tilt-x", `${currentTiltX.toFixed(2)}deg`);
      heroMainPlate.style.setProperty("--tilt-y", `${currentTiltY.toFixed(2)}deg`);

      if (
        Math.abs(targetTiltX - currentTiltX) > 0.05 ||
        Math.abs(targetTiltY - currentTiltY) > 0.05
      ) {
        tiltRaf = requestAnimationFrame(animateTilt);
      } else {
        tiltRaf = null;
      }
    };

    stageTurntable.addEventListener("pointermove", (e) => {
      const rect = stageTurntable.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetTiltX = -ny * 14;
      targetTiltY = nx * 14;
      heroMainPlate.style.setProperty("--glare-x", `${((nx + 0.5) * 100).toFixed(1)}%`);
      heroMainPlate.style.setProperty("--glare-y", `${((ny + 0.5) * 100).toFixed(1)}%`);
      if (!tiltRaf) tiltRaf = requestAnimationFrame(animateTilt);
    });

    stageTurntable.addEventListener("pointerleave", () => {
      targetTiltX = 0;
      targetTiltY = 0;
      heroMainPlate.style.setProperty("--glare-x", "30%");
      heroMainPlate.style.setProperty("--glare-y", "25%");
      if (!tiltRaf) tiltRaf = requestAnimationFrame(animateTilt);
    });
  }

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
    if (heroDishDesc) {
      heroDishDesc.textContent =
        dish.desc || "پخت روزانه با مواد اولیه تازه در رستوران چتر آبی";
    }
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

  heroAddBtn?.addEventListener("click", (e) => {
    const id = heroAddBtn.dataset.id;
    if (id) {
      launchFlyToTray(heroActiveImg || e.currentTarget, itemById.get(id)?.image);
      addToTray(id, 1);
    }
  });

  const startHeroCycle = () => {
    if (prefersReducedMotion) return;
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

  /* ─── 4. Saffron & Warm Aroma Particle Canvas in Hero ─── */
  const initHeroParticles = () => {
    const canvas = document.getElementById("hero-particles-canvas");
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = canvas.width = rect ? rect.width : window.innerWidth;
      h = canvas.height = rect ? rect.height : 700;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const count = 26;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1.4 + Math.random() * 2.6,
      vy: -(0.22 + Math.random() * 0.45),
      vx: (Math.random() - 0.5) * 0.35,
      alpha: 0.15 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      gold: Math.random() > 0.35,
    }));

    let heroVisible = true;
    const obs = new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    obs.observe(canvas);

    const draw = () => {
      if (heroVisible) {
        ctx.clearRect(0, 0, w, h);
        particles.forEach((p) => {
          p.phase += 0.018;
          p.y += p.vy;
          p.x += p.vx + Math.sin(p.phase) * 0.25;
          if (p.y < -10) {
            p.y = h + 10;
            p.x = Math.random() * w;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.gold
            ? `rgba(217, 164, 54, ${p.alpha})`
            : `rgba(91, 200, 242, ${p.alpha * 0.85})`;
          ctx.fill();
        });
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };
  initHeroParticles();

  /* ─── 5. Chef's Signature Showcase (Featured Grid) ─── */
  const featuredGrid = document.getElementById("featured-grid");
  const modeStudioBtn = document.getElementById("mode-studio-btn");
  const modeOriginalBtn = document.getElementById("mode-original-btn");
  let featuredPhotoMode = "studio";

  const renderFeatured = () => {
    if (!featuredGrid) return;
    const featuredItems = items.filter((item) => item.featured);
    featuredGrid.innerHTML = featuredItems
      .map((item, idx) => {
        const imgSrc =
          featuredPhotoMode === "original" && item.originalImage
            ? item.originalImage
            : item.image || FALLBACK_IMG;
        const priceFormatted = formatPrice(item.price);
        const priceHtml = priceFormatted
          ? `<span class="featured-price">${escapeHtml(priceFormatted)} <small>تومان</small></span>`
          : `<span class="featured-price">${REVIEW_TEXT}</span>`;

        return `
          <article class="featured-card reveal-on-scroll" style="transition-delay: ${Math.min(idx * 55, 300)}ms" data-dish-id="${escapeHtml(item.id)}">
            <div class="featured-media" data-open-modal="${escapeHtml(item.id)}">
              <img
                src="${escapeHtml(imgSrc)}"
                alt="${escapeHtml(item.title)}"
                loading="lazy"
                onerror="this.onerror=null;this.src='${FALLBACK_IMG}';"
              />
              <span class="featured-badge-top">${escapeHtml(item.badge || item.section)}</span>
              <span class="featured-zoom-hint">مقایسه زنده با اسلایدر ↔</span>
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

    observeScrollReveals();
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

  /* ─── 6. Complete Digital Menu + Gliding Category Pill + Scroll-Spy ─── */
  const board = document.getElementById("menu-board");
  const emptyEl = document.getElementById("menu-empty");
  const searchInput = document.getElementById("menu-search");
  const searchClear = document.getElementById("search-clear");
  const featuredFilterBtn = document.getElementById("filter-featured-only");
  const sortSelect = document.getElementById("menu-sort");
  const resetFiltersBtn = document.getElementById("reset-filters-btn");
  const summaryEl = document.getElementById("menu-result-summary");
  const menuTabsWrap = document.getElementById("menu-tabs");
  const tabGlider = document.getElementById("tab-glider");
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

  const moveTabGlider = (targetTab) => {
    if (!tabGlider || !menuTabsWrap || !targetTab) return;
    const wrapRect = menuTabsWrap.getBoundingClientRect();
    const tabRect = targetTab.getBoundingClientRect();
    const x = tabRect.left - wrapRect.left + menuTabsWrap.scrollLeft;
    const y = tabRect.top - wrapRect.top;
    tabGlider.style.setProperty("--glider-w", `${tabRect.width}px`);
    tabGlider.style.setProperty("--glider-x", `${x}px`);
    tabGlider.style.setProperty("--glider-y", `${y}px`);
    tabGlider.classList.add("is-ready");
    menuTabsWrap.classList.add("has-glider");
  };

  const highlightTabVisual = (catKey) => {
    let matchedTab = null;
    tabs.forEach((t) => {
      const on = t.dataset.category === catKey;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      if (on) matchedTab = t;
    });
    if (matchedTab) moveTabGlider(matchedTab);
  };

  window.addEventListener(
    "resize",
    () => {
      const currentTab = document.querySelector(".menu-tab.is-active");
      if (currentTab) moveTabGlider(currentTab);
    },
    { passive: true }
  );

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
    const delayMs = Math.min((idx % 12) * 32, 260);

    return `
      <li class="menu-item-card" style="animation-delay: ${delayMs}ms" data-card-id="${escapeHtml(item.id)}">
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

  let blockSpyObserver = null;

  const setupCategoryScrollSpy = () => {
    if (blockSpyObserver) blockSpyObserver.disconnect();
    if (activeCategory !== "all") return;

    const blocks = document.querySelectorAll(".menu-block[data-cat-block]");
    if (!blocks.length) return;

    blockSpyObserver = new IntersectionObserver(
      (entries) => {
        if (activeCategory !== "all") return;
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const catKey = visible[0].target.getAttribute("data-cat-block");
          if (catKey) highlightTabVisual(catKey);
        }
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: 0.05 }
    );

    blocks.forEach((b) => blockSpyObserver.observe(b));
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
      block.className = "menu-block reveal-on-scroll";
      block.setAttribute("data-cat-block", catKey);
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

    observeScrollReveals();
    setupCategoryScrollSpy();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selectedCat = tab.dataset.category || "all";
      activeCategory = selectedCat;
      highlightTabVisual(selectedCat);
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
    highlightTabVisual("all");
    renderMenu();
  });

  /* ─── 7. Parabolic Fly-to-Tray Physics & Rolling Toman Counter ─── */
  const trayState = new Map();
  const headerTrayBtn = document.getElementById("tray-open-btn");
  const headerTrayCount = document.getElementById("header-tray-count");
  const floatingTrayBar = document.getElementById("floating-tray-bar");
  const floatingTrayCount = document.getElementById("floating-tray-count");
  const floatingTrayTotal = document.getElementById("floating-tray-total");
  const trayBackdrop = document.getElementById("tray-drawer-backdrop");
  const trayItemsList = document.getElementById("tray-items-list");
  const trayTotalAmount = document.getElementById("tray-total-amount");
  const trayWaLink = document.getElementById("tray-wa-link");

  let displayedTotalAmount = 0;
  let tickerRaf = null;

  const animatePriceTicker = (targetVal) => {
    if (prefersReducedMotion) {
      displayedTotalAmount = targetVal;
      const formatted = `${targetVal.toLocaleString("fa-IR")} تومان`;
      if (floatingTrayTotal) floatingTrayTotal.textContent = formatted;
      if (trayTotalAmount) trayTotalAmount.textContent = formatted;
      return;
    }
    if (tickerRaf) cancelAnimationFrame(tickerRaf);
    const startVal = displayedTotalAmount;
    const diff = targetVal - startVal;
    const duration = 420;
    const startTime = performance.now();

    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(startVal + diff * eased);
      displayedTotalAmount = current;
      const formatted = `${current.toLocaleString("fa-IR")} تومان`;
      if (floatingTrayTotal) floatingTrayTotal.textContent = formatted;
      if (trayTotalAmount) trayTotalAmount.textContent = formatted;
      if (t < 1) {
        tickerRaf = requestAnimationFrame(step);
      }
    };
    tickerRaf = requestAnimationFrame(step);
  };

  const launchFlyToTray = (sourceEl, imgSrc) => {
    if (prefersReducedMotion || !sourceEl) return;
    const targetEl =
      floatingTrayBar && !floatingTrayBar.hidden ? floatingTrayBar : headerTrayBtn;
    if (!targetEl) return;

    const startRect = sourceEl.getBoundingClientRect();
    const endRect = targetEl.getBoundingClientRect();

    const clone = document.createElement("img");
    clone.src = imgSrc || FALLBACK_IMG;
    clone.className = "flying-plate-clone";
    const startX = startRect.left + startRect.width / 2 - 28;
    const startY = startRect.top + startRect.height / 2 - 28;
    const endX = endRect.left + endRect.width / 2 - 20;
    const endY = endRect.top + endRect.height / 2 - 20;

    clone.style.left = "0px";
    clone.style.top = "0px";
    clone.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(1)`;
    document.body.appendChild(clone);

    const ctrlX = (startX + endX) / 2;
    const ctrlY = Math.min(startY, endY) - 130;
    const duration = 620;
    const t0 = performance.now();

    const tick = (now) => {
      const t = Math.min((now - t0) / duration, 1);
      const inv = 1 - t;
      const x = inv * inv * startX + 2 * inv * t * ctrlX + t * t * endX;
      const y = inv * inv * startY + 2 * inv * t * ctrlY + t * t * endY;
      const scale = 1 - t * 0.62;
      const rot = t * 240;
      clone.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(2)}) rotate(${rot.toFixed(0)}deg)`;
      clone.style.opacity = String(1 - Math.pow(t, 2.5) * 0.6);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        clone.remove();
        [headerTrayBtn, floatingTrayBar].forEach((el) => {
          if (!el) return;
          el.classList.remove("is-bouncing");
          void el.offsetWidth;
          el.classList.add("is-bouncing");
        });
      }
    };
    requestAnimationFrame(tick);
  };

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

    animatePriceTicker(totalPrice);

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

    /* Update button labels in-place without destroying scroll position */
    document.querySelectorAll("[data-add-id]").forEach((btn) => {
      if (btn.classList.contains("btn-add-mini")) return;
      const id = btn.getAttribute("data-add-id");
      const qty = trayState.get(id) || 0;
      btn.textContent = qty > 0 ? `✓ در میز (${toPersianDigits(qty)})` : "+ انتخاب";
      btn.classList.toggle("in-tray", qty > 0);
    });
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
      const id = addBtn.getAttribute("data-add-id");
      const item = itemById.get(id);
      const card = addBtn.closest(".menu-item-card, .featured-card");
      const thumbImg = card?.querySelector("img") || addBtn;
      if (id) {
        launchFlyToTray(thumbImg, item?.image);
        addToTray(id, 1);
      }
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

  headerTrayBtn?.addEventListener("click", openTrayDrawer);
  document.getElementById("floating-tray-open")?.addEventListener("click", openTrayDrawer);
  document.getElementById("tray-close-btn")?.addEventListener("click", closeTrayDrawer);
  document.getElementById("tray-clear-btn")?.addEventListener("click", () => {
    trayState.clear();
    updateTrayUI();
  });
  trayBackdrop?.addEventListener("click", (e) => {
    if (e.target === trayBackdrop) closeTrayDrawer();
  });

  /* ─── 8. Dish Lightbox & Interactive Before/After Wipe Curtain ─── */
  const modalBackdrop = document.getElementById("dish-modal-backdrop");
  const modalMediaStage = document.getElementById("modal-media-stage");
  const modalImg = document.getElementById("modal-dish-img");
  const modalOrigImg = document.getElementById("modal-dish-orig-img");
  const modalWipeOverlay = document.getElementById("modal-wipe-overlay");
  const modalWipeHandle = document.getElementById("modal-wipe-handle");
  const modalWipeRange = document.getElementById("modal-wipe-range");
  const modalTitle = document.getElementById("modal-dish-title");
  const modalDesc = document.getElementById("modal-dish-desc");
  const modalSection = document.getElementById("modal-dish-section");
  const modalBadge = document.getElementById("modal-dish-badge");
  const modalPrice = document.getElementById("modal-dish-price");
  const modalAddBtn = document.getElementById("modal-add-btn");
  const modalCompareBar = document.getElementById("modal-compare-bar");
  const modalBtnStudio = document.getElementById("modal-btn-studio");
  const modalBtnSplit = document.getElementById("modal-btn-split");
  const modalBtnOrig = document.getElementById("modal-btn-orig");

  let activeModalDish = null;

  const setWipePercent = (pct) => {
    const clamped = Math.min(Math.max(Number(pct) || 50, 5), 95);
    modalMediaStage?.style.setProperty("--wipe-pos", `${clamped}%`);
    if (modalWipeRange) modalWipeRange.value = String(clamped);
  };

  const setModalPhotoMode = (mode) => {
    if (!activeModalDish || !modalImg) return;
    const hasOrig = Boolean(activeModalDish.originalImage);

    [modalBtnStudio, modalBtnSplit, modalBtnOrig].forEach((b) =>
      b?.classList.remove("is-active")
    );

    if (mode === "split" && hasOrig) {
      modalBtnSplit?.classList.add("is-active");
      modalImg.src = activeModalDish.image || FALLBACK_IMG;
      if (modalOrigImg) modalOrigImg.src = activeModalDish.originalImage;
      if (modalWipeOverlay) modalWipeOverlay.hidden = false;
      if (modalWipeHandle) modalWipeHandle.hidden = false;
      if (modalWipeRange) modalWipeRange.hidden = false;
      setWipePercent(50);
    } else if (mode === "orig" && hasOrig) {
      modalBtnOrig?.classList.add("is-active");
      modalImg.src = activeModalDish.originalImage;
      if (modalWipeOverlay) modalWipeOverlay.hidden = true;
      if (modalWipeHandle) modalWipeHandle.hidden = true;
      if (modalWipeRange) modalWipeRange.hidden = true;
    } else {
      modalBtnStudio?.classList.add("is-active");
      modalImg.src = activeModalDish.image || FALLBACK_IMG;
      if (modalWipeOverlay) modalWipeOverlay.hidden = true;
      if (modalWipeHandle) modalWipeHandle.hidden = true;
      if (modalWipeRange) modalWipeRange.hidden = true;
    }
  };

  modalWipeRange?.addEventListener("input", (e) => {
    setWipePercent(e.target.value);
  });

  const openDishModal = (id) => {
    const dish = itemById.get(id);
    if (!dish || !modalBackdrop) return;
    activeModalDish = dish;

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

    const hasOrig = Boolean(dish.originalImage);
    if (modalCompareBar) modalCompareBar.hidden = !hasOrig;

    /* Default to interactive split-curtain when dish has an original photo! */
    setModalPhotoMode(hasOrig ? "split" : "studio");
    modalBackdrop.hidden = false;
  };

  const closeDishModal = () => {
    if (modalBackdrop) modalBackdrop.hidden = true;
    activeModalDish = null;
  };

  modalBtnStudio?.addEventListener("click", () => setModalPhotoMode("studio"));
  modalBtnSplit?.addEventListener("click", () => setModalPhotoMode("split"));
  modalBtnOrig?.addEventListener("click", () => setModalPhotoMode("orig"));

  modalAddBtn?.addEventListener("click", () => {
    if (activeModalDish) {
      launchFlyToTray(modalImg, activeModalDish.image);
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

  /* ─── 9. Scroll-Triggered Reveal Observer, Animated Metrics & Magnetic Buttons ─── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  function observeScrollReveals() {
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      revealObserver.observe(el);
    });
  }

  /* Animated Hero Metrics Count-Up */
  const animateMetricCounters = () => {
    if (prefersReducedMotion) return;
    document.querySelectorAll("[data-count-target]").forEach((el) => {
      const target = Number(el.getAttribute("data-count-target")) || 0;
      const suffix = el.getAttribute("data-count-suffix") || "";
      const duration = 1200;
      const t0 = performance.now();

      const step = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = `${toPersianDigits(val)}${suffix}`;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  /* Cursor-Tracked Spotlight & Magnetic CTA Buttons */
  if (!prefersReducedMotion) {
    document.addEventListener(
      "pointermove",
      (e) => {
        const card = e.target.closest(".spotlight-card, .featured-card, .menu-item-card");
        if (card) {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
          card.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
        }
      },
      { passive: true }
    );

    document.querySelectorAll(".magnetic-btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ─── 10. Share Button & Footer Year ─── */
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
  observeScrollReveals();
  animateMetricCounters();
  requestAnimationFrame(() => {
    const firstTab = document.querySelector(".menu-tab.is-active");
    if (firstTab) moveTabGlider(firstTab);
  });
})();
