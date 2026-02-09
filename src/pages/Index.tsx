import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Mic, Heart, CheckCircle, Globe, Moon, Sun } from 'lucide-react'

export default function Index() {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-cyan-50 dark:to-cyan-950">
            {/* Navigation */}
            <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <Activity className="h-8 w-8 text-primary" />
                            <span className="font-bold text-xl">SEHAI</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link to="#about" className="text-sm hover:text-primary transition-colors hidden sm:inline">
                                About
                            </Link>
                            <Link to="#contact" className="text-sm hover:text-primary transition-colors hidden sm:inline">
                                Contact
                            </Link>
                            <Link to="/help" className="text-sm hover:text-primary transition-colors hidden sm:inline">
                                Help & Support
                            </Link>
                            <Link
                                to="/login"
                                className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
                            >
                                Sign Up
                            </Link>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md hover:bg-accent transition-colors"
                                aria-label="Toggle theme"
                            >
                                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 md:py-32">
                <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                        AI-Powered Voice Assistant
                        <br />
                        for <span className="text-gradient">Rural Healthcare</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Empowering healthcare workers across India with intelligent, voice-enabled digital tools
                        for better patient care and seamless referral management.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/login"
                            className="px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="#features"
                            className="px-8 py-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all font-medium text-lg"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-xl bg-card border hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up">
                        <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center mb-4">
                            <Mic className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Voice-Enabled</h3>
                        <p className="text-muted-foreground">
                            Speak symptoms in local languages - AI understands and assists
                        </p>
                    </div>

                    <div className="p-6 rounded-xl bg-card border hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                            <Heart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Smart Triage</h3>
                        <p className="text-muted-foreground">
                            AI-driven symptom analysis for accurate initial assessment
                        </p>
                    </div>

                    <div className="p-6 rounded-xl bg-card border hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Seamless Referrals</h3>
                        <p className="text-muted-foreground">
                            Easy escalation from Sub-Centre to PHC to CHC
                        </p>
                    </div>

                    <div className="p-6 rounded-xl bg-card border hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                            <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Multilingual</h3>
                        <p className="text-muted-foreground">
                            Support for English, Hindi, and regional languages
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t mt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © 2024 SEHAI - Improving Rural Healthcare Access
                        </p>
                        <div className="flex gap-6">
                            <Link to="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                About
                            </Link>
                            <Link to="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Contact
                            </Link>
                            <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Help & Support
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
