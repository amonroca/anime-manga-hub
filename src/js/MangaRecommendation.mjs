function mangaRecommendationTemplate(manga) {
  const title = manga.entry.title || manga.entry[1]?.title || 'No title';
  const imageUrl = manga.entry.images?.webp?.image_url || manga.entry[1]?.images?.webp?.image_url || '';
  const score = manga.entry.score ? `★ ${manga.entry.score}` : '★9.5';
  const type = manga.entry.type || 'Comic';
  const year = manga.entry.year || '2025';
  return `
    <div class="card-image">
      <img src="${imageUrl}" alt="${title}" />
      <div class="card-actions">
        <button class="action-btn" title="Details">🔍</button>
        <button class="action-btn" title="Favorite">☆</button>
      </div>
      <div class="card-badges">
        ${score ? `<span class='badge'>${score}</span>` : ''}
        ${type ? `<span class='badge'>${type}</span>` : ''}
        ${year ? `<span class='badge'>${year}</span>` : ''}
      </div>
    </div>
    <h3 class="card-title">${title}</h3>
    `;
}

export default class MangaRecommendation {
  constructor(manga) {
    this.manga = manga;
  }

  render() {
    return mangaRecommendationTemplate(this.manga);
  }
}