// src/pages/AdminAddStudent.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ADMIN_PASSWORD, isAdminAuthed, setAdminAuthed } from '../utils/adminAuth'
import { getStudents, addStudent, clearCustomStudents } from '../data/studentStore'

const inputClass =
  'w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-brand transition'

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export default function AdminAddStudent() {
  const [authed, setAuthed] = useState(isAdminAuthed())
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      setAdminAuthed()
      setAuthed(true)
      setError('')
    } else {
      setError('كلمة السر غير صحيحة')
    }
  }

  if (!authed) {
    return (
      <main className="max-w-md mx-auto px-5 py-16">
        <div className="glass-card border border-border rounded-2xl p-6">
          <h1 className="text-lg font-bold gradient-text mb-1">دخول المسؤول</h1>
          <p className="text-sm text-text-secondary mb-5">هذه الصفحة للمعلم فقط</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="كلمة السر"
                className={`${inputClass} pl-12`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-brand hover:bg-surface transition"
                aria-label={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.29 20.29 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.29 20.29 0 0 1-3.22 4.53M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {error && <p className="text-sm text-brand">{error}</p>}
            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #ff6b35, #ff3b7f)' }}
              className="text-white rounded-xl py-3 text-sm font-bold shadow-[0_6px_24px_-6px_rgba(255,59,127,0.55)] hover:brightness-110 active:brightness-95 transition"
            >
              دخول
            </button>
          </form>
          <Link to="/" className="block text-center text-sm text-text-muted mt-4 hover:text-brand">
            رجوع للرئيسية
          </Link>
        </div>
      </main>
    )
  }

  return <AddStudentForm />
}

function AddStudentForm() {
  const [students, setStudents] = useState(getStudents())
  const [name, setName] = useState('')
  const [code, setCode] = useState(generateCode())
  const [snippet, setSnippet] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setStudents(getStudents())
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      alert('اكتب اسم الطالب')
      return
    }
    if (!code.trim()) {
      alert('اكتب أو اضغط توليد كود')
      return
    }

    const student = { code: code.trim(), name: name.trim() }

    try {
      addStudent(student)
    } catch (err) {
      if (err.message === 'DUPLICATE_CODE') {
        alert('الكود ده مستخدم بالفعل، جرب كود تاني')
        return
      }
      throw err
    }

    setSnippet(JSON.stringify(student, null, 2))
    setStudents(getStudents())
    setName('')
    setCode(generateCode())
    setCopied(false)
  }

  function copySnippet() {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClearLocalData() {
    const sure = confirm('هيمسح كل الطلاب اللي جربتهم محليًا ولسه ماحطتهمش في students.json. متأكد؟')
    if (!sure) return
    clearCustomStudents()
    setStudents(getStudents())
    setSnippet('')
  }

  return (
    <main className="max-w-2xl mx-auto px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-brand text-sm mb-4">
        → رجوع للرئيسية
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold gradient-text mb-1">إضافة طالب جديد</h1>
          <p className="text-sm text-text-secondary">
            الطالب هيظهر ليك على المتصفح ده بس. عشان يقدر يدخل من أي جهاز، انسخ الكود اللي هيظهر
            تحت وحطه داخل ملف <code className="text-brand">students.json</code> وارفعه على GitHub.
          </p>
        </div>
        <button
          onClick={handleClearLocalData}
          className="whitespace-nowrap text-xs font-semibold text-text-muted hover:text-brand border border-border rounded-full px-3 py-1.5 transition hover:border-brand"
        >
          مسح البيانات المحلية
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-card border border-border rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">اسم الطالب</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: أحمد محمد" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">كود الطالب</label>
          <div className="flex gap-2">
            <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="1234" dir="ltr" className={inputClass} />
            <button
              type="button"
              onClick={() => setCode(generateCode())}
              className="whitespace-nowrap text-xs font-semibold text-brand border border-border hover:border-brand rounded-xl px-4 transition"
            >
              توليد كود
            </button>
          </div>
        </div>

        <button
          type="submit"
          style={{ background: 'linear-gradient(135deg, #ff6b35, #ff3b7f)' }}
          className="text-white rounded-xl py-2.5 text-sm font-semibold shadow-[0_6px_24px_-6px_rgba(255,59,127,0.55)] hover:brightness-110 transition"
        >
          إضافة الطالب
        </button>
      </form>

      {snippet && (
        <div className="glass-card border border-border rounded-2xl p-5 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-text">تم إضافة الطالب محليًا ✅</h3>
            <button onClick={copySnippet} className="text-xs font-semibold text-brand hover:text-brand-hover">
              {copied ? 'تم النسخ' : 'نسخ الكود'}
            </button>
          </div>
          <p className="text-xs text-text-secondary mb-3">
            انسخ الكود ده وحطه داخل مصفوفة "students" في students.json، وبعدين اضغط "مسح البيانات المحلية".
          </p>
          <pre dir="ltr" className="bg-surface border border-border rounded-xl p-3 text-xs overflow-x-auto text-text-secondary">
            {snippet}
          </pre>
        </div>
      )}

      <div className="glass-card border border-border rounded-2xl p-5 mt-5">
        <h3 className="text-sm font-bold text-text mb-3">قائمة الطلاب الحاليين ({students.length})</h3>
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {students.map(s => (
            <div key={s.code} className="flex items-center justify-between text-sm border-b border-border py-1.5 last:border-0">
              <span className="text-text">{s.name}</span>
              <span dir="ltr" className="text-text-muted font-mono">{s.code}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}