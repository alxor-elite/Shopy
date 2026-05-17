import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, MapPin, Package, LogOut, Plus, Trash2, Edit2, Check, X, RotateCcw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Account() {
  const { user, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth')
  }, [user, authLoading, navigate])

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1C1B1A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'orders', label: 'Orders', icon: Package },
  ]

  return (
    <div className="page-enter min-h-[60vh]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-[#1C1B1A]">My Account</h1>
            <p className="text-[#6B6663] text-sm mt-1">{user.email}</p>
          </div>
          <button onClick={handleSignOut}
            className="flex items-center gap-2 text-[13px] text-[#6B6663] hover:text-[#1C1B1A] tr">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 glass-strong p-1.5 w-fit" style={{ borderRadius: 14 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium tr ${
                tab === t.id ? 'bg-[#1C1B1A] text-white' : 'text-[#6B6663] hover:text-[#1C1B1A]'
              }`} style={{ borderRadius: 10 }}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && <ProfileTab user={user} />}
        {tab === 'addresses' && <AddressesTab user={user} />}
        {tab === 'orders' && <OrdersTab user={user} />}
      </div>
    </div>
  )
}

function ProfileTab({ user }) {
  const fullName = user.user_metadata?.full_name || ''
  const [name, setName] = useState(fullName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
    if (error) alert(error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  return (
    <div className="glass-strong p-8 max-w-lg" style={{ borderRadius: 20 }}>
      <h2 className="font-semibold text-lg mb-6">Profile Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-white/50 backdrop-blur-sm px-4 py-3 text-[14px] text-[#1C1B1A] focus:outline-none focus:bg-white tr"
            style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Email</label>
          <input value={user.email} disabled
            className="w-full bg-gray-100 px-4 py-3 text-[14px] text-[#6B6663] cursor-not-allowed"
            style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-[#1C1B1A] text-white px-5 py-2.5 text-[13px] font-medium hover:bg-[#333] tr disabled:opacity-50"
          style={{ borderRadius: 12 }}>
          {saved ? <><Check size={15} /> Saved!</> : saving ? 'Saving...' : 'Update Profile'}
        </button>
      </div>
    </div>
  )
}

function AddressesTab({ user }) {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [tableExists, setTableExists] = useState(true)

  useEffect(() => { fetchAddresses() }, [])

  async function fetchAddresses() {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) setTableExists(false)
      setLoading(false)
      return
    }
    setAddresses(data || [])
    setLoading(false)
  }

  async function deleteAddress(id) {
    if (!confirm('Delete this address?')) return
    await supabase.from('user_addresses').delete().eq('id', id)
    fetchAddresses()
  }

  async function setDefault(id) {
    // Unset all defaults first
    await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id)
    await supabase.from('user_addresses').update({ is_default: true }).eq('id', id)
    fetchAddresses()
  }

  if (loading) {
    return <div className="animate-pulse space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-24 bg-white/50 rounded-xl" />)}</div>
  }

  if (!tableExists) {
    return (
      <div className="glass-strong p-8 text-center" style={{ borderRadius: 20 }}>
        <MapPin size={40} className="mx-auto text-[#D9D4CB] mb-3" />
        <p className="text-[#6B6663] text-sm">Addresses table not set up yet. Run the SQL from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">supabase/schema.sql</code>.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Saved Addresses</h2>
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-[#1C1B1A] text-white px-4 py-2 text-[13px] font-medium hover:bg-[#333] tr"
          style={{ borderRadius: 12 }}>
          <Plus size={15} /> Add Address
        </button>
      </div>

      {showForm && (
        <AddressForm
          address={editing}
          userId={user.id}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSave={() => { setShowForm(false); setEditing(null); fetchAddresses() }}
        />
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="glass-strong p-10 text-center" style={{ borderRadius: 20 }}>
          <MapPin size={40} className="mx-auto text-[#D9D4CB] mb-3" />
          <p className="text-[#6B6663] text-sm mb-4">No saved addresses yet</p>
          <button onClick={() => setShowForm(true)}
            className="bg-[#1C1B1A] text-white px-5 py-2.5 text-[13px] font-medium hover:bg-[#333] tr"
            style={{ borderRadius: 12 }}>
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`glass-strong p-5 relative ${addr.is_default ? 'ring-2 ring-[#1C1B1A]' : ''}`} style={{ borderRadius: 16 }}>
              {addr.is_default && (
                <span className="absolute top-3 right-3 bg-[#1C1B1A] text-white text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider" style={{ borderRadius: 6 }}>Default</span>
              )}
              <p className="font-semibold text-[14px]">{addr.label || 'Address'}</p>
              <p className="text-[13px] text-[#6B6663] mt-1">{addr.full_name}</p>
              <p className="text-[13px] text-[#6B6663]">{addr.address_line}</p>
              <p className="text-[13px] text-[#6B6663]">{addr.city}{addr.state ? `, ${addr.state}` : ''} — {addr.pincode}</p>
              {addr.phone && <p className="text-[13px] text-[#6B6663]">{addr.phone}</p>}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/30">
                {!addr.is_default && (
                  <button onClick={() => setDefault(addr.id)} className="text-[12px] text-[#6B6663] hover:text-[#1C1B1A] tr">Set as Default</button>
                )}
                <button onClick={() => { setEditing(addr); setShowForm(true) }} className="text-[12px] text-blue-600 hover:underline flex items-center gap-1"><Edit2 size={12} /> Edit</button>
                <button onClick={() => deleteAddress(addr.id)} className="text-[12px] text-red-500 hover:underline flex items-center gap-1"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddressForm({ address, userId, onClose, onSave }) {
  const [form, setForm] = useState({
    label: address?.label || '',
    full_name: address?.full_name || '',
    phone: address?.phone || '',
    address_line: address?.address_line || '',
    city: address?.city || '',
    state: address?.state || '',
    pincode: address?.pincode || '',
    is_default: address?.is_default || false,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    if (form.is_default) {
      await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', userId)
    }

    const addrData = { ...form, user_id: userId }

    if (address) {
      await supabase.from('user_addresses').update(addrData).eq('id', address.id)
    } else {
      await supabase.from('user_addresses').insert(addrData)
    }

    setSaving(false)
    onSave()
  }

  return (
    <div className="glass-strong p-6 mb-6" style={{ borderRadius: 20 }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{address ? 'Edit Address' : 'New Address'}</h3>
        <button onClick={onClose} className="text-[#6B6663] hover:text-[#1C1B1A] tr"><X size={18} /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Label (e.g. Home, Office)</label>
            <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Home"
              className="w-full bg-white/50 px-4 py-2.5 text-[14px] focus:outline-none focus:bg-white tr"
              style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
          </div>
          <div>
            <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Full Name</label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required
              className="w-full bg-white/50 px-4 py-2.5 text-[14px] focus:outline-none focus:bg-white tr"
              style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
          </div>
          <div>
            <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210"
              className="w-full bg-white/50 px-4 py-2.5 text-[14px] focus:outline-none focus:bg-white tr"
              style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
          </div>
          <div>
            <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Pincode</label>
            <input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} required
              className="w-full bg-white/50 px-4 py-2.5 text-[14px] focus:outline-none focus:bg-white tr"
              style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
          </div>
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Address</label>
          <input value={form.address_line} onChange={e => setForm(f => ({ ...f, address_line: e.target.value }))} required placeholder="House no., Street, Landmark"
            className="w-full bg-white/50 px-4 py-2.5 text-[14px] focus:outline-none focus:bg-white tr"
            style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">City</label>
            <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required
              className="w-full bg-white/50 px-4 py-2.5 text-[14px] focus:outline-none focus:bg-white tr"
              style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
          </div>
          <div>
            <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">State</label>
            <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              className="w-full bg-white/50 px-4 py-2.5 text-[14px] focus:outline-none focus:bg-white tr"
              style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} className="accent-black" />
          Set as default address
        </label>
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-[#1C1B1A] text-white px-5 py-2.5 text-[13px] font-medium hover:bg-[#333] tr disabled:opacity-50"
            style={{ borderRadius: 12 }}>
            {saving ? 'Saving...' : address ? 'Update Address' : 'Save Address'}
          </button>
          <button type="button" onClick={onClose} className="text-[13px] text-[#6B6663] hover:text-[#1C1B1A] tr">Cancel</button>
        </div>
      </form>
    </div>
  )
}

function OrdersTab({ user }) {
  const [orders, setOrders] = useState([])
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [returnForm, setReturnForm] = useState(null) // order id
  const [returnReason, setReturnReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadData() }, [user.email])

  async function loadData() {
    const ordersRes = await supabase.from('orders').select('*, order_items(*, products(name, images))').eq('email', user.email).order('created_at', { ascending: false })

    let returnsData = []
    const returnsRes = await supabase.from('return_requests').select('*').eq('user_email', user.email)
    if (!returnsRes.error) returnsData = returnsRes.data || []

    setOrders(ordersRes.data || [])
    setReturns(returnsData)
    setLoading(false)
  }

  async function submitReturn(orderId) {
    if (!returnReason.trim()) return
    setSubmitting(true)
    await supabase.from('return_requests').insert({
      order_id: orderId,
      user_email: user.email,
      reason: returnReason,
    })
    setReturnForm(null)
    setReturnReason('')
    setSubmitting(false)
    loadData()
  }

  function getReturnForOrder(orderId) {
    return returns.find(r => r.order_id === orderId)
  }

  if (loading) {
    return <div className="animate-pulse space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/50 rounded-xl" />)}</div>
  }

  if (orders.length === 0) {
    return (
      <div className="glass-strong p-10 text-center" style={{ borderRadius: 20 }}>
        <Package size={40} className="mx-auto text-[#D9D4CB] mb-3" />
        <p className="text-[#6B6663] text-sm mb-4">No orders yet</p>
        <Link to="/products" className="inline-block bg-[#1C1B1A] text-white px-5 py-2.5 text-[13px] font-medium hover:bg-[#333] tr" style={{ borderRadius: 12 }}>
          Start Shopping
        </Link>
      </div>
    )
  }

  const returnStatusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const ret = getReturnForOrder(order.id)
        return (
          <div key={order.id} className="glass-strong p-5" style={{ borderRadius: 16 }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-[14px]">Order #{order.id.slice(0, 8)}</p>
                <p className="text-[12px] text-[#6B6663]">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[14px]">{'\u20B9'}{order.total?.toLocaleString('en-IN')}</p>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{order.status || 'Processing'}</span>
              </div>
            </div>

            {order.order_items && (
              <div className="flex gap-2 overflow-x-auto pt-2 border-t border-white/30">
                {order.order_items.map((item, i) => (
                  <div key={i} className="flex-shrink-0 flex items-center gap-2 bg-white/50 px-3 py-2" style={{ borderRadius: 10 }}>
                    {item.products?.images?.[0] && (
                      <img src={item.products.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                    )}
                    <div>
                      <p className="text-[12px] font-medium">{item.products?.name || 'Product'}</p>
                      <p className="text-[11px] text-[#6B6663]">Qty: {item.quantity} {item.size ? `| ${item.size}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Return section */}
            <div className="mt-3 pt-3 border-t border-white/30">
              {ret ? (
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${returnStatusColors[ret.status] || returnStatusColors.pending}`}>
                    Return {ret.status}
                  </span>
                  <span className="text-[11px] text-[#6B6663]">{ret.reason}</span>
                  {ret.admin_notes && <span className="text-[11px] text-[#6B6663]">— {ret.admin_notes}</span>}
                </div>
              ) : returnForm === order.id ? (
                <div className="space-y-2">
                  <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)}
                    placeholder="Why do you want to return this order?"
                    className="w-full bg-white/50 px-3 py-2 text-[13px] focus:outline-none focus:bg-white tr"
                    style={{ borderRadius: 10, border: '1px solid rgba(217,212,203,.5)' }} rows={2} />
                  <div className="flex gap-2">
                    <button onClick={() => submitReturn(order.id)} disabled={submitting || !returnReason.trim()}
                      className="bg-[#1C1B1A] text-white px-4 py-1.5 text-[12px] font-medium hover:bg-[#333] tr disabled:opacity-50" style={{ borderRadius: 8 }}>
                      {submitting ? 'Submitting...' : 'Submit Return'}
                    </button>
                    <button onClick={() => { setReturnForm(null); setReturnReason('') }} className="text-[12px] text-[#6B6663] hover:text-[#1C1B1A] tr">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setReturnForm(order.id)}
                  className="text-[12px] text-[#6B6663] hover:text-[#1C1B1A] tr flex items-center gap-1">
                  <RotateCcw size={12} /> Request Return
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
