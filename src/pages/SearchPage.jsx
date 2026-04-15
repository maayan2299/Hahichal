import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import { useCart } from '../context/CartContext'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    if (!query.trim()) return
    async function search() {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('*, product_images(image_url, is_primary)')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
      setResults(data || [])
      setLoading(false)
    }
    search()
  }, [query])

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <CartDrawer />
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-16">
        
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">תוצאות חיפוש</h1>
          <p className="text-gray-500 text-sm">
            {loading ? 'מחפש...' : `נמצאו ${results.length} תוצאות עבור "${query}"`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-xl">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl text-gray-400 mb-2">לא נמצאו תוצאות עבור "{query}"</p>
            <p className="text-sm text-gray-400 mb-6">נסו מילת חיפוש אחרת</p>
            <Link to="/" className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
              חזרה לעמוד הבית
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {results.map((product) => {
              const imgUrl =
                product.product_images?.find(i => i.is_primary)?.image_url ||
                product.product_images?.[0]?.image_url || ''
              const isOutOfStock = product.stock_quantity === 0

              return (
                <div key={product.id} className="group relative">
                  <button
                    className={`absolute top-3 left-3 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center z-20 border border-[#D4AF37]/30 transition-all duration-300 transform hover:scale-110 ${
                      isOutOfStock ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#D4AF37] hover:text-white'
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      if (isOutOfStock) return
                      if (product.product_options?.length > 0) {
                        window.location.href = `/product/${product.id}`
                      } else {
                        addToCart(product, 1)
                      }
                    }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>

                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-[4/5] bg-gray-50 rounded-sm overflow-hidden mb-4 relative border border-transparent group-hover:border-[#D4AF37]/20 transition-all">
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                          <span className="bg-white text-black text-xs font-bold px-3 py-1 border border-gray-300 tracking-widest">מלאי אזל</span>
                        </div>
                      )}
                      {imgUrl ? (
                        <img src={imgUrl} alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'opacity-50' : ''}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {product.sale_price && !isOutOfStock && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-[#D4AF37] text-white text-xs font-bold px-2 py-1">SALE</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center px-2">
                      <h3 className="text-base text-black font-bold mb-2 line-clamp-2"
                        style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                        {product.name}
                      </h3>
                      {isOutOfStock ? (
                        <p className="text-sm text-gray-400 font-medium">אזל מהמלאי</p>
                      ) : product.sale_price ? (
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-lg font-bold text-[#D4AF37]">₪{parseFloat(product.sale_price).toLocaleString('he-IL')}</p>
                          <p className="text-sm text-gray-400 line-through">₪{parseFloat(product.price).toLocaleString('he-IL')}</p>
                        </div>
                      ) : (
                        <p className="text-lg font-medium text-[#D4AF37]">₪{parseFloat(product.price).toLocaleString('he-IL')}</p>
                      )}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}