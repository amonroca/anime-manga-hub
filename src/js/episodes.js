/**
 * Episodes page entry script
 *
 * Responsibilities:
 * - Initialize global UI (Menu and Footer)
 * - Parse query string for the target anime (animeId, animeTitle)
 * - Fetch episodes from the API layer (rate-limited globally)
 * - Enrich episode items with a stable id and the anime title
 * - Render the episodes list and page title
 * - Handle pagination (controls, state, history)
 *
 * Query params:
 * - animeId: number (required)
 * - animeTitle: string (required, for display purposes)
 * - page: number (optional, defaults to 1)
 *
 * Note: UI texts are currently in English. Consider extracting to a i18n helper if needed.
 */
import { renderEpisodesList } from '../lib/utils.js';
import Menu from '../components/Menu.mjs';
import Footer from '../components/Footer.mjs';
import { getAnimeEpisodesPaged } from '../lib/api.js';

const menu = new Menu();
const footer = new Footer();

// Initialize common layout components
menu.init();
footer.init();

// DOM anchors for this page
const episodesList = document.getElementById('episodes-list');
const paginationNav = document.getElementById('episodes-pagination');
const urlParams = new URLSearchParams(window.location.search);

// Query params provided by navigation from another page (e.g., details)
const animeId = urlParams.get('animeId');
const animeTitle = urlParams.get('animeTitle');
const initialPage = Math.max(1, parseInt(urlParams.get('page') || '1', 10) || 1);

const episodesTitle = document.getElementById('anime-title');
const liveRegion = document.getElementById('episodes-live');

// Handle missing required params gracefully
if (!animeId || !animeTitle) {
    episodesTitle.textContent = 'Episodes';
    const message = document.createElement('p');
    message.textContent = 'No anime specified. Please go back and select an anime.';
    episodesList.innerHTML = '';
    episodesList.appendChild(message);
    paginationNav.innerHTML = '';
    document.title = 'Episodes | Anime & Manga Hub';
    // Stop further execution on this page
    throw new Error('Missing animeId/animeTitle in query string');
}

episodesTitle.textContent = `Episodes - ${animeTitle}`;
document.title = `${animeTitle} – Episodes | Anime & Manga Hub`;

let currentPage = initialPage;
let lastPage = 1;

function announce(msg){
    if (!liveRegion) return;
    liveRegion.textContent = '';
    // Slight delay ensures screen readers detect the change
    setTimeout(() => { liveRegion.textContent = msg; }, 30);
}

function updateUrl(page){
    const qs = new URLSearchParams({
        animeId: String(animeId),
        animeTitle: String(animeTitle),
        page: String(page)
    });
    const newUrl = `${location.pathname}?${qs.toString()}`;
    history.pushState({ page }, '', newUrl);
}

async function loadPage(page = 1, { updateHistory = true } = {}) {
    paginationNav.innerHTML = 'Loading...';
    episodesList.setAttribute('aria-busy', 'true');
    announce(`Loading page ${page}...`);

    let data = [];
    let pagination = {};
    try {
        const res = await getAnimeEpisodesPaged(animeId, page);
        data = res.data || [];
        pagination = res.pagination || {};
    } catch (e) {
        episodesList.innerHTML = '<p>Fail to load episodes. Please try again.</p>';
        paginationNav.innerHTML = '';
        episodesList.removeAttribute('aria-busy');
        announce('Error loading episodes.');
        return;
    }
    // Enrich items with anime title and a stable id
    const enriched = data.map(ep => ({
        ...ep,
        anime_title: animeTitle,
        episode_id: animeId + '_' + ep.mal_id,
    }));
    renderEpisodesList(enriched, episodesList);

    // Update pagination state
    currentPage = Number(pagination?.current_page || page);
    lastPage = Number(pagination?.last_visible_page || currentPage);
    const hasNext = Boolean(pagination?.has_next_page);
    const hasPrev = currentPage > 1;

    // Render controls
    paginationNav.innerHTML = '';
    const nav = document.createElement('div');
    nav.className = 'pagination';

    const makeBtn = (label, targetPage, disabled = false, ariaLabel) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.disabled = disabled;
        if (ariaLabel) btn.setAttribute('aria-label', ariaLabel);
        btn.setAttribute('aria-disabled', String(!!disabled));
        btn.addEventListener('click', () => {
            if (!btn.disabled) loadPage(targetPage);
        });
        return btn;
    };

    nav.append(
        makeBtn('« First', 1, !hasPrev, 'First page'),
        makeBtn('‹ Prev', currentPage - 1, !hasPrev, 'Previous page'),
    );

    // Simple page indicators (current / last)
    const info = document.createElement('span');
    info.className = 'page-info';
    info.textContent = `Page ${currentPage} of ${lastPage}`;
    nav.appendChild(info);

    nav.append(
        makeBtn('Next ›', currentPage + 1, !hasNext, 'Next page'),
        makeBtn('Last »', lastPage, !hasNext, 'Last page')
    );

    paginationNav.appendChild(nav);

    episodesList.removeAttribute('aria-busy');
    announce(`Loading page ${currentPage} of ${lastPage}...`);
    // Update URL and focus title
    if (updateHistory) updateUrl(currentPage);
    // Move focus to the title for better SR/keyboard context
    episodesTitle.focus({ preventScroll: true });
}

// Initial load
loadPage(initialPage, { updateHistory: false });

// Handle back/forward navigation
window.addEventListener('popstate', () => {
    const qs = new URLSearchParams(window.location.search);
    const page = Math.max(1, parseInt(qs.get('page') || '1', 10) || 1);
    loadPage(page, { updateHistory: false });
});

