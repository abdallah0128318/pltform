// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-5xl mx-auto px-5 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center font-bold">ع</div>
          <div>
            <p className="text-sm font-bold text-neutral-900">عبدالله قابيل</p>
            <p className="text-xs text-neutral-500">معلم رياضيات ثانوي | مهندس ومبرمج سابقًا</p>
          </div>
        </div>
        <a href="https://wa.me/201069076948?text=%D8%A3%D8%B3%D8%AA%D8%A7%D8%B0%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%2C%20%D8%B9%D9%86%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1" target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90">
          واتساب
        </a>
      </div>
    </footer>
  )
}