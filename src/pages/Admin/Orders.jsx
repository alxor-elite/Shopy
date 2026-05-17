import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const STATUS_OPTIONS = ['pending', 'shipped', 'delivered']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState({})

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  async function fetchOrderItems(orderId) {
    if (orderItems[orderId]) return
    const { data } = await supabase
      .from('order_items')
      .select('*, products(name, images)')
      .eq('order_id', orderId)
    setOrderItems(prev => ({ ...prev, [orderId]: data || [] }))
  }

  async function updateStatus(orderId, status) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
  }

  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
      fetchOrderItems(orderId)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-lg" />)}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
          No orders yet
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold">&#8377;{Number(order.total).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <select
                    value={order.status}
                    onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value) }}
                    onClick={e => e.stopPropagation()}
                    className={`text-xs font-medium px-2 py-1 rounded border ${
                      order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      'bg-amber-50 border-amber-200 text-amber-700'
                    }`}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="border-t px-5 py-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Phone</span>
                      <p className="font-medium">{order.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">City</span>
                      <p className="font-medium">{order.city}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Pincode</span>
                      <p className="font-medium">{order.pincode}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Payment</span>
                      <p className="font-medium uppercase">{order.payment_method}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Address</span>
                    <p className="text-sm font-medium">{order.address}</p>
                  </div>

                  {/* Order Items */}
                  <div className="mt-4">
                    <span className="text-gray-500 text-xs">Items</span>
                    <div className="mt-1 space-y-2">
                      {(orderItems[order.id] || []).map(item => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          <img
                            src={item.products?.images?.[0] || 'https://via.placeholder.com/32'}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="font-medium">{item.products?.name}</span>
                          <span className="text-gray-500">Size: {item.size}</span>
                          <span className="text-gray-500">&times;{item.quantity}</span>
                          <span className="ml-auto font-semibold">&#8377;{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
