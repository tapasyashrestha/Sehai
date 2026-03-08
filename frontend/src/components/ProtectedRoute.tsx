import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: ('anm' | 'phc' | 'chc')[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { session, profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!session) return <Navigate to="/login" replace />

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        return <Navigate to={`/${profile.role}-dashboard`} replace />
    }

    return <>{children}</>
}
