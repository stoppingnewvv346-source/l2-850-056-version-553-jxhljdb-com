(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function initFilters() {
        var input = document.querySelector('[data-filter-input]');
        var select = document.querySelector('[data-filter-select]');
        var list = document.querySelector('[data-filter-list]');
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input.hasAttribute('data-autofocus-from-query')) {
            input.value = q;
        }

        function apply() {
            var query = normalize(input.value);
            var year = select ? normalize(select.value) : '';
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchYear = !year || text.indexOf(year) !== -1;
                card.classList.toggle('is-hidden', !(matchQuery && matchYear));
            });
        }

        input.addEventListener('input', apply);
        if (select) {
            select.addEventListener('change', apply);
        }
        apply();
    }

    function attachStream(video, src) {
        if (!video || !src) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (video._streamController) {
                video._streamController.destroy();
            }
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                var playback = video.play();
                if (playback && playback.catch) {
                    playback.catch(function () {});
                }
            });
            video._streamController = hls;
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return;
        }
        video.src = src;
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player-src]'));
        players.forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.play-overlay');
            var src = box.getAttribute('data-player-src');
            var started = false;

            function start() {
                if (!started) {
                    attachStream(video, src);
                    started = true;
                }
                box.classList.add('is-started');
                var playback = video.play();
                if (playback && playback.catch) {
                    playback.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', start);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!started) {
                        start();
                    }
                });
                video.addEventListener('play', function () {
                    box.classList.add('is-started');
                });
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
