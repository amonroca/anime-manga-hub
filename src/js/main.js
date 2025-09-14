
// import { getKitsuUpcomingAnime } from './api.js';
import Menu from './Menu.mjs';
import Footer from './Footer.mjs';

const menu = new Menu('home');
const footer = new Footer();
menu.init();
footer.init();

// TODO: Refactor calendar and recommendations to separate module
// TODO: Redesign the homepage

/*const calendarList = document.getElementById('calendar-list');
const recommendationsList = document.getElementById('recommendations-list');

function getWeekday(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.getDay();
}

async function renderCalendar() {
  if (!calendarList) return;
  calendarList.classList.add('loading');
  calendarList.innerHTML = 'Carregando lançamentos...';
  const animes = await getKitsuUpcomingAnime(20);
  if (!animes.length) {
    calendarList.innerHTML = '<p>Nenhum lançamento encontrado.</p>';
    return;
  }

  const sorted = animes
    .filter(a => a.attributes.startDate)
    .sort((a, b) => new Date(a.attributes.startDate) - new Date(b.attributes.startDate))
    .slice(0, 5);
  calendarList.classList.remove('loading');
  calendarList.innerHTML = `
    <div class="calendar-list" style="width:100%;justify-content:center;">
      ${sorted.map(a => `
        <div class="calendar-day-col">
          <div class="calendar-day-header">${a.attributes.startDate ? new Date(a.attributes.startDate).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }) : '-'}</div>
          <div class="calendar-anime-card">
            <img src="${a.attributes.posterImage?.tiny || ''}" alt="${a.attributes.canonicalTitle}" />
            <div class="calendar-anime-title">${a.attributes.canonicalTitle}</div>
            <div class="calendar-anime-date">${a.attributes.startDate || '-'}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function renderRecommendations() {
  if (!recommendationsList) return;
  recommendationsList.classList.add('loading');
  recommendationsList.innerHTML = 'Carregando recomendações...';
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (!favs.length) {
    recommendationsList.innerHTML = '<p>Adicione animes aos favoritos para receber recomendações!</p>';
    return;
  }

  const genres = [];
  favs.forEach(fav => {
    if (fav.genres && Array.isArray(fav.genres)) {
      genres.push(...fav.genres);
    }
  });

  let url = 'https://kitsu.io/api/edge/anime?sort=-popularityRank&page[limit]=10';
  if (genres.length) {
    const genre = encodeURIComponent(genres[0]);
    url = `https://kitsu.io/api/edge/anime?filter[genres]=${genre}&sort=-popularityRank&page[limit]=10`;
  }
  try {
    const res = await fetch(url);
    const data = await res.json();
    const animes = data.data || [];
    if (!animes.length) {
      recommendationsList.innerHTML = '<p>Nenhuma recomendação encontrada.</p>';
      return;
    }
    recommendationsList.classList.remove('loading');
    recommendationsList.innerHTML = animes.map(a => `
      <div class="recommendation-card">
        <img src="${a.attributes.posterImage?.tiny || ''}" alt="${a.attributes.canonicalTitle}" />
        <div class="recommendation-info">
          <strong>${a.attributes.canonicalTitle}</strong>
        </div>
      </div>
    `).join('');
  } catch {
    recommendationsList.innerHTML = '<p>Erro ao buscar recomendações.</p>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  renderRecommendations();
});*/




