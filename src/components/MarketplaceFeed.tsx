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
  
  // Password setting states
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  
  // Check if the user already configured a password previously
  const [hasPasswordAlready, setHasPasswordAlready] = useState(true) 

  useEffect(() => {
    fetchListings()
    checkUserPasswordStatus()
  }, [])

  const checkUserPasswordStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const hasPass = user.user_metadata?.has_password
      const createdAt = new Date(user.created_at).getTime()
      const now = new Date().getTime()
      
      // Calculate how many hours ago the account was created
      const hoursOld = (now - createdAt) / (1000 * 60 * 60)

      // Show banner ONLY if they have no password AND the account is less than 72 hours old
      if (!hasPass && hoursOld < 72) {
        setHasPasswordAlready(false)
      } else {
        // For old users (older than 72h) or users who already set a password, keep it hidden
        setHasPasswordAlready(true)
      }
    }
  }

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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordStatus('Password must be at least 6 characters.')
      return
    }

    setPasswordLoading(true)
    setPasswordStatus('')

    // 1. Update the password AND store a custom metadata flag at the same time
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { has_password: true } 
    })

    if (error) {
      setPasswordStatus(`Error: ${error.message}`)
    } else {
      setPasswordStatus('Permanent password set successfully!')
      setNewPassword('')
      // 2. Hide the entire banner block gracefully
      setTimeout(() => {
        setHasPasswordAlready(true)
        setShowPasswordForm(false)
      }, 2000)
    }
    setPasswordLoading(false)
  }

  const filteredListings = categoryFilter === 'All' 
    ? listings 
    : listings.filter(item => item.category === categoryFilter)

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground font-mono">Loading active listings...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 font-sans">
      
      {/* Permanent Password Setup Banner - Only shows if user hasn't set one yet and is new */}
      {!hasPasswordAlready && (
        <div className="mb-6 bg-card border border-border rounded-lg p-4 shadow-sm">
          {!showPasswordForm ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-foreground text-sm">Tired of logging in with email links?</h4>
                <p className="text-xs text-muted-foreground">Set a permanent password for instant login next time.</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-xs font-bold bg-primary text-primary-foreground border border-ring px-3 py-1.5 rounded-md hover:opacity-90 transition-all self-start sm:self-center"
              >
                Set Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1 text-left w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">
                    Create Permanent Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full px-3 py-2 bg-background text-foreground text-sm rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 sm:flex-none text-xs font-bold bg-primary text-primary-foreground border border-ring px-4 py-2 rounded-md hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground"
                  >
                    {passwordLoading ? 'Saving...' : 'Save Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowPasswordForm(false); setPasswordStatus(''); }}
                    className="text-xs font-bold border border-border bg-background text-foreground px-3 py-2 rounded-md hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {passwordStatus && (
                <p className="text-xs font-mono font-medium text-foreground bg-accent border border-border p-2 rounded mt-1">
                  {passwordStatus}
                </p>
              )}
            </form>
          )}
        </div>
      )}

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
              <div className="w-full sm:w-32 h-32 bg-background border border-border rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-xs font-mono">NO IMAGE</span>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-foreground text-xl tracking-tight">{item.title}</h3>
                    <span className="text-xl font-black text-foreground font-mono">₹{item.price}</span>
                  </div>
                  
                  <span className="inline-block text-xs font-bold tracking-wide bg-accent text-accent-foreground border border-border px-2.5 py-0.5 rounded-md mt-1 font-mono">
                    {item.category}
                  </span>
                  
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-2 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>

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