import Menu from './Menu.mjs';
import Footer from './Footer.mjs';
import { getRecentAnimeRecommendations, getAnimeRecommendation, getRecentMangaRecommendations, getMangaRecommendation, getAnimeNews, getMangaNews, getSchedules } from './api';
import { renderNewsList, renderRecommendations, renderSchedules, getRandomFavoriteMalId } from './utils'; 

const menu = new Menu('home');
const footer = new Footer();
const animeResultsList = document.getElementById('anime-recommendations-list');
const mangaResultsList = document.getElementById('manga-recommendations-list');
const animeNewsList = document.getElementById('anime-news-list');
const mangaNewsList = document.getElementById('manga-news-list');
const schedulesList = document.getElementById('upcoming-releases-list');
const popup = document.getElementById('details-popup');
const closePopupBtn = document.getElementById('close-popup');
menu.init();
footer.init();

window.addEventListener('DOMContentLoaded', async () => {
  const anime_mal_id = getRandomFavoriteMalId('Anime');
  const manga_mal_id = getRandomFavoriteMalId('Manga');
  let animeRecommendations = {};
  let mangaRecommendations = {};

  if (anime_mal_id) {
    animeRecommendations = await getAnimeRecommendation(anime_mal_id);
  } else {
    animeRecommendations = await getRecentAnimeRecommendations();
  }

  if (manga_mal_id) {
    mangaRecommendations = await getMangaRecommendation(manga_mal_id);
  } else {
    mangaRecommendations = await getRecentMangaRecommendations();
  }

  const animeNews = await getAnimeNews(anime_mal_id);
  const mangaNews = await getMangaNews(manga_mal_id);
  const schedules = await getSchedules();
  renderRecommendations(animeRecommendations, animeResultsList);
  renderRecommendations(mangaRecommendations, mangaResultsList);
  renderNewsList(animeNews, animeNewsList);
  renderNewsList(mangaNews, mangaNewsList);
  renderSchedules(schedules, schedulesList);
});

closePopupBtn.addEventListener('click', () => {
  popup.style.display = 'none';
});
popup.addEventListener('click', (e) => {
  if (e.target === popup) popup.style.display = 'none';
});