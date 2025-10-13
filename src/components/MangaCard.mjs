// Card component to display a Manga in lists/results.
// Generates an HTML string with basic manga information and the favorite state.
// Button interactions are wired by the consumer (e.g., utils.renderResults).
import { isFavorite } from "../lib/utils.js";

/**
 * Builds the HTML for a manga card.
 *
 * Inputs/Outputs contract:
 * - input: item (object from Jikan API) with at least:
 *   - mal_id, title, images?.jpg?.image_url
 *   - chapters (number) and/or volumes (number) when available
 *   - score (number), genres (array of { name }), synopsis (string)
 * - output: HTML string to inject in the DOM
 */
function mangaCardTemplate(item) {
  // Chapters/Volumes meta lines (hidden when not available)
  const chapters = item.chapters ? `Chapters: ${item.chapters}` : '';
  const volumes = item.volumes ? `Volumes: ${item.volumes}` : '';
  // Score fallback to N/A when missing
  const score = item.score ? `Score: ${item.score}` : 'N/A';
  // Genres as comma-separated names
  const genres = item.genres ? `Genres: ${item.genres.map(g => g.name).join(', ')}` : '';
  // Short synopsis limited to ~140 chars
  const synopsis = (item.synopsis || 'No synopsis available.').slice(0, 140) + (item.synopsis && item.synopsis.length > 140 ? '...' : '');
  // Favorite state from localStorage via util
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

/**
 * Lightweight class to represent a Manga card.
 */
export default class MangaCard {
  /**
   * @param {object} item - Manga object as per Jikan API
   */
  constructor(item) {
    this.item = item;
    this.type = 'manga';
  }

  /**
   * @returns {string} HTML string ready to inject into the DOM
   */
  render() {
    return mangaCardTemplate(this.item);
  }
}
