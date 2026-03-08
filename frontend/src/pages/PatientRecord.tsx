import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { ArrowLeft, User, Calendar, FileText, Activity, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatSymptom } from '@/lib/symptoms'

interface PatientData {
    id: string
    patient_name: string
    age: number
    gender: string
    symptoms: string
    symptom_tags: string[]
    contact: string | null
    address: string | null
    medical_history: string | null
    notes: string | null
    vitals: Record<string, string>
    created_at: string
    facility_name: string
    profiles: { full_name: string; facility_name: string }
}

interface PredictionData {
    id: string
    predicted_disease: string
    confidence: number
    disease_description: string
    precautions: string[]
    symptoms_used: string[]
    created_at: string
}

interface ReferralData {
    id: string
    referred_to: string
    priority: string
    status: string
    reason: string
    created_at: string
    profiles: { full_name: string; facility_name: string }
}

export default function PatientRecord() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { profile } = useAuth()
    const [patient, setPatient] = useState<PatientData | null>(null)
    const [predictions, setPredictions] = useState<PredictionData[]>([])
    const [referrals, setReferrals] = useState<ReferralData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) fetchPatient(id)
    }, [id])

    async function fetchPatient(patientId: string) {
        const { data: patientData } = await supabase
            .from('patients')
            .select('*, profiles!created_by(full_name, facility_name)')
            .eq('id', patientId)
            .single()

        if (patientData) {
            setPatient(patientData as unknown as PatientData)

            const { data: predData } = await supabase
                .from('predictions')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false })

            if (predData) setPredictions(predData as PredictionData[])

            const { data: refData } = await supabase
                .from('referrals')
                .select('*, profiles!referred_by(full_name, facility_name)')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false })

            if (refData) setReferrals(refData as unknown as ReferralData[])
        }
        setLoading(false)
    }

    const backPath = profile?.role === 'chc' ? '/chc-dashboard' : profile?.role === 'phc' ? '/phc-dashboard' : '/anm-dashboard'

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        )
    }

    if (!patient) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold mb-2">Patient Not Found</h2>
                    <p className="text-muted-foreground mb-4">The patient record could not be found.</p>
                    <button onClick={() => navigate(backPath)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">
                        Back to Dashboard
                    </button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <Link
                    to={backPath}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Patient Record</h1>
                            <p className="text-muted-foreground">Registered on {new Date(patient.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Patient Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                                    <p className="font-medium">{patient.patient_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Age / Gender</p>
                                    <p className="font-medium">{patient.age} years / {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}</p>
                                </div>
                                {patient.contact && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Contact</p>
                                        <p className="font-medium">{patient.contact}</p>
                                    </div>
                                )}
                                {patient.address && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Address</p>
                                        <p className="font-medium">{patient.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Symptoms & Notes
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Reported Symptoms</p>
                                    <p className="p-3 bg-muted/50 rounded-lg">{patient.symptoms}</p>
                                </div>
                                {patient.symptom_tags && patient.symptom_tags.length > 0 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Structured Symptoms</p>
                                        <div className="flex flex-wrap gap-2">
                                            {patient.symptom_tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                                                    {formatSymptom(tag)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {patient.notes && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Clinical Notes</p>
                                        <p className="p-3 bg-muted/50 rounded-lg">{patient.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Predictions */}
                        {predictions.length > 0 && (
                            <div className="bg-card border rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    AI Predictions
                                </h2>
                                <div className="space-y-4">
                                    {predictions.map(pred => (
                                        <div key={pred.id} className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold">{pred.predicted_disease}</span>
                                                <span className="text-sm text-primary">{(pred.confidence * 100).toFixed(1)}% confidence</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{pred.disease_description}</p>
                                            {pred.precautions && pred.precautions.length > 0 && (
                                                <div>
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Shield className="h-3 w-3 text-green-500" />
                                                        <span className="text-xs font-medium">Precautions:</span>
                                                    </div>
                                                    <ul className="text-xs text-muted-foreground space-y-0.5">
                                                        {pred.precautions.map((p, i) => <li key={i}>• {p}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Registration Info
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Registered By</p>
                                    <p className="font-medium">{patient.profiles.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{patient.profiles.facility_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Registration Date</p>
                                    <p className="font-medium">{new Date(patient.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {referrals.length > 0 && (
                            <div className="bg-card border rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Referral History</h3>
                                <div className="space-y-3">
                                    {referrals.map(ref => (
                                        <div key={ref.id} className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">To {ref.referred_to.toUpperCase()}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${ref.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                                    {ref.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">By {ref.profiles.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(ref.created_at).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vitals */}
                        {patient.vitals && Object.keys(patient.vitals).length > 0 && (
                            <div className="bg-card border rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Vital Signs</h3>
                                <div className="space-y-3">
                                    {Object.entries(patient.vitals).map(([key, val]) => (
                                        <div key={key} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                            <span className="text-sm text-muted-foreground">{key}</span>
                                            <span className="font-medium">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
