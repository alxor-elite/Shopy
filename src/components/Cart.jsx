import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '../hooks/useCart'

const FREE_SHIPPING_THRESHOLD = 1499

export default function Cart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total } = useCart()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const remaining = FREE_SHIPPING_THRESHOLD - total

  return (
    <>
      <div className="fixed inset-0 bg-black/25 backdrop-blur-[4px] z-50" onClick={() => setIsOpen(false)} />

      <div
        className="fixed right-0 top-0 h-full w-full max-w-[420px] z-50 flex flex-col"
        style={{ background: 'rgba(240,237,230,.92)', backdropFilter: 'blur(32px)', borderLeft: '1px solid rgba(255,255,255,.3)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(217,212,203,.5)' }}>
          <h2 className="font-display text-xl text-[#1C1B1A]">
            Your Bag <span className="font-sans text-[13px] font-normal text-[#6B6663]">({items.length})</span>
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center tr hover:bg-white/50"
            style={{ borderRadius: 10 }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Free shipping bar */}
        {items.length > 0 && (
          <div className="px-6 py-3" style={{ borderBottom: '1px solid rgba(217,212,203,.5)' }}>
            <div className="h-[4px] overflow-hidden" style={{ borderRadius: 100, background: 'rgba(217,212,203,.5)' }}>
              <div className="h-full bg-[#3A7D44] tr" style={{ width: `${shippingProgress}%`, borderRadius: 100 }} />
            </div>
            <p className="text-[11px] text-[#6B6663] mt-1.5">
              {remaining > 0 ? `₹${remaining.toLocaleString('en-IN')} away from free shipping` : 'You qualify for free shipping!'}
            </p>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 flex items-center justify-center mb-4 glass" style={{ borderRadius: 16 }}>
              <ShoppingBag size={24} className="text-[#6B6663]" strokeWidth={1.5} />
            </div>
            <p className="text-[#6B6663] text-[14px] mb-1">Your bag is empty</p>
            <p className="text-[#6B6663] text-[12px] mb-6">Looks like you haven't added anything yet.</p>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[13px] font-medium text-[#1C1B1A] border-b border-[#1C1B1A] pb-0.5 hover:text-[#6B6663] hover:border-[#6B6663] tr"
            >
              Start Shopping &rarr;
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="glass-strong flex gap-4 p-3" style={{ borderRadius: 16 }}>
                  <div className="w-[68px] h-[85px] overflow-hidden bg-[#F5F2EC] flex-shrink-0" style={{ borderRadius: 12 }}>
                    <img
                      src={item.product.images?.[0] || 'https://placehold.co/72x90/F5F2EC/6B6663'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-medium text-[#1C1B1A] truncate leading-snug">{item.product.name}</h4>
                    <span className="inline-block text-[11px] text-[#6B6663] bg-white/50 px-2 py-0.5 mt-1" style={{ borderRadius: 6 }}>
                      Size: {item.size}
                    </span>
                    <p className="text-[14px] font-bold text-[#1C1B1A] mt-1.5">&#8377;{item.product.price.toLocaleString('en-IN')}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white/50 hover:bg-white tr"
                        style={{ borderRadius: 8 }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-[13px] font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, Math.min(item.quantity + 1, 5))}
                        disabled={item.quantity >= 5}
                        className={`w-7 h-7 flex items-center justify-center tr ${item.quantity >= 5 ? 'opacity-30 cursor-not-allowed bg-white/30' : 'bg-white/50 hover:bg-white'}`}
                        style={{ borderRadius: 8 }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.size)}
                    className="text-[#6B6663] hover:text-[#C0392B] self-start tr"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 space-y-4" style={{ background: 'rgba(255,255,255,.5)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,.3)' }}>
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-medium text-[#1C1B1A]">Subtotal</span>
                <span className="text-[17px] font-bold text-[#1C1B1A]">&#8377;{total.toLocaleString('en-IN')}</span>
              </div>
              <Link
                to="/checkout"
                onClick={() => setIsOpen(false)}
                className="clay-btn block w-full bg-[#1C1B1A] text-white text-center py-[14px] font-semibold text-[14px] tr hover:bg-[#FFD600] hover:text-[#1C1B1A]"
                style={{ borderRadius: 14 }}
              >
                Checkout
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="block w-full text-center text-[13px] text-[#6B6663] hover:text-[#1C1B1A] tr"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
