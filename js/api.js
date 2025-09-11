const CACHE_DURATION = 5 * 60 * 1000;
const cache = {};
const BASE_URL = 'https://api.jikan.moe/v4';

const fetchWithCacheAndRetry = async (url, cacheKey) => {
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cache[cacheKey].data;
    }

    const maxRetries = 5;
    for (let retries = 0; retries < maxRetries; retries++) {
      try {
        console.log(`Fetching data for URL: ${url}`);
        const response = await fetch(url, { method: 'GET' });

        if (response.status !== 200 && response.status !== 304) {
          if (response.status == 400) {
            console.log('You\'ve made an invalid request. Recheck documentation')
          } else if (response.status == 404) {
            console.log('The resource was not found or MyAnimeList responded with a 404')
          } else if (response.status == 405) {
            console.log('Requested Method is not supported for resource. Only GET requests are allowed');
          } else if (response.status == 429) {
            console.log('You are being rate limited by Jikan or MyAnimeList is rate-limiting our servers');
          } else if (response.status == 500) {
            console.log('Something didn\'t work. Try again later. If you see an error response with a report_url URL, please click on it to open an auto-generated GitHub issue');
          } else if (response.status == 503) {
            console.log('Jikan service is down. Try again later');
          } else {
            console.log('Unknown Error while fetching data');
            console.log(`${response.status} : ${response.statusText}`);
          }
        } else {
          const jsonResponse = await response.json();
          const data = jsonResponse.data;
          cache[cacheKey] = { data: data, timestamp: now };
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

export const getSeasonalAnime = async () => {
    const url = `${BASE_URL}/seasons/now`;
    const cacheKey = 'seasonal_anime';
    return await fetchWithCacheAndRetry(url, cacheKey);
};

export const getAnimeDetails = async (animeId, fields='all') => {
  const cacheKey = animeId;
  const maxRetries = 5;
  let retries = 0;

  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    console.log(`Cache hit for anime ID: ${animeId}`);
    if (fields === 'all') {
      return cache[cacheKey].data;
    } else {
      const filteredData = {};
      fields.forEach((field) => {
        if (cache[cacheKey].data.hasOwnProperty(field)) {
          filteredData[field] = cache[cacheKey].data[field];
        }
      });
      return filteredData;
    }
  }

  let data = null;

  try {
    while (retries < maxRetries) {
    const now = Date.now();

    console.log(`Fetching details for anime ID: ${animeId}`);
    const response = await fetch(`${BASE_URL}/anime/${animeId}/full`, {
      method: 'GET',
    });

    if (response.status !== 200 && response.status !== 304) {
      if (response.status == 400) {
        console.log('You\'ve made an invalid request. Recheck documentation')
      } else if (response.status == 404) {
        console.log('The resource was not found or MyAnimeList responded with a 404')
      } else if (response.status == 405) {
        console.log('Requested Method is not supported for resource. Only GET requests are allowed');
      } else if (response.status == 429) {
        console.log('You are being rate limited by Jikan or MyAnimeList is rate-limiting our servers');
      } else if (response.status == 500) {
        console.log('Something didn\'t work. Try again later. If you see an error response with a report_url URL, please click on it to open an auto-generated GitHub issue');
      } else if (response.status == 503) {
        console.log('Jikan service is down. Try again later');
      } else {
        console.log('Unknown Error while fetching data');
        console.log(`${response.status} : ${response.statusText}`);
      }
      retries++;
      await new Promise(resolve => setTimeout(resolve, retries * 1000));
      continue;
    }

      data = await response.json();
      break;
    }

    if (!data) {
      throw new Error(`Failed to fetch anime details for ID ${animeId} after ${maxRetries} retries.`);
    }

    const standardizedData = detailsParser(data);

    cache[cacheKey] = { data: standardizedData, timestamp: now };
    if (fields === 'all') {
      return cache[cacheKey].data;
    } else {
      const filteredData = {};
      fields.forEach((field) => {
        if (cache[cacheKey].data.hasOwnProperty(field)) {
          filteredData[field] = cache[cacheKey].data[field];
        }
      });
      return filteredData;
    }
  } catch (error) {
    console.error(`Error fetching anime details for ID ${animeId}:`, error);
    throw error;
  }
};

export const detailsParser = (data) => {
  const { data: animeData } = data;

  const standardizedData = {
    mal_id: animeData.mal_id,
    url: animeData.url,
    images: {
      small_image: animeData.images?.webp?.small_image_url || null,
      large_image: animeData.images?.webp?.large_image_url || null,
      image: animeData.images?.webp?.image_url || null,
    },
    trailer: animeData.trailer ? (animeData.trailer.url || animeData.trailer.embed_url || animeData.trailer.youtube_id ? `https://www.youtube.com/watch?v=${animeData.trailer.youtube_id}` : null) : null,
    approved: animeData.approved,
    title: animeData.title,
    title_english: animeData.title_english,
    title_japanese: animeData.title_japanese,
    type: animeData.type,
    source: animeData.source,
    episodes: animeData.episodes,
    status: animeData.status,
    airing: animeData.airing,
    duration: animeData.duration,
    rating: animeData.rating,
    score: animeData.score,
    scored_by: animeData.scored_by,
    rank: animeData.rank,
    popularity: animeData.popularity,
    members: animeData.members,
    favorites: animeData.favorites,
    synopsis: animeData.synopsis,
    background: animeData.background,
    season: animeData.season,
    year: animeData.year,
    producers: animeData.producers,
    licensors: animeData.licensors,
    studio: animeData.studios.map((studio) => studio.name).join(', ') || 'unknown',
    genres: animeData.genres,
    relations: animeData.relations,
    theme: animeData.theme,
    demographics: animeData.demographics,
    broadcast: animeData.broadcast?.string ?? null,
  };

  return standardizedData;
};
