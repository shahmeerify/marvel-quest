/**
 * TMDB API client — optional enhancement.
 * Set VITE_TMDB_API_KEY in your .env.local to enable poster fetching.
 * Without the key, the app shows gradient placeholder images.
 *
 * TMDB API docs: https://developer.themoviedb.org/reference/intro/getting-started
 * Free account + API key: https://www.themoviedb.org/settings/api
 */

const API_KEY  = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
export const IMG_BASE = 'https://image.tmdb.org/t/p'

export const tmdbEnabled = Boolean(API_KEY)

/** Build a full image URL from a TMDB poster_path */
export function posterUrl(path, size = 'w300') {
  if (!path) return null
  return `${IMG_BASE}/${size}${path}`
}

export function backdropUrl(path, size = 'w780') {
  if (!path) return null
  return `${IMG_BASE}/${size}${path}`
}

/** Fetch a single title's TMDB data */
export async function fetchTMDB(tmdbId, tmdbType) {
  if (!API_KEY || !tmdbId) return null
  try {
    const type = tmdbType === 'movie' ? 'movie' : 'tv'
    const res = await fetch(`${BASE_URL}/${type}/${tmdbId}?api_key=${API_KEY}&language=en-US`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/** Normalize TMDB response into our app's shape */
export function normalizeTMDB(raw, tmdbType) {
  if (!raw) return null
  const isMovie = tmdbType === 'movie'
  return {
    posterPath:   raw.poster_path   ?? null,
    backdropPath: raw.backdrop_path ?? null,
    description:  (isMovie ? raw.overview : raw.overview) ?? '',
    imdbRating:   raw.vote_average  ? Math.round(raw.vote_average * 10) / 10 : null,
    releaseYear:  isMovie
      ? raw.release_date?.slice(0, 4)
      : raw.first_air_date?.slice(0, 4),
  }
}

// Cache TTL: 7 days in ms
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000
const LS_KEY = 'mq_tmdb_cache'

function loadCache() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cache))
  } catch {}
}

/**
 * Fetches TMDB data for a single title, using localStorage as cache.
 * Returns normalized data or null if unavailable.
 */
export async function getTMDBData(tmdbId, tmdbType) {
  if (!API_KEY || !tmdbId) return null
  const cache = loadCache()
  const cacheKey = `${tmdbType}:${tmdbId}`
  const entry = cache[cacheKey]

  if (entry && Date.now() - entry.fetchedAt < CACHE_TTL) {
    return entry.data
  }

  const raw = await fetchTMDB(tmdbId, tmdbType)
  const data = normalizeTMDB(raw, tmdbType)

  if (data) {
    cache[cacheKey] = { data, fetchedAt: Date.now() }
    saveCache(cache)
  }
  return data
}

/**
 * Bulk-fetches TMDB data for all titles concurrently (with rate-limit throttle).
 * Skips entries already in cache or with tmdbId === 0.
 */
export async function prefetchAllTMDB(titles, onProgress) {
  if (!API_KEY) return

  const cache = loadCache()
  const toFetch = titles.filter((t) => {
    if (!t.tmdbId) return false
    const key = `${t.tmdbType}:${t.tmdbId}`
    const entry = cache[key]
    return !entry || Date.now() - entry.fetchedAt >= CACHE_TTL
  })

  // Deduplicate by tmdbId+type (split AoS seasons share same tmdbId)
  const seen = new Set()
  const unique = toFetch.filter((t) => {
    const k = `${t.tmdbType}:${t.tmdbId}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  for (let i = 0; i < unique.length; i++) {
    const t = unique[i]
    const key = `${t.tmdbType}:${t.tmdbId}`
    const raw = await fetchTMDB(t.tmdbId, t.tmdbType)
    const data = normalizeTMDB(raw, t.tmdbType)
    if (data) cache[key] = { data, fetchedAt: Date.now() }
    if (onProgress) onProgress(i + 1, unique.length)
    // Respect TMDB rate limit: ~40 req/10s
    if (i % 38 === 37) await new Promise((r) => setTimeout(r, 1500))
  }

  saveCache(cache)
  return cache
}

/** Synchronously read from cache (no fetch) */
export function getCachedTMDB(tmdbId, tmdbType) {
  if (!tmdbId) return null
  const cache = loadCache()
  const entry = cache[`${tmdbType}:${tmdbId}`]
  return entry?.data ?? null
}
