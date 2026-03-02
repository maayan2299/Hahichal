import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseUrl } from '../lib/supabase'
import { getImageUrl } from '../lib/products'
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

  // תמונות לצדדים — כל מה שלא נבחר
  const sideImages = instagramImages.filter(img => img !== selectedInstagramImage)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden text-black" dir="rtl">
      <AccessibilityMenu />
      <CartDrawer />
      <Header />

      {/* באנר ראשי */}
      <section className="w-full bg-white pt-14 pb-2 px-10 md:px-24">
        <img
          src={mainBannerUrl}
          alt="ההיכל"
          className="w-full h-auto object-cover mx-auto"
          style={{ maxHeight: '50vh', objectPosition: 'center' }}
        />
      </section>

      {/* המיוחדים שלנו */}
      <div id="featured" className="py-12">
        <FeaturedProducts />
      </div>

      {/* סליידר קטגוריות */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
            הקטגוריות שלנו
          </h2>
          <div className="h-1 w-20 bg-[#D4AF37] mx-auto"></div>
        </div>

        <div className="relative">
          <button onClick={() => document.getElementById('categories-scroll').scrollBy({ left: -300, behavior: 'smooth' })}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 border border-[#D4AF37]/30 rounded-full shadow-xl items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => document.getElementById('categories-scroll').scrollBy({ left: 300, behavior: 'smooth' })}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 border border-[#D4AF37]/30 rounded-full shadow-xl items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>

          <div id="categories-scroll" className="flex gap-6 overflow-x-auto pb-10 no-scrollbar px-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.id}`} className="min-w-[200px] md:min-w-[280px] group relative">
                <div className="aspect-[4/5] rounded-sm overflow-hidden shadow-lg relative bg-gray-50 border border-gray-100">
                  <img
                    src={cat.image_url || `${baseUrl}/storage/v1/object/public/categories/${cat.slug || cat.id}.png`}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:blur-[2px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 inset-x-0 text-center">
                    <h3 className="text-white text-xl font-bold tracking-wide drop-shadow-md">{cat.name}</h3>
                    <div className="h-[1px] w-0 group-hover:w-12 bg-[#D4AF37] mx-auto transition-all duration-500 mt-2"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* פיד אינסטגרם */}
      {instagramImages.length > 0 && (
        <section className="py-20 bg-gray-50 overflow-hidden border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>עקבו אחרינו</h2>
            <p className="text-[#D4AF37] tracking-[0.3em] font-bold">@HAHIECHAL_JUDAICA</p>
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-8">
            {/* 2 תמונות שמאל */}
            {sideImages.slice(0, 2).map((img, i) => (
              <button key={i} onClick={() => setSelectedInstagramImage(img)}
                className="hidden lg:block w-48 aspect-square rounded-sm overflow-hidden shadow-md hover:scale-105 transition-transform border-2 border-transparent hover:border-[#D4AF37]">
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}

            {/* מוקאפ טלפון */}
            <div className="relative z-20 scale-90 md:scale-100">
              <div className="w-[260px] h-[520px] bg-black rounded-[45px] p-3 shadow-[0_0_40px_rgba(212,175,55,0.2)] border border-[#D4AF37]/20">
                <div className="w-full h-full bg-white rounded-[38px] overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-30"></div>
                  <div className="pt-12 px-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-black p-[2px]">
                        <div className="w-full h-full rounded-full bg-white"></div>
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
                      <span className="w-4 h-4 border border-black rounded-full"></span>
                      <span className="w-4 h-4 border border-black rounded-full"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2 תמונות ימין */}
            {sideImages.slice(2, 4).map((img, i) => (
              <button key={i} onClick={() => setSelectedInstagramImage(img)}
                className="hidden lg:block w-48 aspect-square rounded-sm overflow-hidden shadow-md hover:scale-105 transition-transform border-2 border-transparent hover:border-[#D4AF37]">
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* יתרונות שירות */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'איכות גבוהה', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { label: 'שירות אישי', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
            { label: 'תשלום מאובטח', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { label: 'משלוח חינם', text: '₪' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 flex items-center justify-center mb-4 border border-[#D4AF37]/20 group-hover:border-[#D4AF37] transition-colors rounded-full text-[#D4AF37]">
                {item.icon
                  ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={item.icon} /></svg>
                  : <span className="text-xl font-bold">{item.text}</span>}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest">{item.label}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp */}
      <a href="https://wa.me/972534726022" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-8 left-8 z-50 bg-[#25D366] text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform">
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
      </a>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  )
}