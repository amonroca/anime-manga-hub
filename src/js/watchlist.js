import Menu from "./Menu.mjs";
import Footer from "./Footer.mjs";
import Watchlist from "./Watchlist.mjs";

const menu = new Menu('watchlist');
const footer = new Footer();
menu.init();
footer.init();

function getWatchlist() {
  return JSON.parse(localStorage.getItem('watchlist') || '[]');
}

function renderWatchlistPage() {
  const ul = document.getElementById('watchlist-page-list');
  ul.innerHTML = '';
  const watchlist = new Watchlist();
  ul.innerHTML = watchlist.render();
}

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
