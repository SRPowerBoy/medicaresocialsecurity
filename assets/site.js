(function () {
  "use strict";

  var D = window.SITE_DATA || {};

  // ---- Shared number formatting (used by every page) ----
  var fmt2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  var fmt0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  window.Fmt = {
    money: function (n) { return fmt2.format(n); },
    money0: function (n) { return fmt0.format(n); },
    signed: function (n) { return (n > 0 ? "+" : n < 0 ? "−" : "") + fmt2.format(Math.abs(n)); },
    pct: function (n, digits) { return (n * 100).toFixed(digits == null ? 1 : digits) + "%"; }
  };

  // ---- Icons: replace every <i data-lucide="..."> with its Lucide SVG ----
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  // ---- Fill any element marked with data-bind from the data file ----
  function lookup(path) {
    return path.split(".").reduce(function (obj, key) {
      return obj == null ? undefined : obj[key];
    }, D);
  }
  document.querySelectorAll("[data-bind]").forEach(function (el) {
    var value = lookup(el.getAttribute("data-bind"));
    if (value == null) return;
    var format = el.getAttribute("data-format");
    if (format === "money") el.textContent = window.Fmt.money(value);
    else if (format === "money0") el.textContent = window.Fmt.money0(value);
    else if (format === "pct") el.textContent = window.Fmt.pct(value);
    else el.textContent = String(value);
  });

  // ---- Reading progress bar on guide pages ----
  var bar = document.querySelector(".progress");
  if (bar) {
    var updateProgress = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = max > 0 ? (h.scrollTop / max * 100) + "%" : "0";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // ---- Table of contents: highlight the section being read ----
  var tocLinks = document.querySelectorAll(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    tocLinks.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.remove("active"); a.removeAttribute("aria-current"); });
        var link = linkFor[entry.target.id];
        if (link) { link.classList.add("active"); link.setAttribute("aria-current", "true"); }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(linkFor).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  // ---- Ads: global banners, anchor bar, and between-page interstitial ----
  // Every slot is a labeled placeholder. When an ad account exists, replace
  // each .ad-tag with an <ins class="adsbygoogle"> unit of the same size.
  var AD_RULES = {
    interstitialDelayMs: 45000,  // pop-up 45 seconds after a page opens
    interstitialCap: 2,          // at most 2 pop-ups per browser session
    stateKey: "ads-session"
  };
  var memoryAdState = {};

  function readAdState() {
    try {
      var raw = sessionStorage.getItem(AD_RULES.stateKey);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return memoryAdState;
    }
  }
  function writeAdState(state) {
    memoryAdState = state;
    try { sessionStorage.setItem(AD_RULES.stateKey, JSON.stringify(state)); } catch (err) { /* storage blocked */ }
  }

  function adSlot(id, size, label) {
    return '<aside class="ad-slot" data-size="' + size + '" data-slot="' + id + '" aria-label="Advertisement">' +
      '<p class="ad-label">Advertisement</p>' +
      '<div class="ad-box"><span class="ad-tag">Ad slot · ' + size + ' · ' + label + ' · replace with ad unit</span></div>' +
      '</aside>';
  }

  function injectGlobalAds() {
    var header = document.querySelector(".site-header");
    if (header) header.insertAdjacentHTML("afterend", adSlot("header-banner", "728x90", "header banner"));

    var footer = document.querySelector(".site-footer");
    if (footer) footer.insertAdjacentHTML("beforebegin", adSlot("footer-banner", "728x90", "footer banner"));

    document.body.insertAdjacentHTML("beforeend",
      '<div class="anchor-bar" id="anchor-bar" hidden>' +
        '<div class="ad-box"><span class="ad-tag">Ad slot · 320x50 · anchor banner · replace with ad unit</span></div>' +
        '<button type="button" class="anchor-close" data-close aria-label="Close advertisement"><i data-lucide="x"></i></button>' +
      '</div>' +
      '<div class="interstitial" id="interstitial" hidden role="dialog" aria-modal="true" aria-labelledby="int-label">' +
        '<div class="interstitial-card">' +
          '<p class="ad-label" id="int-label">Advertisement</p>' +
          '<div class="ad-box"><span class="ad-tag">Ad slot · 300x250 · interstitial · replace with ad unit</span></div>' +
          '<button type="button" class="btn btn-primary" data-continue>Close and keep reading</button>' +
        '</div>' +
      '</div>');
  }

  injectGlobalAds();
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  // Anchor bar: shown on phones only, closable
  var anchor = document.getElementById("anchor-bar");
  if (anchor) {
    if (window.matchMedia("(max-width: 900px)").matches) {
      anchor.hidden = false;
      document.body.classList.add("has-anchor");
    }
    anchor.querySelector("[data-close]").addEventListener("click", function () {
      anchor.hidden = true;
      document.body.classList.remove("has-anchor");
    });
  }

  // Interstitial pop-up: opens 45 seconds after a page loads, only while the tab
  // is visible and within the session cap. Closes with its button or Escape.
  var overlay = document.getElementById("interstitial");
  if (overlay) {
    var openOverlay = function () {
      var state = readAdState();
      if ((state.shown || 0) >= AD_RULES.interstitialCap) return;
      state.shown = (state.shown || 0) + 1;
      writeAdState(state);
      overlay.hidden = false;
      overlay.querySelector("[data-continue]").focus();
    };
    var scheduleOpen = function (delay) {
      setTimeout(function () {
        if (document.visibilityState === "visible") openOverlay();
        else scheduleOpen(5000); // wait until the tab is back in view
      }, delay);
    };
    var closeOverlay = function () { overlay.hidden = true; };
    overlay.querySelector("[data-continue]").addEventListener("click", closeOverlay);
    overlay.addEventListener("keydown", function (e) { if (e.key === "Escape") closeOverlay(); });

    if ((readAdState().shown || 0) < AD_RULES.interstitialCap) {
      scheduleOpen(AD_RULES.interstitialDelayMs);
    }
  }

  // ---- Footer year ----
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
