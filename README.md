# Anime & Manga Hub

A lightweight hub to explore anime and manga using the Jikan v4 API, with Kitsu as a fallback for upcoming releases. Built with Vite (MPA) and ES Modules.

## Live Site

Production: https://anime-manga-hub.vercel.app/

## Features

- Search anime or manga with filters
- Favorites and Watchlist with local persistence
- Recommendations and news (anime/manga)
- Upcoming releases and episodes list
- Centralized API access with global rate limiting to avoid HTTP 429
- Episodes page with API-aware pagination (First/Prev/Next/Last), URL sync (?page), and accessibility (aria-live/aria-busy)
- Toast notifications (non-blocking) for actions like adding to watchlist
- Anime soundtracks section (iTunes Search API) with artwork and audio preview
- Manga details: official “Where to read” links (aggregated from Jikan + AniList) and a “Related” section (manga only)
- Mobile UX polish: hamburger menu toggles to a red “X” with ARIA, filters adjusted for small screens
- Improved contrast and theme color choices for better readability and compliance

## Architecture

High-level

- Presentation: vanilla JS modules + small UI components (cards, lists, badges, footer)
- Library (domain): API client with global rate limiter, utilities for rendering/state
- Data: small static assets like the navigation menu JSON
- Build: Vite in MPA mode (multiple HTML entries)

Flow (Happy Path)

1. Page entry (`src/js/*.js`) wires header/footer and page-specific logic
2. UI components (`src/components/*`) render HTML snippets (no side effects)
3. Utilities (`src/lib/utils.js`) orchestrate rendering, favorites/watchlist, caching
4. API client (`src/lib/api.js`) executes HTTP calls through a global queue with:
   - Min interval between requests (~550ms)
   - Per-minute cap
   - Retries for 429/5xx with backoff, honoring `Retry-After` when present

Decisions & Trade-offs

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

Key Modules and Components

- `src/lib/api.js`: API access with a global rate limiter
- `src/lib/utils.js`: rendering, storage and UI helpers
- `src/components/*`: `AnimeCard`, `MangaCard`, `AnimeRecommendation`, `MangaRecommendation`, `AnimeNews`, `MangaNews`, `Releases`, `Episodes`, `Watchlist`, `Footer`
- `src/js/Menu.mjs`: responsive nav (hamburger + desktop) fed by `src/data/menu.json`
- `src/styles/style.css` (base), `src/styles/larger.css` (overrides)

## Episodes: Usage

The episodes page requires query parameters to identify the anime:

- `animeId` — MAL id of the anime
- `animeTitle` — string shown in the page title
- Optional `page` — 1-based page index that syncs with the API pagination

Example:

```
episodes.html?animeId=1&animeTitle=Naruto&page=2
```

Notes:

- The page syncs the current page to the URL (pushState) and supports back/forward navigation (popstate).
- When parameters are missing, the page shows a friendly message and disables pagination.

## APIs Used

- Jikan v4 — primary data source (anime/manga, episodes, characters, external links)
- AniList GraphQL — used to enrich manga external links (official sources)
- iTunes Search API — used to fetch anime soundtracks with preview
- Kitsu — fallback source for upcoming releases

## API Coverage Map (UI ↔ Endpoints)

- Search (results list)

  - Endpoints: Jikan `GET /v4/anime?q=…`, `GET /v4/manga?q=…`
  - Code: `searchJikan()` in `src/lib/api.js` → render via `renderResults()` in `src/lib/utils.js` with `AnimeCard`/`MangaCard`.

- Details popup (anime)

  - Endpoints: Jikan `GET /v4/anime/{id}/full` (details + trailer), `GET /v4/anime/{id}/characters`, `GET /v4/anime/{id}/streaming`
  - Extras: iTunes Search API for soundtracks (`getSoundtracks()`)
  - Code: `getDetails()`, `getCharacters()`, `getAnimeStreamingLinks()` in `src/lib/api.js`; assembled in `showDetails()` in `src/lib/utils.js` and component `Soundtracks.mjs`.

- Details popup (manga)

  - Endpoints: Jikan `GET /v4/manga/{id}/full` (relations for “Related”), `GET /v4/manga/{id}/external`
  - Extras: AniList GraphQL `externalLinks` by `idMal` for official reading sources
  - Code: `getDetails()`, `getMangaExternalLinksJikan()`, `getMangaExternalLinksAniListByMal()`, aggregator `getOfficialMangaLinks()` in `src/lib/api.js`; rendering in `showDetails()` (`src/lib/utils.js`).

- Recommendations (anime/manga)

  - Endpoints: Jikan `GET /v4/recommendations/anime`, `GET /v4/anime/{id}/recommendations`, `GET /v4/recommendations/manga`, `GET /v4/manga/{id}/recommendations`
  - Code: `getRecentAnimeRecommendations()`, `getAnimeRecommendation()`, `getRecentMangaRecommendations()`, `getMangaRecommendation()` in `src/lib/api.js`; render `renderRecommendations()` in `src/lib/utils.js` with `AnimeRecommendation`/`MangaRecommendation`.

- News (anime/manga)

  - Endpoints: Jikan `GET /v4/anime/{id}/news`, `GET /v4/manga/{id}/news`
  - Code: `getAnimeNews()`, `getMangaNews()` → `renderNewsList()` in `src/lib/utils.js` with `AnimeNews`/`MangaNews`.

- Upcoming releases

  - Endpoints: Jikan `GET /v4/seasons/upcoming?page=N` (with Kitsu fallback when needed)
  - Code: `getSeasonUpcoming()` and `getKitsuUpcomingAnime()` in `src/lib/api.js`; collection and filtering in `renderUpcomingReleases()` (`src/lib/utils.js`).

- Genres (filtros)

  - Endpoints: Jikan `GET /v4/genres/anime?filter=genres`, `GET /v4/genres/manga?filter=genres`
  - Code: `getAnimeGenres()`, `getMangaGenres()` → `fillGenresFilter()` in `src/lib/utils.js`.

- Episodes page
  - Endpoints: Jikan `GET /v4/anime/{id}/episodes?page=N` (with pagination metadata)
  - Code: `getAnimeEpisodesPaged()` in `src/lib/api.js`; orchestration and URL sync in `src/js/episodes.js`; item rendering in `renderEpisodesList()` (`src/lib/utils.js`).

## Scripts

- `npm run dev` — start dev server (Vite)
- `npm run build` — production build
- `npm run preview` — preview the production build

Notes

- PDF generation was removed; there is no `npm run pdf` script anymore
- MPA entries are configured in `vite.config.js`

## Getting Started

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

## Implementation Notes

- Rate limiting: all Jikan calls go through a global queue (min interval, per-minute cap, retries on 429/5xx, honors `Retry-After`)
- Accessibility: consistent headings, proper labels, hamburger `aria-expanded`, close on Escape and link click. Episodes page adds `aria-live` announcements, `aria-busy` while loading, and focus is moved to the heading upon page change.
- State: favorites/watchlist in localStorage; details/pagination cache in sessionStorage
- CSS: mobile-first base + `@supports`-guarded scrollbar styling with WebKit fallback. Theme color updated for better contrast (`#4f46e5`, hover `#4338CA`).

## Recent Changes (Highlights)

- Episodes pagination implemented with URL sync and accessible controls
- Non-blocking toast notifications replaced `alert()` in watchlist actions
- Anime soundtracks section added (compact list with artwork and preview)
- Manga details: added “Where to read” (official links aggregated from Jikan + AniList) and “Related” (manga only)
- Hamburger button now toggles to a red “X” and improves ARIA states
- Close button tap highlight removed; subtle focus-visible outline retained
- Contrast improvements across buttons/badges and text

## Menu Structure

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

## Project Management (Trello)

- Board: https://trello.com/b/OxXu15iK/anime-manga-hub
- Notes: The board documents tasks and progress (e.g., Backlog → In Progress → Done) with labels and due dates where relevant. If access is restricted, ensure the board is shared with read access for reviewers.

## Troubleshooting

- 429 Too Many Requests: limiter will pause and retry; wait a few seconds and try again
- Menu not showing: ensure `src/js/Menu.mjs` is included and `src/data/menu.json` exists
- “npm run pdf” fails: the script was removed and is no longer supported
- Episodes page loads without content: make sure to include required query params `animeId` and `animeTitle` (and optionally `page`)

---

MIT (see LICENSE if/when added)
