// src/components/WatermarkOverlay.jsx
// Tiled, semi-transparent code overlay shown across the video player.
// pointer-events-none so it never blocks play/pause/fullscreen clicks.
// This does not prevent recording — it's a deterrent: any leaked recording
// carries the student's code baked into every frame.
export default function WatermarkOverlay({ text }) {
  if (!text) return null

  const rows = 5
  const cols = 3

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10">
      <div className="absolute inset-0 flex flex-col justify-around items-center -rotate-[22deg] scale-125">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-12 whitespace-nowrap">
            {Array.from({ length: cols }).map((_, c) => (
              <span key={c} dir="ltr" className="text-white/15 text-sm font-bold tracking-widest">
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}