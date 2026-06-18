(function () {
  var activeClass = "is-active";

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function bindMenu() {
    var button = document.querySelector(".menu-button");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle(activeClass, slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle(activeClass, dotIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function bindFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".movie-search-input");
      var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
      var cards = Array.prototype.slice.call(panel.querySelectorAll(".movie-card"));
      var empty = panel.querySelector(".empty-state");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";

      if (input && initial) {
        input.value = initial;
      }

      function filter() {
        var keyword = input ? normalize(input.value) : "";
        var chip = panel.querySelector(".filter-chip.is-active");
        var chipValue = chip ? normalize(chip.getAttribute("data-filter")) : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchChip = !chipValue || haystack.indexOf(chipValue) !== -1;
          var matched = matchKeyword && matchChip;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", filter);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          filter();
        });
      });

      filter();
    });
  }

  function bindPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      var url = shell.getAttribute("data-play");
      var loaded = false;
      var hls = null;

      if (!video || !cover || !url) {
        return;
      }

      function attach() {
        if (loaded) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          shell.hlsPlayer = hls;
        } else {
          video.src = url;
        }
        loaded = true;
      }

      function play() {
        attach();
        cover.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      cover.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });
      video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
      });
    });
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindFilters();
    bindPlayers();
  });
})();
