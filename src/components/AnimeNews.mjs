/**
 * Render a single anime news item into an HTML snippet.
 * Expects the shape returned by Jikan's news endpoint (v4), e.g. fields like
 * url, title, author_url, author_username, date, comments, excerpt, forum_url.
 *
 * Note: The top-level empty <a> acts as a clickable overlay when styled via CSS.
 *
 * @param {Object} news - News payload for a single article.
 * @param {string} news.url - Link to the full news article.
 * @param {string} news.title - Title of the article.
 * @param {string} [news.author_url] - Link to the author's page.
 * @param {string} [news.author_username] - Author handle/username.
 * @param {string|number|Date} [news.date] - Published date, converted via toLocaleDateString().
 * @param {number} [news.comments] - Number of comments in the forum thread.
 * @param {string} [news.excerpt] - Short summary/excerpt.
 * @param {string} [news.forum_url] - Link to the forum discussion.
 * @returns {string} HTML string for the news card.
 */
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
