// Utilities for rendering cards, lists, and UI behaviors across pages.
// This file wires UI components to API data and manages local/session storage state.
// Note: All API rate limiting is centralized in api.js; avoid adding ad-hoc throttles here.
import AnimeCard from '../components/AnimeCard.mjs';
import MangaCard from '../components/MangaCard.mjs';
import AnimeNews from '../components/AnimeNews.mjs';
import MangaNews from '../components/MangaNews.mjs'; 
import Releases from '../components/Releases.mjs';
import Episodes from '../components/Episodes.mjs';
import AnimeRecommendation from '../components/AnimeRecommendation.mjs';
import MangaRecommendation from '../components/MangaRecommendation.mjs';
import { getCharacters, getDetails, getAnimeStreamingLinks, getRecentAnimeRecommendations, getAnimeRecommendation, 
    getRecentMangaRecommendations, getMangaRecommendation, getAnimeGenres, getMangaGenres, getAnimeNews, getMangaNews,
    getSeasonUpcoming, getSoundtracks, getOfficialMangaLinks } from "./api";
import Soundtracks from '../components/Soundtracks.mjs';

/**
 * Get favorites from localStorage.
 * @returns {Array<{id:number|string,title:string,image:string,type:'Anime'|'Manga'}>}
 */
export function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
}

/**
 * Check if a MAL id is in favorites.
 * @param {number|string} id
 * @returns {boolean}
 */
export function isFavorite(id) {
    return getFavorites().some(f => f.id === id);
}

/**
 * Add an item (anime or manga) to favorites if not already present.
 * Accepts objects from Jikan (details or recommendation entry shape).
 * @param {object} item
 */
export function addFavorite(item) {

    const favs = getFavorites();
    let mal_id = null;

    // Determine MAL ID based on item structure
    if (typeof item.mal_id === 'number') {
        mal_id = item.mal_id;
    } else {
        mal_id = item.entry.mal_id;
    }

    // Check if already in favorites before adding
    if (!favs.find(f => f.id === mal_id)) {
        favs.push({
            id: mal_id,
            title: item.title || item.entry.title || 'No title',
            image: item.images?.webp?.image_url || item.entry.images?.webp?.image_url || 'No Image',
            type: item.type === 'Manga' ? item.type : 'Anime',
        });
        localStorage.setItem('favorites', JSON.stringify(favs));
    }
}

/**
 * Remove an item from favorites by MAL id.
 * @param {number|string} id
 */
export function removeFavorite(id) {
    let favs = getFavorites();
    favs = favs.filter(f => f.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favs));
}

/**
 * Get a random favorite MAL ID by type ("Anime" | "Manga").
 * Used to fetch recommendations or news when no seed is specified.
 * @param {'Anime'|'Manga'} type
 * @returns {number|null}
 */
export function getRandomFavoriteMalId(type) {
    const favs = getFavorites().filter(f => f.type === type);
    if (!favs.length) return null;
    const random = favs[Math.floor(Math.random() * favs.length)];
    return random.id;
}

/**
 * Create or update the results count tag in the Search page.
 * @param {number} count
 */
export function createOrUpdateResultCountingTag(count) {
    let resultsCountTag = document.getElementById('results-count');
    if (!resultsCountTag) {
        resultsCountTag = document.createElement('div');
        resultsCountTag.id = 'results-count';
        resultsCountTag.style = 'margin: 1.2rem 0 0.5rem 0; font-size: 1.1rem; font-weight: bold; color: #646cff; text-align: left;';
        const main = document.querySelector('main') || document.body;
        main.insertBefore(resultsCountTag, main.firstChild);
    }
    resultsCountTag.textContent = `${count} result${count === 1 ? '' : 's'} found`;
}

/**
 * Render search results list into a container.
 * @param {Array<object>} results - items from Jikan search/top endpoints
 * @param {'anime'|'manga'} type
 * @param {HTMLElement} htmlElement
 */
export function renderResults(results, type, htmlElement) {
    // Clear existing content and update results count
    htmlElement.innerHTML = '';
    // Create or update the results count tag
    createOrUpdateResultCountingTag(results.length);

    // Handle no results case
    if (!results.length) {
        htmlElement.innerHTML = '<p>No results found.</p>';
        return;
    }

    // Render results based on type
    // For each result, create a card and append to the container
    if (type === 'anime') {
        results.forEach(item => {
            const card = new AnimeCard(item);
            const div = document.createElement('div');
            div.className = 'result-card';
            div.innerHTML = card.render();
            div.querySelector('.show-details').addEventListener('click', () => showDetails(item.mal_id, 'anime'));
            bindFavoriteButton(div.querySelector('.favorite-btn'), item);
            htmlElement.appendChild(div);
        });
    }
    else if (type === 'manga') {
        results.forEach(item => {
            const card = new MangaCard(item);
            const div = document.createElement('div');
            div.className = 'result-card';
            div.innerHTML = card.render();
            div.querySelector('.show-details').addEventListener('click', () => showDetails(item.mal_id, 'manga'));
            bindFavoriteButton(div.querySelector('.favorite-btn'), item);
            htmlElement.appendChild(div);
        });
    }
}

/**
 * Convert a Fetch Response to JSON with basic ok check.
 * @param {Response} res
 * @returns {Promise<any>}
 */
export function convertToJson(res) {
    if (res.ok) {
        return res.json();
    } else {
        throw new Error('Bad response');
    }
}

/**
 * Add an episode to the watchlist stored in localStorage.
 * @param {object} item - episode object enriched with anime_title
 */
export function addToWatchlist(item) {
    // Retrieve existing watchlist or initialize empty array 
    let list = JSON.parse(localStorage.getItem('watchlist') || '[]');

    // Check if already in watchlist before adding
    if (!list.find(i => i.id === String(item.episode_id))) {
        // Add new episode to watchlist formating the JSON structure
        list.push({
        id: String(item.episode_id),
        anime_title: item.anime_title,
        episode_title: item.title,
        mal_id: String(item.mal_id),
        url: item.url,
        });
        localStorage.setItem('watchlist', JSON.stringify(list));
        showToast('Added to the watchlist!', 'success');
    } else {
        showToast('Already in the watchlist!', 'info');
    }
}

/**
 * Lightweight toast notifications
 * @param {string} message
 * @param {'info'|'success'|'error'} [type='info']
 */
function showToast(message, type = 'info') {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;

    // Click to dismiss early
    toast.addEventListener('click', () => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 200);
    });

    container.appendChild(toast);
    // Animate in
    requestAnimationFrame(() => toast.classList.add('toast-show'));

    // Auto-dismiss
    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 200);
    }, 3000);
}

function getToastContainer() {
    let el = document.getElementById('toast-container');
    if (!el) {
        el = document.createElement('div');
        el.id = 'toast-container';
        document.body.appendChild(el);
    }
    return el;
}

/**
 * Render recommendation carousel items (anime/manga) into a container.
 * Uses throttleRecommendations to avoid UI jank and to stagger badge fetches.
 * @param {Array<object>} recommendations - items from recommendations endpoints
 * @param {HTMLElement} htmlElement
 */
export function renderRecommendations(recommendations, htmlElement) {
    // Determine type based on element ID
    const type = htmlElement.id?.includes('anime') ? 'anime' : 'manga';

    // Clear existing content
    htmlElement.innerHTML = '';

    // Handle no recommendations case
    if (!recommendations.length) {
        htmlElement.innerHTML = '<p>No recommendations found.</p>';
        return;
    }

    // Limit recommendations based on pagination state
    const limitedRecommendations = recommendations.slice(0, sessionStorage.getItem(`${type}RcPage`) ? Number(sessionStorage.getItem(`${type}RcPage`)) : 20);

    // Throttle rendering of recommendations based on API rate limits
    throttleRecommendations(limitedRecommendations, async item => {
        // Create the recommendation card based on type
        const rec = type === 'anime' ? new AnimeRecommendation(item) : new MangaRecommendation(item);
        const div = document.createElement('div');
        div.className = 'carousel-item';

        // Render the card and set up event listeners
        div.innerHTML = rec.render();
        div.style.opacity = '0';
        div.querySelector(type === 'anime' ? '#details-anime-btn' : '#details-manga-btn')?.addEventListener('click', () => showDetails(item.entry?.mal_id, type));
        item.type = type === 'anime' ? 'Anime' : 'Manga';
        bindFavoriteButton(div.querySelector(type === 'anime' ? '#favorite-anime-btn' : '#favorite-manga-btn'), item);

        // Fade in the card after a short delay to improve UX
        setTimeout(() => { div.style.opacity = '1'; }, 100);

        // Append the card to the container
        htmlElement.appendChild(div);

        // Fetch additional details to render badges
        // Using lazy loading to avoid hitting rate limits
        await getDetailsLazy(type, item.entry?.mal_id).then(details => {
            const badgesContainer = rec.renderBadges(details);
            div.appendChild(badgesContainer);
        });
    });
}

/**
 * Render latest news for a random favorite of the given type.
 * @param {'anime'|'manga'} type
 * @param {HTMLElement} htmlElement
 */
export async function renderNewsList(type, htmlElement) {
    // Clear existing content
    htmlElement.innerHTML = '';

    // Get a random favorite MAL ID of the specified type
    const mal_id = getRandomFavoriteMalId(type.charAt(0).toUpperCase() + type.slice(1));

    // Handle no favorites case
    if (!mal_id) {
        htmlElement.innerHTML = '<p>No favorite found to fetch news.</p>';
        return;
    }

    // Fetch news based on type
    const newsList = type === 'anime' ? await getAnimeNews(mal_id) : await getMangaNews(mal_id);

    // Handle no news case
    if (!newsList.length) {
        htmlElement.innerHTML = '<p>No news found.</p>';
        return;
    }

    // Render up to 4 news articles
    newsList.slice(0, 4).forEach(item => {
        const news = htmlElement.id?.includes('anime') ? new AnimeNews(item) : new MangaNews(item);
        const div = document.createElement('div');
        div.className = 'news-card';
        div.innerHTML = news.render();
        htmlElement.appendChild(div);
    });
}

/**
 * Render upcoming releases (seasons/upcoming) into a container.
 * Collects multiple pages until enough items are found; dedupes and sorts by date.
 * @param {HTMLElement} htmlElement
 */
export async function renderUpcomingReleases(htmlElement) {
    // Clear existing content
    htmlElement.innerHTML = '';

    // Initialize variables for fetching and filtering releases
    let releases = [];
    let validCards = [];
    let keepFetching = true;
    let page = 1;

    // Fetch multiple pages until we have enough valid cards or run out of pages
    while (validCards.length < 25 && keepFetching) {
        releases = await safeGetSeasonUpcoming(page);
        if (!releases || !releases.length) break;
        const filtered = releases.filter(item => item.aired?.from);
        validCards = validCards.concat(filtered);
        page++;
        keepFetching = releases.length > 0;
    }

    // Handle no valid releases case
    if (!validCards.length) {
        htmlElement.innerHTML = '<p>No upcoming releases found.</p>';
        return;
    }

    // Remove duplicates based on MAL ID
    const seen = new Set();
    validCards = validCards.filter(item => {
        const id = item.mal_id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });

    // Handle no valid releases with release date case
    if (!validCards.length) {
        htmlElement.innerHTML = '<p>No upcoming releases with release date found.</p>';
        return;
    }

    // Sort by release date ascending
    validCards.sort((a, b) => {
        const aDate = a.aired?.from;
        const bDate = b.aired?.from;
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        const aObj = typeof aDate === 'string' ? new Date(aDate) : new Date(aDate.year, (aDate.month || 1) - 1, aDate.day || 1);
        const bObj = typeof bDate === 'string' ? new Date(bDate) : new Date(bDate.year, (bDate.month || 1) - 1, bDate.day || 1);
        return aObj - bObj;
    });

    // Render up to 25 upcoming releases
    validCards.slice(0, 25).forEach(item => {
        const release = new Releases(item);
        const div = document.createElement('div');
        div.className = 'release-card';
        div.innerHTML = release.render();
        htmlElement.appendChild(div);
    });
}

/**
 * Get recommendations given a type, using a favorite seed when available.
 * Falls back to recent recommendations and deduplicates.
 * @param {'anime'|'manga'} type
 * @returns {Promise<Array<object>>}
 */
export async function getRecommendations(type) {
    // Get a random favorite MAL ID of the specified type
    const favoriteMalId = getRandomFavoriteMalId(type.charAt(0).toUpperCase() + type.slice(1));

    // Initialize recommendations variable
    let recommendations = null;

    // If a favorite exists, fetch recommendations based on it
    // Otherwise, fetch recent recommendations and filter for uniqueness
    if (favoriteMalId) {
        recommendations = type == 'anime' ? await getAnimeRecommendation(favoriteMalId) : await getMangaRecommendation(favoriteMalId);
        sessionStorage.setItem(`${type}Recommendations`, JSON.stringify(recommendations));
        return Promise.resolve(recommendations);
    } else {
        recommendations = type == 'anime' ? await getRecentAnimeRecommendations() : await getRecentMangaRecommendations();

        // Format recommendations to ensure consistent structure
        const formattedRecs = recommendations.map(item => (
            {
                entry: item.entry[0],
            },
            { 
                entry: item.entry[1],
            }
        ));

        // Remove duplicates based on MAL ID
        const seen = new Set();
        const uniqueRecs = formattedRecs.filter(item => {
            const id = item.entry?.mal_id;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        // Save unique recommendations to session storage
        sessionStorage.setItem(`${type}Recommendations`, JSON.stringify(uniqueRecs));

        // Return the unique recommendations
        return Promise.resolve(uniqueRecs);
    }
}

/**
 * Retrieve cached detail objects (by type) from sessionStorage.
 * Keys are stored as `${type}_${mal_id}` by getDetailsLazy.
 * Useful to filter/sort recommendations by full metadata.
 * @param {'anime'|'manga'} type
 * @returns {Array<object>} cached detail objects
 */
export function getCacheByType(type) {
    const chached = [];
    for (const key in sessionStorage) {
        if (key.startsWith(type) && key.includes('_')) {
            const item = sessionStorage.getItem(key);
            if (item) {
                chached.push(JSON.parse(item));
            }
        }
    }
    return chached;
}

/**
 * Populate the genres <select> for the given type.
 * @param {'anime'|'manga'} type
 * @param {HTMLSelectElement} selectElement
 */
export async function fillGenresFilter(type, selectElement) {
    const genresList = type === 'anime' ? await getAnimeGenres() : await getMangaGenres();
    selectElement.innerHTML = '<option value="all">All Genres</option>';
    genresList.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.mal_id;
        option.textContent = genre.name;
        selectElement.appendChild(option);
    });
}

/**
 * Render episodes list (used in episodes.html) for a specific anime.
 * @param {Array<object>} episodes
 * @param {HTMLElement} htmlElement
 */
export function renderEpisodesList(episodes, htmlElement) {
    htmlElement.innerHTML = '';
    episodes.forEach(episode => {
        const epObj = new Episodes(episode);
        const li = document.createElement('li');
        li.innerHTML = epObj.render();
        li.querySelector('#add-watchlist-btn').addEventListener('click', () => { addToWatchlist(episode) });
        htmlElement.appendChild(li);
    });
}

/**
 * Show details popup for anime or manga.
 * Fetches details, characters, and streaming links as needed.
 * Used in multiple pages such as search results and recommendations.
 * @param {number} mal_id
 * @param {'anime'|'manga'} type
 */
async function showDetails(mal_id, type) {
    // Get popup elements and show loading state
    const popup = document.getElementById('details-popup');
    const popupContent = document.getElementById('popup-details-content');
    popup.style.display = 'flex';
    popupContent.innerHTML = '<p>Loading details...</p>';

    // Initialize variables for details, characters, and streaming links
    let details = {};
    let characters = [];
    let streamingList = [];

    // Fetch details, characters, and streaming links as needed
    try {
        details = await getDetailsLazy(type, mal_id);

        const allCharacters = await getCharacters(type, mal_id);
        const mains = allCharacters.filter(c => c.role && c.role.toLowerCase() === 'main');
        const supports = allCharacters.filter(c => c.role && c.role.toLowerCase() === 'supporting');

        characters = mains.slice(0, 8);

        if (characters.length < 8) {
            characters = characters.concat(supports.slice(0, 8 - characters.length));
        }

        if (type === 'anime') {
            streamingList = await getAnimeStreamingLinks(mal_id);
        }

    } catch {
        popupContent.innerHTML = '<p>Failed to load details.</p>';
        return;
    }

    // Initialize HTML sections for trailer, streaming links, and episodes
    let trailerEmbed = '';
    let animeStreaming = '';
    let animeEpisodes = '';
    let soundtrackHtml = '';
    let whereToReadHtml = '';
    let relatedHtml = '';

    // Check if trailer exists and set up HTML
    if (details.trailer?.embed_url) {
        trailerEmbed = `<h4>Trailer</h4><iframe src="${details.trailer.embed_url}" frameborder="0" allowfullscreen style="width:100%;height:220px;"></iframe>`;
    }

    // Set up streaming links HTML if available
    if (streamingList.length) {
        animeStreaming = `<h4>Watch on</h4><p>${streamingList.map(link => `<a href="${link.url}" target="_blank">${link.name}</a>`).join(' | ')}</p>`;
    }

    // Set up episodes HTML if applicable
    if (details.type !== 'Movie' && type === 'anime') {
        animeEpisodes = `<h4>Episodes</h4><p>Total Episodes: ${details.episodes || 'N/A'} <a href="episodes.html?animeId=${details.mal_id}&animeTitle=${details.title}">(See all episodes)</a></p>`;
    }

    if (type === 'anime') {
        // Attempt to fetch soundtracks using a reasonable title candidate
        try {
            const stTitle = details.title_english || details.title || details.title_japanese || '';
            const tracks = await getSoundtracks(stTitle, 8);
            const st = new Soundtracks(tracks);
            soundtrackHtml = st.render();
        } catch {
            soundtrackHtml = '';
        }
    } else if (type === 'manga') {
        // Where to Read (official) via Jikan + AniList aggregation
        try {
            const title = details.title_english || details.title || details.title_japanese || '';
            const links = await getOfficialMangaLinks(mal_id, title);
            if (links.length) {
                whereToReadHtml = `<h4>Where to read</h4><p>${links.map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`).join(' | ')}</p>`;
            } else if (title) {
                const fallback = `https://www.google.com/search?q=${encodeURIComponent(`${title} official manga read`)}`;
                whereToReadHtml = `<h4>Where to read</h4><p><a class="where-fallback" href="${fallback}" target="_blank" rel="noopener noreferrer">Search official sources for “${title}”</a></p>`;
            }
        } catch { whereToReadHtml = '' }

        // Related (only for manga)
        if (Array.isArray(details.relations) && details.relations.length) {
            try {
                const items = details.relations.flatMap(rel =>
                    (rel.entry || []).map(e => ({ relation: rel.relation, entry: e }))
                ).slice(0, 10);
                if (items.length) {
                    relatedHtml = `
                        <!--<section class="related-section">-->
                          <h4>Related</h4>
                          <ul class="related-list">
                            ${items.map(it => {
                                const name = it.entry?.name || it.entry?.title || 'Unknown';
                                const url = it.entry?.url || '#';
                                const relation = it.relation || '';
                                return `<li class="related-item"><span class="rel-badge">${relation}</span><a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a></li>`;
                            }).join('')}
                          </ul>
                        <!--</section>-->`;
                }
            } catch { relatedHtml = '' }
        }
    }

    // Render the popup content
    popupContent.innerHTML = `
        <h3>${details.title}</h3>
        <p><strong>Synopsis:</strong> ${details.synopsis || 'No synopsis.'}</p>
        ${trailerEmbed}
        ${animeStreaming}
        ${animeEpisodes}
        ${whereToReadHtml}
        <h4>Characters</h4>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
        ${characters.map(c => `
            <div style="text-align:center;max-width:80px;">
            <img src="${c.character?.images?.jpg?.image_url || ''}" alt="${c.character?.name}" class="character-img" />
            <div style="font-size:0.9em;">${c.character?.name}</div>
            </div>
        `).join('')}
        </div>
        ${soundtrackHtml}
        ${relatedHtml}
    `;
}

/**
 * Bind favorite button behavior (toggle add/remove).
 * Used in multiple pages such as search results and recommendations.
 * @param {HTMLElement} htmlElement - the button element
 * @param {object} item - item or entry to add/remove from favorites
 */
function bindFavoriteButton(htmlElement, item) {
    if (!htmlElement) return;
    htmlElement.addEventListener('click', (e) => {
        e.preventDefault();

        let isFav = null;
        let mal_id = null;

        if (typeof item.mal_id === 'number') {
            isFav = isFavorite(item.mal_id);
            mal_id = item.mal_id;
        } else {
            isFav = isFavorite(item.entry.mal_id || item.entry[1]?.mal_id);
            mal_id = item.entry.mal_id || item.entry[1]?.mal_id;
        }
        
        if (isFav) {
            removeFavorite(mal_id);
            htmlElement.textContent = htmlElement.textContent.includes('Favorite') ?  '\u2606 Favorite' : '\u2606';
            htmlElement.setAttribute('data-fav', '0');
        } else {
            addFavorite(item);
            console.log(htmlElement.textContent);
            htmlElement.textContent = htmlElement.textContent.includes('Favorite') ?  '\u2605 Favorite' : '\u2605';
            htmlElement.setAttribute('data-fav', '1');
        }
    });
}

/**
 * Lazy-load details with sessionStorage caching to avoid repeated API calls.
 * @param {'anime'|'manga'} type
 * @param {number} mal_id
 * @returns {Promise<object>} details object from API or cache
 */
async function getDetailsLazy(type, mal_id) {
    // Retrieve from sessionStorage if cached
    // Otherwise, fetch from API and cache it
    const cacheKey = `${type}_${mal_id}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
        return Promise.resolve(JSON.parse(cached));
    } else {
        return await getDetails(type, mal_id).then(data => {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            return data;
        });
    }
}

/**
 * Throttle iterator: process an array of items one by one with a delay.
 * Helps avoid UI blocking and spreads out network calls for badges.
 * @param {Array<any>} recommendations
 * @param {(item:any)=>void|Promise<void>} fn - effect to run per item
 * @param {number} [delay=1200] - ms between invocations
 */
function throttleRecommendations(recommendations, fn, delay = 1200) {
  let i = 0;
  function next() {
    if (i >= recommendations.length) return;
    fn(recommendations[i]);
    i++;
    setTimeout(next, delay);
  }
  next();
}

/**
 * Safe wrapper to retry fetching season upcoming releases.
 * Uses a simple retry with fixed delay; API-level rate limiter handles pacing.
 * @param {number} page
 * @param {number} [maxRetries=3]
 * @returns {Promise<Array<object>>}
 */
async function safeGetSeasonUpcoming(page, maxRetries = 3) {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await getSeasonUpcoming(page);
        } catch (e) {
            attempt++;
            await new Promise(res => setTimeout(res, 1000));
        }
    }
    return [];
}
