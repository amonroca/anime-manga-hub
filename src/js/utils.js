import AnimeCard from './AnimeCard.mjs';
import MangaCard from './MangaCard.mjs';
import AnimeNews from './AnimeNews.mjs';
import MangaNews from './MangaNews.mjs'; 
import AnimeRecommendation from './AnimeRecommendation.mjs';
import MangaRecommendation from './MangaRecommendation.mjs';
import Schedules from './Schedules.mjs';
import { getCharacters, getDetails, getAnimeStreamingLinks } from "./api";

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
        mal_id = item.entry.mal_id || item.entry[1]?.mal_id;
    }

    if (!favs.find(f => f.id === mal_id)) {
        favs.push({
            id: mal_id,
            title: item.title || item.entry.title || item.entry[1]?.title || 'No title',
            image: item.images?.webp?.image_url || item.entry.images?.webp?.image_url || item.entry[1]?.images?.webp?.image_url || 'No Image',
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
  if (!list.find(i => i.id === String(item.mal_id))) {
    list.push({
      id: String(item.mal_id),
      title: item.title,
      image: item.images?.jpg?.image_url || '',
    });
    localStorage.setItem('watchlist', JSON.stringify(list));
    alert('Added to the watchlist!');
  }
}

export function renderRecommendations(recommendations, htmlElement) {
    htmlElement.innerHTML = '';
    if (!recommendations.length) {
        htmlElement.innerHTML = '<p>No recommendations found.</p>';
        return;
    }

    const seen = new Set();
    const uniqueRecommendations = recommendations.filter(item => {
        const mal_id = item.entry?.mal_id || item.entry?.[1]?.mal_id || item.mal_id;
        if (seen.has(mal_id)) return false;
        seen.add(mal_id);
        return true;
    });

    uniqueRecommendations.slice(0, 20).forEach(item => {
        const rec = htmlElement.id?.includes('anime') ? new AnimeRecommendation(item) : new MangaRecommendation(item);
        const div = document.createElement('div');
        div.className = 'carousel-item';
        div.innerHTML = rec.render();
        div.style.opacity = '0';
        div.querySelector(htmlElement.id.includes('anime') ? '#details-anime-btn' : '#details-manga-btn')?.addEventListener('click', () => showDetails(
            item.entry?.mal_id || item.entry?.[1]?.mal_id || item.mal_id, htmlElement.id.includes('anime') ? 'anime' : 'manga'));
        item.type = htmlElement.id?.includes('anime') ? 'Anime' : 'Manga';
        bindFavoriteButton(div.querySelector(htmlElement.id.includes('anime') ? '#favorite-anime-btn' : '#favorite-manga-btn'), item);
        setTimeout(() => { div.style.opacity = '1'; }, 100);
        htmlElement.appendChild(div);
    });
}

export function renderNewsList(newsList, htmlElement) {
    htmlElement.innerHTML = '';
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

export function renderSchedules(schedules, htmlElement) {
  htmlElement.innerHTML = '';
  if (!schedules.length) {
    htmlElement.innerHTML = '<p>No schedules found.</p>';
    return;
  }
  schedules.forEach(item => {
    const schedule = new Schedules(item);
    const div = document.createElement('div');
    div.className = 'schedule-card';
    div.innerHTML = schedule.render();
    htmlElement.appendChild(div);
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
        details = await getDetails(type, mal_id);

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

    if (details.trailer?.embed_url) {
        trailerEmbed = `<h4>Trailer</h4><iframe src="${details.trailer.embed_url}" frameborder="0" allowfullscreen style="width:100%;height:220px;"></iframe>`;
        animeStreaming = `<h4>Watch on</h4><p>${streamingList.map(link => `<a href="${link.url}" target="_blank">${link.name}</a>`).join(' | ')}</p>`;
    }

    popupContent.innerHTML = `
        <h3>${details.title}</h3>
        <p><strong>Synopsis:</strong> ${details.synopsis || 'No synopsis.'}</p>
        ${trailerEmbed}
        ${animeStreaming}
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