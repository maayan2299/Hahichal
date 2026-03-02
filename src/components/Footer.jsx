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
      <footer className="bg-black border-t border-gray-800" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">

            {/* עמודה 1 - לוגו למעלה */}
            <div className="md:col-span-1 flex justify-center md:justify-end md:items-start pt-0 md:pl-8">
              <Link to="/" onClick={handleLinkClick}>
                <img
                  src={logoImg}
                  alt="ההיכל"
                  className="w-28 md:w-32 h-auto hover:opacity-80 transition-opacity rounded-2xl overflow-hidden"
                />
              </Link>
            </div>

            {/* עמודות תוכן */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

              {/* קטגוריות */}
              <div className="text-center md:text-right">
                <h3 className="font-bold text-base mb-4 text-white tracking-wide">קטגוריות</h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/category/${cat.id}`}
                        onClick={handleLinkClick}
                        className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* על החנות */}
              <div className="text-center md:text-right">
                <h3 className="font-bold text-base mb-4 text-white tracking-wide">על החנות</h3>
                <ul className="space-y-2">
                  {aboutLinks.map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.link}
                        onClick={handleLinkClick}
                        className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* יצירת קשר */}
              <div className="text-center md:text-right">
                <h3 className="font-bold text-base mb-4 text-white tracking-wide">יצירת קשר</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <span className="font-semibold text-white">טלפון: </span>
                    <a href="tel:0534726022" className="hover:text-[#D4AF37] transition-colors">054-211-5584</a>
                  </li>
                  <li>
                    <span className="font-semibold text-white">וואטסאפ: </span>
                    <a href="https://wa.me/972534726022" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">054-211-5584</a>
                  </li>
                  <li>
                    <span className="font-semibold text-white">מייל: </span>
                    <a href="mailto:info@hahiechal.com" className="hover:text-[#D4AF37] transition-colors">info@hahiechal.com</a>
                  </li>
                  <li>
                    <span className="font-semibold text-white">שעות פתיחה: </span>8:30–17:00
                  </li>
                </ul>

                {/* סושיאל */}
                <div className="flex gap-3 mt-6 justify-center md:justify-start">
                  <a href="https://www.facebook.com/hahiechal" target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-gray-600 text-gray-400 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://instagram.com/hahiechal_judaica" target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-gray-600 text-gray-400 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* קו תחתון */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <p>
                נבנה ועוצב ע״י{' '}
                <a href="https://wa.me/9720505515745" target="_blank" rel="noopener noreferrer"
                  className="font-semibold text-[#D4AF37] hover:text-white transition-colors">
                  MB
                </a>
              </p>
              <p>© {new Date().getFullYear()} ההיכל. כל הזכויות שמורות.</p>
            </div>
          </div>

        </div>
      </footer>
    </>
  )
}