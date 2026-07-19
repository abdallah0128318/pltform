// src/utils/adminAuth.js
// Shared admin auth settings + reactive session state for all teacher-only pages.
export const ADMIN_PASSWORD = 'abdallah01283181109' // <-- change this to your own password
export const ADMIN_AUTH_KEY = 'abdallah01283181109'
const ADMIN_AUTH_EVENT = 'mh-admin-auth-updated'

export function isAdminAuthed() {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true'
}

export function setAdminAuthed() {
  sessionStorage.setItem(ADMIN_AUTH_KEY, 'true')
  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT))
}

export function clearAdminAuthed() {
  sessionStorage.removeItem(ADMIN_AUTH_KEY)
  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT))
}

export function onAdminAuthUpdated(callback) {
  window.addEventListener(ADMIN_AUTH_EVENT, callback)
  return () => window.removeEventListener(ADMIN_AUTH_EVENT, callback)
}