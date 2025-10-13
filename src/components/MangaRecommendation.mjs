// Compact card used in the recommendations carousel for Manga entries.
// Very similar to AnimeRecommendation, but reads `published` instead of `aired` for year.
import { isFavorite } from "../lib/utils.js";

/**
 * Builds the HTML snippet for a manga recommendation card.
 * - Expects `manga.entry` shape from Jikan recommendations endpoint.
 */
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
  /**
   * @param {object} manga - Recommendation object containing `entry`
   */
  constructor(manga) {
    this.manga = manga;
  }

  /**
   * Returns the base HTML (image + buttons + title).
   */
  render() {
    return mangaRecommendationTemplate(this.manga);
  }

  /**
   * Builds dynamic badges based on full details fetched lazily:
   * - score (★x.x)
   * - first genre name
   * - published year
   * @param {object} details - object from Jikan full details endpoint (manga)
   * @returns {HTMLDivElement} DOM node with badges
   */
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
