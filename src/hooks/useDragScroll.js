import { useEffect, useRef } from 'react'

export function useDragScroll(scrollRef) {
  const state = useRef({ isDown: false, startX: 0, scrollLeft: 0, velX: 0, lastX: 0, lastTime: 0, raf: null })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const s = state.current

    const momentum = () => {
      if (Math.abs(s.velX) > 0.5) {
        el.scrollLeft -= s.velX
        s.velX *= 0.92
        s.raf = requestAnimationFrame(momentum)
      }
    }

    const onDown = (e) => {
      s.isDown = true
      s.startX = e.pageX - el.offsetLeft
      s.scrollLeft = el.scrollLeft
      s.lastX = e.pageX
      s.lastTime = Date.now()
      cancelAnimationFrame(s.raf)
      el.style.cursor = 'grabbing'
    }

    const onUp = () => {
      if (!s.isDown) return
      s.isDown = false
      el.style.cursor = 'grab'
      s.raf = requestAnimationFrame(momentum)
    }

    const onMove = (e) => {
      if (!s.isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = x - s.startX
      el.scrollLeft = s.scrollLeft - walk

      const now = Date.now()
      const dt = now - s.lastTime
      if (dt > 0) {
        s.velX = (e.pageX - s.lastX) / dt * 16
      }
      s.lastX = e.pageX
      s.lastTime = now
    }

    const onLeave = () => {
      if (s.isDown) onUp()
    }

    el.addEventListener('mousedown', onDown)
    el.addEventListener('mouseup', onUp)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(s.raf)
    }
  }, [scrollRef])
}
