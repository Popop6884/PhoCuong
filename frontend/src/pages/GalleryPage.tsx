import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { galleryApi } from '../api/client'
import { getImageUrl } from '../utils/image'

const categories = [
  { value: '', label: 'Tất cả' },
  { value: 'food', label: 'Ẩm thực' },
  { value: 'restaurant', label: 'Không gian' },
  { value: 'event', label: 'Sự kiện' },
]

export default function GalleryPage() {
  const [cat, setCat] = useState('')
  const [selected, setSelected] = useState<any>(null)

  const { data: items, isLoading } = useQuery({
    queryKey: ['gallery', cat],
    queryFn: () => galleryApi.getAll({ category: cat || undefined }).then(r => r.data),
  })

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="section-subtitle">Ảnh thực tế</div>
          <h1 className="section-title">Bộ Sưu Tập Hình Ảnh</h1>
          <div className="gold-divider max-w-xs mx-auto mt-4">✦</div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCat(c.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                cat === c.value
                  ? 'bg-brand-gold text-brand-brown border-brand-gold'
                  : 'border-brand-gold/30 text-brand-cream/60 hover:border-brand-gold hover:text-brand-gold'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-lg animate-pulse bg-brand-brown-light h-48 w-full" />
            ))}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {(items || []).map((item: any) => (
              <div
                key={item.ID}
                className="overflow-hidden rounded-lg cursor-pointer group relative break-inside-avoid"
                onClick={() => setSelected(item)}
              >
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/40 transition-all duration-300 flex items-end p-3">
                  <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity text-shadow">
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setSelected(null)}
          >
            <X size={32} />
          </button>
          <div className="max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={getImageUrl(selected.image_url)} alt={selected.title} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            {selected.title && (
              <div className="text-center text-brand-gold mt-3 font-serif text-lg">{selected.title}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
