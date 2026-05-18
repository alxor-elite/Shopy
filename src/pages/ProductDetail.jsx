import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, ChevronRight, ChevronDown, ArrowRight, Loader2 } from 'lucide-react'
import { useProduct } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { useToast } from '../components/Toast'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { useRelatedProducts } from '../hooks/useRelatedProducts'
import StockBadge from '../components/StockBadge'
import ProductCard from '../components/ProductCard'

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(217,212,203,.5)' }}>
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full py-4 text-left">
        <span className="text-[14px] font-medium text-[#1C1B1A]">{title}</span>
        <ChevronDown size={16} className={`text-[#6B6663] tr ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`acc-body ${open ? 'open' : ''}`}>
        <div className="acc-inner pb-4 text-[14px] text-[#6B6663] leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function SizeGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[4px] z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="glass-strong max-w-md w-full p-6" style={{ borderRadius: 20 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-[#1C1B1A]">Size Guide</h3>
            <button onClick={onClose} className="text-[#6B6663] hover:text-[#1C1B1A] text-lg">&times;</button>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[#6B6663]" style={{ borderBottom: '1px solid rgba(217,212,203,.5)' }}>
                <th className="pb-2">Size</th><th className="pb-2">Chest</th><th className="pb-2">Waist</th><th className="pb-2">Length</th>
              </tr>
            </thead>
            <tbody className="text-[#1C1B1A]">
              {[['S','36"','30"','27"'],['M','38"','32"','28"'],['L','40"','34"','29"'],['XL','42"','36"','30"']].map(([s,c,w,l]) => (
                <tr key={s} style={{ borderBottom: '1px solid rgba(217,212,203,.3)' }}>
                  <td className="py-2.5 font-medium">{s}</td><td className="py-2.5">{c}</td><td className="py-2.5">{w}</td><td className="py-2.5">{l}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[12px] text-[#6B6663] mt-4">For jeans: 28–34 refers to waist size in inches.</p>
        </div>
      </div>
    </>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const { product, loading } = useProduct(id)
  const { addItem } = useCart()
  const { addToast } = useToast()
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColorIdx, setSelectedColorIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedState, setAddedState] = useState(false)
  const [adding, setAdding] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const imageRef = useRef(null)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [isZooming, setIsZooming] = useState(false)

  const recentlyViewed = useRecentlyViewed(id)
  const relatedProducts = useRelatedProducts(id, product?.category)

  // Scroll to top when navigating to a new product
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const handleMouseMove = (e) => {
    const rect = imageRef.current?.getBoundingClientRect()
    if (!rect) return
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
  }

  if (loading) {
    return (
      <div className="page-enter max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="grid lg:grid-cols-[55%_45%] gap-12">
          <div className="aspect-square skel" style={{ borderRadius: 20 }} />
          <div className="space-y-4 py-8">
            <div className="h-3 skel w-1/4" />
            <div className="h-8 skel w-3/4" />
            <div className="h-6 skel w-1/4" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page-enter max-w-[1280px] mx-auto px-6 py-24 text-center">
        <div className="clay inline-block px-10 py-8">
          <p className="text-[#6B6663] text-lg mb-2">Product not found</p>
          <Link to="/products" className="text-[13px] text-[#1C1B1A] border-b border-[#1C1B1A] pb-0.5">Back to products</Link>
        </div>
      </div>
    )
  }

  const sizes = product.product_sizes || []
  const colors = product.product_colors?.sort((a, b) => a.sort_order - b.sort_order) || []
  const activeColor = selectedColorIdx >= 0 ? colors[selectedColorIdx] : null
  const activeColorImage = activeColor?.image_url || null
  const mainImage = activeColorImage || product.images?.[selectedImage] || 'https://placehold.co/600x600/F5F2EC/6B6663'
  const selectedSizeData = sizes.find(s => s.size === selectedSize)
  const stock = selectedSizeData?.stock ?? null
  const maxQty = stock !== null ? Math.min(stock, 5) : 5

  const handleAddToCart = () => {
    if (!selectedSize) return
    setAdding(true)
    setTimeout(() => {
      addItem(product, selectedSize, quantity)
      addToast(`${product.name} (${selectedSize}) x${quantity} added to bag`)
      setAdding(false)
      setAddedState(true)
      setQuantity(1)
      setTimeout(() => setAddedState(false), 2000)
    }, 600)
  }

  return (
    <div className="page-enter">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] text-[#6B6663] mb-8">
          <Link to="/products" className="hover:text-[#1C1B1A] tr">All Products</Link>
          <ChevronRight size={12} />
          <Link to={`/products?category=${product.category}`} className="hover:text-[#1C1B1A] tr">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-[#1C1B1A]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-[55%_45%] gap-12">
          {/* ===== IMAGE GALLERY ===== */}
          <div>
            <div
              ref={imageRef}
              className="aspect-square overflow-hidden bg-[#F5F2EC] cursor-crosshair relative clay"
              onMouseEnter={() => setIsZooming(true)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsZooming(false)}
              style={{ borderRadius: 24 }}
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover tr"
                style={isZooming ? { transform: 'scale(1.8)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
              />
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2.5 mt-3">
              {activeColorImage && (
                <button
                  className="w-[80px] h-[100px] overflow-hidden tr flex-shrink-0 ring-2 ring-[#FFD600] ring-offset-2"
                  style={{ borderRadius: 14 }}
                >
                  <img src={activeColorImage} alt="" className="w-full h-full object-cover" />
                </button>
              )}
              {(product.images || []).filter(Boolean).map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedImage(i); setSelectedColorIdx(-1) }}
                  className={`w-[80px] h-[100px] overflow-hidden tr flex-shrink-0 ${
                    !activeColorImage && selectedImage === i ? 'ring-2 ring-[#FFD600] ring-offset-2' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ borderRadius: 14 }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ===== PRODUCT INFO ===== */}
          <div className="py-2">
            <span className="inline-block text-[11px] uppercase tracking-[0.1em] text-[#6B6663] glass px-3 py-1.5 mb-3" style={{ borderRadius: 100 }}>
              {product.category}
            </span>
            <h1 className="font-display text-[clamp(28px,3vw,36px)] text-[#1C1B1A] leading-snug mb-3">{product.name}</h1>
            <p className="text-[24px] font-bold text-[#1C1B1A] mb-1">&#8377;{product.price.toLocaleString('en-IN')}</p>
            <p className="text-[13px] text-[#6B6663] mb-6">Inclusive of all taxes</p>

            {/* Color Selector */}
            {product.product_colors?.length > 0 && (() => {
              const colors = product.product_colors.sort((a, b) => a.sort_order - b.sort_order)
              const activeColor = colors[selectedColorIdx]
              return (
                <div className="mb-6">
                  <h3 className="text-[13px] font-semibold text-[#1C1B1A] uppercase tracking-[0.05em] mb-1">
                    Color — <span className="font-normal text-[#6B6663] normal-case">{activeColor?.color_name}</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-3">
                    {colors.map((c, i) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedColorIdx(i)
                          if (c.image_url) setSelectedImage(0)
                        }}
                        title={c.color_name}
                        className="tr hover:scale-110"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: c.color_hex,
                          border: selectedColorIdx === i ? '2.5px solid #1C1B1A' : '2px solid rgba(0,0,0,.1)',
                          boxShadow: selectedColorIdx === i ? '0 0 0 3px #F0EDE6, 0 2px 8px rgba(0,0,0,.1)' : '0 1px 4px rgba(0,0,0,.06)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Size Selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-[#1C1B1A] uppercase tracking-[0.05em]">Select Size</h3>
                <button onClick={() => setSizeGuideOpen(true)} className="text-[13px] font-medium text-[#1C1B1A] border-b border-[#1C1B1A] pb-0.5 hover:text-[#6B6663] hover:border-[#6B6663] tr">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s.size)}
                    disabled={s.stock === 0}
                    className={`w-[52px] h-[52px] text-[14px] font-medium tr relative flex items-center justify-center ${
                      selectedSize === s.size
                        ? 'bg-[#1C1B1A] text-white'
                        : s.stock === 0
                        ? 'bg-[#F0EDE6] text-[#D9D4CB] cursor-not-allowed'
                        : 'bg-white/50 text-[#1C1B1A] hover:bg-white'
                    }`}
                    style={{
                      borderRadius: 14,
                      border: selectedSize === s.size ? '1px solid #1C1B1A' : '1px solid rgba(217,212,203,.5)',
                      boxShadow: selectedSize === s.size ? '0 4px 12px rgba(28,27,26,.15)' : '2px 2px 6px rgba(0,0,0,.03)',
                    }}
                  >
                    {s.size}
                    {s.stock === 0 && <div className="oos-line absolute inset-0" style={{ borderRadius: 14 }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock */}
            {selectedSize && stock !== null && (
              <div className="flex items-center gap-2 mb-4">
                <StockBadge stock={stock} />
              </div>
            )}

            {/* Quantity */}
            {selectedSize && stock > 0 && (
              <div className="mb-5">
                <h3 className="text-[13px] font-semibold text-[#1C1B1A] uppercase tracking-[0.05em] mb-2">Quantity</h3>
                <div className="inline-flex items-center glass-strong" style={{ borderRadius: 12 }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-[18px] text-[#1C1B1A] tr hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ borderRadius: '12px 0 0 12px' }}
                  >
                    &minus;
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-[14px] font-semibold text-[#1C1B1A]" style={{ borderLeft: '1px solid rgba(217,212,203,.5)', borderRight: '1px solid rgba(217,212,203,.5)' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="w-10 h-10 flex items-center justify-center text-[18px] text-[#1C1B1A] tr hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ borderRadius: '0 12px 12px 0' }}
                  >
                    +
                  </button>
                </div>
                {maxQty <= 5 && <span className="text-[12px] text-[#6B6663] ml-3">Max {maxQty} available</span>}
              </div>
            )}

            {/* Product highlights */}
            <div className="glass-strong space-y-3 mb-6 p-4" style={{ borderRadius: 16 }}>
              {[
                { icon: 'ti-truck', text: 'Free delivery on orders above ₹1,499' },
                { icon: 'ti-arrow-back', text: 'Easy 30-day returns' },
                { icon: 'ti-shield', text: '100% authentic products' },
              ].map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <i className={`ti ${h.icon}`} style={{ fontSize: 18, color: '#6B6663' }} />
                  <span className="text-[13px] text-[#6B6663]">{h.text}</span>
                </div>
              ))}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || stock === 0 || adding}
              className={`clay-btn w-full h-[54px] flex items-center justify-center gap-2 font-semibold text-[15px] tr mb-3 ${
                !selectedSize || stock === 0
                  ? 'bg-[#D9D4CB] text-[#6B6663] cursor-not-allowed'
                  : addedState
                  ? 'bg-[#3A7D44] text-white'
                  : 'bg-[#1C1B1A] text-white hover:bg-[#FFD600] hover:text-[#1C1B1A]'
              }`}
              style={{ borderRadius: 14 }}
            >
              {adding ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  {addedState ? 'Added! ✓' : !selectedSize ? 'Select a Size' : stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                </>
              )}
            </button>

            {/* Alt payment */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-[12px] text-[#6B6663]">or buy with</span>
              <span className="text-[11px] font-medium glass px-3 py-1 text-[#6B6663]" style={{ borderRadius: 100 }}>UPI</span>
              <span className="text-[11px] font-medium glass px-3 py-1 text-[#6B6663]" style={{ borderRadius: 100 }}>COD</span>
            </div>

            {/* Accordions */}
            <div style={{ borderTop: '1px solid rgba(217,212,203,.5)' }}>
              <Accordion title="Description">
                {product.description || 'Premium quality streetwear crafted for comfort and style.'}
              </Accordion>
              <Accordion title="Size Guide">
                <p>S: Chest 36" &middot; M: Chest 38" &middot; L: Chest 40" &middot; XL: Chest 42"</p>
                <p className="mt-1">For jeans: 28–34 refers to waist size in inches.</p>
              </Accordion>
              <Accordion title="Shipping & Returns">
                <p>Free shipping on orders above &#8377;1,499. Standard delivery in 5–7 business days.</p>
                <p className="mt-1">Easy 15-day returns. Items must be unworn with tags attached.</p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* ===== YOU MIGHT ALSO LIKE ===== */}
      {relatedProducts.length > 0 && (
        <section className="page-enter py-16" style={{ background: 'rgba(255,255,255,.3)' }}>
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20">
            <p className="text-[12px] uppercase tracking-[0.15em] text-[#6B6663] mb-2">Curated for You</p>
            <h2 className="font-display text-[clamp(24px,3vw,32px)] text-[#1C1B1A] mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== RECENTLY VIEWED ===== */}
      {recentlyViewed.length > 0 && (
        <section className="page-enter py-16">
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20">
            <p className="text-[12px] uppercase tracking-[0.15em] text-[#6B6663] mb-2">Your History</p>
            <h2 className="font-display text-[clamp(24px,3vw,32px)] text-[#1C1B1A] mb-8">Recently Viewed</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {recentlyViewed.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== COMPLETE THE LOOK ===== */}
      <section className="py-12" style={{ background: 'rgba(28,27,26,.95)' }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h2 className="font-display text-[28px] text-white mb-2">Complete the Look</h2>
          <p className="text-[#6B6663] text-[15px] mb-6">Pair it with these &rarr;</p>
          <Link
            to="/products"
            className="clay-btn inline-flex items-center gap-2 bg-[#FFD600] text-[#1C1B1A] px-6 h-[44px] font-semibold text-[14px] tr hover:bg-white"
            style={{ borderRadius: 14 }}
          >
            Browse All Products <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  )
}
