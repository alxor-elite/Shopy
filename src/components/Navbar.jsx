import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Search, ChevronDown, User, Heart } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const DEFAULT_NAV_ITEMS = [
  { label: 'All Products', to: '/products' },
  { label: 'T-Shirts', to: '/products?category=T-Shirts' },
  { label: 'Shirts', to: '/products?category=Shirts' },
  { label: 'Jeans', to: '/products?category=Jeans' },
  { label: 'Cargos', to: '/products?category=Cargos' },
]

const DEFAULT_MEGA_IMAGES = [
  { img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400', label: 'T-Shirts', to: '/products?category=T-Shirts' },
  { img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400', label: 'Cargos', to: '/products?category=Cargos' },
]

export default function Navbar() {
  const { itemCount, setIsOpen, bouncing } = useCart()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileAccordion, setMobileAccordion] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownTimeout = useRef(null)
  const [mobileLinksVisible, setMobileLinksVisible] = useState(false)
  const [megaImages, setMegaImages] = useState(DEFAULT_MEGA_IMAGES)
  const [navItems, setNavItems] = useState(DEFAULT_NAV_ITEMS)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Load navbar categories from DB
  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data && data.length > 0) {
        // Navbar links
        const navCats = data.filter(c => c.show_in_navbar !== false)
        const items = [
          { label: 'All Products', to: '/products' },
          ...navCats.map(c => ({ label: c.name, to: `/products?category=${c.name}` }))
        ]
        setNavItems(items)

        // Mega menu featured images — use categories marked as featured
        const featured = data.filter(c => c.featured_in_menu === true)
        if (featured.length > 0) {
          setMegaImages(featured.map(c => ({
            img: c.image_url || DEFAULT_MEGA_IMAGES[0]?.img,
            label: c.name,
            to: `/products?category=${c.name}`,
          })))
        }
      }
    })
  }, [])

  const openDropdown = () => {
    clearTimeout(dropdownTimeout.current)
    setDropdownOpen(true)
  }
  const closeDropdown = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 150)
  }

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => setMobileLinksVisible(true), 50)
    } else {
      document.body.style.overflow = ''
      setMobileLinksVisible(false)
      setMobileAccordion(false)
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <nav
      className={`sticky top-0 z-50 tr ${scrolled ? 'backdrop-blur-[20px]' : ''}`}
      style={{
        background: scrolled ? 'rgba(240,237,230,.85)' : 'rgba(240,237,230,1)',
        borderBottom: '1px solid rgba(217,212,203,.5)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between h-[64px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-[22px] text-[#1C1B1A] tracking-tight">SHOPY</span>
            <span className="bg-[#FFD600] text-[#1C1B1A] text-[9px] font-semibold px-1.5 py-[2px] uppercase tracking-wider" style={{ borderRadius: 6 }}>Street</span>
          </Link>

          {/* Center nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <div
                key={item.label}
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
              >
                <Link
                  to={item.to}
                  className="nav-ul text-[13px] font-medium text-[#1C1B1A] uppercase tracking-[0.06em] py-5 inline-block"
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-[#1C1B1A] hover:text-[#6B6663] tr hidden sm:flex hover:bg-white/50" style={{ borderRadius: 12 }}>
              <Search size={19} strokeWidth={1.5} />
            </button>
            <Link
              to="/wishlist"
              className="p-2.5 text-[#1C1B1A] hover:text-[#6B6663] tr hidden sm:flex hover:bg-white/50"
              style={{ borderRadius: 12 }}
            >
              <Heart size={19} strokeWidth={1.5} />
            </Link>
            <Link
              to={user ? '/account' : '/auth'}
              className="p-2.5 text-[#1C1B1A] hover:text-[#6B6663] tr hidden sm:flex hover:bg-white/50"
              style={{ borderRadius: 12 }}
            >
              <User size={19} strokeWidth={1.5} />
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              className={`relative p-2.5 text-[#1C1B1A] hover:text-[#6B6663] tr hover:bg-white/50 ${bouncing ? 'cart-bounce' : ''}`}
              style={{ borderRadius: 12 }}
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#FFD600] text-[#1C1B1A] text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 flex flex-col justify-center items-center gap-[5px] w-10 h-10"
              aria-label="Menu"
            >
              <span className={`hb block w-5 h-[1.5px] bg-[#1C1B1A] ${mobileOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`hb block w-5 h-[1.5px] bg-[#1C1B1A] ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`hb block w-5 h-[1.5px] bg-[#1C1B1A] ${mobileOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ===== MEGA DROPDOWN ===== */}
      <div
        className={`mega absolute left-0 right-0 z-40 overflow-hidden hidden lg:block ${dropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
        onMouseEnter={openDropdown}
        onMouseLeave={closeDropdown}
      >
        <div className="glass-strong" style={{ borderRadius: 0, borderTop: '1px solid rgba(217,212,203,.5)' }}>
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 py-8 grid grid-cols-[1fr_1fr_320px] gap-10">
            {/* Category links */}
            <div className="flex gap-12">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#6B6663] mb-4 font-semibold">Shop</p>
                <div className="space-y-2">
                  {navItems.map(link => (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setDropdownOpen(false)}
                      className="block text-[15px] text-[#1C1B1A] py-1 tr hover:text-[#6B6663] hover:translate-x-1"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div />

            {/* Featured images */}
            <div className="flex gap-3">
              {megaImages.map((item, i) => (
                <Link
                  key={i}
                  to={item.to}
                  onClick={() => setDropdownOpen(false)}
                  className="flex-1 relative overflow-hidden group"
                  style={{ borderRadius: 16 }}
                >
                  <img
                    src={item.img}
                    alt={item.label}
                    className="w-full h-full object-cover aspect-[3/4] tr group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-semibold text-[13px]">{item.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[64px] z-50 flex flex-col items-center justify-center lg:hidden overflow-y-auto py-10"
          style={{ background: 'rgba(240,237,230,.95)', backdropFilter: 'blur(20px)' }}>
          <nav className="flex flex-col items-center gap-5 w-full px-8">
            <button
              onClick={() => setMobileAccordion(!mobileAccordion)}
              className={`mob-link font-display text-[28px] text-[#1C1B1A] flex items-center gap-2 ${mobileLinksVisible ? 'show' : ''}`}
              style={{ transitionDelay: '0ms' }}
            >
              Categories <ChevronDown size={22} className={`tr ${mobileAccordion ? 'rotate-180' : ''}`} />
            </button>
            {mobileAccordion && (
              <div className="flex flex-col items-center gap-3 pb-2">
                {navItems.map(item => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="text-[18px] text-[#6B6663] hover:text-[#1C1B1A] tr"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
            {navItems.slice(0, 3).map((item, i) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`mob-link font-display text-[28px] text-[#1C1B1A] hover:text-[#6B6663] tr ${mobileLinksVisible ? 'show' : ''}`}
                style={{ transitionDelay: mobileLinksVisible ? `${(i + 1) * 80}ms` : '0ms' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </nav>
  )
}
