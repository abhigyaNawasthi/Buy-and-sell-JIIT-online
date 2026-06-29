import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) { return twMerge(clsx(inputs)) }

// --- REUSABLE DROPDOWN COMPONENTS FROM EMERALD-UI ---
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variant === "outline" ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" :
      variant === "ghost" ? "hover:bg-accent hover:text-accent-foreground" :
      variant === "link" ? "text-primary underline-offset-4 hover:underline" :
      "bg-primary text-primary-foreground hover:bg-primary/90",
      size === "sm" ? "h-9 px-3" : size === "lg" ? "h-11 px-8" : size === "icon" ? "h-10 w-10" : "h-10 px-4 py-2",
      className
    )} {...props} />
  )
);
Button.displayName = "Button";

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) handler()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, handler])
}

interface DropdownItem {
  name: string
  value: string
}

interface FormDropdownProps {
  items: DropdownItem[]
  selectedValue: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const OnClickOutside: React.FC<{ children: React.ReactNode; onClickOutside: () => void; classes?: string }> = ({ children, onClickOutside, classes }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  useClickOutside(wrapperRef, onClickOutside)
  return <div ref={wrapperRef} className={cn(classes)}>{children}</div>
}

function FormDropdown({ items, selectedValue, onChange, placeholder = 'Select Option', disabled, className }: FormDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentLabel = items.find(item => item.value === selectedValue)?.name || placeholder

  return (
    <OnClickOutside onClickOutside={() => setIsOpen(false)} classes="w-full">
      <div data-state={isOpen ? 'open' : 'closed'} className={cn('group relative inline-block w-full', className)}>
        <Button
          type="button"
          variant='outline'
          aria-haspopup='listbox'
          aria-expanded={isOpen}
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between bg-background text-foreground border border-input h-10 px-3 py-2 text-sm text-left font-normal"
        >
          <span>{currentLabel}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ChevronDown className='h-4 w-4 opacity-50' />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              role='listbox'
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'absolute top-[calc(100%+0.25rem)] left-0 z-50 w-full',
                'overflow-hidden rounded-md border border-input',
                'bg-popover text-popover-foreground shadow-md max-h-60 overflow-y-auto'
              )}
            >
              <motion.div initial='hidden' animate='visible' variants={{ visible: { transition: { staggerChildren: 0.02 } } }}>
                {items.map((item, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => {
                      onChange(item.value)
                      setIsOpen(false)
                    }}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    className={cn(
                      'flex w-full px-3 py-2 text-sm text-left',
                      'hover:bg-accent hover:text-accent-foreground transition-colors duration-150',
                      selectedValue === item.value ? 'bg-accent font-medium' : 'bg-transparent'
                    )}
                  >
                    {item.name}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnClickOutside>
  )
}

// --- MAIN PROFILE COMPONENT WITH FORM DROPDOWNS ---
interface ProfileData {
  name: string
  batch: string
  branch: string
  year: string
  gender: string
  last_password_change?: string | null
  last_profile_change?: string | null
}

export default function UserProfile() {
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    batch: '',
    branch: '',
    year: '',
    gender: '',
    last_password_change: null,
    last_profile_change: null
  })
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')

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
          .select('name, batch, branch, year, gender, last_password_change, last_profile_change')
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

  const getDaysRemaining = (lastChangeDateStr: string | null | undefined, cooldownDays: number) => {
    if (!lastChangeDateStr) return 0
    const lastChange = new Date(lastChangeDateStr).getTime()
    const now = new Date().getTime()
    const msPassed = now - lastChange
    const msRequired = cooldownDays * 24 * 60 * 60 * 1000
    
    if (msPassed < msRequired) {
      const msLeft = msRequired - msPassed
      return Math.ceil(msLeft / (1000 * 60 * 60 * 24))
    }
    return 0
  }

  const profileDaysLeft = getDaysRemaining(profile.last_profile_change, 7)
  const passwordDaysLeft = getDaysRemaining(profile.last_password_change, 30)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (profileDaysLeft > 0) {
      setMessage(`Security lock active. You can modify your campus identity profile details in ${profileDaysLeft} days.`)
      return
    }

    try {
      setUpdating(true)
      setMessage('')
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const currentTime = new Date().toISOString()
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email, 
            ...profile,
            last_profile_change: currentTime,
            updated_at: currentTime
          })

        if (error) throw error
        setMessage('Profile details updated successfully! Locked for 7 days.')
        setProfile(prev => ({ ...prev, last_profile_change: currentTime }))
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
    if (passwordDaysLeft > 0) {
      setPasswordMessage(`Security lock active. You cannot change your password again for ${passwordDaysLeft} days.`)
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters.')
      return
    }

    try {
      setPasswordLoading(true)
      setPasswordMessage('')
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error("No authenticated session found.")

      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
        data: { has_password: true }
      })

      if (authError) throw authError

      const currentTime = new Date().toISOString()
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          last_password_change: currentTime
        })

      if (dbError) throw dbError

      setPasswordMessage('Password updated successfully! Locked for 30 days.')
      setProfile(prev => ({ ...prev, last_password_change: currentTime }))
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
      <p className="text-xs text-muted-foreground mb-4 font-mono">Manage your marketplace identity & details</p>

      <div className="mb-6 p-3 bg-accent/60 border border-border rounded-md text-xs text-muted-foreground leading-relaxed">
         <span className="font-bold text-foreground">Anti-Scam Policy:</span> To protect campus buyers, name changes are restricted to <span className="font-bold text-foreground">once every 7 days</span>. Please ensure your identity matches your active JIIT credentials.
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Full Name</label>
          <input
            type="text"
            value={profile.name || ''}
            disabled={profileDaysLeft > 0}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Abhigya Awasthi"
            className="w-full px-3 py-2 bg-background text-foreground text-sm rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Branch</label>
            <FormDropdown
              items={[
                { name: 'CSE', value: 'CSE' },
                { name: 'IT', value: 'IT' },
                { name: 'ECE', value: 'ECE' },
                { name: 'Integrated CSE', value: 'Integrated cse' }
              ]}
              selectedValue={profile.branch}
              disabled={profileDaysLeft > 0}
              onChange={(val) => setProfile({ ...profile, branch: val })}
              placeholder="Select Branch"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Batch Sector</label>
            <input
              type="text"
              value={profile.batch || ''}
              disabled={profileDaysLeft > 0}
              onChange={(e) => setProfile({ ...profile, batch: e.target.value })}
              placeholder="e.g. F3 / F4"
              className="w-full px-3 py-2 bg-background text-foreground text-sm rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Academic Year</label>
            <FormDropdown
              items={[
                { name: '1st Year', value: '1st Year' },
                { name: '2nd Year', value: '2nd Year' },
                { name: '3rd Year', value: '3rd Year' },
                { name: '4th Year', value: '4th Year' }
              ]}
              selectedValue={profile.year}
              disabled={profileDaysLeft > 0}
              onChange={(val) => setProfile({ ...profile, year: val })}
              placeholder="Select Year"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Gender</label>
            <FormDropdown
              items={[
                { name: 'Male', value: 'Male' },
                { name: 'Female', value: 'Female' },
                { name: 'Other', value: 'Other' }
              ]}
              selectedValue={profile.gender}
              disabled={profileDaysLeft > 0}
              onChange={(val) => setProfile({ ...profile, gender: val })}
              placeholder="Select Gender"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updating || profileDaysLeft > 0}
          className="w-full text-center bg-primary text-primary-foreground font-bold text-sm px-4 py-2.5 rounded-md border border-ring shadow hover:opacity-95 transition-all disabled:opacity-50"
        >
          {profileDaysLeft > 0 ? `Profile Locked (${profileDaysLeft}d left)` : updating ? 'Saving Changes...' : 'Save Profile Particulars'}
        </button>

        {message && (
          <p className="text-xs font-mono font-medium text-foreground bg-accent border border-border p-2 rounded">
            {message}
          </p>
        )}
      </form>

      <hr className="my-6 border-border" />

      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <h3 className="font-bold text-foreground text-base tracking-tight">Security Credentials</h3>
        
        <div className="p-3 bg-accent/60 border border-border rounded-md text-xs text-muted-foreground leading-relaxed">
           <span className="font-bold text-foreground">Password Lock Rule:</span> To maintain account security, you can only refresh your password <span className="font-bold text-foreground">once a month (every 30 days)</span>. Once reset, the value cannot be modified until the month expires.
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-mono">Update Account Password</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              disabled={passwordDaysLeft > 0}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={passwordDaysLeft > 0 ? `Locked for ${passwordDaysLeft} more days` : "Enter fresh password"}
              className="flex-1 px-3 py-2 bg-background text-foreground text-sm rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={passwordLoading || !newPassword || passwordDaysLeft > 0}
              className="bg-card text-foreground border border-border text-xs font-bold px-4 py-2 rounded-md hover:bg-muted disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : passwordDaysLeft > 0 ? 'Locked' : 'Update'}
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