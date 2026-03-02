import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import logoImg from '../logo.jpg'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [announcementIdx, setAnnouncementIdx] = useState(0)
  const { getItemCount, setIsCartOpen } = useCart()

  const announcements = [
    'משלוח חינם בקנייה מעל ₪299',
    'תשמישי קדושה ויודאיקה באיכות גבוהה',
    'האתר אינו עובד בשבת ויום טוב',
  ]

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('display_order')
      if (data) setCategories(data)
    }
    fetchCategories()
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Header קבוע */}
      <div
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
        className={`transition-all duration-500 ${scrolled ? 'bg-black shadow-lg' : 'bg-white'}`}
      >
        {/* שורה 1 — פס הכרזה עם חצים */}
        <div className="border-b border-[#b8944a]/40 overflow-hidden relative"
          style={{ background: scrolled ? '#111' : 'linear-gradient(90deg, #7A5500 0%, #EED072 15%, #CFAA52 35%, #FBF6B8 50%, #CFAA52 65%, #EED072 85%, #7A5500 100%)' }}>
          
          {/* ניצוץ נע */}
          {!scrolled && <div className="absolute inset-y-0 w-1/4 opacity-50 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, #FFFDE0, transparent)', animation: 'shimmer 2.5s ease-in-out infinite' }} />}
          
          {/* ברק בצדדים */}
          {!scrolled && <>
            <div className="absolute inset-y-0 left-0 w-20 opacity-70 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, #FBF6B8, transparent)' }} />
            <div className="absolute inset-y-0 right-0 w-20 opacity-70 pointer-events-none"
              style={{ background: 'linear-gradient(270deg, #FBF6B8, transparent)' }} />
          </>}

          <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-2 relative z-10">
            <button onClick={() => setAnnouncementIdx(i => (i - 1 + announcements.length) % announcements.length)}
              className={`p-1 transition-colors ${scrolled ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className={`text-[11px] tracking-[0.25em] font-bold ${scrolled ? 'text-white' : 'text-black'}`}>
              {announcements[announcementIdx]}
            </p>
            <button onClick={() => setAnnouncementIdx(i => (i + 1) % announcements.length)}
              className={`p-1 transition-colors ${scrolled ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* שורה 2 — לוגו + ניווט + אייקונים */}
        <div className={`transition-all duration-500 ${scrolled ? 'py-3' : 'py-4'}`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">

            {/* ימין — לוגו / כיתוב */}
            <Link to="/" className="flex-shrink-0 min-w-[100px] flex justify-end">
              {scrolled ? (
                <span className="text-2xl font-bold text-white tracking-wide"
                  style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                  ההיכל
                </span>
              ) : (
                <img
                  src={logoImg}
                  alt="ההיכל"
                  className="h-14 w-auto object-contain"
                />
              )}
            </Link>

            {/* מרכז — ניווט */}
            <nav className="hidden lg:flex items-center gap-x-6 flex-1 justify-center">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/category/${cat.id}`}
                  className={`text-[13px] font-medium transition-colors relative group whitespace-nowrap
                    ${scrolled ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                  {cat.name}
                  <span className="absolute -bottom-0.5 right-0 w-0 h-px bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* שמאל — אייקונים */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2.5 transition-colors ${scrolled ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
              </button>

              <button onClick={() => setIsCartOpen(true)}
                className={`relative p-2.5 transition-colors ${scrolled ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {getItemCount() > 0 && (
                  <span className="absolute top-1 left-1 bg-[#D4AF37] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>

              <button onClick={() => setMobileMenuOpen(true)}
                className={`p-2.5 lg:hidden transition-colors ${scrolled ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* חיפוש */}
          {searchOpen && (
            <div className={`mt-2 px-6 pb-3 border-t ${scrolled ? 'border-white/10' : 'border-gray-100'}`}>
              <div className="max-w-xl mx-auto relative pt-3">
                <input autoFocus type="text" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="חיפוש מוצרים..."
                  className={`w-full border px-4 py-2.5 text-sm focus:outline-none pr-10 text-right
                    ${scrolled ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white' : 'border-gray-200 focus:border-black'}`}
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                  className={`absolute left-3 top-[22px] ${scrolled ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-black'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer — כדי שהתוכן לא יוסתר מתחת לheader */}
      <div className="h-[88px]" />

      {/* תפריט נייד */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl p-8">
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
              <img src={logoImg} alt="ההיכל" className="h-10 w-auto" />
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/category/${cat.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-gray-700 hover:text-[#D4AF37] transition-colors">
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}