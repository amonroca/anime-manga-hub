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

export default class Watchlist {
    constructor() {
        this.list = JSON.parse(localStorage.getItem('watchlist') || '[]');
    }

    render() {
        if (this.list.length === 0) {
            return '<li>No items saved.</li>';
        } else {
            return this.list.map(item => watchlistTemplate(item)).join('');
        }
    }
}