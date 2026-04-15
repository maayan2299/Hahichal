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
  const [popup, setPopup] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl
  const mainBannerUrl = `${baseUrl}/storage/v1/object/public/banners/banner.png`

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_parent', false)
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
      } catch (err) {
        console.error('Instagram fetch error:', err)
      }
    }
    async function fetchPopup() {
      const { data } = await supabase.from('popup_settings').select('*').limit(1).maybeSingle()
      if (data?.is_active) {
        const seen = sessionStorage.getItem('popup_seen')
        if (!seen) {
          setPopup(data)
          setShowPopup(true)
        }
      }
    }
    fetchCategories()
    fetchInstagramImages()
    fetchPopup()
  }, [])

  return (
    <div className="min-h-screen bg-[#FEFDFB] overflow-x-hidden text-[#2D2420] relative" dir="rtl">
      <AccessibilityMenu />
      <CartDrawer />
      <Header />

      {/* באנר ראשי */}
      <section className="w-full bg-white pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <img src={mainBannerUrl} alt="באנר" className="w-full h-auto object-contain mx-auto max-h-[600px]" />
        </div>
      </section>

      {/* המיוחדים שלנו */}
      <div id="featured" className="py-6 bg-white">
        <FeaturedProducts />
      </div>

      {/* קטגוריות - 3 במובייל */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl mb-8 font-shofar">הקטגוריות שלנו</h2>
          <div className="relative">
            {/* חץ שמאל */}
            <button
              onClick={() => document.getElementById('cat-scroll').scrollBy({ left: -300, behavior: 'smooth' })}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 items-center justify-center transition-all border border-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* חץ ימין */}
            <button
              onClick={() => document.getElementById('cat-scroll').scrollBy({ left: 300, behavior: 'smooth' })}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 items-center justify-center transition-all border border-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div id="cat-scroll" className="overflow-x-auto scrollbar-hide flex gap-3 snap-x snap-mandatory px-1">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/category/${cat.id}`} className="relative flex-shrink-0 w-[calc(33.33%-8px)] md:w-[280px] aspect-[3/4] rounded-xl overflow-hidden snap-start shadow-sm">
                  <img src={cat.image_url || `${baseUrl}/storage/v1/object/public/categories/${cat.slug || cat.id}.png`} className="w-full h-full object-cover" alt={cat.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 inset-x-0 text-center px-1">
                    <h3 className="text-white text-[12px] md:text-xl font-shofar truncate">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* אינסטגרם - פס נע אינסופי */}
      {instagramImages.length > 0 && (
        <section className="py-12 bg-white overflow-hidden" dir="ltr">
          <div className="max-w-7xl mx-auto px-4 text-center mb-8" dir="rtl">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold mb-2">עקבו אחרינו</p>
            <h2 className="text-3xl md:text-5xl font-shofar">באינסטגרם</h2>
            <a href="https://www.instagram.com/haheichal_judaica/" target="_blank" rel="noopener noreferrer"
              className="text-[#D4AF37] text-xs font-bold mt-1 hover:underline">
              @HAHIECHAL_JUDAICA
            </a>
          </div>
          <div className="flex overflow-hidden">
            <div className="flex gap-4 animate-infinite-scroll hover:pause">
              {[...instagramImages, ...instagramImages, ...instagramImages].map((img, index) => (
                <div key={index} className="flex-shrink-0 w-[160px] md:w-[280px] aspect-square rounded-lg overflow-hidden shadow-sm">
                  <img src={img} className="w-full h-full object-cover" alt="Insta" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* המלצות - קרוסלה במובייל (2 בשורה) */}
      <section className="py-16 bg-[#F5F5F0]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl mb-12 font-shofar">המלצות ♥</h2>
          
          <div className="overflow-x-auto scrollbar-hide flex gap-4 snap-x snap-mandatory px-2">
            {[
              { text: 'הברכת הבית המזכוכית מדהימה! מוסיפה טאץ׳ מיוחד לבית. ממליצה בחום!' },
              { text: 'קניתי חנוכיה במתנה ולא יכולתי להיות יותר מרוצה. איכות גבוהה וארוזה יפהפייה.' },
              { text: 'מוצרים מדהימים! הכוס קידוש שקניתי הייתה מושלמת. השירות היה מעולה ומשלוח מהיר.' },
              { text: 'המשלוח הגיע מהר מאוד והמוצר נראה אפילו יותר טוב במציאות!' }
            ].map((review, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl p-6 md:p-8 border border-[#E8E0D0] italic shadow-sm snap-start flex-shrink-0 
                           w-[calc(50%-8px)] md:w-1/3 min-h-[180px] flex items-center justify-center text-[13px] md:text-lg leading-relaxed"
              >
                <div dir="rtl">"{review.text}"</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-gray-400 text-sm md:hidden">החליקו לצפייה בעוד המלצות {">"}</p>
        </div>
      </section>

      {/* יתרונות - רשת ביטחון עם אייקונים זהובים */}
      <section className="bg-white py-20 border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
           {[
            { 
              label: 'איכות גבוהה', 
              sub: 'תשמישי קדושה\nאיכותיים לכל בית',
              icon: <svg className="w-10 h-10 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15L15 13V7L12 9L9 7V13L12 15Z" fill="#C9A84C"/><path d="M12 2L3 7V17L12 22L21 17V7L12 2ZM19 15.82L12 19.71L5 15.82V8.18L12 4.29L19 8.18V15.82Z" fill="#C9A84C"/></svg>
            },
            { 
              label: 'תשלום מאובטח', 
              sub: 'בכל דרך\nשנוחה לך',
              icon: <svg className="w-10 h-10 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.1 7 14 7.9 14 9V11H10V9C10 7.9 10.9 7 12 7ZM17 17H7V13H17V17Z" fill="#C9A84C"/></svg>
            },
            { 
              label: 'שירות לקוחות', 
              sub: 'זמינים כאן\nלכל שאלה',
              icon: <svg className="w-10 h-10 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM17 11H15V9H17V11ZM13 11H11V9H13V11ZM9 11H7V9H9V11Z" fill="#C9A84C"/></svg>
            },
            { 
              label: 'משלוח חינם', 
              sub: 'מעל\n299 ₪',
              icon: <svg className="w-10 h-10 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20C7.66 20 9 18.66 9 17H15C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17H23V12L20 8ZM6 18.5C5.17 18.5 4.5 17.83 4.5 17C4.5 16.17 5.17 15.5 6 15.5C6.83 15.5 7.5 16.17 7.5 17C7.5 17.83 6.83 18.5 6 18.5ZM18 18.5C17.17 18.5 16.5 17.83 16.5 17C16.5 16.17 17.17 15.5 18 15.5C18.83 15.5 19.5 16.17 19.5 17C19.5 17.83 18.83 18.5 18 18.5Z" fill="#C9A84C"/></svg>
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              {item.icon}
              <h3 className="text-xl font-bold mb-2">{item.label}</h3>
              <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* כפתור וואטסאפ צף */}
      <a
        href="https://wa.me/972542115584"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center"
        aria-label="צרו קשר בוואטסאפ"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {showPopup && popup && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4"
          onClick={() => { setShowPopup(false); sessionStorage.setItem('popup_seen', '1'); }}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl relative"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowPopup(false); sessionStorage.setItem('popup_seen', '1'); }}
              className="absolute top-3 left-3 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center z-10 text-sm">✕</button>
            {popup.image_url && <img src={popup.image_url} alt="popup" className="w-full object-cover" />}
            {(popup.title || popup.message) && (
              <div className="p-5 text-center" dir="rtl">
                {popup.title && <div className="text-lg font-bold mb-2">{popup.title}</div>}
                {popup.message && <div className="text-sm text-gray-600 mb-4">{popup.message}</div>}
                <button onClick={() => { setShowPopup(false); sessionStorage.setItem('popup_seen', '1'); }}
                  className="bg-[#C9A84C] text-black px-6 py-2 font-bold rounded">
                  {popup.button_text || 'סגור'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-33.33% - 16px)); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 40s linear infinite;
          display: flex;
          width: max-content;
        }
        .hover\\:pause:hover { animation-play-state: paused; }
      `}</style>
    </div>
  )
}