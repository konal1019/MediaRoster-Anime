import { status, initSlideshow, initFlashcardHover, randomAnime, initFilters, renderGenres, initSearch, applyFilters} from '../main.js';
import { searchAnime, getTopRatedAnime, getMostPopularAnime, getGenres, genres } from '../api.js';
import { createSection, createFlashcard } from './UIs.js';
import { loadCSS, showLoader, hideLoader } from '../pages.js'
import { getSafeParams} from './utils.js';

export async function loadSearchPage() {
    const currentHash = window.location.hash;
    loadCSS('./css/search.css');
    console.log('Loading Search Page');
    document.getElementById('navsearch').style.color = '#8960ff';
    document.getElementById('navhome').style.color = '#ddd';
    if (JSON.stringify(genres) === '{}') {
      getGenres();
    }
    const content = document.getElementById('content');
    content.innerHTML = `
    <h1 class="search-title">Search across our databases and make your pick!</h1>
    <div class="search-container">
        <div class="search-bar">
            <button class="filter-button"><i class="fas fa-filter"></i> Filters</button>
            <div class="search-bar-content">
                <input type="text" id="search-input" placeholder="Search for anime...">
                <button id="search-button"><i class="fas fa-search"></i></button>
            </div>
        </div>
        <div class="filter-options" style="display: none;">
            <h2 class='filter-title'>Filter Options</h2>
            <div class="filter-section">
                <div class="filter-controls">
                    <h4 class="filter-header">Type:</h4>
                    <div class="filter-buttons">
                        <button class="filter-btn" data-filter="type" data-value="tv">TV</button>
                        <button class="filter-btn" data-filter="type" data-value="movie">Movie</button>
                        <button class="filter-btn" data-filter="type" data-value="ova">OVA</button>
                        <button class="filter-btn" data-filter="type" data-value="special">Special</button>
                        <button class="filter-btn" data-filter="type" data-value="ona">ONA</button>
                        <button class="filter-btn" data-filter="type" data-value="music">Music</button>
                    </div>
                </div>
            </div>
            <div class="filter-section">
                <div class="filter-controls">
                    <h4 class="filter-header">Status:</h4>
                    <div class="filter-buttons">
                        <button class="filter-btn" data-filter="status" data-value="airing">Airing</button>
                        <button class="filter-btn" data-filter="status" data-value="complete">Completed</button>
                        <button class="filter-btn" data-filter="status" data-value="upcoming">Upcoming</button>
                    </div>
                </div>
            </div>
            <div class="filter-section">
                <div class="filter-controls">
                    <h4 class="filter-header">Rating:</h4>
                    <div class="filter-buttons">
                        <button class="filter-btn" data-filter="rating" data-value="g">G - All Ages</button>
                        <button class="filter-btn" data-filter="rating" data-value="pg">PG - Children</button>
                        <button class="filter-btn" data-filter="rating" data-value="pg13">PG-13 - Teens 13+</button>
                        <button class="filter-btn" data-filter="rating" data-value="r17">R - 17+ (violence)</button>
                        <button class="filter-btn" data-filter="rating" data-value="r">R+ - Mild Nudity</button>
                        <button class="filter-btn" data-filter="rating" data-value="rx">Rx - Hentai</button>
                    </div>
                </div>
            </div>
            <div class="filter-section">
                <div class="filter-controls">
                    <h4 class="filter-header">Score:</h4>
                    <input type="number" class="filter-input" placeholder="Min Score" id="min_score" min="0" max="10" step="0.1">
                    <input type="number" class="filter-input" placeholder="Max Score" id="max_score" min="0" max="10" step="0.1">
                </div>
            </div>
            <div class="filter-section">
                <div class="filter-controls">
                    <h4 class="filter-header">Season:</h4>
                    <div class="filter-buttons">
                        <button class="filter-btn" data-filter="season" data-value="winter">Winter</button>
                        <button class="filter-btn" data-filter="season" data-value="spring">Spring</button>
                        <button class="filter-btn" data-filter="season" data-value="summer">Summer</button>
                        <button class="filter-btn" data-filter="season" data-value="fall">Fall</button>
                    </div>
                </div>
            </div>
            <div class="filter-section">
                <h4 class="filter-header">Genres:</h4>
                <div class= "filter-buttons" id="genresDiv">
                </div>
            </div>
            <div class="filter-section">
                <div class="filter-controls">
                    <h4 class="filter-header">Order By:</h4>
                    <select id="order_by" class="filter-dropdown">
                        <option value="score">Score</option>
                        <option value="members">Members</option>
                        <option value="popularity">Popularity</option>
                        <option value="title">A-Z</option>
                        <option value="favorites">Favorites</option>
                        <option value="episodes">Episodes</option>
                    </select>
                    <h4 class="filter-header">Sort Direction:</h4>
                    <select id="sort" class="filter-dropdown">
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>
            <div class="sfw-toggle">
                <label class="switch">
                    <input type="checkbox" id="sfw-checkbox" checked>
                    <span class="slider round"></span>
                </label>
                <span>Allow NSFW content</span>
            </div>
        </div>
    </div>
    <div id="search-results"></div>
    `;
    showLoader();
    initSearch();
    initFilters();
  
    const [path, query] = currentHash.split('?');
    if (path === '#/search' && !query) {
      const searchResultsContainer = document.getElementById('search-results');
      if (searchResultsContainer) {
        if (currentHash !== '#/search') return;
        const topRatedSection = await createSection({
          title: 'Top Rated Anime',
          apiFunction: getTopRatedAnime,
          cardType: 'top-rated',
          containerClass: 'airing-container',
          titleClass: 'airing-title',
          galleryClass: 'gridGallery'
        });
        if (currentHash !== '#/search') return;
        searchResultsContainer.innerHTML += topRatedSection;
        if (currentHash !== '#/search') return;
        const mostPopularSection = await createSection({
          title: 'Most Popular Anime',
          apiFunction: getMostPopularAnime,
          cardType: 'most-popular',
          containerClass: 'airing-container',
          titleClass: 'airing-title',
          galleryClass: 'gridGallery'
        });
        if (currentHash !== '#/search') return;
        searchResultsContainer.innerHTML += mostPopularSection;
      }
  
      if (currentHash === '#/search') {
        initFlashcardHover();
        document.getElementById('randomDiv').style.display = 'block';
        renderGenres();
        randomAnime();
        hideLoader();
      }
  
    } else {
      console.log(`Search initiated with query: ${query}`);
      const searchResultsContainer = document.getElementById('gridGallery');
      if (searchResultsContainer) searchResultsContainer.innerHTML = '';
      if (status.searching) {
        renderGenres();
        randomAnime();
      } else {
        status.searching = true;
        if (currentHash.split('?')[0] !== '#/search') return;
        await renderGenres();
        initSearch();
        randomAnime();
        hideLoader();
        status.searching = false;
      }
    }
  }

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