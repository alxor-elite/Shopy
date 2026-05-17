import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const STORAGE_KEY = 'recently-viewed'
const MAX_ITEMS = 4

export function useRecentlyViewed(currentProductId) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    if (!currentProductId) return

    // Add current to recently viewed
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const filtered = stored.filter(id => id !== currentProductId)
    const updated = [currentProductId, ...filtered].slice(0, MAX_ITEMS + 1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

    // Fetch previously viewed (excluding current)
    const idsToFetch = updated.filter(id => id !== currentProductId).slice(0, MAX_ITEMS)
    if (idsToFetch.length === 0 || !isSupabaseConfigured) return

    supabase
      .from('products')
      .select('*, product_sizes(*), product_colors(*)')
      .in('id', idsToFetch)
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (error) {
          // Fallback without colors
          return supabase.from('products').select('*, product_sizes(*)').in('id', idsToFetch).eq('is_active', true)
        }
        return { data }
      })
      .then(({ data }) => {
        if (data) setProducts(data)
      })
  }, [currentProductId])

  return products
}
