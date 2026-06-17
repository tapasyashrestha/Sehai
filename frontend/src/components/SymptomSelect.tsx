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
        <div ref={containerRef} style={{ position: 'relative' }}>
            <label className="sh-label">
                Select Symptoms for AI Prediction
            </label>

            {/* Selected tags */}
            {selected.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {selected.map(s => (
                        <span
                            key={s}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 14px',
                                borderRadius: 100,
                                background: 'var(--sh-teal-light)',
                                color: 'var(--sh-teal)',
                                border: '1px solid var(--sh-border)',
                                fontSize: '.8rem',
                                fontWeight: 800,
                                fontFamily: 'var(--sh-font-head)',
                                textTransform: 'uppercase',
                                letterSpacing: '.02em'
                            }}
                        >
                            {formatSymptom(s)}
                            <button
                                type="button"
                                onClick={() => removeSymptom(s)}
                                style={{
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 18,
                                    height: 18,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--sh-teal)',
                                    padding: 0,
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Dropdown trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'var(--sh-bg-2)',
                    border: '1.5px solid var(--sh-border)',
                    color: 'var(--sh-text)',
                    fontFamily: 'var(--sh-font-body)',
                    fontSize: '.9rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--sh-teal)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.12)'
                }}
                onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--sh-border)'
                    e.currentTarget.style.boxShadow = 'none'
                }}
            >
                <span style={{ color: selected.length === 0 ? 'var(--sh-muted)' : 'var(--sh-text)', fontWeight: 500 }}>
                    {selected.length === 0 ? 'Search and select symptoms...' : `${selected.length} symptom(s) selected`}
                </span>
                <ChevronDown
                    size={16}
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                        color: 'var(--sh-teal)'
                    }}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 100,
                        width: '100%',
                        marginTop: 6,
                        background: 'var(--sh-bg-2)',
                        border: '1.5px solid var(--sh-border)',
                        borderRadius: 14,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ padding: 10, borderBottom: '1px solid var(--sh-border)' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '8px 12px',
                                borderRadius: 10,
                                background: 'var(--sh-dark-2)',
                                border: '1px solid var(--sh-border)'
                            }}
                        >
                            <Search size={14} style={{ color: 'var(--sh-muted)' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Type to search symptoms..."
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '.88rem',
                                    color: 'var(--sh-text)',
                                    flex: 1,
                                    fontFamily: 'var(--sh-font-body)'
                                }}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: '12px 16px', fontSize: '.88rem', color: 'var(--sh-muted)', textAlign: 'center' }}>
                                No matching symptoms
                            </div>
                        ) : (
                            filtered.slice(0, 50).map(symptom => (
                                <button
                                    key={symptom}
                                    type="button"
                                    onClick={() => addSymptom(symptom)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        textAlign: 'left',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '.88rem',
                                        color: 'var(--sh-text)',
                                        transition: 'background 0.15s',
                                        fontFamily: 'var(--sh-font-body)'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sh-teal-light)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
