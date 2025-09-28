import AnimeCard from './AnimeCard.mjs';
import MangaCard from './MangaCard.mjs';
import AnimeNews from './AnimeNews.mjs';
import MangaNews from './MangaNews.mjs'; 
import AnimeRecommendation from './AnimeRecommendation.mjs';
import MangaRecommendation from './MangaRecommendation.mjs';
import Schedules from './Schedules.mjs';

export function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
}

export function isFavorite(id) {
    return getFavorites().some(f => f.id === String(id));
}

export function addFavorite(item) {
    const favs = getFavorites();
    if (!favs.find(f => f.id === String(item.id || item.mal_id))) {
        favs.push({
            id: String(item.id || item.mal_id),
            title: item.title || item.canonicalTitle,
            image: item.images?.jpg?.image_url || item.posterImage?.tiny || '',
            type: item.type === 'Manga' ? item.type : 'Anime',
        });
        localStorage.setItem('favorites', JSON.stringify(favs));
    }
}

export function removeFavorite(id) {
    let favs = getFavorites();
    favs = favs.filter(f => f.id !== String(id));
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
            div.querySelector('.show-details').addEventListener('click', () => card.showDetails());
            card.bindFavoriteButton(div);
            htmlElement.appendChild(div);
        });
    }
    else if (type === 'manga') {
        results.forEach(item => {
            const card = new MangaCard(item);
            const div = document.createElement('div');
            div.className = 'result-card';
            div.innerHTML = card.render();
            div.querySelector('.show-details').addEventListener('click', () => card.showDetails());
            card.bindFavoriteButton(div);
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

    recommendations.slice(0, 20).forEach(item => {
        const rec = htmlElement.id?.includes('anime') ? new AnimeRecommendation(item) : new MangaRecommendation(item);
        const div = document.createElement('div');
        div.className = 'carousel-item';
        div.innerHTML = rec.render();
        div.style.opacity = '0';
        div.querySelector('#details-btn')?.addEventListener('click', () => rec.showDetails());
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