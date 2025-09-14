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
      case '\"' :
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

  jumpscareAudio.play().catch(e => console.error("Couldn't play jumpscare audio, maybe it's missing?"));

  setTimeout(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    jumpscareContainer.remove();
    window.location.href = './';
  }, 3000);
}


export function initiateFilters() {
    const filterButton = document.querySelector('.filter-button');
    const filterOptions = document.querySelector('.filter-options');
    const filterBtns = document.querySelectorAll('.filter-btn');
  
    filterButton.addEventListener('click', () => {
      if (filterOptions.style.display === 'none') {
        filterOptions.style.display = 'grid';
      } else {
        filterOptions.style.display = 'none';
      }
    });

    const activeFilters = [];

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        const value = btn.dataset.value;

        const existingFilter = activeFilters.find(f => f.filter === filter && f.value === value);

        if (existingFilter) {
          activeFilters.splice(activeFilters.indexOf(existingFilter), 1);
          btn.classList.remove('active');
        } else {
          activeFilters.push({ filter, value });
          btn.classList.add('active');
        }

        console.log(activeFilters);
      });
  });

}