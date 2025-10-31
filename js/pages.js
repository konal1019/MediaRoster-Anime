import { initSlideshow, initFlashcardHover, randomAnime,  initGalleryControls } from './main.js';
import { searchAnime, getTopRatedAnime, getMostPopularAnime, getAiringAnime, getSeasonalAnime, getGenres, genres, getAnimeInfo } from './api.js';
import { createSection } from './components/UIs.js';
import { loadSearchPage } from './components/search.js';
import { escapeHTML } from './components/utils.js';
import { reccomendedData} from './components/data.js'

// ====== PAGE ROUTING ======
export function loadPageContent(pageName) {
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
    clearTimeout(loaderTimeout);
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
  console.log(reccomendedData[1].synopsis)
  const slideshowHTML = `
  <div class="slideshow-container">
    ${reccomendedData.map((anime, i) => `
      <div class="slide ${i === 0 ? 'active' : ''}" id="rec-${anime.mal_id}" data-mal-id="${anime.mal_id}">
        <picture>
          <source media="(min-width: 601px)" srcset="${anime.images.PC_image}">
          <img class="hero-background" src="${anime.images.large_image}" alt="${anime.title} background">
        </picture>
        <div class="slide-fade"></div>
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
          <a href="${anime.images.source}" target="_blank" class="slide-source">Original image</a>
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
    initGalleryControls();
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
      const recData = reccomendedData.find(rec => rec.mal_id == mal_id);
      const pcImage = recData ? recData.images.PC_image : data.images.jpg.large_image_url;
      const mobileImage = data.images.jpg.large_image_url;

      const title = data.title_english || data.title;
      const description = data.synopsis?.substring(0, 250) || 'No description' + '...';
      const episodes = data.episodes || 'N/A';
      const score = data.score || 'N/A';
      const members = (data.members || 0).toLocaleString();
      const rank = data.rank || 'N/A';

      const imgElem = slide.querySelector('img.hero-background');
      const srcElem = slide.querySelector('source');
      const titleElem = slide.querySelector('.slide-title');
      const descElem = slide.querySelector('.slide-description');
      const detailsElem = slide.querySelector('.slide-details');
      const linkElem = slide.querySelector('.slide-button');

      if (!imgElem || !srcElem || !titleElem || !descElem || !detailsElem || !linkElem) {
        slide.innerHTML = `
          <picture>
            <source media="(min-width: 601px)" srcset="${pcImage}">
            <img class="hero-background" src="${mobileImage}" alt="${title} background">
          </picture>
          <div class="slide-fade"></div>
          <div class="slide-content">
            <h2 class="slide-title">${title}</h2>
            <p class="slide-description">${description}</p>
            <div class="slide-details">
              <span><i class="fas fa-play-circle"></i> ${episodes} Episodes</span>
              <span><i class="fas fa-star"></i> ${score}</span>
              <span><i class="fas fa-users"></i> ${members}</span>
              <span><i class="fas fa-trophy"></i> Rank: #${rank}</span>
            </div>
            <a href="./#/details-${data.mal_id}" class="slide-button">View Details</a>
          </div>
        `;
        continue;
      }

      if (srcElem.srcset !== pcImage) srcElem.srcset = pcImage;
      if (imgElem.src !== mobileImage) imgElem.src = mobileImage;
      if (titleElem.textContent !== title) titleElem.textContent = title;
      if (descElem.textContent !== description) descElem.textContent = description;

      const newDetailsHTML = `
        <span><i class="fas fa-play-circle"></i> ${episodes} Episodes</span>
        <span><i class="fas fa-star"></i> ${score}</span>
        <span><i class="fas fa-users"></i> ${members}</span>
        <span><i class="fas fa-trophy"></i> Rank: #${rank}</span>
      `;
      if (detailsElem.innerHTML.trim() !== newDetailsHTML.trim()) {
        detailsElem.innerHTML = newDetailsHTML;
      }

      const newHref = `./#/details-${data.mal_id}`;
      if (linkElem.getAttribute('href') !== newHref) {
        linkElem.setAttribute('href', newHref);
      }
    } catch (e) {
      console.warn('Failed to update slide:', e);
    }
  }
}

// WARNING!!! : this one was AI:
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
