import { useState, useRef, useEffect } from 'react'
import { X, Search, ChevronDown } from 'lucide-react'
import { SYMPTOM_LIST, formatSymptom } from '@/lib/symptoms'

interface SymptomSelectProps {
    selected: string[]
    onChange: (symptoms: string[]) => void
}

export default function SymptomSelect({ selected, onChange }: SymptomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    const filtered = SYMPTOM_LIST.filter(
        s => !selected.includes(s) && formatSymptom(s).toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const addSymptom = (symptom: string) => {
        onChange([...selected, symptom])
        setSearch('')
    }

    const removeSymptom = (symptom: string) => {
        onChange(selected.filter(s => s !== symptom))
    }

    return (
        <div ref={containerRef} className="relative">
            <label className="block text-sm font-medium mb-2">
                Select Symptoms for AI Prediction
            </label>

            {/* Selected tags */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selected.map(s => (
                        <span
                            key={s}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                        >
                            {formatSymptom(s)}
                            <button
                                type="button"
                                onClick={() => removeSymptom(s)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Dropdown trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 rounded-lg border bg-background text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <span className="text-muted-foreground">
                    {selected.length === 0 ? 'Search and select symptoms...' : `${selected.length} symptom(s) selected`}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-card border rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 border-b">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Type to search symptoms..."
                                className="bg-transparent outline-none text-sm flex-1"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-muted-foreground">No matching symptoms</div>
                        ) : (
                            filtered.slice(0, 50).map(symptom => (
                                <button
                                    key={symptom}
                                    type="button"
                                    onClick={() => addSymptom(symptom)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors"
                                >
                                    {formatSymptom(symptom)}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
