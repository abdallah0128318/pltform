// src/pages/GraphTool.jsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { compile } from 'mathjs'

const COLORS = ['#ff6b35', '#ff3b7f', '#0ea5e9', '#22c55e', '#eab308', '#a855f7']
const MIN_VIEW_WIDTH = 0.001
const MAX_VIEW_WIDTH = 1e7
const DEFAULT_VIEW_WIDTH = 10

let idCounter = 0
function makeFunction(expr = 'x^2') {
  idCounter += 1
  return { uid: idCounter, expr, color: COLORS[(idCounter - 1) % COLORS.length] }
}

// Picks a "nice" grid step (1, 2, 5, 10, 20, 50 ...) for a given axis range —
// this makes the step automatically get smaller when zoomed in, and larger when zoomed out.
function niceStep(range, targetLines = 10) {
  const rough = range / targetLines
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / mag
  let step
  if (norm < 1.5) step = 1
  else if (norm < 3.5) step = 2
  else if (norm < 7.5) step = 5
  else step = 10
  return step * mag
}

function formatNum(n) {
  if (Math.abs(n) < 1e-9) return '0'
  return Number(n.toPrecision(6)).toString()
}

export default function GraphTool() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const rafRef = useRef(null)

  // View state lives in refs so panning/zooming don't trigger React re-renders per pixel
  const centerRef = useRef({ x: 0, y: 0 })
  const viewWidthRef = useRef(DEFAULT_VIEW_WIDTH) // total x-units spanning the canvas width
  const hoverRef = useRef(null) // { px, py, x, y } or null
  const dragRef = useRef(null) // { startPx, startPy, startCenter } or null

  const [functions, setFunctions] = useState([makeFunction('x^2')])
  const functionsRef = useRef(functions)
  useEffect(() => { functionsRef.current = functions }, [functions])

  const [error, setError] = useState('')
  const [hoverLabel, setHoverLabel] = useState(null)

  function getDomains(cssWidth, cssHeight) {
    const viewWidth = viewWidthRef.current
    const unitsPerPixel = viewWidth / cssWidth
    const yRange = unitsPerPixel * cssHeight
    const { x: cx, y: cy } = centerRef.current
    return {
      xMin: cx - viewWidth / 2,
      xMax: cx + viewWidth / 2,
      yMin: cy - yRange / 2,
      yMax: cy + yRange / 2,
      unitsPerPixel,
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const cssWidth = container.clientWidth
    const cssHeight = 420
    const dpr = window.devicePixelRatio || 1

    canvas.width = cssWidth * dpr
    canvas.height = cssHeight * dpr
    canvas.style.width = cssWidth + 'px'
    canvas.style.height = cssHeight + 'px'

    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssWidth, cssHeight)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, cssWidth, cssHeight)

    const { xMin, xMax, yMin, yMax } = getDomains(cssWidth, cssHeight)

    const xToPx = x => ((x - xMin) / (xMax - xMin)) * cssWidth
    const yToPx = y => cssHeight - ((y - yMin) / (yMax - yMin)) * cssHeight

    const xStep = niceStep(xMax - xMin)
    const yStep = niceStep(yMax - yMin)

    // grid
    ctx.strokeStyle = '#e8e8e8'
    ctx.lineWidth = 1
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const px = xToPx(x)
      ctx.beginPath()
      ctx.moveTo(px, 0)
      ctx.lineTo(px, cssHeight)
      ctx.stroke()
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const py = yToPx(y)
      ctx.beginPath()
      ctx.moveTo(0, py)
      ctx.lineTo(cssWidth, py)
      ctx.stroke()
    }

    // axis label baselines — clamp to visible edge if the axis itself is off-screen
    const xAxisVisible = yMin <= 0 && yMax >= 0
    const yAxisVisible = xMin <= 0 && xMax >= 0
    const xLabelY = xAxisVisible ? Math.min(Math.max(yToPx(0) + 14, 12), cssHeight - 4) : cssHeight - 6
    const yLabelX = yAxisVisible ? Math.min(Math.max(xToPx(0) + 4, 2), cssWidth - 30) : 2

    ctx.font = '11px Cairo, Arial, sans-serif'
    ctx.fillStyle = '#999999'
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      if (Math.abs(x) < xStep / 1000) continue
      ctx.fillText(formatNum(x), xToPx(x) + 2, xLabelY)
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      if (Math.abs(y) < yStep / 1000) continue
      ctx.fillText(formatNum(y), yLabelX, yToPx(y) - 3)
    }

    // axes
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1.5
    if (xAxisVisible) {
      const py = yToPx(0)
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(cssWidth, py); ctx.stroke()
    }
    if (yAxisVisible) {
      const px = xToPx(0)
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, cssHeight); ctx.stroke()
    }

    // functions
    let hadError = false
    functionsRef.current.forEach(f => {
      const expr = f.expr.trim()
      if (!expr) return

      let compiled
      try {
        compiled = compile(expr)
      } catch {
        hadError = true
        return
      }

      ctx.strokeStyle = f.color
      ctx.lineWidth = 2.5
      ctx.beginPath()
      let drawing = false

      for (let px = 0; px <= cssWidth; px += 1) {
        const x = xMin + (px / cssWidth) * (xMax - xMin)
        let y
        try {
          y = compiled.evaluate({ x })
        } catch {
          drawing = false
          continue
        }
        if (typeof y !== 'number' || !isFinite(y) || y < yMin - (yMax - yMin) * 2 || y > yMax + (yMax - yMin) * 2) {
          drawing = false
          continue
        }
        const py = yToPx(y)
        if (!drawing) { ctx.moveTo(px, py); drawing = true }
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
    })
    setError(hadError ? 'تأكد إن الدالة مكتوبة صح، مثال: x^2 أو sin(x) أو 2*x+1' : '')

    // hover crosshair + point
    const hover = hoverRef.current
    if (hover) {
      ctx.strokeStyle = 'rgba(255,59,127,0.55)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(hover.px, 0); ctx.lineTo(hover.px, cssHeight); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, hover.py); ctx.lineTo(cssWidth, hover.py); ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#ff3b7f'
      ctx.beginPath()
      ctx.arc(hover.px, hover.py, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [])

  const scheduleDraw = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }, [draw])

  useEffect(() => {
    scheduleDraw()
  }, [functions, scheduleDraw])

  useEffect(() => {
    const handleResize = () => scheduleDraw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [scheduleDraw])

  // Wheel zoom — needs a native listener with passive:false so preventDefault works
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function handleWheel(e) {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mousePx = e.clientX - rect.left
      const mousePy = e.clientY - rect.top
      const cssWidth = rect.width
      const cssHeight = rect.height

      const { xMin, xMax, yMin, yMax } = getDomains(cssWidth, cssHeight)
      const fracX = mousePx / cssWidth
      const fracY = mousePy / cssHeight
      const dataX = xMin + fracX * (xMax - xMin)
      const dataY = yMax - fracY * (yMax - yMin)

      const zoomFactor = e.deltaY > 0 ? 1.15 : 1 / 1.15
      const newViewWidth = Math.min(MAX_VIEW_WIDTH, Math.max(MIN_VIEW_WIDTH, viewWidthRef.current * zoomFactor))
      const newUnitsPerPixel = newViewWidth / cssWidth
      const newYRange = newUnitsPerPixel * cssHeight

      centerRef.current = {
        x: dataX + newViewWidth * (0.5 - fracX),
        y: dataY + newYRange * (fracY - 0.5),
      }
      viewWidthRef.current = newViewWidth
      scheduleDraw()
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [scheduleDraw])

  function zoomBy(factor) {
    viewWidthRef.current = Math.min(MAX_VIEW_WIDTH, Math.max(MIN_VIEW_WIDTH, viewWidthRef.current * factor))
    scheduleDraw()
  }

  function resetView() {
    centerRef.current = { x: 0, y: 0 }
    viewWidthRef.current = DEFAULT_VIEW_WIDTH
    scheduleDraw()
  }

  function handlePointerDown(e) {
    const canvas = canvasRef.current
    canvas.setPointerCapture(e.pointerId)
    canvas.style.cursor = 'grabbing'
    dragRef.current = {
      startPx: e.clientX,
      startPy: e.clientY,
      startCenter: { ...centerRef.current },
    }
  }

  function handlePointerMove(e) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const cssWidth = rect.width
    const cssHeight = rect.height

    if (dragRef.current) {
      const { unitsPerPixel } = getDomains(cssWidth, cssHeight)
      const dpx = e.clientX - dragRef.current.startPx
      const dpy = e.clientY - dragRef.current.startPy
      centerRef.current = {
        x: dragRef.current.startCenter.x - dpx * unitsPerPixel,
        y: dragRef.current.startCenter.y + dpy * unitsPerPixel,
      }
      hoverRef.current = null
      setHoverLabel(null)
      scheduleDraw()
      return
    }

    const { xMin, xMax, yMin, yMax } = getDomains(cssWidth, cssHeight)
    const x = xMin + (px / cssWidth) * (xMax - xMin)
    const y = yMax - (py / cssHeight) * (yMax - yMin)
    hoverRef.current = { px, py, x, y }
    setHoverLabel({ x, y })
    scheduleDraw()
  }

  function handlePointerUp(e) {
    const canvas = canvasRef.current
    canvas.style.cursor = 'grab'
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
    dragRef.current = null
  }

  function handlePointerLeave() {
    hoverRef.current = null
    setHoverLabel(null)
    scheduleDraw()
  }

  function updateExpr(uid, value) {
    setFunctions(fns => fns.map(f => (f.uid === uid ? { ...f, expr: value } : f)))
  }

  function addFunction() {
    setFunctions(fns => [...fns, makeFunction('')])
  }

  function removeFunction(uid) {
    setFunctions(fns => fns.filter(f => f.uid !== uid))
  }

  return (
    <main className="max-w-5xl mx-auto px-5 py-7">
      <Link to="/" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-brand text-sm mb-4">
        → رجوع للرئيسية
      </Link>

      <section className="pb-2">
        <h1 className="text-2xl font-bold gradient-text mb-1.5">رسم الدوال</h1>
        <p className="text-text-secondary text-sm">
          اكتب الدالة زي ما بتتكتب رياضيًا: <code dir="ltr" className="text-brand">x^2</code>،{' '}
          <code dir="ltr" className="text-brand">sin(x)</code>،{' '}
          <code dir="ltr" className="text-brand">2*x+3</code>،{' '}
          <code dir="ltr" className="text-brand">sqrt(x)</code>
          <br />
          استخدم عجلة الماوس للتكبير/التصغير، واسحب بالفأرة أو بإصبعك للتحريك.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 mt-5">
        <div className="glass-card border border-border rounded-2xl p-5 flex flex-col gap-4 h-fit">
          <div>
            <h3 className="text-sm font-bold text-text mb-3">الدوال</h3>
            <div className="flex flex-col gap-2">
              {functions.map(f => (
                <div key={f.uid} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                  <input
                    type="text"
                    value={f.expr}
                    onChange={e => updateExpr(f.uid, e.target.value)}
                    placeholder="مثال: x^2"
                    dir="ltr"
                    className="flex-1 min-w-0 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-brand"
                  />
                  {functions.length > 1 && (
                    <button
                      onClick={() => removeFunction(f.uid)}
                      className="text-text-muted hover:text-brand text-lg leading-none px-1 shrink-0"
                      aria-label="حذف"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addFunction}
              className="mt-3 w-full text-xs font-semibold text-brand border border-border hover:border-brand rounded-lg py-2 transition"
            >
              + إضافة دالة
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold text-text mb-3">التكبير والتحريك</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => zoomBy(1 / 1.4)}
                className="text-sm font-bold text-text-secondary hover:text-brand border border-border hover:border-brand rounded-lg py-2 transition"
              >
                +
              </button>
              <button
                onClick={resetView}
                className="text-xs font-semibold text-text-secondary hover:text-brand border border-border hover:border-brand rounded-lg py-2 transition"
              >
                إعادة ضبط
              </button>
              <button
                onClick={() => zoomBy(1.4)}
                className="text-sm font-bold text-text-secondary hover:text-brand border border-border hover:border-brand rounded-lg py-2 transition"
              >
                −
              </button>
            </div>
          </div>

          <div className="text-xs text-text-secondary bg-surface border border-border rounded-lg p-3">
            {hoverLabel ? (
              <span dir="ltr">x = {formatNum(hoverLabel.x)} , y = {formatNum(hoverLabel.y)}</span>
            ) : (
              'حرك الفأرة فوق الرسم لمعرفة الإحداثيات'
            )}
          </div>

          {error && <p className="text-xs text-brand">{error}</p>}
        </div>

        <div ref={containerRef} className="glass-card border border-border rounded-2xl p-3 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="rounded-lg block touch-none"
            style={{ cursor: 'grab' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
          />
        </div>
      </div>
    </main>
  )
}