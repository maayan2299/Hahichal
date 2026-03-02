import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  async function fetchFeaturedProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null
  if (featuredProducts.length === 0) return null

  return (
    <section className="py-10 md:py-14 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* כותרת */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] font-semibold mb-3">
            אוסף נבחר
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
            המיוחדים שלנו
          </h2>
          <div className="h-px w-16 mx-auto" style={{ backgroundColor: '#A0801E' }}></div>
        </div>

        {/* גריד מוצרים */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.slice(0, 8).map((product, index) => {
            // תמונה ראשונה מה-array
            const imageUrl = product.images?.[0] || product.main_image_url || ''

            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group relative bg-white overflow-hidden"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* תמונה */}
                <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* שכבת hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                  {/* תג חריטה */}
                  {product.engraving_available && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 text-xs font-semibold tracking-wide px-2 py-1 shadow-sm">
                        ✨ חריטה
                      </span>
                    </div>
                  )}

                  {/* תג SALE */}
                  {product.sale_price && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#D4AF37] text-white text-xs font-bold px-2 py-1">
                        SALE
                      </span>
                    </div>
                  )}

                  {/* כפתור לפרטים בהובר */}
                  <div className="absolute bottom-0 inset-x-0 text-white text-xs font-bold tracking-widest uppercase text-center py-3
                    translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                    style={{ backgroundColor: '#CFAA52' }}>
                    לפרטים ←
                  </div>
                </div>

                {/* פרטי מוצר */}
                <div className="pt-3 pb-1 px-1">
                  <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1.5 line-clamp-2 group-hover:text-gray-600 transition-colors"
                    style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                    {product.name}
                  </h3>
                  {product.sale_price ? (
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-[#D4AF37]">
                        ₪{parseFloat(product.sale_price).toLocaleString('he-IL')}
                      </p>
                      <p className="text-sm text-gray-400 line-through">
                        ₪{parseFloat(product.price).toLocaleString('he-IL')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-base font-bold text-[#D4AF37]">
                      ₪{parseFloat(product.price).toLocaleString('he-IL')}
                    </p>
                  )}
                </div>

                {/* קו זהב בהובר */}
                <div className="h-[2px] w-0 group-hover:w-full bg-[#D4AF37] transition-all duration-500 mt-1" />
              </Link>
            )
          })}
        </div>

        {/* כפתור לכל המוצרים */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-10 py-3.5 border-2 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:text-black"
            style={{ borderColor: '#CFAA52', color: '#CFAA52' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#CFAA52'; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#CFAA52'; }}
          >
            לכל המוצרים
            <span>←</span>
          </Link>
        </div>
      </div>
    </section>
  )
}