import { isFavorite } from "./utils.js";

function animeRecommendationTemplate(anime) {
  const title = anime.entry.title || anime.entry[1]?.title || 'No title';
  const imageUrl = anime.entry.images?.webp?.image_url || anime.entry[1]?.images?.webp?.image_url || '';
  const score = anime.entry.score ? `★ ${anime.entry.score}` : '★9.5';
  const type = anime.entry.type || 'Comic';
  const year = anime.entry.year || '2025';
  const fav = isFavorite(anime.entry.mal_id || anime.entry[1]?.mal_id);
  return `
    <div class="card-image">
      <img src="${imageUrl}" alt="${title}" />
      <div class="card-actions">
        <button id="details-anime-btn" class="action-btn" title="Details">🔍</button>
        <button id="favorite-anime-btn" class="action-btn" title="Favorite" data-fav="${fav ? '1' : '0'}">${fav ? '★' : '☆'}</button>
      </div>
      <div class="card-badges">
        ${score ? `<span class='badge'>${score}</span>` : ''}
        ${type ? `<span class='badge'>${type}</span>` : ''}
        ${year ? `<span class='badge'>${year}</span>` : ''}
      </div>
    </div>
    <h3 class="card-title">${title}</h3>
  `;
}

export default class AnimeRecommendation {
  constructor(anime) {
    this.anime = anime;
    this.animeCard = null;
  }

  render() {
    return animeRecommendationTemplate(this.anime);
  }
}