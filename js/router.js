import { loadPageContent, load404, loadDetailsPage, loadSearchPage, loadHomePage } from './pages.js';

const routes = {
  '/': 'home',
  '/search': 'search',
  '/meet-the-creator': 'portfolio',
};

export const handleRoute = () => {
  const path = window.location.hash.substring(1) || '/';
  const routeName = routes[path];

  if (routeName) {
    console.log(`Navigating to: ${routeName}`);
    loadPageContent(routeName);
  } else if (path.startsWith('/search-')) {
    const searchQuery = path.match(/^\/search-(.+)$/);
    if (searchQuery) {
      const searchTerm = searchQuery[1];
      console.log(`Navigating to search results for: ${searchTerm}`);
      loadSearchPage(searchQuery[1])
    }
  } else {
    const detailsMatch = path.match(/^\/details-(.+)$/);
    if (detailsMatch) {
      const animeNameOrId = detailsMatch[1];
      console.log(`Navigating to details for: ${animeNameOrId}`);
      loadDetailsPage(animeNameOrId)
    } else {
      load404(path);
    }
  }
};

// Listen for hash changes
window.addEventListener('hashchange', handleRoute);

// Initial route handling on page load
window.addEventListener('load', handleRoute);