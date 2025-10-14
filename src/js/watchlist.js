/**
 * Watchlist page script
 *
 * Responsibilities:
 * - Initialize Menu/Footer
 * - Load items from localStorage 'watchlist'
 * - Render full list using Watchlist component
 * - Handle item removal (update storage and re-render)
 */
import Menu from "../components/Menu.mjs";
import Footer from "../components/Footer.mjs";
import Watchlist from "../components/Watchlist.mjs";

const menu = new Menu('watchlist');
const footer = new Footer();
menu.init();
footer.init();

/**
 * Retrieve the watchlist array from localStorage.
 * @returns {Array<{id:string,title:string,image:string,type:string}>}
 */
function getWatchlist() {
  return JSON.parse(localStorage.getItem('watchlist') || '[]');
}

/**
 * Render the watchlist page by delegating the markup to the Watchlist component.
 */
function renderWatchlistPage() {
  const ul = document.getElementById('watchlist-page-list');
  ul.innerHTML = '';
  const watchlist = new Watchlist();
  ul.innerHTML = watchlist.render();
}

// Wire up DOMContentLoaded and removal handler (event delegation on the list container)
document.addEventListener('DOMContentLoaded', () => {
  renderWatchlistPage();
  document.getElementById('watchlist-page-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-watchlist')) {
      const id = e.target.getAttribute('data-id');
      let list = getWatchlist();
      list = list.filter(item => item.id !== id);
      localStorage.setItem('watchlist', JSON.stringify(list));
      renderWatchlistPage();
    }
  });
});
