import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, placeholder, ...props }, ref) => {
    const { t } = useLanguage();
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const translatedLabel = label ? t(label) : undefined;
    const translatedPlaceholder = placeholder ? t(placeholder) : undefined;

    return (
      <div className="w-full">
        {translatedLabel && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {translatedLabel}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            placeholder={translatedPlaceholder}
            className={`w-full bg-white dark:bg-slate-900 border ${
              error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-blue-600'
            } rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors py-2.5 ${
              leftIcon ? 'pl-9' : 'pl-3.5'
            } ${rightIcon ? 'pr-9' : 'pr-3.5'} focus:outline-none focus:ring-1 ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, placeholder, ...props }, ref) => {
    const { t } = useLanguage();
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const translatedLabel = label ? t(label) : undefined;
    const translatedPlaceholder = placeholder ? t(placeholder) : undefined;

    return (
      <div className="w-full">
        {translatedLabel && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {translatedLabel}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          placeholder={translatedPlaceholder}
          className={`w-full bg-white dark:bg-slate-900 border ${
            error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-blue-600'
          } rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors p-3 focus:outline-none focus:ring-1 min-h-[100px] ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className = '', id, children, options, ...props }, ref) => {
    const { t } = useLanguage();
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const translatedLabel = label ? t(label) : undefined;

    return (
      <div className="w-full">
        {translatedLabel && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {translatedLabel}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-white dark:bg-slate-900 border ${
            error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-blue-600'
          } rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors py-2.5 px-3 focus:outline-none focus:ring-1 ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';
