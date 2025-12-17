export const status = {"searching":false}

export function initSlideshow() {
  let slideIndex = 0;
  const slides = document.querySelectorAll('.slide');
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');
  let interval;

  function showSlides() {
    slides.forEach(slide => slide.classList.remove('active'));
    if (slideIndex >= slides.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = slides.length - 1;
    slides[slideIndex].classList.add('active');
  }

  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(() => {
      slideIndex++;
      showSlides();
    }, 5000);
  }

  if (prev && next) {
    prev.addEventListener('click', () => {
      slideIndex--;
      showSlides();
      resetInterval();
    });

    next.addEventListener('click', () => {
      slideIndex++;
      showSlides();
      resetInterval();
    });
  }

  // Swipe functionality
  const slideshowContainer = document.querySelector('.slideshow-container');
  let touchstartX = 0;
  let touchendX = 0;

  function handleGesture() {
    if (touchendX < touchstartX) {
      slideIndex++;
      showSlides();
      resetInterval();
    }
    if (touchendX > touchstartX) {
      slideIndex--;
      showSlides();
      resetInterval();
    }
  }

  slideshowContainer.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
  });

  slideshowContainer.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    handleGesture();
  });
  showSlides();
  resetInterval();
}

export function initFlashcardHover() { // The following function is a mess. I don't care cuz I know how it works. If you wanna work with me, kindlty take the initiative to fix it.
  const flashcards = document.querySelectorAll('.flashcard-link:not([data-popup-init])');
  const popup = document.getElementById('flash-popup');
  let onCard = false;
  let onPopup = false;
  let activeCard = null;
  let resizeRaf = null;
  let popupHide = null;

  window.addEventListener('resize', () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
            resizeRaf = null;
            if (!popup.hidden && activeCard) {
                positionPopup(activeCard);
            }
      });
  });
  let scrollRaf = null;
  window.addEventListener('scroll', () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        if (!popup.hidden && activeCard) {
            positionPopup(activeCard);
        }
    });
    }, true);


  popup.addEventListener('touchstart', (e) => e.stopPropagation());
  popup.addEventListener('mouseenter', () => {
    onPopup = true;
  });
  popup.addEventListener('mouseleave', () => {
    onPopup = false;
    console.log('left popup')
    setTimeout(tryHide, 30)
  });
  document.addEventListener('touchstart', () => hidePopup())
  document.addEventListener('click', () => hidePopup())

  function getPopupWidth() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const res = [];

    if (width < 300) {
      res.push(width*(9/10))
    } else if (width < 600) {
      res.push(width*(7/10))
    } else if (width < 800) {
      res.push(width*(5/10))
    } else {
      res.push(width*(3/10))
    };

    if (height < 300) {
      res.push(height*(7/10))
    } else if (height < 500) {
      res.push(height*(5.5/10))
    } else if (height < 700) {
      res.push(height*(4/10))
    } else {
      res.push(height*(2.5/10))
    };

    return res
  }

  function positionPopup(card) {
    const pos = card.getBoundingClientRect();
    const [ popupWidth, popupHeight ] = getPopupWidth();
    const overlap = pos.width * 0.2;
    const extraHeight = pos.height * 0.1;
    
    if (window.innerWidth - pos.right > popupWidth) {
        popup.style.left = (pos.right - overlap) + "px";
    } else if (pos.left > popupWidth) {
        popup.style.left = (pos.left - popupWidth + overlap*2) + "px";
    } else {
        popup.style.left = (window.innerWidth - popupWidth) + "px";
    };
    if (pos.top > extraHeight) {
        popup.style.top = (pos.top - extraHeight) + "px";
    } else if (window.innerHeight - pos.bottom > extraHeight) {
        popup.style.top = (pos.bottom - extraHeight) + "px";
    } else {
        popup.style.top = (pos.top + window.innerHeight*0.7)
    }
    popup.hidden = false;
    popup.style.zIndex = '10';
  }
 
  function addPopup(card) {
    activeCard = card;
    clearTimeout(popupHide);
    popupHide = null;
  
    const synopsis = card.dataset.synopsis || '';
    const title = card.dataset.title || '';
    const type = card.dataset.type || 'N/A';
    const rank = card.dataset.rank || 'N/A';
    const score = card.dataset.score || 'N/A';
    const status = card.dataset.status || 'Unknown';
    const genres = `${card.dataset.genres}` || 'N/A';
    const popularity = card.dataset.popularity || 'N/A';
    const episodes = card.dataset.episodes;
    const studios = card.dataset.studios || 'Unknown';
    const rating = card.dataset.rating || "N/A";
  
    const shortTitle =
      title.length > 20 ? title.slice(0, 20) + '…' : title;
  
    popup.innerHTML = `
      <span id="flash-popup-rank">#${rank}</span>
      <span id="flash-popup-title">${shortTitle}</span>
      <span class="flash-popup-status">- ${status}</span>
  
      <div id="flash-popup-meta">
        <div><i class="fas fa-star"></i> ${score}</div>
        <div><i class="fas fa-video"></i> ${type}</div>
        <div><i class="fa-solid fa-user-group"></i> ${popularity}</div>
      </div>
  
      <p id="flash-popup-synopsis">${synopsis}</p>
      <p id="flash-popup-genres"><span>Genres: </span>${genres}</p>
      <p id="flash-popup-episodes">${episodes ? "<span>Episodes: </span>" + episodes : ""}</p>
      <p id="flash-popup-studios"><span>Studios: </span>${studios}</p>
      <p id="flash-popup-studios"><span>Rating: </span>${rating}</p>
    `;
  
    positionPopup(card);
  }
  
  flashcards.forEach(card => {
    if (card.dataset.popupInit == 'true') {
      return;
    }
    card.dataset.popupInit = 'true';
    card.addEventListener('mouseenter', () => {
        onCard = true;
        addPopup(card)
    });
    card.addEventListener('mouseleave', () => {
        onCard = false;
        console.log('left card')
        popupHide = setTimeout(tryHide, 30) // prevent flickering
    });
    card.addEventListener('touchstart', (e) => {
        e.stopPropagation()
        addPopup(card)
    });
  });

  function tryHide() {
    if (!onCard && !onPopup) {
        hidePopup();
    }
  }

  function hidePopup() {
    console.log('popup hidden')
    activeCard = null;
    popup.hidden = true;
    popup.innerHTML = '';
    popup.style.left = '';
    popup.style.top = '';
    popup.style.zIndex = '-10';
  }
};

export function initGalleryControls() {
  const prevButtons = document.querySelectorAll('.gallery-prev');
  const nextButtons = document.querySelectorAll('.gallery-next');

  prevButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const gallery = btn.parentElement.querySelector('.horizontal-gallery');
      if (gallery) {
        gallery.scrollBy({
          left: -400,
          behavior: 'smooth'
        });
      }
    });
  });

  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const gallery = btn.parentElement.querySelector('.horizontal-gallery');
      if (gallery) {
        gallery.scrollBy({
          left: 400,
          behavior: 'smooth'
        });
      }
    });
  });
}

// random
export function randomAnime() {
  const randomButton = document.getElementById('random-anime-button');
  randomButton.addEventListener('click', () => {
    const chance = Math.floor(Math.random() * 100);
    if (chance < 1) {
      triggerJumpscare();
    } else {
      window.location.hash = '#/details-random'
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
  jumpscareImage.src = './media/jumpscare.jpg';
  jumpscareImage.id = 'jumpscare-image';

  const jumpscareAudio = new Audio('./media/jumpscare.mp3');

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