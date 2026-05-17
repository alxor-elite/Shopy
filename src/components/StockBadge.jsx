export default function StockBadge({ stock }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center px-3 py-1 text-[11px] font-semibold bg-[#6B6663]/80 text-white backdrop-blur-sm" style={{ borderRadius: 100 }}>
        Out of Stock
      </span>
    )
  }
  if (stock < 5) {
    return (
      <span className="inline-flex items-center px-3 py-1 text-[11px] font-semibold bg-[#B7791F]/80 text-white backdrop-blur-sm" style={{ borderRadius: 100 }}>
        Only {stock} left
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-3 py-1 text-[11px] font-semibold bg-[#3A7D44]/80 text-white backdrop-blur-sm" style={{ borderRadius: 100 }}>
      In Stock
    </span>
  )
}
