import { getAnimeDetails, getAnimeCharacters, getAnimeStaff } from '../api.js';
import { showLoader, hideLoader, loadCSS, load404 } from '../pages.js';

export async function loadDetailsPage(animeId) {
  console.log(`Loading Details for anime ID: ${animeId}`);
  loadCSS('./css/details.css');
  document.getElementById('navhome').style.color = '#ddd';
  document.getElementById('navsearch').style.color = '#ddd';
  const content = document.getElementById('content');
  content.innerHTML = '';

  showLoader();

  try {
    const [anime, charactersData, staffData] = await Promise.all([
        getAnimeDetails(animeId),
        getAnimeCharacters(animeId),
        getAnimeStaff(animeId)
    ]);

    if (!anime) {
      throw new Error('Anime data not found.');
    }

    // --- Data Aggregation ---

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

    const studiosHTML = (anime.studios && anime.studios.length > 0)
      ? anime.studios.map(s => s.name).join(', ')
      : 'N/A';

    const seasonHTML = anime.season
      ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}`
      : 'N/A';

    const trailerHTML = anime.trailer?.youtube_id
        ? `
        <div class="details-trailer">
            <h2>Trailer</h2>
            <div class="trailer-container">
                <iframe 
                    src="https://www.youtube.com/embed/${anime.trailer.youtube_id}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
        `
        : '';
    const relationsHTML = (anime.relations && anime.relations.length > 0)
        ? anime.relations.map(relation => `
            <div class="relation-group">
                <h4>${relation.relation}</h4>
                <ul>
                    ${relation.entry.map(entry => `<li><a href="${entry.type === 'manga' ? entry.url : `#/${entry.type}/${entry.mal_id}`}" ${entry.type === 'manga' ? 'target="_blank"' : ''}>${entry.name}</a> (${entry.type})</li>`).join('')}
                </ul>
            </div>
        `).join('')
        : '<p>No related anime found.</p>';

    // Stats block for the hero section
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
        <div class="production-info">
             <div class="production-group">
                <h4>Producers</h4>
                <ul>${(anime.producers && anime.producers.length > 0) ? anime.producers.map(p => `<li>${p.name}</li>`).join('') : '<li>N/A</li>'}</ul>
            </div>
            <div class="production-group">
                <h4>Licensors</h4>
                <ul>${(anime.licensors && anime.licensors.length > 0) ? anime.licensors.map(l => `<li>${l.name}</li>`).join('') : '<li>N/A</li>'}</ul>
            </div>
            <div class="production-group">
                <h4>Studios</h4>
                <ul>${(anime.studios && anime.studios.length > 0) ? anime.studios.map(s => `<li>${s.name}</li>`).join('') : '<li>N/A</li>'}</ul>
            </div>
        </div>
        <div class="themes-section">
            <h4>Opening Themes</h4>
            <ul>${(anime.theme?.openings && anime.theme.openings.length > 0) ? anime.theme.openings.map(op => `<li>${op}</li>`).join('') : '<li>No opening themes found.</li>'}</ul>
            <h4>Ending Themes</h4>
            <ul>${(anime.theme?.endings && anime.theme.endings.length > 0) ? anime.theme.endings.map(ed => `<li>${ed}</li>`).join('') : '<li>No ending themes found.</li>'}</ul>
        </div>
        <div class="external-links">
            <h4>External Links</h4>
            <ul>
                ${(anime.external && anime.external.length > 0) ? anime.external.map(link => `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`).join('') : '<li>No external links available.</li>'}
            </ul>
             <h4>Streaming Platforms</h4>
            <ul>
                ${(anime.streaming && anime.streaming.length > 0) ? anime.streaming.map(link => `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`).join('') : '<li>No streaming links available.</li>'}
            </ul>
        </div>
    `;

    const charactersHTML = (charactersData && charactersData.length > 0)
    ? `<div class="character-grid">${charactersData.map(char => {
        const imgSrc = char.character.images.webp.image_url;
        const isPlaceholder = imgSrc.includes('questionmark');
        return `
        <div class="character-card">
            ${isPlaceholder ? '<div class="placeholder-icon"><i class="fas fa-user"></i></div>' : `<img src="${imgSrc}" alt="${char.character.name}">`}
            <div class="character-info">
                <h5>${char.character.name}</h5>
                <p>${char.role}</p>
                ${char.voice_actors && char.voice_actors.length > 0 ? `<p class="voice-actor"><b>Voice Actor:</b> ${char.voice_actors[0].person.name} (${char.voice_actors[0].language})</p>` : ''}
            </div>
        </div>`
    }).join('')}</div>`
    : '<p>No character information available.</p>';

    const staffHTML = (staffData && staffData.length > 0)
    ? `<div class="staff-grid">${staffData.map(staff => {
        const imgSrc = staff.person.images.jpg.image_url;
        const isPlaceholder = imgSrc.includes('questionmark');
        return `
        <div class="staff-card">
            ${isPlaceholder ? '<div class="placeholder-icon"><i class="fas fa-user-tie"></i></div>' : `<img src="${imgSrc}" alt="${staff.person.name}">`}
            <div class="staff-info">
                <h5>${staff.person.name}</h5>
                <p>${staff.positions.join(', ')}</p>
            </div>
        </div>`
    }).join('')}</div>`
    : '<p>No staff information available.</p>';

    // --- Main HTML Template (Restructured) ---

    const detailsHTML = `
    <div class="details-container">
        <h1>${anime.title_english || anime.title}</h1>
        
        <div class="details-hero">
          <div class="details-poster-group">
            
              <div class="details-poster">
                <img src="${anime.images?.webp?.large_image_url || './placeholder.png'}" alt="${anime.title || 'No Title'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                <div class="placeholder-icon" style="display: none;"><i class="fas fa-question-circle"></i></div>
              </div>
              
              <div class="details-titles-box">
                <h4>Alternative Titles</h4>
                <ul class="titles-list">${titlesHTML}</ul>
              </div>
          </div>
          
          <div class="details-info">
            ${heroStatsHTML}

            <h2 class="synopsis-header">Synopsis</h2>
            <p class="details-synopsis">${anime.synopsis || 'No synopsis available.'}</p>
          </div>
        </div>

        <div class="quick-facts-table">
            <div class="fact-item"><span class="fact-label">Type:</span><span class="fact-value">${anime.type || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Episodes:</span><span class="fact-value">${anime.episodes || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Status:</span><span class="fact-value">${anime.status || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Aired:</span><span class="fact-value">${anime.aired?.string || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Season:</span><span class="fact-value">${seasonHTML}</span></div>
            <div class="fact-item"><span class="fact-label">Rating:</span><span class="fact-value">${anime.rating || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Studios:</span><span class="fact-value">${studiosHTML}</span></div>
            <div class="fact-item"><span class="fact-label">Source:</span><span class="fact-value">${anime.source || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Scored By:</span><span class="fact-value">${anime.scored_by?.toLocaleString() || 'N/A'}</span></div>
            <div class="fact-item"><span class="fact-label">Members:</span><span class="fact-value">${anime.members?.toLocaleString() || 'N/A'}</span></div>
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
            ${genresHTML}
            <h2>Background</h2>
            <p>${anime.background || 'No background information available.'}</p>
        </div>

        <div id="relations" class="details-section">
          ${relationsHTML}
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

        ${trailerHTML}
      </div>
    `;

    content.innerHTML = detailsHTML;
    initTabbedNavigation();

  } catch (error) {
    console.error('Failed to load anime details:', error);
    load404(`details-${animeId}`);
  } finally {
    hideLoader();
    document.getElementById('randomDiv').style.display = 'none';
  }
}

function initTabbedNavigation() {
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