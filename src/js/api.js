export async function getKitsuUpcomingAnime(limit = 20) {
  try {
    const res = await fetch(`https://kitsu.io/api/edge/anime?sort=-startDate&filter[status]=upcoming&page[limit]=${limit}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getKitsuAnimeByIds(ids = []) {
  if (!ids.length) return [];
  try {
    const filter = ids.map(id => `filter[id]=${id}`).join('&');
    const res = await fetch(`https://kitsu.io/api/edge/anime?${filter}`);
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
    const res = await fetch(`https://api.jikan.moe/v4/top/anime?limit=${limit}&limit=20`);
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
