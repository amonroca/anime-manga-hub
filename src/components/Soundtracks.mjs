// Soundtracks component: renders a compact list of tracks with artwork, title/artist and an audio preview.
export default class Soundtracks {
  /**
   * @param {Array<{trackId:number,trackName:string,artistName:string,collectionName?:string,artworkUrl100?:string,previewUrl?:string}>} tracks
   */
  constructor(tracks = []) {
    this.tracks = Array.isArray(tracks) ? tracks.slice(0, 8) : [];
  }

  render() {
    if (!this.tracks.length) {
      return '<p class="soundtracks-empty">No soundtracks found.</p>';
    }
    const items = this.tracks.map(t => `
      <li class="soundtrack-item">
        <img class="soundtrack-art" src="${t.artworkUrl100 || ''}" alt="${t.collectionName || t.trackName || 'Artwork'}" />
        <div class="soundtrack-meta">
          <div class="soundtrack-title">${t.trackName || 'Unknown track'}</div>
          <div class="soundtrack-artist">${t.artistName || ''}</div>
        </div>
        ${t.previewUrl ? `<audio class="soundtrack-audio" controls preload="none" src="${t.previewUrl}"></audio>` : ''}
      </li>
    `).join('');

    return `
      <div class="soundtracks">
        <h4>Soundtracks</h4>
        <ul class="soundtracks-list">
          ${items}
        </ul>
      </div>
    `;
  }
}
