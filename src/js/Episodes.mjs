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
  constructor(episode) {
    this.episode = episode;
  }

  render() {
    return episodeTemplate(this.episode);
  }
}