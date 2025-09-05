import { initSlideshow, initFlashcardHover } from './main.js';
import { getTopRatedAnime, getMostPopularAnime, getAiringAnime, getSeasonalAnime } from './api.js';

export function loadPageContent(pageName) {
  if (pageName === 'home') {
    loadHomePage();
  } else if (pageName === 'search') {
    loadSearchPage();
  } else if (pageName === 'portfolio') {
    window.location.href = 'https://github.com/konal1019';
  } else {
    load404();
  }
}

let loaderTimeout;

function showLoader() {
  const loaderContainer = document.getElementById('loader');
  if (loaderContainer) {
    loaderContainer.innerHTML = `
      <div class="loader">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;
    loaderContainer.style.display = 'flex';

    loaderTimeout = setTimeout(() => {
      loaderContainer.innerHTML += `
        <div class="loader-text">Looks like our servers are facing high traffic, please have patience.</div>
      `;
    }, 10000);
  }
}

function hideLoader() {
  const loaderContainer = document.getElementById('loader');
  if (loaderContainer) {
    clearTimeout(loaderTimeout);
    loaderContainer.innerHTML = '';
    loaderContainer.style.display = 'none';
  }
}

function createFlashcardHTML(anime, cardType) {
    const imageUrl = anime.images?.webp?.large_image_url ?? 'placeholder.png';
    const title = anime.title_english || anime.title;
    const synopsis = anime.synopsis || anime.background || 'No synopsis available.';
    const detailsUrl = `/#/details-${anime.mal_id}`;

    let overlayDetails = '';
    let badges = '';

    switch (cardType) {
        case 'top-rated':
            overlayDetails = `
                <div class="flashcard-episodes"><i class="fas fa-play-circle"></i> ${anime.episodes || 'N/A'} episodes</div>
                <div class="flashcard-status"><i class="fas fa-tv"></i> ${anime.status || 'Unknown'}</div>
            `;
            badges = `
                <div class="flashcard-rank">#${anime.rank || ''}</div>
                <div class="flashcard-rating"><i class="fas fa-star"></i> ${anime.score || 'N/A'}</div>
                <div class="flashcard-type"><i class="fas fa-video"></i> ${anime.type || 'N/A'}</div>
            `;
            break;
        case 'most-popular':
            overlayDetails = `
                <div class="flashcard-episodes"><i class="fas fa-play-circle"></i> ${anime.episodes || 'N/A'} episodes</div>
                <div class="flashcard-status"><i class="fas fa-tv"></i> ${anime.status || 'Unknown'}</div>
            `;
            badges = `
                <div class="flashcard-rank">#${anime.popularity || ''}</div>
                <div class="flashcard-rating"><i class="fa-solid fa-user-group"></i>${anime.members?.toLocaleString() || 'N/A'}</div>
                <div class="flashcard-type"><i class="fas fa-video"></i> ${anime.type || 'N/A'}</div>
            `;
            break;
        case 'airing':
            overlayDetails = `
                <div class="flashcard-studio"><i class="fa-solid fa-clapperboard"></i>${anime.studios?.map(s => s.name).join(', ') || 'Unknown'}</div>
                <div class="flashcard-status"><i class="fas fa-calendar-days"></i> ${anime.broadcast?.string || 'Unscheduled'}</div>
            `;
             badges = `
                <div class="flashcard-rank">#${anime.rank || ''}</div>
                <div class="flashcard-rating"><i class="fas fa-star"></i> ${anime.score || 'N/A'}</div>
                <div class="flashcard-type"><i class="fas fa-video"></i> ${anime.type || 'N/A'}</div>
            `;
            break;
        case 'seasonal':
             overlayDetails = `
                <div class="flashcard-episodes"><i class="fas fa-play-circle"></i> ${anime.episodes || 'N/A'} episodes</div>
                <div class="flashcard-studio"><i class="fa-solid fa-clapperboard"></i>${anime.studios?.map(s => s.name).join(', ') || 'Unknown'}</div>
            `;
             badges = `
                <div class="flashcard-rank">#${anime.rank || ''}</div>
                <div class="flashcard-rating"><i class="fas fa-star"></i> ${anime.score || 'N/A'}</div>
                <div class="flashcard-type"><i class="fas fa-video"></i> ${anime.type || 'N/A'}</div>
            `;
            break;
    }

    return `
        <a href="${detailsUrl}" class="flashcard-link" data-synopsis="${synopsis}">
            <div class="flashcard" style="background-image: url('${imageUrl}');">
                <div class="flashcard-overlay">
                    <div class="flashcard-title">${title}</div>
                    ${overlayDetails}
                </div>
                ${badges}
            </div>
        </a>
    `;
}

async function createAnimeSection({ title, apiFunction, cardType, containerClass, titleClass, galleryClass }) {
    try {
        const animeList = await apiFunction();
        if (!animeList || animeList.length === 0) {
            return `<div class="${containerClass}"><h2 class="${titleClass}">${title}</h2><p>No anime found for this category.</p></div>`;
        }

        const galleryHTML = animeList.map(anime => createFlashcardHTML(anime, cardType)).join('');

        return `
            <div class="${containerClass}">
                <h2 class="${titleClass}">${title}</h2>
                <div class="${galleryClass}">
                    ${galleryHTML}
                </div>
            </div>
        `;
    } catch (error) {
        console.error(`Failed to load ${title}:`, error);
        return `<div class="error">Failed to load ${title}. Please try again later.</div>`;
    }
}

export async function loadHomePage() {
  console.log('Loading Home Page');
  document.getElementById('navhome').style.color = '#8960ff';
  document.getElementById('navsearch').style.color = '#ddd';
  const content = document.getElementById('content');

  showLoader();

  // Hardcoded slideshow data remains for speed and simplicity
  const recommendedAnimeData = [
    {
      "mal_id": 20,
      "images": { "large_image": "https://cdn.myanimelist.net/images/anime/1141/142503l.webp" },
      "title": "Naruto",
      "synopsis": "Twelve years ago, a colossal demon fox terrorized the world...",
      "episodes": 220, "score": 8.01, "members": 3026521, "rank": 677
    },
    {
      "mal_id": 24833,
      "images": { "large_image": "https://cdn.myanimelist.net/images/anime/5/75639l.webp" },
      "title": "Assassination Classroom",
      "synopsis": "Tucked in the mountains near the elite Kunugigaoka Middle School...",
      "episodes": 22, "score": 8.07, "members": 2150297, "rank": 582
    },
    {
      "mal_id": 12445,
      "images": { "large_image": "https://cdn.myanimelist.net/images/anime/12/64435l.webp" },
      "title": "Dusk Maiden of Amnesia",
      "synopsis": "Seikyou Private Academy, built on the intrigue of traditional occult myths...",
      "episodes": 12, "score": 7.81, "members": 438526, "rank": 1048
    },
    {
      "mal_id": 1535,
      "images": { "large_image": "https://cdn.myanimelist.net/images/anime/1079/138100l.webp" },
      "title": "Death Note",
      "synopsis": "Brutal murders, petty thefts, and senseless violence pollute the human world...",
      "episodes": 37, "score": 8.62, "members": 4157989, "rank": 95
    },
    {
      "mal_id": 31240,
      "images": { "large_image": "https://cdn.myanimelist.net/images/anime/1522/128039l.webp" },
      "title": "Re:ZERO -Starting Life in Another World-",
      "synopsis": "When Subaru Natsuki leaves the convenience store...",
      "episodes": 25, "score": 8.24, "members": 2372672, "rank": 363
    },
    {
      "mal_id": 30831,
      "images": { "large_image": "https://cdn.myanimelist.net/images/anime/1895/142748l.webp" },
      "title": "KonoSuba: God's Blessing on This Wonderful World!",
      "synopsis": "After dying a laughable and pathetic death...",
      "episodes": 10, "score": 8.09, "members": 2091344, "rank": 560
    },
    {
      "mal_id": 37450,
      "images": { "large_image": "https://cdn.myanimelist.net/images/anime/1301/93586l.webp" },
      "title": "Rascal Does Not Dream of Bunny Girl Senpai",
      "synopsis": "The rare and inexplicable Puberty Syndrome is thought of as a myth...",
      "episodes": 13, "score": 8.23, "members": 1886538, "rank": 372
    },
    {
      "mal_id": 22199,
      "images": { "large_image": "https://cdn.myanimelist.net/images/anime/1429/95946l.webp" },
      "title": "Akame ga Kill!",
      "synopsis": "Night Raid is the covert assassination branch of the Revolutionary Army...",
      "episodes": 24, "score": 7.48, "members": 2210016, "rank": 2102
    },
    {
      "mal_id": 48316,
      "images": { "large_image": "https://cdn.myanimelist.net/images/anime/1091/128729l.webp" },
      "title": "The Eminence in Shadow",
      "synopsis": "For as long as he can remember, Minoru Kagenou has been fixated on becoming as strong as possible...",
      "episodes": 20, "score": 8.24, "members": 800919, "rank": 359
    },
    {
      "mal_id": 37430,
      "images": { "large_image": "https://cdn.myanimelist.net/images/anime/1069/123309l.webp" },
      "title": "That Time I Got Reincarnated as a Slime",
      "synopsis": "Thirty-seven-year-old Satoru Mikami is a typical corporate worker...",
      "episodes": 24, "score": 8.13, "members": 1581000, "rank": 507
    },
    {
      "mal_id": 16498,
      "images": { "large_image": "https://cdn.myanimelist.net/images/anime/10/47347l.webp" },
      "title": "Attack on Titan",
      "synopsis": "Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans...",
      "episodes": 25, "score": 8.56, "members": 4217014, "rank": 117
    }
  ];

  const slideshowHTML = `
    <h3 class="recommendations-title">Check Out My Recommendations</h3>
    <div class="slideshow-container">
      ${recommendedAnimeData.map((anime, index) => `
        <div class="slide ${index === 0 ? 'active' : ''}">
          <div class="slide-column-left">
            <img src="${anime.images.large_image}" alt="${anime.title}">
          </div>
          <div class="slide-column-right">
            <div class="slide-content">
              <h2 class="slide-title">${anime.title}</h2>
              <p class="slide-description">${anime.synopsis.substring(0, 250)}...</p>
              <div class="slide-details">
                <span><i class="fas fa-play-circle"></i> ${anime.episodes || 'N/A'} Episodes</span>
                <span><i class="fas fa-star"></i> ${anime.score || 'N/A'}</span>
                <span><i class="fas fa-users"></i> ${anime.members.toLocaleString() || 'N/A'}</span>
                <span><i class="fas fa-trophy"></i> Rank: #${anime.rank || 'N/A'}</span>
              </div>
              <a href="/#/details-${anime.mal_id}"  class="slide-button">View Details</a>
            </div>
          </div>
        </div>
      `).join('')}
      <a class="prev">&#10094;</a>
      <a class="next">&#10095;</a>
    </div>
  `;

  content.innerHTML = slideshowHTML;

  const sections = [
    { title: 'Top Rated Anime', apiFunction: getTopRatedAnime, cardType: 'top-rated', containerClass: 'top-rated-container', titleClass: 'top-rated-title', galleryClass: 'horizontal-gallery' },
    { title: 'Most Popular Anime', apiFunction: getMostPopularAnime, cardType: 'most-popular', containerClass: 'top-rated-container', titleClass: 'top-rated-title', galleryClass: 'horizontal-gallery' },
    { title: 'Currently Airing Anime', apiFunction: getAiringAnime, cardType: 'airing', containerClass: 'airing-container', titleClass: 'airing-title', galleryClass: 'gridGallery' },
    { title: 'Anime This Season', apiFunction: getSeasonalAnime, cardType: 'seasonal', containerClass: 'airing-container', titleClass: 'airing-title', galleryClass: 'gridGallery' }
  ];

  // Load sections sequentially for reliability
  for (const section of sections) {
    const sectionHTML = await createAnimeSection(section);
    content.innerHTML += sectionHTML;
  }
  
  hideLoader();
  initSlideshow();
  initFlashcardHover();
  console.log('Home page loaded');
};


export function loadSearchPage(query=null) {
  console.log('Loading Search Page');
  document.getElementById('navsearch').style.color = '#8960ff';
  document.getElementById('navhome').style.color = '#ddd';
  const content = document.getElementById('content');
  content.innerHTML = ``;
  showLoader();
};

export function loadDetailsPage(query=null) {
  console.log('Loading Details Page');
  document.getElementById('navhome').style.color = '#ddd';
  document.getElementById('navsearch').style.color = '#ddd';
  const content = document.getElementById('content');
  content.innerHTML = ``;
  showLoader();
};


export function load404(path) {
  console.log('Loading 404 Page');
  document.getElementById('navhome').style.color = '#ddd';
  document.getElementById('navsearch').style.color = '#ddd';
  const content = document.getElementById('content');
  content.innerHTML = ``;
  showLoader();
}