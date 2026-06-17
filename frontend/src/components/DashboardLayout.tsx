import { ReactNode, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Globe, Database } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import '@/styles/sehai-theme.css'

interface DashboardLayoutProps {
    children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const navigate = useNavigate()
    const { profile, signOut } = useAuth()
    const { lang, setLang, t, languages } = useLanguage()
    const [langOpen, setLangOpen] = useState(false)
    const langRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const roleLabels: Record<string, string> = {
        anm: 'ANM · Sub-Centre',
        phc: 'PHC Doctor',
        chc: 'CHC Specialist',
    }

    const userName = profile?.full_name || 'User'
    const userRole = profile
        ? `${roleLabels[profile.role] || profile.role}${profile.facility_name ? ` · ${profile.facility_name}` : ''}`
        : ''

    const currentLang = languages.find(l => l.code === lang)

    return (
        <div className="sh-dash-wrap">
            <nav className="sh-dash-nav">
                <Link to="/" className="sh-dash-logo">
                    <svg width="32" height="20" viewBox="0 0 34 22" fill="none">
                        <polyline points="0,11 6,11 8,4 11,18 14,7 17,15 20,11 34,11"
                            stroke="var(--sh-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                    <div>
                        <div className="sh-dash-logo-text">SE<span>HAI</span></div>
                        <div className="sh-dash-role">{userRole}</div>
                    </div>
                </Link>

                <div className="sh-dash-nav-right">
                    {/* Language Picker */}
                    <div ref={langRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setLangOpen(o => !o)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
                                borderRadius: 50, padding: '6px 14px', cursor: 'pointer',
                                color: '#fff', fontFamily: 'var(--sh-font-head)', fontWeight: 700, fontSize: '.78rem',
                                letterSpacing: '.03em', transition: 'background .2s',
                            }}
                        >
                            <Globe size={14} />
                            {currentLang?.native}
                        </button>
                        {langOpen && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                background: 'var(--sh-bg-2)', borderRadius: 14, boxShadow: '0 8px 32px rgba(56, 189, 248, 0.15)',
                                border: '1.5px solid var(--sh-border)', minWidth: 160, overflow: 'hidden', zIndex: 200,
                            }}>
                                {languages.map(l => (
                                    <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            width: '100%', padding: '10px 16px', border: 'none', background: lang === l.code ? 'var(--sh-teal-light)' : 'transparent',
                                            cursor: 'pointer', fontFamily: 'var(--sh-font-body)', fontSize: '.88rem',
                                            color: lang === l.code ? 'var(--sh-teal)' : 'var(--sh-text)',
                                            textAlign: 'left', transition: 'background .15s',
                                        }}
                                    >
                                        <span>{l.native}</span>
                                        <span style={{ fontSize: '.72rem', color: 'var(--sh-muted)', fontFamily: 'var(--sh-font-head)', fontWeight: 700 }}>{l.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link to="/dataset" className="sh-btn sh-btn-sm sh-btn-teal"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', marginLeft: 8 }}>
                        <Database size={14} />
                        <span>Dataset</span>
                    </Link>

                    <div style={{ textAlign: 'right', marginRight: 4 }}>
                        <div className="sh-dash-user-name">{userName}</div>
                        <div className="sh-dash-user-role">{userRole}</div>
                    </div>
                    <button onClick={handleLogout} className="sh-btn sh-btn-sm sh-btn-outline-dark"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <LogOut size={15} />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </nav>

            <main className="sh-dash-main">{children}</main>
        </div>
    )
}
