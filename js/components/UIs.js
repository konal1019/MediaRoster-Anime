import { escapeHTML } from "../main.js";

export function createFlashcardHTML(anime, cardType) {
  const imageUrl = anime.images?.webp?.image_url ?? 'placeholder.png';
  const title = anime.title_english || anime.title;
  const synopsis = escapeHTML(anime.synopsis || anime.background || 'No synopsis available.');
  const detailsUrl = `#/details-${anime.mal_id}`;

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
      <a href="./${detailsUrl}" class="flashcard-link" data-synopsis="${synopsis}">
          <div class="flashcard">
              <img src="${imageUrl}" loading="lazy" alt="${title}" class="flashcard-image" width="225" height="320" loading="lazy">
              <div class="flashcard-overlay">
                  <div class="flashcard-title">${title}</div>
                  ${overlayDetails}
              </div>
              ${badges}
          </div>
      </a>
  `;
}

export async function createAnimeSection({ title, apiFunction, cardType, containerClass, titleClass, galleryClass }) {
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