import { useState, FormEvent, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import SymptomSelect from '@/components/SymptomSelect'
import PredictionResultCard from '@/components/PredictionResult'
import { Mic, CheckCircle, Droplet, HandHeart, Syringe, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { predictDisease, type PredictionResult } from '@/lib/api'

export default function ANMDashboard() {
    const { profile } = useAuth()
    const [isListening, setIsListening] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('Welcome back!')
    const [formData, setFormData] = useState({
        patientName: '',
        age: '',
        gender: '',
        symptoms: '',
    })
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
    const [prediction, setPrediction] = useState<PredictionResult | null>(null)
    const [predicting, setPredicting] = useState(false)
    const [predictionError, setPredictionError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        setShowToast(true)
        const timer = setTimeout(() => setShowToast(false), 3000)
        return () => clearTimeout(timer)
    }, [])

    const handleVoiceInput = () => {
        if (isListening) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setToastMessage('Voice input is not supported in this browser. Try Chrome.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setFormData(prev => ({
                ...prev,
                symptoms: prev.symptoms ? `${prev.symptoms} ${transcript}` : transcript
            }));
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setToastMessage(`Voice error: ${event.error}`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (e) {
            console.error(e);
            setIsListening(false);
        }
    }

    const handlePredict = async () => {
        if (selectedSymptoms.length === 0) {
            setPredictionError('Please select at least one symptom for AI prediction')
            return
        }
        setPredicting(true)
        setPredictionError('')
        setPrediction(null)
        try {
            const result = await predictDisease(selectedSymptoms)
            setPrediction(result)
        } catch (err) {
            setPredictionError(err instanceof Error ? err.message : 'Prediction failed. The AI model may be warming up — please try again in a moment.')
        } finally {
            setPredicting(false)
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!profile) return
        setSubmitting(true)

        try {
            // Insert patient
            const { data: patient, error: patientError } = await supabase
                .from('patients')
                .insert({
                    patient_name: formData.patientName,
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    symptoms: formData.symptoms,
                    symptom_tags: selectedSymptoms,
                    created_by: profile.id,
                    facility_name: profile.facility_name || '',
                })
                .select()
                .single()

            if (patientError) throw patientError

            // Insert prediction if exists
            if (prediction && patient) {
                await supabase.from('predictions').insert({
                    patient_id: patient.id,
                    symptoms_used: selectedSymptoms,
                    predicted_disease: prediction.predicted_disease,
                    confidence: prediction.confidence,
                    disease_description: prediction.description,
                    precautions: prediction.precautions,
                    predicted_by: profile.id,
                })
            }

            setToastMessage('Patient entry submitted successfully!')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
            setFormData({ patientName: '', age: '', gender: '', symptoms: '' })
            setSelectedSymptoms([])
            setPrediction(null)
        } catch (err) {
            setToastMessage(err instanceof Error ? err.message : 'Failed to submit')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        } finally {
            setSubmitting(false)
        }
    }

    const handleRefer = async () => {
        if (!profile || !formData.patientName || !formData.age || !formData.gender) {
            setToastMessage('Please fill in patient details first')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
            return
        }
        setSubmitting(true)

        try {
            // Insert patient first
            const { data: patient, error: patientError } = await supabase
                .from('patients')
                .insert({
                    patient_name: formData.patientName,
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    symptoms: formData.symptoms || 'Not specified',
                    symptom_tags: selectedSymptoms,
                    created_by: profile.id,
                    facility_name: profile.facility_name || '',
                })
                .select()
                .single()

            if (patientError) throw patientError

            // Insert prediction if exists
            let predictionId = null
            if (prediction && patient) {
                const { data: pred } = await supabase
                    .from('predictions')
                    .insert({
                        patient_id: patient.id,
                        symptoms_used: selectedSymptoms,
                        predicted_disease: prediction.predicted_disease,
                        confidence: prediction.confidence,
                        disease_description: prediction.description,
                        precautions: prediction.precautions,
                        predicted_by: profile.id,
                    })
                    .select()
                    .single()
                predictionId = pred?.id
            }

            // Create referral
            await supabase.from('referrals').insert({
                patient_id: patient.id,
                referred_by: profile.id,
                referred_to: 'phc',
                priority: 'medium',
                reason: formData.symptoms || 'Referred for further evaluation',
                prediction_id: predictionId,
            })

            setToastMessage('Patient referred to PHC successfully!')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
            setFormData({ patientName: '', age: '', gender: '', symptoms: '' })
            setSelectedSymptoms([])
            setPrediction(null)
        } catch (err) {
            setToastMessage(err instanceof Error ? err.message : 'Failed to refer')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        } finally {
            setSubmitting(false)
        }
    }

    const firstName = profile?.full_name?.split(' ')[0] || 'User'

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome, {firstName}</h1>
                    <p className="text-muted-foreground">Record patient data and manage referrals</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h2 className="text-2xl font-semibold mb-2">New Patient Entry</h2>
                            <p className="text-muted-foreground mb-6">Record patient information and symptoms</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="patientName" className="block text-sm font-medium mb-2">
                                            Patient Name <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="patientName"
                                            value={formData.patientName}
                                            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="age" className="block text-sm font-medium mb-2">
                                            Age <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="age"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Years"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium mb-2">
                                        Gender <span className="text-destructive">*</span>
                                    </label>
                                    <select
                                        id="gender"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Symptom Multi-Select for AI */}
                                <SymptomSelect selected={selectedSymptoms} onChange={setSelectedSymptoms} />

                                {/* Predict Button */}
                                <button
                                    type="button"
                                    onClick={handlePredict}
                                    disabled={predicting || selectedSymptoms.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {predicting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                    {predicting ? 'Predicting...' : 'Get AI Prediction'}
                                </button>

                                {predictionError && (
                                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{predictionError}</div>
                                )}

                                {prediction && <PredictionResultCard result={prediction} />}

                                <div>
                                    <label htmlFor="symptoms" className="block text-sm font-medium mb-2">
                                        Clinical Notes / Additional Symptoms
                                    </label>
                                    <textarea
                                        id="symptoms"
                                        value={formData.symptoms}
                                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                                        placeholder="Describe symptoms in detail (type or use voice input)"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVoiceInput}
                                        className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isListening
                                            ? 'bg-destructive text-destructive-foreground animate-pulse'
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            }`}
                                    >
                                        <Mic className="h-4 w-4" />
                                        {isListening ? 'Listening...' : 'Voice Input'}
                                    </button>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Patient Entry'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRefer}
                                        disabled={submitting}
                                        className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium disabled:opacity-50"
                                    >
                                        Refer to PHC
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">Health Tips</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <div className="flex items-start gap-2">
                                        <Droplet className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-green-900 dark:text-green-100">Malaria Prevention</h4>
                                            <p className="text-sm text-green-700 dark:text-green-300">Use mosquito nets and keep surroundings clean</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                                    <div className="flex items-start gap-2">
                                        <Droplet className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-orange-900 dark:text-orange-100">Hydration</h4>
                                            <p className="text-sm text-orange-700 dark:text-orange-300">Drink clean water regularly, especially in summer</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start gap-2">
                                        <HandHeart className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-blue-900 dark:text-blue-100">Hand Washing</h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">Wash hands before meals to prevent infections</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-start gap-2">
                                        <Syringe className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-purple-900 dark:text-purple-100">Vaccination</h4>
                                            <p className="text-sm text-purple-700 dark:text-purple-300">Ensure children receive all scheduled vaccines</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showToast && (
                <div className="fixed bottom-8 right-8 bg-card border rounded-lg shadow-lg p-4 flex items-center gap-3 animate-slide-up z-50">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{toastMessage}</span>
                </div>
            )}
        </DashboardLayout>
    )
}
