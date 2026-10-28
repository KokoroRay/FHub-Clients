import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SupportedLanguage, translations, phraseTranslations } from './translations';
import { profileApi } from '../services/api/studentApi';

export type { SupportedLanguage };

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
  nativeName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  { code: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English (US)' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', nativeName: '日本語 (Japanese)' },
];

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (keyOrPhrase: string, fallback?: string, params?: Record<string, string | number>) => string;
  options: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): SupportedLanguage => {
  // 1. Direct language cache
  const cachedLang = localStorage.getItem('fhub_language');
  if (cachedLang === 'vi' || cachedLang === 'en' || cachedLang === 'ja') {
    return cachedLang;
  }

  // 2. User preferences cache
  try {
    const prefs = localStorage.getItem('fhub_user_preferences');
    if (prefs) {
      const parsed = JSON.parse(prefs);
      if (parsed.language === 'vi' || parsed.language === 'en' || parsed.language === 'ja') {
        return parsed.language;
      }
    }
  } catch {}

  // 3. Fallback to browser language
  if (typeof navigator !== 'undefined' && navigator.language) {
    const navLang = navigator.language.toLowerCase();
    if (navLang.startsWith('vi')) return 'vi';
    if (navLang.startsWith('ja')) return 'ja';
    if (navLang.startsWith('en')) return 'en';
  }

  return 'vi';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('fhub_language', newLang);

      // Sync with preferences JSON
      const prefsStr = localStorage.getItem('fhub_user_preferences');
      const prefs = prefsStr ? JSON.parse(prefsStr) : {};
      prefs.language = newLang;
      localStorage.setItem('fhub_user_preferences', JSON.stringify(prefs));

      // Asynchronously update profile backend if logged in
      const token = localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token');
      if (token) {
        profileApi.updateFeedPreferences({ language: newLang as any }).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to persist language preference:', e);
    }
  }, []);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fhub_language' && e.newValue) {
        if (e.newValue === 'vi' || e.newValue === 'en' || e.newValue === 'ja') {
          setLanguageState(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = useCallback(
    (keyOrPhrase: string, fallback?: string, params?: Record<string, string | number>): string => {
      if (!keyOrPhrase) return '';

      // 1. Direct translation key lookup
      let result = translations[language]?.[keyOrPhrase];

      // 2. Phrase-level lookup
      if (!result) {
        result = phraseTranslations[language]?.[keyOrPhrase];
      }

      // 3. Fallback or key itself
      if (!result) {
        result = fallback !== undefined ? fallback : keyOrPhrase;
      }

      // 4. Parameter substitution
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([k, v]) => {
          result = result!.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }

      return result;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        options: LANGUAGE_OPTIONS,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
