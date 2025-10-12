/**
 * Favorites page entry script
 *
 * Responsibilities:
 * - Initialize layout components (Menu and Footer)
 * - Read favorites from storage via utils.getFavorites()
 * - Render separate lists for Anime and Manga favorites
 * - Allow removing an item using utils.removeFavorite() and re-render the list
 */
import { getFavorites, removeFavorite } from './utils.js';
import Menu from './Menu.mjs';
import Footer from './Footer.mjs';

// Pass the current section to highlight the active nav item if supported by Menu
const menu = new Menu('favorites');
const footer = new Footer();

// Initialize global UI chrome
menu.init();
footer.init();

/**
 * Render a favorites list of a given type into a container.
 *
 * Data shape (from getFavorites):
 * - id: string|number (unique key)
 * - type: 'Anime' | 'Manga'
 * - title: string
 * - image: string (cover/thumbnail URL)
 *
 * Note: UI texts are currently in Portuguese. Consider extracting to a i18n helper if needed.
 *
 * @param {'Anime'|'Manga'} type - Which list to render.
 * @param {string} containerId - DOM element id where cards will be appended.
 */
function renderFavorites(type, containerId) {
    // Filter all favorites by the requested type
    const list = getFavorites().filter(f => f.type === type);

    // Resolve container and clear previous content
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Empty-state message (Portuguese text kept as-is for now)
    if (!list.length) {
        container.innerHTML = `<p>No favorites found.</p>`;
        return;
    }

    // Render each favorite as a simple card with image, title and a remove button
    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="favorite-img" />
        <div class="favorite-info">
            <h3>${item.title}</h3>
            <button class="remove-fav-btn" title="Remove from favorites">Remove</button>
        </div>
    `;
        // Bind removal: update storage and re-render to reflect changes immediately
        card.querySelector('.remove-fav-btn').addEventListener('click', () => {
            removeFavorite(item.id);
            renderFavorites(type, containerId);
        });
        container.appendChild(card);
    });
}

// Render both categories on page load
renderFavorites('Anime', 'anime-favorites-list');
renderFavorites('Manga', 'manga-favorites-list');