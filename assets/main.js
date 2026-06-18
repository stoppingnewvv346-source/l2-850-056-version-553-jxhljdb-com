(function() {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    ready(function() {
        var menuButton = document.querySelector('.menu-toggle');
        var mobileNav = document.querySelector('.mobile-nav');

        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function() {
                var open = mobileNav.classList.toggle('open');
                menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        var slider = document.querySelector('[data-hero-slider]');
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
            var prev = slider.querySelector('.hero-prev');
            var next = slider.querySelector('.hero-next');
            var index = 0;
            var timer = null;

            function showSlide(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === index);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === index);
                });
            }

            function play() {
                clearInterval(timer);
                timer = setInterval(function() {
                    showSlide(index + 1);
                }, 5200);
            }

            if (prev) {
                prev.addEventListener('click', function() {
                    showSlide(index - 1);
                    play();
                });
            }
            if (next) {
                next.addEventListener('click', function() {
                    showSlide(index + 1);
                    play();
                });
            }
            dots.forEach(function(dot, dotIndex) {
                dot.addEventListener('click', function() {
                    showSlide(dotIndex);
                    play();
                });
            });
            play();
        }

        var filterRoot = document.querySelector('[data-listing-tools]');
        if (filterRoot) {
            var keyword = filterRoot.querySelector('[data-filter-keyword]');
            var year = filterRoot.querySelector('[data-filter-year]');
            var region = filterRoot.querySelector('[data-filter-region]');
            var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-list .searchable-card'));

            function applyFilters() {
                var q = (keyword && keyword.value || '').trim().toLowerCase();
                var y = year && year.value || '';
                var r = region && region.value || '';

                cards.forEach(function(card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre')
                    ].join(' ').toLowerCase();
                    var matchKeyword = !q || text.indexOf(q) !== -1;
                    var matchYear = !y || card.getAttribute('data-year') === y;
                    var matchRegion = !r || card.getAttribute('data-region') === r;
                    card.style.display = matchKeyword && matchYear && matchRegion ? '' : 'none';
                });
            }

            [keyword, year, region].forEach(function(input) {
                if (input) {
                    input.addEventListener('input', applyFilters);
                    input.addEventListener('change', applyFilters);
                }
            });
        }

        var searchApp = document.querySelector('[data-search-app]');
        if (searchApp && window.MOVIE_INDEX) {
            var searchInput = searchApp.querySelector('[data-search-input]');
            var searchButton = searchApp.querySelector('[data-search-button]');
            var results = document.querySelector('[data-search-results]');
            var presets = Array.prototype.slice.call(document.querySelectorAll('[data-search-preset]'));

            function cardTemplate(movie) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster-wrap" href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">',
                    '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '<span class="poster-shade"></span>',
                    '<span class="duration">' + escapeHtml(movie.duration) + '</span>',
                    '</a>',
                    '<div class="card-body">',
                    '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
                    '<p>' + escapeHtml(movie.oneLine) + '</p>',
                    '<div class="meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
                    '</div>',
                    '</article>'
                ].join('');
            }

            function escapeHtml(value) {
                return String(value || '')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            }

            function runSearch() {
                var q = (searchInput.value || '').trim().toLowerCase();
                var list = window.MOVIE_INDEX.filter(function(movie) {
                    if (!q) {
                        return movie.hot;
                    }
                    return movie.searchText.indexOf(q) !== -1;
                }).slice(0, 96);
                results.innerHTML = list.map(cardTemplate).join('');
            }

            searchButton.addEventListener('click', runSearch);
            searchInput.addEventListener('input', runSearch);
            presets.forEach(function(button) {
                button.addEventListener('click', function() {
                    searchInput.value = button.getAttribute('data-search-preset');
                    runSearch();
                });
            });

            var params = new URLSearchParams(window.location.search);
            if (params.get('q')) {
                searchInput.value = params.get('q');
            }
            runSearch();
        }
    });
})();
