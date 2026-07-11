// src/utils/youtube.js
// Extracts a YouTube video ID from any common URL format the user might paste.
export function extractYouTubeId(url) {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim()

  return null
}