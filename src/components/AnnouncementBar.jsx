import { useState, useEffect } from 'react'

const MESSAGES = [
  'Free Shipping on Orders Above ₹1,499',
  'Easy 30-Day Returns on All Orders',
  '100% Authentic Products Guaranteed',
]

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(() => {
    return sessionStorage.getItem('announcement-closed') !== 'true'
  })
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent(c => (c + 1) % MESSAGES.length)
        setFading(false)
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  return (
    <div
      className="text-white flex items-center justify-center relative"
      style={{ height: 38, background: 'rgba(28,27,26,.95)', backdropFilter: 'blur(8px)' }}
    >
      <p
        className="text-[12px] tracking-[0.1em] font-light tr"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {MESSAGES[current]}
      </p>
      <button
        onClick={() => { setVisible(false); sessionStorage.setItem('announcement-closed', 'true') }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white tr text-[16px]"
      >
        &times;
      </button>
    </div>
  )
}
