export default class Footer {
  constructor() {}

  async init() {
    document.querySelector('footer').innerHTML = this.renderFooter();
  }

  renderFooter() {
    return footerTemplate();
  }
}

function footerTemplate() {
  return `<p>Made with Jikan & Kitsu APIs</p>`;
}
