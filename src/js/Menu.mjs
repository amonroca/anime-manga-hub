import { convertToJson } from "./utils";

/**
 * Menu component: loads navigation items from a JSON file and injects a header nav.
 * The active menu item receives the 'menu-link-active' CSS class.
 */
export default class Menu {
  /**
   * @param {string} [active] - Name of the active menu item to highlight.
   */
  constructor(active) {
    this.active = active;
    // Relative path to a JSON config containing the menu structure
    this.path = '../json/menu.json';
  }

  /**
   * Initialize the menu: fetch items, render as HTML, and inject into <header>.
   * @returns {Promise<void>}
   */
  async init() {
    const navItems = await this.getMenuData();
    const navHtml = this.renderMenu(navItems, this.active);
    const header = document.querySelector('header');
    header.insertAdjacentHTML('afterbegin', navHtml);
  }

  /**
   * Retrieve menu entries from the configured JSON file.
   * Falls back to an empty array on network/parse failures.
   * @returns {Promise<Array<{Href:string,Label:string,Name:string}>>}
   */
  async getMenuData() {
    return await fetch(this.path).then(convertToJson).catch(() => []);
  }

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
    <nav class="main-menu">
      ${navItems.map(item => `
        <a href="${item.Href}" class="menu-link ${item.Name === active ? 'menu-link-active' : ''}">${item.Label}</a>
      `).join('')}
    </nav>
  `;
}
