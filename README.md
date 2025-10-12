# Anime & Manga Hub

A lightweight hub to explore anime and manga using the Jikan v4 API (with Kitsu fallback for upcoming releases). Built with Vite and ES Modules.

## Features

- Search anime or manga with filters
- Favorites and Watchlist with local persistence
- Recommendations and news (anime/manga)
- Upcoming releases and episodes list
- Centralized API access with global rate limiting to avoid HTTP 429

## Architecture

- UI: Vanilla JS modules; small components for cards, lists, and pages
- API: Centralized module with a global rate limiter (queue, min interval, per-minute cap, retries)
- Storage: localStorage (favorites, watchlist), sessionStorage (details cache)
- Build: Vite (dev/build/preview)

## Key Modules

- `src/js/api.js` — All remote calls wrapped by a global rate limiter
- `src/js/utils.js` — Rendering helpers, storage helpers, and small UI utilities
- Components: `AnimeCard.mjs`, `MangaCard.mjs`, `Releases.mjs`, `Episodes.mjs`, `AnimeNews.mjs`, `MangaNews.mjs`
- Pages: `search.js`, `favorites.js`, `watchlist.js`, `episodes.js`

## Project Structure

```
.
├─ index.html
├─ package.json
├─ public/
│  └─ vite.svg
├─ src/
│  ├─ main.js
│  ├─ style.css
│  └─ js/
│     ├─ api.js
│     ├─ utils.js
│     ├─ Menu.mjs
│     ├─ Footer.mjs
│     ├─ AnimeCard.mjs / MangaCard.mjs
│     ├─ AnimeNews.mjs / MangaNews.mjs
│     ├─ Releases.mjs / Episodes.mjs
│     ├─ search.js / favorites.js / watchlist.js / episodes.js
│     └─ Watchlist.mjs
└─ README.md
```

## Rate Limiting

- Min interval ~550ms between requests
- 60 requests/minute cap
- Retries with exponential backoff; respects Retry-After header when present

## Storage

- Favorites: `localStorage['favorites']`
- Watchlist: `localStorage['watchlist']`
- Details cache: `sessionStorage`

### Data shapes

- Favorite item:
  - `{ id: string|number, type: 'Anime'|'Manga', title: string, image: string }`
- Watchlist item:
  - `{ id: string, anime_title: string, mal_id: number, episode_title: string, url: string }`

## Pages and Routes

- Home (`index.html`): highlights and entry points
- Search (`src/js/search.js`): search form, top anime on load, results rendering
- Favorites (`src/js/favorites.js`): list and remove favorites
- Watchlist (`src/js/watchlist.js`): render saved episodes and remove entries
- Episodes (`src/js/episodes.js`): list episodes for a specific anime (expects `?animeId=...&animeTitle=...`)

## Development

- Start dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

### Getting Started

1. Install Node.js LTS (v18+ recomendado)
2. Install dependencies:
   - `npm install`
3. Run dev server:
   - `npm run dev`
4. Open the printed local URL in your browser

## Notes

- Some endpoints may occasionally respond with 429; the global limiter mitigates this.
- UI strings are being standardized to English; feel free to refine copy and accessibility attributes.

## Troubleshooting

- HTTP 429 from Jikan:
  - Requests are queued and rate-limited globally, but bursty user actions can still collide with upstream limits.
  - Try slower interactions or wait a few seconds; the limiter retries with backoff and honors Retry-After.
- CORS or network errors during dev:
  - Ensure you are running through the Vite dev server (`npm run dev`).
  - Check browser console for blocked requests and ad-blockers.
- Empty sections in UI:
  - Many widgets rely on network responses; transient failures return empty arrays to keep the UI responsive.
  - Try refreshing the page or inspecting the console for warnings.

## Contributing

Contributions are welcome. Please open an issue or submit a PR with a clear description and minimal changes.

## License

MIT (see LICENSE if/when added)
