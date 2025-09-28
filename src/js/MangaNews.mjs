function mangaNewsTemplate(manga) {
  return `
        <a href="${manga.url}" target="_blank" rel="noopener"></a>
        <div class="news-content">
            <h3 class="news-title">
                <a href="${manga.url}" target="_blank" rel="noopener">${manga.title}</a>
            </h3>
            <div class="news-meta">
                <span class="news-author">
                    <a href="${manga.author_url}" target="_blank" rel="noopener">${manga.author_username}</a>
                </span>
                <span class="news-date">${new Date(manga.date).toLocaleDateString()}</span>
                <span class="news-comments">${manga.comments} comments</span>
            </div>
            <p class="news-summary">${manga.excerpt}</p>
            <a class="news-forum" href="${manga.forum_url}" target="_blank" rel="noopener">Discuss on Forum</a>
        </div>
    `;
}

export default class MangaNews {
  constructor(manga) {
    this.manga = manga;
  }

  render() {
    return mangaNewsTemplate(this.manga);
  }
}