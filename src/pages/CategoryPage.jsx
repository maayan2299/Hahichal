import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'
import Breadcrumbs from '../components/Breadcrumbs'

export default function CategoryPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategoryAndProducts() {
      setLoading(true)
      try {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single()
        setCategory(categoryData)

        // ✅ מושך רק מטבלת products — תמונות ב-images[]
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (productsError) throw productsError
        setProducts(productsData || [])
      } catch (error) {
        console.error('שגיאה:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchCategoryAndProducts()
  }, [id])

  const breadcrumbItems = [
    { label: 'עמוד הבית', link: '/' },
    { label: category?.name || 'קטגוריה', link: null }
  ]

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <CartDrawer />
      <Header />
      <div className="bg-gray-50 border-b border-gray-100">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="mb-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                {category?.name || 'המוצרים שלנו'}
              </h2>
              <div className="h-1 w-20 bg-[#D4AF37] mx-auto"></div>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products.map((product) => {
                  // ✅ קריאה מ-images[] array
                  const imgUrl = product.images?.[0] || product.main_image_url || ''

                  return (
                    <div key={product.id} className="group relative">
                      {/* כפתור הוספה לסל */}
                      <button
                        className="absolute top-3 left-3 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center z-20 border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-white transition-all duration-300 transform hover:scale-110"
                        onClick={(e) => {
                          e.preventDefault()
                          addToCart(product, 1)
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>

                      <Link to={`/product/${product.id}`} className="block">
                        <div className="aspect-[4/5] bg-gray-50 rounded-sm overflow-hidden mb-4 relative border border-transparent group-hover:border-[#D4AF37]/20 transition-all">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}

                          {/* תג SALE */}
                          {product.sale_price && (
                            <div className="absolute top-3 right-3">
                              <span className="bg-[#D4AF37] text-white text-xs font-bold px-2 py-1">SALE</span>
                            </div>
                          )}
                        </div>

                        <div className="text-center px-2">
                          <p className="text-xs text-gray-400 font-light mb-1 tracking-widest uppercase">
                            {category?.name}
                          </p>
                          <h3 className="text-base text-black font-bold mb-2 line-clamp-2"
                            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                            {product.name}
                          </h3>
                          {product.sale_price ? (
                            <div className="flex items-center justify-center gap-2">
                              <p className="text-lg font-bold text-[#D4AF37]">
                                ₪{parseFloat(product.sale_price).toLocaleString('he-IL')}
                              </p>
                              <p className="text-sm text-gray-400 line-through">
                                ₪{parseFloat(product.price).toLocaleString('he-IL')}
                              </p>
                            </div>
                          ) : (
                            <p className="text-lg font-medium text-[#D4AF37]">
                              ₪{parseFloat(product.price).toLocaleString('he-IL')}
                            </p>
                          )}
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-24 border-2 border-dashed border-gray-100">
                <p className="text-xl text-gray-400 italic">בקרוב יעלו מוצרים חדשים להיכל...</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}