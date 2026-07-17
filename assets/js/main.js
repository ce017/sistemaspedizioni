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
      el.textContent = val.toLocaleString(document.documentElement.lang || "it", {
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
      el.textContent = parseFloat(el.dataset.count).toLocaleString(document.documentElement.lang || "it");
    });
  }

  /* ---------- reviews carousel ---------- */
  var track = document.querySelector(".reviews__track");
  if (track) {
    var step = function () {
      var card = track.querySelector(".review");
      return card ? card.getBoundingClientRect().width + 16 : 420;
    };
    var prev = document.querySelector("[data-rev-prev]");
    var next = document.querySelector("[data-rev-next]");
    var go = function (dir) {
      var max = track.scrollWidth - track.clientWidth;
      var target = track.scrollLeft + dir * step();
      if (dir > 0 && target > max + 8) target = 0;
      if (dir < 0 && target < -8) target = max;
      track.scrollTo({ left: target, behavior: "smooth" });
    };
    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });

    var auto = setInterval(function () { go(1); }, 6000);
    var stopAuto = function () { clearInterval(auto); };
    track.addEventListener("pointerdown", stopAuto, { once: true });
    if (prev) prev.addEventListener("click", stopAuto, { once: true });
    if (next) next.addEventListener("click", stopAuto, { once: true });
  }

  /* ---------- mail options (Gmail / Outlook Web / mail app / copy) ---------- */
  var MAIL_TO = "sistema@sistemaspedizioni.com";
  var mailbox = null;

  function t(k) { return (window.SS_T && window.SS_T(k)) || k; }

  function svgDot(path) {
    return '<span class="dot"><svg width="15" height="15" viewBox="0 0 16 16" fill="none">' + path + "</svg></span>";
  }

  function openMailOptions(subject, body) {
    if (!mailbox) {
      mailbox = document.createElement("div");
      mailbox.className = "mailbox";
      mailbox.innerHTML =
        '<div class="mailbox__card bezel"><div class="bezel__core">' +
        '<div class="mailbox__title"></div>' +
        '<a class="mailbox__opt" data-mail="gmail" target="_blank" rel="noopener">' +
        svgDot('<rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" stroke-width="1.2"/><path d="M2 4L8 9L14 4" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>') +
        "<span></span></a>" +
        '<a class="mailbox__opt" data-mail="outlook" target="_blank" rel="noopener">' +
        svgDot('<rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" stroke-width="1.2"/><path d="M2 4L8 9L14 4" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>') +
        "<span></span></a>" +
        '<a class="mailbox__opt" data-mail="app">' +
        svgDot('<path d="M2 8L14 2L11 14L7.5 10.5M2 8L7.5 10.5M2 8L11 14" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>') +
        "<span></span></a>" +
        '<button class="mailbox__opt" data-mail="copy" type="button">' +
        svgDot('<rect x="5" y="5" width="9" height="9.5" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M11 5V3.5C11 2.7 10.3 2 9.5 2H3.5C2.7 2 2 2.7 2 3.5V9.5C2 10.3 2.7 11 3.5 11H5" stroke="currentColor" stroke-width="1.2"/>') +
        "<span></span></button>" +
        '<button class="mailbox__close" type="button"></button>' +
        "</div></div>";
      document.body.appendChild(mailbox);
      mailbox.addEventListener("click", function (ev) {
        if (ev.target === mailbox) mailbox.classList.remove("open");
      });
      mailbox.querySelector(".mailbox__close").addEventListener("click", function () {
        mailbox.classList.remove("open");
      });
    }

    // labels in the active language
    mailbox.querySelector(".mailbox__title").textContent = t("mail.title");
    mailbox.querySelector('[data-mail="gmail"] span:last-child').textContent = t("mail.gmail");
    mailbox.querySelector('[data-mail="outlook"] span:last-child').textContent = t("mail.outlook");
    mailbox.querySelector('[data-mail="app"] span:last-child').textContent = t("mail.app");
    mailbox.querySelector('[data-mail="copy"] span:last-child').textContent = t("mail.copy");
    mailbox.querySelector(".mailbox__close").textContent = t("mail.close");

    var s = encodeURIComponent(subject);
    var b = encodeURIComponent(body);
    mailbox.querySelector('[data-mail="gmail"]').href =
      "https://mail.google.com/mail/?view=cm&fm=1&to=" + MAIL_TO + "&su=" + s + "&body=" + b;
    mailbox.querySelector('[data-mail="outlook"]').href =
      "https://outlook.live.com/mail/0/deeplink/compose?to=" + MAIL_TO + "&subject=" + s + "&body=" + b;
    mailbox.querySelector('[data-mail="app"]').href =
      "mailto:" + MAIL_TO + "?subject=" + s + "&body=" + b;

    var copyBtn = mailbox.querySelector('[data-mail="copy"]');
    copyBtn.onclick = function () {
      var text = "To: " + MAIL_TO + "\nSubject: " + subject + "\n\n" + body;
      var done = function () {
        copyBtn.querySelector("span:last-child").textContent = t("mail.copied");
        setTimeout(function () {
          copyBtn.querySelector("span:last-child").textContent = t("mail.copy");
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta);
        ta.select(); document.execCommand("copy"); ta.remove(); done();
      }
    };

    mailbox.classList.add("open");
  }

  /* ---------- quote form ---------- */
  var form = document.getElementById("quote-form");
  if (form) {
    // arriving from a sector card (?settore=X) pre-fills the message
    var sector = new URLSearchParams(window.location.search).get("settore");
    if (sector) {
      var msg = form.querySelector('[name="messaggio"]');
      if (msg && !msg.value) msg.value = sector + " — ";
    }
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
      openMailOptions(subject, body);
    });
  }

  /* ---------- job applications ---------- */
  document.querySelectorAll("[data-apply]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      openMailOptions(a.getAttribute("data-apply"), "");
    });
  });
})();
