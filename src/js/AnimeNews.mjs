function animeNewsTemplate(news) {
  return `
        <a href="${news.url}" target="_blank" rel="noopener"></a>
        <div class="news-content">
            <h3 class="news-title">
                <a href="${news.url}" target="_blank" rel="noopener">${news.title}</a>
            </h3>
            <div class="news-meta">
                <span class="news-author">
                    <a href="${news.author_url}" target="_blank" rel="noopener">${news.author_username}</a>
                </span>
                <span class="news-date">${new Date(news.date).toLocaleDateString()}</span>
                <span class="news-comments">${news.comments} comments</span>
            </div>
            <p class="news-summary">${news.excerpt}</p>
            <a class="news-forum" href="${news.forum_url}" target="_blank" rel="noopener">Discuss on Forum</a>
        </div>
    `;
}

export default class AnimeNews {
  constructor(anime) {
    this.anime = anime;
  }

  render() {
    return animeNewsTemplate(this.anime);
  }
}