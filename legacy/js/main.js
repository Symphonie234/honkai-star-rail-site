/* =========================================================
   Astral Express — interactions
   ========================================================= */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pathById = Object.fromEntries(PATHS.map((p) => [p.id, p]));
  const elementById = Object.fromEntries(ELEMENTS.map((e) => [e.id, e]));

  /* ---------- Starfield ---------- */
  function initStarfield() {
    const canvas = $("#starfield");
    const ctx = canvas.getContext("2d");
    let stars = [];
    let w, h, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 5000); // density scales with screen size
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.2,
        speed: Math.random() * 0.15 + 0.02,
        phase: Math.random() * Math.PI * 2,
        gold: Math.random() < 0.08,
      }));
    }

    function draw(t = 0) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const twinkle = 0.55 + Math.sin(t / 900 + s.phase) * 0.45;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = s.gold ? "#e8c46a" : "#dfe6ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (!prefersReducedMotion) {
          s.y -= s.speed;
          if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w; }
        }
      }
      if (!prefersReducedMotion) requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", debounce(() => { resize(); if (prefersReducedMotion) draw(); }, 150));
    requestAnimationFrame(draw);
  }

  /* ---------- Nav ---------- */
  function initNav() {
    const nav = $("#nav");
    const toggle = $("#navToggle");
    const menu = $("#navMenu");
    const links = $$(".nav__link");

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    links.forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Highlight the link for the section in view
    const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Paths ---------- */
  function initPaths() {
    const grid = $("#pathsGrid");
    const detail = $("#pathDetail");

    grid.innerHTML = PATHS.map((p, i) => `
      <button class="path-btn" role="tab" id="tab-${p.id}" data-path="${p.id}"
              aria-selected="${i === 0}" aria-controls="pathDetail" tabindex="${i === 0 ? 0 : -1}">
        <span class="path-btn__icon" aria-hidden="true">${p.icon}</span>
        <span>${p.name}</span>
      </button>`).join("");

    const tabs = $$(".path-btn", grid);

    function select(id, focus = false) {
      const p = pathById[id];
      tabs.forEach((t) => {
        const on = t.dataset.path === id;
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      const count = CHARACTERS.filter((c) => c.path === id).length;
      detail.setAttribute("aria-labelledby", `tab-${id}`);
      detail.innerHTML = `
        <p class="eyebrow">Aeon · <span class="aeon">${p.aeon}</span></p>
        <h3>${p.name}</h3>
        <p>${p.blurb}</p>
        <p><strong>${count}</strong> featured traveler${count === 1 ? "" : "s"} walk this Path.</p>`;
      detail.classList.remove("is-swapping");
      void detail.offsetWidth; // restart animation
      detail.classList.add("is-swapping");
    }

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".path-btn");
      if (btn) select(btn.dataset.path);
    });

    // Arrow-key navigation between tabs
    grid.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!delta) return;
      e.preventDefault();
      select(tabs[(i + delta + tabs.length) % tabs.length].dataset.path, true);
    });

    select(PATHS[0].id);
  }

  /* ---------- Combat types ---------- */
  function initElements() {
    $("#elementsList").innerHTML = ELEMENTS.map((el) => `
      <li class="element reveal" style="--c: var(--${el.id})">
        <div class="element__dot" aria-hidden="true"></div>
        <h3>${el.name}</h3>
        <p>${el.desc}</p>
      </li>`).join("");
  }

  /* ---------- Characters ---------- */
  function initCharacters() {
    const grid = $("#charGrid");
    const filters = $("#charFilters");
    const search = $("#charSearch");
    const empty = $("#charEmpty");
    let activeType = "all";

    filters.innerHTML = [{ id: "all", name: "All" }, ...ELEMENTS].map((el) => `
      <button class="chip" data-type="${el.id}" aria-pressed="${el.id === "all"}"
              ${el.id !== "all" ? `style="--c: var(--${el.id})"` : ""}>${el.name}</button>`).join("");

    grid.innerHTML = CHARACTERS.map((c, i) => `
      <button class="card reveal" data-index="${i}" data-type="${c.element}"
              style="--c: var(--${c.element})" aria-label="${c.name}, ${elementById[c.element].name}, ${pathById[c.path].name}">
        <div class="card__portrait" aria-hidden="true">
          ${c.image ? `<img src="${c.image}" alt="" loading="lazy" />` : c.name.charAt(0)}
        </div>
        <span class="card__rarity" aria-hidden="true">${"★".repeat(c.rarity)}</span>
        <div class="card__info">
          <span class="card__name">${c.name}</span>
          <span class="card__meta">
            <span class="tag tag--type">${elementById[c.element].name}</span>
            <span class="tag">${pathById[c.path].name}</span>
          </span>
        </div>
      </button>`).join("");

    const cards = $$(".card", grid);

    function apply() {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach((card) => {
        const c = CHARACTERS[card.dataset.index];
        const match = (activeType === "all" || c.element === activeType) &&
                      (!q || c.name.toLowerCase().includes(q) || c.faction.toLowerCase().includes(q));
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      empty.hidden = shown > 0;
    }

    filters.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      activeType = chip.dataset.type;
      $$(".chip", filters).forEach((b) => b.setAttribute("aria-pressed", b === chip));
      apply();
    });
    search.addEventListener("input", apply);

    // Subtle 3D tilt on pointer devices
    if (!prefersReducedMotion && matchMedia("(hover: hover)").matches) {
      cards.forEach((card) => {
        card.addEventListener("pointermove", (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
        });
        card.addEventListener("pointerleave", () => { card.style.transform = ""; });
      });
    }

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (card) openModal(CHARACTERS[card.dataset.index]);
    });
  }

  /* ---------- Modal ---------- */
  function openModal(c) {
    const modal = $("#charModal");
    modal.style.setProperty("--c", `var(--${c.element})`);
    $("#modalBody").innerHTML = `
      <p class="eyebrow" style="color: var(--c)">${elementById[c.element].name} · ${pathById[c.path].name}</p>
      <h3 id="modalTitle">${c.name}</h3>
      <p style="color: var(--gold)">${"★".repeat(c.rarity)} · ${c.faction}</p>
      <p>${c.bio}</p>`;
    modal.showModal();
  }

  function initModal() {
    const modal = $("#charModal");
    $("#modalClose").addEventListener("click", () => modal.close());
    // Close on backdrop click
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  }

  /* ---------- Worlds ---------- */
  function initWorlds() {
    $("#worldsTrack").innerHTML = WORLDS.map((w, i) => `
      <article class="world reveal" style="--c: ${w.color}">
        <div class="world__art" aria-hidden="true"></div>
        <div class="world__body">
          <span class="world__num">STOP ${String(i + 1).padStart(2, "0")}</span>
          <h3>${w.name}</h3>
          <p>${w.desc}</p>
        </div>
      </article>`).join("");
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 6) * 60}ms`;
      io.observe(el);
    });
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  document.addEventListener("DOMContentLoaded", () => {
    initStarfield();
    initNav();
    initPaths();
    initElements();
    initCharacters();
    initModal();
    initWorlds();
    initReveal(); // last, so dynamically rendered .reveal elements are included
  });
})();
