import { convertToJson } from "./utils";
export default class Menu {
  constructor(active) {
    this.active = active;
    this.path = '../json/menu.json';
  }

  async init() {
    const navItems = await this.getMenuData();
    const navHtml = this.renderMenu(navItems, this.active);
    const header = document.querySelector('header');
    header.insertAdjacentHTML('afterbegin', navHtml);
  }

  async getMenuData() {
    return await fetch(this.path).then(convertToJson).catch(() => []);
  }

  renderMenu(navItems, active) {
    return menuTemplate(navItems, active);
  }

}

function menuTemplate(navItems, active) {
  return `
    <nav class="main-menu">
      ${navItems.map(item => `
        <a href="${item.Href}" class="menu-link ${item.Name === active ? 'menu-link-active' : ''}">${item.Label}</a>
      `).join('')}
    </nav>
  `;
}
