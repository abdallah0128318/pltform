// src/pages/Watch.jsx
import { useParams, Link } from 'react-router-dom'
import { findVideo } from '../data/dataStore'

export default function Watch() {
  const { id } = useParams()
  const found = findVideo(id)

  if (!found) {
    return <main className="max-w-5xl mx-auto px-5 py-16 text-center text-neutral-500">الفيديو غير موجود</main>
  }

  const { playlist, video } = found

  return (
    <main className="max-w-5xl mx-auto px-5 py-7">
      <Link to={`/playlist/${playlist.id}`} className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-brand text-sm mb-4">
        → رجوع لـ {playlist.title}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-start">
        <div>
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
            <iframe
              className="absolute inset-0 w-full h-full border-0"
              src={`https://www.youtube.com/embed/${video.id}?rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-4 mb-1">{video.title}</h1>
          <p className="text-neutral-500 text-sm mb-5">{playlist.title}</p>
        </div>

        <div>
          <h3 className="text-base font-bold text-neutral-900 mb-2.5">فيديوهات القائمة</h3>
          <div className="flex flex-col gap-2">
            {playlist.videos.map((v, i) => (
              <Link
                key={v.id + i}
                to={`/video/${v.id}`}
                className={`flex gap-2.5 p-2 rounded-xl items-center ${
                  v.id === video.id ? 'bg-surface border border-brand' : 'hover:bg-surface'
                }`}
              >
                <div className="w-28 min-w-28 aspect-video rounded-lg overflow-hidden bg-card">
                  <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-xs text-neutral-400">{i + 1}</div>
                  <div className="text-sm font-semibold text-neutral-900 leading-snug">{v.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}