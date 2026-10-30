import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { normalizeMediaUrl } from '../../utils/mediaUtils';

export const UserAvatarDropdown: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { t, language, setLanguage, options } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const studentName = currentUser.fullName || t("Sinh viên FHub");
  const avatarInitials = studentName.charAt(0)?.toUpperCase() || 'U';
  const isAdminOrStaff =
    currentUser.role === 'Admin' ||
    currentUser.role === 'Staff' ||
    currentUser.role === 'Community Moderator';

  const handleAction = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  // Color badges for language options
  const langBadgeStyles: Record<SupportedLanguage, string> = {
    vi: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border-rose-500/30',
    en: 'bg-blue-500/15 text-[#0076D1] dark:text-blue-400 font-bold border-blue-500/30',
    ja: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 font-bold border-pink-500/30',
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger: User Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-1 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        {currentUser.avatarUrl ? (
          <img
            src={normalizeMediaUrl(currentUser.avatarUrl)}
            alt={studentName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-white/10"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#0076D1] text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-200 dark:ring-white/10 shrink-0">
            {avatarInitials}
          </div>
        )}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
            {studentName}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {t(`role.${currentUser.role}`, currentUser.role)} {currentUser.studentId ? `· ${currentUser.studentId}` : ''}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover - Compact & Unified */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#272727] rounded-2xl shadow-xl border border-slate-200 dark:border-[#38393d] p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
          {/* 1. Compact User Header */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-100 dark:border-white/5 flex items-center gap-2.5">
            {currentUser.avatarUrl ? (
              <img
                src={normalizeMediaUrl(currentUser.avatarUrl)}
                alt={studentName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0076D1] dark:ring-blue-400 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#0076D1] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#0076D1] dark:ring-blue-400 shrink-0">
                {avatarInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                {studentName}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser.email || currentUser.studentId}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-900/60 text-[#0076D1] dark:text-blue-300">
                  {t(`role.${currentUser.role}`, currentUser.role)}
                </span>
                {currentUser.campus && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-slate-200/80 dark:bg-[#333] text-slate-600 dark:text-slate-300">
                    {currentUser.campus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Theme Switcher Row (Compact & Synchronized) */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#2e2e2e] transition-colors">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              {isDark ? (
                <Moon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span>{t('theme.title', 'Giao diện')}</span>
            </div>
            {/* Inline segmented toggle */}
            <div className="flex items-center bg-slate-200/70 dark:bg-[#1e1e1e] p-0.5 rounded-lg border border-slate-200 dark:border-white/5 text-[11px]">
              <button
                type="button"
                onClick={() => isDark && toggleTheme()}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  !isDark
                    ? 'bg-white text-amber-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {t('theme.light', 'Sáng')}
              </button>
              <button
                type="button"
                onClick={() => !isDark && toggleTheme()}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#3a3b3c] text-blue-400 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {t('theme.dark', 'Tối')}
              </button>
            </div>
          </div>

          {/* 3. Language Switcher Row (Compact & Synchronized) */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#2e2e2e] transition-colors">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>{t('lang.title', 'Ngôn ngữ')}</span>
            </div>
            {/* Inline segmented language pills */}
            <div className="flex items-center bg-slate-200/70 dark:bg-[#1e1e1e] p-0.5 rounded-lg border border-slate-200 dark:border-white/5 text-[10.5px]">
              {options.map((opt) => {
                const isSelected = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setLanguage(opt.code)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                      isSelected
                        ? `border ${langBadgeStyles[opt.code] || 'bg-white text-[#0076D1]'} shadow-2xs`
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                    }`}
                    title={opt.label}
                  >
                    {opt.code.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="my-1 border-t border-slate-100 dark:border-white/5" />

          {/* 4. Quick Navigation Links */}
          <button
            onClick={() => handleAction('/profile')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors cursor-pointer text-left"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#0076D1] dark:text-blue-400 shrink-0" />
            <span>{t('nav.myProfile', 'Hồ sơ cá nhân')}</span>
          </button>

          <button
            onClick={() => handleAction('/settings')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors cursor-pointer text-left"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>{t('nav.settings', 'Cài đặt & Quyền riêng tư')}</span>
          </button>

          {isAdminOrStaff && (
            <button
              onClick={() => handleAction('/admin-console')}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer text-left"
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.adminConsole', 'Admin Console')}</span>
            </button>
          )}

          <button
            onClick={() => handleAction('/tickets')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors cursor-pointer text-left"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{t('nav.supportTickets', 'Hỗ trợ & Ticket')}</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-white/5" />

          {/* 5. Sign Out Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>{t('header.signOut', 'Đăng xuất')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
