import AnimeCard from './AnimeCard.mjs';
import MangaCard from './MangaCard.mjs';
// import { addToWatchlist } from './WatchList.mjs';

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
            const div = document.createElement('div');
            div.className = 'result-card';
            div.innerHTML = new AnimeCard(item).render();
            div.querySelector('.show-details').addEventListener('click', () => new AnimeCard(item).showDetails());
            // div.querySelector('.add-watchlist').onclick = () => addToWatchlist(item, type);
            htmlElement.appendChild(div);
        });
    }
    else if (type === 'manga') {
        results.forEach(item => {
            const div = document.createElement('div');
            div.className = 'result-card';
            div.innerHTML = new MangaCard(item).render();
            div.querySelector('.show-details').addEventListener('click', () => new MangaCard(item).showDetails());
            // div.querySelector('.add-watchlist').onclick = () => addToWatchlist(item, type);
            htmlElement.appendChild(div);
        });
    }
}