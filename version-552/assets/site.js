(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (panel) {
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var searchBox = panel.querySelector('[data-search-box]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var emptyState = scope.querySelector('[data-empty-state]');

    function valueOf(control) {
      return control ? String(control.value || 'all').toLowerCase() : 'all';
    }

    function applyFilters() {
      var keyword = searchBox ? searchBox.value.trim().toLowerCase() : '';
      var region = valueOf(regionSelect);
      var year = valueOf(yearSelect);
      var category = valueOf(categorySelect);
      var visible = 0;

      cards.forEach(function (card) {
        var text = String(card.getAttribute('data-search') || '').toLowerCase();
        var cardRegion = String(card.getAttribute('data-region') || '').toLowerCase();
        var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
        var cardCategory = String(card.getAttribute('data-category') || '').toLowerCase();
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region !== 'all' && cardRegion !== region) {
          matched = false;
        }
        if (year !== 'all' && cardYear !== year) {
          matched = false;
        }
        if (category !== 'all' && cardCategory !== category) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [searchBox, regionSelect, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchBox) {
          searchBox.value = '';
        }
        [regionSelect, yearSelect, categorySelect].forEach(function (control) {
          if (control) {
            control.value = 'all';
          }
        });
        applyFilters();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && searchBox) {
      searchBox.value = q;
    }
    applyFilters();
  });

  document.querySelectorAll('[data-home-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = form.getAttribute('action') || './library.html';
      }
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-play]');
    var source = video ? video.getAttribute('data-src') : '';
    var started = false;
    var hlsInstance = null;

    function startPlayback() {
      if (!video || !source) {
        return;
      }
      if (!started) {
        started = true;
        if (cover) {
          cover.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          startPlayback();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
