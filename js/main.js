/* Elizabeth Bibla Landscape Architecture — interactions
   Plain JS, no dependencies. Everything degrades to a readable static page. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky nav state ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("mobileMenu");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
  }
  toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1080) setMenu(false); });

  /* ---------- Current section in nav ---------- */
  var links = document.querySelectorAll(".nav__links a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("is-current", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["services", "seasons", "work", "process", "about"].forEach(function (id) {
      var el = document.getElementById(id); if (el) io.observe(el);
    });
  }

  /* ---------- Hero plan: draw on load + legend markers ---------- */
  var plan = document.querySelector(".sheet .plan");
  if (plan) {
    var draws = plan.querySelectorAll(".draw");
    draws.forEach(function (el, i) {
      el.setAttribute("pathLength", "1");
      el.style.setProperty("--d", Math.min(i * 6, 1400));
    });
    plan.querySelectorAll(".marker").forEach(function (m, i) { m.style.setProperty("--i", i); });
    requestAnimationFrame(function () { plan.classList.add("is-drawn"); });

    var notes = {
      1: "Bluestone terrace sized for dining off the kitchen, with shrubs softening the house line.",
      2: "Native meadow of little bluestem and coneflower in place of high-maintenance lawn.",
      3: "Pool garden screened with layered evergreens and summer perennials.",
      4: "A rain-fed pond with stone edging and a stepping-stone crossing.",
      5: "Low-voltage path lights along the stepping stones, plus uplights under the shade trees."
    };
    var tipKey = document.querySelector(".sheet__tip-key");
    var tipText = document.querySelector(".sheet__tip-text");
    var labels = {};
    plan.querySelectorAll(".marker").forEach(function (m) { labels[m.dataset.key] = m.getAttribute("aria-label"); });

    function focusKey(k) {
      plan.classList.toggle("has-focus", !!k);
      plan.querySelectorAll(".marker, .legend-row").forEach(function (el) { el.classList.toggle("is-on", el.dataset.key === k); });
      if (k) { tipKey.textContent = k + "  " + labels[k]; tipText.textContent = notes[k]; }
    }
    plan.querySelectorAll(".marker").forEach(function (m) {
      m.addEventListener("mouseenter", function () { focusKey(m.dataset.key); });
      m.addEventListener("focus", function () { focusKey(m.dataset.key); });
      m.addEventListener("click", function () { focusKey(m.dataset.key); });
      m.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); focusKey(m.dataset.key); } });
    });
    plan.addEventListener("mouseleave", function () { plan.classList.remove("has-focus"); plan.querySelectorAll(".is-on").forEach(function (el) { el.classList.remove("is-on"); }); });
  }

  /* ---------- Tabs helper (arrow-key navigation) ---------- */
  function arrowNav(list, selector, activate) {
    list.addEventListener("keydown", function (e) {
      var keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
      if (keys.indexOf(e.key) < 0) return;
      var tabs = Array.prototype.slice.call(list.querySelectorAll(selector));
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 :
        (e.key === "ArrowDown" || e.key === "ArrowRight") ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
      tabs[next].focus(); activate(tabs[next]);
    });
  }
  function setTabIndex(tabs) { tabs.forEach(function (t) { t.tabIndex = t.getAttribute("aria-selected") === "true" ? 0 : -1; }); }

  /* ---------- Services: swap illustration ---------- */
  var svcList = document.querySelector(".svc-list");
  var svcImg = document.querySelector(".svc-panel img");
  if (svcList && svcImg) {
    var svcTabs = Array.prototype.slice.call(svcList.querySelectorAll("[role=tab]"));
    // preload
    svcTabs.forEach(function (t) { var im = new Image(); im.src = t.dataset.img; });
    var swapTimer;
    function selectSvc(tab) {
      if (tab.getAttribute("aria-selected") === "true") return;
      svcTabs.forEach(function (t) { t.setAttribute("aria-selected", String(t === tab)); });
      setTabIndex(svcTabs);
      clearTimeout(swapTimer);
      svcImg.classList.add("is-fading");
      swapTimer = setTimeout(function () {
        svcImg.src = tab.dataset.img; svcImg.alt = tab.dataset.alt;
        svcImg.classList.remove("is-fading");
      }, reduceMotion ? 0 : 220);
    }
    svcTabs.forEach(function (t) {
      t.addEventListener("click", function () { selectSvc(t); });
      t.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) selectSvc(t); });
    });
    setTabIndex(svcTabs);
    arrowNav(svcList, "[role=tab]", selectSvc);
  }

  /* ---------- Seasons ---------- */
  var seasonTabsWrap = document.querySelector(".seasons__tabs");
  if (seasonTabsWrap) {
    var sTabs = Array.prototype.slice.call(seasonTabsWrap.querySelectorAll("[role=tab]"));
    var sImgs = document.querySelectorAll(".seasons__stage img");
    var sBits = document.querySelectorAll(".seasons__body [data-for]");
    function selectSeason(tab) {
      var s = tab.dataset.season;
      sTabs.forEach(function (t) { t.setAttribute("aria-selected", String(t === tab)); });
      setTabIndex(sTabs);
      sImgs.forEach(function (im) { im.classList.toggle("is-active", im.dataset.season === s); });
      sBits.forEach(function (b) { b.hidden = b.dataset.for !== s; });
    }
    sTabs.forEach(function (t) { t.addEventListener("click", function () { selectSeason(t); }); });
    setTabIndex(sTabs);
    arrowNav(seasonTabsWrap, "[role=tab]", selectSeason);
  }

  /* ---------- Work filter ---------- */
  var chips = document.querySelectorAll(".chip");
  var projects = document.querySelectorAll(".proj");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      projects.forEach(function (p) {
        var show = f === "all" || p.dataset.cat === f;
        p.classList.toggle("is-hidden", !show);
        // big tiles only make sense in the full grid
        p.style.gridColumn = f === "all" ? "" : "auto";
        p.style.gridRow = f === "all" ? "" : "auto";
      });
    });
  });

  /* ---------- Process line grows when in view ---------- */
  var steps = document.querySelector(".steps");
  if (steps) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { steps.classList.add("is-in"); so.disconnect(); } });
      }, { threshold: 0.4 });
      so.observe(steps);
    } else { steps.classList.add("is-in"); }
  }

  /* ---------- Contact form (front-end validation; wire to Formspree/Resend in production) ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 || "Enter your name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter an email like name@example.com."; },
      phone: function (v) { return !v.trim() || v.replace(/\D/g, "").length >= 10 || "Enter a 10-digit phone number, or leave it blank."; },
      message: function (v) { return v.trim().length >= 10 || "Add a sentence or two about the project."; }
    };
    function check(input) {
      var rule = rules[input.name]; if (!rule) return true;
      var res = rule(input.value);
      var field = input.closest(".field");
      var err = field.querySelector(".field__err");
      var ok = res === true;
      field.classList.toggle("has-error", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      err.textContent = ok ? "" : res;
      return ok;
    }
    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("blur", function () { if (el.value) check(el); });
      el.addEventListener("input", function () { if (el.closest(".field").classList.contains("has-error")) check(el); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n];
        if (!check(el) && !firstBad) firstBad = el;
      });
      if (firstBad) { firstBad.focus(); return; }
      var done = form.querySelector(".form__done");
      var name = form.elements.name.value.trim().split(" ")[0];
      done.textContent = "Thanks, " + name + ". Your request is in. The office will be in touch to schedule a site visit.";
      done.hidden = false;
      form.querySelector("button[type=submit]").textContent = "Request sent";
      form.querySelector("button[type=submit]").disabled = true;
    });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
