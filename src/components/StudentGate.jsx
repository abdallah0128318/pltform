// src/components/StudentGate.jsx
import { useState, useEffect } from 'react'
import { isStudentAuthed, loginStudent, onStudentsUpdated } from '../data/studentStore'

export default function StudentGate({ children }) {
  const [authed, setAuthed] = useState(isStudentAuthed())
  const [codeInput, setCodeInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => onStudentsUpdated(() => setAuthed(isStudentAuthed())), [])

  function handleSubmit(e) {
    e.preventDefault()
    if (loginStudent(codeInput)) {
      setError('')
    } else {
      setError('الكود غير صحيح، تأكد منه أو تواصل مع المعلم')
    }
  }

  if (!authed) {
    return (
      <main className="max-w-md mx-auto px-5 py-16">
        <div className="glass-card border border-border rounded-2xl p-6">
          <h1 className="text-lg font-bold gradient-text mb-1">أدخل كود الطالب</h1>
          <p className="text-sm text-text-secondary mb-5">
            المحتوى ده متاح للطلاب المسجلين بس. اكتب الكود اللي معاك من المعلم.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              placeholder="كود الطالب"
              dir="ltr"
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-brand text-center tracking-widest"
              autoFocus
            />
            {error && <p className="text-sm text-brand">{error}</p>}
            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #ff6b35, #ff3b7f)' }}
              className="text-white rounded-xl py-3 text-sm font-bold shadow-[0_6px_24px_-6px_rgba(255,59,127,0.55)] hover:brightness-110 active:brightness-95 transition"
            >
              دخول
            </button>
          </form>
        </div>
      </main>
    )
  }

  return children
}