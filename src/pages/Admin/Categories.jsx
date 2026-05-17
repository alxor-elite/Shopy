import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, GripVertical, RefreshCw, FolderOpen, Navigation } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const DEFAULT_CATEGORIES = [
  { name: 'T-Shirts', description: 'Graphic tees & basics', image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', sort_order: 1 },
  { name: 'Shirts', description: 'Casual & camp collar', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', sort_order: 2 },
  { name: 'Jeans', description: 'Slim, straight & relaxed', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', sort_order: 3 },
  { name: 'Cargos', description: 'Urban utility wear', image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', sort_order: 4 },
]

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const [tableExists, setTableExists] = useState(true)
  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('sort_order')
    if (error) {
      setTableExists(false)
      setLoading(false)
      return
    }
    setTableExists(true)
    setCategories(data || [])
    setLoading(false)
  }

  async function seedDefaults() {
    setSeeding(true)
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = categories.find(c => c.name === cat.name)
      if (!exists) {
        await supabase.from('categories').insert(cat)
      }
    }
    await fetchCategories()
    setSeeding(false)
  }

  async function deleteCategory(cat) {
    if (!confirm('Delete this category? Products in this category will not be deleted.')) return
    // Delete the associated banner image entry
    const bannerKey = `banner_${cat.name.toLowerCase().replace(/[^a-z]/g, '')}`
    await supabase.from('site_images').delete().eq('key', bannerKey)
    await supabase.from('categories').delete().eq('id', cat.id)
    fetchCategories()
  }

  async function toggleActive(cat) {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    fetchCategories()
  }

  async function toggleNavbar(cat) {
    const { error } = await supabase.from('categories').update({ show_in_navbar: !cat.show_in_navbar }).eq('id', cat.id)
    if (error) {
      alert('Run this SQL in Supabase SQL Editor first:\n\nALTER TABLE categories ADD COLUMN IF NOT EXISTS show_in_navbar BOOLEAN DEFAULT true;\n\nThen run: NOTIFY pgrst, \'reload schema\';')
      return
    }
    fetchCategories()
  }

  async function toggleFeatured(cat) {
    const { error } = await supabase.from('categories').update({ featured_in_menu: !cat.featured_in_menu }).eq('id', cat.id)
    if (error) {
      alert('Run this SQL in Supabase SQL Editor first:\n\nALTER TABLE categories ADD COLUMN IF NOT EXISTS featured_in_menu BOOLEAN DEFAULT false;\n\nThen run: NOTIFY pgrst, \'reload schema\';')
      return
    }
    fetchCategories()
  }

  async function moveCategory(id, direction) {
    const idx = categories.findIndex(c => c.id === id)
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === categories.length - 1)) return
    const swapWith = categories[idx + direction]
    await supabase.from('categories').update({ sort_order: categories[idx].sort_order }).eq('id', swapWith.id)
    await supabase.from('categories').update({ sort_order: swapWith.sort_order }).eq('id', id)
    fetchCategories()
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-lg" />)}
      </div>
    )
  }

  if (!tableExists) {
    return (
      <div className="text-center py-16">
        <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Categories Table Not Found</h2>
        <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
          The <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">categories</code> table doesn't exist yet.
          Run the SQL from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">supabase/schema.sql</code> in your Supabase SQL Editor to create it.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex items-center gap-2">
          {categories.length === 0 && (
            <button onClick={seedDefaults} disabled={seeding}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
              <RefreshCw size={16} className={seeding ? 'animate-spin' : ''} />
              {seeding ? 'Seeding...' : 'Load Defaults'}
            </button>
          )}
          <button onClick={() => { setEditing(null); setShowForm(true) }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {showForm && (
        <CategoryForm
          category={editing}
          nextOrder={categories.length}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSave={() => { setShowForm(false); setEditing(null); fetchCategories() }}
        />
      )}

      {categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg text-gray-500 mb-2">No categories yet</p>
          <p className="text-sm text-gray-400 mb-6">Click "Load Defaults" to add T-Shirts, Shirts, Jeans, and Cargos, or add your own.</p>
          <button onClick={seedDefaults} disabled={seeding}
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
            <RefreshCw size={16} className={seeding ? 'animate-spin' : ''} />
            {seeding ? 'Loading...' : 'Load Default Categories'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-5 py-3 w-10"></th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Navbar</th>
                <th className="px-5 py-3">Menu Image</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="text-sm">
                  <td className="px-5 py-3 text-gray-300">
                    <GripVertical size={16} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                      )}
                      <span className="font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{cat.description || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveCategory(cat.id, -1)} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">↑</button>
                      <button onClick={() => moveCategory(cat.id, 1)} disabled={idx === categories.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">↓</button>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(cat)} className={`px-2 py-0.5 rounded text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {cat.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleNavbar(cat)} className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${cat.show_in_navbar ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                      <Navigation size={12} />
                      {cat.show_in_navbar ? 'Shown' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleFeatured(cat)} className={`px-2 py-0.5 rounded text-xs font-medium ${cat.featured_in_menu ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                      {cat.featured_in_menu ? '★ Featured' : 'Off'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditing(cat); setShowForm(true) }} className="p-1.5 hover:bg-gray-100 rounded">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteCategory(cat)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CategoryForm({ category, nextOrder, onClose, onSave }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    is_active: category?.is_active ?? true,
    show_in_navbar: category?.show_in_navbar ?? true,
    featured_in_menu: category?.featured_in_menu ?? false,
  })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    let imageUrl = form.image_url

    // Try file upload first, fall back to URL input
    if (imageFile) {
      const fileName = `categories/${Date.now()}-${imageFile.name}`
      const { data, error } = await supabase.storage.from('product-images').upload(fileName, imageFile)
      if (error) {
        alert(`Image upload failed: ${error.message}`)
      } else if (data) {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path)
        imageUrl = publicUrl
      }
    }

    const catData = {
      name: form.name,
      description: form.description,
      image_url: imageUrl,
      is_active: form.is_active,
    }
    catData.show_in_navbar = form.show_in_navbar
    catData.featured_in_menu = form.featured_in_menu

    if (category) {
      await supabase.from('categories').update(catData).eq('id', category.id)
    } else {
      catData.sort_order = nextOrder
      await supabase.from('categories').insert(catData)

      // Auto-create a banner image entry for the Products page
      const bannerKey = `banner_${form.name.toLowerCase().replace(/[^a-z]/g, '')}`
      const { data: existing } = await supabase.from('site_images').select('id').eq('key', bannerKey).single()
      if (!existing) {
        await supabase.from('site_images').insert({
          key: bannerKey,
          label: `Products Page — Banner for "${form.name}" category`,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600',
        })
      }
    }

    setSaving(false)
    onSave()
  }

  return (
    <div className="bg-white rounded-xl border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{category ? 'Edit Category' : 'Add New Category'}</h2>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-black">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Short description" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Or Image URL</label>
            <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://images.unsplash.com/..." />
          </div>
        </div>

        {(category?.image_url || form.image_url) && !imageFile && (
          <div className="flex items-center gap-3">
            <img src={form.image_url || category?.image_url} alt="" className="w-16 h-16 rounded object-cover" />
            <span className="text-xs text-gray-500">Current image</span>
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 flex-wrap">
          <button type="submit" disabled={saving} className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-black" />
            Active (visible on storefront)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.show_in_navbar} onChange={e => setForm(f => ({ ...f, show_in_navbar: e.target.checked }))} className="accent-blue-600" />
            Show in Navbar
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured_in_menu} onChange={e => setForm(f => ({ ...f, featured_in_menu: e.target.checked }))} className="accent-yellow-500" />
            Featured in Menu (image shown in dropdown)
          </label>
        </div>
      </form>
    </div>
  )
}
