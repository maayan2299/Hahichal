import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  // מציאת התמונה הראשית או הראשונה ברשימה
  const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url

  return (
    <div className="group bg-white flex flex-col h-full border border-gray-100 shadow-sm transition-all hover:shadow-md">
      {/* תמונה ריבועית אחידה */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-[#F9F9F7]">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* תוכן הכרטיס - מותאם למובייל */}
      <div className="p-2 md:p-4 flex flex-col flex-grow text-center">
        {/* שם מוצר קטן במובייל למניעת גלישת שורות */}
        <h3 
          className="text-[13px] md:text-lg text-gray-800 line-clamp-1 mb-1 font-medium"
          style={{ fontFamily: "'Heebo', sans-serif" }}
        >
          {product.name}
        </h3>
        
        {/* מחיר */}
        <div className="text-[12px] md:text-base font-bold text-[#D4AF37] mb-2">
          ₪{product.price}
        </div>

        {/* כפתור דק וקומפקטי במובייל */}
        <Link
          to={`/product/${product.id}`}
          className="mt-auto block w-full bg-black text-white py-1.5 md:py-2 text-[10px] md:text-xs uppercase tracking-tighter md:tracking-widest hover:bg-[#D4AF37] transition-colors"
        >
          לפרטים ורכישה
        </Link>
      </div>
    </div>
  )
}