/* ==========================================================================
   LAGOS RHYTHM — ANNIVERSARY EDITION
   Vanilla JS, no dependencies. Every enhancement degrades gracefully:
   without JS the page is fully readable, the nav still anchors, and the
   print stylesheet still produces a clean PDF.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. Reading progress indicator (masthead top rule)
     ------------------------------------------------------------------ */
  var progressFill = document.getElementById("read-progress");
  var masthead = document.getElementById("masthead");

  /* ------------------------------------------------------------------
     2. Masthead solidification + active section highlighting
     ------------------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var navTargets = navLinks
    .map(function (link) { return document.getElementById(link.getAttribute("data-nav")); })
    .filter(Boolean);

  var ticking = false;

  function frame() {
    ticking = false;

    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    var scrolled = scrollable > 0 ? (window.pageYOffset / scrollable) * 100 : 0;
    if (progressFill) {
      progressFill.style.width = Math.min(100, Math.max(0, scrolled)).toFixed(2) + "%";
    }

    if (masthead) {
      masthead.classList.toggle("is-scrolled", window.pageYOffset > 24);
    }

    if (navTargets.length) {
      var anchor = (masthead ? masthead.offsetHeight : 68) + 96;
      var active = navTargets[0];
      for (var i = 0; i < navTargets.length; i++) {
        if (navTargets[i].getBoundingClientRect().top - anchor <= 0) active = navTargets[i];
      }
      for (var j = 0; j < navLinks.length; j++) {
        var isActive = navLinks[j].getAttribute("data-nav") === active.id;
        navLinks[j].classList.toggle("is-active", isActive);
        if (isActive) {
          navLinks[j].setAttribute("aria-current", "true");
        } else {
          navLinks[j].removeAttribute("aria-current");
        }
      }
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(frame);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  frame();

  /* ------------------------------------------------------------------
     3. Reveal on scroll
     ------------------------------------------------------------------ */
  var revealables = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showAll() {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealables.forEach(function (el) { revealObserver.observe(el); });

    // Safety net: never leave content hidden if the observer never fires.
    window.setTimeout(showAll, 4000);
  }

  /* ------------------------------------------------------------------
     4. Copy pull quotes — works for every quote on the page
     ------------------------------------------------------------------ */
  function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-9999px";
      document.body.appendChild(area);
      area.select();
      try {
        var ok = document.execCommand("copy");
        document.body.removeChild(area);
        ok ? resolve() : reject(new Error("copy-unavailable"));
      } catch (err) {
        document.body.removeChild(area);
        reject(err);
      }
    });
  }

  function setCopyState(btn, copied) {
    var label = btn.querySelector("span");
    var icon = btn.querySelector("svg use");
    btn.classList.toggle("is-copied", copied);
    if (label) label.textContent = copied ? "Copied!" : "Copy Quote";
    if (icon) icon.setAttribute("href", copied ? "#i-check" : "#i-copy");
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (btn) {
    btn.addEventListener("click", function () {
      var figure = btn.closest ? btn.closest(".pullquote") : null;
      var quote = figure && figure.querySelector("blockquote");
      if (!quote) return;

      var cite = figure.querySelector("cite");
      var text = quote.textContent.trim();
      if (cite) text += " " + cite.textContent.trim();

      writeClipboard(text)
        .then(function () {
          setCopyState(btn, true);
          window.clearTimeout(btn._resetTimer);
          btn._resetTimer = window.setTimeout(function () {
            setCopyState(btn, false);
          }, 2200);
        })
        .catch(function (err) {
          if (window.console) console.error("Copy failed:", err);
          var label = btn.querySelector("span");
          if (label) label.textContent = "Press ⌘/Ctrl+C";
        });
    });
  });

  /* ------------------------------------------------------------------
     5. Save as PDF (opens the browser print dialog)
     ------------------------------------------------------------------ */
  Array.prototype.forEach.call(document.querySelectorAll("[data-print]"), function (btn) {
    btn.addEventListener("click", function () {
      window.print();
    });
  });
})();
