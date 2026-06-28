import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import MarketplaceFeed from './components/MarketplaceFeed';

function MainApp() {
  const { user, loading, signOut } = useAuth();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center transition-colors duration-300">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium text-sm tracking-wide">Loading JIIT Buy & Sell...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased transition-colors duration-300">
      {/* Navbar Header using your custom Card and Border colors */}
      <header className="bg-card/90 border-b border-border sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl font-serif">
            Buy & Sell JIIT
          </h1>
          <p className="text-[11px] font-medium text-muted-foreground mt-0.5 sm:text-xs">
            Logged in as <span className="text-foreground font-semibold">{user.email}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Light/Dark Mode Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all active:scale-95"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M4.22 19.78l1.58-1.58M18.22 5.78l1.58-1.58M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <button 
            onClick={signOut}
            className="text-xs font-semibold text-primary-foreground border border-border px-4 py-2 rounded-xl bg-primary hover:opacity-90 shadow-sm transition-all active:scale-95"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="py-6 sm:py-10">
        <MarketplaceFeed />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}