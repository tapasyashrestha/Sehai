import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-cyan-50 dark:to-cyan-950 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <AlertCircle className="h-24 w-24 text-primary mx-auto mb-6" />
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
                <p className="text-muted-foreground mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                >
                    <Home className="h-5 w-5" />
                    Back to Home
                </Link>
            </div>
        </div>
    )
}
