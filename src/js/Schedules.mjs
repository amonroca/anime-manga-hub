
function schedulesTemplate(anime) {
  return `
    <div class="upcoming-card">
      <a href="${anime.url}" target="_blank" rel="noopener">
        <img src="${anime.images?.jpg?.image_url || ''}" alt="${anime.title}" />
        <span class="release-date">${formatDate(anime.aired?.from)}</span>
      </a>
      <div class="upcoming-title">
        <a href="${anime.url}" target="_blank" rel="noopener">${anime.title_english || anime.title}</a>
      </div>
      <div class="upcoming-type">${anime.type || ''} ${anime.status ? '• ' + anime.status : ''}</div>
      <div>${anime.rating || 'N/A'}</div>
    </div>
  `;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default class Schedules {
  constructor(anime) {
    this.anime = anime;
  }

  render() {
    return schedulesTemplate(this.anime);
  }
}