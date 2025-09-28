import { getCharacters, getDetails } from "./api";
import { isFavorite, addFavorite, removeFavorite } from "./utils.js";

function mangaCardTemplate(item) {
  const chapters = item.chapters ? `Chapters: ${item.chapters}` : '';
  const volumes = item.volumes ? `Volumes: ${item.volumes}` : '';
  const score = item.score ? `Score: ${item.score}` : 'N/A';
  const genres = item.genres ? `Genres: ${item.genres.map(g => g.name).join(', ')}` : '';
  const synopsis = (item.synopsis || 'No synopsis available.').slice(0, 140) + (item.synopsis && item.synopsis.length > 140 ? '...' : '');
  const fav = isFavorite(item.mal_id);
  return `
    <div class="card-title">${item.title}</div>
    <div class="card-info">
      <div class="card-meta">
        <img src="${item.images?.jpg?.image_url || ''}" alt="Cover" class="cover-img" />
        <span>${chapters}</span>
        <span>${volumes}</span>
        <span>${score}</span>
        <span>${genres}</span>
      </div>
      <div class="card-desc">
        <p>${synopsis}</p>
      </div>
      <div class="card-actions">
        <button class="show-details">Details</button>
        <button class="favorite-btn" data-fav="${fav ? '1' : '0'}">${fav ? '★ Favorite' : '☆ Favorite'}</button>
      </div>
    </div>
  `;
}

export default class MangaCard {
  constructor(item) {
    this.item = item;
    this.type = 'manga';
  }

  render() {
    return mangaCardTemplate(this.item);
  }

  bindFavoriteButton(cardElem) {
    const favBtn = cardElem.querySelector('.favorite-btn');
    if (!favBtn) return;
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isFav = isFavorite(this.item.mal_id);
      if (isFav) {
        removeFavorite(this.item.mal_id);
        favBtn.textContent = '☆ Favorite';
        favBtn.setAttribute('data-fav', '0');
      } else {
        addFavorite(this.item);
        favBtn.textContent = '★ Favorite';
        favBtn.setAttribute('data-fav', '1');
      }
    });
  }

  async showDetails() {
    const popup = document.getElementById('details-popup');
    const popupContent = document.getElementById('popup-details-content');
    popup.style.display = 'flex';
    popupContent.innerHTML = '<p>Loading details...</p>';

    let details = {};
    let characters = [];

    try {
      details = await getDetails(this.type, this.item.mal_id);
      const allCharacters = await getCharacters(this.type, this.item.mal_id);
      const mains = allCharacters.filter(c => c.role && c.role.toLowerCase() === 'main');
      const supports = allCharacters.filter(c => c.role && c.role.toLowerCase() === 'supporting');
      characters = mains.slice(0, 8);
      if (characters.length < 8) {
        characters = characters.concat(supports.slice(0, 8 - characters.length));
      }
    } catch {
      popupContent.innerHTML = '<p>Failed to load details.</p>';
      return;
    }

    popupContent.innerHTML = `
      <h3>${details.title}</h3>
      <p><strong>Synopsis:</strong> ${details.synopsis || 'No synopsis.'}</p>
      <h4>Characters</h4>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
        ${characters.map(c => `
          <div style="text-align:center;max-width:80px;">
            <img src="${c.character?.images?.jpg?.image_url || ''}" alt="${c.character?.name}" class="character-img" />
            <div style="font-size:0.9em;">${c.character?.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}
