import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Breadcrumbs from '../components/Breadcrumbs'
import { supabase } from '../lib/supabase'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, getSubtotal, getShipping, clearCart } = useCart()

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '',
    street: '', city: '', zipCode: '',
    shippingMethod: 'standard', paymentMethod: 'credit',
    notes: '', blessing: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)

  // קופון
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  const breadcrumbItems = [
    { label: 'עמוד הבית', link: '/' },
    { label: 'עגלת קניות', link: '/cart' },
    { label: 'תשלום', link: null }
  ]

  if (cart.length === 0) { navigate('/cart'); return null }

  const getShippingCost = () => {
    if (formData.shippingMethod === 'pickup') return 0
    if (formData.shippingMethod === 'express') return 60
    return getShipping()
  }

  const shippingCost = getShippingCost()
  const subtotal = getSubtotal()

  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0
    if (appliedCoupon.discount_type === 'percentage') {
      return Math.round(subtotal * appliedCoupon.discount_value / 100 * 100) / 100
    }
    return Math.min(appliedCoupon.discount_value, subtotal)
  }

  const couponDiscount = getCouponDiscount()
  const finalTotal = subtotal + shippingCost - couponDiscount

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    setAppliedCoupon(null)

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase().trim())
      .eq('is_active', true)
      .single()

    setCouponLoading(false)

    if (error || !data) { setCouponError('קוד קופון לא תקין או לא פעיל'); return }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setCouponError('קוד הקופון פג תוקף'); return }
    if (data.min_order > 0 && subtotal < data.min_order) { setCouponError(`סכום מינימלי להזמנה: ₪${data.min_order}`); return }

    setAppliedCoupon(data)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'שם מלא הוא שדה חובה'
    if (!formData.phone.trim()) {
      newErrors.phone = 'מספר טלפון הוא שדה חובה'
    } else if (!/^05\d{8}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'מספר טלפון לא תקין'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'אימייל הוא שדה חובה'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה'
    }
    if (formData.shippingMethod !== 'pickup') {
      if (!formData.street.trim()) newErrors.street = 'רחוב הוא שדה חובה'
      if (!formData.city.trim()) newErrors.city = 'עיר היא שדה חובה'
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = 'מיקוד הוא שדה חובה'
      } else if (!/^\d{5,7}$/.test(formData.zipCode)) {
        newErrors.zipCode = 'מיקוד לא תקין'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    if (!validateForm()) {
      const firstError = document.querySelector('.border-red-500')
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsSubmitting(true)

    try {
      const orderNumber = `HIK-${Date.now()}`

      // וידוא שהנתונים תואמים בדיוק לעמודות ב-Supabase
      const orderData = {
        order_number: orderNumber,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        items: cart, // נשמר כ-JSONB
        shipping_method: formData.shippingMethod,
        shipping_address: formData.shippingMethod === 'pickup'
          ? { address: 'איסוף עצמי מקריית אתא' }
          : { street: formData.street, city: formData.city, zip: formData.zipCode },
        payment_method: formData.paymentMethod,
        subtotal: Number(subtotal),
        shipping_cost: Number(shippingCost),
        total: Number(finalTotal),
        notes: formData.notes || null,
        blessing: formData.blessing || null,
        marketing_consent: marketingConsent,
        status: 'pending'
      }

      // 3. שמירה ל-Supabase
      const { error: dbError } = await supabase.from('orders').insert([orderData])

      if (dbError) {
        console.error('Supabase Error:', dbError)
        throw new Error('שגיאה בשמירת הנתונים בבסיס הנתונים')
      }

      // 4. פנייה ל-HYP
      const response = await fetch('/api/create-hyp-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          orderId: orderNumber,
          customerName: formData.fullName
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`שגיאה מהשרת: ${errorText}`);
      }

      const paymentData = await response.json();

      if (paymentData.url) {
        window.location.href = paymentData.url;
      } else {
        throw new Error(paymentData.error || 'לא התקבל קישור תשלום');
      }

    } catch (error) {
      console.error('Checkout Error:', error)
      alert('אירעה שגיאה: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Breadcrumbs items={breadcrumbItems} />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">תשלום והזמנה</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout} className="space-y-8">

              {/* פרטי לקוח */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">פרטי לקוח</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">שם מלא *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                      className={`w-full border-2 ${errors.fullName ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                      placeholder="שם פרטי ומשפחה" />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">טלפון *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                      className={`w-full border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                      placeholder="050-1234567" />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">אימייל *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                      className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                      placeholder="example@email.com" />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* אופציית משלוח */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">אופציית משלוח</h2>
                <div className="space-y-3">
                  {[
                    { val: 'standard', title: 'משלוח רגיל', desc: `בין 5-7 ימי עסקים • ${getShipping() === 0 ? 'חינם!' : `₪${getShipping()}`}` },
                    { val: 'express', title: 'משלוח מהיר', desc: '1-2 ימי עסקים • ₪60' },
                    { val: 'pickup', title: 'איסוף עצמי מקריית אתא', desc: 'ללא עלות' },
                  ].map(opt => (
                    <label key={opt.val} className={`flex items-center p-4 border-2 cursor-pointer transition-colors ${formData.shippingMethod === opt.val ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
                      <input type="radio" name="shippingMethod" value={opt.val} checked={formData.shippingMethod === opt.val} onChange={handleInputChange} className="ml-3" />
                      <div className="flex-1">
                        <div className="font-medium">{opt.title}</div>
                        <div className="text-sm text-gray-600">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* כתובת משלוח */}
              {formData.shippingMethod !== 'pickup' && (
                <div className="bg-white border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold mb-6">כתובת למשלוח</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">רחוב ומספר בית *</label>
                      <input type="text" name="street" value={formData.street} onChange={handleInputChange}
                        className={`w-full border-2 ${errors.street ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                        placeholder="רחוב הרצל 123" />
                      {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">עיר *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                        className={`w-full border-2 ${errors.city ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                        placeholder="תל אביב" />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">מיקוד *</label>
                      <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange}
                        className={`w-full border-2 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} p-3 focus:border-black focus:outline-none transition-colors`}
                        placeholder="1234567" />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* אופציית תשלום */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">אופציית תשלום</h2>
                <div className="space-y-3">
                  {[
                    { val: 'credit', title: 'כרטיס אשראי', desc: 'Visa, Mastercard, American Express' },
                  ].map(opt => (
                    <label key={opt.val} className={`flex items-center p-4 border-2 cursor-pointer transition-colors ${formData.paymentMethod === opt.val ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
                      <input type="radio" name="paymentMethod" value={opt.val} checked={formData.paymentMethod === opt.val} onChange={handleInputChange} className="ml-3" />
                      <div className="flex-1">
                        <div className="font-medium">{opt.title}</div>
                        <div className="text-sm text-gray-600">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* קופון */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">🏷️ קוד קופון</h2>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-4">
                    <div>
                      <div className="font-bold text-green-700">✅ קופון הוחל!</div>
                      <div className="text-sm text-green-600 mt-1">
                        {appliedCoupon.code} — {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}% הנחה` : `₪${appliedCoupon.discount_value} הנחה`}
                      </div>
                      <div className="text-sm font-bold text-green-700 mt-1">חסכת: ₪{couponDiscount.toLocaleString('he-IL')}</div>
                    </div>
                    <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                      className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-3">
                      <input type="text" value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                        placeholder="הכנס קוד קופון"
                        className="flex-1 border-2 border-gray-300 p-3 focus:border-black focus:outline-none transition-colors"
                        style={{ letterSpacing: '2px' }} />
                      <button type="button" onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                        className="bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {couponLoading ? '...' : 'החל'}
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* הערות */}
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">הערות להזמנה</h2>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="4"
                  className="w-full border-2 border-gray-300 p-3 focus:border-black focus:outline-none transition-colors"
                  placeholder="הוראות מיוחדות למשלוח, זמן מועדף וכו' (אופציונלי)" />
              </div>

              {/* הסכמה לדיוור */}
              <div className="bg-amber-50 border border-amber-200 p-5 rounded">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-black flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    אני מסכים/ה לקבל עדכונים, מבצעים וחדשות מההיכל בדוא"ל 📧
                    <span className="block text-gray-500 text-xs mt-1">(ניתן לבטל בכל עת)</span>
                  </span>
                </label>
              </div>

              {/* כפתורי פעולה */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 bg-black text-white py-4 px-8 text-lg font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {isSubmitting ? 'מבצע הזמנה...' : '✓ אישור וביצוע הזמנה'}
                </button>
                <button type="button" onClick={() => navigate('/cart')}
                  className="flex-1 border-2 border-black text-black py-4 px-8 text-lg font-bold hover:bg-gray-50 transition-colors">
                  ← חזרה לעגלה
                </button>
              </div>
            </form>
          </div>

          {/* סיכום הזמנה */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6">סיכום הזמנה</h2>
              <div className="mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.uniqueId || item.id} className="flex justify-between items-center py-2 text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-600">כמות: {item.quantity}</div>
                    </div>
                    <div className="font-medium">₪{((item.displayPrice || item.price) * item.quantity).toLocaleString('he-IL')}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-300 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">סכום ביניים:</span>
                  <span className="font-medium">₪{subtotal.toLocaleString('he-IL')}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">משלוח:</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? <span className="text-green-600">חינם!</span> : `₪${shippingCost}`}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-base text-green-600 font-medium">
                    <span>הנחת קופון ({appliedCoupon?.code}):</span>
                    <span>-₪{couponDiscount.toLocaleString('he-IL')}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between font-bold text-xl">
                  <span>סה"כ לתשלום:</span>
                  <span>₪{finalTotal.toLocaleString('he-IL')}</span>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-300">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span>תשלום מאובטח 100%</span>
                </div>
                <div className="text-xs text-center text-gray-500">המידע שלך מוצפן ומאובטח</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}