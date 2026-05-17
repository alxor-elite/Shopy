import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const SELECT_WITH_COLORS = '*, product_sizes(*), product_colors(*)'
const SELECT_WITHOUT_COLORS = '*, product_sizes(*)'

export function useRelatedProducts(productId, category, limit = 4) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    if (!productId || !category || !isSupabaseConfigured) return

    async function fetch() {
      let selectStr = SELECT_WITH_COLORS

      // Same category, exclude current
      let { data: sameCategory, error } = await supabase
        .from('products')
        .select(selectStr)
        .eq('category', category)
        .eq('is_active', true)
        .neq('id', productId)
        .limit(limit)

      // Fallback without colors
      if (error) {
        selectStr = SELECT_WITHOUT_COLORS
        const retry = await supabase
          .from('products')
          .select(selectStr)
          .eq('category', category)
          .eq('is_active', true)
          .neq('id', productId)
          .limit(limit)
        sameCategory = retry.data
      }

      let results = sameCategory || []

      // Fill remaining with newest from other categories
      if (results.length < limit) {
        const remaining = limit - results.length
        const existingIds = [productId, ...results.map(p => p.id)]
        const { data: others } = await supabase
          .from('products')
          .select(selectStr)
          .eq('is_active', true)
          .not('id', 'in', `(${existingIds.join(',')})`)
          .order('created_at', { ascending: false })
          .limit(remaining)
        if (others) results = [...results, ...others]
      }

      setProducts(results)
    }

    fetch()
  }, [productId, category])

  return products
}
