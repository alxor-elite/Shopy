import { useEffect, useRef } from 'react'

export function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('vis')
          observer.unobserve(el)
        }
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

export function useStaggerReveal(containerRef, itemSelector = '.stagger-item') {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.classList.add('sg')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const items = container.querySelectorAll(itemSelector)
          items.forEach((item, i) => {
            setTimeout(() => item.classList.add('vis'), i * 60)
          })
          observer.unobserve(container)
        }
      },
      { threshold: 0.02 }
    )

    requestAnimationFrame(() => {
      observer.observe(container)
    })

    return () => observer.disconnect()
  }, [])
}
