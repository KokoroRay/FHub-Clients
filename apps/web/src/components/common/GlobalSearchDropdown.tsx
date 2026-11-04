import React, { useState, useEffect, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  User as UserIcon,
  FileDown,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Clock,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { searchApi, SemanticSearchResultItem, SemanticEntityType } from '../../services/api/searchApi';
import { useLanguage } from '../../context/LanguageContext';

export interface GlobalSearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onSelectQuery?: (q: string) => void;
  dropdownWidthClass?: string;
}

const TAB_OPTIONS: Array<{ key: 'ALL' | SemanticEntityType; label: string; icon: React.FC<{ className?: string }> }> = [
  { key: 'ALL', label: 'Tất cả', icon: Sparkles },
  { key: 'COURSE', label: 'Môn học', icon: BookOpen },
  { key: 'QUESTION', label: 'Câu hỏi', icon: HelpCircle },
  { key: 'ARTICLE', label: 'Bài viết', icon: FileText },
  { key: 'USER', label: 'Sinh viên', icon: UserIcon },
  { key: 'STUDY_MATERIAL', label: 'Tài liệu', icon: FileDown },
];

const SUGGESTED_SEARCHES = [
  'PRN231',
  'Cấu trúc dữ liệu và giải thuật',
  'Kinh nghiệm làm Capstone Project',
  'Lập trình Web C# .NET',
  'Sinh viên Kỹ thuật phần mềm SE',
];

export const GlobalSearchDropdown: React.FC<GlobalSearchDropdownProps> = ({
  isOpen,
  onClose,
  query,
  onSelectQuery,
  dropdownWidthClass = 'w-full md:w-[560px]',
}) => {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | SemanticEntityType>('ALL');
  const [results, setResults] = useState<SemanticSearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isPending, startTransition] = useTransition();

  // Reset tab on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Debounced AI semantic search
  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const entityTypes = activeTab === 'ALL' ? undefined : [activeTab];
        const res = await searchApi.search({
          query: trimmed,
          entity_types: entityTypes,
          limit: 8,
          score_threshold: 0.15,
        });
        startTransition(() => {
          setResults(res.results || []);
          setSelectedIndex(-1);
        });
      } catch (err) {
        console.warn('Semantic dropdown search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, activeTab, isOpen]);

  if (!isOpen) return null;

  const handleNavigateToResult = (item: SemanticSearchResultItem) => {
    onClose();
    switch (item.entity_type?.toUpperCase()) {
      case 'COURSE':
        navigate(`/courses/${item.course_code || item.entity_id}`);
        break;
      case 'QUESTION':
        navigate(`/questions/${item.entity_id}`);
        break;
      case 'ARTICLE':
        navigate(`/articles/${item.entity_id}`);
        break;
      case 'USER':
        navigate(`/profile/${item.student_code || item.entity_id}`);
        break;
      case 'STUDY_MATERIAL':
        navigate(`/materials/${item.entity_id}`);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleViewAllResults = () => {
    onClose();
    const typeParam = activeTab === 'ALL' ? '' : `&type=${activeTab}`;
    navigate(`/search?q=${encodeURIComponent(query.trim())}${typeParam}`);
  };

  const getEntityBadge = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'COURSE':
        return { label: t('Môn học'), color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      case 'QUESTION':
        return { label: t('Câu hỏi'), color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      case 'ARTICLE':
        return { label: t('Bài viết'), color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'USER':
        return { label: t('Sinh viên'), color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'STUDY_MATERIAL':
        return { label: t('Tài liệu'), color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
      default:
        return { label: type, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'COURSE':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'QUESTION':
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case 'ARTICLE':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'USER':
        return <UserIcon className="w-4 h-4 text-amber-500" />;
      case 'STUDY_MATERIAL':
        return <FileDown className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#0076D1]" />;
    }
  };

  const formatScore = (score: number) => `${Math.round(score * 100)}% ${t('phù hợp')}`;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-full left-0 mt-2 ${dropdownWidthClass} bg-white dark:bg-[#1e1f20] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700/80 z-50 overflow-hidden flex flex-col max-h-[580px] animate-in fade-in slide-in-from-top-2 duration-150`}
    >
      {/* 1. Header Filter Section: Dropdown / Tabs situated directly under the search bar */}
      <div className="p-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/40">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0076D1]" />
            <span>{t('Bộ lọc tìm kiếm')}</span>
          </div>

          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900">
            <Sparkles className="w-3 h-3 text-[#0076D1] animate-pulse" />
            <span>AI Semantic Search</span>
          </div>
        </div>

        {/* Filter Pills / Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {TAB_OPTIONS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#0076D1] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t(tab.label)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Section: Related Results */}
      <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
        {isLoading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0076D1]" />
            <p className="text-xs font-medium">{t('AI đang phân tích ngữ nghĩa và tìm kiếm kết quả...')}</p>
          </div>
        ) : query.trim() ? (
          results.length > 0 ? (
            results.map((item, idx) => {
              const badge = getEntityBadge(item.entity_type);
              const icon = getEntityIcon(item.entity_type);
              const isSelected = selectedIndex === idx;

              const title = item.title || item.course_name || item.full_name || item.file_name || t('Nội dung không có tiêu đề');
              const subtitle = item.content_snippet || item.summary || item.student_code || (item.course_code ? `${item.course_code}` : '');

              return (
                <div
                  key={`${item.entity_type}-${item.entity_id}-${idx}`}
                  onClick={() => handleNavigateToResult(item)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Entity Icon Badge */}
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700/70 group-hover:scale-105 transition-transform mt-0.5">
                    {icon}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>

                      {item.course_code && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.course_code}
                        </span>
                      )}

                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-100 dark:border-emerald-900 ml-auto shrink-0">
                        {formatScore(item.score)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0076D1] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {title}
                    </h4>

                    {subtitle && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('Không tìm thấy kết quả phù hợp với')} "{query}"
              </p>
              <p className="text-[11px] text-slate-400">
                {t('Thử nhập từ khóa ngắn hơn hoặc chọn tab "Tất cả" để AI tìm kiếm rộng hơn.')}
              </p>
            </div>
          )
        ) : (
          /* Empty query: Show Popular / Suggested Searches */
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <TrendingUp className="w-3.5 h-3.5 text-[#0076D1]" />
              <span>{t('Gợi ý tìm kiếm phổ biến')}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SEARCHES.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => onSelectQuery?.(sug)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-[#0076D1] dark:hover:bg-blue-950/60 dark:hover:text-blue-300 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              💡 {t('Bạn có thể nhập câu hỏi tự nhiên như "cách kết nối sql trong c#" hoặc "sinh viên backend cần thơ".')}
            </p>
          </div>
        )}
      </div>

      {/* 3. Footer Section */}
      {query.trim() && (
        <div className="p-2.5 px-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {t('Nhấn ↵ Enter để xem toàn bộ kết quả')}
          </span>

          <button
            type="button"
            onClick={handleViewAllResults}
            className="text-xs font-bold text-[#0076D1] hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('Xem tất cả')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
