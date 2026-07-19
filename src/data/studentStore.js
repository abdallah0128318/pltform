// src/data/studentStore.js
// Combines the base students.json with any students added locally through the
// admin form, same pattern as dataStore.js for videos. Also handles the current
// visitor's login state (which student code they entered, if any).
import baseData from './students.json'

const STORAGE_KEY = 'mh_custom_students'
const AUTH_KEY = 'mh_student_code'
const UPDATE_EVENT = 'mh-students-updated'

function loadCustom() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { extraStudents: [] }
    const parsed = JSON.parse(raw)
    return { extraStudents: parsed.extraStudents || [] }
  } catch {
    return { extraStudents: [] }
  }
}

function saveCustom(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event(UPDATE_EVENT))
}

function dedupeByCode(items) {
  const seen = new Set()
  const out = []
  for (const item of items) {
    if (!seen.has(item.code)) {
      seen.add(item.code)
      out.push(item)
    }
  }
  return out
}

export function onStudentsUpdated(callback) {
  window.addEventListener(UPDATE_EVENT, callback)
  return () => window.removeEventListener(UPDATE_EVENT, callback)
}

export function getStudents() {
  const custom = loadCustom()
  const baseCodes = new Set(baseData.students.map(s => s.code))
  const extras = dedupeByCode(custom.extraStudents).filter(s => !baseCodes.has(s.code))
  return [...baseData.students, ...extras]
}

export function codeExists(code) {
  return getStudents().some(s => s.code === code.trim())
}

export function findStudentByCode(code) {
  return getStudents().find(s => s.code === code.trim()) || null
}

// Throws an Error('DUPLICATE_CODE') if the code already exists — caller must handle it.
export function addStudent(student) {
  if (codeExists(student.code)) {
    throw new Error('DUPLICATE_CODE')
  }
  const custom = loadCustom()
  custom.extraStudents = [...custom.extraStudents, student]
  saveCustom(custom)
}

export function clearCustomStudents() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(UPDATE_EVENT))
}

// ---- Current visitor's login state ----

export function isStudentAuthed() {
  const code = localStorage.getItem(AUTH_KEY)
  if (!code) return false
  return codeExists(code)
}

export function loginStudent(code) {
  if (!codeExists(code)) return false
  localStorage.setItem(AUTH_KEY, code.trim())
  window.dispatchEvent(new Event(UPDATE_EVENT))
  return true
}

export function logoutStudent() {
  localStorage.removeItem(AUTH_KEY)
  window.dispatchEvent(new Event(UPDATE_EVENT))
}