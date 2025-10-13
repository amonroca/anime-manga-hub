# Anime & Manga Hub

A lightweight hub to explore anime and manga using the Jikan v4 API, with Kitsu as a fallback for upcoming releases. Built with Vite (MPA) and ES Modules.

## Features

- Search anime or manga with filters
- Favorites and Watchlist with local persistence
- Recommendations and news (anime/manga)
- Upcoming releases and episodes list
- Centralized API access with global rate limiting to avoid HTTP 429

## Architecture

High level

- Presentation: vanilla JS modules + small UI components (cards, lists, badges, footer)
- Library (domain): API client with global rate limiter, utilities for rendering/state
- Data: small static assets like the navigation menu JSON
- Build: Vite in MPA mode (multi HTML entries)

Flow (happy path)

1. Page entry (`src/js/*.js`) wires header/footer and page-specific logic
2. UI components (`src/components/*`) render HTML snippets (no side effects)
3. Utilities (`src/lib/utils.js`) orchestrate rendering, favorites/watchlist, caching
4. API client (`src/lib/api.js`) executes HTTP calls through a global queue with:
   - Min interval between requests (~550ms)
   - Per-minute cap
   - Retries for 429/5xx with backoff, honoring `Retry-After` when present

Decisions & trade-offs

- Keep it framework-free (vanilla ESM) for small footprint and transparency
- Centralized rate limiting prevents scattered throttles and reduces 429
- Storage split: localStorage (long-lived state), sessionStorage (page/session cache)
- CSS: mobile-first base + larger-screen overrides; guard advanced features with `@supports`

## Project Structure

```
src/
  components/       # UI components (cards, lists, footer, etc.)
  data/             # Static data (e.g., menu.json)
  js/               # Page entry scripts (home, search, favorites, watchlist, episodes) + Menu.mjs
  lib/              # Library layer (api.js, utils.js)
  styles/           # CSS mobile-first (style.css) + larger screens (larger.css)
  *.html            # Pages (MPA entries)
```

Key modules/components

- `src/lib/api.js`: API access with a global rate limiter
- `src/lib/utils.js`: rendering, storage and UI helpers
- `src/components/*`: `AnimeCard`, `MangaCard`, `AnimeRecommendation`, `MangaRecommendation`, `AnimeNews`, `MangaNews`, `Releases`, `Episodes`, `Watchlist`, `Footer`
- `src/js/Menu.mjs`: responsive nav (hamburger + desktop) fed by `src/data/menu.json`
- `src/styles/style.css` (base), `src/styles/larger.css` (overrides)

## Scripts

- `npm run dev` — start dev server (Vite)
- `npm run build` — production build
- `npm run preview` — preview the production build

Notes

- PDF generation was removed; there is no `npm run pdf` script anymore
- MPA inputs are configured in `vite.config.js`

## Getting started

1. Install dependencies

```powershell
npm install
```

2. Development

```powershell
npm run dev
```

3. Production build

```powershell
npm run build
```

4. Preview build

```powershell
npm run preview
```

## Implementation notes

- Rate limiting: all Jikan calls go through a global queue (min interval, per-minute cap, retries on 429/5xx, honors `Retry-After`)
- Accessibility: consistent headings, proper labels, hamburger `aria-expanded`, close on Escape and link click
- State: favorites/watchlist in localStorage; details/pagination cache in sessionStorage
- CSS: mobile-first base + `@supports`-guarded scrollbar styling with WebKit fallback

## Menu structure

Defined in `src/data/menu.json`:

```json
[
  { "Id": 1, "Name": "home", "Label": "Home", "Href": "index.html" },
  { "Id": 2, "Name": "search", "Label": "Search", "Href": "search.html" },
  {
    "Id": 3,
    "Name": "watchlist",
    "Label": "Watchlist",
    "Href": "watchlist.html"
  },
  {
    "Id": 4,
    "Name": "favorites",
    "Label": "Favorites",
    "Href": "favorites.html"
  }
]
```

## Troubleshooting

- 429 Too Many Requests: limiter will pause and retry; wait a few seconds and try again
- Menu not showing: ensure `src/js/Menu.mjs` is included and `src/data/menu.json` exists
- “npm run pdf” fails: the script was removed and is no longer supported

---

MIT (see LICENSE if/when added)
