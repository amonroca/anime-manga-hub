import { isFavorite } from "./utils.js";

function animeCardTemplate(item) {
  const year = `Year: ${item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : 'N/A')}`;
  const epOrDur = item.type === 'Movie' ? (item.duration ? `Duration: ${item.duration}` : '') : (item.episodes ? `Episodes: ${item.episodes}` : '');
  const rating = item.rating ? `Rating: ${item.rating}` : '';
  const score = item.score ? `Score: ${item.score}` : 'N/A';
  const genres = item.genres ? `Genres: ${item.genres.map(g => g.name).join(', ')}` : '';
  const synopsis = (item.synopsis || 'No synopsis available.').slice(0, 140) + (item.synopsis && item.synopsis.length > 140 ? '...' : '');
  const fav = isFavorite(item.mal_id);
  return `
    <div class="card-title">${item.title}</div>
    <div class="card-info">
      <div class="card-meta">
        <img src="${item.images?.jpg?.image_url || ''}" alt="Cover" class="cover-img" />
        <span>${year}</span>
        <span>${epOrDur}</span>
        <span>${score}</span>
        <span>${rating}</span>
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

export default class AnimeCard {
  constructor(item) {
    this.item = item;
    this.type = 'anime';
  }

  render() {
    return animeCardTemplate(this.item);
  }
}
