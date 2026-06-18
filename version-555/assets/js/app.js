(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    if (menuButton) {
      menuButton.addEventListener('click', function () {
        document.body.classList.toggle('menu-open');
      });
    }

    document.querySelectorAll('.hero').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      if (!slides.length) {
        return;
      }
      var index = 0;
      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });
      show(0);
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var target = panel.getAttribute('data-target') || '[data-filter-grid]';
      var grid = document.querySelector(target);
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-filter-year]');
      var category = panel.querySelector('[data-filter-category]');
      var reset = panel.querySelector('[data-filter-reset]');
      var empty = document.querySelector(panel.getAttribute('data-empty') || '');
      function valueOf(node) {
        return node ? node.value.trim().toLowerCase() : '';
      }
      function apply() {
        var q = valueOf(input);
        var y = valueOf(year);
        var c = valueOf(category);
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-category') || '',
            card.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          var okQ = !q || haystack.indexOf(q) !== -1;
          var okY = !y || (card.getAttribute('data-year') || '').toLowerCase() === y;
          var okC = !c || (card.getAttribute('data-category') || '').toLowerCase() === c;
          var ok = okQ && okY && okC;
          card.classList.toggle('hide-card', !ok);
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      }
      [input, year, category].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });
      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (year) {
            year.value = '';
          }
          if (category) {
            category.value = '';
          }
          apply();
        });
      }
      apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('[data-player-cover]');
      var playButton = shell.querySelector('[data-play-button]');
      var src = shell.getAttribute('data-video');
      var hls;
      function attach() {
        if (!video || !src) {
          return;
        }
        if (video.getAttribute('data-ready') === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
        video.setAttribute('data-ready', '1');
      }
      function start() {
        attach();
        shell.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener('click', start);
      }
      if (playButton) {
        playButton.addEventListener('click', function (event) {
          event.stopPropagation();
          start();
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
