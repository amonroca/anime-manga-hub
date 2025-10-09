export async function getKitsuUpcomingAnime(limit = 20) {
  try {
    const res = await fetch(`https://kitsu.io/api/edge/anime?sort=-startDate&filter[status]=upcoming&page[limit]=${limit}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function searchJikan(query, type) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getTopAnimes(limit = 20) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/top/anime?limit=${limit}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getDetails(type, mal_id) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/${type}/${mal_id}/full`);
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function getCharacters(type, mal_id) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/${type}/${mal_id}/characters`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getAnimeStreamingLinks(mal_id) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${mal_id}/streaming`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getSchedules() {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/schedules`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getRecentAnimeRecommendations() {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/recommendations/anime`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getAnimeRecommendation(mal_id) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${mal_id}/recommendations`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getRecentMangaRecommendations() {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/recommendations/manga`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getMangaRecommendation(mal_id) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/manga/${mal_id}/recommendations`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getAnimeNews(mal_id) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${mal_id}/news`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getMangaNews(mal_id) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/manga/${mal_id}/news`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getAnimeById(mal_id) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${mal_id}`);
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function getMangaById(mal_id) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/manga/${mal_id}`);
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function getAnimeGenres() {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/genres/anime?filter=genres`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getMangaGenres() {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/genres/manga?filter=genres`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getSeasonUpcoming(page = 1) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/seasons/upcoming?page=${page}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}