/**
 * One-time script: fetch TMDB metadata for all MCU titles and write to
 * src/data/tmdb-cache.json. Run with:
 *
 *   node scripts/fetch-tmdb.js
 *
 * Requires VITE_TMDB_API_KEY in .env.local
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Load API key from .env.local ───────────────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
    return Object.fromEntries(
      raw.split('\n')
        .map(l => l.split('='))
        .filter(([k]) => k?.trim())
        .map(([k, ...v]) => [k.trim(), v.join('=').trim()])
    )
  } catch {
    return {}
  }
}

const env = loadEnv()
const API_KEY = env.VITE_TMDB_API_KEY

if (!API_KEY) {
  console.error('❌  VITE_TMDB_API_KEY not found in .env.local')
  process.exit(1)
}

// ── Extract tmdbId / tmdbType pairs from mcu.js via regex ─────────────────
const mcuText = readFileSync(resolve(__dirname, '../src/data/mcu.js'), 'utf-8')
const tmdbIds   = [...mcuText.matchAll(/tmdbId:\s*(\d+)/g)].map(m => parseInt(m[1], 10))
const tmdbTypes = [...mcuText.matchAll(/tmdbType:\s*'([^']+)'/g)].map(m => m[1])

if (tmdbIds.length !== tmdbTypes.length) {
  console.error(`❌  tmdbId count (${tmdbIds.length}) ≠ tmdbType count (${tmdbTypes.length})`)
  process.exit(1)
}

// Deduplicate, skip tmdbId === 0
const seen = new Set()
const unique = []
for (let i = 0; i < tmdbIds.length; i++) {
  const id = tmdbIds[i]
  const type = tmdbTypes[i]
  if (!id) continue
  const key = `${type}:${id}`
  if (!seen.has(key)) { seen.add(key); unique.push({ tmdbId: id, tmdbType: type }) }
}

console.log(`\nFetching ${unique.length} unique titles from TMDB...\n`)

// ── Fetch helper ───────────────────────────────────────────────────────────
const BASE = 'https://api.themoviedb.org/3'

async function fetchOne(tmdbId, tmdbType) {
  const endpoint = tmdbType === 'movie' ? 'movie' : 'tv'
  const url = `${BASE}/${endpoint}/${tmdbId}?api_key=${API_KEY}&language=en-US`
  try {
    const res = await fetch(url)
    if (!res.ok) { console.warn(`  ⚠️  ${endpoint}/${tmdbId} → HTTP ${res.status}`); return null }
    const raw = await res.json()
    const isMovie = tmdbType === 'movie'
    return {
      posterPath:   raw.poster_path   ?? null,
      backdropPath: raw.backdrop_path ?? null,
      description:  raw.overview      ?? '',
      imdbRating:   raw.vote_average  ? Math.round(raw.vote_average * 10) / 10 : null,
      releaseYear:  (isMovie ? raw.release_date : raw.first_air_date)?.slice(0, 4) ?? null,
    }
  } catch (err) {
    console.warn(`  ⚠️  ${endpoint}/${tmdbId} → ${err.message}`)
    return null
  }
}

// ── Main fetch loop ────────────────────────────────────────────────────────
// Read existing cache so we can do incremental updates on re-runs
const outPath = resolve(__dirname, '../src/data/tmdb-cache.json')
let cache = {}
try { cache = JSON.parse(readFileSync(outPath, 'utf-8')) } catch {}

let fetched = 0, skipped = 0
for (let i = 0; i < unique.length; i++) {
  const { tmdbId, tmdbType } = unique[i]
  const key = `${tmdbType}:${tmdbId}`

  if (cache[key]) {
    process.stdout.write(`[${i+1}/${unique.length}] ${key} — cached, skipping\n`)
    skipped++
    continue
  }

  process.stdout.write(`[${i+1}/${unique.length}] ${key}...`)
  const data = await fetchOne(tmdbId, tmdbType)
  if (data) {
    cache[key] = data
    fetched++
    process.stdout.write(' ✓\n')
  } else {
    process.stdout.write(' ✗\n')
  }

  // Respect TMDB rate limit: ~40 req/10 s
  if ((i + 1) % 38 === 0 && i + 1 < unique.length) {
    process.stdout.write('  (rate-limit pause 1.5 s)\n')
    await new Promise(r => setTimeout(r, 1500))
  }
}

writeFileSync(outPath, JSON.stringify(cache, null, 2))
console.log(`\n✅  Done — fetched ${fetched}, skipped ${skipped} (cached), total ${Object.keys(cache).length} entries`)
console.log(`    Written to src/data/tmdb-cache.json\n`)
