/* ==========================================================================
   Oklahoma Stage — shared header
   Each page sets <body data-page="..."> to drive the active nav state.
   The TuneGenie footer embed (the "vuebar") stays hardcoded in each page,
   because script tags injected via innerHTML do not execute.
   ========================================================================== */
(function () {
  // hrefs are root-absolute so nav works from subfolder pages (e.g. /thehits/) too.
  var PAGES = [
    { id: "home", label: "Home", href: "/" },
    { id: "khtt", label: "KHTT", href: "/thehits/", group: "radio" },
    { id: "krqv", label: "KRQV", href: "/theriver/", group: "radio" },
    { id: "kvoo", label: "KVOO", href: "/kvoo.html", group: "radio" },
    { id: "kxbl", label: "KXBL", href: "/kxbl.html", group: "radio" },
    { id: "tv1", label: "TV 1", href: "/tv1.html", group: "tv" },
    { id: "tv2", label: "TV 2", href: "/tv2.html", group: "tv" }
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
      '<a class="brand" href="/" aria-label="Oklahoma Stage — home">' +
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

  var headerSlot = document.getElementById("site-header");
  if (headerSlot) headerSlot.outerHTML = buildHeader();

  /* ---- "Listen live" → play this page's station via TuneGenie's tgmp API ---- */
  var RADIO = PAGES.filter(function (p) { return p.group === "radio"; })
                   .map(function (p) { return p.id; });

  // tgmp.update() switches to the brand + autostarts; poll until the embed boots tgmp.
  function playStation(callsign, tries) {
    tries = tries || 0;
    if (window.tgmp && typeof window.tgmp.update === "function") {
      window.tgmp.update({ brand: callsign, userInitStart: true });
    } else if (tries < 100) {
      setTimeout(function () { playStation(callsign, tries + 1); }, 100);
    }
  }

  if (RADIO.indexOf(current) !== -1) {
    var liveBtn = document.querySelector(".hero a.btn-primary");
    if (liveBtn) {
      liveBtn.addEventListener("click", function () { playStation(current); });
    }
  }
})();
