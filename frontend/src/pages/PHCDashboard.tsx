import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, Activity, CheckCircle, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ReferralRow {
    id: string
    priority: string
    status: string
    reason: string
    created_at: string
    patients: {
        id: string
        patient_name: string
        symptoms: string
    }
    profiles: {
        full_name: string
        facility_name: string
    }
}

export default function PHCDashboard() {
    const { profile } = useAuth()
    const [showToast, setShowToast] = useState(false)
    const [referrals, setReferrals] = useState<ReferralRow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReferrals()
        setShowToast(true)
        const timer = setTimeout(() => setShowToast(false), 3000)
        return () => clearTimeout(timer)
    }, [])

    async function fetchReferrals() {
        const { data, error } = await supabase
            .from('referrals')
            .select('id, priority, status, reason, created_at, patients(id, patient_name, symptoms), profiles!referred_by(full_name, facility_name)')
            .eq('referred_to', 'phc')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setReferrals(data as unknown as ReferralRow[])
        }
        setLoading(false)
    }

    async function updateStatus(referralId: string, newStatus: string) {
        await supabase
            .from('referrals')
            .update({ status: newStatus, reviewed_by: profile?.id, reviewed_at: new Date().toISOString() })
            .eq('id', referralId)
        fetchReferrals()
    }

    async function referToCHC(referral: ReferralRow) {
        await supabase.from('referrals').insert({
            patient_id: referral.patients.id,
            referred_by: profile?.id,
            referred_to: 'chc',
            priority: 'high',
            reason: `Escalated from PHC: ${referral.reason || referral.patients.symptoms}`,
        })
        await updateStatus(referral.id, 'completed')
    }

    const totalCases = referrals.length
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length
    const completedCases = referrals.filter(r => r.status === 'completed').length
    const referredToCHC = referrals.filter(r => r.status === 'completed').length

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            case 'reviewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">PHC Dashboard</h1>
                    <p className="text-muted-foreground">Review referrals and manage patient care</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Total Cases</p>
                        <p className="text-3xl font-bold">{totalCases}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Pending Referrals</p>
                        <p className="text-3xl font-bold">{pendingReferrals}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Completed</p>
                        <p className="text-3xl font-bold">{completedCases}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Referred to CHC</p>
                        <p className="text-3xl font-bold">{referredToCHC}</p>
                    </div>
                </div>

                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-semibold mb-1">Incoming Referrals</h2>
                        <p className="text-muted-foreground">Cases referred from Sub-Centres</p>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading referrals...</div>
                    ) : referrals.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No referrals yet</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Referred By</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Symptoms</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {referrals.map((referral) => (
                                        <tr key={referral.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link to={`/patient/${referral.patients.id}`} className="text-primary hover:underline font-medium">
                                                    {referral.patients.patient_name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">{referral.profiles.full_name} - {referral.profiles.facility_name}</td>
                                            <td className="px-6 py-4">{referral.patients.symptoms}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(referral.priority)}`}>
                                                    {referral.priority.charAt(0).toUpperCase() + referral.priority.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                                                    {referral.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <Link
                                                        to={`/patient/${referral.patients.id}`}
                                                        className="px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
                                                    >
                                                        View
                                                    </Link>
                                                    {referral.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateStatus(referral.id, 'reviewed')}
                                                            className="px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm"
                                                        >
                                                            Review
                                                        </button>
                                                    )}
                                                    {(referral.status === 'pending' || referral.status === 'reviewed') && (
                                                        <button
                                                            onClick={() => referToCHC(referral)}
                                                            className="px-3 py-1 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm"
                                                        >
                                                            Refer CHC
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

            {showToast && (
                <div className="fixed bottom-8 right-8 bg-card border rounded-lg shadow-lg p-4 flex items-center gap-3 animate-slide-up z-50">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Welcome back!</span>
                </div>
            )}
        </DashboardLayout>
    )
}
