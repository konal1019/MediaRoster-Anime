import { genres, searchAnime, getGenres } from './api.js';
import { showLoader, hideLoader, createFlashcardHTML } from './pages.js';
export const status = {"searching":false}

export function initSlideshow() {
  let slideIndex = 0;
  const slides = document.querySelectorAll('.slide');
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');

  function showSlides() {
    slides.forEach(slide => slide.classList.remove('active'));
    if (slideIndex >= slides.length) {
      slideIndex = 0;
    }
    if (slideIndex < 0) {
      slideIndex = slides.length - 1;
    }
    slides[slideIndex].classList.add('active');
  }

  if (prev && next) {
    prev.addEventListener('click', () => {
      slideIndex--;
      showSlides();
    });

    next.addEventListener('click', () => {
      slideIndex++;
      showSlides();
    });
  }

  showSlides();

  setInterval(() => {
    slideIndex++;
    showSlides();
  }, 5000);
}

export function initFlashcardHover() {
  const flashcards = document.querySelectorAll('.flashcard-link:not([data-hover-initialized])');
  flashcards.forEach(card => {
    if (card.hoverInitialized == 'true') {
      return;
    }
    card.dataset.hoverInitialized = 'true';
    card.addEventListener('mouseenter', () => {
      if (card.dataset.overlayAdded) {
        return;
      }
      card.dataset.overlayAdded = 'true';

      const synopsis = card.dataset.synopsis;
      const detailsUrl = card.href;

      const synopsisOverlay = document.createElement('div');
      synopsisOverlay.classList.add('flashcard-synopsis-overlay');
      synopsisOverlay.innerHTML = `
        <p>${synopsis}</p>
        <a href="${window.location.pathname}${detailsUrl.split('#')[1]}" class="synopsis-details-link">...</a>
      `;

      card.querySelector('.flashcard').appendChild(synopsisOverlay);
    });

    card.addEventListener('mouseleave', () => {
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
    });
  });
}

export function escapeHTML(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"' :
        return '&quot;';
      default:
        return '&#039;';
    }
  });
}

export function randomAnime() {
  const randomButton = document.getElementById('random-anime-button');
  randomButton.addEventListener('click', () => {
    const chance = Math.floor(Math.random() * 100);
    if (chance < 50) {
      triggerJumpscare();
    } else {
      const randomAnimeId = Math.floor(Math.random() * 10871);
      window.location.href = `${window.location.pathname}#/details-${randomAnimeId}`;
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
  jumpscareImage.src = './jumpscare.jpg';
  jumpscareImage.id = 'jumpscare-image';

  const jumpscareAudio = new Audio('./jumpscare.mp3');

  jumpscareContainer.appendChild(jumpscareImage);
  document.body.appendChild(jumpscareContainer);

  if (jumpscareContainer.requestFullscreen) {
    jumpscareContainer.requestFullscreen();
  }

  jumpscareAudio.play().catch(e => console.error("Couldn\'t play jumpscare audio, maybe it\'s missing?"));

  setTimeout(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    jumpscareContainer.remove();
    window.location.href = './';
  }, 3000);
}

export const activeFilters = {};

export function initFilters() {
    const filterButton = document.querySelector('.filter-button');
    const filterOptions = document.querySelector('.filter-options');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterInputs = document.querySelectorAll('.filter-input');
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');

    filterButton.addEventListener('click', () => {
      if (filterOptions.style.display === 'none') {
        filterOptions.style.display = 'grid';
      } else {
        filterOptions.style.display = 'none';
      }
    });

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        const value = btn.dataset.value;
        const singleSelectGroups = ["season", "status", "type", "rating"];
    
        if (singleSelectGroups.includes(filter)) {
          document.querySelectorAll(`.filter-btn[data-filter="${filter}"]`)
            .forEach(b => b.classList.remove('active'));
          if (activeFilters[filter] !== value) {
            // set only the clicked one
            activeFilters[filter] = value;
            btn.classList.add('active');
          } else {
            // remove the filter
            delete activeFilters[filter];
            btn.classList.remove('active');
          }
        } else {
          // keep multi-select behavior for other filters
          if (activeFilters[filter] && activeFilters[filter].includes(value)) {
            activeFilters[filter] = activeFilters[filter].filter(v => v !== value);
            if (activeFilters[filter].length === 0) {
              delete activeFilters[filter];
            }
            btn.classList.remove('active');
          } else {
            if (!activeFilters[filter]) {
              activeFilters[filter] = [];
            }
            activeFilters[filter].push(value);
            btn.classList.add('active');
          }
        }
    
        console.log(activeFilters);
      });
    });    
    
    filterInputs.forEach(input => {
        input.addEventListener('input', () => {
            const filter = input.id;
            const value = input.value;

            if (value) {
                activeFilters[filter] = value;
            } else {
                delete activeFilters[filter];
            }
            console.log(activeFilters);
        });
    });

    filterDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', () => {
            const filter = dropdown.id;
            const value = dropdown.value;

            if (value) {
                activeFilters[filter] = value;
            } else {
                delete activeFilters[filter];
            }
            console.log(activeFilters);
        });
    });
}

export async function renderGenres() {
  if (JSON.stringify(genres) === '{}') {
    await getGenres();
  }

  const content = Object.entries(genres).map(([key, value]) => {
    return `
        <button class="genre-btn" data-filter="genres" data-value="${key}">${value}</button>
    `;
  }).join('')

  const genresDiv = document.getElementById('genresDiv')
  genresDiv.innerHTML += content;

  const genreBtn = document.querySelectorAll('.genre-btn')
  genreBtn.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      const value = btn.dataset.value;

      if (activeFilters[filter] && activeFilters[filter].includes(value)) {
        activeFilters[filter] = activeFilters[filter].filter(v => v !== value);
        if (activeFilters[filter].length === 0) {
          delete activeFilters[filter];
        }
        btn.classList.remove('active');
      } else {
        if (!activeFilters[filter]) {
          activeFilters[filter] = [];
        }
        activeFilters[filter].push(value);
        btn.classList.add('active');
      }

      console.log(activeFilters);
    })
  });
};

export async function initSearch() {
  applyFilters();
  const searchBtn = document.getElementById('search-button');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      delete activeFilters['page']
      constructURL(true);
    });
  }

  const searchIn = document.getElementById('search-input');
  searchIn.addEventListener('input', () => {
    activeFilters.q = searchIn.value;
    console.log(activeFilters);
  });

  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  if (params.toString()) {
    handleSearch(false);
  }
}


async function handleSearch(updateURL = true) {
  console.log('handling search');
  const url = await constructURL(updateURL);
  if (url) {
    const results = await searchAnime(url);
    displaySearchResults(results);
  }
}

export async function constructURL(updateURL = false) {
  console.log('creating url for', activeFilters);
  const baseURL = 'https://api.jikan.moe/v4/anime';

  const params = new URLSearchParams();
  for (const filter in activeFilters) {
    if (Array.isArray(activeFilters[filter])) {
      params.append(filter, activeFilters[filter].join(','));
    } else {
      params.append(filter, activeFilters[filter]);
    }
  }

  if (params.toString()) {
    const JikanURL = `${baseURL}?${params.toString()}`;
    if (updateURL) {
      const hash = `#/search?${params.toString()}`;
      window.location.hash = hash;
      console.log(hash);
    }
    return JikanURL;
  }
  return null;
}

export function applyFilters() {
  console.log('applying filters');
  // Clear existing active filters
  for (const key in activeFilters) {
    delete activeFilters[key];
  }

  // un-mark all active buttons
  const activeElements = document.querySelectorAll('[class*="active"]');
  activeElements.forEach(element => {
    element.classList.remove('active');
  });

  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const IdFilters = ['order_by', 'sort', 'min_score', 'max_score'] 

  for (const [key, value] of params.entries()) {
    if (key === 'q') {
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = value;
      activeFilters.q = value;
    } else if (key === 'genres') {
      const values = value.split(',');
      activeFilters[key] = [];
      values.forEach(v => {
        const btn = document.querySelector(`[data-filter='${key}'][data-value='${v}']`);
        if (btn) {
          btn.classList.add('active');
          activeFilters[key].push(v);
        }
      });
    } else if (key==='page') {
      activeFilters[key] = value;
    } else if (key in IdFilters ) {
      const filt = document.getElementById(key)
      if (filt) {
        filt.value = value;
      }
    } else {
      const element = document.querySelector(`[data-filter='${key}'][data-value='${value}']`);
      if (element) {
        element.classList.add('active');
      }
      activeFilters[key] = value;
    }
  }
  console.log('filters applied', activeFilters);
}

function loadPagination(paginationData, containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = ''; // Clear old controls

    const { current_page, last_visible_page, has_next_page } = paginationData;

    const createButton = (text, page, enabled) => {
        const button = document.createElement('button');
        button.innerHTML = text;
        button.disabled = !enabled;
        if (enabled) {
            button.addEventListener('click', () => {
                const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
                params.set('page', page);
                window.location.hash = `#/search?${params.toString()}`;
            });
        }
        return button;
    };

    containerEl.appendChild(createButton('<<', 1, current_page > 1));
    containerEl.appendChild(createButton('<', current_page - 1, current_page > 1));

    const pageIndicator = document.createElement('span');
    pageIndicator.textContent = current_page;
    containerEl.appendChild(pageIndicator);

    containerEl.appendChild(createButton('>', current_page + 1, has_next_page));
    containerEl.appendChild(createButton('>>', last_visible_page, current_page < last_visible_page));
}

export async function displaySearchResults(searchResults) {
  const searchResultsContainer = document.getElementById('search-results');

  if (!searchResultsContainer) {
      console.error('Search results container #search-results not found!');
      return;
  }

  searchResultsContainer.innerHTML = '';
  
  const defaultContent = document.getElementById('default-search-content');
  if (defaultContent) {
      defaultContent.style.display = 'none';
  }

  if (!searchResults || !searchResults.data || searchResults.data.length === 0) {
      searchResultsContainer.innerHTML = '<p class="no-results">No Matching results found.</p>';
      status.searching = false;
      hideLoader();
      return;
  }

  const infoHeader = document.createElement('h2');
  infoHeader.className = 'search-results-info';
  infoHeader.textContent = `Found ${searchResults.pagination.items.total} results`;
  searchResultsContainer.appendChild(infoHeader);

  const gridContainer = document.createElement('div');
  gridContainer.className = 'results-grid';
  
  gridContainer.innerHTML = searchResults.data.map(anime => createFlashcardHTML(anime, 'top-rated')).join('');
  
  searchResultsContainer.appendChild(gridContainer);
  
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-controls';
  searchResultsContainer.appendChild(paginationContainer);

  initFlashcardHover();

  loadPagination(searchResults.pagination, paginationContainer);
}
