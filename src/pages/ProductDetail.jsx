import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'

const ENGRAVING_CONFIG = {
  engraving: {
    label: 'חריטה', icon: '✍️', priceLabel: '₪10', price: 10,
    fields: ['text'],
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
    label: 'רקמה', icon: '🧵', priceLabel: '₪40', price: 40,
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
    label: 'הטבעה', icon: '🔏', priceLabel: '₪15', price: 15,
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
    label: 'הדפסה', icon: '🖨️', priceLabel: '₪8', price: 8,
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
  const [selectedOptions, setSelectedOptions] = useState({})
  const [complementaryProducts, setComplementaryProducts] = useState([])
  const [openDesc, setOpenDesc] = useState(false)
  const [brandingSettings, setBrandingSettings] = useState(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories!products_category_id_fkey(name, id),
            product_images(image_url, is_primary, display_order),
            product_colors(id, color_name, color_code, display_order, price_delta)
          `)
          .eq('id', id)
          .single()
        if (error || !data) { setError('מוצר לא נמצא'); return }
        setProduct(data)
        if (data.complementary_ids?.length > 0) {
          try {
            const { data: compData } = await supabase
              .from('products')
              .select('id, name, price, sale_price, on_sale, product_images(image_url, is_primary)')
              .in('id', data.complementary_ids)
            if (compData) setComplementaryProducts(compData)
          } catch {}
        }
      } catch (err) {
        console.error('ProductDetail error:', err)
        setError('שגיאה בטעינה')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProduct()
  }, [id])

  useEffect(() => {
    async function fetchBranding() {
      const { data } = await supabase
        .from('store_settings')
        .select('*')
        .eq('key', 'branding')
        .maybeSingle()
      if (data?.value) setBrandingSettings(data.value)
    }
    fetchBranding()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      <div className="flex items-center justify-center pt-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]"></div>
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      <div className="flex flex-col items-center justify-center pt-40 gap-4">
        <p className="text-gray-500 text-lg">המוצר לא נמצא</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors">
          חזרה לעמוד הבית
        </button>
      </div>
    </div>
  )

  const images = product.product_images?.length > 0
    ? [...product.product_images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(i => i.image_url)
    : []

  const mainImage = images[selectedImageIndex]
  const engravingTypes = Array.isArray(product.engraving_type) ? product.engraving_type : product.engraving_type ? [product.engraving_type] : []
  const hasCustomization = product.allows_engraving && engravingTypes.length > 0

  const getEngravingConfig = () => {
    try {
      const config = JSON.parse(JSON.stringify(ENGRAVING_CONFIG))
      const saved = brandingSettings || {}
      Object.entries(saved).forEach(([type, s]) => {
        if (config[type]) {
          if (s.text_limit !== undefined) config[type].text_limit = s.text_limit
        }
      })
      // עדכן מחיר לפי הגדרות המוצר הספציפי
      engravingTypes.forEach(type => {
        const engravingPrice = product.engraving_prices?.[type]
        if (config[type]) {
          if (engravingPrice?.per_letter > 0) {
            config[type].per_word_price = engravingPrice.per_letter
            config[type].price = 0
            config[type].priceLabel = `₪${engravingPrice.per_letter} למילה`
          } else if (engravingPrice?.fixed > 0) {
            config[type].price = engravingPrice.fixed
            config[type].priceLabel = `₪${engravingPrice.fixed}`
          } else {
            config[type].price = 0
            config[type].priceLabel = `₪0`
          }
        }
      })
      return config
    } catch { return ENGRAVING_CONFIG }
  }


  const engravingConfig = getEngravingConfig()

  const calculateExtraPrice = () => {
    let extra = 0
    engravingTypes.forEach(type => {
      const config = engravingConfig[type]
      const data = customizationData[type] || {}
      const isActive = config?.fields.includes('checkbox') ? data.checked : data.text?.trim()
      if (isActive) {
        const engravingPrice = product.engraving_prices?.[type]
        if (engravingPrice?.per_letter > 0 && data.text?.trim()) {
          const wordCount = data.text.trim().split(/\s+/).length
          extra += engravingPrice.per_letter * wordCount
        } else if (engravingPrice?.fixed > 0) {
          extra += engravingPrice.fixed
        } else {
          extra += config.price
        }
      }
    })
    Object.values(selectedOptions).forEach(val => {
      if (val?.price_delta) extra += parseFloat(val.price_delta) || 0
    })
    return extra
  }

  const displayPrice = product.on_sale && product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price)
  const totalPrice = displayPrice + calculateExtraPrice()
  const productOptions = product.product_options || []

  const handleAddToCart = () => {
    const missingRequired = productOptions.filter(opt => opt.required && !selectedOptions[opt.name])
    if (missingRequired.length > 0) {
      alert(`יש לבחור ${missingRequired.map(o => o.name).join(', ')} לפני ההוספה לסל`)
      return
    }
    const customizations = {}
    engravingTypes.forEach(type => {
      const data = customizationData[type] || {}
      if (data.text?.trim() || data.checked) customizations[type] = data
    })
    if (Object.keys(selectedOptions).length > 0) {
      customizations._options = selectedOptions
    }
    addToCart(product, quantity, customizations, calculateExtraPrice())
  }

  const updateCustomization = (type, field, value) => {
    setCustomizationData(prev => ({ ...prev, [type]: { ...(prev[type] || {}), [field]: value } }))
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <CartDrawer />
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-8 md:pt-32 md:pb-12 relative z-10">

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
            <div className="flex-1 bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center" style={{height: '500px'}}>
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain p-4" />
            </div>
          </div>

          {/* פרטים */}
          <div className="flex flex-col text-right">
            <h1 className="font-serif text-3xl md:text-4xl mb-3 font-normal" style={{ color: '#C9A84C' }}>{product.name}</h1>

            <div className="mb-4 flex items-center gap-3">
              <span className="text-2xl md:text-3xl font-normal">₪{totalPrice.toLocaleString('he-IL')}</span>
            </div>

            <div className="mb-5">
              {product.stock_quantity === 0 ? (
                <span className="text-sm font-bold text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                  מלאי אזל
                </span>
              ) : (
                <span className="text-sm font-medium text-green-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  במלאי
                </span>
              )}
            </div>

            {/* תיאור מוצר */}
            {product.description && (
              <div className="mb-5 p-4 bg-gray-50 rounded border border-gray-100">
                <p className="text-sm font-medium mb-2 text-gray-700">מידע על המוצר</p>
                <p className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line ${!openDesc ? 'line-clamp-3' : ''}`}>
                  {product.description}
                </p>
                {product.description?.length > 150 && (
                  <button onClick={() => setOpenDesc(!openDesc)} className="text-xs text-[#C9A84C] mt-1 hover:underline">
                    {openDesc ? 'סגור' : 'קרא עוד'}
                  </button>
                )}
              </div>
            )}

            {/* אפשרויות מוצר */}
            {productOptions.length > 0 && (
              <div className="mb-5 space-y-4">
                {productOptions.map((option, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium mb-2">
                      {option.name} {option.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(option.values || []).map((val, vIdx) => (
                        <button
                          key={vIdx}
                          type="button"
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: val }))}
                          className={`px-4 py-2 border-2 text-sm transition-all ${
                            selectedOptions[option.name]?.label === val.label
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {val.label}
                          {val.price_delta > 0 && <span className="mr-1 text-xs opacity-70">(+₪{val.price_delta})</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* צבעי מוצר */}
            {product.product_colors?.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">צבע</label>
                <div className="flex flex-wrap gap-2">
                  {[...product.product_colors]
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                    .map(color => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, color: color }))}
                        title={color.color_name}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${
                          selectedOptions.color?.id === color.id
                            ? 'border-black scale-110'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color.color_code }}
                      />
                    ))}
                </div>
                {selectedOptions.color && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedOptions.color.color_name}
                    {selectedOptions.color.price_delta > 0 && ` (+₪${selectedOptions.color.price_delta})`}
                  </p>
                )}
              </div>
            )}

            {/* התאמה אישית */}
            {hasCustomization && engravingTypes.map(type => {
              const config = engravingConfig[type]
              if (!config) return null
              const data = customizationData[type] || {}
              return (
                <div key={type} className="border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 flex justify-between border-b border-gray-200">
                    <span className="text-sm font-semibold">{config.icon} {config.label}</span>
                    <span className="text-sm font-bold" style={{ color: '#C9A84C' }}>
                      {config.per_word_price > 0 ? `₪${config.per_word_price} למילה` : `+${config.priceLabel}`}
                    </span>
                  </div>
                  <div className="p-4 space-y-4">
                    {config.fields.includes('checkbox') && (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={data.checked || false} onChange={e => updateCustomization(type, 'checked', e.target.checked)} className="w-4 h-4 accent-black" />
                        <span className="text-sm">{config.checkboxLabel}</span>
                      </label>
                    )}
                    {config.fields.includes('text') && (!config.fields.includes('checkbox') || data.checked) && (
                      <input type="text" value={data.text || ''} onChange={e => updateCustomization(type, 'text', e.target.value)} placeholder={config.textPlaceholder} className="w-full border p-2 text-right text-sm outline-none rounded-sm" />
                    )}
                    {config.fields.includes('color') && config.colors && (!config.fields.includes('checkbox') || data.checked) && (
                      <div className="flex flex-wrap gap-2">
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
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className={`flex-1 py-4 text-base font-medium transition-all uppercase ${
                  product.stock_quantity === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {product.stock_quantity === 0 ? 'מלאי אזל' : 'הוסף לסל'}
              </button>
              {product.stock_quantity !== 0 && (
                <div className="flex items-center border-2 border-gray-200 rounded-sm">
                  <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="w-12 h-[52px] text-xl">−</button>
                  <span className="w-12 h-[52px] flex items-center justify-center font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-[52px] text-xl">+</button>
                </div>
              )}
            </div>

            {/* צופים עכשיו */}
            <div className="bg-amber-50 border border-amber-100 rounded px-4 py-3 mb-6 flex items-center gap-2 justify-center text-sm text-amber-800">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <span><span className="font-bold">{viewersCount}</span> אנשים צופים במוצר הזה עכשיו !</span>
            </div>

            {/* משלוחים */}
            <div className="border-t border-gray-200">
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full flex justify-between py-4 text-sm font-medium hover:text-black">
                  <span>משלוחים והחזרות</span>
                  <span className={`transform transition-transform ${openAccordion === 'shipping' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-4 text-xs text-gray-600 leading-relaxed">
                    🚚 משלוח חינם מעל ₪299 | 📦 5-7 ימי עסקים
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* מוצרים משלימים */}
        {complementaryProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-serif mb-6 text-right" style={{ color: '#C9A84C' }}>מוצרים משלימים</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {complementaryProducts.map(cp => {
                const cpImage = cp.product_images?.find(i => i.is_primary)?.image_url || cp.product_images?.[0]?.image_url
                const cpPrice = cp.on_sale && cp.sale_price ? parseFloat(cp.sale_price) : parseFloat(cp.price)
                return (
                  <Link key={cp.id} to={`/product/${cp.id}`} className="group border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      {cpImage
                        ? <img src={cpImage} alt={cp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
                      }
                    </div>
                    <div className="p-3 text-center">
                      <div className="text-sm font-medium text-gray-800 line-clamp-1 mb-1">{cp.name}</div>
                      <div className="text-sm font-bold text-[#D4AF37]">₪{cpPrice.toLocaleString('he-IL')}</div>
                      <div className="mt-2 text-xs text-gray-500 border border-gray-300 py-1 group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors">
                        הוסף לסל
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}