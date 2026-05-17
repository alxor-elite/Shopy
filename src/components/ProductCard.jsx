import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Check } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useToast } from './Toast'
import StockBadge from './StockBadge'

const MAX_VISIBLE_COLORS = 4

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { addToast } = useToast()
  const liked = isWishlisted(product.id)
  const [showSizes, setShowSizes] = useState(false)
  const [addedSize, setAddedSize] = useState(null)
  const [activeColorIdx, setActiveColorIdx] = useState(0)

  const totalStock = product.product_sizes?.reduce((sum, s) => sum + s.stock, 0) || 0
  const colors = product.product_colors?.sort((a, b) => a.sort_order - b.sort_order) || []
  const activeColor = colors[activeColorIdx]

  // Use the active color's image if available, otherwise fallback to product images
  const displayImage = activeColor?.image_url || product.images?.[0] || 'https://placehold.co/400x500/F5F2EC/6B6663?text=No+Image'

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (totalStock === 0) return
    setShowSizes(!showSizes)
  }

  const handleSizeSelect = (e, size) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, size.size)
    addToast(`${product.name} (${size.size}) added to bag`)
    setAddedSize(size.size)
    setTimeout(() => { setAddedSize(null); setShowSizes(false) }, 1200)
  }

  const handleColorClick = (e, idx) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveColorIdx(idx)
  }

  const visibleColors = colors.slice(0, MAX_VISIBLE_COLORS)
  const extraColors = colors.length - MAX_VISIBLE_COLORS

  return (
    <div className="group">
      <Link to={`/products/${product.id}`} className="block">
        <div className="product-card clay overflow-hidden">
          {/* Image area */}
          <div className={`relative aspect-[4/5] bg-[#F5F2EC] overflow-hidden ${totalStock === 0 ? 'grayscale-[40%]' : ''}`} style={{ borderRadius: '20px 20px 0 0' }}>
            <img src={displayImage} alt={product.name} className="pc-img absolute inset-0 w-full h-full object-cover" />

            {/* Stock badge */}
            <div className="absolute top-4 left-4 z-10">
              <StockBadge stock={totalStock} />
            </div>

            {/* Wishlist */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); addToast(liked ? 'Removed from wishlist' : 'Added to wishlist') }}
              className="wh absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center tr hover:bg-white hover:scale-110"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}
            >
              <Heart size={15} className={liked ? 'fill-[#C0392B] text-[#C0392B]' : 'text-[#6B6663]'} strokeWidth={1.5} />
            </button>

            {/* Quick add button - slides up on hover */}
            {totalStock > 0 && (
              <div className="qk absolute bottom-4 left-4 right-4 z-10">
                <button
                  onClick={handleQuickAdd}
                  className="w-full glass-strong text-[#1C1B1A] text-[13px] font-semibold py-2.5 flex items-center justify-center gap-2 tr hover:bg-white"
                  style={{ borderRadius: 14 }}
                >
                  <ShoppingBag size={14} /> Quick Add
                </button>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="px-4 sm:px-5 pt-4 pb-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#6B6663] mb-1">{product.category}</p>
            <h3 className="text-[15px] font-semibold text-[#1C1B1A] leading-snug line-clamp-1 uppercase tracking-[0.02em]">{product.name}</h3>
            {activeColor && (
              <p className="text-[12px] text-[#6B6663] mt-0.5">{activeColor.color_name}</p>
            )}

            {/* Color swatches */}
            {colors.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                {visibleColors.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={(e) => handleColorClick(e, i)}
                    className="tr hover:scale-110"
                    title={c.color_name}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: c.color_hex,
                      border: activeColorIdx === i ? '2px solid #1C1B1A' : '1.5px solid rgba(0,0,0,.12)',
                      boxShadow: activeColorIdx === i ? '0 0 0 2px #F0EDE6' : 'none',
                    }}
                  />
                ))}
                {extraColors > 0 && (
                  <span className="text-[11px] text-[#6B6663] font-medium ml-0.5">+{extraColors}</span>
                )}
              </div>
            )}

            <p className="text-[16px] font-bold text-[#1C1B1A] mt-1.5">&#8377;{product.price.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </Link>

      {/* Size grid - shown below card like Allbirds */}
      {showSizes && (
        <div className="mt-2 glass-strong p-3" style={{ borderRadius: 16 }}>
          <div className="flex flex-wrap gap-1.5">
            {product.product_sizes?.map(s => (
              <button
                key={s.id}
                onClick={(e) => s.stock > 0 && handleSizeSelect(e, s)}
                disabled={s.stock === 0}
                className={`flex-1 min-w-[44px] h-[40px] text-[13px] font-medium tr flex items-center justify-center ${
                  addedSize === s.size
                    ? 'bg-[#3A7D44] text-white'
                    : s.stock === 0
                    ? 'bg-[#F0EDE6] text-[#D9D4CB] cursor-not-allowed line-through'
                    : 'bg-white text-[#1C1B1A] hover:bg-[#1C1B1A] hover:text-white clay-btn'
                }`}
                style={{ borderRadius: 10 }}
              >
                {addedSize === s.size ? <Check size={14} /> : s.size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
