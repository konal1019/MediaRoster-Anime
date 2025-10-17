import { genres, searchAnime, getGenres } from './api.js';
import { showLoader, hideLoader } from './pages.js';
import { createFlashcard } from './components/UIs.js';
import { escapeHTML, getSafeParams } from './components/utils.js';
import { loadDetailsPage } from './components/details.js';
export const status = {"searching":false}

export function initSlideshow() {
  let slideIndex = 0;
  const slides = document.querySelectorAll('.slide');
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');
  let interval;

  function showSlides() {
    slides.forEach(slide => slide.classList.remove('active'));
    if (slideIndex >= slides.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = slides.length - 1;
    slides[slideIndex].classList.add('active');
  }

  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(() => {
      slideIndex++;
      showSlides();
    }, 5000);
  }

  if (prev && next) {
    prev.addEventListener('click', () => {
      slideIndex--;
      showSlides();
      resetInterval();
    });

    next.addEventListener('click', () => {
      slideIndex++;
      showSlides();
      resetInterval();
    });
  }

  // Swipe functionality
  const slideshowContainer = document.querySelector('.slideshow-container');
  let touchstartX = 0;
  let touchendX = 0;

  function handleGesture() {
    if (touchendX < touchstartX) {
      slideIndex++;
      showSlides();
      resetInterval();
    }
    if (touchendX > touchstartX) {
      slideIndex--;
      showSlides();
      resetInterval();
    }
  }

  slideshowContainer.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
  });

  slideshowContainer.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    handleGesture();
  });
  showSlides();
  resetInterval();
}

export function initFlashcardHover() {
  const flashcards = document.querySelectorAll('.flashcard-link:not([data-hover-initialized])');
  function removeHover(card) {
    const synopsisOverlay = card.querySelector('.flashcard-synopsis-overlay');
    if (synopsisOverlay) {
      synopsisOverlay.classList.add('fade-out');
      synopsisOverlay.addEventListener('transitionend', () => {
        synopsisOverlay.remove();
        delete card.dataset.overlayAdded;
      }, {
        once: true
      });
    } else {
      delete card.dataset.overlayAdded;
    }
  };
  function addHover(card) {
    if (card.dataset.overlayAdded) {
      return;
    }
    card.dataset.overlayAdded = 'true';

    const synopsis = card.dataset.synopsis;

    const synopsisOverlay = document.createElement('div');
    synopsisOverlay.classList.add('flashcard-synopsis-overlay');
    synopsisOverlay.innerHTML = `
      <p>${synopsis}</p>
      <a href="${card.href}" class="synopsis-details-link">...</a>
    `;

    card.querySelector('.flashcard').appendChild(synopsisOverlay);
  }
  flashcards.forEach(card => {
    if (card.dataset.hoverInitialized == 'true') {
      return;
    }
    card.dataset.hoverInitialized = 'true';
    card.addEventListener('mouseenter', () => addHover(card))
    card.addEventListener('mouseleave', () => removeHover(card))
    card.addEventListener('touchstart', () => addHover(card))
    card.addEventListener('touchend', () => removeHover(card))
  });
}

export function initGalleryControls() {
  const content = document.getElementById('content');
  content.addEventListener('click', (event) => {
      const prevButton = event.target.closest('.gallery-prev');
      const nextButton = event.target.closest('.gallery-next');
      if (prevButton) {
          const gallery = prevButton.parentElement.querySelector('.horizontal-gallery');
          gallery.scrollBy({
              left: -400,
              behavior: 'smooth'
          });
      }
      if (nextButton) {
          const gallery = nextButton.parentElement.querySelector('.horizontal-gallery');
          gallery.scrollBy({
              left: 400,
              behavior: 'smooth'
          });
      }
  });
}
// random
export function randomAnime() {
  const randomButton = document.getElementById('random-anime-button');
  randomButton.addEventListener('click', () => {
    const chance = Math.floor(Math.random() * 100);
    if (chance < 1) {
      triggerJumpscare();
    } else {
      window.location.hash = '#/details-random'
    }
  });
}

function triggerJumpscare() {
  const header = document.querySelector('header');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const loader = document.getElementById('loader');

  if (header) header.style.display = 'none';
  if (main) main.style.display = 'none';
  if (footer) footer.style.display = 'none';
  if (loader) loader.style.display = 'none';

  const jumpscareContainer = document.createElement('div');
  jumpscareContainer.id = 'jumpscare-container';

  const jumpscareImage = document.createElement('img');
  jumpscareImage.src = './media/jumpscare.jpg';
  jumpscareImage.id = 'jumpscare-image';

  const jumpscareAudio = new Audio('./media/jumpscare.mp3');

  jumpscareContainer.appendChild(jumpscareImage);
  document.body.appendChild(jumpscareContainer);

  if (jumpscareContainer.requestFullscreen) {
    jumpscareContainer.requestFullscreen();
  }

  jumpscareAudio.play().catch(e => console.error("Couldn't play jumpscare audio, maybe it's missing?"));

  setTimeout(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    jumpscareContainer.remove();
    window.location.href = './';
  }, 3000);
}
export const activeFilters = {};

// ---------- FILTER / SEARCH UTILITIES ----------

export function initFilters() {
    const filterButton = document.querySelector('.filter-button');
    const filterOptions = document.querySelector('.filter-options');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterInputs = document.querySelectorAll('.filter-input');
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');

    filterButton.addEventListener('click', () => {
        filterOptions.style.display = filterOptions.style.display === 'none' ? 'grid' : 'none';
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            const value = btn.dataset.value;
            const singleSelectGroups = ["season", "status", "type", "rating"];

            if (singleSelectGroups.includes(filter)) {
                document.querySelectorAll(`.filter-btn[data-filter="${filter}"]`).forEach(b => b.classList.remove('active'));
                if (activeFilters[filter] !== value) {
                    activeFilters[filter] = value;
                    btn.classList.add('active');
                } else {
                    delete activeFilters[filter];
                }
            } else {
                if (activeFilters[filter] && activeFilters[filter].includes(value)) {
                    activeFilters[filter] = activeFilters[filter].filter(v => v !== value);
                    if (!activeFilters[filter].length) delete activeFilters[filter];
                    btn.classList.remove('active');
                } else {
                    if (!activeFilters[filter]) activeFilters[filter] = [];
                    activeFilters[filter].push(value);
                    btn.classList.add('active');
                }
            }
        });
    });

    filterInputs.forEach(input => {
        input.addEventListener('input', () => {
            const filter = input.id;
            const value = input.value;
            if (value) activeFilters[filter] = value;
            else delete activeFilters[filter];
        });
    });

    filterDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', () => {
            const filter = dropdown.id;
            const value = dropdown.value;
            if (value) activeFilters[filter] = value;
            else delete activeFilters[filter];
        });
    });
    const sfw = document.getElementById('sfw-checkbox');
    sfw.addEventListener('change', () => {
        activeFilters.sfw = true;
    });
}

export async function renderGenres() {
    if (JSON.stringify(genres) === '{}') await getGenres();

    const content = Object.entries(genres).map(([key, value]) => `
        <button class="genre-btn" data-filter="genres" data-value="${key}">${value}</button>
    `).join('');

    const genresDiv = document.getElementById('genresDiv');
    genresDiv.innerHTML += content;

    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            const value = btn.dataset.value;

            if (activeFilters[filter] && activeFilters[filter].includes(value)) {
                activeFilters[filter] = activeFilters[filter].filter(v => v !== value);
                if (!activeFilters[filter].length) delete activeFilters[filter];
                btn.classList.remove('active');
            } else {
                if (!activeFilters[filter]) activeFilters[filter] = [];
                activeFilters[filter].push(value);
                btn.classList.add('active');
            }
        });
    });
}

// ---------- SEARCH ----------

export async function initSearch() {
    applyFilters();

    const searchBtn = document.getElementById('search-button');
    if (searchBtn) searchBtn.addEventListener('click', () => {
        delete activeFilters['page'];
        constructURL(true);
    });

    const searchIn = document.getElementById('search-input');
    searchIn.addEventListener('input', () => {
        activeFilters.q = searchIn.value; // store raw input; sanitized via getSafeParams later
    });
    searchIn.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            delete activeFilters['page'];
            constructURL(true);
        }
    });

    const params = getSafeParams(); // always sanitize from URL/hash
    if (params.toString()) handleSearch(false);
}

async function handleSearch(updateURL = true) {
    const url = await constructURL(updateURL);
    if (url) {
        const results = await searchAnime(url);
        displaySearchResults(results);
    }
}

export async function constructURL(updateURL = false) {
    const baseURL = 'https://api.jikan.moe/v4/anime';
    const params = new URLSearchParams();

    for (const filter in activeFilters) {
        let value = activeFilters[filter];
        if (filter === 'q') {
            value = value.replace(/[^\p{L}\p{N}\s\-_.:'"|#]/gu, '').slice(0, 100);
        }
        if (Array.isArray(value)) params.append(filter, value.join(','));
        else params.append(filter, value);
    }

    if (!params.toString()) return null;

    const JikanURL = `${baseURL}?${params.toString()}`;
    if (updateURL) window.location.hash = `#/search?${params.toString()}`;
    return JikanURL;
}

export function applyFilters() {
    for (const key in activeFilters) delete activeFilters[key];
    document.querySelectorAll('[class*="active"]').forEach(el => el.classList.remove('active'));

    const params = getSafeParams(); // sanitize from URL/hash
    const IdFilters = ['order_by', 'sort', 'min_score', 'max_score'];

    for (const [key, value] of params.entries()) {
        if (key === 'q') {
            const input = document.getElementById('search-input');
            if (input) input.value = value;
            activeFilters.q = value;
        } else if (key === 'genres') {
            activeFilters[key] = [];
            value.split(',').forEach(v => {
                const btn = document.querySelector(`[data-filter='${key}'][data-value='${v}']`);
                if (btn) {
                    btn.classList.add('active');
                    activeFilters[key].push(v);
                }
            });
        } else if (key === 'page') activeFilters[key] = value;
        else if (key in IdFilters) {
            const elem = document.getElementById(key);
            if (elem) elem.value = value;
        } else {
            const elem = document.querySelector(`[data-filter='${key}'][data-value='${value}']`);
            if (elem) elem.classList.add('active');
            activeFilters[key] = value;
        }
    }
}

// ---------- PAGINATION ----------

function loadPagination(paginationData, containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    const { current_page, last_visible_page, has_next_page } = paginationData;

    const createButton = (text, page, enabled) => {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        btn.disabled = !enabled;
        if (enabled) {
            btn.addEventListener('click', () => {
                const params = getSafeParams();
                params.set('page', page);
                window.location.hash = `#/search?${params.toString()}`;
            });
        }
        return btn;
    };

    containerEl.appendChild(createButton('<<', 1, current_page > 1));
    containerEl.appendChild(createButton('<', current_page - 1, current_page > 1));

    const pageIndicator = document.createElement('span');
    pageIndicator.textContent = current_page;
    containerEl.appendChild(pageIndicator);

    containerEl.appendChild(createButton('>', current_page + 1, has_next_page));
    containerEl.appendChild(createButton('>>', last_visible_page, current_page < last_visible_page));
}

// ---------- DISPLAY RESULTS ----------

export async function displaySearchResults(searchResults) {
    const container = document.getElementById('search-results');
    if (!container) return;

    container.innerHTML = '';
    const defaultContent = document.getElementById('default-search-content');
    if (defaultContent) defaultContent.style.display = 'none';

    if (!searchResults?.data?.length) {
        container.innerHTML = '<p class="no-results">No Matching results found.</p>';
        status.searching = false;
        hideLoader();
        return;
    }

    const infoHeader = document.createElement('h2');
    infoHeader.className = 'search-results-info';
    infoHeader.textContent = `Found ${searchResults.pagination.items.total} results`;
    container.appendChild(infoHeader);

    const grid = document.createElement('div');
    grid.className = 'gridGallery';
    grid.innerHTML = searchResults.data.map(anime => createFlashcard(anime, 'top-rated')).join('');
    container.appendChild(grid);

    const pagination = document.createElement('div');
    pagination.className = 'pagination-controls';
    container.appendChild(pagination);

    initFlashcardHover();
    loadPagination(searchResults.pagination, pagination);
}
