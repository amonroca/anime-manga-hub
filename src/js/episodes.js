/**
 * Episodes page entry script
 *
 * Responsibilities:
 * - Initialize global UI (Menu and Footer)
 * - Parse query string for the target anime (animeId, animeTitle)
 * - Fetch episodes from the API layer (rate-limited globally)
 * - Enrich episode items with a stable id and the anime title
 * - Render the episodes list and page title
 */
import { renderEpisodesList } from './utils.js';
import Menu from './Menu.mjs';
import Footer from './Footer.mjs';
import { getAnimeEpisodes } from './api.js';

const menu = new Menu();
const footer = new Footer();

// Initialize common layout components
menu.init();
footer.init();

// DOM anchors for this page
const episodesList = document.getElementById('episodes-list');
const urlParams = new URLSearchParams(window.location.search);

// Query params provided by navigation from another page (e.g., details)
const animeId = urlParams.get('animeId');
const animeTitle = urlParams.get('animeTitle');

// Fetch episodes for the given anime.
// Note: getAnimeEpisodes goes through the centralized rate limiter in the API module.
const episodes = (await getAnimeEpisodes(animeId)).map(ep => ({
    ...ep,
    // Include parent anime title to simplify rendering
    anime_title: animeTitle,
    // Create a stable unique id for UI keys composed of animeId + MAL episode id
    episode_id: animeId + '_' + ep.mal_id,
}));
const episodesTitle = document.getElementById('anime-title'); 

// Update page header and render the list
episodesTitle.textContent = `Episodes - ${animeTitle}`;
renderEpisodesList(episodes, episodesList);

