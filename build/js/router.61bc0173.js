import { loadPageContent, load404 } from './pages.c2bbb4e4.js';
import { loadDetailsPage } from './components/details.1325e2f7.js';

const routes = {
  '/': 'home',
  '/search': 'search',
  '/meet-the-creator': 'portfolio',
};

export const handleRoute = () => {
  window.scrollTo(0, 0);
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
