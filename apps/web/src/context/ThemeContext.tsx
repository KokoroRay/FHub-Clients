import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profileApi } from '../services/api/studentApi';

export type AppTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): AppTheme => {
  // 1. Direct theme cache
  const cachedTheme = localStorage.getItem('fhub_theme');
  if (cachedTheme === 'light' || cachedTheme === 'dark') {
    return cachedTheme;
  }

  // 2. User preferences cache
  try {
    const prefs = localStorage.getItem('fhub_user_preferences');
    if (prefs) {
      const parsed = JSON.parse(prefs);
      if (parsed.themeMode === 'dark') return 'dark';
      if (parsed.themeMode === 'light') return 'light';
    }
  } catch {}

  // Default to light theme (theme hiện tại)
  return 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(getInitialTheme);

  // Apply theme to DOM document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('fhub_theme', newTheme);

      // Sync with preferences JSON
      const prefsStr = localStorage.getItem('fhub_user_preferences');
      const prefs = prefsStr ? JSON.parse(prefsStr) : {};
      prefs.themeMode = newTheme;
      localStorage.setItem('fhub_user_preferences', JSON.stringify(prefs));

      // Asynchronously update profile backend if logged in
      const token = localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token');
      if (token) {
        profileApi.updateFeedPreferences({ themeMode: newTheme as any }).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to persist theme preference:', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fhub_theme' && e.newValue) {
        if (e.newValue === 'light' || e.newValue === 'dark') {
          setThemeState(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
