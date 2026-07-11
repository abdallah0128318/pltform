// src/pages/Playlist.jsx
import { useParams, Link } from 'react-router-dom'
import { getPlaylistById, getGrades } from '../data/dataStore'
import VideoCard from '../components/VideoCard'

export default function Playlist() {
  const { id } = useParams()
  const playlist = getPlaylistById(id)

  if (!playlist) {
    return <main className="max-w-5xl mx-auto px-5 py-16 text-center text-neutral-500">القائمة غير موجودة</main>
  }

  const gradeTitle = getGrades().find(g => g.id === playlist.gradeId)?.title || ''

  return (
    <main className="max-w-5xl mx-auto px-5 py-7">
      <Link to="/" className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-brand text-sm mb-4">
        → رجوع للرئيسية
      </Link>

      <section className="pb-2">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1.5">{playlist.title}</h1>
        <p className="text-neutral-500">
          {gradeTitle}{playlist.description ? ` · ${playlist.description}` : ''}
        </p>
      </section>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4 mt-6">
        {playlist.videos.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </main>
  )
}