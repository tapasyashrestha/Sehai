import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, Activity, CheckCircle, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import '@/styles/sehai-theme.css'

interface ReferralRow {
    id: string
    priority: string
    status: string
    reason: string
    created_at: string
    patients: { id: string; patient_name: string; symptoms: string }
    profiles: { full_name: string; facility_name: string }
}

export default function CHCDashboard() {
    const { profile } = useAuth()
    const { t } = useLanguage()
    const [toast, setToast] = useState('')
    const [referrals, setReferrals] = useState<ReferralRow[]>([])
    const [loading, setLoading] = useState(true)

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    useEffect(() => {
        fetchReferrals()
        showToast(t('welcome_back'))
    }, [])

    async function fetchReferrals() {
        try {
            const token = localStorage.getItem('sehai_token')
            const res = await fetch('/api/referrals?referred_to=chc', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch referrals')
            const data = await res.json()
            setReferrals(data as ReferralRow[])
        } catch (err) {
            console.error('Error fetching referrals:', err)
        } finally {
            setLoading(false)
        }
    }

    async function updateStatus(id: string, status: string) {
        try {
            const token = localStorage.getItem('sehai_token')
            const res = await fetch(`/api/referrals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            })
            if (!res.ok) throw new Error('Failed to update status')
        } catch (err) {
            console.error('Error updating status:', err)
        }
        fetchReferrals()
    }

    const stats = [
        { label: t('total_referrals'), value: referrals.length, icon: <Users size={22} />, color: 'var(--sh-teal)' },
        { label: t('critical_cases'), value: referrals.filter(r => r.priority === 'critical' || r.priority === 'high').length, icon: <Activity size={22} />, color: '#dc2626' },
        { label: 'Completed', value: referrals.filter(r => r.status === 'completed').length, icon: <CheckCircle size={22} />, color: '#16a34a' },
        { label: 'In Progress', value: referrals.filter(r => r.status === 'in_progress').length, icon: <TrendingUp size={22} />, color: '#7c3aed' },
    ]

    const priorityBadge = (p: string) => {
        if (p === 'critical') return 'sh-badge sh-badge-red'
        if (p === 'high') return 'sh-badge sh-badge-orange'
        if (p === 'medium') return 'sh-badge sh-badge-yellow'
        return 'sh-badge sh-badge-gray'
    }
    const statusBadge = (s: string) => {
        if (s === 'pending') return 'sh-badge sh-badge-yellow'
        if (s === 'in_progress') return 'sh-badge sh-badge-teal'
        if (s === 'completed') return 'sh-badge sh-badge-green'
        return 'sh-badge sh-badge-gray'
    }

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                    <h1 className="sh-page-title">{t('chc_title')}</h1>
                    <p className="sh-page-sub">{t('chc_subtitle')}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {stats.map(s => (
                        <div key={s.label} className="sh-stat-card">
                            <div className="sh-stat-icon" style={{ color: s.color }}>{s.icon}</div>
                            <div className="sh-stat-label">{s.label}</div>
                            <div className="sh-stat-value">{s.value}</div>
                        </div>
                    ))}
                </div>

                <div className="sh-card">
                    <div className="sh-card-header">
                        <div className="sh-card-title">Specialist Referrals</div>
                        <div className="sh-card-sub">Cases referred from PHCs</div>
                    </div>
                    {loading ? (
                        <div style={{ padding: 48, textAlign: 'center', color: 'var(--sh-muted)', fontFamily: 'var(--sh-font-head)', fontWeight: 700 }}>Loading referrals…</div>
                    ) : referrals.length === 0 ? (
                        <div style={{ padding: 48, textAlign: 'center', color: 'var(--sh-muted)', fontFamily: 'var(--sh-font-head)', fontWeight: 700 }}>{t('no_referrals')}</div>
                    ) : (
                        <div className="sh-table-wrap">
                            <table className="sh-table">
                                <thead>
                                    <tr>
                                        {[t('patient'), t('referred_by'), 'Symptoms', t('priority'), t('status'), t('actions')].map(h => (
                                            <th key={h}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {referrals.map(r => (
                                        <tr key={r.id}>
                                            <td>
                                                <Link to={`/patient/${r.patients.id}`} className="sh-table-link">
                                                    {r.patients.patient_name}
                                                </Link>
                                            </td>
                                            <td>{r.profiles.full_name} · {r.profiles.facility_name}</td>
                                            <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.patients.symptoms}</td>
                                            <td><span className={priorityBadge(r.priority)}>{r.priority.charAt(0).toUpperCase() + r.priority.slice(1)}</span></td>
                                            <td><span className={statusBadge(r.status)}>{r.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <Link to={`/patient/${r.patients.id}`} className="sh-btn-sm-outline">View</Link>
                                                    {r.status === 'pending' && (
                                                        <button onClick={() => updateStatus(r.id, 'in_progress')} className="sh-btn-sm-teal">Start</button>
                                                    )}
                                                    {r.status === 'in_progress' && (
                                                        <button onClick={() => updateStatus(r.id, 'completed')}
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 50, border: 'none', cursor: 'pointer', background: '#dcfce7', color: '#16a34a', fontFamily: 'var(--sh-font-head)', fontWeight: 800, fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                                                            Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {toast && (
                <div className="sh-toast">
                    <CheckCircle size={18} color="var(--sh-teal)" />
                    {toast}
                </div>
            )}
        </DashboardLayout>
    )
}
