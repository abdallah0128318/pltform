// src/pages/AdminAddVideo.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { extractYouTubeId } from '../utils/youtube'
import {
  getGrades,
  getPlaylists,
  addVideoToExistingPlaylist,
  addNewPlaylist,
} from '../data/dataStore'

const ADMIN_PASSWORD = 'abdallah01283181109' // <-- change this to your own password
const AUTH_KEY = 'mh_admin_authed'

export default function AdminAddVideo() {
  const [authed, setAuthed] = useState(sessionStorage.getItem(AUTH_KEY) === 'true')
  const [passwordInput, setPasswordInput] = useState('')
  const [error, setError] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true')
      setAuthed(true)
      setError('')
    } else {
      setError('كلمة السر غير صحيحة')
    }
  }

  if (!authed) {
    return (
      <main className="max-w-md mx-auto px-5 py-16">
        <div className="bg-white border border-border rounded-2xl p-6">
          <h1 className="text-lg font-bold text-neutral-900 mb-1">دخول المسؤول</h1>
          <p className="text-sm text-neutral-500 mb-5">هذه الصفحة للمعلم فقط</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="كلمة السر"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
              autoFocus
            />
            {error && <p className="text-sm text-brand">{error}</p>}
            <button
              type="submit"
              className="bg-brand hover:bg-brand-hover text-white rounded-xl py-2.5 text-sm font-semibold"
            >
              دخول
            </button>
          </form>
          <Link to="/" className="block text-center text-sm text-neutral-400 mt-4 hover:text-brand">
            رجوع للرئيسية
          </Link>
        </div>
      </main>
    )
  }

  return <AddVideoForm />
}

function AddVideoForm() {
  const grades = getGrades()
  const [gradeId, setGradeId] = useState(grades[0].id)
  const [playlists, setPlaylists] = useState(getPlaylists())
  const [playlistChoice, setPlaylistChoice] = useState('') // '' = new playlist
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [snippet, setSnippet] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setPlaylists(getPlaylists())
  }, [])

  const gradePlaylists = playlists.filter(p => p.gradeId === gradeId)

  function handleSubmit(e) {
    e.preventDefault()

    const videoId = extractYouTubeId(videoUrl.trim())
    if (!videoId) {
      alert('رابط اليوتيوب غير صالح، تأكد من نسخ الرابط كامل')
      return
    }
    if (!videoTitle.trim()) {
      alert('اكتب عنوان الفيديو')
      return
    }

    const video = { id: videoId, title: videoTitle.trim(), duration: duration.trim() }

    let jsonSnippet = ''

    if (playlistChoice === '') {
      if (!newPlaylistTitle.trim()) {
        alert('اكتب اسم القائمة الجديدة')
        return
      }
      const newId = `${gradeId}-${newPlaylistTitle.trim().replace(/\s+/g, '-')}`
      const newPlaylist = {
        id: newId,
        gradeId,
        title: newPlaylistTitle.trim(),
        description: newPlaylistDesc.trim(),
        videos: [video],
      }
      addNewPlaylist(newPlaylist)
      jsonSnippet = JSON.stringify(newPlaylist, null, 2)
    } else {
      addVideoToExistingPlaylist(playlistChoice, video)
      jsonSnippet = JSON.stringify(video, null, 2)
    }

    setSnippet(jsonSnippet)
    setPlaylists(getPlaylists())
    setVideoUrl('')
    setVideoTitle('')
    setDuration('')
    setNewPlaylistTitle('')
    setNewPlaylistDesc('')
    setCopied(false)
  }

  function copySnippet() {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="max-w-2xl mx-auto px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-brand text-sm mb-4">
        → رجوع للرئيسية
      </Link>

      <h1 className="text-xl font-bold text-neutral-900 mb-1">إضافة فيديو جديد</h1>
      <p className="text-sm text-neutral-500 mb-6">
        بعد الإضافة، الفيديو هيظهر ليك على المتصفح ده بس. عشان يظهر لكل الطلاب لازم تنسخ
        الكود اللي هيظهر تحت وتحطه في ملف <code className="text-brand">sections.json</code>.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">الصف</label>
          <select
            value={gradeId}
            onChange={e => { setGradeId(e.target.value); setPlaylistChoice('') }}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm"
          >
            {getGrades().map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">القائمة</label>
          <select
            value={playlistChoice}
            onChange={e => setPlaylistChoice(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm"
          >
            <option value="">+ قائمة جديدة</option>
            {gradePlaylists.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        {playlistChoice === '' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">اسم القائمة الجديدة</label>
              <input
                type="text"
                value={newPlaylistTitle}
                onChange={e => setNewPlaylistTitle(e.target.value)}
                placeholder="مثال: الإحصاء"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">وصف القائمة (اختياري)</label>
              <input
                type="text"
                value={newPlaylistDesc}
                onChange={e => setNewPlaylistDesc(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">رابط الفيديو من يوتيوب</label>
          <input
            type="text"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">عنوان الفيديو</label>
          <input
            type="text"
            value={videoTitle}
            onChange={e => setVideoTitle(e.target.value)}
            placeholder="مثال: الدرس 3: المتباينات"
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">مدة الفيديو (اختياري)</label>
          <input
            type="text"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="12:30"
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm"
            dir="ltr"
          />
        </div>

        <button
          type="submit"
          className="bg-brand hover:bg-brand-hover text-white rounded-xl py-2.5 text-sm font-semibold"
        >
          إضافة الفيديو
        </button>
      </form>

      {snippet && (
        <div className="bg-white border border-border rounded-2xl p-5 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-neutral-900">تم إضافة الفيديو محليًا ✅</h3>
            <button
              onClick={copySnippet}
              className="text-xs font-semibold text-brand hover:text-brand-hover"
            >
              {copied ? 'تم النسخ' : 'نسخ الكود'}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mb-3">
            انسخ الكود ده وحطه في sections.json في المكان المناسب.
          </p>
          <pre dir="ltr" className="bg-surface border border-border rounded-xl p-3 text-xs overflow-x-auto text-neutral-700">
            {snippet}
          </pre>
        </div>
      )}
    </main>
  )
}   