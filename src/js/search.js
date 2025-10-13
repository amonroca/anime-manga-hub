/**
 * Search page script
 *
 * Responsibilities:
 * - Initialize Menu/Footer
 * - Load initial content (Top Animes) on DOMContentLoaded
 * - Handle search submissions (anime or manga) using Jikan API via api.js
 * - Render results into the results list container
 */
import Menu from '../components/Menu.mjs';
import { searchJikan, getTopAnimes } from '../lib/api.js';
import { renderResults } from '../lib/utils.js';
import Footer from '../components/Footer.mjs';

const menu = new Menu('search');
const footer = new Footer();

// Form and UI elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchType = document.getElementById('search-type');
const resultsList = document.getElementById('results-list');
const popup = document.getElementById('details-popup');
const closePopupBtn = document.getElementById('close-popup');

// Initialize UI
menu.init();
footer.init();

// Load top anime on page load to provide immediate content
window.addEventListener('DOMContentLoaded', async () => {
  resultsList.innerHTML = '<p>Loading top animes...</p>';
  const results = await getTopAnimes();
  renderResults(results, 'anime', resultsList);
});

// Handle search submission and forward to Jikan
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

// Basic details popup close behavior
closePopupBtn.addEventListener('click', () => {
  popup.style.display = 'none';
});
popup.addEventListener('click', (e) => {
  if (e.target === popup) popup.style.display = 'none';
});