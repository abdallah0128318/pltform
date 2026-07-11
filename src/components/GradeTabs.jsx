// src/components/GradeTabs.jsx
export default function GradeTabs({ grades, activeGrade, onChange }) {
  return (
    <div className="flex gap-2.5 flex-wrap my-6">
      {grades.map(g => (
        <button
          key={g.id}
          onClick={() => onChange(g.id)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition ${
            g.id === activeGrade
              ? 'bg-brand border-brand text-white'
              : 'bg-white border-border text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          {g.title}
        </button>
      ))}
    </div>
  )
}