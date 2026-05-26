'use client'
import { useRef, useState, useEffect } from 'react'

export default function SignaturePad({ onSubmit, onCancel }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [hasInk, setHasInk] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#111'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getXY = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const start = (e) => {
    e.preventDefault()
    setDrawing(true)
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getXY(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const move = (e) => {
    if (!drawing) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getXY(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasInk(true)
  }

  const stop = () => setDrawing(false)

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
  }

  const submit = () => {
    if (!hasInk) {
      alert('Please draw your signature before submitting.')
      return
    }
    const data = canvasRef.current.toDataURL('image/png')
    onSubmit(data)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', zIndex: 100,
    }}>
      <div style={{
        background: '#fff', borderRadius: 'var(--r)',
        padding: '24px', maxWidth: '720px', width: '100%',
        boxShadow: 'var(--sh-lg)',
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Sign Agreement</h2>
        <p style={{ marginTop: 0, color: 'var(--s600)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Draw your signature in the box below. Use your mouse or touchscreen.
        </p>

        <canvas
          ref={canvasRef}
          width={700}
          height={220}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={stop}
          style={{
            width: '100%',
            border: '2px dashed var(--borderS)',
            borderRadius: 'var(--rs)',
            cursor: 'crosshair',
            touchAction: 'none',
            background: '#fff',
          }}
        />

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginTop: '16px' }}>
          <button onClick={clear} className="btn btn-ghost btn-sm">Clear</button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onCancel} className="btn btn-outline btn-sm">Cancel</button>
            <button onClick={submit} className="btn btn-primary btn-sm" disabled={!hasInk}>Submit Signature</button>
          </div>
        </div>
      </div>
    </div>
  )
}
