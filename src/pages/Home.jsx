import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, AlertTriangle } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { isSupabaseConfigured } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { useScrollReveal, useStaggerReveal } from '../hooks/useScrollReveal'
import { useDragScroll } from '../hooks/useDragScroll'
import ProductCard from '../components/ProductCard'

const DEFAULT_CATEGORIES = [
  { name: 'T-Shirts', img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', desc: 'Graphic tees & basics' },
  { name: 'Shirts', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', desc: 'Casual & camp collar' },
  { name: 'Jeans', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', desc: 'Slim, straight & relaxed' },
  { name: 'Cargos', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', desc: 'Urban utility wear' },
]

export default function Home() {
  const { products, loading } = useProducts({ sort: 'newest' })
  const featured = products.slice(0, 8)
  const categoryRef = useRef(null)
  const storyRef = useScrollReveal()
  const editorialRef = useScrollReveal()
  const scrollContainerRef = useRef(null)
  const [heroOffset, setHeroOffset] = useState(0)
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600')
  const [storyImg1, setStoryImg1] = useState('https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400')
  const [storyImg2, setStoryImg2] = useState('https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=400')

  useDragScroll(scrollContainerRef)
  useStaggerReveal(categoryRef)

  // Load categories and hero from DB if available
  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data && data.length > 0) {
        setCategories(data.map(c => ({ name: c.name, img: c.image_url, desc: c.description })))
      }
    })
    supabase.from('site_images').select('key, image_url').in('key', ['hero_banner', 'story_image_1', 'story_image_2']).then(({ data }) => {
      if (data) {
        data.forEach(img => {
          if (img.key === 'hero_banner') setHeroImage(img.image_url)
          if (img.key === 'story_image_1') setStoryImg1(img.image_url)
          if (img.key === 'story_image_2') setStoryImg2(img.image_url)
        })
      }
    })
  }, [])

  useEffect(() => {
    const onScroll = () => setHeroOffset(window.scrollY * 0.3)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="page-enter">
      {/* Setup banner */}
      {!isSupabaseConfigured && (
        <div className="glass-strong mx-6 md:mx-12 lg:mx-20 mt-4 px-5 py-3 flex items-start gap-3" style={{ borderRadius: 14 }}>
          <AlertTriangle size={18} className="text-[#B7791F] mt-0.5 flex-shrink-0" />
          <p className="text-[13px] text-[#B7791F]">
            Supabase not configured. Update your <code className="bg-white/60 px-1 text-[12px]" style={{ borderRadius: 4 }}>.env</code> file and restart the dev server.
          </p>
        </div>
      )}

      {/* ===== HERO ===== */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroImage}
            alt=""
            className="hero-zoom w-full h-[120%] object-cover"
            style={{ transform: `translateY(-${heroOffset}px)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 w-full py-20">
          <div className="max-w-[560px]">
            <p className="text-[12px] uppercase tracking-[0.25em] text-white/60 mb-5">
              New Collection 2026
            </p>
            <h1 className="font-display text-[clamp(44px,7vw,88px)] leading-[0.92] text-white font-normal mb-6">
              Dress Bold.<br />
              <span className="italic">Be Bold.</span>
            </h1>
            <p className="text-[16px] text-white/70 max-w-[400px] leading-[1.8] mb-10">
              Streetwear that speaks louder than words. Discover the latest drops in urban fashion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="clay-btn flex items-center justify-center gap-2 bg-[#FFD600] text-[#1C1B1A] h-[52px] px-8 font-semibold text-[14px] tr hover:bg-white"
                style={{ borderRadius: 14 }}
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                to="/products?category=Cargos"
                className="flex items-center justify-center gap-2 h-[52px] px-8 font-medium text-[14px] tr text-white"
                style={{ borderRadius: 14, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.2)' }}
              >
                Explore Cargos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="py-6">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="glass-strong px-6 py-4" style={{ borderRadius: 16 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'ti-rosette', label: 'Premium Quality' },
                { icon: 'ti-refresh', label: 'Free Returns' },
                { icon: 'ti-lock', label: 'Secure Payments' },
                { icon: 'ti-shield-check', label: 'Made to Last' },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-center gap-2.5 py-2">
                  <i className={`ti ${f.icon}`} style={{ fontSize: 20, color: '#1C1B1A' }} />
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[#1C1B1A] font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY SHOWCASE ===== */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <p className="text-[12px] uppercase tracking-[0.15em] text-[#6B6663] mb-3">Shop by Category</p>
            <h2 className="font-display text-[clamp(32px,4vw,48px)] text-[#1C1B1A]">Find Your Style</h2>
          </div>
          <div ref={categoryRef} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="stagger-item relative group overflow-hidden"
                style={{ transitionDelay: `${i * 60}ms`, borderRadius: 20 }}
              >
                <div className="aspect-[3/4] relative overflow-hidden" style={{ borderRadius: 20 }}>
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover tr group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Label fully inside the image at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display text-[20px] text-white leading-tight">{cat.name}</h3>
                    <p className="text-[12px] text-white/60 mt-1">{cat.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEW DROPS ===== */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[12px] uppercase tracking-[0.15em] text-[#6B6663] mb-2">Fresh</p>
              <h2 className="font-display text-[clamp(28px,3.5vw,40px)] text-[#1C1B1A]">New Drops</h2>
            </div>
            <Link
              to="/products"
              className="group text-[13px] font-medium text-[#1C1B1A] flex items-center gap-1 tr hover:text-[#6B6663]"
            >
              View All
              <ArrowRight size={14} className="tr group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="clay overflow-hidden" style={{ borderRadius: 20 }}>
                <div className="aspect-[4/5] skel" style={{ borderRadius: '20px 20px 0 0' }} />
                <div className="p-5 space-y-2">
                  <div className="h-3 skel w-1/3" />
                  <div className="h-4 skel w-2/3" />
                  <div className="h-4 skel w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto px-6 md:px-12 lg:px-20 pb-4"
            style={{ scrollbarWidth: 'none' }}
          >
            {featured.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[300px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== MARQUEE PROMO STRIP ===== */}
      <section className="overflow-hidden py-4" style={{ background: 'rgba(28,27,26,.9)', backdropFilter: 'blur(8px)' }}>
        <div className="marquee-track">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white/50 text-[13px] uppercase tracking-[0.3em] whitespace-nowrap px-10 font-light">
              Free Shipping Above ₹1,499 &bull; Easy Returns &bull; 100% Authentic &bull; Secure Payments
            </span>
          ))}
        </div>
      </section>

      {/* ===== BRAND STATEMENT ===== */}
      <section className="py-24 overflow-hidden">
        <div ref={storyRef} className="reveal max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[12px] uppercase tracking-[0.15em] text-[#6B6663] mb-4">Our Story</p>
              <h2 className="font-display italic text-[clamp(28px,3.5vw,44px)] text-[#1C1B1A] leading-snug mb-6">
                Streetwear Isn't<br />Just Clothing.
              </h2>
              <p className="text-[#6B6663] text-[15px] leading-[1.9] max-w-[440px] mb-8">
                It's attitude. It's culture. It's how you tell the world who you are
                without saying a word. Our collection blends urban aesthetics with
                premium comfort — designed for people who move through the city with purpose.
              </p>
              <Link
                to="/products"
                className="clay-btn inline-flex items-center gap-2 bg-[#1C1B1A] text-white px-7 h-[48px] font-semibold text-[14px] tr hover:bg-[#FFD600] hover:text-[#1C1B1A]"
                style={{ borderRadius: 14 }}
              >
                Explore Collection <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden" style={{ borderRadius: 20 }}>
                <img src={storyImg1} alt="Style" className="aspect-[3/4] object-cover w-full" />
              </div>
              <div className="overflow-hidden mt-12" style={{ borderRadius: 20 }}>
                <img src={storyImg2} alt="Style" className="aspect-[3/4] object-cover w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== EDITORIAL BANNER ===== */}
      <section ref={editorialRef} className="reveal relative overflow-hidden">
        <div className="grain relative py-20 text-center" style={{ background: 'rgba(28,27,26,.95)' }}>
          <div className="relative z-10 max-w-[600px] mx-auto px-8">
            <h2 className="font-display text-[clamp(36px,5vw,56px)] text-white leading-tight mb-4">FREE SHIPPING</h2>
            <p className="text-[#6B6663] text-[15px] mb-8">On all orders above &#8377;1,499 &middot; No code needed</p>
            <Link
              to="/products"
              className="clay-btn inline-flex items-center gap-2 bg-[#FFD600] text-[#1C1B1A] px-7 h-[48px] font-semibold text-[14px] tr hover:bg-white"
              style={{ borderRadius: 14 }}
            >
              Shop Now <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
