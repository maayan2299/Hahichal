import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function InstagramGallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const instagramHandle = 'hahiechal_judaica'

  // כתובת ה-Storage שלך (וודא שזה ה-Project ID הנכון שלך)
  const STORAGE_URL = "https://taewbxptprdixsusvjfh.supabase.co/storage/v1/object/public/instagram/";

  useEffect(() => {
    async function fetchImages() {
      try {
        const { data, error } = await supabase
          .from('instagram')
          .select('image_url')
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) throw error;
        setImages(data || []);
      } catch (err) {
        console.error('Error loading instagram images:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, [])

  if (loading || images.length === 0) return null;

  return (
    <section className="py-16 bg-[#FAFAFA]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] uppercase font-semibold mb-2" style={{ color: '#CFAA52' }}>עקבו אחרינו</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>Instagram</h2>
          <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer" className="text-sm tracking-[0.3em] uppercase font-semibold hover:opacity-70 transition-opacity" style={{ color: '#CFAA52' }}>
            @{instagramHandle}
          </a>
          <div className="h-px w-12 mx-auto mt-3" style={{ backgroundColor: '#A0801E' }} />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {images.map((img, i) => (
            <div key={i} className="aspect-square overflow-hidden bg-gray-100 rounded-sm">
              {/* כאן התיקון: הוספת ה-STORAGE_URL לפני שם הקובץ */}
              <img 
                src={img.image_url.startsWith('http') ? img.image_url : `${STORAGE_URL}${img.image_url}`} 
                alt="Instagram" 
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}