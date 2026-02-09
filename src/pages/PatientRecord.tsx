import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '@/components/DashboardLayout'
import { ArrowLeft, User, Calendar, MapPin, Phone, FileText } from 'lucide-react'

export default function PatientRecord() {
    const { id } = useParams()

    // Mock patient data
    const patient = {
        id: id || 'P001',
        name: 'Rajesh Kumar',
        age: 45,
        gender: 'Male',
        contact: '+91 98765 43210',
        address: 'Village Ramnagar, District Sitapur',
        symptoms: 'Persistent fever (5 days), body aches, headache, fatigue',
        referredBy: 'ANM Priya - Ramnagar Sub-Centre',
        referredDate: '2024-02-09',
        priority: 'High',
        status: 'Pending Review',
        vitals: {
            temperature: '102°F',
            bloodPressure: '130/85 mmHg',
            heartRate: '88 bpm',
            oxygenLevel: '96%',
        },
        medicalHistory: 'No known allergies. Previous history of malaria (2 years ago).',
        notes: 'Patient reports fever started 5 days ago. Has been taking paracetamol with minimal relief. Experiencing body aches and severe headache.',
    }

    return (
        <DashboardLayout
            userName="Dr. Anil Verma"
            userRole="PHC Doctor - Ramnagar PHC"
            subtitle="PHC Doctor - Ramnagar PHC"
        >
            <div className="space-y-6">
                {/* Back Button */}
                <Link
                    to="/phc-dashboard"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Patient Record</h1>
                            <p className="text-muted-foreground">Case ID: {patient.id}</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-4 py-2 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-medium">
                                {patient.priority} Priority
                            </span>
                            <span className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 font-medium">
                                {patient.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Patient Information */}
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Patient Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                                    <p className="font-medium">{patient.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Age / Gender</p>
                                    <p className="font-medium">{patient.age} years / {patient.gender}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        Contact
                                    </p>
                                    <p className="font-medium">{patient.contact}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        Address
                                    </p>
                                    <p className="font-medium">{patient.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Symptoms & Diagnosis */}
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Symptoms & Clinical Notes
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Reported Symptoms</p>
                                    <p className="p-3 bg-muted/50 rounded-lg">{patient.symptoms}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Medical History</p>
                                    <p className="p-3 bg-muted/50 rounded-lg">{patient.medicalHistory}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Clinical Notes</p>
                                    <p className="p-3 bg-muted/50 rounded-lg">{patient.notes}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Actions</h2>
                            <div className="flex flex-wrap gap-3">
                                <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                                    Start Consultation
                                </button>
                                <button className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium">
                                    Prescribe Medication
                                </button>
                                <button className="px-6 py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium">
                                    Refer to CHC
                                </button>
                                <button className="px-6 py-3 rounded-lg border hover:bg-accent transition-colors font-medium">
                                    Request Lab Tests
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Referral Info */}
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Referral Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Referred By</p>
                                    <p className="font-medium">{patient.referredBy}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Referral Date</p>
                                    <p className="font-medium">{new Date(patient.referredDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Vital Signs */}
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Vital Signs</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">Temperature</span>
                                    <span className="font-medium">{patient.vitals.temperature}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">Blood Pressure</span>
                                    <span className="font-medium">{patient.vitals.bloodPressure}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">Heart Rate</span>
                                    <span className="font-medium">{patient.vitals.heartRate}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">Oxygen Level</span>
                                    <span className="font-medium">{patient.vitals.oxygenLevel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
