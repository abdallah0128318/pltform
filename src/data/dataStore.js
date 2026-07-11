// src/data/dataStore.js
// Combines your base sections.json with any videos you add through the admin form.
// Locally-added videos are saved in this browser only, until you copy them into sections.json.
import baseData from './sections.json'

const STORAGE_KEY = 'mh_custom_data'
const UPDATE_EVENT = 'mh-data-updated'

function loadCustomData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { extraPlaylists: [], addedVideos: {} }
    return JSON.parse(raw)
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

  const merged = baseData.playlists.map(p => ({
    ...p,
    videos: [...p.videos, ...(custom.addedVideos[p.id] || [])],
  }))

  return [...merged, ...custom.extraPlaylists]
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