import { createContext, useContext, useState, ReactNode } from 'react'
import { LangCode, getT, LANGUAGES } from '@/lib/i18n'

interface LanguageContextType {
    lang: LangCode
    setLang: (l: LangCode) => void
    t: (key: string) => string
    languages: typeof LANGUAGES
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    setLang: () => {},
    t: (k) => k,
    languages: LANGUAGES,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
    const stored = (localStorage.getItem('sehai_lang') as LangCode) || 'en'
    const [lang, setLangState] = useState<LangCode>(stored)

    const setLang = (l: LangCode) => {
        setLangState(l)
        localStorage.setItem('sehai_lang', l)
    }

    return (
        <LanguageContext.Provider value={{ lang, setLang, t: getT(lang), languages: LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    return useContext(LanguageContext)
}
