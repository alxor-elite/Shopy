import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [categories, setCategories] = useState(['T-Shirts', 'Shirts', 'Jeans', 'Cargos'])

  useEffect(() => { fetchProducts(); fetchCategories() }, [])

  async function fetchProducts() {
    let { data, error } = await supabase
      .from('products')
      .select('*, product_sizes(*), product_colors(*)')
      .order('created_at', { ascending: false })
    if (error) {
      const retry = await supabase.from('products').select('*, product_sizes(*)').order('created_at', { ascending: false })
      data = retry.data
    }
    setProducts(data || [])
    setLoading(false)
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('name').order('sort_order')
    if (data && data.length > 0) setCategories(data.map(c => c.name))
  }

  async function toggleActive(product) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    fetchProducts()
  }

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSave={() => { setShowForm(false); setEditing(null); fetchProducts() }}
        />
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(product => {
                const totalStock = product.product_sizes?.reduce((s, ps) => s + ps.stock, 0) || 0
                return (
                  <tr key={product.id} className="text-sm">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded object-cover" />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{product.category}</td>
                    <td className="px-5 py-3 font-semibold">&#8377;{Number(product.price).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <span className={totalStock < 5 ? 'text-amber-600 font-medium' : ''}>{totalStock}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {product.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleActive(product)} className="p-1.5 hover:bg-gray-100 rounded" title={product.is_active ? 'Hide' : 'Show'}>
                          {product.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button onClick={() => { setEditing(product); setShowForm(true) }} className="p-1.5 hover:bg-gray-100 rounded">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ProductForm({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || categories[0] || 'T-Shirts',
    price: product?.price || '',
    is_active: product?.is_active ?? true,
  })
  const [sizes, setSizes] = useState(
    product?.product_sizes?.map(s => ({ size: s.size, stock: s.stock })) || [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }]
  )
  const [colors, setColors] = useState(
    product?.product_colors?.sort((a, b) => a.sort_order - b.sort_order).map(c => ({ color_name: c.color_name, color_hex: c.color_hex, image_url: c.image_url || '' })) || []
  )
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    let imageUrl = product?.images?.[0] || ''

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`
      const { data, error } = await supabase.storage.from('product-images').upload(fileName, imageFile)
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path)
        imageUrl = publicUrl
      }
    }

    if (product) {
      await supabase.from('products').update({
        name: form.name, description: form.description, category: form.category,
        price: form.price, images: imageUrl ? [imageUrl] : product.images, is_active: form.is_active,
      }).eq('id', product.id)

      await supabase.from('product_sizes').delete().eq('product_id', product.id)
      await supabase.from('product_sizes').insert(sizes.map(s => ({ product_id: product.id, size: s.size, stock: s.stock })))

      await supabase.from('product_colors').delete().eq('product_id', product.id)
      if (colors.length > 0) {
        await supabase.from('product_colors').insert(colors.map((c, i) => ({ product_id: product.id, color_name: c.color_name, color_hex: c.color_hex, image_url: c.image_url || null, sort_order: i })))
      }
    } else {
      const { data: newProduct } = await supabase.from('products').insert({
        name: form.name, description: form.description, category: form.category,
        price: form.price, images: imageUrl ? [imageUrl] : [], is_active: form.is_active,
      }).select().single()

      if (newProduct) {
        await supabase.from('product_sizes').insert(sizes.map(s => ({ product_id: newProduct.id, size: s.size, stock: s.stock })))
        if (colors.length > 0) {
          await supabase.from('product_colors').insert(colors.map((c, i) => ({ product_id: newProduct.id, color_name: c.color_name, color_hex: c.color_hex, image_url: c.image_url || null, sort_order: i })))
        }
      }
    }

    setSaving(false)
    onSave()
  }

  const addSize = () => setSizes([...sizes, { size: '', stock: 0 }])
  const removeSize = (i) => setSizes(sizes.filter((_, idx) => idx !== i))
  const updateSize = (i, key, value) => {
    const updated = [...sizes]
    updated[i][key] = key === 'stock' ? Number(value) : value
    setSizes(updated)
  }

  const addColor = () => setColors([...colors, { color_name: '', color_hex: '#000000', image_url: '' }])
  const removeColor = (i) => setColors(colors.filter((_, idx) => idx !== i))
  const updateColor = (i, key, value) => {
    const updated = [...colors]
    updated[i][key] = value
    setColors(updated)
  }

  return (
    <div className="bg-white rounded-xl border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-black">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (&#8377;)</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Sizes & Stock</label>
            <button type="button" onClick={addSize} className="text-xs text-blue-600 hover:underline">+ Add size</button>
          </div>
          <div className="space-y-2">
            {sizes.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={s.size} onChange={e => updateSize(i, 'size', e.target.value)} placeholder="Size" className="w-24 border rounded px-2 py-1.5 text-sm" />
                <input type="number" value={s.stock} onChange={e => updateSize(i, 'stock', e.target.value)} placeholder="Stock" className="w-24 border rounded px-2 py-1.5 text-sm" />
                <button type="button" onClick={() => removeSize(i)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Color Variants</label>
            <button type="button" onClick={addColor} className="text-xs text-blue-600 hover:underline">+ Add color</button>
          </div>
          <div className="space-y-2">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="color" value={c.color_hex} onChange={e => updateColor(i, 'color_hex', e.target.value)} className="w-10 h-8 border rounded cursor-pointer" />
                <input value={c.color_name} onChange={e => updateColor(i, 'color_name', e.target.value)} placeholder="Color name" className="w-28 border rounded px-2 py-1.5 text-sm" />
                <input value={c.image_url} onChange={e => updateColor(i, 'image_url', e.target.value)} placeholder="Image URL (optional)" className="flex-1 border rounded px-2 py-1.5 text-sm" />
                <button type="button" onClick={() => removeColor(i)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
              </div>
            ))}
            {colors.length === 0 && <p className="text-xs text-gray-400">No color variants. Add colors to show swatches on product cards.</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={saving} className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-black" />
            Active (visible on storefront)
          </label>
        </div>
      </form>
    </div>
  )
}
