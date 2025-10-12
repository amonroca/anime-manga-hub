// Card component to display an Anime in lists/results.
// This module generates an HTML string with basic anime information
// and the current state of the favorite button. Interaction (clicks) is
// handled by the consumer of this component (e.g., utils.renderResults binds the buttons).

import { isFavorite } from "./utils.js";

/**
 * Builds the HTML for an anime card.
 *
 * Contract (inputs/outputs):
 * - input: item (object from the Jikan API) with at least:
 *   - item.mal_id (number): MyAnimeList ID
 *   - item.title (string)
 *   - item.images?.jpg?.image_url (string) cover
 *   - item.aired?.from (string|date-like) to infer year (when year is missing)
 *   - item.type ("TV" | "Movie" | etc.) to decide episodes vs duration
 *   - item.episodes (number) or item.duration (string) depending on type
 *   - item.rating (string) and item.score (number) when available
 *   - item.genres (array of { name: string })
 *   - item.synopsis (string)
 * - output: HTML string ready to be injected into the DOM
 */
function animeCardTemplate(item) {
  // Year: uses item.year or derives it from aired.from; falls back to "N/A".
  const year = `Year: ${item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : 'N/A')}`;
  // Episodes or duration: for movies, show duration; otherwise, show episode count.
  const epOrDur = item.type === 'Movie' ? (item.duration ? `Duration: ${item.duration}` : '') : (item.episodes ? `Episodes: ${item.episodes}` : '');
  // Content rating when available.
  const rating = item.rating ? `Rating: ${item.rating}` : '';
  // Score when available; otherwise "N/A".
  const score = item.score ? `Score: ${item.score}` : 'N/A';
  // Genres: names joined by commas.
  const genres = item.genres ? `Genres: ${item.genres.map(g => g.name).join(', ')}` : '';
  // Short synopsis: trims to ~140 chars and appends ellipsis when needed.
  const synopsis = (item.synopsis || 'No synopsis available.').slice(0, 140) + (item.synopsis && item.synopsis.length > 140 ? '...' : '');
  // Favorite state: queries localStorage via util isFavorite(mal_id).
  const fav = isFavorite(item.mal_id);

  // Notes about CSS classes:
  // - card-title: anime title
  // - card-info: main container with meta, description, and actions
  // - card-meta: left block with cover and metadata (year, episodes/duration, score, rating, genres)
  // - card-desc: summary/synopsis
  // - card-actions: buttons (Details and Favorite)
  // - cover-img: cover image
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

/**
 * Lightweight class to represent an Anime card.
 * Wraps the item (anime data) and exposes render() that returns HTML.
 */
export default class AnimeCard {
  /**
   * @param {object} item - Anime object as per Jikan API (see animeCardTemplate for expected fields)
   */
  constructor(item) {
    this.item = item;
    this.type = 'anime';
  }

  /**
   * Generates the card HTML from the item.
   * @returns {string} HTML string ready to inject into the DOM
   */
  render() {
    return animeCardTemplate(this.item);
  }
}
