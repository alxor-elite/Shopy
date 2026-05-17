import { useEffect, useRef, useState } from 'react'

export function useFollowCursor(containerRef) {
  const cursorRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const raf = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.12
      pos.current.y += (target.current.y - pos.current.y) * 0.12
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x - 40}px, ${pos.current.y - 40}px)`
      }
      raf.current = requestAnimationFrame(animate)
    }

    const handleEnter = () => setVisible(true)
    const handleLeave = () => setVisible(false)
    const handleMove = (e) => {
      const rect = container.getBoundingClientRect()
      target.current.x = e.clientX - rect.left
      target.current.y = e.clientY - rect.top
    }

    container.addEventListener('mouseenter', handleEnter)
    container.addEventListener('mouseleave', handleLeave)
    container.addEventListener('mousemove', handleMove)
    raf.current = requestAnimationFrame(animate)

    return () => {
      container.removeEventListener('mouseenter', handleEnter)
      container.removeEventListener('mouseleave', handleLeave)
      container.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(raf.current)
    }
  }, [containerRef])

  return { cursorRef, visible }
}
