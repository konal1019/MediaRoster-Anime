import { getAnimeDetails, getAnimeCharacters, getAnimeStaff, getAnimeInfo, getRandomAnime, getAnimeReviews } from '../api.js';
import { initFlashcardHover, initGalleryControls } from '../main.js';
import { showLoader, hideLoader, loadCSS, load404 } from '../pages.js';
import { createFlashcard } from './UIs.js';
import { escapeHTML } from './utils.js';

export async function loadDetailsPage(animeId = null) {
  console.log(`Loading Details for anime ID: ${animeId}`);
  loadCSS('./css/details.css');
  document.getElementById('navhome').style.color = '#ddd';
  document.getElementById('navsearch').style.color = '#ddd';
  const content = document.getElementById('content');
  content.innerHTML = '';
  document.getElementById('randomDiv').style.display = 'none'; 

  showLoader();

  try {
    const isRandom = animeId === 'random';
    const anime = isRandom ? await getRandomAnime() : await getAnimeDetails(animeId);
    
    if (!anime || !anime.mal_id) {
      throw new Error('Anime data not found.');
    }
    
    animeId = anime.mal_id;
    
    const currentHash = `#/details-${animeId}`;
    if (isRandom) {
      history.replaceState(null, null, currentHash);
    }

    const titlesHTML = [
        ...(anime.title_synonyms || []).map(s => `<li>${s}</li>`),
        ...(anime.titles || []).map(t => `<li>${t.type}: ${t.title}</li>`)
    ].join('');

    const genresHTML = (anime.genres && anime.genres.length > 0)
      ? `
        <div class="details-genres-inner">
            <h2 class="genres-header">Genres</h2>
            <div class="details-genres-list">
                ${anime.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('')}
            </div>
        </div>
      `
      : '';

    const seasonHTML = anime.season
      ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)}`
      : 'N/A';

    const yearHTML = anime.year || 'N/A';

    const trailerHTML = anime.trailer?.youtube_id
        ? `
        <div class="details-trailer">
            <h2>Trailer</h2>
            <div class="trailer-container">
              <iframe 
                  src="https://www.youtube.com/embed/${anime.trailer.youtube_id}?rel=0" 
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;" 
                  allowfullscreen>
              </iframe>
            </div>
        </div>
        `
        : '';
    const relationsHTML = `<div class="loader"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
    const heroStatsHTML = `
        <div class="details-stats hero-stats">
            <div class="stat-box">
                <h3>Score</h3>
                <p class="stat-value-large">${anime.score ? `⭐ ${anime.score}` : 'N/A'}</p>
            </div>
            <div class="stat-box">
                <h3>Popularity</h3>
                <p class="stat-value-large">#${anime.popularity || 'N/A'}</p>
            </div>
            <div class="stat-box">
                <h3>Members</h3>
                <p class="stat-value-large">${anime.members?.toLocaleString() || 'N/A'}</p>
            </div>
            <div class="stat-box">
                <h3>Rank</h3>
                <p class="stat-value-large">#${anime.rank || 'N/A'}</p>
            </div>
        </div>
    `;

    const productionHTML = `
      <div class="details-genres-inner">
          <h2 class="genres-header">Producers</h2>
          <div class="details-genres-list">
              ${(anime.producers && anime.producers.length > 0) ? anime.producers.map(p => `<span class="genre-tag">${p.name}</span>`).join('') : '<span class="genre-tag is-na">N/A</span>'}
          </div>
      </div>
      <div class="details-genres-inner">
          <h2 class="genres-header">Licensors</h2>
          <div class="details-genres-list">
              ${(anime.licensors && anime.licensors.length > 0) ? anime.licensors.map(l => `<span class="genre-tag">${l.name}</span>`).join('') : '<span class="genre-tag is-na">N/A</span>'}
          </div>
      </div>
      <div class="details-genres-inner">
          <h2 class="genres-header">Studios</h2>
          <div class="details-genres-list">
              ${(anime.studios && anime.studios.length > 0) ? anime.studios.map(s => `<span class="genre-tag">${s.name}</span>`).join('') : '<span class="genre-tag is-na">N/A</span>'}
          </div>
      </div>
      <div class="themes-section">
          <h4>Opening Themes</h4>
          <ul>${(anime.theme?.openings && anime.theme.openings.length > 0) ? anime.theme.openings.map(op => `<li>${op}</li>`).join('') : '<li>No opening themes found.</li>'}</ul>
          <h4>Ending Themes</h4>
          <ul>${(anime.theme?.endings && anime.theme.endings.length > 0) ? anime.theme.endings.map(ed => `<li>${ed}</li>`).join('') : '<li>No ending themes found.</li>'}</ul>
      </div>
      <div class="links-section">
          <div class="external-links">
              <h4>External Links</h4>
              <div class="links-container">
                  ${(anime.external && anime.external.length > 0) ? anime.external.map(link => `<a href="${link.url}" target="_blank" class="link-button"><i class="fa-solid fa-arrow-up-right-from-square"></i>${link.name}</a>`).join('') : '<p>No external links available.</p>'}
              </div>
          </div>
          <div class="streaming-platforms">
              <h4>Streaming Platforms</h4>
              <div class="links-container">
                  ${(anime.streaming && anime.streaming.length > 0) ? anime.streaming.map(link => `<a href="${link.url}" target="_blank" class="link-button"><i class="fas fa-play-circle"></i>${link.name}</a>`).join('') : '<p>No streaming links available.</p>'}
              </div>
          </div>
      </div>
    `;
    const charactersHTML = `<div class="loader"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
    const staffHTML = `<div class="loader"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
    const reviewsHTML = `
      <div class="reviews-container">
        <div class="gallery-prev">&lt</div>
        <div class="gallery-next">&gt</div>
        <h2 class="floating-header">  What People Have to Say</h2>
        
      </div>
    `
    const detailsHTML = `
      <div class="details-hero-wrapper">
          <h1>${anime.title_english || anime.title}</h1>
          <div class="details-hero">
            <div class="details-poster-group">
              <div class="details-poster">
                <img src="${anime.images?.webp?.large_image_url || './placeholder.png'}" alt="${anime.title || 'No Title'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                <div class="placeholder-icon" style="display: none;"><i class="fas fa-question-circle"></i></div>
              </div>
          </div>
          <div class="details-info">
            ${heroStatsHTML}
            <h2 class="synopsis-header">Synopsis</h2>
            <p class="details-synopsis">${escapeHTML(anime.synopsis || 'No synopsis available.')}</p>
          </div>
        </div>
      </div>
      <div class="details-container">
        <div class="quick-facts-table">
            <div class="fact-item"><span class="fact-label">Type:</span><span class="fact-value">${anime.type || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Episodes:</span><span class="fact-value">${anime.episodes || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Status:</span><span class="fact-value">${anime.status || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Aired:</span><span class="fact-value">${anime.aired?.string || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Season:</span><span class="fact-value">${seasonHTML}</span></div>
            <div class="fact-item"><span class="fact-label">Year:</span><span class="fact-value">${yearHTML}</span></div>
            <div class="fact-item"><span class="fact-label">Rating:</span><span class="fact-value">${anime.rating || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Source:</span><span class="fact-value">${anime.source || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Scored By:</span><span class="fact-value">${anime.scored_by?.toLocaleString() || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Duration:</span><span class="fact-value">${anime.duration || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Favorites:</span><span class="fact-value">${anime.favorites?.toLocaleString() || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Official Source:</span><span class="fact-value"><a href="${anime.url || '#'}" target="_blank" class="source-link">MyAnimeList</a></span></div>
        </div>

        <nav class="details-nav">
          <div class="details-nav-item active" data-target="overview">Overview</div>
          <div class="details-nav-item" data-target="relations">Relations</div>
          <div class="details-nav-item" data-target="production">Production</div>
          <div class="details-nav-item" data-target="characters">Characters</div>
          <div class="details-nav-item" data-target="staff">Staff</div>
        </nav>

        <div id="overview" class="details-section active">
            <div class="details-titles-box">
              <h2>Also Known As: </h4>
              <ul class="titles-list">${titlesHTML}</ul>
            </div>
            ${genresHTML}
            <h2 class="floating-header">Background</h2>
            <p>${anime.background || 'No background information available.'}</p>
        </div>

        <div id="relations" class="details-section">
          <div id="relations-container">
            ${relationsHTML}
          </div>
        </div>

        <div id="production" class="details-section">
          ${productionHTML}
        </div>

        <div id="characters" class="details-section">
          ${charactersHTML}
        </div>

        <div id="staff" class="details-section">
          ${staffHTML}
        </div>
        ${reviewsHTML}
        ${trailerHTML}
      </div>
    `;

    if (window.location.hash === currentHash) {
      content.innerHTML = detailsHTML;
      initDetailsNav();
      loadCharecters(animeId);
      loadStaff(animeId);
      loadReviews(animeId);
      loadRelations(anime.relations, animeId);
    }
  } catch (error) {
    console.error('Failed to load anime details:', error);
    load404(`details-${animeId}`);
  } finally {
    if (window.location.hash === `#/details-${animeId}`) {
      hideLoader();
      document.getElementById('randomDiv').style.display = 'none';
    }
  }
}

async function loadRelations(relations, animeId) {
  const container = document.getElementById('relations-container');
  if (!relations || relations.length === 0) {
    container.innerHTML = '<p>No related anime found.</p>';
    return;
  }
  const currentHash = `#/details-${animeId}`;

  if (window.location.hash === currentHash) {
    container.innerHTML = '';
    for (const relation of relations) {
      const group = document.createElement('div');
      group.className = 'relation-group';

      const title = document.createElement('h2');
      title.className = 'floating-header';
      title.textContent = relation.relation;
      group.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'gridGallery';
      grid.style.justifyContent = 'none';
      group.appendChild(grid);

      for (const entry of relation.entry) {
        if (entry.type === 'anime') {
          try {
            const animeInfo = window.location.hash === currentHash ? await getAnimeInfo(entry.mal_id): null;
            if (animeInfo) {
              grid.innerHTML += createFlashcard(animeInfo, 'top-rated');
            }
          } catch (error) {
            console.error(`Failed to fetch info for anime ID: ${entry.mal_id}`, error);
            grid.innerHTML += createFallbackCard(entry);
          }
        } else {
          grid.innerHTML += createFallbackCard(entry);
        }
      }
      container.appendChild(group);
    }
  } else return;
  initFlashcardHover();
}

function createFallbackCard(entry) {
  return `
    <a href="${entry.url}" target="_blank" class="relation-card-fallback">
      <span class="relation-card-title">${entry.name}</span>
      <span class="relation-card-type">${entry.type}</span>
    </a>
  `;
}

function initDetailsNav() {
  const navItems = document.querySelectorAll('.details-nav-item');
  const sections = document.querySelectorAll('.details-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Deactivate all
      navItems.forEach(nav => nav.classList.remove('active'));
      sections.forEach(sec => sec.classList.remove('active'));

      // Activate clicked
      item.classList.add('active');
      const targetId = item.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
}

async function loadCharecters(animeId) {
  let charactersData = null;
  try {
    charactersData = await getAnimeCharacters(animeId);
  } catch (error) {
    console.error('Failed to load characters:', error);
  }
  const charContainer = document.getElementById('characters');
  charContainer.innerHTML = (charactersData && charactersData.length > 0)
  ? `<div class="character-grid">${charactersData.map(char => {
      const imgSrc = char.character.images.webp.image_url;
      const isPlaceholder = imgSrc.includes('questionmark');
      return `
      <div class="character-card">
          ${isPlaceholder ? '<div class="placeholder-icon"><i class="fas fa-user"></i></div>' : `<img src="${imgSrc}" loading="lazy" alt="${char.character.name}">`}
          <div class="character-info">
              <h5>${char.character.name}</h5>
              <p>${char.role}</p>
              ${char.voice_actors && char.voice_actors.length > 0 ? `<p class="voice-actor"><b>Voice Actor:</b> ${char.voice_actors[0].person.name} (${char.voice_actors[0].language})</p>` : ''}
          </div>
      </div>`
  }).join('')}</div>`
  : '<p>No character information available.</p>';
}

async function loadStaff(animeId) {
  let staffData = null;
  try {
    staffData = await getAnimeStaff(animeId);
  } catch (error) {
    console.error('Failed to load staff:', error);
  }
   const staffContainer = document.getElementById('staff');
   staffContainer.innerHTML = (staffData && staffData.length > 0)
   ? `<div class="staff-grid">${staffData.map(staff => {
       const imgSrc = staff.person.images.jpg.image_url;
       const isPlaceholder = imgSrc.includes('questionmark');
       return `
       <div class="staff-card">
           ${isPlaceholder ? '<div class="placeholder-icon"><i class="fas fa-user-tie"></i></div>' : `<img src="${imgSrc}" loading="lazy" alt="${staff.person.name}">`}
           <div class="staff-info">
               <h5>${staff.person.name}</h5>
               <p>${staff.positions.join(', ')}</p>
           </div>
       </div>`
   }).join('')}</div>`
   : '<p>No staff information available.</p>'; 
}

async function loadReviews(animeId) {
  const container = document.querySelector('.reviews-container');
  const galleryContainer = document.createElement('div');
  galleryContainer.className = 'horizontal-gallery';
  
  try {
    const reviewsData = await getAnimeReviews(animeId);
    
    if (!reviewsData || reviewsData.length === 0) {
      container.innerHTML += '<p style="text-align: center; color: var(--text-color); padding: 2rem;">No reviews available.</p>';
      return;
    }

    reviewsData.forEach(review => {
      const reviewCard = createReviewCard(review);
      galleryContainer.innerHTML += reviewCard;
    });

    container.appendChild(galleryContainer);
    initGalleryControls();
  } catch (error) {
    console.error('Failed to load reviews:', error);
    container.innerHTML += '<p style="text-align: center; color: var(--error-color); padding: 2rem;">Failed to load reviews.</p>';
  }
}

function createReviewCard(review) {
  const score = review.score || 0;
  const username = review.user?.username || 'Anonymous';
  const malId = review.mal_id || 'N/A';
  const reviewText = review.review || 'Prolly nothing important';
  
  // Truncate review text if too long
  const truncatedReview = reviewText.length > 300 
    ? reviewText.substring(0, 300) + '...' 
    : reviewText;

  return `
    <div class="review-card">
      <div class="review-quote-icon">
        <i class="fas fa-quote-left"></i>
      </div>
      <div class="review-content">
        <p class="review-text">${escapeHTML(truncatedReview)}</p>
      </div>
      <div class="review-footer">
        <div class="review-user">
          <div class="review-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="review-user-info">
            <span class="review-username">${username}</span>
            <span class="review-mal-id">MyAnimeList ID: ${malId}</span>
          </div>
        </div>
        <div class="review-rating">
          <i class="fas fa-star"></i>
          <span class="review-score">${score}</span>
        </div>
      </div>
    </div>
  `;
};