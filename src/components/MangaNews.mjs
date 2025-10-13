/**
 * Render a single manga news item into an HTML snippet.
 * Expects the shape returned by Jikan's manga news endpoint, including:
 * url, title, author_url, author_username, date, comments, excerpt, forum_url.
 *
 * The leading empty <a> can be styled as an overlay link via CSS for full-card clickability.
 *
 * @param {Object} manga - News payload for a single manga article.
 * @param {string} manga.url - Link to the full article.
 * @param {string} manga.title - Title of the article.
 * @param {string} [manga.author_url] - Link to author's page.
 * @param {string} [manga.author_username] - Author handle/username.
 * @param {string|number|Date} [manga.date] - Published date; displayed with toLocaleDateString().
 * @param {number} [manga.comments] - Number of comments.
 * @param {string} [manga.excerpt] - Short summary/excerpt text.
 * @param {string} [manga.forum_url] - Forum discussion link.
 * @returns {string} HTML string for the news card.
 */
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
