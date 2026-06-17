import { useState, FormEvent, useEffect, useRef } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import SymptomSelect from '@/components/SymptomSelect'
import PredictionResultCard from '@/components/PredictionResult'
import { Mic, CheckCircle, Droplet, HandHeart, Syringe, Loader2, Eye, Scan, Upload, Activity, Users, ArrowRight, Globe } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { predictDisease, predictEyeDisease, predictSkinDisease, type PredictionResult, type ImagePredictionResult } from '@/lib/api'
import '@/styles/sehai-theme.css'

type DiagTab = 'symptom' | 'eye' | 'skin'

export default function ANMDashboard() {
    const { profile } = useAuth()
    const { t } = useLanguage()

    const [diagTab, setDiagTab] = useState<DiagTab>('symptom')
    const [isListening, setIsListening] = useState(false)
    const [toast, setToast] = useState('')
    const [toastType, setToastType] = useState<'success' | 'error'>('success')
    const [formData, setFormData] = useState({ patientName: '', age: '', gender: '', symptoms: '' })
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
    const [prediction, setPrediction] = useState<PredictionResult | null>(null)
    const [predicting, setPredicting] = useState(false)
    const [predictionError, setPredictionError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [todayCount, setTodayCount] = useState(0)
    const [referralCount, setReferralCount] = useState(0)

    const [eyeFile, setEyeFile] = useState<File | null>(null)
    const [eyePreview, setEyePreview] = useState<string | null>(null)
    const [eyeResult, setEyeResult] = useState<ImagePredictionResult | null>(null)
    const [eyeLoading, setEyeLoading] = useState(false)
    const [eyeError, setEyeError] = useState('')

    const [skinFile, setSkinFile] = useState<File | null>(null)
    const [skinPreview, setSkinPreview] = useState<string | null>(null)
    const [skinResult, setSkinResult] = useState<ImagePredictionResult | null>(null)
    const [skinLoading, setSkinLoading] = useState(false)
    const [skinError, setSkinError] = useState('')

    const eyeInputRef = useRef<HTMLInputElement>(null)
    const skinInputRef = useRef<HTMLInputElement>(null)

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast(msg); setToastType(type)
        setTimeout(() => setToast(''), 3500)
    }

    useEffect(() => {
        showToast(t('welcome_back'))
        if (profile?.id) {
            const token = localStorage.getItem('sehai_token')
            fetch('/api/patients/stats/today', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setTodayCount(data.patients_today ?? 0)
                    setReferralCount(data.referrals_today ?? 0)
                })
                .catch(err => console.error('Error fetching dashboard stats:', err))
        }
    }, [profile])

    const handleVoiceInput = () => {
        if (isListening) return
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SR) { showToast('Voice input not supported. Try Chrome.', 'error'); return }
        const rec = new SR()
        rec.onstart = () => setIsListening(true)
        rec.onresult = (e: any) => {
            const tx = e.results[0][0].transcript
            setFormData(p => ({ ...p, symptoms: p.symptoms ? `${p.symptoms} ${tx}` : tx }))
        }
        rec.onerror = (e: any) => { showToast(`Voice error: ${e.error}`, 'error'); setIsListening(false) }
        rec.onend = () => setIsListening(false)
        try { rec.start() } catch { setIsListening(false) }
    }

    const handlePredict = async () => {
        if (selectedSymptoms.length === 0) { setPredictionError('Please select at least one symptom'); return }
        setPredicting(true); setPredictionError(''); setPrediction(null)
        try { setPrediction(await predictDisease(selectedSymptoms)) }
        catch (err) { setPredictionError(err instanceof Error ? err.message : 'Prediction failed.') }
        finally { setPredicting(false) }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!profile) return
        setSubmitting(true)
        try {
            const token = localStorage.getItem('sehai_token')
            const pRes = await fetch('/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient_name: formData.patientName,
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    symptoms: formData.symptoms || 'Not specified',
                    symptom_tags: selectedSymptoms,
                    contact: '',
                    address: '',
                    medical_history: '',
                    vitals: {},
                    notes: ''
                })
            })
            if (!pRes.ok) throw new Error(await pRes.text())
            const patient = await pRes.json()

            if (prediction && patient) {
                const prRes = await fetch('/api/predictions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        patient_id: patient.id,
                        symptoms_used: selectedSymptoms,
                        predicted_disease: prediction.predicted_disease,
                        confidence: prediction.confidence,
                        disease_description: prediction.description || '',
                        precautions: prediction.precautions || []
                    })
                })
                if (!prRes.ok) throw new Error(await prRes.text())
            }
            showToast(t('submit_entry') + ' ✓')
            setFormData({ patientName: '', age: '', gender: '', symptoms: '' })
            setSelectedSymptoms([]); setPrediction(null)
            setTodayCount(c => c + 1)
        } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to submit', 'error') }
        finally { setSubmitting(false) }
    }

    const handleRefer = async () => {
        if (!profile || !formData.patientName || !formData.age || !formData.gender) {
            showToast('Please fill in patient details first', 'error'); return
        }
        setSubmitting(true)
        try {
            const token = localStorage.getItem('sehai_token')
            const pRes = await fetch('/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient_name: formData.patientName,
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    symptoms: formData.symptoms || 'Not specified',
                    symptom_tags: selectedSymptoms,
                    contact: '',
                    address: '',
                    medical_history: '',
                    vitals: {},
                    notes: ''
                })
            })
            if (!pRes.ok) throw new Error(await pRes.text())
            const patient = await pRes.json()

            let predictionId = null
            if (prediction && patient) {
                const prRes = await fetch('/api/predictions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        patient_id: patient.id,
                        symptoms_used: selectedSymptoms,
                        predicted_disease: prediction.predicted_disease,
                        confidence: prediction.confidence,
                        disease_description: prediction.description || '',
                        precautions: prediction.precautions || []
                    })
                })
                if (!prRes.ok) throw new Error(await prRes.text())
                const pred = await prRes.json()
                predictionId = pred.id
            }

            const rRes = await fetch('/api/referrals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient_id: patient.id,
                    referred_to: 'phc',
                    priority: 'medium',
                    reason: formData.symptoms || 'Referred for further evaluation',
                    prediction_id: predictionId
                })
            })
            if (!rRes.ok) throw new Error(await rRes.text())

            showToast(t('refer_to_phc') + ' ✓')
            setFormData({ patientName: '', age: '', gender: '', symptoms: '' })
            setSelectedSymptoms([]); setPrediction(null)
            setReferralCount(c => c + 1)
        } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to refer', 'error') }
        finally { setSubmitting(false) }
    }

    const handleEyeFile = (f: File) => { setEyeFile(f); setEyeResult(null); setEyeError(''); setEyePreview(URL.createObjectURL(f)) }
    const handleEyePredict = async () => {
        if (!eyeFile) return
        setEyeLoading(true); setEyeError('')
        try { setEyeResult(await predictEyeDisease(eyeFile)) }
        catch (err) { setEyeError(err instanceof Error ? err.message : 'Prediction failed') }
        finally { setEyeLoading(false) }
    }
    const handleSkinFile = (f: File) => { setSkinFile(f); setSkinResult(null); setSkinError(''); setSkinPreview(URL.createObjectURL(f)) }
    const handleSkinPredict = async () => {
        if (!skinFile) return
        setSkinLoading(true); setSkinError('')
        try { setSkinResult(await predictSkinDisease(skinFile)) }
        catch (err) { setSkinError(err instanceof Error ? err.message : 'Prediction failed') }
        finally { setSkinLoading(false) }
    }

    const firstName = profile?.full_name?.split(' ')[0] || 'User'

    const tabStyle = (active: boolean, color = 'var(--sh-teal)'): React.CSSProperties => ({
        flex: 1, padding: '12px 8px', border: 'none', cursor: 'pointer', borderRadius: 12,
        fontFamily: 'var(--sh-font-head)', fontWeight: 800, fontSize: '.82rem',
        textTransform: 'uppercase', letterSpacing: '.04em', transition: 'all .2s',
        background: active ? color : 'transparent',
        color: active ? '#fff' : 'var(--sh-muted)',
        boxShadow: active ? '0 4px 14px rgba(43,191,160,.3)' : 'none',
    })

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* ── WELCOME BANNER ── */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--sh-dark) 0%, var(--sh-dark-2) 100%)',
                    borderRadius: 24, padding: '28px 32px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
                    boxShadow: '0 8px 32px rgba(26,58,52,.35)',
                }}>
                    <div>
                        <div style={{ fontSize: '.75rem', fontFamily: 'var(--sh-font-head)', fontWeight: 800, color: 'var(--sh-teal)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
                            ANM · {profile?.facility_name || 'Sub-Centre'}
                        </div>
                        <h1 style={{ fontFamily: 'var(--sh-font-head)', fontWeight: 900, fontSize: '1.8rem', color: '#fff', margin: 0, letterSpacing: '-.01em' }}>
                            Welcome, <span style={{ color: 'var(--sh-teal)' }}>{firstName}</span>
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.88rem', margin: '6px 0 0', fontWeight: 300 }}>{t('anm_subtitle')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ background: 'rgba(43,191,160,.12)', border: '1px solid rgba(43,191,160,.25)', borderRadius: 16, padding: '16px 24px', textAlign: 'center', minWidth: 100 }}>
                            <div style={{ fontFamily: 'var(--sh-font-head)', fontWeight: 900, fontSize: '2rem', color: 'var(--sh-teal)', lineHeight: 1 }}>{todayCount}</div>
                            <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.5)', fontFamily: 'var(--sh-font-head)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 4 }}>Patients Today</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '16px 24px', textAlign: 'center', minWidth: 100 }}>
                            <div style={{ fontFamily: 'var(--sh-font-head)', fontWeight: 900, fontSize: '2rem', color: '#fff', lineHeight: 1 }}>{referralCount}</div>
                            <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--sh-font-head)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 4 }}>Referrals Today</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
                    {/* ── MAIN COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* ── AI DIAGNOSIS CARD (tabbed) ── */}
                        <div className="sh-card">
                            <div className="sh-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--sh-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Activity size={18} color="var(--sh-teal)" />
                                    </div>
                                    <div>
                                        <div className="sh-card-title">AI Diagnosis</div>
                                        <div className="sh-card-sub">Symptom check · Eye scan · Skin scan</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div style={{ padding: '16px 24px 0' }}>
                                <div style={{ display: 'flex', gap: 8, background: 'var(--sh-bg)', borderRadius: 14, padding: 6 }}>
                                    <button style={tabStyle(diagTab === 'symptom')} onClick={() => setDiagTab('symptom')}>
                                        <CheckCircle size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                                        Symptoms
                                    </button>
                                    <button style={tabStyle(diagTab === 'eye', '#0ea5e9')} onClick={() => setDiagTab('eye')}>
                                        <Eye size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                                        {t('eye_disease_detection').split(' ')[0]}
                                    </button>
                                    <button style={tabStyle(diagTab === 'skin', '#d97706')} onClick={() => setDiagTab('skin')}>
                                        <Scan size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                                        {t('skin_disease_detection').split(' ')[0]}
                                    </button>
                                </div>
                            </div>

                            {/* ─ Symptom Tab ─ */}
                            {diagTab === 'symptom' && (
                                <div style={{ padding: 24 }}>
                                    <SymptomSelect selected={selectedSymptoms} onChange={setSelectedSymptoms} />
                                    <button type="button" onClick={handlePredict}
                                        disabled={predicting || selectedSymptoms.length === 0} className="sh-btn-primary"
                                        style={{ marginTop: 16, alignSelf: 'flex-start' }}>
                                        {predicting
                                            ? <><Loader2 size={15} style={{ animation: 'spin .8s linear infinite' }} /> {t('predicting')}</>
                                            : <><CheckCircle size={15} /> {t('get_ai_prediction')}</>}
                                    </button>
                                    {predictionError && (
                                        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: '#dc2626', fontSize: '.87rem' }}>
                                            {predictionError}
                                        </div>
                                    )}
                                    {prediction && <div style={{ marginTop: 12 }}><PredictionResultCard result={prediction} /></div>}
                                </div>
                            )}

                            {/* ─ Eye Tab ─ */}
                            {diagTab === 'eye' && (
                                <div style={{ padding: 24 }}>
                                    <p style={{ fontSize: '.85rem', color: 'var(--sh-muted)', marginBottom: 16, fontWeight: 300 }}>{t('eye_disease_sub')}</p>
                                    <input ref={eyeInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                                        onChange={e => e.target.files?.[0] && handleEyeFile(e.target.files[0])} />
                                    <div className="sh-upload-zone" style={{ borderColor: 'rgba(14,165,233,.4)' }}
                                        onClick={() => eyeInputRef.current?.click()}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleEyeFile(e.dataTransfer.files[0]) }}>
                                        {eyePreview
                                            ? <img src={eyePreview} alt="Eye" style={{ maxHeight: 180, margin: '0 auto', display: 'block', borderRadius: 10, objectFit: 'contain' }} />
                                            : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--sh-muted)' }}>
                                                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Eye size={26} color="#0ea5e9" />
                                                </div>
                                                <span style={{ fontSize: '.85rem', fontFamily: 'var(--sh-font-head)', fontWeight: 700 }}>{t('upload_eye')}</span>
                                                <span style={{ fontSize: '.75rem', color: 'var(--sh-muted-2)' }}>PNG, JPG up to 10MB</span>
                                            </div>}
                                    </div>
                                    {eyeFile && (
                                        <button onClick={handleEyePredict} disabled={eyeLoading}
                                            style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 50, border: 'none', cursor: 'pointer', background: '#0ea5e9', color: '#fff', fontFamily: 'var(--sh-font-head)', fontWeight: 800, fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.04em', boxShadow: '0 4px 14px rgba(14,165,233,.35)' }}>
                                            {eyeLoading ? <><Loader2 size={14} style={{ animation: 'spin .8s linear infinite' }} /> {t('analysing')}</> : <><Eye size={14} /> {t('analyse_eye')}</>}
                                        </button>
                                    )}
                                    {eyeError && <p style={{ marginTop: 10, fontSize: '.85rem', color: '#dc2626', padding: '8px 12px', background: '#fee2e2', borderRadius: 8 }}>{eyeError}</p>}
                                    {eyeResult && (
                                        <div style={{ marginTop: 18, padding: 20, borderRadius: 16, background: '#e0f2fe', border: '1.5px solid rgba(14,165,233,.3)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Eye size={16} color="#fff" />
                                                </div>
                                                <div>
                                                    <span style={{ fontFamily: 'var(--sh-font-head)', fontWeight: 900, color: 'var(--sh-dark)', fontSize: '.9rem' }}>{t('result')}: </span>
                                                    <span style={{ fontFamily: 'var(--sh-font-head)', fontWeight: 900, color: eyeResult.predicted_disease === 'Normal' ? '#16a34a' : '#dc2626', fontSize: '.9rem' }}>{eyeResult.predicted_disease}</span>
                                                    <span style={{ marginLeft: 8, fontSize: '.78rem', color: 'var(--sh-muted)' }}>({(eyeResult.confidence * 100).toFixed(1)}% {t('confidence')})</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {Object.entries(eyeResult.probabilities).map(([cls, prob]) => (
                                                    <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.82rem' }}>
                                                        <span style={{ width: 110, color: 'var(--sh-muted)', flexShrink: 0, fontFamily: 'var(--sh-font-head)', fontWeight: 700 }}>{cls}</span>
                                                        <div style={{ flex: 1, height: 6, borderRadius: 100, background: 'rgba(14,165,233,.2)', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', background: '#0ea5e9', width: `${prob * 100}%`, borderRadius: 100, transition: 'width .6s ease' }} />
                                                        </div>
                                                        <span style={{ width: 44, textAlign: 'right', color: 'var(--sh-text)', fontWeight: 700 }}>{(prob * 100).toFixed(1)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ─ Skin Tab ─ */}
                            {diagTab === 'skin' && (
                                <div style={{ padding: 24 }}>
                                    <p style={{ fontSize: '.85rem', color: 'var(--sh-muted)', marginBottom: 16, fontWeight: 300 }}>{t('skin_disease_sub')}</p>
                                    <input ref={skinInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                                        onChange={e => e.target.files?.[0] && handleSkinFile(e.target.files[0])} />
                                    <div className="sh-upload-zone" style={{ borderColor: 'rgba(217,119,6,.4)' }}
                                        onClick={() => skinInputRef.current?.click()}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleSkinFile(e.dataTransfer.files[0]) }}>
                                        {skinPreview
                                            ? <img src={skinPreview} alt="Skin" style={{ maxHeight: 180, margin: '0 auto', display: 'block', borderRadius: 10, objectFit: 'contain' }} />
                                            : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--sh-muted)' }}>
                                                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Scan size={26} color="#d97706" />
                                                </div>
                                                <span style={{ fontSize: '.85rem', fontFamily: 'var(--sh-font-head)', fontWeight: 700 }}>{t('upload_skin')}</span>
                                                <span style={{ fontSize: '.75rem', color: 'var(--sh-muted-2)' }}>PNG, JPG up to 10MB</span>
                                            </div>}
                                    </div>
                                    {skinFile && (
                                        <button onClick={handleSkinPredict} disabled={skinLoading}
                                            style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 50, border: 'none', cursor: 'pointer', background: '#d97706', color: '#fff', fontFamily: 'var(--sh-font-head)', fontWeight: 800, fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.04em', boxShadow: '0 4px 14px rgba(217,119,6,.35)' }}>
                                            {skinLoading ? <><Loader2 size={14} style={{ animation: 'spin .8s linear infinite' }} /> {t('analysing')}</> : <><Scan size={14} /> {t('analyse_skin')}</>}
                                        </button>
                                    )}
                                    {skinError && <p style={{ marginTop: 10, fontSize: '.85rem', color: '#dc2626', padding: '8px 12px', background: '#fee2e2', borderRadius: 8 }}>{skinError}</p>}
                                    {skinResult && (
                                        <div style={{ marginTop: 18, padding: 20, borderRadius: 16, background: '#fffbeb', border: '1.5px solid rgba(217,119,6,.3)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Scan size={16} color="#fff" />
                                                </div>
                                                <div>
                                                    <span style={{ fontFamily: 'var(--sh-font-head)', fontWeight: 900, color: 'var(--sh-dark)', fontSize: '.9rem' }}>{t('result')}: </span>
                                                    <span style={{ fontFamily: 'var(--sh-font-head)', fontWeight: 900, color: '#d97706', fontSize: '.9rem' }}>{skinResult.predicted_disease}</span>
                                                    <span style={{ marginLeft: 8, fontSize: '.78rem', color: 'var(--sh-muted)' }}>({(skinResult.confidence * 100).toFixed(1)}% {t('confidence')})</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {Object.entries(skinResult.probabilities).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cls, prob]) => (
                                                    <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.82rem' }}>
                                                        <span style={{ width: 130, color: 'var(--sh-muted)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--sh-font-head)', fontWeight: 700 }}>{cls}</span>
                                                        <div style={{ flex: 1, height: 6, borderRadius: 100, background: 'rgba(217,119,6,.2)', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', background: '#d97706', width: `${prob * 100}%`, borderRadius: 100, transition: 'width .6s ease' }} />
                                                        </div>
                                                        <span style={{ width: 44, textAlign: 'right', color: 'var(--sh-text)', fontWeight: 700 }}>{(prob * 100).toFixed(1)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── PATIENT ENTRY FORM ── */}
                        <div className="sh-card">
                            <div className="sh-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--sh-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Users size={18} color="var(--sh-teal)" />
                                    </div>
                                    <div>
                                        <div className="sh-card-title">{t('new_patient_entry')}</div>
                                        <div className="sh-card-sub">{t('new_patient_sub')}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: 24 }}>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div>
                                            <label className="sh-label">{t('patient_name')} <span style={{ color: '#dc2626' }}>*</span></label>
                                            <input className="sh-input" type="text" placeholder={t('patient_name_ph')}
                                                value={formData.patientName}
                                                onChange={e => setFormData(p => ({ ...p, patientName: e.target.value }))} required />
                                        </div>
                                        <div>
                                            <label className="sh-label">{t('age')} <span style={{ color: '#dc2626' }}>*</span></label>
                                            <input className="sh-input" type="number" placeholder={t('age_ph')}
                                                value={formData.age}
                                                onChange={e => setFormData(p => ({ ...p, age: e.target.value }))} required />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="sh-label">{t('gender')} <span style={{ color: '#dc2626' }}>*</span></label>
                                        <select className="sh-select" value={formData.gender}
                                            onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))} required>
                                            <option value="">{t('select_gender')}</option>
                                            <option value="male">{t('male')}</option>
                                            <option value="female">{t('female')}</option>
                                            <option value="other">{t('other')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="sh-label">{t('clinical_notes')}</label>
                                        <textarea className="sh-textarea" placeholder={t('clinical_notes_ph')}
                                            value={formData.symptoms}
                                            onChange={e => setFormData(p => ({ ...p, symptoms: e.target.value }))} />
                                        <button type="button" onClick={handleVoiceInput} className={`sh-btn-voice${isListening ? ' listening' : ''}`}>
                                            <Mic size={15} />
                                            {isListening ? t('listening') : t('voice_input')}
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: 12, paddingTop: 4, flexWrap: 'wrap' }}>
                                        <button type="submit" disabled={submitting} className="sh-btn-primary">
                                            {submitting ? t('submitting') : <><CheckCircle size={15} /> {t('submit_entry')}</>}
                                        </button>
                                        <button type="button" onClick={handleRefer} disabled={submitting} className="sh-btn-secondary">
                                            <ArrowRight size={15} /> {t('refer_to_phc')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* ── SIDEBAR ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="sh-card" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--sh-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--sh-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle size={16} color="var(--sh-teal)" />
                                </div>
                                <span style={{ fontFamily: 'var(--sh-font-head)', fontWeight: 900, fontSize: '.92rem', color: 'var(--sh-dark)', textTransform: 'uppercase', letterSpacing: '.02em' }}>{t('health_tips')}</span>
                            </div>
                            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { icon: <Droplet size={16} color="#16a34a" />, bg: '#f0fdf4', border: '#bbf7d0', titleColor: '#15803d', textColor: '#166534', title: t('tip_malaria_title'), text: t('tip_malaria_text') },
                                    { icon: <Droplet size={16} color="#ea580c" />, bg: '#fff7ed', border: '#fed7aa', titleColor: '#c2410c', textColor: '#9a3412', title: t('tip_hydration_title'), text: t('tip_hydration_text') },
                                    { icon: <HandHeart size={16} color="var(--sh-teal)" />, bg: 'var(--sh-teal-light)', border: 'rgba(43,191,160,.3)', titleColor: 'var(--sh-teal-3)', textColor: 'var(--sh-dark-2)', title: t('tip_handwash_title'), text: t('tip_handwash_text') },
                                    { icon: <Syringe size={16} color="#7c3aed" />, bg: '#faf5ff', border: '#e9d5ff', titleColor: '#6d28d9', textColor: '#5b21b6', title: t('tip_vaccine_title'), text: t('tip_vaccine_text') },
                                ].map((tip, i) => (
                                    <div key={i} style={{ padding: '12px 14px', borderRadius: 12, border: `1px solid ${tip.border}`, background: tip.bg, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <div style={{ flexShrink: 0, marginTop: 1 }}>{tip.icon}</div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--sh-font-head)', fontWeight: 900, fontSize: '.82rem', color: tip.titleColor, marginBottom: 2 }}>{tip.title}</div>
                                            <div style={{ fontSize: '.76rem', color: tip.textColor, lineHeight: 1.5, fontWeight: 300 }}>{tip.text}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick action links */}
                        <div className="sh-card" style={{ padding: '16px 20px' }}>
                            <div style={{ fontFamily: 'var(--sh-font-head)', fontWeight: 900, fontSize: '.82rem', color: 'var(--sh-dark)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Quick Actions</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: 'Symptom Check', action: () => setDiagTab('symptom'), color: 'var(--sh-teal)' },
                                    { label: t('eye_disease_detection'), action: () => setDiagTab('eye'), color: '#0ea5e9' },
                                    { label: t('skin_disease_detection'), action: () => setDiagTab('skin'), color: '#d97706' },
                                ].map((item, i) => (
                                    <button key={i} onClick={item.action}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--sh-border)', background: 'var(--sh-bg)', cursor: 'pointer', fontFamily: 'var(--sh-font-head)', fontWeight: 700, fontSize: '.78rem', color: 'var(--sh-text)', transition: 'all .15s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = item.color; (e.currentTarget as HTMLButtonElement).style.color = item.color }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--sh-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--sh-text)' }}
                                    >
                                        <span>{item.label}</span>
                                        <ArrowRight size={13} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="sh-toast" style={{ borderLeftColor: toastType === 'error' ? '#dc2626' : 'var(--sh-teal)' }}>
                    {toastType === 'error'
                        ? <span style={{ color: '#dc2626', fontSize: '1rem' }}>✕</span>
                        : <CheckCircle size={18} color="var(--sh-teal)" />}
                    {toast}
                </div>
            )}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </DashboardLayout>
    )
}
