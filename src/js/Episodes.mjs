// List item template for a single episode. Used in the Episodes page.
// Displays episode number, title, aired date, filler/recap flags, and actions.
function episodeTemplate(episode) {
  return `
    <li class="episode-item">
      <div class="episode-number">Episode ${episode.mal_id}</div>
      <div class="episode-title">${episode.title || 'No title available'}</div>
      <div class="episode-aired">${episode.aired ? new Date(episode.aired).toLocaleDateString() : 'Aired date unknown'}</div>
      <div class="episode-filler">${episode.filler ? 'Filler Episode' : ''}</div>
      <div class="episode-recap">${episode.recap ? 'Recap Episode' : ''}</div>
      <a href="${episode.url}" target="_blank" rel="noopener" class="episode-link">Watch Episode</a>
      <button type="button" id="add-watchlist-btn" class="button" data-episode-id="${episode.mal_id}">Add to Watchlist</button>
    </li>
  `;
}
export default class Episodes {
  /**
   * @param {object} episode - Episode object from Jikan episodes endpoint.
   */
  constructor(episode) {
    this.episode = episode;
  }

  /**
   * @returns {string} HTML string for a single episode list item
   */
  render() {
    return episodeTemplate(this.episode);
  }
}