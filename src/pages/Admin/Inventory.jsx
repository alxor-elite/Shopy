import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminInventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})

  useEffect(() => { fetchInventory() }, [])

  async function fetchInventory() {
    const { data } = await supabase
      .from('product_sizes')
      .select('*, products(name, category)')
      .order('stock', { ascending: true })
    setInventory(data || [])
    setLoading(false)
  }

  async function updateStock(id, stock) {
    setSaving(s => ({ ...s, [id]: true }))
    await supabase
      .from('product_sizes')
      .update({ stock: Number(stock) })
      .eq('id', id)
    setSaving(s => ({ ...s, [id]: false }))
  }

  const handleStockChange = (id, value) => {
    setInventory(inv => inv.map(item =>
      item.id === id ? { ...item, stock: Number(value) } : item
    ))
  }

  if (loading) {
    return <div className="animate-pulse space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded" />)}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>
      <p className="text-sm text-gray-500 mb-4">
        Edit stock levels inline. Rows highlighted in amber have low stock (&lt; 5 units).
      </p>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Size</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {inventory.map(item => (
              <tr key={item.id} className={`text-sm ${item.stock < 5 ? 'bg-amber-50' : ''}`}>
                <td className="px-5 py-3 font-medium">{item.products?.name}</td>
                <td className="px-5 py-3 text-gray-500">{item.products?.category}</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                    {item.size}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <input
                    type="number"
                    value={item.stock}
                    onChange={e => handleStockChange(item.id, e.target.value)}
                    className={`w-20 border rounded px-2 py-1 text-sm ${item.stock < 5 ? 'border-amber-400' : ''}`}
                    min="0"
                  />
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => updateStock(item.id, item.stock)}
                    disabled={saving[item.id]}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    <Save size={12} />
                    {saving[item.id] ? 'Saving...' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
