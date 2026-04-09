import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import logoImg from '../logo.jpg'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function Footer() {
  const categories = [
    { id: 'shabbat', name: 'שבת וחגים' },
    { id: 'judaica', name: 'יודאיקה' },
    { id: 'kippot', name: 'כיפות' },
    { id: 'glass-art', name: 'תמונות זכוכית' },
    { id: 'wall-blessings', name: 'ברכות לקיר' },
    { id: 'gifts', name: 'מתנות ואירועים' },
  ]

  const aboutLinks = [
    { label: 'עלינו', link: '/about' },
    { label: 'מדיניות פרטיות ותקנון', link: '/privacy' },
  ]

  const handleLinkClick = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      <ScrollToTop />
      <footer className="bg-black border-t border-gray-800 text-white" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 py-12">

          {/* לוגו מרכזי - עם תיקון שקיפות ויזואלי */}
          <div className="flex justify-center mb-12">
            <Link to="/" onClick={handleLinkClick}>
              <img
                src={logoImg}
                alt="ההיכל"
                className="w-28 h-auto hover:opacity-80 transition-opacity rounded-xl mix-blend-screen"
                style={{ backgroundColor: 'black' }} 
              />
            </Link>
          </div>

          {/* גריד של עמודות */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-4 text-right border-b border-gray-900 pb-12">

            {/* קטגוריות */}
            <div>
              <h3 className="font-bold text-base mb-5 text-[#D4AF37] uppercase tracking-wider">קטגוריות</h3>
              <ul className="space-y-3">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/category/${cat.id}`}
                      onClick={handleLinkClick}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* מידע ומשלוחים */}
            <div>
              <h3 className="font-bold text-base mb-5 text-[#D4AF37] uppercase tracking-wider">מידע</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="text-gray-200 font-semibold text-base">משלוח חינם מעל 299 ₪</li>
                <li>זמן אספקה: 7 ימי עסקים</li>
                {aboutLinks.map((item, i) => (
                  <li key={i}>
                    <Link to={item.link} onClick={handleLinkClick} className="hover:text-white transition-colors text-gray-300">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* צור קשר */}
            <div className="col-span-2 md:col-span-1 border-t border-gray-900 pt-8 md:pt-0 md:border-0">
              <h3 className="font-bold text-base mb-5 text-[#D4AF37] uppercase tracking-wider">צור קשר</h3>
              <div className="space-y-4 text-sm text-gray-400">
                <p className="flex items-center gap-2">
                  <span className="text-white font-medium">טלפון:</span>
                  <a href="tel:0515021295" className="hover:text-white">051-5021295</a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-white font-medium">וואטסאפ:</span>
                  <a href="https://wa.me/972515021295" target="_blank" rel="noopener noreferrer" className="hover:text-white">051-5021295</a>
                </p>
                
                <div className="pt-2">
                  <a href="https://instagram.com/hahiechal_judaica" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-700 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                    <span>האינסטגרם שלנו</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* שורת זכויות תחתונה - נקייה ומסודרת */}
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-gray-500">
              © {new Date().getFullYear()} ההיכל. כל הזכויות שמורות.
            </p>
            
            <p className="text-[12px] text-gray-500">
              נבנה ועוצב ע״י{' '}
              <a href="https://wa.me/9720505515745" target="_blank" rel="noopener noreferrer"
                className="font-bold text-[#D4AF37] hover:text-white transition-colors">
                MB
              </a>
            </p>
          </div>

        </div>
      </footer>
    </>
  )
}