export const IMG_BASE = 'https://image.tmdb.org/t/p'

export function posterUrl(path, size = 'w300') {
  if (!path) return null
  return `${IMG_BASE}/${size}${path}`
}

export function backdropUrl(path, size = 'w780') {
  if (!path) return null
  return `${IMG_BASE}/${size}${path}`
}
