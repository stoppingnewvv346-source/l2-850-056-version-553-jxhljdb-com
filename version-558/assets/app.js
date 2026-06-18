(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.getElementById('main-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var index = 0;
    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  function setupFilters() {
    var panels = selectAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-year-filter]');
      var grid = panel.parentElement.querySelector('.searchable-grid');
      if (!grid) {
        return;
      }
      var cards = selectAll('.movie-card', grid);
      var years = [];
      cards.forEach(function (card) {
        var value = card.getAttribute('data-year');
        if (value && years.indexOf(value) === -1) {
          years.push(value);
        }
      });
      years.sort().reverse().forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        year.appendChild(option);
      });
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (input && query) {
        input.value = query;
      }
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.getAttribute('data-year'),
            card.textContent
          ].join(' ').toLowerCase();
          var matchText = !q || text.indexOf(q) !== -1;
          var matchYear = !y || card.getAttribute('data-year') === y;
          card.classList.toggle('is-filter-hidden', !(matchText && matchYear));
        });
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      apply();
    });
  }

  window.setupPlayer = function (src) {
    var video = document.getElementById('main-player');
    var button = document.querySelector('[data-player-button]');
    var loaded = false;
    if (!video || !src) {
      return;
    }
    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    }
    function play() {
      attach();
      if (button) {
        button.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    attach();
    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
