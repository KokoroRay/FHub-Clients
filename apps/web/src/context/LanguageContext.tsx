import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SupportedLanguage } from './translations';
import { translateText, normalizeLanguage, formatLocalizedDate, formatLocalizedTime, LANGUAGE_LOCALES, type TranslationParams } from './translate';
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
  locale: string;
  formatDate: (value: string, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (value: string) => string;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (keyOrPhrase: string, fallback?: string, params?: TranslationParams) => string;
  options: LanguageOption[];
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): SupportedLanguage => {
  // 1. Direct language cache
  try {
    const cachedLang = normalizeLanguage(localStorage.getItem('fhub_language'));
    if (cachedLang) return cachedLang;
  } catch {}

  // 2. User preferences cache
  try {
    const prefs = localStorage.getItem('fhub_user_preferences');
    if (prefs) {
      const parsed = JSON.parse(prefs);
      const preference = normalizeLanguage(parsed.language);
      if (preference) return preference;
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
    const normalized = normalizeLanguage(newLang);
    if (!normalized) return;
    newLang = normalized;
    setLanguageState(newLang);
    try {
      localStorage.setItem('fhub_language', newLang);

      // Sync with preferences JSON
      const prefsStr = localStorage.getItem('fhub_user_preferences');
      let prefs: Record<string, unknown> = {};
      try {
        const parsed = prefsStr ? JSON.parse(prefsStr) : {};
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) prefs = parsed;
      } catch {}
      prefs.language = newLang;
      localStorage.setItem('fhub_user_preferences', JSON.stringify(prefs));

      // Asynchronously update profile backend if logged in
      const token = localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token');
      if (token) {
        profileApi.updateFeedPreferences(prefs).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to persist language preference:', e);
    }
  }, []);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fhub_language') {
        const updatedLanguage = normalizeLanguage(e.newValue);
        if (updatedLanguage) setLanguageState(updatedLanguage);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (keyOrPhrase: string, fallback?: string, params?: TranslationParams) =>
      translateText(language, keyOrPhrase, fallback, params),
    [language]
  );
  const formatDate = useCallback((value: string, options?: Intl.DateTimeFormatOptions) =>
    formatLocalizedDate(language, value, options), [language]);
  const formatTime = useCallback((value: string) => formatLocalizedTime(language, value), [language]);
  return (
    <LanguageContext.Provider
      value={{
        language,
        locale: LANGUAGE_LOCALES[language],
        formatDate,
        formatTime,
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
