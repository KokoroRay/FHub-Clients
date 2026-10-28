import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Check, RefreshCw } from 'lucide-react';
import { courseNodesApi, CourseNodeListItem } from '../../services/api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  filterCompactCourses,
  getHideOutOfMajorCompactSetting,
  resolveUserMajorCode,
} from '../../utils/courseFilter';

export interface CourseSelectProps {
  label?: string;
  value: string;
  onChange: (value: string, selectedCourse?: CourseNodeListItem) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  id?: string;
}

// Global module-level cache for course catalog so all modals share data without re-fetching
let cachedCourses: CourseNodeListItem[] | null = null;
let fetchPromise: Promise<CourseNodeListItem[]> | null = null;

export const CourseSelect: React.FC<CourseSelectProps> = ({
  label = 'Môn học liên quan',
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  allowEmpty = false,
  emptyLabel = '-- Chọn môn học --',
  id,
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<CourseNodeListItem[]>(cachedCourses || []);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedCourses);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterMajor, setIsFilterMajor] = useState<boolean>(getHideOutOfMajorCompactSetting);

  const majorCode = useMemo(() => resolveUserMajorCode(currentUser), [currentUser]);

  // Synchronize when preference changes in Settings
  useEffect(() => {
    const handlePrefChange = (e: any) => {
      if (typeof e.detail?.hideOutOfMajorCompact === 'boolean') {
        setIsFilterMajor(e.detail.hideOutOfMajorCompact);
      }
    };
    window.addEventListener('fhub_preferences_changed', handlePrefChange);
    return () => window.removeEventListener('fhub_preferences_changed', handlePrefChange);
  }, []);

  // Fetch full course catalog (all ~1,148 courses)
  useEffect(() => {
    if (cachedCourses && cachedCourses.length > 0) {
      setCourses(cachedCourses);
      setIsLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = courseNodesApi
        .getCourseNodes({ pageSize: 2000 })
        .then((res) => {
          const items = (res as any)?.items || res || [];
          const list = Array.isArray(items) ? items : [];
          cachedCourses = list;
          return list;
        })
        .catch((err) => {
          console.warn('Failed to load full course catalog in CourseSelect:', err);
          fetchPromise = null;
          return [];
        });
    }

    let isMounted = true;
    fetchPromise.then((list) => {
      if (isMounted) {
        setCourses(list);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute filtered courses by major
  const majorFilteredCourses = useMemo(() => {
    if (!isFilterMajor) return courses;
    return filterCompactCourses(courses, currentUser, true);
  }, [courses, isFilterMajor, currentUser]);

  // Apply search query
  const displayedCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = majorFilteredCourses;

    if (query) {
      list = list.filter((c) => {
        const code = (c.code || c.courseCode || '').toLowerCase();
        const title = (c.name || c.courseName || c.title || '').toLowerCase();
        return code.includes(query) || title.includes(query);
      });
    }

    // Ensure currently selected course is always included so selection doesn't drop
    if (value) {
      const normVal = value.toUpperCase();
      const exists = list.some((c) => (c.code || c.courseCode || '').toUpperCase() === normVal);
      if (!exists) {
        const foundFromAll = courses.find(
          (c) => (c.code || c.courseCode || '').toUpperCase() === normVal
        );
        if (foundFromAll) {
          list = [foundFromAll, ...list];
        } else {
          list = [
            {
              id: 0,
              code: normVal,
              courseCode: normVal,
              name: normVal,
              title: normVal,
            } as any,
            ...list,
          ];
        }
      }
    }

    return list;
  }, [majorFilteredCourses, searchQuery, value, courses]);

  // Auto select first option if required and no value
  useEffect(() => {
    if (required && !value && displayedCourses.length > 0 && !allowEmpty) {
      const firstCode = displayedCourses[0].code || displayedCourses[0].courseCode;
      if (firstCode) {
        onChange(firstCode, displayedCourses[0]);
      }
    }
  }, [required, value, displayedCourses, allowEmpty, onChange]);

  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'course-select');

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {/* Label and Quick-Filter Toggle Header */}
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t(label)} {required && !label.includes('*') && <span className="text-rose-500">*</span>}
        </label>

        {/* Quick Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setIsFilterMajor(!isFilterMajor)}
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
            isFilterMajor
              ? 'bg-blue-50 text-[#0076D1] hover:bg-blue-100 border border-blue-200/60'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
          title={t('Bật/Tắt ẩn các môn ngoài chuyên ngành của bạn')}
        >
          <Filter className="w-3 h-3" />
          <span>
            {isFilterMajor
              ? `${t('Lọc ngành')} ${majorCode} (${majorFilteredCourses.length})`
              : `${t('Hiện tất cả')} (${courses.length})`}
          </span>
        </button>
      </div>

      {/* Quick Search bar inline for instant search among 1,148 courses */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('Gõ để lọc nhanh mã môn (ví dụ: SWP, PRN, DBI...)')}
          className="w-full bg-[#F8F9FF] border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ×
          </button>
        )}
      </div>

      {/* Select Box */}
      <select
        id={selectId}
        value={value}
        disabled={disabled || isLoading}
        onChange={(e) => {
          const code = e.target.value;
          const found = courses.find((c) => (c.code || c.courseCode || '').toUpperCase() === code.toUpperCase());
          onChange(code, found);
        }}
        className={`w-full bg-white dark:bg-slate-900 border ${
          error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-600'
        } rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {allowEmpty && <option value="">{t(emptyLabel)}</option>}
        {isLoading ? (
          <option value="">{t('Đang tải danh mục 1,148 môn học FPT...')}</option>
        ) : displayedCourses.length === 0 ? (
          <option value="">{t('Không tìm thấy môn học nào khớp với')} "{searchQuery}"</option>
        ) : (
          displayedCourses.map((c) => {
            const code = (c.code || c.courseCode || '').toUpperCase();
            const name = c.name || c.courseName || c.title || code;
            return (
              <option key={code} value={code}>
                {code} - {name}
              </option>
            );
          })
        )}
      </select>

      {error ? (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
