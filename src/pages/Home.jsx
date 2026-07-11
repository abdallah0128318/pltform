// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { getGrades, getPlaylists, onDataUpdated } from '../data/dataStore'
import GradeTabs from '../components/GradeTabs'
import PlaylistCard from '../components/PlaylistCard'

export default function Home() {
  const grades = getGrades()
  const [activeGrade, setActiveGrade] = useState(grades[0].id)
  const [playlists, setPlaylists] = useState(getPlaylists())

  useEffect(() => onDataUpdated(() => setPlaylists(getPlaylists())), [])

  const gradePlaylists = playlists.filter(p => p.gradeId === activeGrade)

  return (
    <main className="max-w-5xl mx-auto px-5 py-7">
      <section className="pt-2 pb-2">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1.5">منصة الرياضيات</h1>
        <p className="text-neutral-500">دروس وتمارين الرياضيات لطلاب الصف الأول والثاني الثانوي</p>
      </section>

      <GradeTabs grades={grades} activeGrade={activeGrade} onChange={setActiveGrade} />

      {gradePlaylists.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">لا توجد قوائم لهذا الصف بعد</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-5 gap-y-7">
          {gradePlaylists.map(p => <PlaylistCard key={p.id} playlist={p} />)}
        </div>
      )}
    </main>
  )
}