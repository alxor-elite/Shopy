import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { supabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/supabase'
import { useStaggerReveal } from '../hooks/useScrollReveal'
import ProductCard from '../components/ProductCard'

const SIZES = ['S', 'M', 'L', 'XL', '28', '30', '32', '34']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
]

// Fallback banner images
const DEFAULT_BANNER_IMAGES = {
  'All': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600',
  'T-Shirts': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600',
  'Shirts': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1600',
  'Jeans': 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=1600',
  'Cargos': 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1600',
}

function SkeletonCard() {
  return (
    <div className="clay overflow-hidden" style={{ borderRadius: 20 }}>
      <div className="aspect-[4/5] skel" style={{ borderRadius: '20px 20px 0 0' }} />
      <div className="p-5 space-y-2">
        <div className="h-3 skel w-1/3" />
        <div className="h-4 skel w-2/3" />
        <div className="h-4 skel w-1/4" />
      </div>
    </div>
  )
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [categories, setCategories] = useState(['All', 'T-Shirts', 'Shirts', 'Jeans', 'Cargos'])
  const [bannerImages, setBannerImages] = useState(DEFAULT_BANNER_IMAGES)
  const gridRef = useRef(null)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    size: '',
  })

  // Load categories and banner images from DB
  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.from('categories').select('name').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data && data.length > 0) {
        setCategories(['All', ...data.map(c => c.name)])
      }
    })
    supabase.from('categories').select('name').eq('is_active', true).order('sort_order').then(({ data: cats }) => {
      const catNames = cats ? cats.map(c => c.name) : []
      supabase.from('site_images').select('key, image_url').then(({ data }) => {
        if (data && data.length > 0) {
          const mapped = { ...DEFAULT_BANNER_IMAGES }
          data.forEach(img => {
            if (!img.image_url) return
            if (img.key === 'banner_all') { mapped['All'] = img.image_url; return }
            if (img.key.startsWith('banner_')) {
              const keyPart = img.key.replace('banner_', '')
              // Match against all category names (including dynamic ones)
              const allNames = [...new Set([...Object.keys(mapped), ...catNames])]
              const match = allNames.find(k => k.toLowerCase().replace(/[^a-z]/g, '') === keyPart)
              if (match) mapped[match] = img.image_url
            }
          })
          setBannerImages(mapped)
        }
      })
    })
  }, [])

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setFilters(f => ({ ...f, category: cat }))
  }, [searchParams])

  const { products, loading } = useProducts(filters)
  useStaggerReveal(gridRef)

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }))
    if (key === 'category') {
      value === 'All' ? searchParams.delete('category') : searchParams.set('category', value)
      setSearchParams(searchParams)
    }
  }

  const clearFilters = () => {
    setFilters({ category: 'All', sort: 'newest', minPrice: '', maxPrice: '', size: '' })
    setSearchParams({})
  }

  const activeCount = [
    filters.category !== 'All',
    filters.size,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length

  const currentSort = SORT_OPTIONS.find(o => o.value === filters.sort)
  const bannerImg = bannerImages[filters.category] || bannerImages['All'] || DEFAULT_BANNER_IMAGES['All']

  return (
    <div className="page-enter min-h-screen">
      {/* ===== HERO BANNER — different per category ===== */}
      <div className="relative h-[280px] overflow-hidden">
        <img src={bannerImg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F0EDE6] via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-20 pb-8">
          <div className="max-w-[1280px] mx-auto">
            <h1 className="font-display text-[clamp(32px,5vw,48px)] text-white leading-tight drop-shadow-lg">
              {filters.category === 'All' ? 'All Products' : filters.category}
            </h1>
            <p className="text-white/80 text-[14px] mt-1">
              Discover our collection of premium streetwear essentials.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 py-8">
        {/* ===== TOP FILTER BAR ===== */}
        <div className="glass-strong px-5 py-3 flex items-center justify-between gap-4 mb-8" style={{ borderRadius: 16 }}>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center gap-2 text-[13px] font-medium text-[#1C1B1A] tr hover:text-[#6B6663]"
          >
            <SlidersHorizontal size={16} />
            FILTER
            <span className="text-[#6B6663]">({products.length} products)</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#1C1B1A] text-white text-[10px] font-bold flex items-center justify-center">{activeCount}</span>
            )}
          </button>

          <div className="hidden md:flex items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => updateFilter('category', cat)}
                className={`filter-pill ${filters.category === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 text-[13px] font-medium text-[#1C1B1A] filter-pill"
              style={{ background: 'rgba(255,255,255,.5)' }}
            >
              {currentSort?.label || 'Sort'}
              <ChevronDown size={14} className={`tr ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-2 glass-strong py-2 min-w-[180px] z-20" style={{ borderRadius: 14 }}>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { updateFilter('sort', opt.value); setSortOpen(false) }}
                      className={`block w-full text-left px-4 py-2 text-[13px] tr ${
                        filters.sort === opt.value ? 'font-semibold text-[#1C1B1A] bg-white/50' : 'text-[#6B6663] hover:text-[#1C1B1A] hover:bg-white/30'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===== EXPANDABLE FILTER PANEL ===== */}
        {showFilterPanel && (
          <div className="glass-strong p-6 mb-8" style={{ borderRadius: 20 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-[11px] uppercase tracking-[0.1em] text-[#6B6663] font-semibold mb-3">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <button key={size} onClick={() => updateFilter('size', filters.size === size ? '' : size)}
                      className={`w-11 h-11 text-[12px] font-medium flex items-center justify-center tr ${
                        filters.size === size ? 'bg-[#1C1B1A] text-white' : 'bg-white/50 text-[#1C1B1A] hover:bg-white'
                      }`}
                      style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,.3)', boxShadow: filters.size === size ? '0 4px 12px rgba(28,27,26,.15)' : '2px 2px 6px rgba(0,0,0,.04)' }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] uppercase tracking-[0.1em] text-[#6B6663] font-semibold mb-3">Price Range</h4>
                <div className="flex items-center gap-3">
                  <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
                    className="w-full text-[13px] bg-white/50 backdrop-blur-sm px-4 py-2.5 text-[#1C1B1A] focus:outline-none focus:bg-white tr"
                    style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,.3)' }} />
                  <span className="text-[#6B6663] text-xs">to</span>
                  <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
                    className="w-full text-[13px] bg-white/50 backdrop-blur-sm px-4 py-2.5 text-[#1C1B1A] focus:outline-none focus:bg-white tr"
                    style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,.3)' }} />
                </div>
                <button onClick={clearFilters} className="text-[13px] text-[#6B6663] hover:text-[#1C1B1A] tr underline underline-offset-2 mt-4">
                  Clear all filters
                </button>
              </div>

              <div>
                <h4 className="text-[11px] uppercase tracking-[0.1em] text-[#6B6663] font-semibold mb-3">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => updateFilter('category', cat)}
                      className={`filter-pill text-[12px] ${filters.category === cat ? 'active' : ''}`}>{cat}</button>
                  ))}
                </div>
              </div>
            </div>

            {activeCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/30">
                {filters.category !== 'All' && (
                  <button onClick={() => updateFilter('category', 'All')} className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-[#1C1B1A] text-white px-3 py-1.5 tr hover:bg-[#333]" style={{ borderRadius: 100 }}>
                    {filters.category} <X size={10} />
                  </button>
                )}
                {filters.size && (
                  <button onClick={() => updateFilter('size', '')} className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-[#1C1B1A] text-white px-3 py-1.5 tr hover:bg-[#333]" style={{ borderRadius: 100 }}>
                    Size: {filters.size} <X size={10} />
                  </button>
                )}
                {filters.minPrice && (
                  <button onClick={() => updateFilter('minPrice', '')} className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-[#1C1B1A] text-white px-3 py-1.5 tr hover:bg-[#333]" style={{ borderRadius: 100 }}>
                    Min: ₹{filters.minPrice} <X size={10} />
                  </button>
                )}
                {filters.maxPrice && (
                  <button onClick={() => updateFilter('maxPrice', '')} className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-[#1C1B1A] text-white px-3 py-1.5 tr hover:bg-[#333]" style={{ borderRadius: 100 }}>
                    Max: ₹{filters.maxPrice} <X size={10} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== PRODUCT GRID ===== */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="clay inline-block px-10 py-8">
              <p className="text-[#6B6663] text-lg mb-3">No products found</p>
              <button onClick={clearFilters} className="text-[13px] font-medium text-[#1C1B1A] clay-btn bg-white px-5 py-2">
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="stagger-item" style={{ transitionDelay: `${i * 50}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
