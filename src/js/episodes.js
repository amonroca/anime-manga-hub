import Episodes from './Episodes.mjs';
import { renderEpisodesList } from './utils.js';
import Menu from './Menu.mjs';
import Footer from './Footer.mjs';
import { getAnimeEpisodes, getDetails } from './api.js';

const menu = new Menu();
const footer = new Footer();

menu.init();
footer.init();

const episodesList = document.getElementById('episodes-list');
const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('animeId');
const animeTitle = urlParams.get('animeTitle');
const episodes = (await getAnimeEpisodes(animeId)).map(ep => ({
    ...ep,
    anime_title: animeTitle,
    episode_id: animeId + '_' + ep.mal_id,
}));
const episodesTitle = document.getElementById('anime-title'); 

episodesTitle.textContent = `Episodes - ${animeTitle}`;
renderEpisodesList(episodes, episodesList);

