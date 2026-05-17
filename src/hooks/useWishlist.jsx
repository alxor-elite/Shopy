import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishlistIds, setWishlistIds] = useState([]) // product IDs
  const [loading, setLoading] = useState(false)

  // Load wishlist from DB when user logs in, or from localStorage for guests
  useEffect(() => {
    if (user) {
      setLoading(true)
      supabase.from('wishlists').select('product_id').eq('user_id', user.id).then(({ data }) => {
        setWishlistIds(data ? data.map(w => w.product_id) : [])
        setLoading(false)
      })
    } else {
      const stored = localStorage.getItem('wishlist')
      setWishlistIds(stored ? JSON.parse(stored) : [])
    }
  }, [user])

  // Persist guest wishlist to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistIds))
    }
  }, [wishlistIds, user])

  const isWishlisted = useCallback((productId) => wishlistIds.includes(productId), [wishlistIds])

  const toggleWishlist = useCallback(async (productId) => {
    const exists = wishlistIds.includes(productId)

    if (exists) {
      setWishlistIds(ids => ids.filter(id => id !== productId))
      if (user) {
        await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId)
      }
    } else {
      setWishlistIds(ids => [...ids, productId])
      if (user) {
        await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId })
      }
    }
  }, [wishlistIds, user])

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist, loading, count: wishlistIds.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
