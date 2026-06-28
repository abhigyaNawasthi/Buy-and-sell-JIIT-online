import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Listing {
  id: string
  title: string
  price: number
  description: string
  whatsapp_number: string
  category: string
  image_url: string | null
  created_at: string
}

export default function MarketplaceFeed() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching listings:', error.message)
    } else {
      setListings(data || [])
    }
    setLoading(false)
  }

  const filteredListings = categoryFilter === 'All' 
    ? listings 
    : listings.filter(item => item.category === categoryFilter)

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground font-mono">Loading active listings...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 font-sans">
      {/* Dynamic Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {['All', 'Textbooks', 'Electronics', 'Campus Essentials', 'Others'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all border shadow-sm ${
              categoryFilter === cat
                ? 'bg-primary text-primary-foreground border-ring'
                : 'bg-card text-foreground border-border hover:bg-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Item Feed Grid/List */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card">
          <p className="text-muted-foreground font-medium">No items listed in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((item) => (
            <div 
              key={item.id} 
              className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col sm:flex-row gap-4 hover:border-ring transition-all duration-200"
            >
              {/* Product Thumbnail Container */}
              <div className="w-full sm:w-32 h-32 bg-background border border-border rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-xs font-mono">NO IMAGE</span>
                )}
              </div>

              {/* Item Metadata Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-foreground text-xl tracking-tight">{item.title}</h3>
                    <span className="text-xl font-black text-foreground font-mono">₹{item.price}</span>
                  </div>
                  
                  {/* Category Badge */}
                  <span className="inline-block text-xs font-bold tracking-wide bg-accent text-accent-foreground border border-border px-2.5 py-0.5 rounded-md mt-1 font-mono">
                    {item.category}
                  </span>
                  
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-2 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>

                {/* Secure External Action Handlers */}
                <div className="mt-4 sm:mt-0 flex justify-end">
                  <a
                    href={`https://wa.me/${item.whatsapp_number.replace(/\D/g, '')}?text=Hi,%20I'm%20interested%20in%20buying%20your%20${encodeURIComponent(item.title)}%20listed%20on%20JIIT%20Buy%20%26%20Sell.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center bg-primary text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-md border border-ring shadow transition-all hover:opacity-95 flex items-center justify-center gap-2 active:scale-95"
                  >
                    Contact Seller
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}