import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
    const navigate = useNavigate()
    const { signIn, profile, session, loading: authLoading } = useAuth()
    const [isDark, setIsDark] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
            console.log('[Login] Redirecting to dashboard:', profile.role)
            setLoading(false)
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
        setLoading(true)

        console.log('[Login] Attempting login for:', email)
        const { error } = await signIn(email, password)

        if (error) {
            console.error('[Login] Error:', error.message)
            setError(error.message)
            setLoading(false)
        } else {
            console.log('[Login] Sign in successful, waiting for profile...')
            // The onAuthStateChange listener will fetch the profile and trigger the useEffect redirect above.
            // Safety timeout in case something goes wrong:
            setTimeout(() => {
                setLoading(prev => {
                    if (prev) {
                        setError('Login succeeded but profile could not be loaded. Try signing up with a new account.')
                        return false
                    }
                    return prev
                })
            }, 5000)
        }
    }

    // Show a loading spinner while AuthProvider is initializing
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

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
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-muted-foreground">Login to access your dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <Link to="/signup" className="text-primary hover:underline block">
                            Don't have an account? Sign up
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
