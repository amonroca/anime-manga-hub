import menuData from "../data/menu.json";

/**
 * Menu component: loads navigation items from a JSON file and injects a header nav.
 * The active menu item receives the 'menu-link-active' CSS class.
 */
export default class Menu {
  /**
   * @param {string} [active] - Name of the active menu item to highlight.
   */
  constructor(active) { this.active = active; }

  /**
   * Initialize the menu: fetch items, render as HTML, and inject into <header>.
   * @returns {Promise<void>}
   */
  async init() {
  const navItems = Array.isArray(menuData) ? menuData : [];
    const navHtml = this.renderMenu(navItems, this.active);
    const header = document.querySelector('header');
    header.insertAdjacentHTML('afterbegin', navHtml);

    // Wire up mobile hamburger toggle
    const toggleBtn = header.querySelector('.menu-toggle');
    const links = header.querySelectorAll('.main-menu .menu-link');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('nav-open');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
        // Update accessible label to reflect the current action
        toggleBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      });
    }
    // Close menu on link click (mobile convenience)
    links.forEach((a) => a.addEventListener('click', () => {
      if (document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      }
    }));
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Data is loaded via ESM import; no fetch required.

  /**
   * Convert the items into HTML using the template function.
   * @param {Array<{Href:string,Label:string,Name:string}>} navItems
   * @param {string} active
   * @returns {string}
   */
  renderMenu(navItems, active) {
    return menuTemplate(navItems, active);
  }

}

/**
 * Build the navigation markup. The active item gets 'menu-link-active'.
 * @param {Array<{Href:string,Label:string,Name:string}>} navItems
 * @param {string} active
 * @returns {string}
 */
function menuTemplate(navItems, active) {
  return `
    <button class="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="site-menu">
      <span class="icon-bars" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </span>
      <span class="icon-close" aria-hidden="true" hidden>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </span>
    </button>
    <nav id="site-menu" class="main-menu" role="navigation">
      ${navItems.map(item => `
        <a href="${item.Href}" class="menu-link ${item.Name === active ? 'menu-link-active' : ''}">${item.Label}</a>
      `).join('')}
    </nav>
  `;
}
