import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import MarketplaceFeed from './components/MarketplaceFeed'
import UserProfile from './components/UserProfile'

export default function App() {
  const { user, signOut } = useAuth()
  const [currentView, setCurrentView] = useState<'feed' | 'profile'>('feed')
  
  // Theme state
  const [isDark, setIsDark] = useState(false)

  // Run once on load to check for saved theme or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Toggle function
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  // The Theme Icon Component (Sun for Light Mode, Moon for Dark Mode)
  const ThemeIcon = () => {
    if (isDark) {
      // Sun Icon (matching your image)
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4 h-4 mr-1.5 transition-transform group-hover:rotate-90 duration-300"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )
    } else {
      // Moon Icon
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4 h-4 mr-1.5 transition-transform group-hover:-rotate-12 duration-300"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )
    }
  }

  // If there is no active session, show the login gateway
  if (!user) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="group flex items-center text-xs font-bold border border-border bg-card text-foreground px-3 py-2 rounded-md hover:bg-muted font-sans shadow-sm transition-all"
          >
            <ThemeIcon />
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
        <Login />
      </div>
    )
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
            
            {/* Theme Toggle Button with Icons */}
            <button
              onClick={toggleTheme}
              className="group flex items-center text-xs font-bold border border-border bg-background text-foreground px-3 py-2 rounded-md hover:bg-muted font-sans shadow-sm transition-all"
            >
              <ThemeIcon />
              <span className="hidden sm:inline">{isDark ? '' : ''}</span>
            </button>

            <button
              onClick={() => setCurrentView(currentView === 'feed' ? 'profile' : 'feed')}
              className="text-xs font-bold border border-border bg-background text-foreground px-4 py-2 rounded-md hover:bg-muted font-sans shadow-sm transition-all"
            >
              {currentView === 'feed' ? 'My Profile' : 'Marketplace'}
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