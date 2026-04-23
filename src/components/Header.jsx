import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

const LOGO_LIGHT = 'https://taewbxptprdixsusvjfh.supabase.co/storage/v1/object/public/banners/logo.png'
const LOGO_DARK = 'https://taewbxptprdixsusvjfh.supabase.co/storage/v1/object/public/banners/logo-Dark.png'
const WHATSAPP = 'https://wa.me/972542115584'

export default function Header() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [announcementIdx, setAnnouncementIdx] = useState(0)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileDropdown, setMobileDropdown] = useState(null)
  const [closeTimeout, setCloseTimeout] = useState(null)
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

    const announcementInterval = setInterval(() => {
      setAnnouncementIdx(prev => (prev + 1) % announcements.length)
    }, 4000)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearInterval(announcementInterval)
    }
  }, [])

  const parentCategories = categories.filter(c => c.is_parent)
  const getSubcategories = (parentId) => categories.filter(c => c.parent_id?.toString() === parentId?.toString())
  const regularCategories = categories.filter(c => !c.is_parent && !c.parent_id)
  const navItems = [...parentCategories, ...regularCategories]

  const handleMouseEnter = (id) => {
    if (closeTimeout) { clearTimeout(closeTimeout); setCloseTimeout(null) }
    setActiveDropdown(id)
  }
  const handleMouseLeave = () => {
    const t = setTimeout(() => setActiveDropdown(null), 300)
    setCloseTimeout(t)
  }

  const [searchResults, setSearchResults] = useState([])
const [searchLoading, setSearchLoading] = useState(false)

const handleSearch = () => {
  if (searchQuery.trim()) {
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }
}

const handleSearchInput = async (val) => {
  setSearchQuery(val)
  if (val.trim().length < 2) { setSearchResults([]); return }
  setSearchLoading(true)
  const { data } = await supabase
    .from('products')
    .select('id, name, price, sale_price, product_images(image_url, is_primary)')
    .eq('is_active', true)
    .ilike('name', `%${val}%`)
    .limit(5)
  setSearchResults(data || [])
  setSearchLoading(false)
}

  const navFont = { fontFamily: "'Shofar', serif", fontSize: '18px' }

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
        className={`transition-all duration-500 ${scrolled ? 'bg-black shadow-lg' : 'bg-white'}`}>

        <div className="border-b border-[#b8944a]/40 overflow-hidden relative"
          style={{ background: scrolled ? '#111' : 'linear-gradient(90deg, #7A5500 0%, #EED072 15%, #CFAA52 35%, #FBF6B8 50%, #CFAA52 65%, #EED072 85%, #7A5500 100%)' }}>
          {!scrolled && (
            <div className="absolute inset-y-0 w-1/4 opacity-50 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, #FFFDE0, transparent)', animation: 'shimmer 2.5s ease-in-out infinite' }} />
          )}
          <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-2 relative z-10">
            <button onClick={() => setAnnouncementIdx(i => (i - 1 + announcements.length) % announcements.length)}
              className={`p-1 transition-colors ${scrolled ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className={`tracking-[0.15em] font-bold ${scrolled ? 'text-white' : 'text-black'}`}
              style={{ fontFamily: "'Shofar', serif", fontSize: '13px' }}>
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

        <div className={`transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'}`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">

            <Link to="/" className="flex-shrink-0 min-w-[120px] flex justify-end">
              <img
                src={scrolled ? LOGO_LIGHT : LOGO_DARK}
                alt="ההיכל"
                className={`w-auto object-contain transition-all duration-500 ${scrolled ? 'h-10' : 'h-16'}`}
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-x-6 flex-1 justify-center">
              {navItems.map((cat) => {
                const subs = getSubcategories(cat.id)
                const hasDropdown = cat.is_parent && subs.length > 0

                if (hasDropdown) {
                  return (
                    <div key={cat.id} className="relative"
                      onMouseEnter={() => handleMouseEnter(cat.id)}
                      onMouseLeave={handleMouseLeave}>
                      <button style={navFont}
                        className={`font-medium transition-colors flex items-center gap-1 whitespace-nowrap
                          ${scrolled ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                        {cat.name}
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {activeDropdown === cat.id && (
                        <div className={`absolute top-full right-0 mt-2 w-56 rounded-md shadow-xl py-2 z-50 border
                          ${scrolled ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100'}`}>
                          {subs.map((sub) => (
                            <Link key={sub.id} to={`/category/${sub.id}`} style={navFont}
                              className={`block px-6 py-3 text-sm transition-colors text-right
                                ${scrolled ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-700 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]'}`}>
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <Link key={cat.id} to={`/category/${cat.id}`} style={navFont}
                    className={`font-medium transition-colors relative group whitespace-nowrap
                      ${scrolled ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                    {cat.name}
                    <span className="absolute -bottom-0.5 right-0 w-0 h-px bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setSearchOpen(!searchOpen)}
                className={`p-3 transition-colors ${scrolled ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
              </button>

              <button onClick={() => setIsCartOpen(true)}
                className={`relative p-3 transition-colors ${scrolled ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {getItemCount() > 0 && (
                  <span className="absolute top-1 left-1 bg-[#D4AF37] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>

              <button onClick={() => setMobileMenuOpen(true)}
                className={`p-3 lg:hidden transition-colors ${scrolled ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-black'}`}>
                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className={`mt-2 px-6 pb-3 border-t ${scrolled ? 'border-white/10' : 'border-gray-100'}`}>
              <div className="max-w-xl mx-auto relative pt-3">
                <input autoFocus type="text" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                  placeholder="חיפוש מוצרים... (לחצו Enter)"
                  style={navFont}
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

      <div className="h-[88px]" />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
              <img src={LOGO_DARK} alt="ההיכל" className="h-10 w-auto" />
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-3">
              {navItems.map((cat) => {
                const subs = getSubcategories(cat.id)
                const hasDropdown = cat.is_parent && subs.length > 0

                if (hasDropdown) {
                  return (
                    <div key={cat.id}>
                      <button onClick={() => setMobileDropdown(mobileDropdown === cat.id ? null : cat.id)}
                        style={navFont}
                        className="w-full flex items-center justify-between font-medium text-gray-700 hover:text-[#D4AF37] transition-colors py-2">
                        {cat.name}
                        <svg className={`w-4 h-4 transition-transform ${mobileDropdown === cat.id ? 'rotate-180' : ''}`}
                          fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {mobileDropdown === cat.id && (
                        <div className="mr-4 space-y-2 mt-2">
                          {subs.map((sub) => (
                            <Link key={sub.id} to={`/category/${sub.id}`}
                              onClick={() => setMobileMenuOpen(false)} style={navFont}
                              className="block text-gray-600 hover:text-[#D4AF37] transition-colors py-1">
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <Link key={cat.id} to={`/category/${cat.id}`}
                    onClick={() => setMobileMenuOpen(false)} style={navFont}
                    className="font-medium text-gray-700 hover:text-[#D4AF37] transition-colors py-2">
                    {cat.name}
                  </Link>
                )
              })}

              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 font-medium text-[#25D366] py-2 mt-2 border-t border-gray-100"
                style={navFont}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                צרו קשר בוואטסאפ
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}