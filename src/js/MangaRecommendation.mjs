import { isFavorite } from "./utils.js";

function mangaRecommendationTemplate(manga) {
  const title = manga.entry.title || 'No title';
  const imageUrl = manga.entry.images?.webp?.image_url || '';
  const fav = isFavorite(manga.entry.mal_id);

  return `
    <div class="card-image">
      <img src="${imageUrl}" alt="${title}" />
      <div class="card-actions">
        <button id="details-manga-btn" class="action-btn" title="Details">🔍</button>
        <button id="favorite-manga-btn" class="action-btn" title="Favorite">${fav ? '★' : '☆'}</button>
      </div>
    </div>
    <h3 class="card-title">${title}</h3>
    `;
}

export default class MangaRecommendation {
  constructor(manga) {
    this.manga = manga;
  }

  render() {
    return mangaRecommendationTemplate(this.manga);
  }

  renderBadges(details) {
    const container = document.createElement('div');
    container.className = 'card-badges';

    if (details.score) {
      const scoreBadge = document.createElement('span');
      scoreBadge.className = 'badge';
      scoreBadge.textContent = `★${details.score.toFixed(1)}`;
      container.appendChild(scoreBadge);
    }

    if (details.genres && details.genres.length > 0) {
      const genreBadge = document.createElement('span');
      genreBadge.className = 'badge';
      genreBadge.textContent = details.genres[0].name;
      container.appendChild(genreBadge);
    }

    if (details.published?.from) {
      const yearBadge = document.createElement('span');
      yearBadge.className = 'badge';
      yearBadge.textContent = details.published?.prop?.from?.year;
      container.appendChild(yearBadge);
    }

    return container;
  }
}