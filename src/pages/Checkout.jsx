import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Smartphone, Truck, MapPin, Wallet, Building2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { loadRazorpay, RAZORPAY_KEY } from '../lib/razorpay'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', pincode: '' })
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [codConfirmed, setCodConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (!user) return
    setForm(f => ({ ...f, email: user.email, name: user.user_metadata?.full_name || '' }))
    supabase.from('user_addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        setSavedAddresses(data)
        const defaultAddr = data.find(a => a.is_default) || data[0]
        selectAddress(defaultAddr)
      }
    })
  }, [user])

  function selectAddress(addr) {
    setSelectedAddressId(addr.id)
    setForm(f => ({
      ...f,
      name: addr.full_name || f.name,
      phone: addr.phone || f.phone,
      address: addr.address_line,
      city: addr.city,
      pincode: addr.pincode,
    }))
  }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function createOrder() {
    const finalTotal = total + (total < 1499 ? 99 : 0) + (paymentMethod === 'cod' ? 49 : 0)

    const { data: order, error: orderError } = await supabase
      .from('orders').insert({
        customer_name: form.name, email: form.email, phone: form.phone,
        address: form.address, city: form.city, pincode: form.pincode,
        payment_method: paymentMethod, total: finalTotal,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
      }).select().single()
    if (orderError) throw orderError

    const orderItems = items.map(item => ({
      order_id: order.id, product_id: item.product.id,
      size: item.size, quantity: item.quantity, price: item.product.price,
    }))
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    return order
  }

  async function handleRazorpayPayment() {
    const finalTotal = total + (total < 1499 ? 99 : 0)

    const loaded = await loadRazorpay()
    if (!loaded) {
      setError('Failed to load payment gateway. Please check your internet connection.')
      setLoading(false)
      return
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: Math.round(finalTotal * 100), // Razorpay uses paise
      currency: 'INR',
      name: 'SHOPY Street',
      description: `Order of ${items.length} item${items.length > 1 ? 's' : ''}`,
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },
      theme: {
        color: '#1C1B1A',
        backdrop_color: 'rgba(0,0,0,0.5)',
      },
      handler: async (response) => {
        // Payment successful
        try {
          const order = await createOrder()
          // Save Razorpay payment ID
          await supabase.from('orders').update({
            razorpay_payment_id: response.razorpay_payment_id,
            payment_status: 'paid',
          }).eq('id', order.id)
          clearCart()
          navigate(`/order-confirmation/${order.id}`)
        } catch (err) {
          setError('Payment successful but order creation failed. Contact support.')
          setLoading(false)
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false)
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      setError(`Payment failed: ${response.error.description}`)
      setLoading(false)
    })
    rzp.open()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.pincode) {
      setError('Please fill in all fields'); setLoading(false); return
    }
    if (items.length === 0) { setError('Your cart is empty'); setLoading(false); return }

    if (paymentMethod === 'cod') {
      if (!codConfirmed) { setError('Please confirm Cash on Delivery'); setLoading(false); return }
      try {
        const order = await createOrder()
        clearCart()
        navigate(`/order-confirmation/${order.id}`)
      } catch (err) {
        setError(err.message || 'Something went wrong.')
      }
      setLoading(false)
    } else {
      // Online payment via Razorpay
      await handleRazorpayPayment()
    }
  }

  if (items.length === 0) {
    return (
      <div className="page-enter max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 py-10">
        <div className="text-center py-24"><p className="text-[#6B6663] text-lg">Your bag is empty</p></div>
      </div>
    )
  }

  const finalTotal = total + (total < 1499 ? 99 : 0) + (paymentMethod === 'cod' ? 49 : 0)
  const inputClass = "w-full bg-white/50 backdrop-blur-sm px-4 py-3 text-[14px] text-[#1C1B1A] focus:outline-none focus:bg-white tr"

  return (
    <div className="page-enter max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 py-10">
      <p className="text-[12px] uppercase tracking-[0.15em] text-[#6B6663] mb-2">Checkout</p>
      <h1 className="font-display text-[clamp(28px,4vw,40px)] text-[#1C1B1A] mb-10">Complete Your Order</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="glass-strong p-6" style={{ borderRadius: 20 }}>
            <h2 className="font-display text-xl text-[#1C1B1A] mb-5">Delivery Details</h2>

            {savedAddresses.length > 0 && (
              <div className="mb-5">
                <p className="text-[12px] font-medium text-[#6B6663] uppercase tracking-[0.05em] mb-2">Saved Addresses</p>
                <div className="space-y-2">
                  {savedAddresses.map(addr => (
                    <button key={addr.id} type="button" onClick={() => selectAddress(addr)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 tr ${
                        selectedAddressId === addr.id ? 'bg-white/60 ring-1 ring-[#1C1B1A]' : 'bg-white/20 hover:bg-white/40'
                      }`} style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }}>
                      <MapPin size={16} className="mt-0.5 text-[#6B6663] flex-shrink-0" />
                      <div>
                        <p className="text-[13px] font-medium">{addr.label || 'Address'} {addr.is_default ? <span className="text-[10px] bg-[#1C1B1A] text-white px-1.5 py-0.5 ml-1" style={{ borderRadius: 4 }}>Default</span> : ''}</p>
                        <p className="text-[12px] text-[#6B6663]">{addr.address_line}, {addr.city} — {addr.pincode}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#6B6663] mt-2">Or edit the fields below to use a different address</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-[#6B6663] uppercase tracking-[0.05em] mb-1.5">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className={inputClass} style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B6663] uppercase tracking-[0.05em] mb-1.5">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} placeholder="john@email.com" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B6663] uppercase tracking-[0.05em] mb-1.5">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} placeholder="+91 9876543210" />
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-[#6B6663] uppercase tracking-[0.05em] mb-1.5">Address</label>
                <input name="address" value={form.address} onChange={handleChange} className={inputClass} style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} placeholder="Street, Building, Floor" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B6663] uppercase tracking-[0.05em] mb-1.5">City</label>
                <input name="city" value={form.city} onChange={handleChange} className={inputClass} style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} placeholder="Mumbai" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B6663] uppercase tracking-[0.05em] mb-1.5">Pincode</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} className={inputClass} style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} placeholder="400001" />
              </div>
            </div>
          </div>

          <div className="glass-strong p-6" style={{ borderRadius: 20 }}>
            <h2 className="font-display text-xl text-[#1C1B1A] mb-5">Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer tr ${
                paymentMethod === 'online' ? 'bg-white/60' : 'bg-white/20 hover:bg-white/40'
              }`} style={{ borderRadius: 14, border: paymentMethod === 'online' ? '1px solid rgba(28,27,26,.2)' : '1px solid rgba(255,255,255,.3)' }}>
                <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="accent-[#1C1B1A]" />
                <CreditCard size={18} strokeWidth={1.5} className="text-[#6B6663]" />
                <div>
                  <span className="text-[14px] font-medium text-[#1C1B1A]">Pay Online</span>
                  <p className="text-[11px] text-[#6B6663]">Cards, UPI, Wallets, Netbanking</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer tr ${
                paymentMethod === 'cod' ? 'bg-white/60' : 'bg-white/20 hover:bg-white/40'
              }`} style={{ borderRadius: 14, border: paymentMethod === 'cod' ? '1px solid rgba(28,27,26,.2)' : '1px solid rgba(255,255,255,.3)' }}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#1C1B1A]" />
                <Truck size={18} strokeWidth={1.5} className="text-[#6B6663]" />
                <div>
                  <span className="text-[14px] font-medium text-[#1C1B1A]">Cash on Delivery</span>
                  <p className="text-[11px] text-[#6B6663]">Extra {'\u20B9'}49 handling fee</p>
                </div>
              </label>
            </div>

            {paymentMethod === 'online' && (
              <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-blue-50/50 text-[12px] text-[#6B6663]" style={{ borderRadius: 12 }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1"><CreditCard size={14} /> Cards</span>
                  <span className="text-[#D9D4CB]">|</span>
                  <span className="flex items-center gap-1"><Smartphone size={14} /> UPI</span>
                  <span className="text-[#D9D4CB]">|</span>
                  <span className="flex items-center gap-1"><Wallet size={14} /> Wallets</span>
                  <span className="text-[#D9D4CB]">|</span>
                  <span className="flex items-center gap-1"><Building2 size={14} /> Netbanking</span>
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input type="checkbox" checked={codConfirmed} onChange={e => setCodConfirmed(e.target.checked)} className="accent-[#1C1B1A]" />
                <span className="text-[13px] text-[#6B6663]">I confirm payment at delivery ({'\u20B9'}49 fee applies)</span>
              </label>
            )}
          </div>

          {error && <p className="text-[#C0392B] text-[13px] font-medium">{error}</p>}
        </div>

        <div>
          <div className="glass-strong p-6 sticky top-24" style={{ borderRadius: 20 }}>
            <h3 className="font-display text-lg text-[#1C1B1A] mb-5">Order Summary</h3>
            <div className="space-y-3 max-h-[280px] overflow-y-auto mb-4">
              {items.map(item => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                  <img src={item.product.images?.[0]} alt="" className="w-14 h-[70px] object-cover" style={{ borderRadius: 10 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{item.product.name}</p>
                    <p className="text-[11px] text-[#6B6663]">Size: {item.size} &times; {item.quantity}</p>
                  </div>
                  <p className="text-[13px] font-semibold">{'\u20B9'}{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 space-y-2" style={{ borderTop: '1px solid rgba(217,212,203,.5)' }}>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6B6663]">Subtotal</span><span>{'\u20B9'}{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6B6663]">Shipping</span>
                <span className={total >= 1499 ? 'text-[#3A7D44]' : ''}>{total >= 1499 ? 'FREE' : '\u20B999'}</span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6B6663]">COD Fee</span><span>{'\u20B9'}49</span>
                </div>
              )}
              <div className="flex justify-between text-[15px] font-bold pt-3" style={{ borderTop: '1px solid rgba(217,212,203,.5)' }}>
                <span>Total</span><span>{'\u20B9'}{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="clay-btn mt-6 w-full bg-[#1C1B1A] text-white h-[52px] font-semibold text-[15px] tr hover:bg-[#FFD600] hover:text-[#1C1B1A] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: 14 }}
            >
              {loading ? 'Processing...' : paymentMethod === 'cod'
                ? `Place Order — \u20B9${finalTotal.toLocaleString('en-IN')}`
                : `Pay \u20B9${finalTotal.toLocaleString('en-IN')}`}
            </button>

            {paymentMethod === 'online' && (
              <p className="text-[11px] text-center text-[#6B6663] mt-3">Secured by Razorpay. You'll be redirected to complete payment.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
