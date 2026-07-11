// src/components/VideoCard.jsx
import { Link } from 'react-router-dom'

export default function VideoCard({ video }) {
  return (
    <Link to={`/video/${video.id}`} className="group block rounded-2xl overflow-hidden bg-card border border-border hover:shadow-md transition">
      <div className="relative aspect-video bg-surface overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            {video.duration}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-neutral-900 line-clamp-2">{video.title}</p>
      </div>
    </Link>
  )
}