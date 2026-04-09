import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'

const ENGRAVING_CONFIG = {
  engraving: {
    label: 'חריטה',
    icon: '✍️',
    priceLabel: '₪10',
    price: 10,
    fields: ['text', 'color'],
    textPlaceholder: 'הקלידו שם ומשפחה (עד 3 מילים)',
    textLabel: 'שם לחריטה :',
    colors: [
      { name: 'זהב', value: 'gold', hex: '#C9A84C' },
      { name: 'כסף', value: 'silver', hex: '#C0C0C0' },
      { name: 'שחור', value: 'black', hex: '#111111' },
      { name: 'ברונזה', value: 'bronze', hex: '#CD7F32' },
    ]
  },
  embroidery: {
    label: 'רקמה',
    icon: '🧵',
    priceLabel: '₪40',
    price: 40,
    fields: ['checkbox', 'text', 'color'],
    checkboxLabel: 'אני מעוניין/ת ברקמת שם על הכיסוי',
    textLabel: 'שם לרקמה בכיסויים :',
    textPlaceholder: 'הקלידו שם ומשפחה',
    colors: [
      { name: 'שחור', value: 'black', hex: '#111111' },
      { name: 'כחול', value: 'blue', hex: '#1e40af' },
      { name: 'שמנת כהה', value: 'cream_dark', hex: '#d4c5a9' },
      { name: 'שמנת בהיר', value: 'cream_light', hex: '#f0e6d3' },
      { name: 'לבן', value: 'white', hex: '#FFFFFF' },
      { name: 'ברונזה', value: 'bronze', hex: '#8B4513' },
      { name: 'זהב', value: 'gold', hex: '#C9A84C' },
      { name: 'כסוף מבריק', value: 'silver_shiny', hex: '#C0C0C0' },
      { name: 'אפור כהה', value: 'gray_dark', hex: '#374151' },
      { name: 'אפור', value: 'gray', hex: '#9CA3AF' },
    ]
  },
  embossing: {
    label: 'הטבעה',
    icon: '🔏',
    priceLabel: '₪15',
    price: 15,
    fields: ['text', 'color'],
    textLabel: 'שם להטבעה :',
    textPlaceholder: 'הקלידו שם ומשפחה (עד 3 מילים)',
    colors: [
      { name: 'זהב', value: 'gold', hex: '#C9A84C' },
      { name: 'כסף', value: 'silver', hex: '#C0C0C0' },
      { name: 'שחור', value: 'black', hex: '#111111' },
    ]
  },
  printing: {
    label: 'הדפסה',
    icon: '🖨️',
    priceLabel: '₪8',
    price: 8,
    fields: ['text'],
    textLabel: 'טקסט להדפסה :',
    textPlaceholder: 'הקלידו את הטקסט הרצוי',
  }
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState(null)
  const [viewersCount] = useState(Math.floor(Math.random() * 12) + 5)
  const [customizationData, setCustomizationData] = useState({})

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(name, id),
            product_images(image_url, is_primary, display_order),
            product_colors(id, color_name, color_code, display_order)
          `)
          .eq('id', id)
          .single()
        if (error || !data) { setError('מוצר לא נמצא'); return }
        setProduct(data)
      } catch (err) {
        setError('שגיאה בטעינה')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProduct()
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-black">טוען...</div>
  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans">
      <button onClick={() => navigate('/')} className="underline">חזרה לבית</button>
    </div>
  )

  const images = product.product_images?.length > 0
    ? [...product.product_images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(i => i.image_url)
    : []

  const mainImage = images[selectedImageIndex]
  const engravingTypes = Array.isArray(product.engraving_type) ? product.engraving_type : product.engraving_type ? [product.engraving_type] : []
  const hasCustomization = product.allows_engraving && engravingTypes.length > 0

  const calculateExtraPrice = () => {
    let extra = 0
    engravingTypes.forEach(type => {
      const config = ENGRAVING_CONFIG[type]
      const data = customizationData[type] || {}
      if (config?.fields.includes('checkbox') ? data.checked : data.text?.trim()) {
        extra += config.price
      }
    })
    return extra
  }

  const displayPrice = product.on_sale && product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price)
  const totalPrice = displayPrice + calculateExtraPrice()

  const handleAddToCart = () => {
    const customizations = {}
    engravingTypes.forEach(type => {
      const data = customizationData[type] || {}
      if (data.text?.trim() || data.checked) customizations[type] = data
    })
    addToCart(product, quantity, customizations)
  }

  const updateCustomization = (type, field, value) => {
    setCustomizationData(prev => ({ ...prev, [type]: { ...(prev[type] || {}), [field]: value } }))
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <CartDrawer />
      <Header />
      
      {/* pt-24 מבטיח שהתוכן יתחיל מתחת ל-Header ולא יוסתר על ידו */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-8 md:pt-32 md:pb-12 relative z-10">
        
        {/* ניווט Breadcrumbs - בולט ומוסט מהקצה העליון */}
        <nav className="flex items-center gap-2 text-sm mb-12 font-sans bg-white py-2">
          <Link to="/" className="text-gray-800 hover:text-black font-medium">דף הבית</Link>
          <span className="text-gray-400">/</span>
          <Link to={`/category/${product.category_id}`} className="text-gray-800 hover:text-black font-medium">
            {product.categories?.name || 'קטגוריה'}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          {/* תמונות */}
          <div className="flex flex-col-reverse md:flex-row gap-3">
             {images.length > 1 && (
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImageIndex(i)} className={`w-[72px] h-[72px] flex-shrink-0 border-2 ${selectedImageIndex === i ? 'border-black' : 'border-gray-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 aspect-square bg-gray-50 border border-gray-100 overflow-hidden">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* פרטים */}
          <div className="flex flex-col text-right">
            <h1 className="font-serif text-3xl md:text-4xl mb-3 font-normal" style={{ color: '#C9A84C' }}>{product.name}</h1>
            
            <div className="mb-4 flex items-center gap-3">
              <span className="text-2xl md:text-3xl font-normal">₪{totalPrice.toLocaleString('he-IL')}</span>
            </div>

            <div className="mb-5">
              <span className="text-sm font-medium text-green-700 flex items-center gap-1 justify-start">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                במלאי
              </span>
            </div>

            {/* התאמה אישית */}
            {hasCustomization && engravingTypes.map(type => {
              const config = ENGRAVING_CONFIG[type]
              const data = customizationData[type] || {}
              return (
                <div key={type} className="border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 flex justify-between border-b border-gray-200">
                    <span className="text-sm font-semibold">{config.icon} {config.label}</span>
                    <span className="text-sm font-bold" style={{ color: '#C9A84C' }}>+{config.priceLabel}</span>
                  </div>
                  <div className="p-4 space-y-4">
                    {config.fields.includes('checkbox') && (
                      <label className="flex items-center gap-3 cursor-pointer justify-start">
                        <input type="checkbox" checked={data.checked || false} onChange={e => updateCustomization(type, 'checked', e.target.checked)} className="w-4 h-4 accent-black" />
                        <span className="text-sm">{config.checkboxLabel}</span>
                      </label>
                    )}
                    {config.fields.includes('text') && (!config.fields.includes('checkbox') || data.checked) && (
                      <input type="text" value={data.text || ''} onChange={e => updateCustomization(type, 'text', e.target.value)} placeholder={config.textPlaceholder} className="w-full border p-2 text-right text-sm outline-none rounded-sm" />
                    )}
                    {config.fields.includes('color') && config.colors && (!config.fields.includes('checkbox') || data.checked) && (
                      <div className="flex flex-wrap gap-2 justify-start">
                        {config.colors.map(color => (
                          <button key={color.value} onClick={() => updateCustomization(type, 'color', color.value)} className={`w-8 h-8 rounded border-2 ${data.color === color.value ? 'border-black' : 'border-gray-300'}`} style={{ backgroundColor: color.hex }} title={color.name} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* הערות */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">הוסיפו הערות למוצר במידת הצורך :</label>
              <textarea rows={2} placeholder="הערות נוספות..." className="w-full border p-2 text-right text-sm outline-none resize-none rounded-sm" />
            </div>

            {/* רכישה */}
            <div className="flex items-center gap-3 mb-5">
              <button onClick={handleAddToCart} className="flex-1 bg-black text-white py-4 text-base font-medium hover:bg-gray-800 transition-all uppercase">
                הוסף לסל
              </button>
              <div className="flex items-center border-2 border-gray-200 rounded-sm">
                <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="w-12 h-[52px] text-xl">−</button>
                <span className="w-12 h-[52px] flex items-center justify-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-[52px] text-xl">+</button>
              </div>
            </div>

            {/* צופים עכשיו */}
            <div className="bg-amber-50 border border-amber-100 rounded px-4 py-3 mb-6 flex items-center gap-2 justify-center text-sm text-amber-800">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <span><span className="font-bold">{viewersCount}</span> אנשים צופים במוצר הזה עכשיו !</span>
            </div>

            {/* אקורדיון */}
            <div className="border-t border-gray-200">
              {[
                { id: 'description', title: 'מידע על המוצר', content: product.description },
                { id: 'shipping', title: 'משלוחים והחזרות', content: '🚚 משלוח חינם מעל ₪299 | 📦 5-7 ימי עסקים' }
              ].map(item => (
                <div key={item.id} className="border-b border-gray-200">
                  <button onClick={() => setOpenAccordion(openAccordion === item.id ? null : item.id)} className="w-full flex justify-between py-4 text-sm font-medium hover:text-black">
                    <span>{item.title}</span>
                    <span className={`transform transition-transform ${openAccordion === item.id ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {openAccordion === item.id && <div className="pb-4 text-xs text-gray-600 leading-relaxed">{item.content}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}