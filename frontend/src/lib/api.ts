const HF_API_URL = import.meta.env.VITE_HF_API_URL

export interface PredictionResult {
    predicted_disease: string
    confidence: number
    description: string
    precautions: string[]
}

export async function predictDisease(symptoms: string[]): Promise<PredictionResult> {
    const response = await fetch(`${HF_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Prediction failed')
    }
    return response.json()
}

export async function fetchSymptomsList(): Promise<string[]> {
    const response = await fetch(`${HF_API_URL}/symptoms`)
    if (!response.ok) throw new Error('Failed to fetch symptoms')
    const data = await response.json()
    return data.symptoms
}
