import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const LOGO_URL = 'https://taewbxptprdixsusvjfh.supabase.co/storage/v1/object/public/banners/logo.png'
const WHATSAPP = 'https://wa.me/972515021295'
const INSTAGRAM = 'https://www.instagram.com/haheichal_judaica/'

export default function Footer() {
  const handleLinkClick = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const categories = [
    { id: '4ab66e85-24a8-4770-af8d-e197d4860fad', name: 'כיסויי טלית ותפילין' },
    { id: '56ed5b77-dd2e-42cc-8a46-bbf56af1ebae', name: 'פמוטים' },
    { id: 'db8fd3a9-adbb-4002-998e-3660b1bc5e32', name: 'כיפות' },
    { id: '07fcf2a6-5ccf-4166-8af4-1821c033c67c', name: 'ברכות לקיר' },
    { id: '1c1b4bda-897c-432b-a520-a07e5c7f3a11', name: 'מזוזות' },
    { id: '0f78eb47-d244-4727-9a94-0aaad6b1dfb0', name: 'גביעי קידוש' },
  ]

  return (
    <>
      <ScrollToTop />
      <footer className="bg-black text-white border-t border-gray-800" dir="rtl">
        <div className="max-w-7xl mx-auto px-6 py-16">

          {/* גריד ראשי */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">

            {/* לוגו + תיאור */}
            <div className="flex flex-col gap-4">
              <Link to="/" onClick={handleLinkClick}>
                <img src={LOGO_URL} alt="ההיכל" className="h-14 w-auto hover:opacity-80 transition-opacity" />
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                תשמישי קדושה ויודאיקה באיכות גבוהה לכל בית יהודי.
              </p>
              {/* סושיאל */}
              <div className="flex gap-3 mt-2">
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-[#25D366] flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* קטגוריות */}
            <div>
              <h3 className="font-bold text-sm mb-5 text-[#D4AF37] uppercase tracking-widest">קטגוריות</h3>
              <ul className="space-y-3">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/category/${cat.id}`} onClick={handleLinkClick}
                      className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* מידע */}
            <div>
              <h3 className="font-bold text-sm mb-5 text-[#D4AF37] uppercase tracking-widest">מידע</h3>
              <ul className="space-y-3 text-sm">
                <li className="text-white font-semibold">🚚 משלוח חינם מעל 299 ₪</li>
                <li className="text-gray-400">זמן אספקה: 7 ימי עסקים</li>
                <li>
                  <Link to="/about" onClick={handleLinkClick}
                    className="text-gray-400 hover:text-[#D4AF37] transition-colors">עלינו</Link>
                </li>
                <li>
                  <Link to="/privacy" onClick={handleLinkClick}
                    className="text-gray-400 hover:text-[#D4AF37] transition-colors">מדיניות פרטיות ותקנון</Link>
                </li>
              </ul>
            </div>

            {/* צור קשר */}
            <div>
              <h3 className="font-bold text-sm mb-5 text-[#D4AF37] uppercase tracking-widest">צור קשר</h3>
              <div className="space-y-3 text-sm">
                <a href="tel:0515021295" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <span>📞</span> 051-5021295
                </a>
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-[#25D366] transition-colors">
                  <span>💬</span> וואטסאפ
                </a>
                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors">
                  <span>📸</span> @haheichal_judaica
                </a>
              </div>
            </div>
          </div>

          {/* שורה תחתונה */}
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} ההיכל. כל הזכויות שמורות.</p>
            <p>
              נבנה ועוצב ע״י{' '}
              <a href="https://wa.me/9720505515745" target="_blank" rel="noopener noreferrer"
                className="font-bold text-[#D4AF37] hover:text-white transition-colors">MB Web Development</a>
            </p>
          </div>

        </div>
      </footer>
    </>
  )
}