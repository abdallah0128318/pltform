// src/pages/GraphTool.jsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { compile } from 'mathjs'

const COLORS = ['#ff6b35', '#ff3b7f', '#0ea5e9', '#22c55e', '#eab308', '#a855f7']

let idCounter = 0
function makeFunction(expr = 'x^2') {
  idCounter += 1
  return { uid: idCounter, expr, color: COLORS[(idCounter - 1) % COLORS.length] }
}

// Picks a "nice" grid step (1, 2, 5, 10, 20, 50...) for a given axis range
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

export default function GraphTool() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [functions, setFunctions] = useState([makeFunction('x^2')])
  const [xDomain, setXDomain] = useState([-10, 10])
  const [yDomain, setYDomain] = useState([-10, 10])
  const [error, setError] = useState('')

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const cssWidth = container.clientWidth
    const cssHeight = 400
    const dpr = window.devicePixelRatio || 1

    canvas.width = cssWidth * dpr
    canvas.height = cssHeight * dpr
    canvas.style.width = cssWidth + 'px'
    canvas.style.height = cssHeight + 'px'

    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssWidth, cssHeight)

    // white plotting background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, cssWidth, cssHeight)

    const [xMin, xMax] = xDomain
    const [yMin, yMax] = yDomain
    if (xMax <= xMin || yMax <= yMin) {
      setError('نطاق العرض غير صحيح، تأكد إن القيمة "إلى" أكبر من "من"')
      return
    }

    const xToPx = x => ((x - xMin) / (xMax - xMin)) * cssWidth
    const yToPx = y => cssHeight - ((y - yMin) / (yMax - yMin)) * cssHeight

    // grid
    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = 1
    const xStep = niceStep(xMax - xMin)
    const yStep = niceStep(yMax - yMin)

    ctx.font = '11px Arial'
    ctx.fillStyle = '#888888'

    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const px = xToPx(x)
      ctx.beginPath()
      ctx.moveTo(px, 0)
      ctx.lineTo(px, cssHeight)
      ctx.stroke()
      if (Math.abs(x) > xStep / 1000) {
        ctx.fillText(Number(x.toFixed(6)).toString(), px + 3, yToPx(0) + 12 > cssHeight - 4 ? cssHeight - 4 : yToPx(0) + 12)
      }
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const py = yToPx(y)
      ctx.beginPath()
      ctx.moveTo(0, py)
      ctx.lineTo(cssWidth, py)
      ctx.stroke()
      if (Math.abs(y) > yStep / 1000) {
        ctx.fillText(Number(y.toFixed(6)).toString(), xToPx(0) + 3, py - 3)
      }
    }

    // axes
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1.5
    if (yMin <= 0 && yMax >= 0) {
      const py = yToPx(0)
      ctx.beginPath()
      ctx.moveTo(0, py)
      ctx.lineTo(cssWidth, py)
      ctx.stroke()
    }
    if (xMin <= 0 && xMax >= 0) {
      const px = xToPx(0)
      ctx.beginPath()
      ctx.moveTo(px, 0)
      ctx.lineTo(px, cssHeight)
      ctx.stroke()
    }

    let hadError = false

    functions.forEach(f => {
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

        if (typeof y !== 'number' || !isFinite(y) || y < yMin - (yMax - yMin) || y > yMax + (yMax - yMin)) {
          drawing = false
          continue
        }

        const py = yToPx(y)
        if (!drawing) {
          ctx.moveTo(px, py)
          drawing = true
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.stroke()
    })

    setError(hadError ? 'تأكد إن الدالة مكتوبة صح، مثال: x^2 أو sin(x) أو 2*x+1' : '')
  }, [functions, xDomain, yDomain])

  useEffect(() => {
    draw()
    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  function updateExpr(uid, value) {
    setFunctions(fns => fns.map(f => (f.uid === uid ? { ...f, expr: value } : f)))
  }

  function addFunction() {
    setFunctions(fns => [...fns, makeFunction('')])
  }

  function removeFunction(uid) {
    setFunctions(fns => fns.filter(f => f.uid !== uid))
  }

  function resetView() {
    setXDomain([-10, 10])
    setYDomain([-10, 10])
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
            <h3 className="text-sm font-bold text-text mb-3">نطاق العرض</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex flex-col gap-1 text-text-secondary">
                X من
                <input
                  type="number"
                  value={xDomain[0]}
                  onChange={e => setXDomain([Number(e.target.value), xDomain[1]])}
                  className="bg-surface border border-border rounded-lg px-2 py-1.5 text-text"
                  dir="ltr"
                />
              </label>
              <label className="flex flex-col gap-1 text-text-secondary">
                X إلى
                <input
                  type="number"
                  value={xDomain[1]}
                  onChange={e => setXDomain([xDomain[0], Number(e.target.value)])}
                  className="bg-surface border border-border rounded-lg px-2 py-1.5 text-text"
                  dir="ltr"
                />
              </label>
              <label className="flex flex-col gap-1 text-text-secondary">
                Y من
                <input
                  type="number"
                  value={yDomain[0]}
                  onChange={e => setYDomain([Number(e.target.value), yDomain[1]])}
                  className="bg-surface border border-border rounded-lg px-2 py-1.5 text-text"
                  dir="ltr"
                />
              </label>
              <label className="flex flex-col gap-1 text-text-secondary">
                Y إلى
                <input
                  type="number"
                  value={yDomain[1]}
                  onChange={e => setYDomain([yDomain[0], Number(e.target.value)])}
                  className="bg-surface border border-border rounded-lg px-2 py-1.5 text-text"
                  dir="ltr"
                />
              </label>
            </div>
            <button
              onClick={resetView}
              className="mt-3 w-full text-xs font-semibold text-text-secondary hover:text-brand border border-border hover:border-brand rounded-lg py-2 transition"
            >
              إعادة ضبط العرض
            </button>
          </div>

          {error && <p className="text-xs text-brand">{error}</p>}
        </div>

        <div ref={containerRef} className="glass-card border border-border rounded-2xl p-3 overflow-hidden">
          <canvas ref={canvasRef} className="rounded-lg block" />
        </div>
      </div>
    </main>
  )
}