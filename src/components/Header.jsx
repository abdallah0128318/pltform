// src/components/Header.jsx
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 glass-card border-b border-border">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 min-w-0" onClick={() => setMenuOpen(false)}>
          <span
            className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-base shrink-0 shadow-[0_4px_20px_-4px_rgba(255,107,53,0.6)]"
            style={{ background: 'linear-gradient(135deg, #ff6b35, #ff3b7f)' }}
          >
            م
          </span>
          <span className="font-bold text-lg gradient-text truncate">mind it with Abdallah Qapeel</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            to="/graph"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-brand border border-border rounded-full px-4 py-2 transition hover:border-brand"
          >
            📈 رسم الدوال
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-brand border border-border rounded-full px-4 py-2 transition hover:border-brand"
          >
            + إضافة فيديو
          </Link>
        </div>

        {/* Mobile burger button */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-text-secondary hover:text-brand border border-border rounded-lg shrink-0"
          aria-label="القائمة"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border glass-card">
          <div className="max-w-5xl mx-auto px-5 py-3 flex flex-col gap-2">
            <Link
              to="/graph"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-text-secondary hover:text-brand border border-border rounded-xl px-4 py-3 transition hover:border-brand"
            >
              📈 رسم الدوال
            </Link>
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-text-secondary hover:text-brand border border-border rounded-xl px-4 py-3 transition hover:border-brand"
            >
              + إضافة فيديو (Admin)
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}