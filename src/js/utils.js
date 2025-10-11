import AnimeCard from './AnimeCard.mjs';
import MangaCard from './MangaCard.mjs';
import AnimeNews from './AnimeNews.mjs';
import MangaNews from './MangaNews.mjs'; 
import Releases from './Releases.mjs';
import Episodes from './Episodes.mjs';
import AnimeRecommendation from './AnimeRecommendation.mjs';
import MangaRecommendation from './MangaRecommendation.mjs';
import { getCharacters, getDetails, getAnimeStreamingLinks, getRecentAnimeRecommendations, getAnimeRecommendation, 
    getRecentMangaRecommendations, getMangaRecommendation, getAnimeGenres, getMangaGenres, getAnimeNews, getMangaNews,
    getSeasonUpcoming } from "./api";

export function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
}

export function isFavorite(id) {
    return getFavorites().some(f => f.id === id);
}

export function addFavorite(item) {

    const favs = getFavorites();
    let mal_id = null;

    if (typeof item.mal_id === 'number') {
        mal_id = item.mal_id;
    } else {
        mal_id = item.entry.mal_id;
    }

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

export function removeFavorite(id) {
    let favs = getFavorites();
    favs = favs.filter(f => f.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favs));
}

export function getRandomFavoriteMalId(type) {
    const favs = getFavorites().filter(f => f.type === type);
    if (!favs.length) return null;
    const random = favs[Math.floor(Math.random() * favs.length)];
    return random.id;
}

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

export function renderResults(results, type, htmlElement) {
    htmlElement.innerHTML = '';
    createOrUpdateResultCountingTag(results.length);

    if (!results.length) {
        htmlElement.innerHTML = '<p>No results found.</p>';
        return;
    }

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

export function convertToJson(res) {
    if (res.ok) {
        return res.json();
    } else {
        throw new Error('Bad response');
    }
}

export function addToWatchlist(item) {
    let list = JSON.parse(localStorage.getItem('watchlist') || '[]');
    if (!list.find(i => i.id === String(item.episode_id))) {
        list.push({
        id: String(item.episode_id),
        anime_title: item.anime_title,
        episode_title: item.title,
        mal_id: String(item.mal_id),
        url: item.url,
        });
        localStorage.setItem('watchlist', JSON.stringify(list));
        alert('Added to the watchlist!');
    } else {
        alert('Already in the watchlist!');
    }
}

export function renderRecommendations(recommendations, htmlElement) {
    const type = htmlElement.id?.includes('anime') ? 'anime' : 'manga';
    htmlElement.innerHTML = '';
    if (!recommendations.length) {
        htmlElement.innerHTML = '<p>No recommendations found.</p>';
        return;
    }

    const limitedRecommendations = recommendations.slice(0, sessionStorage.getItem(`${type}RcPage`) ? Number(sessionStorage.getItem(`${type}RcPage`)) : 20);

    throttleRecommendations(limitedRecommendations, async item => {
        const rec = type === 'anime' ? new AnimeRecommendation(item) : new MangaRecommendation(item);
        const div = document.createElement('div');
        div.className = 'carousel-item';
        div.innerHTML = rec.render();
        div.style.opacity = '0';
        div.querySelector(type === 'anime' ? '#details-anime-btn' : '#details-manga-btn')?.addEventListener('click', () => showDetails(item.entry?.mal_id, type));
        item.type = type === 'anime' ? 'Anime' : 'Manga';
        bindFavoriteButton(div.querySelector(type === 'anime' ? '#favorite-anime-btn' : '#favorite-manga-btn'), item);
        setTimeout(() => { div.style.opacity = '1'; }, 100);
        htmlElement.appendChild(div);
        await getDetailsLazy(type, item.entry?.mal_id).then(details => {
            const badgesContainer = rec.renderBadges(details);
            div.appendChild(badgesContainer);
        });
    });
}

export async function renderNewsList(type, htmlElement) {
    htmlElement.innerHTML = '';
    const mal_id = getRandomFavoriteMalId(type.charAt(0).toUpperCase() + type.slice(1));

    if (!mal_id) {
        htmlElement.innerHTML = '<p>No favorite found to fetch news.</p>';
        return;
    }

    const newsList = type === 'anime' ? await getAnimeNews(mal_id) : await getMangaNews(mal_id);

    if (!newsList.length) {
        htmlElement.innerHTML = '<p>No news found.</p>';
        return;
    }

    newsList.slice(0, 4).forEach(item => {
        const news = htmlElement.id?.includes('anime') ? new AnimeNews(item) : new MangaNews(item);
        const div = document.createElement('div');
        div.className = 'news-card';
        div.innerHTML = news.render();
        htmlElement.appendChild(div);
    });
}

export async function renderUpcomingReleases(htmlElement) {
    htmlElement.innerHTML = '';
    let releases = [];
    let validCards = [];
    let keepFetching = true;
    let page = 1;
    let lastRequestTime = 0;

    while (validCards.length < 25 && keepFetching) {
        const now = Date.now();
        if (now - lastRequestTime < 350) {
            await new Promise(res => setTimeout(res, 350 - (now - lastRequestTime)));
        }
        lastRequestTime = Date.now();
        releases = await safeGetSeasonUpcoming(page);
        if (!releases || !releases.length) break;
        const filtered = releases.filter(item => item.aired?.from);
        validCards = validCards.concat(filtered);
        page++;
        keepFetching = releases.length > 0;
    }

    if (!validCards.length) {
        htmlElement.innerHTML = '<p>No upcoming releases found.</p>';
        return;
    }

    const seen = new Set();
    validCards = validCards.filter(item => {
        const id = item.mal_id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });

    if (!validCards.length) {
        htmlElement.innerHTML = '<p>No upcoming releases with release date found.</p>';
        return;
    }

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

    validCards.slice(0, 25).forEach(item => {
        const release = new Releases(item);
        const div = document.createElement('div');
        div.className = 'release-card';
        div.innerHTML = release.render();
        htmlElement.appendChild(div);
    });
}

export async function getRecommendations(type) {
    const favoriteMalId = getRandomFavoriteMalId(type.charAt(0).toUpperCase() + type.slice(1));
    let recommendations = null;
    if (favoriteMalId) {
        recommendations = type == 'anime' ? await getAnimeRecommendation(favoriteMalId) : await getMangaRecommendation(favoriteMalId);
        sessionStorage.setItem(`${type}Recommendations`, JSON.stringify(recommendations));
        return Promise.resolve(recommendations);
    } else {
        recommendations = type == 'anime' ? await getRecentAnimeRecommendations() : await getRecentMangaRecommendations();

        const formattedRecs = recommendations.map(item => (
            {
                entry: item.entry[0],
            },
            { 
                entry: item.entry[1],
            }
        ));

        const seen = new Set();
        const uniqueRecs = formattedRecs.filter(item => {
            const id = item.entry?.mal_id;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        sessionStorage.setItem(`${type}Recommendations`, JSON.stringify(uniqueRecs));
        return Promise.resolve(uniqueRecs);
    }
}

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

async function showDetails(mal_id, type) {
    const popup = document.getElementById('details-popup');
    const popupContent = document.getElementById('popup-details-content');
    popup.style.display = 'flex';
    popupContent.innerHTML = '<p>Loading details...</p>';

    let details = {};
    let characters = [];
    let streamingList = [];

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

    let trailerEmbed = '';
    let animeStreaming = '';
    let animeEpisodes = '';

    if (details.trailer?.embed_url) {
        trailerEmbed = `<h4>Trailer</h4><iframe src="${details.trailer.embed_url}" frameborder="0" allowfullscreen style="width:100%;height:220px;"></iframe>`;
    }

    if (streamingList.length) {
        animeStreaming = `<h4>Watch on</h4><p>${streamingList.map(link => `<a href="${link.url}" target="_blank">${link.name}</a>`).join(' | ')}</p>`;
    }

    if (details.type !== 'Movie') {
        animeEpisodes = `<h4>Episodes</h4><p>Total Episodes: ${details.episodes || 'N/A'} <a href="episodes.html?animeId=${details.mal_id}&animeTitle=${details.title}">(See all episodes)</a></p>`;
    }

    popupContent.innerHTML = `
        <h3>${details.title}</h3>
        <p><strong>Synopsis:</strong> ${details.synopsis || 'No synopsis.'}</p>
        ${trailerEmbed}
        ${animeStreaming}
        ${animeEpisodes}
        <h4>Characters</h4>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
        ${characters.map(c => `
            <div style="text-align:center;max-width:80px;">
            <img src="${c.character?.images?.jpg?.image_url || ''}" alt="${c.character?.name}" class="character-img" />
            <div style="font-size:0.9em;">${c.character?.name}</div>
            </div>
        `).join('')}
        </div>
    `;
}

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
            htmlElement.textContent = htmlElement.textContent.includes('Favorite') ?  '☆ Favorite' : '☆';
            htmlElement.setAttribute('data-fav', '0');
        } else {
            addFavorite(item);
            console.log(htmlElement.textContent);
            htmlElement.textContent = htmlElement.textContent.includes('Favorite') ?  '★ Favorite' : '★';
            htmlElement.setAttribute('data-fav', '1');
        }
    });
}

async function getDetailsLazy(type, mal_id) {
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