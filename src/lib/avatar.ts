const BASE = 'https://dicebear-671108073568.asia-south2.run.app/9.x'
const CACHE_PREFIX = 'aa_avatar_'

// Styles that look good as small circular avatars
const STYLES = [
  'adventurer',
  'avataaars',
  'big-ears',
  'big-smile',
  'bottts',
  'fun-emoji',
  'lorelei',
  'micah',
  'miniavs',
  'open-peeps',
  'pixel-art',
  'thumbs',
]

/** Pick a style deterministically from the seed string */
function pickStyle(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return STYLES[hash % STYLES.length]
}

function cacheKey(seed: string) {
  return `${CACHE_PREFIX}${seed}`
}

/**
 * Returns a data-URI (base64 SVG) for the given seed.
 * Caches in localStorage so it only fetches once per user per device.
 */
export async function getAvatar(seed: string): Promise<string | null> {
  // return from cache if available
  const cached = localStorage.getItem(cacheKey(seed))
  if (cached) return cached

  try {
    const style = pickStyle(seed)
    const url   = `${BASE}/${style}/svg?seed=${encodeURIComponent(seed)}`
    const res   = await fetch(url)
    if (!res.ok) return null

    // API returns base64 — convert to data URI
    const text = await res.text()

    // If it's already a data URI, use as-is
    if (text.startsWith('data:')) {
      localStorage.setItem(cacheKey(seed), text)
      return text
    }

    // If it's raw SVG, convert to data URI ourselves
    if (text.trimStart().startsWith('<svg') || text.trimStart().startsWith('<?xml')) {
      const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(text)))}`
      localStorage.setItem(cacheKey(seed), dataUri)
      return dataUri
    }

    // Assume it's a raw base64 string
    const dataUri = `data:image/svg+xml;base64,${text}`
    localStorage.setItem(cacheKey(seed), dataUri)
    return dataUri
  } catch {
    return null
  }
}

/** Clear cached avatar (e.g. on logout) */
export function clearAvatar(seed: string) {
  localStorage.removeItem(cacheKey(seed))
}
