import { ReactNode, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardLayoutProps {
    children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const navigate = useNavigate()
    const { profile, signOut } = useAuth()
    const [isDark, setIsDark] = useState(false)

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

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const roleLabels: Record<string, string> = {
        anm: 'ANM',
        phc: 'PHC Doctor',
        chc: 'CHC Specialist',
    }

    const userName = profile?.full_name || 'User'
    const userRole = profile ? `${roleLabels[profile.role] || profile.role}${profile.facility_name ? ` - ${profile.facility_name}` : ''}` : ''

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
            {/* Navigation */}
            <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <Activity className="h-8 w-8 text-primary" />
                            <div>
                                <span className="font-bold text-lg">SEHAI</span>
                                <p className="text-xs text-muted-foreground">{userRole}</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="font-medium">{userName}</p>
                                <p className="text-xs text-muted-foreground">{userRole}</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md hover:bg-accent transition-colors"
                                aria-label="Toggle theme"
                            >
                                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
    )
}
