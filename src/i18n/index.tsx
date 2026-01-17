import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, TranslationKeys } from './types';
import { translations } from './translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: keyof TranslationKeys) => string;
    isChanging: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'portfolio-language';

function getInitialLanguage(): Language {
    // Check localStorage first
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'it' || stored === 'en') {
            return stored;
        }

        // Detect browser language
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('it')) {
            return 'it';
        }
    }
    return 'en';
}

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>('en');
    const [isChanging, setIsChanging] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize language on mount (client-side only)
    useEffect(() => {
        const initialLang = getInitialLanguage();
        setLanguageState(initialLang);
        setIsInitialized(true);
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setIsChanging(true);

        // Small delay to allow shuffle animation to start
        setTimeout(() => {
            setLanguageState(lang);
            localStorage.setItem(STORAGE_KEY, lang);

            // Reset changing state after animation
            setTimeout(() => {
                setIsChanging(false);
            }, 600);
        }, 50);
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguage(language === 'it' ? 'en' : 'it');
    }, [language, setLanguage]);

    const t = useCallback((key: keyof TranslationKeys): string => {
        return translations[language][key] || key;
    }, [language]);

    // Don't render children until initialized to prevent hydration mismatch
    if (!isInitialized) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isChanging }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}

export { type Language } from './types';
