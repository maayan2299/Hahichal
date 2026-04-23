import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ProductCard from './ProductCard'

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`*, images:product_images(image_url, is_primary)`)
          .eq('is_featured', true)
          .eq('is_active', true)
          .order('display_order')
          .limit(12)
        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error('Error fetching featured products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  if (loading) return null

  return (
    <section className="py-6 md:py-16" dir="rtl">
      <div className="text-center mb-4 md:mb-12 px-4">
        <h2
          className="text-2xl md:text-6xl text-[#2D2420] flex items-center justify-center gap-2"
          style={{ fontFamily: "'Shofar', serif", fontWeight: 'normal' }}
        >
          <span>המיוחדים שלנו</span>
          <span className="text-black text-xl md:text-3xl">♥</span>
        </h2>
        <div className="w-16 md:w-24 h-0.5 bg-[#D4AF37] mx-auto mt-2 md:mt-4 opacity-30"></div>
      </div>

      <div className="overflow-x-auto scrollbar-hide px-4">
        <div className="flex gap-4 pb-2">
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[180px] md:w-[260px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}