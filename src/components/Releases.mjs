// Card for upcoming releases (season upcoming list), compact layout with chips.
function releasesTemplate(anime) {
  const title = anime.title_english || anime.title;
  const dateStr = formatDate(anime.aired?.from);
  const ym = formatMonthYear(anime.aired?.from);
  const type = anime.type || '';
  const status = anime.status || '';
  const rating = shortenRating(anime.rating);
  const typeClass = `type-${String(type).toLowerCase().replace(/\s+/g,'-')}`;
  return `
    <div class="upcoming-card" tabindex="-1">
      <div class="upcoming-media">
        <a href="${anime.url}" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(title)} on MyAnimeList">
          <img src="${anime.images?.webp?.image_url || ''}" alt="${escapeHtml(title)} poster" />
          ${dateStr ? `<span class="release-date" aria-label="Releases ${escapeHtml(dateStr)}">${dateStr}</span>` : ''}
        </a>
      </div>
      <div class="upcoming-body">
        <h3 class="upcoming-title">
          <a href="${anime.url}" target="_blank" rel="noopener" title="${escapeHtml(title)}">${escapeHtml(title)}</a>
        </h3>
        <div class="upcoming-meta">
          ${type ? `<span class="chip ${typeClass}" title="Type">${escapeHtml(type)}</span>` : ''}
          ${ym ? `<span class="chip" title="Release">${escapeHtml(ym)}</span>` : ''}
          ${rating ? `<span class="chip" title="Rating">${escapeHtml(rating)}</span>` : ''}
        </div>
      </div>
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

function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function shortenRating(r) {
  if (!r) return '';
  // Examples: "PG-13 - Teens 13 or older" -> "PG-13"
  const m = String(r).match(/^[A-Z0-9+\-]+/);
  return m ? m[0] : String(r);
}

function escapeHtml(s) {
  return String(s || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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
