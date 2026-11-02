import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // If already authenticated, redirect to main portal
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] dark:bg-slate-950 flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-900 relative">
      {/* 1. Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/landing" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
            <img src="/fhub-remove-background.png" alt={t("FHub Logo")} className="w-full h-full object-contain" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                {t("FHub")}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider bg-blue-50 dark:bg-blue-950/60 text-[#0076D1] dark:text-blue-400 border border-blue-200 dark:border-blue-900 uppercase">
                {t("COMMUNITY")}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none">
              {t("Academic Social Network")}
            </p>
          </div>
        </Link>

        {/* Right Switchers */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle size="sm" />
          <LanguageSwitcher variant="compact" />
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 my-auto flex justify-center">
        <Outlet />
      </main>

      {/* 3. Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-600">
        © {new Date().getFullYear()} FHub - {t("FPT University Academic Social Network")}
      </footer>
    </div>
  );
};
