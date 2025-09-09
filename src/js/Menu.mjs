// src/components/Menu.js
export function renderMenu(active = "home") {
  return `
    <nav class="main-menu">
      <a href="/index.html" class="menu-link${active === 'home' ? ' active' : ''}">Home</a>
      <a href="/watchlist.html" class="menu-link${active === 'watchlist' ? ' active' : ''}">Watchlist</a>
    </nav>
  `;
}
