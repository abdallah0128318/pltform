// src/data/dataStore.js
// Combines your base sections.json with any videos you add through the admin form.
// Locally-added videos are saved in this browser only, until you copy them into sections.json.
// Anything already present in sections.json (matched by id) is automatically ignored
// from the local copy, so you never get duplicates after pasting a snippet in manually.
import baseData from './sections.json'

const STORAGE_KEY = 'mh_custom_data'
const UPDATE_EVENT = 'mh-data-updated'

function loadCustomData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { extraPlaylists: [], addedVideos: {} }
    const parsed = JSON.parse(raw)
    return {
      extraPlaylists: parsed.extraPlaylists || [],
      addedVideos: parsed.addedVideos || {},
    }
  } catch {
    return { extraPlaylists: [], addedVideos: {} }
  }
}

function saveCustomData(customData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customData))
  window.dispatchEvent(new Event(UPDATE_EVENT))
}

export function onDataUpdated(callback) {
  window.addEventListener(UPDATE_EVENT, callback)
  return () => window.removeEventListener(UPDATE_EVENT, callback)
}

export function getGrades() {
  return baseData.grades
}

export function getPlaylists() {
  const custom = loadCustomData()
  const basePlaylistIds = new Set(baseData.playlists.map(p => p.id))

  // Merge base playlists with any locally-added videos, skipping ones already in sections.json
  const merged = baseData.playlists.map(p => {
    const baseVideoIds = new Set(p.videos.map(v => v.id))
    const localExtras = (custom.addedVideos[p.id] || []).filter(v => !baseVideoIds.has(v.id))
    return { ...p, videos: [...p.videos, ...localExtras] }
  })

  // Only keep locally-created playlists that aren't already in sections.json
  const newLocalPlaylists = custom.extraPlaylists.filter(p => !basePlaylistIds.has(p.id))

  return [...merged, ...newLocalPlaylists]
}

export function getPlaylistById(id) {
  return getPlaylists().find(p => p.id === id) || null
}

export function findVideo(videoId) {
  for (const playlist of getPlaylists()) {
    const index = playlist.videos.findIndex(v => v.id === videoId)
    if (index !== -1) return { playlist, video: playlist.videos[index], index }
  }
  return null
}

export function addVideoToExistingPlaylist(playlistId, video) {
  const custom = loadCustomData()
  const list = custom.addedVideos[playlistId] || []
  custom.addedVideos[playlistId] = [...list, video]
  saveCustomData(custom)
}

export function addNewPlaylist(playlist) {
  const custom = loadCustomData()
  custom.extraPlaylists = [...custom.extraPlaylists, playlist]
  saveCustomData(custom)
}

export function clearCustomData() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(UPDATE_EVENT))
}