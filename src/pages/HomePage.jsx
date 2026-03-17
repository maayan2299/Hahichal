import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseUrl } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import AccessibilityMenu from '../components/AccessibilityMenu'
import FeaturedProducts from '../components/FeaturedProducts'

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [instagramImages, setInstagramImages] = useState([])
  const [selectedInstagramImage, setSelectedInstagramImage] = useState(null)
  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl
  const mainBannerUrl = `${baseUrl}/storage/v1/object/public/banners/banner.png`

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('display_order')
      if (data) setCategories(data)
    }

    async function fetchInstagramImages() {
      try {
        const { data, error } = await supabase.storage
          .from('instagram')
          .list('', { limit: 20, sortBy: { column: 'created_at', order: 'desc' } })
        if (error) throw error
        const imgs = (data || [])
          .filter(f => f.name && !f.name.startsWith('.') && f.name !== '.emptyFolderPlaceholder')
          .map(f => `${baseUrl}/storage/v1/object/public/instagram/${f.name}`)
        setInstagramImages(imgs)
        if (imgs.length > 0) setSelectedInstagramImage(imgs[0])
      } catch (err) {
        console.error('Instagram fetch error:', err)
      }
    }

    fetchCategories()
    fetchInstagramImages()
  }, [])

  const sideImages = instagramImages.filter(img => img !== selectedInstagramImage)

  return (
    <div className="min-h-screen bg-[#FEFDFB] overflow-x-hidden text-[#2D2420]" dir="rtl">
      <AccessibilityMenu />
      <CartDrawer />
      <Header />

      {/* תמונה ראשית - נקייה ללא טקסט */}
      <section className="w-full bg-white pt-20 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <img
            src={mainBannerUrl}
            alt="ההיכל - תשמישי קדושה"
            className="w-full h-auto object-contain mx-auto"
            style={{ maxHeight: '500px' }}
          />
        </div>
      </section>

      {/* המיוחדים שלנו */}
      <div id="featured" className="py-12 bg-white">
        <FeaturedProducts />
      </div>

      {/* קטגוריות - Carousel כמו נר-ליה */}
      <section className="py-16 bg-[#FEFDFB]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2D2420]"
              style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
              הקטגוריות שלנו
            </h2>
            <div className="h-1 w-20 bg-[#D4AF37] mx-auto" />
          </div>

          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 md:gap-6 pb-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    className="group relative flex-shrink-0 w-[280px] md:w-[320px] aspect-[3/4] rounded-sm overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                    <img
                      src={cat.image_url || `${baseUrl}/storage/v1/object/public/categories/${cat.slug || cat.id}.png`}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                    <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                      <h3 className="text-white text-lg md:text-xl font-bold tracking-wide drop-shadow-lg mb-2"
                        style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                        {cat.name}
                      </h3>
                      
                      <div className="h-[2px] w-0 group-hover:w-16 bg-[#D4AF37] mx-auto transition-all duration-500" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* חצים */}
            {categories.length > 4 && (
              <>
                <button
                  onClick={() => {
                    const container = document.querySelectorAll('.overflow-x-auto')[1]
                    container.scrollBy({ left: -320, behavior: 'smooth' })
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 z-10 hidden md:block"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const container = document.querySelectorAll('.overflow-x-auto')[1]
                    container.scrollBy({ left: 320, behavior: 'smooth' })
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 z-10 hidden md:block"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </section>

      {/* פיד אינסטגרם */}
      {instagramImages.length > 0 && (
        <section className="py-20 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 text-center mb-12">
            <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] font-semibold mb-3">
              עקבו אחרינו
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-2 text-[#2D2420]"
              style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
              באינסטגרם
            </h2>
            <a
              href="https://instagram.com/hahiechal_judaica"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[#D4AF37] tracking-[0.3em] font-bold hover:text-[#B8941F] transition-colors"
            >
              @HAHIECHAL_JUDAICA
            </a>
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-8">
            {sideImages.slice(0, 2).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedInstagramImage(img)}
                className="hidden lg:block w-48 aspect-square rounded-sm overflow-hidden shadow-md hover:scale-105 transition-transform border-2 border-transparent hover:border-[#D4AF37]"
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}

            <div className="relative z-20 scale-90 md:scale-100">
              <div className="w-[260px] h-[520px] bg-black rounded-[45px] p-3 shadow-[0_0_60px_rgba(212,175,55,0.3)] border border-[#D4AF37]/20">
                <div className="w-full h-full bg-white rounded-[38px] overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-30" />
                  <div className="pt-12 px-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#B8941F] p-[2px]">
                        <div className="w-full h-full rounded-full bg-white" />
                      </div>
                      <span className="text-[10px] font-bold">hahiechal_judaica</span>
                    </div>
                    {selectedInstagramImage && (
                      <img
                        src={selectedInstagramImage}
                        className="w-full aspect-square object-cover rounded-md shadow-inner"
                        alt=""
                      />
                    )}
                    <div className="mt-4 flex gap-3">
                      <span className="w-4 h-4 border border-black rounded-full" />
                      <span className="w-4 h-4 border border-black rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {sideImages.slice(2, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedInstagramImage(img)}
                className="hidden lg:block w-48 aspect-square rounded-sm overflow-hidden shadow-md hover:scale-105 transition-transform border-2 border-transparent hover:border-[#D4AF37]"
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ספר תורה - המלצות */}
      <section className="py-20 bg-gradient-to-b from-[#F5F5F0] to-[#FEFDFB]">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-2 text-[#2D2420]"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
            המלצות
          </h2>
          <p className="text-gray-600">מה הלקוחות שלנו אומרים</p>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          {/* ספר תורה */}
          <div className="relative flex items-center justify-center py-8">
            
            {/* גליל שמאלי */}
            <div className="relative flex flex-col items-center" style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}>
              {/* ידית עליונה */}
              <div className="w-10 h-20 rounded-full shadow-xl relative" 
                style={{ 
                  background: 'linear-gradient(135deg, #8B7355 0%, #A0826D 25%, #6B5644 50%, #A0826D 75%, #8B7355 100%)',
                }}>
                <div className="absolute inset-0 opacity-30 rounded-full" 
                  style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }} />
                <div className="w-7 h-7 bg-[#6B5644] rounded-full mx-auto mt-3 shadow-inner" />
              </div>
              
              {/* דיסקית עליונה */}
              <div className="w-24 h-5 rounded-full shadow-lg my-1 relative"
                style={{ background: 'radial-gradient(ellipse at center, #A0826D 0%, #8B7355 50%, #6B5644 100%)' }}>
                <div className="absolute inset-0 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(ellipse at 30% 30%, white, transparent)' }} />
              </div>
              
              {/* הגליל */}
              <div className="w-20 h-[420px] rounded-lg shadow-2xl relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(90deg, #E8DCC8 0%, #F5F0E8 20%, #FFF9F0 40%, #F5F0E8 60%, #E8DCC8 80%, #D4C5B0 100%)',
                }}>
                {/* טקסטורת עץ */}
                <div className="absolute inset-0 opacity-20"
                  style={{ 
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(139,115,85,0.1) 8px, rgba(139,115,85,0.1) 9px)',
                  }} />
                {/* גרדיאנט צל */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-transparent" />
              </div>
              
              {/* דיסקית תחתונה */}
              <div className="w-24 h-5 rounded-full shadow-lg my-1 relative"
                style={{ background: 'radial-gradient(ellipse at center, #A0826D 0%, #8B7355 50%, #6B5644 100%)' }}>
                <div className="absolute inset-0 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(ellipse at 30% 30%, white, transparent)' }} />
              </div>
              
              {/* ידית תחתונה */}
              <div className="w-10 h-20 rounded-full shadow-xl relative"
                style={{ 
                  background: 'linear-gradient(135deg, #8B7355 0%, #A0826D 25%, #6B5644 50%, #A0826D 75%, #8B7355 100%)',
                }}>
                <div className="absolute inset-0 opacity-30 rounded-full"
                  style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }} />
                <div className="w-7 h-7 bg-[#6B5644] rounded-full mx-auto mt-12 shadow-inner" />
              </div>
            </div>

            {/* הקלף הפתוח */}
            <div className="relative mx-6 w-full max-w-3xl">
              <div className="rounded-lg p-10 md:p-14 relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-500"
                style={{ 
                  background: 'linear-gradient(135deg, #FFF8E7 0%, #F5F0E1 25%, #FFF9ED 50%, #F5F0E1 75%, #FFF8E7 100%)',
                  minHeight: '420px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}>
                
                {/* קמטים וטקסטורה */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ 
                    backgroundImage: `
                      radial-gradient(ellipse at 20% 30%, rgba(139,115,85,0.3) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 70%, rgba(139,115,85,0.2) 0%, transparent 50%),
                      repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(139,115,85,0.05) 30px, rgba(139,115,85,0.05) 31px)
                    `
                  }} />
                
                {/* קווים אופקיים */}
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
                  style={{ 
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(139,69,19,0.4) 27px, rgba(139,69,19,0.4) 28px)',
                  }} />
                
                {/* טקסט המלצות */}
                <div className="space-y-8 text-right relative z-10" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                  <div className="border-r-4 border-[#C9A961] pr-5 py-2">
                    <p className="text-gray-800 text-base md:text-lg mb-3 leading-relaxed">
                      "שירות מעולה ומוצרים איכותיים! קיבלנו את המזוזות במהירות והן פשוט מהממות."
                    </p>
                    <p className="text-sm text-[#8B7355] font-bold">— רחל כהן</p>
                  </div>

                  <div className="border-r-4 border-[#C9A961] pr-5 py-2">
                    <p className="text-gray-800 text-base md:text-lg mb-3 leading-relaxed">
                      "הפמוטים שקניתי הם פשוט יפהפיים. ממליצה בחום!"
                    </p>
                    <p className="text-sm text-[#8B7355] font-bold">— שרה לוי</p>
                  </div>

                  <div className="border-r-4 border-[#C9A961] pr-5 py-2">
                    <p className="text-gray-800 text-base md:text-lg mb-3 leading-relaxed">
                      "מוצרים מיוחדים באיכות גבוהה. תודה על השירות המסור!"
                    </p>
                    <p className="text-sm text-[#8B7355] font-bold">— דוד מזרחי</p>
                  </div>
                </div>

                {/* כוכבים */}
                <div className="flex justify-center gap-2 mt-10 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-7 h-7 text-[#D4AF37] drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* צללים וגרדיאנטים */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none rounded-lg" />
              </div>
            </div>

            {/* גליל ימני */}
            <div className="relative flex flex-col items-center" style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}>
              {/* ידית עליונה */}
              <div className="w-10 h-20 rounded-full shadow-xl relative"
                style={{ 
                  background: 'linear-gradient(135deg, #8B7355 0%, #A0826D 25%, #6B5644 50%, #A0826D 75%, #8B7355 100%)',
                }}>
                <div className="absolute inset-0 opacity-30 rounded-full"
                  style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }} />
                <div className="w-7 h-7 bg-[#6B5644] rounded-full mx-auto mt-3 shadow-inner" />
              </div>
              
              {/* דיסקית עליונה */}
              <div className="w-24 h-5 rounded-full shadow-lg my-1 relative"
                style={{ background: 'radial-gradient(ellipse at center, #A0826D 0%, #8B7355 50%, #6B5644 100%)' }}>
                <div className="absolute inset-0 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(ellipse at 30% 30%, white, transparent)' }} />
              </div>
              
              {/* הגליל */}
              <div className="w-20 h-[420px] rounded-lg shadow-2xl relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(90deg, #D4C5B0 0%, #E8DCC8 20%, #F5F0E8 40%, #FFF9F0 60%, #F5F0E8 80%, #E8DCC8 100%)',
                }}>
                {/* טקסטורת עץ */}
                <div className="absolute inset-0 opacity-20"
                  style={{ 
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(139,115,85,0.1) 8px, rgba(139,115,85,0.1) 9px)',
                  }} />
                {/* גרדיאנט צל */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-l from-black/5 via-transparent to-transparent" />
              </div>
              
              {/* דיסקית תחתונה */}
              <div className="w-24 h-5 rounded-full shadow-lg my-1 relative"
                style={{ background: 'radial-gradient(ellipse at center, #A0826D 0%, #8B7355 50%, #6B5644 100%)' }}>
                <div className="absolute inset-0 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(ellipse at 30% 30%, white, transparent)' }} />
              </div>
              
              {/* ידית תחתונה */}
              <div className="w-10 h-20 rounded-full shadow-xl relative"
                style={{ 
                  background: 'linear-gradient(135deg, #8B7355 0%, #A0826D 25%, #6B5644 50%, #A0826D 75%, #8B7355 100%)',
                }}>
                <div className="absolute inset-0 opacity-30 rounded-full"
                  style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }} />
                <div className="w-7 h-7 bg-[#6B5644] rounded-full mx-auto mt-12 shadow-inner" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* יתרונות */}
      <section className="bg-[#FEFDFB] py-16 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {[
            {
              label: 'איכות גבוהה',
              icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
            },
            {
              label: 'שירות אישי',
              icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
            },
            {
              label: 'תשלום מאובטח',
              icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
            },
            {
              label: 'משלוח מהיר',
              icon: 'M13 10V3L4 14h7v7l9-11h-7z'
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 flex items-center justify-center mb-4 border-2 border-[#D4AF37]/20 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/5 transition-all rounded-full text-[#D4AF37]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <h3 className="text-sm font-bold tracking-wide text-[#2D2420]"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                {item.label}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp */}
      <a
        href="https://wa.me/972515021295"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 z-50 bg-[#25D366] text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform group"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      </a>

      <Footer />
    </div>
  )
}