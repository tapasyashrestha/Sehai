import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, Moon, Sun, ChevronDown } from 'lucide-react'
import { useEffect } from 'react'

export default function Login() {
    const navigate = useNavigate()
    const [isDark, setIsDark] = useState(false)
    const [role, setRole] = useState('')
    const [password, setPassword] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    useEffect(() => {
        const isDarkMode = localStorage.getItem('theme') === 'dark'
        setIsDark(isDarkMode)
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        }
    }, [])

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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        // Simple demo authentication
        if (role && password) {
            localStorage.setItem('user', JSON.stringify({ role, password }))

            // Navigate based on role
            switch (role) {
                case 'anm':
                    navigate('/anm-dashboard')
                    break
                case 'phc':
                    navigate('/phc-dashboard')
                    break
                case 'chc':
                    navigate('/chc-dashboard')
                    break
                default:
                    navigate('/anm-dashboard')
            }
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
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <Activity className="h-12 w-12 text-primary mb-3" />
                        <h2 className="text-2xl font-bold">SEHAI</h2>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-muted-foreground">Login to access your dashboard</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selection */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium mb-2">
                                Role
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full px-4 py-3 rounded-lg border bg-background text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <span className={role ? 'text-foreground' : 'text-muted-foreground'}>
                                        {role ? roles.find(r => r.value === role)?.label : 'Select role'}
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
                                                    setRole(r.value)
                                                    setIsDropdownOpen(false)
                                                }}
                                                className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors ${role === r.value ? 'bg-cyan-50 dark:bg-cyan-900/30 text-primary' : ''
                                                    }`}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Login
                        </button>
                    </form>

                    {/* Footer Links */}
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
