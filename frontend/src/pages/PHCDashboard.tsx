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

export default function PHCDashboard() {
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
            const res = await fetch('/api/referrals?referred_to=phc', {
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

    async function referToCHC(r: ReferralRow) {
        try {
            const token = localStorage.getItem('sehai_token')
            const res = await fetch('/api/referrals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient_id: r.patients.id,
                    referred_to: 'chc',
                    priority: 'high',
                    reason: `Escalated from PHC: ${r.reason || r.patients.symptoms}`,
                    prediction_id: null
                })
            })
            if (!res.ok) throw new Error('Failed to refer to CHC')
        } catch (err) {
            console.error('Error referring to CHC:', err)
        }
        await updateStatus(r.id, 'completed')
    }

    const stats = [
        { label: t('total_referrals'), value: referrals.length, icon: <Users size={22} />, color: 'var(--sh-teal)' },
        { label: t('pending_review'), value: referrals.filter(r => r.status === 'pending').length, icon: <Activity size={22} />, color: '#ea580c' },
        { label: 'Completed', value: referrals.filter(r => r.status === 'completed').length, icon: <CheckCircle size={22} />, color: '#16a34a' },
        { label: t('critical_cases'), value: referrals.filter(r => r.priority === 'high' || r.priority === 'critical').length, icon: <TrendingUp size={22} />, color: '#7c3aed' },
    ]

    const priorityBadge = (p: string) => {
        if (p === 'critical' || p === 'high') return 'sh-badge sh-badge-red'
        if (p === 'medium') return 'sh-badge sh-badge-orange'
        return 'sh-badge sh-badge-green'
    }
    const statusBadge = (s: string) => {
        if (s === 'pending') return 'sh-badge sh-badge-yellow'
        if (s === 'reviewed' || s === 'in_progress') return 'sh-badge sh-badge-teal'
        if (s === 'completed') return 'sh-badge sh-badge-green'
        return 'sh-badge sh-badge-gray'
    }

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                    <h1 className="sh-page-title">{t('phc_title')}</h1>
                    <p className="sh-page-sub">{t('phc_subtitle')}</p>
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
                        <div className="sh-card-title">{t('incoming_referrals')}</div>
                        <div className="sh-card-sub">Cases referred from Sub-Centres</div>
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
                                                        <button onClick={() => updateStatus(r.id, 'reviewed')} className="sh-btn-sm-teal">{t('mark_reviewed')}</button>
                                                    )}
                                                    {(r.status === 'pending' || r.status === 'reviewed') && (
                                                        <button onClick={() => referToCHC(r)} className="sh-btn-sm-warn">{t('refer_to_chc')}</button>
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
