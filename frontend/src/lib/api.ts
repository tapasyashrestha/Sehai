const HF_API_URL = import.meta.env.VITE_HF_API_URL

function getApiUrl(path: string): string {
    if (!HF_API_URL || HF_API_URL === 'undefined') {
        throw new Error('ML model server is not configured. Please set VITE_HF_API_URL.')
    }
    return `${HF_API_URL}${path}`
}

async function parseErrorResponse(response: Response): Promise<string> {
    try {
        const text = await response.text()
        if (!text) return `Server error (${response.status}) — is the backend running?`
        const json = JSON.parse(text)
        return json.detail || json.message || `Server error (${response.status})`
    } catch {
        return `Server error (${response.status}) — is the backend running?`
    }
}

export interface PredictionResult {
    predicted_disease: string
    confidence: number
    description: string
    precautions: string[]
}

export interface ImagePredictionResult {
    predicted_disease: string
    confidence: number
    probabilities: Record<string, number>
}

export async function predictDisease(symptoms: string[]): Promise<PredictionResult> {
    const response = await fetch(getApiUrl('/predict'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
    })
    if (!response.ok) throw new Error(await parseErrorResponse(response))
    return response.json()
}

export async function fetchSymptomsList(): Promise<string[]> {
    const response = await fetch(getApiUrl('/symptoms'))
    if (!response.ok) throw new Error(await parseErrorResponse(response))
    const data = await response.json()
    return data.symptoms
}

export async function predictEyeDisease(file: File): Promise<ImagePredictionResult> {
    const form = new FormData()
    form.append('file', file)
    const response = await fetch(getApiUrl('/predict/eye'), { method: 'POST', body: form })
    if (!response.ok) throw new Error(await parseErrorResponse(response))
    return response.json()
}

export async function predictSkinDisease(file: File): Promise<ImagePredictionResult> {
    const form = new FormData()
    form.append('file', file)
    const response = await fetch(getApiUrl('/predict/skin'), { method: 'POST', body: form })
    if (!response.ok) throw new Error(await parseErrorResponse(response))
    return response.json()
}
