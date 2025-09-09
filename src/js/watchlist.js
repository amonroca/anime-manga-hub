// watchlist.js
function getWatchlist() {
  return JSON.parse(localStorage.getItem('watchlist') || '[]');
}

function renderWatchlistPage() {
  const list = getWatchlist();
  const ul = document.getElementById('watchlist-page-list');
  ul.innerHTML = '';
  if (list.length === 0) {
    ul.innerHTML = '<li>Nenhum item salvo.</li>';
    return;
  }
  list.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${item.image}" alt="Capa" class="cover-img" />
      <span>${item.title}</span>
      <button data-id="${item.id}" class="remove-watchlist">Remover</button>
    `;
    ul.appendChild(li);
  });
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
