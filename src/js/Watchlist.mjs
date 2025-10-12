/**
 * Render a single watchlist entry as an <li> element.
 *
 * Expected item shape:
 * - id: string (unique id composed of animeId + '_' + episodeMalId)
 * - anime_title: string
 * - mal_id: number (episode MAL id)
 * - episode_title: string
 * - url: string (link to episode/source)
 *
 * @param {Object} item
 * @returns {string} HTML string
 */
function watchlistTemplate(item) {
  return `
    <li>
      <span>${item.anime_title} - </span>
      <span>Episode ${item.mal_id} - </span>
      <span>${item.episode_title} - </span>
      <span><a href="${item.url}" target="_blank" rel="noopener">Watch Episode</a></span>
      <button type="button" data-id="${item.id}" class="remove-watchlist">Remove</button>
    </li>
  `;
}

/**
 * Watchlist component: loads items from localStorage and renders them as a list.
 */
export default class Watchlist {
  constructor() {
    /** @type {Array<Object>} */
    this.list = JSON.parse(localStorage.getItem('watchlist') || '[]');
  }

  /**
   * Render the full list or an empty-state message when no items exist.
   * @returns {string}
   */
  render() {
    if (this.list.length === 0) {
      return '<li>No items saved.</li>';
    } else {
      return this.list.map(item => watchlistTemplate(item)).join('');
    }
  }
}