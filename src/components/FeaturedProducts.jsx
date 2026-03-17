import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseUrl } from '../lib/supabase'

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name),
            images:product_images(image_url, is_primary)
          `)
          .eq('is_featured', true)
          .eq('is_active', true)
          .order('display_order')
          .limit(8)

        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeatured()
  }, [])

  const getProductImage = (product) => {
    const primaryImg = product.images?.find(img => img.is_primary)
    const anyImg = product.images?.[0]
    const imageUrl = primaryImg?.image_url || anyImg?.image_url
    
    if (!imageUrl) {
      return `${baseUrl}/storage/v1/object/public/product-images/placeholder.png`
    }
    
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }
    
    return `${baseUrl}/storage/v1/object/public/product-images/${imageUrl}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        אין מוצרים מומלצים כרגע
      </div>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8">
      {/* כותרת - כמו נר-ליה עם לב שחור */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2D2420] flex items-center justify-center gap-3"
          style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
          <span>המיוחדים שלנו</span>
          <span className="text-black">♥</span>
        </h2>
      </div>

      {/* Grid מוצרים - carousel עם 4 מוצרים */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 md:gap-6 pb-4">
            {products.map((product, index) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group flex-shrink-0 w-[280px] md:w-[320px] bg-white rounded-sm overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                {/* תמונה */}
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                {/* פרטים */}
                <div className="p-4 text-center">
                  {/* קטגוריה */}
                  {product.category?.name && (
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                      {product.category.name}
                    </p>
                  )}

                  {/* שם המוצר */}
                  <h3 className="text-sm md:text-base font-bold mb-3 text-[#2D2420] group-hover:text-[#D4AF37] transition-colors line-clamp-2"
                    style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                    {product.name}
                  </h3>

                  {/* קו דקורטיבי */}
                  <div className="h-[2px] w-0 group-hover:w-12 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto transition-all duration-500 mb-3" />

                  {/* מחיר */}
                  <div className="flex items-center justify-center gap-2">
                    {product.sale_price && (
                      <span className="text-gray-400 line-through text-sm">
                        ₪{product.price.toFixed(0)}
                      </span>
                    )}
                    <span className="text-lg font-bold text-[#2D2420]">
                      ₪{(product.sale_price || product.price).toFixed(0)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* חצים לגלילה */}
        {products.length > 4 && (
          <>
            <button
              onClick={() => document.querySelector('.overflow-x-auto').scrollBy({ left: -320, behavior: 'smooth' })}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 z-10 hidden md:block"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => document.querySelector('.overflow-x-auto').scrollBy({ left: 320, behavior: 'smooth' })}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 z-10 hidden md:block"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* כפתור לכל המוצרים */}
      <div className="text-center mt-12">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-[#D4AF37] text-[#2D2420] font-bold tracking-wide hover:bg-[#D4AF37] hover:text-white transition-all duration-300 group"
        >
          <span>לכל המוצרים</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>

      {/* אנימציה */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}