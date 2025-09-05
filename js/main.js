export function initSlideshow() {
  let slideIndex = 0;
  const slides = document.querySelectorAll('.slide');
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');

  function showSlides() {
    slides.forEach(slide => slide.classList.remove('active'));
    if (slideIndex >= slides.length) { slideIndex = 0; }
    if (slideIndex < 0) { slideIndex = slides.length - 1; }
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
    if (card.hoverInitialized=='true') {
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
        <a href="${detailsUrl}" class="synopsis-details-link">...</a>
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
        }, { once: true });
      } else {
        delete card.dataset.overlayAdded;
      }
    });
  });
}