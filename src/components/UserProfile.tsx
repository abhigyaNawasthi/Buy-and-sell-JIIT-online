import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface ProfileData {
  name: string
  batch: string
  branch: string
  year: string
  gender: string
}

export default function UserProfile() {
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    batch: '',
    branch: '',
    year: '',
    gender: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')

  // Password Update States
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, batch, branch, year, gender')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        if (data) setProfile(data)
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setUpdating(true)
      setMessage('')
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // We pass the email along with the profile state to satisfy the database constraint
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email, 
            ...profile,
            updated_at: new Date().toISOString()
          })

        if (error) throw error
        setMessage('Profile details updated successfully!')
      }
    } catch (err: any) {
      console.error("Database Error:", err.message)
      setMessage("Oops! We couldn't save your profile details. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters.')
      return
    }

    try {
      setPasswordLoading(true)
      setPasswordMessage('')
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: { has_password: true }
      })

      if (error) throw error
      setPasswordMessage('Password changed securely!')
      setNewPassword('')
    } catch (err: any) {
      setPasswordMessage(`Error: ${err.message}`)
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-6 font-mono text-muted-foreground text-sm">Loading credentials...</div>
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-card border border-border rounded-lg shadow-sm font-sans text-left mt-4">
      <h2 className="text-2xl font-black text-foreground tracking-tight mb-1">Campus Profile</h2>
      <p className="text-xs text-muted-foreground mb-6 font-mono">Manage your marketplace identity & details</p>

      {/* Profile Info Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Full Name</label>
          <input
            type="text"
            value={profile.name || ''}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Abhigya Awasthi"
            className="w-full px-3 py-2 bg-background text-foreground text-sm rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Branch</label>
            <select
              value={profile.branch || ''}
              onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
              className="w-full px-3 py-2 bg-background text-foreground text-sm rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Select Branch</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="Integrated cse">Integrated CSE</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Batch Sector</label>
            <input
              type="text"
              value={profile.batch || ''}
              onChange={(e) => setProfile({ ...profile, batch: e.target.value })}
              placeholder="e.g. F3 / F4"
              className="w-full px-3 py-2 bg-background text-foreground text-sm rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Academic Year</label>
            <select
              value={profile.year || ''}
              onChange={(e) => setProfile({ ...profile, year: e.target.value })}
              className="w-full px-3 py-2 bg-background text-foreground text-sm rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Gender</label>
            <select
              value={profile.gender || ''}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="w-full px-3 py-2 bg-background text-foreground text-sm rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full text-center bg-primary text-primary-foreground font-bold text-sm px-4 py-2.5 rounded-md border border-ring shadow hover:opacity-95 transition-all disabled:opacity-50"
        >
          {updating ? 'Saving Changes...' : 'Save Profile Particulars'}
        </button>

        {message && (
          <p className="text-xs font-mono font-medium text-foreground bg-accent border border-border p-2 rounded">
            {message}
          </p>
        )}
      </form>

      <hr className="my-6 border-border" />

      {/* Security Update Password Block */}
      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <h3 className="font-bold text-foreground text-base tracking-tight">Security Credentials</h3>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Update Account Password</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter fresh password"
              className="flex-1 px-3 py-2 bg-background text-foreground text-sm rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={passwordLoading || !newPassword}
              className="bg-card text-foreground border border-border text-xs font-bold px-4 py-2 rounded-md hover:bg-muted disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
        {passwordMessage && (
          <p className="text-xs font-mono font-medium text-foreground bg-accent border border-border p-2 rounded">
            {passwordMessage}
          </p>
        )}
      </form>
    </div>
  )
}