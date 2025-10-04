const CACHE_DURATION = 300000;
const BASE_URL = 'https://api.jikan.moe/v4';
export const genres = {};
const logErrorByStatus = (status, statusText) => {
    switch (status) {
        case 400:
            console.log('You\'ve made an invalid request. Recheck documentation');
            break;
        case 404:
            console.log('The resource was not found or MyAnimeList responded with a 404');
            break;
        case 405:
            console.log('Requested Method is not supported for resource. Only GET requests are allowed');
            break;
        case 429:
            console.log('You are being rate limited by Jikan or MyAnimeList is rate-limiting our servers');
            break;
        case 500:
            console.log('Something didn\'t work. Try again later. If you see an error response with a report_url URL, please click on it to open an auto-generated GitHub issue');
            break;
        case 503:
            console.log('Jikan service is down. Try again later');
            break;
        default:
            console.log('Unknown Error while fetching data');
            console.log(`${status} : ${statusText}`);
            break;
    }
};

const fetchWithCacheAndRetry = async (url, cacheKey) => {
    const now = Date.now();
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (now - timestamp < CACHE_DURATION) {
            console.log(`Cache hit for key: ${cacheKey}`);
            return data;
        }
    }

    const maxRetries = 5;
    for (let retries = 0; retries < maxRetries; retries++) {
      try {
        console.log(`Fetching data for URL: ${url}`);
        const response = await fetch(url, { method: 'GET' });

        if (response.status !== 200 && response.status !== 304) {
            logErrorByStatus(response.status, response.statusText);
        } else {
          const jsonResponse = await response.json();
          const data = jsonResponse.data;
          localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
          return data;
        }
        console.warn(`API request failed with status ${response.status}. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, (retries + 1) * 1000));

      } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        if (retries === maxRetries - 1) {
            throw error;
        }
        await new Promise(resolve => setTimeout(resolve, (retries + 1) * 1000));
      }
    }
    throw new Error(`Failed to fetch data from ${url} after ${maxRetries} retries.`);
  };

  const fetchWithoutCache = async (url) => {
    const maxRetries = 5;
    for (let retries = 0; retries < maxRetries; retries++) {
        try {
            console.log(`Fetching data for URL: ${url}`);
            const response = await fetch(url, { method: 'GET' });

            if (response.status !== 200) {
                logErrorByStatus(response.status, response.statusText);
            } else {
                return await response.json();
            }

            console.warn(`API request failed with status ${response.status}. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, (retries + 1) * 1000));

        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            if (retries === maxRetries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, (retries + 1) * 1000));
        }
    }
    throw new Error(`Failed to fetch data from ${url} after ${maxRetries} retries.`);
};


export const getTopRatedAnime = async () => {
    const url = `${BASE_URL}/top/anime`;
    const cacheKey = 'top_rated_anime';
    return await fetchWithCacheAndRetry(url, cacheKey);
};

export const getMostPopularAnime = async () => {
    const url = `${BASE_URL}/top/anime?filter=bypopularity`;
    const cacheKey = 'most_popular_anime';
    return await fetchWithCacheAndRetry(url, cacheKey);
};

export const getAiringAnime = async () => {
    const url = `${BASE_URL}/anime?status=airing`;
    const cacheKey = 'airing_anime';
    return await fetchWithCacheAndRetry(url, cacheKey);
};

export const getUpcomingAnime = async () => {
    const url = `${BASE_URL}/seasons/upcoming`;
    const cacheKey = 'upcoming_anime';
    return await fetchWithCacheAndRetry(url, cacheKey);
};

export const getSeasonalAnime = async () => {
    const url = `${BASE_URL}/seasons/now`;
    const cacheKey = 'seasonal_anime';
    return await fetchWithCacheAndRetry(url, cacheKey);
};

export const getGenres = async () => {
    const url = `${BASE_URL}/genres/anime`;
    const cacheKey = 'anime_genres';
    const genreData = await fetchWithCacheAndRetry(url, cacheKey);
    genreData.forEach((genre) => {
        genres[genre.mal_id] = genre.name;
    });
    console.log('loaded genres')
};

export const getAnimeDetails = async (animeId) => {
    const url = `${BASE_URL}/anime/${animeId}/full`;
    const cacheKey = `anime_details_${animeId}`;
    return await fetchWithCacheAndRetry(url, cacheKey);
};

export const getAnimeInfo = async (animeId) => {
    const url = `${BASE_URL}/anime/${animeId}`;
    const cacheKey = `anime_info_${animeId}`;
    return await fetchWithCacheAndRetry(url, cacheKey);
};

export const getAnimeCharacters = async (animeId) => {
    const url = `${BASE_URL}/anime/${animeId}/characters`;
    const cacheKey = `anime_characters_${animeId}`;
    return await fetchWithCacheAndRetry(url, cacheKey);
};

export const getAnimeStaff = async (animeId) => {
    const url = `${BASE_URL}/anime/${animeId}/staff`;
    const cacheKey = `anime_staff_${animeId}`;
    return await fetchWithCacheAndRetry(url, cacheKey);
};

export const getRandomAnime = async () => {
    const res = await fetchWithoutCache(`${BASE_URL}/random/anime`);
    return res.data;
};

export async function searchAnime(JikanURL) {
    if (JikanURL) {
        return await fetchWithoutCache(JikanURL);
    }
    return fetchWithCacheAndRetry(`${BASE_URL}/anime`);
}
