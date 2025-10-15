// List item template for a single episode. Used in the Episodes page.
// Now includes compact badges for aired date, filler, and recap to expose more JSON fields clearly.
function episodeTemplate(episode) {
  const airedLabel = episode.aired ? new Date(episode.aired).toLocaleDateString() : null;
  return `
    <li class="episode-item">
      <div class="episode-number">Episode ${episode.mal_id}</div>
      <div class="episode-title">${episode.title || 'No title available'}</div>
      <div class="episode-badges">
        ${airedLabel ? `<span class="ep-badge ep-badge--aired" title="Aired">${airedLabel}</span>` : `<span class="ep-badge ep-badge--unaired" title="Aired">Unknown</span>`}
        ${episode.filler ? `<span class="ep-badge ep-badge--filler" title="Filler episode">Filler</span>` : ''}
        ${episode.recap ? `<span class="ep-badge ep-badge--recap" title="Recap episode">Recap</span>` : ''}
      </div>
      <a href="${episode.url}" target="_blank" rel="noopener noreferrer" class="episode-link" aria-label="Open episode on MyAnimeList">Watch Episode</a>
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
