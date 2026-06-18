(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function setupSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".search-panel"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-search-input]");
      var typeSelect = panel.querySelector("[data-type-filter]");
      var regionSelect = panel.querySelector("[data-region-filter]");
      var scope = document.querySelector(panel.getAttribute("data-target") || "body") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));

      function value(el) {
        return el ? String(el.value || "").trim().toLowerCase() : "";
      }

      function apply() {
        var query = value(input);
        var type = value(typeSelect);
        var region = value(regionSelect);
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type")
          ].join(" ").toLowerCase();
          var typeText = String(card.getAttribute("data-type") || "").toLowerCase();
          var regionText = String(card.getAttribute("data-region") || "").toLowerCase();
          var matched = (!query || text.indexOf(query) !== -1) && (!type || typeText.indexOf(type) !== -1) && (!region || regionText.indexOf(region) !== -1);
          card.classList.toggle("hidden-card", !matched);
        });
      }

      [input, typeSelect, regionSelect].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
    });
  }

  function initMoviePlayer(playerSrc) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    var errorBox = document.getElementById("playerError");
    if (!video || !playerSrc) {
      return;
    }

    var loaded = false;
    var hls = null;

    function showError() {
      if (errorBox) {
        errorBox.textContent = "视频加载失败，请稍后再试";
        errorBox.classList.add("show");
      }
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }

    function startPlayback() {
      video.controls = true;
      var playback = video.play();
      if (playback && playback.catch) {
        playback.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function load() {
      if (loaded) {
        startPlayback();
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(playerSrc);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          startPlayback();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playerSrc;
        video.addEventListener("loadedmetadata", startPlayback, { once: true });
        video.load();
      } else {
        showError();
      }
    }

    function play() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      load();
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
