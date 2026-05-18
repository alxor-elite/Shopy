import { Link } from 'react-router-dom'
import { Truck, RotateCcw, Ruler, Mail, Phone, MapPin, ChevronDown } from 'lucide-react'
import { useState } from 'react'

function PageWrapper({ title, children }) {
  return (
    <div className="page-enter min-h-[60vh]">
      <div className="max-w-[800px] mx-auto px-6 md:px-12 py-12">
        <h1 className="font-display text-3xl text-[#1C1B1A] mb-8">{title}</h1>
        {children}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-[16px] font-semibold text-[#1C1B1A] mb-3">{title}</h2>
      <div className="text-[14px] text-[#6B6663] leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export function ShippingReturns() {
  return (
    <PageWrapper title="Shipping & Returns">
      <div className="glass-strong p-6 md:p-8 space-y-0" style={{ borderRadius: 20 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#FFD600]/20 flex items-center justify-center"><Truck size={18} className="text-[#1C1B1A]" /></div>
          <h2 className="text-[18px] font-semibold">Shipping</h2>
        </div>

        <Section title="Delivery Times">
          <p>Standard delivery takes <strong>5–7 business days</strong> across India.</p>
          <p>Metro cities (Delhi, Mumbai, Bangalore, etc.) may receive orders in <strong>3–5 business days</strong>.</p>
        </Section>

        <Section title="Shipping Charges">
          <p>Orders above <strong>{'\u20B9'}1,499</strong> ship free.</p>
          <p>For orders below {'\u20B9'}1,499, a flat <strong>{'\u20B9'}99</strong> shipping fee applies.</p>
          <p>Cash on Delivery orders have an additional <strong>{'\u20B9'}49</strong> handling fee.</p>
        </Section>

        <div className="border-t border-white/30 my-6" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#FFD600]/20 flex items-center justify-center"><RotateCcw size={18} className="text-[#1C1B1A]" /></div>
          <h2 className="text-[18px] font-semibold">Returns</h2>
        </div>

        <Section title="Return Policy">
          <p>We accept returns within <strong>30 days</strong> of delivery.</p>
          <p>Items must be unworn, unwashed, and in original packaging with all tags attached.</p>
        </Section>

        <Section title="How to Return">
          <p>1. Go to <Link to="/account" className="text-[#1C1B1A] font-medium underline underline-offset-2">My Account</Link> → Orders</p>
          <p>2. Click "Request Return" on the order you'd like to return</p>
          <p>3. Enter the reason and submit — we'll review and get back within 48 hours</p>
          <p>4. Once approved, we'll arrange a free pickup from your address</p>
        </Section>

        <Section title="Refunds">
          <p>Refunds are processed within <strong>5–7 business days</strong> after we receive the returned item.</p>
          <p>Amount is credited back to the original payment method.</p>
        </Section>
      </div>
    </PageWrapper>
  )
}

export function SizeGuide() {
  return (
    <PageWrapper title="Size Guide">
      <div className="glass-strong p-6 md:p-8" style={{ borderRadius: 20 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#FFD600]/20 flex items-center justify-center"><Ruler size={18} className="text-[#1C1B1A]" /></div>
          <p className="text-[14px] text-[#6B6663]">All measurements are in <strong className="text-[#1C1B1A]">inches</strong>. Measure yourself and compare with the chart below.</p>
        </div>

        <Section title="T-Shirts & Shirts">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/30">
                  <th className="text-left py-2 pr-4 text-[#1C1B1A] font-semibold">Size</th>
                  <th className="text-left py-2 pr-4 text-[#1C1B1A] font-semibold">Chest</th>
                  <th className="text-left py-2 pr-4 text-[#1C1B1A] font-semibold">Length</th>
                  <th className="text-left py-2 text-[#1C1B1A] font-semibold">Shoulder</th>
                </tr>
              </thead>
              <tbody className="text-[#6B6663]">
                {[
                  ['S', '38', '27', '17'],
                  ['M', '40', '28', '18'],
                  ['L', '42', '29', '19'],
                  ['XL', '44', '30', '20'],
                ].map(([size, chest, length, shoulder]) => (
                  <tr key={size} className="border-b border-white/20">
                    <td className="py-2.5 pr-4 font-medium text-[#1C1B1A]">{size}</td>
                    <td className="py-2.5 pr-4">{chest}"</td>
                    <td className="py-2.5 pr-4">{length}"</td>
                    <td className="py-2.5">{shoulder}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Jeans & Cargos">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/30">
                  <th className="text-left py-2 pr-4 text-[#1C1B1A] font-semibold">Size</th>
                  <th className="text-left py-2 pr-4 text-[#1C1B1A] font-semibold">Waist</th>
                  <th className="text-left py-2 pr-4 text-[#1C1B1A] font-semibold">Hip</th>
                  <th className="text-left py-2 text-[#1C1B1A] font-semibold">Length</th>
                </tr>
              </thead>
              <tbody className="text-[#6B6663]">
                {[
                  ['28', '28', '36', '40'],
                  ['30', '30', '38', '41'],
                  ['32', '32', '40', '42'],
                  ['34', '34', '42', '43'],
                ].map(([size, waist, hip, length]) => (
                  <tr key={size} className="border-b border-white/20">
                    <td className="py-2.5 pr-4 font-medium text-[#1C1B1A]">{size}</td>
                    <td className="py-2.5 pr-4">{waist}"</td>
                    <td className="py-2.5 pr-4">{hip}"</td>
                    <td className="py-2.5">{length}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <div className="bg-[#FFD600]/10 px-4 py-3 text-[13px] text-[#6B6663] mt-4" style={{ borderRadius: 12 }}>
          <strong className="text-[#1C1B1A]">Tip:</strong> If you're between sizes, we recommend sizing up for a relaxed fit.
        </div>
      </div>
    </PageWrapper>
  )
}

export function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PageWrapper title="Contact Us">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-strong p-6 md:p-8" style={{ borderRadius: 20 }}>
          <h2 className="text-[18px] font-semibold mb-6">Get in Touch</h2>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="font-semibold mb-1">Message Sent!</p>
              <p className="text-[13px] text-[#6B6663]">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full bg-white/50 px-4 py-3 text-[14px] focus:outline-none focus:bg-white tr"
                  style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
              </div>
              <div>
                <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                  className="w-full bg-white/50 px-4 py-3 text-[14px] focus:outline-none focus:bg-white tr"
                  style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
              </div>
              <div>
                <label className="block text-[12px] uppercase tracking-[0.08em] text-[#6B6663] font-semibold mb-1.5">Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={4}
                  className="w-full bg-white/50 px-4 py-3 text-[14px] focus:outline-none focus:bg-white tr resize-none"
                  style={{ borderRadius: 12, border: '1px solid rgba(217,212,203,.5)' }} />
              </div>
              <button type="submit"
                className="bg-[#1C1B1A] text-white px-6 py-2.5 text-[14px] font-medium hover:bg-[#333] tr"
                style={{ borderRadius: 12 }}>
                Send Message
              </button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: 'support@shopystreet.com' },
            { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
            { icon: MapPin, label: 'Address', value: 'Mumbai, Maharashtra, India' },
          ].map(item => (
            <div key={item.label} className="glass-strong p-5 flex items-center gap-4" style={{ borderRadius: 16 }}>
              <div className="w-10 h-10 rounded-full bg-[#FFD600]/20 flex items-center justify-center flex-shrink-0">
                <item.icon size={18} className="text-[#1C1B1A]" />
              </div>
              <div>
                <p className="text-[12px] text-[#6B6663] uppercase tracking-wider">{item.label}</p>
                <p className="text-[14px] font-medium text-[#1C1B1A]">{item.value}</p>
              </div>
            </div>
          ))}

          <div className="glass-strong p-5" style={{ borderRadius: 16 }}>
            <p className="text-[13px] text-[#6B6663]">
              <strong className="text-[#1C1B1A]">Business Hours:</strong><br />
              Mon – Sat: 10 AM – 7 PM IST<br />
              Sunday: Closed
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export function FAQ() {
  const faqs = [
    { q: 'How long does delivery take?', a: 'Standard delivery takes 5–7 business days. Metro cities may receive orders in 3–5 business days.' },
    { q: 'Do you offer free shipping?', a: 'Yes! All orders above \u20B91,499 ship free. Orders below that have a flat \u20B999 shipping fee.' },
    { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original packaging with tags attached.' },
    { q: 'How do I request a return?', a: 'Go to My Account → Orders and click "Request Return" on the order. We\'ll review and respond within 48 hours.' },
    { q: 'When will I get my refund?', a: 'Refunds are processed within 5–7 business days after we receive the returned item. The amount is credited to your original payment method.' },
    { q: 'What payment methods do you accept?', a: 'We accept Credit/Debit Cards, UPI, Net Banking, Wallets (via Razorpay), and Cash on Delivery.' },
    { q: 'Can I change my order after placing it?', a: 'Once an order is placed, it cannot be modified. However, you can request a return after delivery.' },
    { q: 'How do I track my order?', a: 'Go to My Account → Orders to see the current status of all your orders.' },
    { q: 'Do you ship internationally?', a: 'Currently we only ship within India. International shipping is coming soon!' },
    { q: 'How do I contact support?', a: 'Email us at support@shopystreet.com or call +91 98765 43210 (Mon–Sat, 10 AM – 7 PM IST).' },
  ]

  const [openIdx, setOpenIdx] = useState(null)

  return (
    <PageWrapper title="Frequently Asked Questions">
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="glass-strong overflow-hidden" style={{ borderRadius: 16 }}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left tr hover:bg-white/30">
              <span className="text-[14px] font-medium text-[#1C1B1A] pr-4">{faq.q}</span>
              <ChevronDown size={18} className={`text-[#6B6663] tr flex-shrink-0 ${openIdx === i ? 'rotate-180' : ''}`} />
            </button>
            {openIdx === i && (
              <div className="px-5 pb-4">
                <p className="text-[14px] text-[#6B6663] leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}
