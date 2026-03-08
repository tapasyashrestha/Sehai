import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface Profile {
    id: string
    full_name: string
    role: 'anm' | 'phc' | 'chc'
    facility_name: string
    facility_location: string
    phone: string | null
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
    const abortRef = useRef(false)

    useEffect(() => {
        let mounted = true
        abortRef.current = false

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return
            console.log('[Auth] Initial session:', session ? 'exists' : 'none')
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!mounted) return
                console.log('[Auth] State change:', event)
                setSession(session)
                setUser(session?.user ?? null)
                if (session?.user) {
                    // Use setTimeout to avoid blocking the auth state change callback
                    setTimeout(() => {
                        if (mounted) fetchProfile(session.user.id)
                    }, 0)
                } else {
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        return () => {
            mounted = false
            abortRef.current = true
            subscription.unsubscribe()
        }
    }, [])

    async function fetchProfile(userId: string) {
        console.log('[Auth] Fetching profile for:', userId)
        // Try up to 3 times with 1s delay (trigger might not have fired yet)
        for (let i = 0; i < 3; i++) {
            if (abortRef.current) return
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()

                if (!error && data) {
                    console.log('[Auth] Profile loaded:', data.full_name, data.role)
                    setProfile(data as Profile)
                    setLoading(false)
                    return
                }
                console.warn(`[Auth] Profile attempt ${i + 1} failed:`, error?.message)
            } catch (err) {
                console.error('[Auth] Fetch error:', err)
            }
            if (i < 2) await new Promise(r => setTimeout(r, 1000))
        }
        console.warn('[Auth] Could not load profile after retries')
        setLoading(false)
    }

    async function signIn(email: string, password: string) {
        console.log('[Auth] signIn called for:', email)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        console.log('[Auth] signIn result:', error ? error.message : 'OK')
        return { error: error as Error | null }
    }

    async function signUp(email: string, password: string, metadata: {
        full_name: string; role: string; facility_name?: string
    }) {
        console.log('[Auth] signUp called for:', email)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata },
        })
        console.log('[Auth] signUp result:', error ? error.message : 'OK', 'identities:', data?.user?.identities?.length)
        return { data, error: error as Error | null }
    }

    async function signOut() {
        console.log('[Auth] signOut called')
        abortRef.current = true
        setProfile(null)
        setSession(null)
        setUser(null)
        await supabase.auth.signOut()
        abortRef.current = false
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
