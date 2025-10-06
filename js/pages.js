import { status, initSlideshow, initFlashcardHover, randomAnime, initFilters, renderGenres, initSearch, displaySearchResults, applyFilters } from './main.js';
import { searchAnime, getTopRatedAnime, getMostPopularAnime, getAiringAnime, getSeasonalAnime, getGenres, genres, getAnimeInfo } from './api.js';
import { createSection, createFlashcard } from './components/UIs.js';
import { loadSearchPage } from './components/search.js';
import { escapeHTML } from './components/utils.js';
import { reccomendedData} from './components/data.js'

// ====== PAGE ROUTING ======
export function loadPageContent(pageName) {
  hideLoader();
  document.getElementById('randomDiv').style.display = 'none';
  if (pageName === 'home') loadHomePage();
  else if (pageName === 'search') loadSearchPage();
  else if (pageName === 'portfolio') window.location.href = 'https://github.com/konal1019';
  else load404();
}

// ====== LOADER ======
let loaderTimeout;
export function showLoader() {
  const loaderContainer = document.getElementById('loader');
  if (loaderContainer) {
    loaderContainer.innerHTML = `
      <div class="loader"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
    loaderContainer.style.display = 'flex';
    loaderTimeout = setTimeout(() => {
      loaderContainer.innerHTML += `<div class="loader-text">Looks like our servers are facing high traffic, please have patience.</div>`;
    }, 10000);
  }
}
export function hideLoader() {
  const loaderContainer = document.getElementById('loader');
  if (loaderContainer) {
    clearTimeout(loaderTimeout);
    loaderContainer.innerHTML = '';
    loaderContainer.style.display = 'none';
  }
}
export function loadCSS(filename) {
  const existingLink = document.querySelector(`link[href="${filename}"]`);
  if (!existingLink) {
    const link = document.createElement('link');
    link.href = filename;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
}

// ====== HOME PAGE ======
export async function loadHomePage() {
  const currentHash = window.location.hash;
  console.log('Loading Home Page');
  document.getElementById('navhome').style.color = '#8960ff';
  document.getElementById('navsearch').style.color = '#ddd';
  const content = document.getElementById('content');

  showLoader();

  const slideshowHTML = `
    <h3 class="recommendations-title">Check Out My Recommendations</h3>
    <div class="slideshow-container">
      ${reccomendedData.map((anime, i) => `
        <div class="slide ${i === 0 ? 'active' : ''}" id="rec-${anime.mal_id}" data-mal-id="${anime.mal_id}">
          <div class="slide-column-left">
            <img src="${anime.images.large_image}" alt="${anime.title}">
          </div>
          <div class="slide-column-right">
            <div class="slide-content">
              <h2 class="slide-title">${anime.title}</h2>
              <p class="slide-description">${anime.synopsis.substring(0, 250)}...</p>
              <div class="slide-details">
                <span><i class="fas fa-play-circle"></i> ${anime.episodes} Episodes</span>
                <span><i class="fas fa-star"></i> ${anime.score}</span>
                <span><i class="fas fa-users"></i> ${anime.members.toLocaleString()}</span>
                <span><i class="fas fa-trophy"></i> Rank: #${anime.rank}</span>
              </div>
              <a href="./#/details-${anime.mal_id}" class="slide-button">View Details</a>
            </div>
          </div>
        </div>
      `).join('')}
      <a class="prev"><</a>
      <a class="next">></a>
    </div>
  `;
  if (currentHash !== '' && currentHash !== '#/') return;
  content.innerHTML = slideshowHTML;

  const sections = [
    { title: 'Top Rated Anime', apiFunction: getTopRatedAnime, cardType: 'top-rated', containerClass: 'top-rated-container', titleClass: 'top-rated-title', galleryClass: 'horizontal-gallery' },
    { title: 'Most Popular Anime', apiFunction: getMostPopularAnime, cardType: 'most-popular', containerClass: 'top-rated-container', titleClass: 'top-rated-title', galleryClass: 'horizontal-gallery' },
    { title: 'Currently Airing Anime', apiFunction: getAiringAnime, cardType: 'airing', containerClass: 'airing-container', titleClass: 'airing-title', galleryClass: 'gridGallery' },
    { title: 'Anime This Season', apiFunction: getSeasonalAnime, cardType: 'seasonal', containerClass: 'airing-container', titleClass: 'airing-title', galleryClass: 'gridGallery' }
  ];

  for (const section of sections) {
    if (window.location.hash !== '' && window.location.hash !== '#/') return;
    const sectionHTML = await createSection(section);
    if (window.location.hash === '' || window.location.hash === '#/') {
      content.innerHTML += sectionHTML;
    }
  }

  if (window.location.hash === '' || window.location.hash === '#/') {
    const randomDiv = document.getElementById('randomDiv');
    randomDiv.style.display = 'block';
    updateSlides();
    hideLoader();
    initSlideshow();
    initFlashcardHover();
    randomAnime();
    getGenres();
    console.log('Home page loaded');
  }
}

async function updateSlides() {
  const slides = document.querySelectorAll('.slide[data-mal-id]');
  for (const slide of slides) {
    if (window.location.hash !== '' && window.location.hash !== '#/') break;
    const mal_id = slide.dataset.malId;
    try {
      const data = await getAnimeInfo(mal_id);
      if (!data) continue;
      if (window.location.hash !== '' && window.location.hash !== '#/') break;

      const updated = `
        <div class="slide-column-left">
          <img src="${data.images.jpg.large_image_url}" alt="${data.title}">
        </div>
        <div class="slide-column-right">
          <div class="slide-content">
            <h2 class="slide-title">${escapeHTML(data.title)}</h2>
            <p class="slide-description">${escapeHTML(data.synopsis?.substring(0, 250) || 'No description')}...</p>
            <div class="slide-details">
              <span><i class="fas fa-play-circle"></i> ${data.episodes || 'N/A'} Episodes</span>
              <span><i class="fas fa-star"></i> ${data.score || 'N/A'}</span>
              <span><i class="fas fa-users"></i> ${(data.members || 0).toLocaleString()}</span>
              <span><i class="fas fa-trophy"></i> Rank: #${data.rank || 'N/A'}</span>
            </div>
            <a href="./#/details-${data.mal_id}" class="slide-button">View Details</a>
          </div>
        </div>
      `;
      slide.innerHTML = updated;
    } catch (e) {
      console.warn('Failed to update slide:', e);
    }
  }
}

// ====== 404 ======
export function load404(path) {
  const currentHash = window.location.hash;
  if (currentHash.substring(1) !== path) return;
  console.log('Loading 404 Page');
  document.getElementById('navhome').style.color = '#ddd';
  document.getElementById('navsearch').style.color = '#ddd';
  const content = document.getElementById('content');
  hideLoader();

  content.innerHTML = `
    <div class="not-found-container">
      <div class="not-found-text">404</div>
      <h2>Oops! Page Not Found</h2>
      <p>The page you're looking for at <code>${path}</code> doesn't exist.</p>
      <p>Redirecting to homepage in <span id="countdown">5</span> seconds...</p>
      <a href="./#/" class="btn-home">Back to Home</a>
    </div>
  `;

  let countdown = 5;
  const countdownElement = document.getElementById('countdown');
  const interval = setInterval(() => {
    countdown--;
    if (countdownElement) countdownElement.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(interval);
      window.location.href = './#/';
    }
  }, 1000);
  window.addEventListener('hashchange', () => clearInterval(interval), { once: true });
}
