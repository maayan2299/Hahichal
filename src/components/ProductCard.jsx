import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url
  const isOutOfStock = product.stock_quantity === 0

  return (
    <div className={`group bg-white flex flex-col h-full border border-gray-100 shadow-sm transition-all hover:shadow-md ${isOutOfStock ? 'opacity-60' : ''}`}>
      {/* תמונה ריבועית אחידה */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-[#F9F9F7]">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-4">
            <span className="bg-white text-black text-xs font-bold px-3 py-1 tracking-widest uppercase">מלאי אזל</span>
          </div>
        )}
      </Link>

      {/* תוכן הכרטיס */}
      <div className="p-2 md:p-4 flex flex-col flex-grow text-center">
        <h3
          className="text-[13px] md:text-lg text-gray-800 line-clamp-1 mb-1 font-medium"
          style={{ fontFamily: "'Heebo', sans-serif" }}
        >
          {product.name}
        </h3>

        {/* מחיר */}
        <div className={`text-[12px] md:text-base font-bold mb-2 ${isOutOfStock ? 'text-gray-400' : 'text-[#D4AF37]'}`}>
          {isOutOfStock ? 'אזל מהמלאי' : `₪${product.price}`}
        </div>

        <Link
          to={`/product/${product.id}`}
          className={`mt-auto block w-full py-1.5 md:py-2 text-[10px] md:text-xs uppercase tracking-tighter md:tracking-widest transition-colors ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 pointer-events-none'
              : 'bg-black text-white hover:bg-[#D4AF37]'
          }`}
        >
          {isOutOfStock ? 'אזל מהמלאי' : 'לפרטים ורכישה'}
        </Link>
      </div>
    </div>
  )
}