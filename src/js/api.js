// src/api.js

// Busca animes ou mangás por termo
export async function searchJikan(query, type) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

// Busca top animes
export async function getTopAnimes(limit = 20) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/top/anime?limit=${limit}&limit=20`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

// Busca detalhes completos de anime/manga
export async function getDetails(type, mal_id) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/${type}/${mal_id}/full`);
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

// Busca personagens
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
