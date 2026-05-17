import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

async function queryProducts(baseQuery) {
  // Try with product_colors, fallback without if table doesn't exist
  const { data, error } = await baseQuery
  if (error && error.message?.includes('product_colors')) {
    return null // signal to retry without colors
  }
  return { data, error }
}

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [filters.category, filters.sort, filters.minPrice, filters.maxPrice, filters.size])

  async function fetchProducts() {
    if (!isSupabaseConfigured) { setLoading(false); return }
    setLoading(true)

    let selectStr = '*, product_sizes(*), product_colors(*)'

    async function buildAndRun(select) {
      let query = supabase.from('products').select(select).eq('is_active', true)
      if (filters.category && filters.category !== 'All') query = query.eq('category', filters.category)
      if (filters.minPrice) query = query.gte('price', filters.minPrice)
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
      if (filters.sort === 'price-asc') query = query.order('price', { ascending: true })
      else if (filters.sort === 'price-desc') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })
      return await query
    }

    let { data, error } = await buildAndRun(selectStr)

    // Fallback: if product_colors table doesn't exist yet
    if (error) {
      const retry = await buildAndRun('*, product_sizes(*)')
      data = retry.data
      error = retry.error
    }

    if (error) {
      void('Error fetching products:', error)
    } else {
      let filtered = data
      if (filters.size) {
        filtered = data.filter(p =>
          p.product_sizes.some(s => s.size === filters.size && s.stock > 0)
        )
      }
      setProducts(filtered)
    }
    setLoading(false)
  }

  return { products, loading, refetch: fetchProducts }
}

export function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchProduct()
  }, [id])

  async function fetchProduct() {
    if (!isSupabaseConfigured) { setLoading(false); return }
    setLoading(true)

    let { data, error } = await supabase
      .from('products')
      .select('*, product_sizes(*), product_colors(*)')
      .eq('id', id)
      .single()

    // Fallback without colors
    if (error) {
      const retry = await supabase
        .from('products')
        .select('*, product_sizes(*)')
        .eq('id', id)
        .single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      void('Error fetching product:', error)
    } else {
      setProduct(data)
    }
    setLoading(false)
  }

  return { product, loading, refetch: fetchProduct }
}
