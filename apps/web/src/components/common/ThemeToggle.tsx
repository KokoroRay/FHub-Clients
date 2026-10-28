import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const btnPadding = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-xs',
    lg: 'p-2.5 text-sm',
  };

  const labelText = isDark ? t('theme.light', 'Sáng') : t('theme.dark', 'Tối');
  const titleText = isDark
    ? t('theme.switchToLight', 'Chuyển sang giao diện sáng')
    : t('theme.switchToDark', 'Chuyển sang giao diện tối');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={titleText}
      aria-label={titleText}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all cursor-pointer shadow-2xs ${btnPadding[size]} ${className}`}
    >
      {isDark ? (
        <Sun className={`${iconSizes[size]} text-amber-400 animate-in spin-in-90 duration-200`} />
      ) : (
        <Moon className={`${iconSizes[size]} text-indigo-500 animate-in spin-in-90 duration-200`} />
      )}
      {showLabel && <span className="font-semibold">{labelText}</span>}
    </button>
  );
};
