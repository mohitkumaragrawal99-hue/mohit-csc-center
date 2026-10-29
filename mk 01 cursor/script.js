/* ==========================================================================
   Mohit CSC Centre — interactions
   Wrapped in an IIFE so nothing leaks into the global scope. The script is
   loaded with `defer`, so the DOM is guaranteed to be ready.
   ========================================================================== */

(function () {
  "use strict";

  var WHATSAPP_NUMBER = "919304181641";

  /**
   * Mobile navigation: toggling, ARIA state, Escape-to-close, and a reset
   * when the viewport grows back to the desktop layout.
   */
  function initNav() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("navLinks");
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("open", open);
      toggle.classList.toggle("active", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      setOpen(!menu.classList.contains("open"));
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("open")) setOpen(false);
    });

    var desktop = window.matchMedia("(min-width: 769px)");
    if (desktop.addEventListener) {
      desktop.addEventListener("change", function (event) {
        if (event.matches) setOpen(false);
      });
    }
  }

  /**
   * Marks the nav link matching the section currently in view.
   */
  function initScrollSpy() {
    var sections = document.querySelectorAll("section[id]");
    var links = document.querySelectorAll(".nav-links a");
    if (!sections.length || !links.length) return;

    function update() {
      var current = "";
      sections.forEach(function (section) {
        if (window.scrollY >= section.offsetTop - 120) current = section.id;
      });
      links.forEach(function (link) {
        link.classList.toggle("active", link.getAttribute("href") === "#" + current);
      });
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /**
   * Shows the "back to top" button past the fold; respects reduced motion.
   */
  function initBackToTop() {
    var button = document.getElementById("backTop");
    if (!button) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.addEventListener(
      "scroll",
      function () {
        button.classList.toggle("show", window.scrollY > 500);
      },
      { passive: true }
    );

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /**
   * Filters the service cards by category and keeps aria-pressed in sync.
   */
  function initServiceFilter() {
    var buttons = document.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".service-card");
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.dataset.filter;

        buttons.forEach(function (other) {
          var isActive = other === button;
          other.classList.toggle("active", isActive);
          other.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        cards.forEach(function (card) {
          var visible = filter === "all" || card.dataset.category === filter;
          card.classList.toggle("hidden", !visible);
          if (visible) card.classList.add("revealed");
        });
      });
    });
  }

  /**
   * Fades content in as it enters the viewport. The hidden state is applied
   * only once this script executes, so the page stays readable without JS or
   * without IntersectionObserver support.
   */
  function initReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries, self) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("revealed");
          self.unobserve(entry.target);
        });
      },
      { threshold: 0.08 }
    );

    targets.forEach(function (target) {
      target.classList.add("reveal-armed");
      observer.observe(target);
    });

    window.setTimeout(function () {
      targets.forEach(function (target) {
        target.classList.add("revealed");
      });
    }, 8000);
  }

  /**
   * Composes the enquiry and hands it to WhatsApp. No backend is bundled, so
   * this guarantees the message actually reaches the centre.
   */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var input = function (id) {
      var field = document.getElementById(id);
      return field && field.value ? field.value.trim() : "";
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var button = form.querySelector('button[type="submit"]');
      if (!button) return;

      var message = [
        "Hello Mohit CSC Centre,",
        "",
        "Name: " + input("fName"),
        "Phone: " + input("fPhone"),
        "Service: " + (input("fService") || "General enquiry"),
        "",
        input("fMessage")
      ].join("\n");

      var original = button.innerHTML;
      button.disabled = true;
      button.textContent = "Opening WhatsApp…";

      window.open(
        "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message),
        "_blank",
        "noopener,noreferrer"
      );

      window.setTimeout(function () {
        button.textContent = "Ready to send";
        window.setTimeout(function () {
          button.innerHTML = original;
          button.disabled = false;
          form.reset();
        }, 1600);
      }, 500);
    });
  }

  initNav();
  initScrollSpy();
  initBackToTop();
  initServiceFilter();
  initReveal();
  initContactForm();
})();