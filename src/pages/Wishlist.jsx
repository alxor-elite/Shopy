import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useWishlist } from '../hooks/useWishlist'
import { useStaggerReveal } from '../hooks/useScrollReveal'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const { wishlistIds, count } = useWishlist()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const gridRef = useRef(null)
  useStaggerReveal(gridRef)

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    supabase
      .from('products')
      .select('*, product_sizes(*), product_colors(*)')
      .in('id', wishlistIds)
      .then(({ data }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [wishlistIds])

  return (
    <div className="page-enter min-h-[60vh]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-[#1C1B1A]">My Wishlist</h1>
          <p className="text-[#6B6663] text-sm mt-1">{count} {count === 1 ? 'item' : 'items'} saved</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="glass-strong inline-block px-12 py-10" style={{ borderRadius: 24 }}>
              <Heart size={48} className="mx-auto text-[#D9D4CB] mb-4" />
              <p className="text-[#6B6663] text-lg mb-2">Your wishlist is empty</p>
              <p className="text-[#6B6663] text-sm mb-6">Save items you love by tapping the heart icon</p>
              <Link to="/products"
                className="inline-block bg-[#1C1B1A] text-white px-6 py-2.5 text-[14px] font-medium hover:bg-[#333] tr"
                style={{ borderRadius: 12 }}>
                Browse Products
              </Link>
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
