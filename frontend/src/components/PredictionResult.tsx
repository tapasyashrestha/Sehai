import { Activity, Shield, AlertTriangle } from 'lucide-react'
import type { PredictionResult as PredictionResultType } from '@/lib/api'

interface PredictionResultProps {
    result: PredictionResultType
}

export default function PredictionResult({ result }: PredictionResultProps) {
    const confidencePercent = (result.confidence * 100).toFixed(1)

    return (
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">AI Prediction Result</h3>
            </div>

            {/* Disease & Confidence */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Predicted Disease</span>
                    <span className="text-sm font-medium text-primary">{confidencePercent}% confidence</span>
                </div>
                <p className="text-xl font-bold">{result.predicted_disease}</p>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${confidencePercent}%` }}
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Description</span>
                </div>
                <p className="text-sm text-muted-foreground">{result.description}</p>
            </div>

            {/* Precautions */}
            {result.precautions.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Recommended Precautions</span>
                    </div>
                    <ul className="space-y-1">
                        {result.precautions.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="text-primary mt-0.5">•</span>
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <p className="text-xs text-muted-foreground italic">
                This is an AI-assisted prediction and should not replace professional medical diagnosis.
            </p>
        </div>
    )
}
