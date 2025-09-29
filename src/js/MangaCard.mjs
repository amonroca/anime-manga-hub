import { isFavorite } from "./utils.js";

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
}
