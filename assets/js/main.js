/* Sistema Spedizioni — interactions */
(function () {
  "use strict";

  /* ---------- fullscreen menu ---------- */
  var burger = document.querySelector(".nav__burger");
  var menu = document.querySelector(".menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
      });
    });
  }

  /* ---------- scroll reveals ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = (el.dataset.count.split(".")[1] || "").length;
    var dur = 1800;
    var start = null;
    function ease(t) { return 1 - Math.pow(1 - t, 4); }
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var val = target * ease(p);
      el.textContent = val.toLocaleString("it-IT", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = parseFloat(el.dataset.count).toLocaleString("it-IT");
    });
  }

  /* ---------- quote form → mailto ---------- */
  var form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      var subject = "Richiesta quotazione — " + (d.get("azienda") || d.get("nome") || "");
      var body =
        "Nome: " + (d.get("nome") || "") +
        "\nAzienda: " + (d.get("azienda") || "") +
        "\nEmail: " + (d.get("email") || "") +
        "\nTelefono: " + (d.get("telefono") || "") +
        "\nServizio: " + (d.get("servizio") || "") +
        "\n\nMessaggio:\n" + (d.get("messaggio") || "");
      window.location.href =
        "mailto:sistema@sistemaspedizioni.com?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);
    });
  }
})();
