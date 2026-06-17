import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'
import '@/styles/sehai-theme.css'

export default function Login() {
    const navigate = useNavigate()
    const { signIn, profile, session, loading: authLoading } = useAuth()
    const { lang, setLang, t, languages } = useLanguage()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [langOpen, setLangOpen] = useState(false)

    useEffect(() => {
        if (session && profile) {
            setLoading(false)
            navigate(`/${profile.role}-dashboard`, { replace: true })
        }
    }, [session, profile, navigate])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const { error } = await signIn(email, password)
        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setTimeout(() => {
                setLoading(prev => {
                    if (prev) { setError('Login succeeded but profile could not be loaded. Try signing up.'); return false }
                    return prev
                })
            }, 5000)
        }
    }

    if (authLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sh-bg)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--sh-teal)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        )
    }

    return (
        <div className="sh-auth-wrap">
            <nav className="sh-auth-nav">
                <Link to="/" className="sh-auth-logo">
                    <svg width="32" height="20" viewBox="0 0 34 22" fill="none">
                        <polyline points="0,11 6,11 8,4 11,18 14,7 17,15 20,11 34,11"
                            stroke="var(--sh-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                    <span className="sh-auth-logo-text">SE<span>HAI</span></span>
                </Link>
                <div className="sh-auth-nav-right">
                    {/* Language picker */}
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setLangOpen(o => !o)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--sh-bg)', border: '1.5px solid var(--sh-border)', borderRadius: 50, padding: '6px 14px', cursor: 'pointer', color: 'var(--sh-text)', fontFamily: 'var(--sh-font-head)', fontWeight: 700, fontSize: '.78rem' }}>
                            <Globe size={13} color="var(--sh-teal)" />
                            {languages.find(l => l.code === lang)?.native}
                        </button>
                        {langOpen && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--sh-bg-2)', borderRadius: 14, boxShadow: '0 8px 32px rgba(56, 189, 248, 0.15)', border: '1.5px solid var(--sh-border)', minWidth: 160, overflow: 'hidden', zIndex: 200 }}>
                                {languages.map(l => (
                                    <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 16px', border: 'none', background: lang === l.code ? 'var(--sh-teal-light)' : 'transparent', cursor: 'pointer', fontFamily: 'var(--sh-font-body)', fontSize: '.88rem', color: lang === l.code ? 'var(--sh-teal)' : 'var(--sh-text)', textAlign: 'left' }}>
                                        <span>{l.native}</span>
                                        <span style={{ fontSize: '.72rem', color: 'var(--sh-muted)', fontFamily: 'var(--sh-font-head)', fontWeight: 700 }}>{l.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <span className="sh-auth-nav-hint">{t('no_account')}</span>
                    <Link to="/signup" className="sh-btn sh-btn-sm sh-btn-teal">{t('signup')}</Link>
                </div>
            </nav>

            <div className="sh-auth-body">
                <div className="sh-auth-left">
                    <Link to="/" className="sh-auth-back">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                        Back to Home
                    </Link>

                    <div className="sh-auth-tag">Secure Access</div>
                    <h1 className="sh-auth-title">{t('welcome_back_title')}</h1>
                    <p className="sh-auth-sub">{t('sign_in_sub')}</p>

                    {error && <div className="sh-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="sh-form-group">
                            <label htmlFor="email">{t('email')}</label>
                            <input id="email" type="email" autoComplete="email"
                                placeholder={t('email_ph')}
                                value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="sh-form-group">
                            <label htmlFor="password">{t('password')}</label>
                            <input id="password" type="password" autoComplete="current-password"
                                placeholder="••••••••••••"
                                value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <div className="sh-form-footer">
                            <label>
                                <input type="checkbox" style={{ accentColor: 'var(--sh-teal)', width: 'auto' }} />
                                {t('remember_me')}
                            </label>
                            <a>{t('forgot_password')}</a>
                        </div>
                        <button type="submit" disabled={loading} className="sh-btn sh-btn-lg sh-btn-teal">
                            {loading ? t('signing_in') : t('sign_in')}
                            {!loading && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            )}
                        </button>
                    </form>

                    <div className="sh-auth-switch">
                        {t('no_account')} <Link to="/signup">{t('create_one')}</Link>
                    </div>
                </div>

                <div className="sh-auth-right">
                    <div className="sh-auth-right-blob sh-arb-1" />
                    <div className="sh-auth-right-blob sh-arb-2" />
                    <div className="sh-auth-right-inner">
                        <div style={{ marginBottom: 24 }}>
                            <svg width="56" height="36" viewBox="0 0 34 22" fill="none">
                                <polyline points="0,11 6,11 8,4 11,18 14,7 17,15 20,11 34,11"
                                    stroke="var(--sh-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <h2>Your Role.<br />Your Dashboard.</h2>
                        <p>Every login gives you a personalised view — whether you're an ANM in the field, a PHC doctor reviewing cases, or a CHC specialist managing critical referrals.</p>
                        <div className="sh-right-role-box">
                            <div className="sh-right-role-box-header">
                                <div className="sh-right-role-box-dot" />
                                <div className="sh-right-role-box-label">Role-based access</div>
                            </div>
                            <div className="sh-right-role-grid">
                                {[
                                    { icon: '👩‍⚕️', label: t('role_anm') },
                                    { icon: '🩺', label: t('role_phc') },
                                    { icon: '🏥', label: t('role_chc') },
                                ].map(r => (
                                    <div key={r.label} className="sh-right-role-card">
                                        <div className="icon">{r.icon}</div>
                                        <div className="label">{r.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
