import Menu from './Menu.mjs';
import { searchJikan, getTopAnimes } from './api.js';
import { renderResults } from './utils.js';
import Footer from './Footer.mjs';

const menu = new Menu('search');
const footer = new Footer();
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchType = document.getElementById('search-type');
const resultsList = document.getElementById('results-list');
const popup = document.getElementById('details-popup');
const closePopupBtn = document.getElementById('close-popup');

menu.init();
footer.init();

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