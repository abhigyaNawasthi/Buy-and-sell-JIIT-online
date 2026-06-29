import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import MarketplaceFeed from './components/MarketplaceFeed'
import UserProfile from './components/UserProfile'

export default function App() {
  const { user, signOut } = useAuth()
  const [currentView, setCurrentView] = useState<'feed' | 'profile'>('feed')

  // If there is no active session, show the login gateway
  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      
      {/* Vintage Header Navigation Bar */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo / App Brand Name */}
          <div 
            onClick={() => setCurrentView('feed')} 
            className="cursor-pointer flex flex-col items-start"
          >
            <h1 className="text-2xl font-black tracking-tighter text-foreground font-sans">
              Buy & Sell JIIT
            </h1>
            <span className="text-[10px] font-mono font-bold text-muted-foreground tracking-wider uppercase">
              Logged in as: {user.email?.split('@')[0]}
            </span>
          </div>

          {/* Navigation Controllers */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView(currentView === 'feed' ? 'profile' : 'feed')}
              className="text-xs font-bold border border-border bg-background text-foreground px-4 py-2 rounded-md hover:bg-muted font-sans shadow-sm transition-all"
            >
              {currentView === 'feed' ? 'My Profile' : 'Browse Marketplace'}
            </button>

            <button
              onClick={signOut}
              className="text-xs font-bold bg-primary text-primary-foreground border border-ring px-4 py-2 rounded-md hover:opacity-90 font-sans shadow-sm transition-all"
            >
              Log Out
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Layout Container */}
      <main className="py-6 max-w-4xl mx-auto">
        {currentView === 'feed' ? (
          <MarketplaceFeed />
        ) : (
          <UserProfile />
        )}
      </main>

    </div>
  )
}