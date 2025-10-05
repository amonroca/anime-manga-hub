import { isFavorite } from "./utils.js";

function animeRecommendationTemplate(anime) {
  const title = anime.entry.title || 'No title';
  const imageUrl = anime.entry.images?.webp?.image_url || '';
  const fav = isFavorite(anime.entry.mal_id);

  return `
    <div class="card-image">
      <img src="${imageUrl}" alt="${title}" />
      <div class="card-actions">
        <button id="details-anime-btn" class="action-btn" title="Details">🔍</button>
        <button id="favorite-anime-btn" class="action-btn" title="Favorite" data-fav="${fav ? '1' : '0'}">${fav ? '★' : '☆'}</button>
      </div>
    </div>
    <h3 class="card-title">${title}</h3>
  `;
}

export default class AnimeRecommendation {
  constructor(anime) {
    this.anime = anime;
  }

  render() {
    return animeRecommendationTemplate(this.anime);
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

    if (details.aired?.from) {
      const yearBadge = document.createElement('span');
      yearBadge.className = 'badge';
      yearBadge.textContent = details.aired.prop.from.year;
      container.appendChild(yearBadge);
    }

    return container;
  }
}