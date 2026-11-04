import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  User as UserIcon,
  FileDown,
  ArrowRight,
  Loader2,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { searchApi, SemanticSearchResultItem, SemanticEntityType } from '../../services/api/searchApi';
import { useLanguage } from '../../context/LanguageContext';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const TAB_OPTIONS: Array<{ key: 'ALL' | SemanticEntityType; label: string; icon: React.FC<{ className?: string }> }> = [
  { key: 'ALL', label: 'Tất cả', icon: Sparkles },
  { key: 'COURSE', label: 'Môn học', icon: BookOpen },
  { key: 'QUESTION', label: 'Câu hỏi', icon: HelpCircle },
  { key: 'ARTICLE', label: 'Bài viết', icon: FileText },
  { key: 'USER', label: 'Sinh viên', icon: UserIcon },
  { key: 'STUDY_MATERIAL', label: 'Tài liệu', icon: FileDown },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'ALL' | SemanticEntityType>('ALL');
  const [results, setResults] = useState<SemanticSearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  // Global Ctrl+K / Cmd+K and Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced semantic search
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
          limit: 12,
          score_threshold: 0.15,
        });
        startTransition(() => {
          setResults(res.results || []);
          setSelectedIndex(-1);
        });
      } catch (err) {
        console.warn('Semantic search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, activeTab, isOpen]);

  // Keyboard navigation through search items
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleItemClick(results[selectedIndex]);
      } else if (query.trim()) {
        handleViewAllResults();
      }
    }
  };

  const handleItemClick = (item: SemanticSearchResultItem) => {
    onClose();
    switch (item.entity_type) {
      case 'COURSE':
        if (item.course_code) {
          navigate(`/courses?q=${encodeURIComponent(item.course_code)}`);
        } else {
          navigate(`/courses`);
        }
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
    const typeParam = activeTab !== 'ALL' ? `&type=${activeTab}` : '';
    navigate(`/search?q=${encodeURIComponent(query.trim())}${typeParam}`);
  };

  if (!isOpen) return null;

  const getEntityBadge = (type: string) => {
    switch (type) {
      case 'COURSE':
        return { label: t('Môn học'), color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' };
      case 'QUESTION':
        return { label: t('Câu hỏi'), color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' };
      case 'ARTICLE':
        return { label: t('Bài viết'), color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' };
      case 'USER':
        return { label: t('Sinh viên'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' };
      case 'STUDY_MATERIAL':
        return { label: t('Tài liệu'), color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800' };
      default:
        return { label: type, color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl flex flex-col z-10 overflow-hidden max-h-[85vh]">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/10 text-[#0076D1] shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholder', 'Tìm kiếm ngữ nghĩa AI: môn học, câu hỏi, bài viết, sinh viên...')}
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[11px] font-mono text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-2xs">
              ESC
            </span>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900">
          {TAB_OPTIONS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0076D1] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t(tab.label)}</span>
              </button>
            );
          })}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/80">
          {query.trim().length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0076D1] flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('search.startTyping', 'Nhập bất kỳ câu hỏi hoặc từ khóa nào')}
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {t('search.aiDesc', 'Mô hình Vector AI Multilingual E5 sẽ tự động phân tích ngữ nghĩa câu hỏi để tìm kiếm tài liệu, giải đáp học thuật và kết nối sinh viên phù hợp.')}
              </p>
            </div>
          ) : isLoading && results.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-[#0076D1] animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">{t('search.analyzing', 'Đang trích xuất vector ngữ nghĩa và tìm kiếm...')}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-2">
              <div className="text-3xl">🔍</div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('search.noResults', 'Không tìm thấy kết quả phù hợp')}
              </p>
              <p className="text-xs text-slate-400">
                {t('search.tryDifferentKeywords', 'Hãy thử diễn đạt lại bằng từ khóa khác hoặc chuyển sang tab "Tất cả".')}
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const badge = getEntityBadge(item.entity_type);
              const scorePercent = Math.round(item.score * 100);
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={item.point_id || `${item.entity_type}-${item.entity_id}-${idx}`}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-start justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Entity Icon or User Avatar */}
                    {item.entity_type === 'USER' && item.avatar_url ? (
                      <img
                        src={item.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 text-slate-500 dark:text-slate-400">
                        {item.entity_type === 'COURSE' && <BookOpen className="w-4 h-4 text-blue-600" />}
                        {item.entity_type === 'QUESTION' && <HelpCircle className="w-4 h-4 text-amber-600" />}
                        {item.entity_type === 'ARTICLE' && <FileText className="w-4 h-4 text-purple-600" />}
                        {item.entity_type === 'USER' && <UserIcon className="w-4 h-4 text-emerald-600" />}
                        {item.entity_type === 'STUDY_MATERIAL' && <FileDown className="w-4 h-4 text-cyan-600" />}
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        {item.course_code && (
                          <span className="font-mono text-[10px] font-bold text-[#0076D1] bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                            {item.course_code}
                          </span>
                        )}
                        {item.student_code && (
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.student_code}
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.title || item.full_name || item.course_name}
                        </h4>
                      </div>

                      {item.content_snippet && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {item.content_snippet}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* AI Similarity Score Pill */}
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      title={`Độ tương đồng Cosine: ${item.score}`}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        scorePercent >= 80
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                          : scorePercent >= 50
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}
                    >
                      {scorePercent}% {t('khớp')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:block" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        {query.trim().length > 0 && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs">
            <button
              onClick={handleViewAllResults}
              className="inline-flex items-center gap-1.5 font-bold text-[#0076D1] hover:underline cursor-pointer"
            >
              <span>{t('search.viewAllResults', 'Xem tất cả kết quả cho')}</span>
              <strong className="text-slate-800 dark:text-slate-200">"{query.trim()}"</strong>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span>↑↓ {t('Di chuyển')}</span>
              <span>↵ {t('Chọn')}</span>
              <span>ESC {t('Đóng')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
