// Card for upcoming releases (season upcoming list).
// Displays image, date, title, type/status, and rating; trailer embed is intentionally commented out.
function releasesTemplate(anime) {
  return `
    <div class="upcoming-card">
      <a href="${anime.url}" target="_blank" rel="noopener">
        <img src="${anime.images?.webp?.image_url || ''}" alt="${anime.title}" />
        <span class="release-date">${formatDate(anime.aired?.from)}</span>
      </a>
      <div class="upcoming-title">
        <a href="${anime.url}" target="_blank" rel="noopener">${anime.title_english || anime.title}</a>
      </div>
      <div class="upcoming-type">${anime.type || ''} ${anime.status ? '• ' + anime.status : ''}</div>
      <div class="upcoming-rating">${anime.rating || 'N/A'}</div>
      <!--<div class="upcoming-trailer">
        ${anime.trailer?.embed_url ? `<iframe src="${anime.trailer.embed_url}" frameborder="0" allowfullscreen></iframe>` : 'No trailer available.'}
      </div>-->
    </div>
  `;
}

// Formats an ISO-like date string into a short en-US date label.
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default class Releases {
    /**
     * @param {object} anime - Upcoming anime object from Jikan
     */
    constructor(anime) {
        this.anime = anime;
    }

    /**
     * @returns {string} HTML string of the release card
     */
    render() {
        return releasesTemplate(this.anime);
    }
}
