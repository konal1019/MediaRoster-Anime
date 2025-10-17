import { loadPageContent, load404, hideLoader } from './pages.js';
import { loadDetailsPage } from './components/details.js';

const routes = {
  '/': 'home',
  '/search': 'search',
  '/meet-the-creator': 'portfolio',
};

export const handleRoute = () => {
  setTimeout(() => {
    window.scrollTo(0,0);
  }, 10);
  hideLoader();
  const path = window.location.hash.substring(1) || '/';
  const [pathName] = path.split('?');
  const routeName = routes[pathName];

  if (routeName) {
    console.log(`Navigating to: ${routeName}`);
    loadPageContent(routeName);
  } else if (path.startsWith('/details-')) {
    const animeId = path.split('-')[1];
    console.log(`Navigating to details for: ${animeId}`);
    loadDetailsPage(animeId)
  } else {
    load404(path);
  }
};

// Listen for hash changes
window.addEventListener('hashchange', handleRoute);

// Initial route handling on page load
window.addEventListener('load', handleRoute);
