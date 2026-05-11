/* ─────────────────────────────────────────────────────────
   Spanier Painting · Design Review — chrome.js
   Theme picker · viewport toggle · progress + auto-save ·
   annotation pins · inline form submission.
   ───────────────────────────────────────────────────────── */
(() => {
  "use strict";

  const KEYS = {
    theme:    "spanier-review-theme",
    progress: "spanier-review-progress",    // { slug: "submitted" | "draft" }
    draft:    "spanier-review-draft:",      // + slug → form FormData json
    pins:     "spanier-review-pins:",       // + slug → array of pin objects
    viewport: "spanier-review-viewport",
  };

  const THEMES = [
    { id: "studio", label: "Studio", bg: "#FAFAF7", accent: "#1E3F8A" },
    { id: "ivory",  label: "Ivory",  bg: "#F4EFE2", accent: "#1E3F8A" },
    { id: "linen",  label: "Linen",  bg: "#EBE3D2", accent: "#B85737" },
    { id: "dusk",   label: "Dusk",   bg: "#1A1A1E", accent: "#8FA6D8" },
  ];

  const VIEWPORTS = [
    { id: "desktop", label: "Desktop", width: null,  hint: "1280px" },
    { id: "tablet",  label: "Tablet",  width: 820,   hint: "820px"  },
    { id: "mobile",  label: "Mobile",  width: 390,   hint: "390px"  },
  ];

  const MOCKUPS = [
    { slug: "atelier-journal",  name: "Atelier Journal" },
    { slug: "open-house",       name: "Open House" },
    { slug: "the-painted-room", name: "The Painted Room" },
    { slug: "delft-porcelain",  name: "Delft Porcelain" },
    { slug: "brutalist-grid",   name: "Brutalist Grid" },
    { slug: "risograph-print",  name: "Risograph Print" },
    { slug: "plain-studio",     name: "Plain Studio" },
  ];

  /* ── Safe storage helpers ─────────────────────────────── */

  const store = {
    get(k)    { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} },
    del(k)    { try { localStorage.removeItem(k); } catch (_) {} },
    json(k)   { const v = this.get(k); try { return v ? JSON.parse(v) : null; } catch (_) { return null; } },
    setJson(k, v) { this.set(k, JSON.stringify(v)); },
  };

  /* ── Theme system ─────────────────────────────────────── */

  function applyTheme(id) {
    const valid = THEMES.find((t) => t.id === id);
    const next = valid ? id : "studio";
    document.documentElement.setAttribute("data-theme", next);
    store.set(KEYS.theme, next);
    updateToggleSwatch(next);
    updatePanelState(next);
  }

  function updateToggleSwatch(id) {
    const swatch = document.querySelector(".theme-toggle .theme-swatch");
    const label = document.querySelector(".theme-toggle .toggle-label");
    const def = THEMES.find((t) => t.id === id) || THEMES[0];
    if (swatch) swatch.style.background = def.accent;
    if (label) label.textContent = def.label;
  }

  function updatePanelState(id) {
    document.querySelectorAll(".theme-option").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.theme === id ? "true" : "false");
    });
  }

  function buildThemePicker() {
    if (document.querySelector(".theme-picker")) return;
    const wrap = document.createElement("div");
    wrap.className = "theme-picker";
    wrap.innerHTML = `
      <div class="theme-panel" role="listbox" aria-label="Theme">
        <div class="theme-panel-title">Theme</div>
        ${THEMES.map((t) => `
          <button class="theme-option" type="button" role="option"
                  data-theme="${t.id}" aria-pressed="false"
                  style="--sw-bg:${t.bg};--sw-accent:${t.accent};">
            <span class="option-swatch" aria-hidden="true"></span>
            <span class="option-label">${t.label}</span>
            <span class="option-state" aria-hidden="true">✓</span>
          </button>`).join("")}
      </div>
      <button class="theme-toggle" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Change theme">
        <span class="theme-swatch" aria-hidden="true"></span>
        <span class="toggle-label">Studio</span>
        <span class="caret" aria-hidden="true"></span>
      </button>
    `;
    document.body.appendChild(wrap);

    const toggle = wrap.querySelector(".theme-toggle");
    const panel = wrap.querySelector(".theme-panel");

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    panel.querySelectorAll(".theme-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        applyTheme(opt.dataset.theme);
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target) && panel.classList.contains("is-open")) {
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.classList.contains("is-open")) {
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  function initTheme() {
    const stored = store.get(KEYS.theme);
    const initial = stored && THEMES.find((t) => t.id === stored) ? stored : "studio";
    document.documentElement.setAttribute("data-theme", initial);
    buildThemePicker();
    updateToggleSwatch(initial);
    updatePanelState(initial);
  }

  /* ── Progress system ──────────────────────────────────── */

  function getProgress() { return store.json(KEYS.progress) || {}; }
  function setProgress(slug, status) {
    const p = getProgress();
    p[slug] = status;
    store.setJson(KEYS.progress, p);
    refreshProgressUI();
  }
  function progressStats() {
    const p = getProgress();
    let submitted = 0, drafts = 0;
    MOCKUPS.forEach((m) => {
      if (p[m.slug] === "submitted") submitted++;
      else if (p[m.slug] === "draft") drafts++;
    });
    return { submitted, drafts, total: MOCKUPS.length };
  }

  function refreshProgressUI() {
    const stats = progressStats();
    document.querySelectorAll("[data-progress-count]").forEach((el) => {
      el.textContent = `${stats.submitted} / ${stats.total}`;
    });
    document.querySelectorAll("[data-progress-bar]").forEach((bar) => {
      bar.style.setProperty("--progress", (stats.submitted / stats.total) * 100 + "%");
      bar.setAttribute("aria-valuenow", stats.submitted);
    });
    // Decorate landing cards with state badges
    const p = getProgress();
    document.querySelectorAll(".mockup-card[data-slug]").forEach((card) => {
      const slug = card.dataset.slug;
      const status = p[slug];
      card.classList.toggle("is-submitted", status === "submitted");
      card.classList.toggle("is-draft", status === "draft");
      let badge = card.querySelector(".card-state");
      if (status && !badge) {
        badge = document.createElement("span");
        badge.className = "card-state";
        card.querySelector(".mockup-meta")?.prepend(badge);
      }
      if (badge) {
        badge.textContent = status === "submitted" ? "Reviewed ✓" : "Draft saved";
      } else if (!status && card.querySelector(".card-state")) {
        card.querySelector(".card-state").remove();
      }
    });
    // Resume CTA on landing
    const resume = document.querySelector("[data-resume]");
    if (resume) {
      const draftSlug = Object.entries(getProgress()).find(([, v]) => v === "draft")?.[0];
      if (draftSlug && stats.submitted < stats.total) {
        resume.hidden = false;
        const link = resume.querySelector("a");
        if (link) link.href = `reviews/${draftSlug}.html`;
        const label = resume.querySelector("[data-resume-label]");
        if (label) {
          const m = MOCKUPS.find((x) => x.slug === draftSlug);
          label.textContent = m ? m.name : draftSlug;
        }
      } else {
        resume.hidden = true;
      }
    }
  }

  /* ── Draft auto-save ──────────────────────────────────── */

  function serializeForm(form) {
    const data = {};
    new FormData(form).forEach((v, k) => { data[k] = v; });
    return data;
  }
  function hydrateForm(form, data) {
    if (!data) return;
    Object.entries(data).forEach(([k, v]) => {
      const field = form.querySelector(`[name="${CSS.escape(k)}"]`);
      if (!field) return;
      if (field.type === "radio") {
        const radio = form.querySelector(`[name="${CSS.escape(k)}"][value="${CSS.escape(v)}"]`);
        if (radio) radio.checked = true;
      } else if (field.type === "checkbox") {
        field.checked = !!v;
      } else {
        field.value = v;
      }
    });
  }

  /* ── Viewport toggle ──────────────────────────────────── */

  function applyViewport(id) {
    const wrap = document.querySelector(".review-frame-wrap");
    if (!wrap) return;
    const def = VIEWPORTS.find((v) => v.id === id) || VIEWPORTS[0];
    if (def.width) {
      wrap.style.setProperty("--vp-max", def.width + "px");
      wrap.classList.add("is-constrained");
    } else {
      wrap.style.removeProperty("--vp-max");
      wrap.classList.remove("is-constrained");
    }
    document.querySelectorAll(".vp-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.viewport === id ? "true" : "false");
    });
    store.set(KEYS.viewport, id);
  }

  function initViewportToggle() {
    const host = document.querySelector("[data-viewport-host]");
    if (!host) return;
    host.innerHTML = `
      <div class="vp-group" role="group" aria-label="Viewport">
        ${VIEWPORTS.map((v) => `
          <button class="vp-btn" type="button" data-viewport="${v.id}"
                  aria-pressed="${v.id === "desktop" ? "true" : "false"}"
                  title="${v.label} · ${v.hint}">
            <span class="vp-icon vp-icon--${v.id}" aria-hidden="true"></span>
            <span class="vp-label">${v.label}</span>
          </button>`).join("")}
      </div>
    `;
    host.querySelectorAll(".vp-btn").forEach((btn) => {
      btn.addEventListener("click", () => applyViewport(btn.dataset.viewport));
    });
    const stored = store.get(KEYS.viewport);
    applyViewport(stored && VIEWPORTS.find((v) => v.id === stored) ? stored : "desktop");
  }

  /* ── Annotation pins ──────────────────────────────────── */

  function pinsFor(slug)        { return store.json(KEYS.pins + slug) || []; }
  function savePins(slug, pins) { store.setJson(KEYS.pins + slug, pins); }

  function initAnnotations(slug, form) {
    const wrap = document.querySelector(".review-frame-wrap");
    const sidebarHost = document.querySelector("[data-pin-list]");
    if (!wrap || !sidebarHost) return;

    // Annotate-mode toggle button
    const ctrlHost = document.querySelector("[data-pin-controls]");
    if (ctrlHost) {
      ctrlHost.innerHTML = `
        <button type="button" class="pin-toggle" aria-pressed="false">
          <span class="pin-dot" aria-hidden="true"></span>
          <span>Pin a note</span>
        </button>
        <span class="pin-helper">Click anywhere on the design to drop a pin.</span>
      `;
    }
    const toggle = ctrlHost?.querySelector(".pin-toggle");

    // Overlay layer (click-capture)
    const overlay = document.createElement("div");
    overlay.className = "pin-overlay";
    wrap.appendChild(overlay);

    // Pin container (pin markers)
    const pinLayer = document.createElement("div");
    pinLayer.className = "pin-layer";
    wrap.appendChild(pinLayer);

    let pins = pinsFor(slug);

    function renderPins() {
      pinLayer.innerHTML = "";
      pins.forEach((p, idx) => {
        const node = document.createElement("button");
        node.type = "button";
        node.className = "pin-marker";
        node.style.left = p.x + "%";
        node.style.top = p.y + "%";
        node.dataset.idx = String(idx);
        node.setAttribute("aria-label", `Pin ${idx + 1}`);
        node.textContent = String(idx + 1);
        pinLayer.appendChild(node);
      });
      renderList();
      syncHidden();
    }

    function renderList() {
      if (pins.length === 0) {
        sidebarHost.innerHTML = `<p class="pin-empty">No pins yet. Hit "Pin a note", then click anywhere on the design.</p>`;
        return;
      }
      sidebarHost.innerHTML = pins.map((p, i) => `
        <div class="pin-row" data-idx="${i}">
          <span class="pin-row-num">${i + 1}</span>
          <textarea class="pin-row-note" rows="2" placeholder="Note about this spot…">${(p.note || "").replace(/</g, "&lt;")}</textarea>
          <button type="button" class="pin-row-del" aria-label="Delete pin ${i + 1}">×</button>
        </div>
      `).join("");
      sidebarHost.querySelectorAll(".pin-row-note").forEach((ta) => {
        ta.addEventListener("input", (e) => {
          const idx = +e.target.closest(".pin-row").dataset.idx;
          pins[idx].note = e.target.value;
          savePins(slug, pins);
          syncHidden();
        });
      });
      sidebarHost.querySelectorAll(".pin-row-del").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const idx = +e.target.closest(".pin-row").dataset.idx;
          pins.splice(idx, 1);
          savePins(slug, pins);
          renderPins();
        });
      });
    }

    function syncHidden() {
      if (!form) return;
      let hidden = form.querySelector("input[name='pins']");
      if (!hidden) {
        hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.name = "pins";
        form.appendChild(hidden);
      }
      hidden.value = JSON.stringify(pins);
    }

    function setActive(active) {
      wrap.classList.toggle("is-annotating", active);
      overlay.classList.toggle("is-active", active);
      if (toggle) toggle.setAttribute("aria-pressed", active ? "true" : "false");
    }

    if (toggle) {
      toggle.addEventListener("click", () => {
        const next = !wrap.classList.contains("is-annotating");
        setActive(next);
      });
    }

    overlay.addEventListener("click", (e) => {
      if (!wrap.classList.contains("is-annotating")) return;
      const rect = overlay.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      pins.push({ x: +x.toFixed(2), y: +y.toFixed(2), note: "" });
      savePins(slug, pins);
      renderPins();
      // Focus the new pin's textarea
      const last = sidebarHost.querySelector(`.pin-row[data-idx="${pins.length - 1}"] textarea`);
      if (last) last.focus();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && wrap.classList.contains("is-annotating")) {
        setActive(false);
      }
    });

    renderPins();
  }

  /* ── Inline form submission + draft sync ──────────────── */

  function wireForm(form) {
    if (!form || form.dataset.wired === "1") return;
    form.dataset.wired = "1";

    const slug = form.dataset.slug || "";
    const submitBtn = form.querySelector("[type='submit']");
    const successEl = form.parentElement?.querySelector(".form-success");
    const errorEl   = form.parentElement?.querySelector(".form-error");

    // Hydrate from draft if exists
    if (slug) {
      const draft = store.json(KEYS.draft + slug);
      if (draft) hydrateForm(form, draft);
    }

    // Auto-save on input change
    form.addEventListener("input", () => {
      if (!slug) return;
      const data = serializeForm(form);
      const isNonempty = Object.values(data).some((v) => typeof v === "string" && v.trim().length > 0);
      if (isNonempty) {
        store.setJson(KEYS.draft + slug, data);
        const current = getProgress()[slug];
        if (current !== "submitted") setProgress(slug, "draft");
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorEl) errorEl.classList.remove("is-active");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalLabel = submitBtn.textContent;
        submitBtn.textContent = "Sending…";
      }

      const action = form.action;
      const isPlaceholder = /YOUR_ID_HERE/.test(action);

      try {
        if (isPlaceholder) {
          await new Promise((r) => setTimeout(r, 420));
          finalize();
          return;
        }
        const response = await fetch(action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (response.ok) finalize();
        else {
          const data = await response.json().catch(() => ({}));
          showError(data.error || "Something didn't go through — try again?");
        }
      } catch (err) {
        showError("Network blip. Try again in a moment?");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.dataset.originalLabel) submitBtn.textContent = submitBtn.dataset.originalLabel;
        }
      }
    });

    function finalize() {
      if (slug) {
        setProgress(slug, "submitted");
        store.del(KEYS.draft + slug);
      }
      form.style.display = "none";
      if (successEl) {
        successEl.classList.add("is-active");
        successEl.setAttribute("tabindex", "-1");
        successEl.focus({ preventScroll: true });
      }
    }
    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.classList.add("is-active");
    }
  }

  function initForms() {
    document.querySelectorAll("form[data-inline-submit]").forEach((form) => {
      wireForm(form);
      const slug = form.dataset.slug;
      if (slug) initAnnotations(slug, form);
    });
  }

  /* ── Reset progress (developer / Lukas-resetting) ────── */

  function bindReset() {
    document.querySelectorAll("[data-reset-progress]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!confirm("Clear your saved drafts and progress? This can't be undone.")) return;
        try {
          // Clear all spanier-review-* keys
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && k.startsWith("spanier-review-")) localStorage.removeItem(k);
          }
        } catch (_) {}
        location.reload();
      });
    });
  }

  /* ── Boot ─────────────────────────────────────────────── */

  function boot() {
    initTheme();
    initForms();
    initViewportToggle();
    refreshProgressUI();
    bindReset();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
