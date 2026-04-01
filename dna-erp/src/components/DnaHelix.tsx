import { useRef, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Tool } from '../types'

interface Assignment {
  a: string
  b: string
}

interface DnaHelixProps {
  assignments: Assignment[]
  numRungs: number
  toolMap: Map<string, Tool>
  onClickBall: (toolId: string) => void
  onDropTool: (toolId: string) => void
}

const AMPLITUDE = 90
const BALL_SIZE = 44
const TURNS_BASE = 1.5
const PADDING_X = 80
const STRAND_OFFSET = (20 * Math.PI) / 180 // 20° in radians

export default function DnaHelix({ assignments, numRungs, toolMap, onClickBall, onDropTool }: DnaHelixProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef(0)
  const animRef = useRef<number>(0)
  const ballRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [dims, setDims] = useState({ w: 1200, h: 500 })
  const [isDragOver, setIsDragOver] = useState(false)

  const prevAssignRef = useRef<string>('')
  const staggerDelays = useRef<Map<string, number>>(new Map())

  const flatKey = useMemo(() => assignments.map(a => `${a.a}|${a.b}`).join(','), [assignments])

  useEffect(() => {
    const prev = prevAssignRef.current
    if (prev === flatKey) return
    prevAssignRef.current = flatKey
    if (!prev) { staggerDelays.current = new Map(); return }

    const oldParts = prev.split(',')
    const newParts = flatKey.split(',')
    const changed: string[] = []

    for (let i = 0; i < Math.max(oldParts.length, newParts.length); i++) {
      const [newA, newB] = (newParts[i] || '|').split('|')
      const [oldA, oldB] = (oldParts[i] || '|').split('|')
      if (newA !== oldA && newA) changed.push(`${i}-0`)
      if (newB !== oldB && newB) changed.push(`${i}-1`)
    }

    for (let i = changed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [changed[i], changed[j]] = [changed[j], changed[i]]
    }

    const delays = new Map<string, number>()
    changed.forEach((key, idx) => delays.set(key, idx * 0.025))
    staggerDelays.current = delays
  }, [flatKey])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDims({ w: width, h: height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = dims.w * dpr
    canvas.height = dims.h * dpr
    canvas.style.width = dims.w + 'px'
    canvas.style.height = dims.h + 'px'
  }, [dims])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    const animate = () => {
      phaseRef.current += 0.007

      const w = dims.w
      const h = dims.h
      const centerY = h / 2
      const usableWidth = w - PADDING_X * 2
      const numTurns = TURNS_BASE + Math.min(numRungs / 20, 3)
      const halfSize = BALL_SIZE / 2
      const dpr = window.devicePixelRatio || 1

      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, w, h)
      }

      for (let i = 0; i < numRungs; i++) {
        const t = numRungs <= 1 ? 0.5 : i / (numRungs - 1)
        const x = PADDING_X + t * usableWidth
        const angleA = t * numTurns * Math.PI * 2 + phaseRef.current
        const angleB = angleA + STRAND_OFFSET

        const yA = centerY + AMPLITUDE * Math.sin(angleA)
        const yB = centerY - AMPLITUDE * Math.sin(angleB)
        const zA = Math.cos(angleA)
        const zB = -Math.cos(angleB)

        const scaleA = 0.5 + 0.5 * ((zA + 1) / 2)
        const scaleB = 0.5 + 0.5 * ((zB + 1) / 2)
        const opacityA = 0.3 + 0.7 * ((zA + 1) / 2)
        const opacityB = 0.3 + 0.7 * ((zB + 1) / 2)

        // Draw bar between the two balls
        if (ctx) {
          const avgZ = (zA + zB) / 2
          const barAlpha = 0.06 + 0.1 * ((avgZ + 1) / 2)
          ctx.beginPath()
          ctx.moveTo(x, yA)
          ctx.lineTo(x, yB)
          ctx.strokeStyle = `rgba(255,255,255,${barAlpha})`
          ctx.lineWidth = 1
          ctx.stroke()
        }

        const elA = ballRefs.current.get(`${i}-0`)
        if (elA) {
          elA.style.transform = `translate(${x - halfSize}px, ${yA - halfSize}px) scale(${scaleA})`
          elA.style.opacity = String(opacityA)
          elA.style.zIndex = String(Math.round((zA + 1) * 50))
        }
        const elB = ballRefs.current.get(`${i}-1`)
        if (elB) {
          elB.style.transform = `translate(${x - halfSize}px, ${yB - halfSize}px) scale(${scaleB})`
          elB.style.opacity = String(opacityB)
          elB.style.zIndex = String(Math.round((zB + 1) * 50))
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [numRungs, dims])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }
  const handleDragLeave = () => setIsDragOver(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const toolId = e.dataTransfer.getData('toolId')
    if (toolId) onDropTool(toolId)
  }

  const ballElements = useMemo(() => {
    const els: JSX.Element[] = []
    for (let i = 0; i < numRungs; i++) {
      const assign = assignments[i] || { a: '', b: '' }
      els.push(
        <BallElement key={`${i}-0`} ballKey={`${i}-0`} toolId={assign.a} toolMap={toolMap} ballRefs={ballRefs} staggerDelays={staggerDelays} onClick={onClickBall} />,
        <BallElement key={`${i}-1`} ballKey={`${i}-1`} toolId={assign.b} toolMap={toolMap} ballRefs={ballRefs} staggerDelays={staggerDelays} onClick={onClickBall} />,
      )
    }
    return els
  }, [numRungs, assignments, toolMap, onClickBall])

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      {ballElements}
      {isDragOver && (
        <div style={{
          position: 'absolute', inset: 8,
          border: '1px dashed hsl(var(--border))',
          borderRadius: 'var(--radius)',
          pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: 'hsl(var(--muted-foreground))',
        }}>
          Déposer ici
        </div>
      )}
    </div>
  )
}

function BallElement({
  ballKey, toolId, toolMap, ballRefs, staggerDelays, onClick,
}: {
  ballKey: string
  toolId: string
  toolMap: Map<string, Tool>
  ballRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  staggerDelays: React.MutableRefObject<Map<string, number>>
  onClick: (toolId: string) => void
}) {
  const tool = toolId ? toolMap.get(toolId) : null
  const Icon = tool?.icon
  const delay = staggerDelays.current.get(ballKey) || 0

  return (
    <div
      ref={el => { if (el) ballRefs.current.set(ballKey, el); else ballRefs.current.delete(ballKey) }}
      onClick={toolId ? () => onClick(toolId) : undefined}
      style={{
        position: 'absolute', left: 0, top: 0,
        width: BALL_SIZE, height: BALL_SIZE,
        cursor: toolId ? 'pointer' : 'default',
        pointerEvents: toolId ? 'auto' : 'none',
        willChange: 'transform, opacity',
      }}
      title={tool?.name}
    >
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: toolId ? 'hsl(var(--foreground))' : 'hsl(var(--muted))',
        transition: 'background 0.15s',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AnimatePresence mode="wait">
          {Icon && (
            <motion.div
              key={toolId}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25, delay }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon size={16} strokeWidth={1.5} color="hsl(var(--background))" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
