import { getFavorites, removeFavorite } from './utils.js';
import Menu from './Menu.mjs';
import Footer from './Footer.mjs';

const menu = new Menu('favorites');
const footer = new Footer();

menu.init();
footer.init();

function renderFavorites(type, containerId) {
    const list = getFavorites().filter(f => f.type === type);
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (!list.length) {
    container.innerHTML = `<p>Nenhum favorito encontrado.</p>`;
    return;
    }
    list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'favorite-card';
    card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="favorite-img" />
        <div class="favorite-info">
        <h3>${item.title}</h3>
        <button class="remove-fav-btn" title="Remover dos favoritos">Remover</button>
        </div>
    `;
    card.querySelector('.remove-fav-btn').addEventListener('click', () => {
        removeFavorite(item.id);
        renderFavorites(type, containerId);
    });
    container.appendChild(card);
    });
}

renderFavorites('Anime', 'anime-favorites-list');
renderFavorites('Manga', 'manga-favorites-list');