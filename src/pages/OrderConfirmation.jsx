import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

export default function OrderConfirmation() {
  const { id } = useParams()

  return (
    <div className="page-enter max-w-lg mx-auto px-6 py-24 text-center">
      <div className="clay p-10">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center glass" style={{ borderRadius: 20 }}>
            <CheckCircle size={36} className="text-[#3A7D44]" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="font-display text-[28px] text-[#1C1B1A] mb-2">Order Placed!</h1>
        <p className="text-[#6B6663] text-[15px]">
          Thank you for shopping with us. Your order has been confirmed.
        </p>

        <div className="mt-8 glass p-5" style={{ borderRadius: 16 }}>
          <div className="flex items-center justify-center gap-2 text-[12px] text-[#6B6663] uppercase tracking-[0.1em] mb-2">
            <Package size={14} strokeWidth={1.5} />
            Order ID
          </div>
          <p className="text-[14px] font-mono font-semibold text-[#1C1B1A] break-all">{id}</p>
        </div>

        <p className="mt-6 text-[13px] text-[#6B6663]">
          We'll send you a confirmation email with tracking details once your order ships.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            to="/products"
            className="clay-btn inline-flex items-center justify-center gap-2 bg-[#1C1B1A] text-white h-[48px] font-semibold text-[14px] tr hover:bg-[#FFD600] hover:text-[#1C1B1A]"
            style={{ borderRadius: 14 }}
          >
            Continue Shopping <ArrowRight size={15} />
          </Link>
          <Link to="/" className="text-[14px] text-[#6B6663] hover:text-[#1C1B1A] tr">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
