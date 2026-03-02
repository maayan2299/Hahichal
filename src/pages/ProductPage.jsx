import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'

export default function ProductPage() {
  const { id } = useParams()
  const { addToCart, setIsCartOpen } = useCart()
  const [product, setProduct] = useState(null)
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        setProduct(data)

        if (data?.category_id) {
          const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', data.category_id)
            .single()
          setCategory(catData)
        }
      } catch (err) {
        console.error('שגיאה:', err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProduct()
  }, [id])

  function handleAddToCart() {
    addToCart({ ...product, quantity })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    setIsCartOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <Header />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4" dir="rtl">
        <Header />
        <p className="text-gray-400">המוצר לא נמצא</p>
        <Link to="/" className="px-6 py-3 bg-black text-white text-sm">חזרה לבית</Link>
      </div>
    )
  }

  const images = product.images || []
  const currentImage = images[selectedImage] || ''
  const isOnSale = !!product.sale_price
  const isOutOfStock = product.stock_quantity === 0

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <CartDrawer />
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-black transition-colors">עמוד הבית</Link>
          <span>/</span>
          {category && (
            <>
              <Link to={`/category/${category.id}`} className="hover:text-black transition-colors">{category.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-black">{product.name}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

          {/* תמונות */}
          <div className="flex gap-4">
            {/* תמונות קטנות בצד */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 border-2 overflow-hidden flex-shrink-0 transition-all
                      ${selectedImage === i ? 'border-[#D4AF37]' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* תמונה ראשית */}
            <div className="flex-1 aspect-[4/5] bg-gray-50 overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* פרטי מוצר */}
          <div className="flex flex-col">
            {/* קטגוריה */}
            {category && (
              <Link to={`/category/${category.id}`}
                className="text-xs tracking-widest uppercase text-[#D4AF37] mb-3 hover:opacity-70 transition-opacity">
                {category.name}
              </Link>
            )}

            {/* שם */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
              {product.name}
            </h1>

            {/* קו */}
            <div className="h-px w-16 bg-[#D4AF37] mb-6" />

            {/* מחיר */}
            <div className="mb-6">
              {isOnSale ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-[#D4AF37]">
                    ₪{parseFloat(product.sale_price).toLocaleString('he-IL')}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    ₪{parseFloat(product.price).toLocaleString('he-IL')}
                  </span>
                  <span className="bg-[#D4AF37] text-white text-xs font-bold px-2 py-1">SALE</span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-[#D4AF37]">
                  ₪{parseFloat(product.price).toLocaleString('he-IL')}
                </span>
              )}
            </div>

            {/* תיאור */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-8 text-sm">
                {product.description}
              </p>
            )}

            {/* סטטוס מלאי */}
            {product.show_stock && product.stock_quantity !== null && (
              <div className="mb-6">
                {isOutOfStock ? (
                  <span className="text-sm text-red-500 font-medium">✗ אזל מהמלאי</span>
                ) : (
                  <span className="text-sm text-green-600 font-medium">✓ במלאי</span>
                )}
              </div>
            )}

            {/* כמות */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs tracking-widest uppercase text-gray-400">כמות</span>
                <div className="flex items-center border border-gray-200">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg"
                  >-</button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg"
                  >+</button>
                </div>
              </div>
            )}

            {/* כפתור הוספה לסל */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 mb-3
                ${isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : added
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-black text-white hover:bg-[#D4AF37]'
                }`}
            >
              {isOutOfStock ? 'אזל מהמלאי' : added ? '✓ נוסף לסל' : 'הוסף לסל'}
            </button>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/972542115584?text=${encodeURIComponent(`שלום, אני מעוניין/ת במוצר: ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 text-sm font-bold tracking-widest uppercase border-2 border-black text-black text-center hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              שאלה על המוצר
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}