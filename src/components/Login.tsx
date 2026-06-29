import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [usePassword, setUsePassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.endsWith('@mail.jiit.ac.in') && !email.endsWith('@jiit.ac.in')) {
      alert('Unauthorized: You must use a valid JIIT student email.')
      return
    }

    setLoading(true)
    setMessage('')
    
    if (usePassword) {
      // Direct Password Login (Bypasses email rate limits completely)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setMessage(`Error: ${error.message}`)
      setLoading(false)
    } else {
      // Magic Link Login
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      })
      if (error) {
        setMessage(`Error: ${error.message}. Try switching to Password Login below!`)
      } else {
        setMessage('Success! Check your JIIT email for your secure login link.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-md w-full bg-card rounded-lg border border-border p-8 text-center shadow-md">
        
        <h1 className="text-3xl font-black tracking-tight font-serif text-foreground mb-2">
          Buy & Sell JIIT
        </h1>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          The local campus marketplace.<br />
          <span className="font-mono text-xs font-bold uppercase tracking-wider bg-accent text-accent-foreground border border-border px-1.5 py-0.5 rounded mt-1 inline-block">
            For JIIT Noida
          </span>
        </p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 font-mono">
             Enter Student Email Address (For New Users)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" eg. 2501030085@mail.jiit.ac.in"
              required
              className="w-full px-4 py-3 bg-background text-foreground font-medium rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground/60 text-base"
            />
          </div>

          {usePassword && (
            <div className="text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 font-mono">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required={usePassword}
                className="w-full px-4 py-3 bg-background text-foreground font-medium rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-base"
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground border border-ring font-bold py-3 px-4 rounded-md shadow-sm transition-all hover:opacity-95 active:scale-95 disabled:bg-muted disabled:text-muted-foreground"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            ) : (
              usePassword ? 'Log In' : 'Send Login Link'
            )}
          </button>
        </form>

        {/* Toggle Mode Switch */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setUsePassword(!usePassword)}
            className="text-xs font-mono text-muted-foreground hover:text-foreground underline decoration-dotted"
          >
            {usePassword ? "New User? Switch to Magic Link Email Login" : "Old User? Switch to  Password Login"}
          </button>
        </div>

        {message && (
          <div className="mt-6 p-4 rounded-md bg-accent text-accent-foreground text-sm font-medium border border-border text-left leading-relaxed break-words">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}