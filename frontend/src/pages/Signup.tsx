import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, Moon, Sun, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Signup() {
    const navigate = useNavigate()
    const { signUp, signOut, session, profile } = useAuth()
    const [isDark, setIsDark] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        facilityName: '',
        password: '',
        confirmPassword: '',
    })
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const isDarkMode = localStorage.getItem('theme') === 'dark'
        setIsDark(isDarkMode)
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        }
    }, [])

    // Redirect if already logged in with a profile
    useEffect(() => {
        if (session && profile) {
            console.log('[Signup] Already logged in, redirecting to dashboard:', profile.role)
            navigate(`/${profile.role}-dashboard`, { replace: true })
        }
    }, [session, profile, navigate])

    const toggleTheme = () => {
        const newTheme = !isDark
        setIsDark(newTheme)
        if (newTheme) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!')
            return
        }

        if (!formData.role) {
            setError('Please select a role')
            return
        }

        setLoading(true)
        console.log('[Signup] Starting signup for:', formData.email)

        try {
            // Clear any stale session first (with a timeout so it doesn't hang)
            console.log('[Signup] Clearing old session...')
            await Promise.race([
                signOut(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('signOut timeout')), 2000))
            ]).catch(() => console.warn('[Signup] signOut timed out, continuing anyway'))

            // Small delay to let auth state settle
            await new Promise(r => setTimeout(r, 300))

            console.log('[Signup] Calling signUp...')
            const { error, data } = await signUp(formData.email, formData.password, {
                full_name: formData.name,
                role: formData.role,
                facility_name: formData.facilityName,
            })

            console.log('[Signup] signUp returned:', error ? error.message : 'success')

            if (error) {
                setError(error.message)
                setLoading(false)
            } else if (data?.user?.identities && data.user.identities.length === 0) {
                setError('An account with this email already exists. Please login instead.')
                setLoading(false)
            } else {
                console.log('[Signup] Success! Waiting for redirect...')
                // The onAuthStateChange will fetch profile, then the useEffect will redirect.
                // Safety timeout:
                setTimeout(() => {
                    setLoading(prev => {
                        if (prev) {
                            console.warn('[Signup] Timed out waiting for redirect')
                            setError('Account created successfully! Please go to the Login page to sign in.')
                            return false
                        }
                        return prev
                    })
                }, 5000)
            }
        } catch (err: any) {
            console.error('[Signup] Exception:', err)
            setError(err.message || 'An unexpected error occurred')
            setLoading(false)
        }
    }

    const roles = [
        { value: 'anm', label: 'ANM (Sub-Centre)' },
        { value: 'phc', label: 'PHC Doctor' },
        { value: 'chc', label: 'CHC Specialist' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-background to-blue-50 dark:from-cyan-950 dark:via-background dark:to-blue-950 flex items-center justify-center p-4">
            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 p-3 rounded-full bg-card border shadow-lg hover:shadow-xl transition-all z-50"
                aria-label="Toggle theme"
            >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="w-full max-w-md">
                <div className="bg-card border rounded-2xl shadow-2xl p-8 animate-slide-up">
                    <div className="flex flex-col items-center mb-8">
                        <Activity className="h-12 w-12 text-primary mb-3" />
                        <h2 className="text-2xl font-bold">SEHAI</h2>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                        <p className="text-muted-foreground">Join SEHAI to get started</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                autoComplete="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium mb-2">Role</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    id="role"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full px-4 py-3 rounded-lg border bg-background text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <span className={formData.role ? 'text-foreground' : 'text-muted-foreground'}>
                                        {formData.role ? roles.find(r => r.value === formData.role)?.label : 'Select role'}
                                    </span>
                                    <ChevronDown className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute w-full mt-2 bg-card border rounded-lg shadow-lg z-10 overflow-hidden animate-slide-down">
                                        {roles.map((r) => (
                                            <button
                                                key={r.value}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, role: r.value })
                                                    setIsDropdownOpen(false)
                                                }}
                                                className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors ${formData.role === r.value ? 'bg-cyan-50 dark:bg-cyan-900/30 text-primary' : ''}`}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="facilityName" className="block text-sm font-medium mb-2">Facility Name</label>
                            <input
                                type="text"
                                id="facilityName"
                                value={formData.facilityName}
                                onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Ramnagar Sub-Centre"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Create a password (min 6 characters)"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                autoComplete="new-password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl mt-6 disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <Link to="/login" className="text-primary hover:underline block">
                            Already have an account? Login
                        </Link>
                        <Link to="/" className="text-muted-foreground hover:text-foreground text-sm block">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
