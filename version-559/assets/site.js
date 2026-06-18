(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function showHero(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function startHero() {
            timer = window.setInterval(function () {
                showHero(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        startHero();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            var q = input.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .wide-card, .rank-card'));
            cards.forEach(function (card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '') + ' ' + card.textContent).toLowerCase();
                card.classList.toggle('is-hidden', q && text.indexOf(q) === -1);
            });
        });
    });

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    function initPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-overlay');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-src');
        var attached = false;
        var hlsInstance = null;

        function playVideo() {
            if (!source) {
                return;
            }
            shell.classList.add('is-playing');
            if (attached) {
                var replay = video.play();
                if (replay && typeof replay.catch === 'function') {
                    replay.catch(function () {});
                }
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                var nativePlay = video.play();
                if (nativePlay && typeof nativePlay.catch === 'function') {
                    nativePlay.catch(function () {});
                }
                return;
            }
            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        var hlsPlay = video.play();
                        if (hlsPlay && typeof hlsPlay.catch === 'function') {
                            hlsPlay.catch(function () {});
                        }
                    });
                } else {
                    video.src = source;
                    var fallbackPlay = video.play();
                    if (fallbackPlay && typeof fallbackPlay.catch === 'function') {
                        fallbackPlay.catch(function () {});
                    }
                }
            });
        }

        shell.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            playVideo();
        });

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('is-playing');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
