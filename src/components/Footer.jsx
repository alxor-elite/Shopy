import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail('') }
  }

  return (
    <footer className="mt-auto">
      {/* Marquee strip */}
      <div className="bg-[#FFD600] overflow-hidden" style={{ height: 48 }}>
        <div className="marquee-track h-full items-center">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="text-[#1C1B1A] text-[13px] font-bold uppercase tracking-[0.2em] whitespace-nowrap px-8">
              SHOPY STREET &mdash; DRESS BOLD. BE BOLD.
            </span>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div style={{ background: 'rgba(28,27,26,.97)' }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Column 1 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-display text-[24px] text-white tracking-tight">SHOPY</span>
                <span className="bg-[#FFD600] text-[#1C1B1A] text-[9px] font-semibold px-1.5 py-[2px] uppercase tracking-wider" style={{ borderRadius: 6 }}>Street</span>
              </div>
              <p className="text-[14px] text-[#6B6663] italic leading-relaxed mb-8">
                Streetwear that speaks louder than words.
              </p>

              <p className="text-[11px] uppercase text-[#6B6663] tracking-[0.15em] mb-3 font-medium">Join the Gang</p>
              {subscribed ? (
                <p className="text-[13px] text-[#3A7D44]">Thanks for joining!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full bg-transparent border-b border-[#333] pb-2 text-[14px] text-white placeholder-[#555] focus:outline-none focus:border-[#FFD600] tr"
                  />
                  <button type="submit" className="absolute right-0 bottom-2 text-[#FFD600] hover:text-white tr">
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-[11px] uppercase text-[#6B6663] tracking-[0.15em] mb-5 font-medium">Shop</h4>
              <div className="space-y-3">
                {['All Products', 'T-Shirts', 'Shirts', 'Jeans', 'Cargos'].map(name => (
                  <Link key={name} to={name === 'All Products' ? '/products' : `/products?category=${name}`}
                    className="block text-[14px] text-[#9A9A9A] tr hover:text-white hover:translate-x-1">{name}</Link>
                ))}
              </div>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-[11px] uppercase text-[#6B6663] tracking-[0.15em] mb-5 font-medium">Help</h4>
              <div className="space-y-3">
                {['Shipping & Returns', 'Size Guide', 'Contact Us', 'FAQ'].map(name => (
                  <p key={name} className="text-[14px] text-[#9A9A9A] tr hover:text-white hover:translate-x-1 cursor-pointer">{name}</p>
                ))}
              </div>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="text-[11px] uppercase text-[#6B6663] tracking-[0.15em] mb-5 font-medium">Connect</h4>
              <div className="space-y-3 mb-6">
                {['Instagram', 'Twitter', 'YouTube'].map(name => (
                  <a key={name} href="#" className="group flex items-center gap-1.5 text-[14px] text-[#9A9A9A] tr hover:text-white hover:translate-x-1">
                    {name}
                    <ArrowRight size={10} className="opacity-0 tr group-hover:opacity-100 text-[#FFD600]" />
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {['instagram', 'twitter', 'youtube'].map(social => (
                  <a key={social} href="#"
                    className="w-[30px] h-[30px] flex items-center justify-center tr hover:scale-110"
                    style={{ borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)' }}>
                    <i className={`ti ti-brand-${social}`} style={{ fontSize: 14, color: '#fff' }} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
            <p className="text-[12px] text-[#555]">&copy; 2026 SHOPY STREET. ALL RIGHTS RESERVED.</p>
            <p className="text-[12px] text-[#555]">Made with &hearts; in India</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
