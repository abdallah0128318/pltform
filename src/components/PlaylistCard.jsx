// src/components/PlaylistCard.jsx
import { Link } from 'react-router-dom'

export default function PlaylistCard({ playlist }) {
  const firstVideo = playlist.videos[0]

  return (
    <Link to={`/playlist/${playlist.id}`} className="group block">
      <div className="relative">
        <div className="absolute top-2 -right-2 left-2 bottom-0 bg-white border border-border rounded-xl" />
        <div className="absolute top-1 -right-1 left-1 bottom-0 bg-neutral-50 border border-border rounded-xl" />

        <div className="relative aspect-video bg-neutral-100 border border-border rounded-xl overflow-hidden">
          {firstVideo && (
            <img
              src={`https://img.youtube.com/vi/${firstVideo.id}/hqdefault.jpg`}
              alt={playlist.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition text-white">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </span>
          </div>
          <span className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1.5 bg-black/75 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            {playlist.videos.length} فيديو
          </span>
        </div>
      </div>
      <div className="pt-3">
        <p className="text-sm font-semibold text-neutral-900">{playlist.title}</p>
        <p className="text-xs text-neutral-500 mt-0.5">قائمة تشغيل</p>
      </div>
    </Link>
  )
}