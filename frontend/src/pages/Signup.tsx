import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'
import '@/styles/sehai-theme.css'

export default function Signup() {
    const navigate = useNavigate()
    const { signUp, signOut, session, profile } = useAuth()
    const { lang, setLang, t, languages } = useLanguage()
    const [formData, setFormData] = useState({
        name: '', email: '', role: '', facilityName: '', password: '', confirmPassword: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [langOpen, setLangOpen] = useState(false)

    useEffect(() => {
        if (session && profile) navigate(`/${profile.role}-dashboard`, { replace: true })
    }, [session, profile, navigate])

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData(prev => ({ ...prev, [k]: e.target.value }))

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match!'); return }
        if (!formData.role) { setError('Please select a role'); return }
        setLoading(true)
        await Promise.race([signOut(), new Promise((_, r) => setTimeout(() => r(), 2000))]).catch(() => { })
        await new Promise(r => setTimeout(r, 300))
        const { error, data } = await signUp(formData.email, formData.password, {
            full_name: formData.name, role: formData.role, facility_name: formData.facilityName,
        })
        if (error) { setError(error.message); setLoading(false) }
        else if (data?.user?.identities && data.user.identities.length === 0) {
            setError('An account with this email already exists. Please login instead.')
            setLoading(false)
        } else {
            setTimeout(() => setLoading(prev => {
                if (prev) { setError('Account created! Please go to the Login page to sign in.'); return false }
                return prev
            }), 5000)
        }
    }

    const roles = [
        { value: 'anm', label: t('role_anm'), icon: '👩‍⚕️' },
        { value: 'phc', label: t('role_phc'), icon: '🩺' },
        { value: 'chc', label: t('role_chc'), icon: '🏥' },
    ]

    return (
        <div className="sh-auth-wrap">
            <nav className="sh-auth-nav">
                <Link to="/" className="sh-auth-logo">
                    <svg width="32" height="20" viewBox="0 0 34 22" fill="none">
                        <polyline points="0,11 6,11 8,4 11,18 14,7 17,15 20,11 34,11"
                            stroke="#2bbfa0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                    <span className="sh-auth-logo-text">SE<span>HAI</span></span>
                </Link>
                <div className="sh-auth-nav-right">
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setLangOpen(o => !o)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--sh-bg)', border: '1.5px solid var(--sh-border)', borderRadius: 50, padding: '6px 14px', cursor: 'pointer', color: 'var(--sh-text)', fontFamily: 'var(--sh-font-head)', fontWeight: 700, fontSize: '.78rem' }}>
                            <Globe size={13} color="var(--sh-teal)" />
                            {languages.find(l => l.code === lang)?.native}
                        </button>
                        {langOpen && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,.14)', border: '1px solid var(--sh-border)', minWidth: 160, overflow: 'hidden', zIndex: 200 }}>
                                {languages.map(l => (
                                    <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 16px', border: 'none', background: lang === l.code ? 'var(--sh-teal-light)' : 'transparent', cursor: 'pointer', fontFamily: 'var(--sh-font-body)', fontSize: '.88rem', color: lang === l.code ? 'var(--sh-teal-3)' : 'var(--sh-text)', textAlign: 'left' }}>
                                        <span>{l.native}</span>
                                        <span style={{ fontSize: '.72rem', color: 'var(--sh-muted)', fontFamily: 'var(--sh-font-head)', fontWeight: 700 }}>{l.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <span className="sh-auth-nav-hint">{t('already_account')}</span>
                    <Link to="/login" className="sh-btn sh-btn-sm sh-btn-ghost">{t('login')}</Link>
                </div>
            </nav>

            <div className="sh-auth-body">
                <div className="sh-auth-left" style={{ maxWidth: 560 }}>
                    <Link to="/" className="sh-auth-back">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                        Back to Home
                    </Link>

                    <div className="sh-auth-tag">Join SEHAI</div>
                    <h1 className="sh-auth-title">{t('create_account')}</h1>
                    <p className="sh-auth-sub">{t('signup_sub')}</p>

                    {error && <div className="sh-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="sh-form-row">
                            <div className="sh-form-group">
                                <label htmlFor="name">{t('full_name')}</label>
                                <input id="name" type="text" autoComplete="name"
                                    placeholder={t('full_name_ph')}
                                    value={formData.name} onChange={set('name')} required />
                            </div>
                            <div className="sh-form-group">
                                <label htmlFor="email">{t('email')}</label>
                                <input id="email" type="email" autoComplete="email"
                                    placeholder={t('email_ph')}
                                    value={formData.email} onChange={set('email')} required />
                            </div>
                        </div>

                        <div className="sh-form-group">
                            <label>{t('password')}</label>
                            <input type="password" autoComplete="new-password"
                                placeholder="Minimum 6 characters"
                                value={formData.password} onChange={set('password')} required minLength={6} />
                        </div>

                        <div className="sh-form-group">
                            <label>{t('select_role')}</label>
                            <div className="sh-role-grid">
                                {roles.map(r => (
                                    <div key={r.value}
                                        className={`sh-role-opt${formData.role === r.value ? ' selected' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, role: r.value }))}>
                                        <div className="sh-role-icon">{r.icon}</div>
                                        {r.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sh-form-group">
                            <label htmlFor="facility">{t('facility_name')}</label>
                            <input id="facility" type="text"
                                placeholder={t('facility_ph')}
                                value={formData.facilityName} onChange={set('facilityName')} />
                        </div>

                        <div className="sh-form-group">
                            <label>{t('password')} (Confirm)</label>
                            <input type="password" autoComplete="new-password"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword} onChange={set('confirmPassword')} required />
                        </div>

                        <button type="submit" disabled={loading} className="sh-btn sh-btn-lg sh-btn-teal" style={{ marginTop: 8 }}>
                            {loading ? t('creating') : t('create_account')}
                            {!loading && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            )}
                        </button>
                    </form>

                    <div className="sh-auth-switch" style={{ marginTop: 20 }}>
                        {t('already_account')} <Link to="/login">{t('sign_in_link')}</Link>
                    </div>
                </div>

                <div className="sh-auth-right">
                    <div className="sh-auth-right-blob sh-arb-1" />
                    <div className="sh-auth-right-blob sh-arb-2" />
                    <div className="sh-auth-right-inner">
                        <div style={{ marginBottom: 24 }}>
                            <svg width="56" height="36" viewBox="0 0 34 22" fill="none">
                                <polyline points="0,11 6,11 8,4 11,18 14,7 17,15 20,11 34,11"
                                    stroke="#1a3a34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <h2>Built for Real Healthcare Workers.</h2>
                        <p>Used by ANMs in remote villages, PHC doctors reviewing cases, and CHC specialists managing critical referrals — across rural India.</p>
                        <div className="sh-right-stats-grid">
                            {[
                                { n: 'Symptoms', v: '133' },
                                { n: 'Diseases', v: '42' },
                                { n: 'Model', v: 'XGBoost' },
                                { n: 'Referral', v: '3-Tier' },
                            ].map(s => (
                                <div key={s.n} className="sh-right-stat">
                                    <div className="sn">{s.n}</div>
                                    <div className="sv">{s.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
