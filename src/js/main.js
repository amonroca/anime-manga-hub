import Menu from './Menu.mjs';
import Footer from './Footer.mjs';
import { getAnimeNews, getMangaNews, getSchedules } from './api';
import { renderNewsList, renderRecommendations, renderSchedules, getRecommendations, fillGenresFilter, getCacheByType } from './utils'; 

const menu = new Menu('home');
const footer = new Footer();
const animeResultsList = document.getElementById('anime-recommendations-list');
const mangaResultsList = document.getElementById('manga-recommendations-list');
const animeNewsList = document.getElementById('anime-news-list');
const mangaNewsList = document.getElementById('manga-news-list');
const schedulesList = document.getElementById('upcoming-releases-list');
const popup = document.getElementById('details-popup');
const closePopupBtn = document.getElementById('close-popup');
const animeGenreFilter = document.getElementById('anime-genre-filter');
const animeSortFilter = document.getElementById('anime-sort-filter');
const animeMoreBtn = document.getElementById('anime-more-btn');
const mangaGenreFilter = document.getElementById('manga-genre-filter');
const mangaSortFilter = document.getElementById('manga-sort-filter');
const mangaMoreBtn = document.getElementById('manga-more-btn');
const animeRcPage = 20;
const mangaRcPage = 20;

menu.init();
footer.init();

window.addEventListener('DOMContentLoaded', async () => {
  let animeRecommendations = {};
  let mangaRecommendations = {};

  animeRecommendations = await getRecommendations('anime');
  mangaRecommendations = await getRecommendations('manga');

  const schedules = await getSchedules();
  renderRecommendations(animeRecommendations, animeResultsList);
  renderRecommendations(mangaRecommendations, mangaResultsList);

  renderSchedules(schedules, schedulesList);

  await fillGenresFilter('anime', animeGenreFilter);
  sessionStorage.removeItem('filteredAnime');

  await fillGenresFilter('manga', mangaGenreFilter);
  sessionStorage.removeItem('filteredManga');

  //const animeNews = await getAnimeNews(anime_mal_id);
  //const mangaNews = await getMangaNews(manga_mal_id);

  //renderNewsList(animeNews, animeNewsList);
  //renderNewsList(mangaNews, mangaNewsList);
});

sessionStorage.setItem('animeRcPage', animeRcPage);
sessionStorage.setItem('mangaRcPage', mangaRcPage);

animeGenreFilter.addEventListener('change', (e) => {
  const genre = e.target.value;
  const recSize = sessionStorage.getItem('animeRcPage') ? Number(sessionStorage.getItem('animeRcPage')) : animeRcPage;
  const cachedAnimeObj = getCacheByType('anime');
  const animeRecommendations = sessionStorage.getItem('animeRecommendations') ? JSON.parse(sessionStorage.getItem('animeRecommendations')) : [];
  let filteredAnime = [];

  animeSortFilter.value = 'sortby';

  if (genre === 'all') {
    filteredAnime = animeRecommendations.slice(0, recSize);
  } else {
    const searchList = cachedAnimeObj.filter(anime => anime.genres[0]?.mal_id == genre);
    filteredAnime = animeRecommendations.slice(0, recSize).filter(anime => searchList.some(s => s.mal_id === anime.entry.mal_id));
  }

  sessionStorage.setItem('filteredAnime', JSON.stringify(filteredAnime));

  renderRecommendations(filteredAnime, animeResultsList);
});

animeSortFilter.addEventListener('change', (e) => {
  const sortBy = e.target.value;
  const cachedAnimeObj = getCacheByType('anime');
  const filteredAnime = sessionStorage.getItem('filteredAnime') ? JSON.parse(sessionStorage.getItem('filteredAnime')) : [];
  const animeRecommendations = sessionStorage.getItem('animeRecommendations') ? JSON.parse(sessionStorage.getItem('animeRecommendations')) : [];
  let sortedAnime = [...cachedAnimeObj.filter(a => filteredAnime.some(f => f.entry.mal_id === a.mal_id))];
  let sortedRec = [];
  
  if (sortBy === 'score') {
    sortedAnime.sort((a, b) => (b.score || 0) - (a.score || 0));
  } else if (sortBy === 'year') {
    sortedAnime.sort((a, b) => (b.aired.prop.from.year || 0) - (a.aired.prop.from.year || 0));
  } else if (sortBy === 'title') {
    sortedAnime.sort((a, b) => a.title.localeCompare(b.title));
  }

  sortedRec = sortedAnime.map(sa => animeRecommendations.find(ar => ar.entry.mal_id === sa.mal_id)).filter(Boolean);

  renderRecommendations(sortedRec, animeResultsList);
});

animeMoreBtn.addEventListener('click', () => {
  let recSize = sessionStorage.getItem('animeRcPage') ? Number(sessionStorage.getItem('animeRcPage')) : animeRcPage;
  recSize += 20;
  animeGenreFilter.value = 'all';
  animeSortFilter.value = 'sortby';
  sessionStorage.setItem('animeRcPage', recSize);
  const animeRecommendations = sessionStorage.getItem('animeRecommendations') ? JSON.parse(sessionStorage.getItem('animeRecommendations')) : [];
  sessionStorage.setItem('filteredAnime', JSON.stringify(animeRecommendations.slice(0, recSize)));
  renderRecommendations(animeRecommendations.slice(0, recSize), animeResultsList);
  if (recSize >= 60) {
    animeMoreBtn.disabled = true;
    animeMoreBtn.classList.add('btn-disabled');
  }
});

mangaGenreFilter.addEventListener('change', (e) => {
  const genre = e.target.value;
  const recSize = sessionStorage.getItem('mangaRcPage') ? Number(sessionStorage.getItem('mangaRcPage')) : 20;
  const cachedMangaObj = getCacheByType('manga');
  const mangaRecommendations = sessionStorage.getItem('mangaRecommendations') ? JSON.parse(sessionStorage.getItem('mangaRecommendations')) : [];
  let filteredManga = [];

  mangaSortFilter.value = 'sortby';

  if (genre === 'all') {
    filteredManga = mangaRecommendations.slice(0, recSize);
  } else {
    const searchList = cachedMangaObj.filter(manga => manga.genres[0]?.mal_id == genre);
    filteredManga = mangaRecommendations.slice(0, recSize).filter(manga => searchList.some(s => s.mal_id === manga.entry.mal_id));
  }

  sessionStorage.setItem('filteredManga', JSON.stringify(filteredManga));

  renderRecommendations(filteredManga, mangaResultsList);
});

mangaSortFilter.addEventListener('change', (e) => {
  const sortBy = e.target.value;
  const cachedMangaObj = getCacheByType('manga');
  const filteredManga = sessionStorage.getItem('filteredManga') ? JSON.parse(sessionStorage.getItem('filteredManga')) : [];
  const mangaRecommendations = sessionStorage.getItem('mangaRecommendations') ? JSON.parse(sessionStorage.getItem('mangaRecommendations')) : [];
  let sortedManga = [...cachedMangaObj.filter(m => filteredManga.some(f => f.entry.mal_id === m.mal_id))];
  let sortedRec = [];
  
  if (sortBy === 'score') {
    sortedManga.sort((a, b) => (b.score || 0) - (a.score || 0));
  } else if (sortBy === 'year') {
    sortedManga.sort((a, b) => (b.published?.prop?.from?.year || 0) - (a.published?.prop?.from?.year || 0));
  } else if (sortBy === 'title') {
    sortedManga.sort((a, b) => a.title.localeCompare(b.title));
  }

  sortedRec = sortedManga.map(sm => mangaRecommendations.find(mr => mr.entry.mal_id === sm.mal_id)).filter(Boolean);

  renderRecommendations(sortedRec, mangaResultsList);
});

mangaMoreBtn.addEventListener('click', () => {
  let recSize = sessionStorage.getItem('mangaRcPage') ? Number(sessionStorage.getItem('mangaRcPage')) : 20;
  recSize += 20;
  mangaGenreFilter.value = 'all';
  mangaSortFilter.value = 'sortby';
  sessionStorage.setItem('mangaRcPage', recSize);
  const mangaRecommendations = sessionStorage.getItem('mangaRecommendations') ? JSON.parse(sessionStorage.getItem('mangaRecommendations')) : [];
  sessionStorage.setItem('filteredManga', JSON.stringify(mangaRecommendations.slice(0, recSize)));
  renderRecommendations(mangaRecommendations.slice(0, recSize), mangaResultsList);
  if (recSize >= 60) {
    mangaMoreBtn.disabled = true;
    mangaMoreBtn.classList.add('btn-disabled');
  }
});

closePopupBtn.addEventListener('click', () => {
  popup.style.display = 'none';
});
popup.addEventListener('click', (e) => {
  if (e.target === popup) popup.style.display = 'none';
});