/* ==========================================================================
   Oklahoma Stage — shared header + footer
   Each page sets <body data-page="..."> to drive the active nav state.
   The TuneGenie footer embed (the "vuebar") stays hardcoded in each page,
   because script tags injected via innerHTML do not execute.
   ========================================================================== */
(function () {
  var PAGES = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "khtt", label: "KHTT", href: "khtt.html", group: "radio" },
    { id: "krqv", label: "KRQV", href: "krqv.html", group: "radio" },
    { id: "kvoo", label: "KVOO", href: "kvoo.html", group: "radio" },
    { id: "kxbl", label: "KXBL", href: "kxbl.html", group: "radio" },
    { id: "tv1", label: "TV 1", href: "tv1.html", group: "tv" },
    { id: "tv2", label: "TV 2", href: "tv2.html", group: "tv" }
  ];

  var current = (document.body.getAttribute("data-page") || "home").toLowerCase();

  /* ---- Header ---- */
  function buildHeader() {
    var links = "";
    var prevGroup = null;
    PAGES.forEach(function (p) {
      if (prevGroup && p.group && p.group !== prevGroup) {
        links += '<span class="nav-sep" aria-hidden="true"></span>';
      }
      prevGroup = p.group || prevGroup;
      var active = p.id === current ? " active" : "";
      var aria = p.id === current ? ' aria-current="page"' : "";
      links +=
        '<a class="' + active.trim() + '" href="' + p.href + '"' + aria + ">" +
        p.label +
        "</a>";
    });

    return (
      '<header class="site-header">' +
      '<div class="container nav-inner">' +
      '<a class="brand" href="index.html" aria-label="Oklahoma Stage — home">' +
      '<span class="brand-mark">OK</span>' +
      '<span class="brand-text">Oklahoma <span class="brand-sub">Stage</span></span>' +
      "</a>" +
      '<nav class="nav-links" aria-label="Primary">' +
      links +
      "</nav>" +
      "</div>" +
      "</header>"
    );
  }

  /* ---- Footer ---- */
  function buildFooter() {
    var year = document.body.getAttribute("data-year") || "2026";
    return (
      '<footer class="site-footer">' +
      '<div class="container">' +
      '<div class="footer-inner">' +
      '<div class="footer-brand">Oklahoma Stage' +
      "<p>The staging environment for our radio and television brands. " +
      "Content shown here is placeholder.</p>" +
      "</div>" +
      '<div class="footer-cols">' +
      '<div class="footer-col"><h4>Radio</h4>' +
      '<a href="khtt.html">KHTT</a>' +
      '<a href="krqv.html">KRQV</a>' +
      '<a href="kvoo.html">KVOO</a>' +
      '<a href="kxbl.html">KXBL</a>' +
      "</div>" +
      '<div class="footer-col"><h4>Television</h4>' +
      '<a href="tv1.html">TV 1</a>' +
      '<a href="tv2.html">TV 2</a>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="footer-legal">&copy; ' +
      year +
      " Oklahoma Stage · Staging environment</div>" +
      "</div>" +
      "</footer>"
    );
  }

  var headerSlot = document.getElementById("site-header");
  if (headerSlot) headerSlot.outerHTML = buildHeader();

  var footerSlot = document.getElementById("site-footer");
  if (footerSlot) footerSlot.outerHTML = buildFooter();

  /* ---- "Listen live" → play this page's station via the TuneGenie bar (PWM) ---- */
  var RADIO = PAGES.filter(function (p) { return p.group === "radio"; })
                   .map(function (p) { return p.id; });

  // PWM exposes window.__PWM__ once the bar boots; poll for an early click.
  function whenPWMReady(cb) {
    if (window.__PWM__) return cb(window.__PWM__);
    var tries = 0;
    var timer = setInterval(function () {
      if (window.__PWM__) { clearInterval(timer); cb(window.__PWM__); }
      else if (++tries > 150) { clearInterval(timer); } // ~15s safety cap
    }, 100);
  }

  // Load + play the given station: switch brands if needed, else just start the stream.
  function playStation(callsign) {
    whenPWMReady(function (pwm) {
      pwm.getComponent("config").then(function (cfg) {
        cfg.connector.getBase().then(function (base) {
          if (base && base.b === callsign) {
            pwm.getComponent("bar").then(function () {
              pwm.dispatchEvent("bar", "listenLive");
            });
          } else {
            cfg.connector.setBrand(callsign, true); // switch + autostart
          }
        });
      });
    });
  }

  if (RADIO.indexOf(current) !== -1) {
    var liveBtn = document.querySelector(".hero a.btn-primary");
    if (liveBtn) {
      liveBtn.addEventListener("click", function () { playStation(current); });
    }
  }
})();
