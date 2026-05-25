import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import './Index.css'

export default function Index() {
    const navigate = useNavigate()
    const { lang, setLang, t, languages } = useLanguage()
    const [langOpen, setLangOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const revealRefs = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
            { threshold: 0.12 }
        )
        revealRefs.current.forEach(el => el && obs.observe(el))
        return () => obs.disconnect()
    }, [])

    const addReveal = (el: HTMLDivElement | null) => {
        if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
    }

    const scrollTo = (id: string) =>
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

    return (
        <div className="lp-body">

            {/* NAV */}
            <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
                <button className="lp-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
                        <polyline points="0,11 6,11 8,4 11,18 14,7 17,15 20,11 34,11"
                            stroke="#2bbfa0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                    <span className="lp-logo-text">SE<span>HAI</span></span>
                </button>
                <div className="lp-nav-links">
                    <button onClick={() => scrollTo('features')}>{t('nav_home')}</button>
                    <button onClick={() => scrollTo('about')}>{t('nav_about')}</button>
                    <button onClick={() => scrollTo('departments')}>{t('nav_departments')}</button>
                    <button onClick={() => scrollTo('contact')}>{t('nav_contact')}</button>
                </div>
                <div className="lp-nav-right">
                    {/* Language picker */}
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setLangOpen(o => !o)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1.5px solid rgba(43,191,160,.35)', borderRadius: 50, padding: '7px 14px', cursor: 'pointer', color: 'var(--sh-teal)', fontFamily: 'var(--sh-font-head)', fontWeight: 700, fontSize: '.78rem', letterSpacing: '.03em' }}>
                            <Globe size={13} />
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
                    <button className="lp-btn lp-btn-sm lp-btn-ghost" onClick={() => navigate('/login')}>{t('login')}</button>
                    <button className="lp-btn lp-btn-sm lp-btn-teal" onClick={() => navigate('/signup')}>{t('signup')}</button>
                </div>
            </nav>

            {/* HERO */}
            <section className="lp-hero">
                <div className="lp-hero-content">
                    <div className="lp-hero-badge">
                        <span className="lp-badge-dot" />
                        {t('hero_badge')}
                    </div>
                    <h1>
                        {t('hero_title_1')}<br />
                        <em>{t('hero_title_2')}</em>
                    </h1>
                    <p className="lp-hero-sub">{t('hero_sub')}</p>
                    <div className="lp-hero-ctas">
                        <button className="lp-btn lp-btn-lg lp-btn-teal" onClick={() => navigate('/login')}>
                            {t('get_started')}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </button>
                        <button className="lp-btn lp-btn-lg lp-btn-outline" onClick={() => scrollTo('about')}>
                            {t('read_more')}
                        </button>
                    </div>
                </div>

                <div className="lp-hero-image-side">
                    <div className="lp-hero-img-blob" />
                    <div className="lp-hero-img-blob-2" />
                    <div className="lp-hero-card lp-hc-1">
                        <div className="lp-hc-icon">🩺</div>
                        <div className="lp-hc-val">133</div>
                        <div className="lp-hc-label">Symptoms</div>
                    </div>
                    <div className="lp-hero-card lp-hero-card-2 lp-hc-2">
                        <div className="lp-hc-icon">🔬</div>
                        <div className="lp-hc-val">42</div>
                        <div className="lp-hc-label">Diseases</div>
                    </div>
                    <div className="lp-hero-card lp-hero-card-3 lp-hc-3">
                        <div className="lp-hc-icon">📍</div>
                        <div className="lp-hc-val">3-Tier</div>
                        <div className="lp-hc-label">Referral Chain</div>
                    </div>
                </div>
            </section>

            {/* WAVE DOWN */}
            <div className="lp-wave-sep" style={{ background: 'linear-gradient(135deg, #f0faf8, #b8e8df)' }}>
                <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#1a3a34" />
                </svg>
            </div>

            {/* STATS BAR */}
            <div className="lp-stats-bar">
                {[
                    { num: '133', label: 'Symptoms Recognised' },
                    { num: '42', label: 'Diseases Predicted' },
                    { num: '3-Tier', label: 'Referral Chain' },
                    { num: '26+', label: 'Specialist Conditions' },
                ].map(s => (
                    <div key={s.label} className="lp-stat-item">
                        <div className="lp-stat-num">{s.num}</div>
                        <div className="lp-stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* WAVE UP */}
            <div className="lp-wave-sep" style={{ background: '#1a3a34' }}>
                <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,40 C240,0 480,80 720,40 C960,0 1200,80 1440,40 L1440,80 L0,80 Z" fill="#ffffff" />
                </svg>
            </div>

            {/* DEPARTMENTS */}
            <section id="departments" style={{ background: '#fff' }}>
                <div className="lp-section-inner" style={{ textAlign: 'center' }}>
                    <div ref={addReveal} className="lp-reveal">
                        <div className="lp-section-label" style={{ justifyContent: 'center' }}>Our Departments</div>
                        <h2 className="lp-section-title">Specialised Care Areas</h2>
                        <p className="lp-section-sub" style={{ margin: '0 auto' }}>
                            SEHAI covers a broad spectrum of health conditions — from maternal care to communicable disease management across rural India.
                        </p>
                    </div>
                    <div ref={addReveal} className="lp-reveal lp-dept-grid">
                        {[
                            { icon: '🤱', title: 'Maternal Health', desc: 'Antenatal & postnatal care tracking' },
                            { icon: '🧒', title: 'Child Health', desc: 'Immunisation & growth monitoring' },
                            { icon: '🦠', title: 'Infectious Disease', desc: 'TB, malaria, dengue screening' },
                            { icon: '💉', title: 'Chronic Illness', desc: 'Diabetes & hypertension management' },
                            { icon: '🏥', title: 'Emergency Triage', desc: 'Critical case escalation' },
                            { icon: '🧠', title: 'Mental Health', desc: 'Screening & referral support' },
                        ].map(d => (
                            <div key={d.title} className="lp-dept-card">
                                <div className="lp-dept-icon">{d.icon}</div>
                                <h4>{d.title}</h4>
                                <p>{d.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WAVE */}
            <div className="lp-wave-sep" style={{ background: '#fff' }}>
                <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,20 C360,80 720,0 1080,50 C1260,75 1380,30 1440,20 L1440,80 L0,80 Z" fill="#f0faf8" />
                </svg>
            </div>

            {/* FEATURES */}
            <section id="features" style={{ background: 'var(--bg-2)' }}>
                <div className="lp-section-inner">
                    <div ref={addReveal} className="lp-reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <div className="lp-section-label">Capabilities</div>
                            <h2 className="lp-section-title">Built for the Field.<br />Powered by AI.</h2>
                        </div>
                        <p className="lp-section-sub" style={{ maxWidth: '400px' }}>
                            Every feature designed around the real constraints ANMs face — low connectivity, local languages, no time for complex interfaces.
                        </p>
                    </div>
                    <div className="lp-features-grid">
                        {[
                            {
                                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
                                title: 'Voice-Enabled Input',
                                desc: 'ANMs speak symptoms in local languages. The browser speech API transcribes and maps them to the ML model\'s feature set — no typing required in the field.',
                            },
                            {
                                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
                                title: 'Smart AI Triage',
                                desc: 'XGBoost model trained on 133 symptoms predicts from 42 diseases with a confidence score. Location-aware — region, climate zone, and altitude adjust predictions.',
                            },
                            {
                                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
                                title: 'Seamless Referrals',
                                desc: 'One-tap escalation from Sub-Centre → PHC → CHC. Every referral is timestamped, tracked, and visible to the right person — nothing gets lost.',
                            },
                            {
                                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
                                title: 'Multilingual Ready',
                                desc: 'Designed from the ground up for linguistic diversity. Supports English, Hindi, and regional languages — with an architecture built for easy expansion.',
                            },
                        ].map(f => (
                            <div key={f.title} ref={addReveal} className="lp-reveal lp-feat-card">
                                <div className="lp-feat-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WAVE */}
            <div className="lp-wave-sep" style={{ background: 'var(--bg-2)' }}>
                <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,60 C200,10 400,70 600,40 C800,10 1000,70 1200,50 C1320,38 1400,30 1440,60 L1440,80 L0,80 Z" fill="#1a3a34" />
                </svg>
            </div>

            {/* HOW IT WORKS */}
            <section className="lp-how-section">
                <div className="lp-how-bg-pattern" />
                <div className="lp-section-inner" style={{ textAlign: 'center' }}>
                    <div ref={addReveal} className="lp-reveal">
                        <div className="lp-section-label" style={{ justifyContent: 'center' }}>Referral Chain</div>
                        <h2 className="lp-section-title" style={{ color: '#fff' }}>Three Tiers. One Seamless Chain.</h2>
                        <p className="lp-section-sub" style={{ margin: '0 auto', color: 'rgba(255,255,255,.55)' }}>
                            India's public healthcare system digitised end-to-end. Every case flows upward with full context — no paper, no data loss, no delay.
                        </p>
                    </div>
                    <div ref={addReveal} className="lp-reveal lp-tier-flow">
                        <div className="lp-tier-card">
                            <div className="lp-tier-number">1</div>
                            <div className="lp-tier-icon">🏘️</div>
                            <h3>Sub-Centre</h3>
                            <div className="lp-tier-role">ANM — Auxiliary Nurse Midwife</div>
                            <p>Visits homes, records symptoms via voice, runs AI triage, submits cases or escalates with confidence score and patient history intact.</p>
                        </div>
                        <div className="lp-tier-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            <span>Escalate</span>
                        </div>
                        <div className="lp-tier-card">
                            <div className="lp-tier-number">2</div>
                            <div className="lp-tier-icon">🏥</div>
                            <h3>PHC</h3>
                            <div className="lp-tier-role">Primary Health Centre</div>
                            <p>Doctor reviews incoming cases with full AI prediction context. Can treat, request more info, or escalate critical cases to the CHC with notes.</p>
                        </div>
                        <div className="lp-tier-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            <span>Escalate</span>
                        </div>
                        <div className="lp-tier-card">
                            <div className="lp-tier-number">3</div>
                            <div className="lp-tier-icon">🏨</div>
                            <h3>CHC</h3>
                            <div className="lp-tier-role">Community Health Centre</div>
                            <p>Specialists manage critical referrals with complete patient journey visible — from initial ANM visit to current status — ensuring nothing falls through the cracks.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* WAVE */}
            <div className="lp-wave-sep" style={{ background: '#1a3a34' }}>
                <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,40 C360,80 720,0 1080,50 C1260,70 1380,20 1440,40 L1440,80 L0,80 Z" fill="#f0faf8" />
                </svg>
            </div>

            {/* ABOUT */}
            <section id="about" style={{ background: 'var(--bg-2)' }}>
                <div className="lp-section-inner">
                    <div className="lp-about-grid">
                        <div ref={addReveal} className="lp-reveal lp-about-text">
                            <div className="lp-section-label">About SEHAI</div>
                            <h2 className="lp-section-title">Closing the Rural Healthcare Gap</h2>
                            <p>SEHAI (Smart Electronic Health AI) is a production-grade platform built to digitise and intelligently assist India's 3-tier public healthcare chain. ANMs in remote villages record everything on paper. By the time a critical patient reaches a PHC or CHC, information is lost, incomplete, or delayed.</p>
                            <p>SEHAI changes that. An ANM opens the app, speaks symptoms in her local language, and gets an instant AI prediction — disease, confidence score, and region-aware context. She submits or escalates with one tap. The PHC doctor sees everything. Nothing is lost.</p>
                            <div className="lp-about-stats">
                                <div className="lp-astat"><div className="lp-astat-num">133</div><div className="lp-astat-label">Symptoms Recognised</div></div>
                                <div className="lp-astat"><div className="lp-astat-num">42</div><div className="lp-astat-label">Diseases Predicted</div></div>
                                <div className="lp-astat lp-astat-wide"><div className="lp-astat-num">3-Tier</div><div className="lp-astat-label">Sub-Centre → PHC → CHC Referral System</div></div>
                            </div>
                        </div>
                        <div ref={addReveal} className="lp-reveal lp-about-visual">
                            <div className="lp-av-blob">
                                <div className="lp-av-inner">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                                    <div className="lp-av-label">AI Triage</div>
                                </div>
                            </div>
                            <div className="lp-av-pill lp-ap-1">🎙️ Voice Input</div>
                            <div className="lp-av-pill lp-ap-2">📍 Geo-Aware</div>
                            <div className="lp-av-pill lp-ap-3">🔗 3-Tier Chain</div>
                            <div className="lp-av-pill lp-ap-4">🌐 Multilingual</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA BAND */}
            <div className="lp-cta-band">
                <h2>{t('cta_title')}</h2>
                <p>{t('cta_sub')}</p>
                <button className="lp-btn lp-btn-lg lp-btn-white" onClick={() => navigate('/signup')}>
                    {t('get_started_free')}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </button>
            </div>

            {/* CONTACT */}
            <section id="contact" style={{ background: 'var(--bg-2)' }}>
                <div className="lp-section-inner" style={{ textAlign: 'center' }}>
                    <div ref={addReveal} className="lp-reveal">
                        <div className="lp-section-label" style={{ justifyContent: 'center' }}>Get in Touch</div>
                        <h2 className="lp-section-title">Contact Us</h2>
                        <p className="lp-section-sub" style={{ margin: '0 auto' }}>Need help getting started or have questions about the platform? Reach out — we're here.</p>
                    </div>
                    <div ref={addReveal} className="lp-reveal lp-contact-cards">
                        <div className="lp-contact-card">
                            <div className="lp-contact-card-icon">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            </div>
                            <h4>Email Us</h4>
                            <a href="mailto:support@sehai.in">support@sehai.in</a>
                        </div>
                        <div className="lp-contact-card">
                            <div className="lp-contact-card-icon">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                            </div>
                            <h4>Call Us</h4>
                            <a href="tel:18001234567">1800-123-4567</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="lp-footer">
                <div className="lp-footer-copy">© 2026 SEHAI — Improving Rural Healthcare Access</div>
                <div className="lp-footer-links">
                    <button onClick={() => scrollTo('about')}>About</button>
                    <button onClick={() => scrollTo('contact')}>Contact</button>
                    <button onClick={() => scrollTo('departments')}>Departments</button>
                </div>
            </footer>

        </div>
    )
}
