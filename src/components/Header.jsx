// src/components/Header.jsx
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-border">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-sm">م</span>
          <span className="font-bold text-lg text-neutral-900">mind it with Abdallah Qapeel</span>
        </Link>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-brand border border-border rounded-full px-4 py-2"
        >
          + إضافة فيديو
        </Link>
      </div>
    </header>
  )
}