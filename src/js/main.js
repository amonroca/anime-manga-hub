
import { searchJikan, getAnimeStreamingLinks, getTopAnimes } from './api.js';
import { renderMenu } from './Menu.mjs';
import { renderResults } from './utils.js';

const header = document.querySelector('header');
if (header) {
  header.insertAdjacentHTML('afterbegin', renderMenu('home'));
}

function addToWatchlist(item) {
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

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchType = document.getElementById('search-type');
const resultsList = document.getElementById('results-list');
let resultsCountTag = document.getElementById('results-count');
if (!resultsCountTag) {
  resultsCountTag = document.createElement('div');
  resultsCountTag.id = 'results-count';
  resultsCountTag.style = 'margin: 1.2rem 0 0.5rem 0; font-size: 1.1rem; font-weight: bold; color: #646cff; text-align: left;';
  const main = document.querySelector('main') || document.body;
  main.insertBefore(resultsCountTag, main.firstChild);
}
const popup = document.getElementById('details-popup');
const popupContent = document.getElementById('popup-details-content');
const closePopupBtn = document.getElementById('close-popup');

window.addEventListener('DOMContentLoaded', async () => {
  resultsList.innerHTML = '<p>Loading top animes...</p>';
  const results = await getTopAnimes();
  renderResults(results, 'anime', resultsList);
});

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  const type = searchType.value;
  if (!query) return;
  resultsList.innerHTML = '<p>Searching...</p>';
  let results = [];
  if (type === 'anime') {
    results = await searchJikan(query, 'anime');
  } else {
    results = await searchJikan(query, 'manga');
  }
  renderResults(results, type, resultsList);
});

closePopupBtn.addEventListener('click', () => {
  popup.style.display = 'none';
});
popup.addEventListener('click', (e) => {
  if (e.target === popup) popup.style.display = 'none';
});
