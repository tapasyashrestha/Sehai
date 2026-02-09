import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, Activity, CheckCircle, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Referral {
    id: string
    patientName: string
    referredBy: string
    symptoms: string
    priority: 'critical' | 'high' | 'medium'
    status: 'pending' | 'in-progress' | 'completed'
}

export default function CHCDashboard() {
    const [showToast, setShowToast] = useState(false)
    const [referrals] = useState<Referral[]>([
        {
            id: 'C001',
            patientName: 'Ramesh Patel',
            referredBy: 'Dr. Anil Verma - Ramnagar PHC',
            symptoms: 'Severe chest pain, shortness of breath',
            priority: 'critical',
            status: 'in-progress',
        },
        {
            id: 'C002',
            patientName: 'Lakshmi Devi',
            referredBy: 'Dr. Suresh Kumar - Village PHC',
            symptoms: 'High fever, severe dehydration',
            priority: 'high',
            status: 'pending',
        },
        {
            id: 'C003',
            patientName: 'Vijay Singh',
            referredBy: 'Dr. Anil Verma - Ramnagar PHC',
            symptoms: 'Fracture, requires surgery',
            priority: 'medium',
            status: 'completed',
        },
    ])

    useEffect(() => {
        setShowToast(true)
        const timer = setTimeout(() => setShowToast(false), 3000)
        return () => clearTimeout(timer)
    }, [])

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-300 dark:border-red-700'
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            case 'in-progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        }
    }

    return (
        <DashboardLayout
            userName="Dr. Kavita Sharma"
            userRole="CHC Specialist - District CHC"
            subtitle="CHC Specialist - District CHC"
        >
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">CHC Dashboard</h1>
                    <p className="text-muted-foreground">Manage critical cases and specialist consultations</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Cases Today</p>
                            <p className="text-3xl font-bold">8</p>
                        </div>
                    </div>

                    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Critical Cases</p>
                            <p className="text-3xl font-bold">1</p>
                        </div>
                    </div>

                    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Completed Today</p>
                            <p className="text-3xl font-bold">5</p>
                        </div>
                    </div>

                    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                            <p className="text-3xl font-bold">2</p>
                        </div>
                    </div>
                </div>

                {/* Referrals Table */}
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-semibold mb-1">Specialist Referrals</h2>
                        <p className="text-muted-foreground">Cases referred from PHCs</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Case ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Patient Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Referred By
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Symptoms
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {referrals.map((referral) => (
                                    <tr key={referral.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link to={`/patient/${referral.id}`} className="text-primary hover:underline font-medium">
                                                {referral.id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{referral.patientName}</td>
                                        <td className="px-6 py-4">{referral.referredBy}</td>
                                        <td className="px-6 py-4">{referral.symptoms}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(referral.priority)}`}>
                                                {referral.priority.charAt(0).toUpperCase() + referral.priority.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                                                {referral.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                to={`/patient/${referral.id}`}
                                                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
                                            >
                                                View Case
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-card border rounded-lg shadow-lg p-4 flex items-center gap-3 animate-slide-up z-50">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Welcome back!</span>
                </div>
            )}
        </DashboardLayout>
    )
}
