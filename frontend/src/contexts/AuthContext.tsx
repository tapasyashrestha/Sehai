import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface Profile {
    id: string
    email: string
    full_name: string
    role: 'anm' | 'phc' | 'chc'
    facility_name: string
    facility_location: string
    phone: string | null
}

export interface User {
    id: string
    email?: string
}

export interface Session {
    access_token: string
    user: User
}

interface AuthContextType {
    session: Session | null
    user: User | null
    profile: Profile | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string, metadata: {
        full_name: string; role: string; facility_name?: string
    }) => Promise<{ data?: any, error: Error | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('sehai_token')
        if (!token) {
            setLoading(false)
            return
        }

        console.log('[Auth] Found token, loading user profile...')
        fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {
            if (!res.ok) throw new Error('Session expired')
            return res.json()
        })
        .then(data => {
            const fetchedProfile = data.user as Profile
            console.log('[Auth] Profile loaded successfully:', fetchedProfile.full_name)
            setProfile(fetchedProfile)
            const mockSession = {
                access_token: token,
                user: { id: fetchedProfile.id, email: fetchedProfile.email }
            } as Session
            setSession(mockSession)
            setUser(mockSession.user)
        })
        .catch(err => {
            console.warn('[Auth] Session validation failed:', err.message)
            localStorage.removeItem('sehai_token')
            setProfile(null)
            setSession(null)
            setUser(null)
        })
        .finally(() => {
            setLoading(false)
        })
    }, [])

    async function signIn(email: string, password: string) {
        console.log('[Auth] signIn called for:', email)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.detail || 'Login failed')
            }
            const data = await res.json()
            const token = data.token
            const profileData = data.user as Profile

            localStorage.setItem('sehai_token', token)
            const mockSession = {
                access_token: token,
                user: { id: profileData.id, email: profileData.email }
            } as Session

            setProfile(profileData)
            setSession(mockSession)
            setUser(mockSession.user)

            return { error: null }
        } catch (err: any) {
            console.error('[Auth] signIn error:', err)
            return { error: err }
        }
    }

    async function signUp(email: string, password: string, metadata: {
        full_name: string; role: string; facility_name?: string
    }) {
        console.log('[Auth] signUp called for:', email)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: metadata.full_name,
                    role: metadata.role,
                    facility_name: metadata.facility_name || ""
                })
            })
            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.detail || 'Registration failed')
            }
            const data = await res.json()
            const token = data.token
            const profileData = data.user as Profile

            localStorage.setItem('sehai_token', token)
            const mockSession = {
                access_token: token,
                user: { id: profileData.id, email: profileData.email }
            } as Session

            setProfile(profileData)
            setSession(mockSession)
            setUser(mockSession.user)

            return { data: mockSession, error: null }
        } catch (err: any) {
            console.error('[Auth] signUp error:', err)
            return { error: err }
        }
    }

    async function signOut() {
        console.log('[Auth] signOut called')
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch (err) {
            console.error('[Auth] error during logout:', err)
        }
        localStorage.removeItem('sehai_token')
        setProfile(null)
        setSession(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
