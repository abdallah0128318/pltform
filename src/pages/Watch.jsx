// src/pages/Watch.jsx
import { useParams, Link } from 'react-router-dom'
import { findVideo } from '../data/dataStore'
import { getCurrentStudentCode } from '../data/studentStore'
import WatermarkOverlay from '../components/WatermarkOverlay'

export default function Watch() {
  const { id } = useParams()
  const found = findVideo(id)
  const studentCode = getCurrentStudentCode()

  if (!found) {
    return <main className="max-w-5xl mx-auto px-5 py-16 text-center text-text-secondary">الفيديو غير موجود</main>
  }

  const { playlist, video } = found

  return (
    <main className="max-w-5xl mx-auto px-5 py-7">
      <Link to={`/playlist/${playlist.id}`} className="inline-flex items-center gap-1.5 text-text-secondary hover:text-brand text-sm mb-4">
        → رجوع لـ {playlist.title}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-start">
        <div>
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border">
            <iframe
              className="absolute inset-0 w-full h-full border-0"
              src={`https://www.youtube.com/embed/${video.id}?rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <WatermarkOverlay text={studentCode} />
          </div>
          <h1 className="text-xl font-bold text-text mt-4 mb-1">{video.title}</h1>
          <p className="text-text-secondary text-sm mb-5">{playlist.title}</p>
        </div>

        <div>
          <h3 className="text-base font-bold text-text mb-2.5">فيديوهات القائمة</h3>
          <div className="flex flex-col gap-2">
            {playlist.videos.map((v, i) => (
              <Link
                key={v.id + i}
                to={`/video/${v.id}`}
                className={`flex gap-2.5 p-2 rounded-xl items-center transition ${
                  v.id === video.id ? 'bg-card border border-brand' : 'hover:bg-card border border-transparent'
                }`}
              >
                <div className="w-28 min-w-28 aspect-video rounded-lg overflow-hidden bg-surface">
                  <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-xs text-text-muted">{i + 1}</div>
                  <div className="text-sm font-semibold text-text leading-snug">{v.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}