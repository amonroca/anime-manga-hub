/**
 * API module: Centralizes Jikan (and Kitsu fallback) HTTP calls and enforces a global rate limiter.
 *
 * Why a global limiter?
 * - Jikan enforces request limits and may respond with 429 under bursts. This module serializes requests
 *   with a per-request minimum interval and a per-minute cap. It also retries on 429/5xx with backoff,
 *   optionally honoring the Retry-After header when present.
 *
 * Public surface (selected):
 * - searchJikan(query, type) -> list
 * - getTopAnimes(limit) -> list
 * - getDetails(type, mal_id) -> object|null
 * - getCharacters(type, mal_id) -> list
 * - getAnimeStreamingLinks(mal_id) -> list
 * - getSchedules() -> list
 * - getRecentAnimeRecommendations(), getAnimeRecommendation(mal_id) -> list
 * - getRecentMangaRecommendations(), getMangaRecommendation(mal_id) -> list
 * - getAnimeNews(mal_id), getMangaNews(mal_id) -> list
 * - getAnimeById(mal_id), getMangaById(mal_id) -> object|null
 * - getAnimeGenres(), getMangaGenres() -> list
 * - getSeasonUpcoming(page) -> list
 * - getAnimeEpisodes(mal_id, page) -> list
 */

// Global rate limiter for API requests (Jikan primarily)
const JIKAN_BASE = 'https://api.jikan.moe/v4';
const MAX_PER_MINUTE = 60; // Jikan documented limit
const MIN_INTERVAL_MS = 550; // ~1.8 req/sec for extra safety under bursts

// Rate limiting state
let rlQueue = [];
let rlProcessing = false;
let rlLastTs = 0;
let rlMinuteStart = Date.now();
let rlSentThisMinute = 0;

// Utility to delay execution
/**
 * Sleep helper.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// Rate-limited fetch with retries
/**
 * Enqueue an HTTP request to be processed under the global rate limiter.
 * Retries on 429 and 5xx responses with exponential backoff or Retry-After.
 *
 * @param {string} url - Target URL.
 * @param {RequestInit} [options] - Fetch options.
 * @param {{retries?: number}} [opts] - Retry options (default: 2 attempts after the initial try).
 * @returns {Promise<Response>} - The raw fetch Response when successful.
 */
async function rateLimitedFetch(url, options = {}, { retries = 2 } = {}) {
  return new Promise((resolve, reject) => {
    rlQueue.push({ url, options, retries, resolve, reject });
    if (!rlProcessing) processNext();
  });
}

// Process the next request in the queue
/**
 * Internal queue worker. Processes pending requests while respecting:
 * - Per-minute cap (MAX_PER_MINUTE)
 * - Minimum inter-request interval (MIN_INTERVAL_MS)
 * Applies retry logic for transient HTTP errors.
 * @returns {Promise<void>}
 */
async function processNext() {
  rlProcessing = true;
  while (rlQueue.length) {
    // reset minute window if needed
    const now = Date.now();
    if (now - rlMinuteStart >= 60_000) {
      rlMinuteStart = now;
      rlSentThisMinute = 0;
    }

    // enforce per-minute cap
    if (rlSentThisMinute >= MAX_PER_MINUTE) {
      const wait = 60_000 - (now - rlMinuteStart);
      await delay(Math.max(wait, 0));
      continue; // loop will recalc window
    }

    // enforce per-request interval
    const sinceLast = now - rlLastTs;
    if (sinceLast < MIN_INTERVAL_MS) {
      await delay(MIN_INTERVAL_MS - sinceLast);
    }

    const task = rlQueue.shift();
    try {
      const res = await fetch(task.url, task.options);
      rlLastTs = Date.now();
      rlSentThisMinute++;

      if (res.status === 429 || res.status >= 500) {
        // Retry with backoff or Retry-After
        if (task.retries > 0) {
          const retryAfter = Number(res.headers.get('Retry-After'));
          const backoff = isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : (1000 * Math.pow(2, 3 - task.retries));
          await delay(backoff);
          // Requeue with one less retry
          rlQueue.unshift({ ...task, retries: task.retries - 1 });
          continue;
        } else {
          const text = await safeText(res);
          task.reject(new Error(`HTTP ${res.status}: ${text || 'Rate limited or server error'}`));
          continue;
        }
      }

      task.resolve(res);
    } catch (e) {
      // Network or other error: basic retry
      if (task.retries > 0) {
        await delay(800);
        rlQueue.unshift({ ...task, retries: task.retries - 1 });
      } else {
        task.reject(e);
      }
    }
  }
  rlProcessing = false;
}

// Safe JSON/text parsing
/**
 * Safe JSON body parse.
 * @param {Response} res
 * @returns {Promise<any>} json object or empty object when parsing fails
 */
async function safeJson(res) {
  try { return await res.json(); } catch { return {}; }
}

// Safe text parsing
/**
 * Safe text body parse.
 * @param {Response} res
 * @returns {Promise<string>} text or empty string when parsing fails
 */
async function safeText(res) {
  try { return await res.text(); } catch { return ''; }
}

// Retrieve upcoming anime from Kitsu as a fallback
/**
 * Fallback source for upcoming anime from Kitsu API.
 * Not rate-limited by our Jikan constraints, but still passed through the same queue for pacing consistency.
 * @param {number} [limit=20]
 * @returns {Promise<any[]>}
 */
export async function getKitsuUpcomingAnime(limit = 20) {
  try {
    const res = await rateLimitedFetch(`https://kitsu.io/api/edge/anime?sort=-startDate&filter[status]=upcoming&page[limit]=${limit}`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Jikan API wrappers
// These functions wrap specific Jikan API endpoints with rate limiting and error handling

// Search Jikan for anime/manga by query
/**
 * Search Jikan for anime or manga by query.
 * @param {string} query
 * @param {('anime'|'manga')} type
 * @returns {Promise<any[]>}
 */
export async function searchJikan(query, type) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/${type}?q=${encodeURIComponent(query)}`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Get top anime list limited to 20 entries by default
/**
 * Get top anime list.
 * @param {number} [limit=20]
 * @returns {Promise<any[]>}
 */
export async function getTopAnimes(limit = 20) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/top/anime?limit=${limit}`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve detailed info for anime/manga by type and MAL ID
/**
 * Retrieve detailed info for anime or manga by MAL ID.
 * @param {('anime'|'manga')} type
 * @param {number|string} mal_id
 * @returns {Promise<any|null>}
 */
export async function getDetails(type, mal_id) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/${type}/${mal_id}/full`);
    const data = await safeJson(res);
    return data.data;
  } catch {
    return null;
  }
}

// Retrieve characters for anime/manga by type and MAL ID
/**
 * Retrieve characters for anime or manga by MAL ID.
 * @param {('anime'|'manga')} type
 * @param {number|string} mal_id
 * @returns {Promise<any[]>}
 */
export async function getCharacters(type, mal_id) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/${type}/${mal_id}/characters`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve streaming links for an anime by MAL ID
/**
 * Retrieve streaming links for an anime by MAL ID.
 * @param {number|string} mal_id
 * @returns {Promise<any[]>}
 */
export async function getAnimeStreamingLinks(mal_id) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/anime/${mal_id}/streaming`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve seasonal anime for a given year and season
/**
 * Retrieve broadcast schedules.
 * @returns {Promise<any[]>}
 */
export async function getSchedules() {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/schedules`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve anime recent recommendations
/**
 * Retrieve recent anime recommendations.
 * @returns {Promise<any[]>}
 */
export async function getRecentAnimeRecommendations() {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/recommendations/anime`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve anime recommendations for a specific anime by MAL ID
/**
 * Retrieve recommendations for a specific anime.
 * @param {number|string} mal_id
 * @returns {Promise<any[]>}
 */
export async function getAnimeRecommendation(mal_id) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/anime/${mal_id}/recommendations`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve manga recent recommendations
/**
 * Retrieve recent manga recommendations.
 * @returns {Promise<any[]>}
 */
export async function getRecentMangaRecommendations() {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/recommendations/manga`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve manga recommendations for a specific manga by MAL ID
/**
 * Retrieve recommendations for a specific manga.
 * @param {number|string} mal_id
 * @returns {Promise<any[]>}
 */
export async function getMangaRecommendation(mal_id) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/manga/${mal_id}/recommendations`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve news articles for an anime by MAL ID
/**
 * Retrieve news for a given anime.
 * @param {number|string} mal_id
 * @returns {Promise<any[]>}
 */
export async function getAnimeNews(mal_id) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/anime/${mal_id}/news`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve news articles for a manga by MAL ID
/**
 * Retrieve news for a given manga.
 * @param {number|string} mal_id
 * @returns {Promise<any[]>}
 */
export async function getMangaNews(mal_id) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/manga/${mal_id}/news`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve anime details by MAL ID
/**
 * Retrieve a single anime by MAL ID (basic endpoint).
 * @param {number|string} mal_id
 * @returns {Promise<any|null>}
 */
export async function getAnimeById(mal_id) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/anime/${mal_id}`);
    const data = await safeJson(res);
    return data.data || null;
  } catch {
    return null;
  }
}

// Retrieve manga details by MAL ID
/**
 * Retrieve a single manga by MAL ID (basic endpoint).
 * @param {number|string} mal_id
 * @returns {Promise<any|null>}
 */
export async function getMangaById(mal_id) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/manga/${mal_id}`);
    const data = await safeJson(res);
    return data.data || null;
  } catch {
    return null;
  }
}

// Retrieve anime genres
/**
 * Retrieve list of anime genres.
 * @returns {Promise<any[]>}
 */
export async function getAnimeGenres() {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/genres/anime?filter=genres`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve manga genres
/**
 * Retrieve list of manga genres.
 * @returns {Promise<any[]>}
 */
export async function getMangaGenres() {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/genres/manga?filter=genres`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve seasonal anime for a specific year and season
/**
 * Retrieve upcoming seasonal anime.
 * @param {number} [page=1]
 * @returns {Promise<any[]>}
 */
export async function getSeasonUpcoming(page = 1) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/seasons/upcoming?page=${page}`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}

// Retrieve anime episodes for a specific anime by MAL ID
/**
 * Retrieve episodes for a given anime.
 * @param {number|string} mal_id
 * @param {number} [page=1]
 * @returns {Promise<any[]>}
 */
export async function getAnimeEpisodes(mal_id, page = 1) {
  try {
    const res = await rateLimitedFetch(`${JIKAN_BASE}/anime/${mal_id}/episodes?page=${page}`);
    const data = await safeJson(res);
    return data.data || [];
  } catch {
    return [];
  }
}