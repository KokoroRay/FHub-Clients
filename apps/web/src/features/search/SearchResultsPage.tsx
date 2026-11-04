import React, { useState, useEffect, useTransition } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  User as UserIcon,
  FileDown,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  MapPin,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import { searchApi, SemanticSearchResultItem, SemanticEntityType } from '../../services/api/searchApi';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AskQuestionModal } from '../discussions/AskQuestionModal';

const ENTITY_TABS: Array<{ key: 'ALL' | SemanticEntityType; label: string; icon: React.FC<{ className?: string }> }> = [
  { key: 'ALL', label: 'Tất cả kết quả', icon: Sparkles },
  { key: 'COURSE', label: 'Môn học', icon: BookOpen },
  { key: 'QUESTION', label: 'Câu hỏi & Thảo luận', icon: HelpCircle },
  { key: 'ARTICLE', label: 'Bài viết học thuật', icon: FileText },
  { key: 'USER', label: 'Sinh viên & Bạn học', icon: UserIcon },
  { key: 'STUDY_MATERIAL', label: 'Tài liệu học tập', icon: FileDown },
];

const PRECISION_LEVELS = [
  { label: 'Mở rộng (Nhiều kết quả)', threshold: 0.15 },
  { label: 'Cân bằng (Khuyên dùng)', threshold: 0.22 },
  { label: 'Chính xác cao', threshold: 0.35 },
];

export const SearchResultsPage: React.FC = () => {
  const { t, locale } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const typeParam = (searchParams.get('type') as 'ALL' | SemanticEntityType) || 'ALL';

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<'ALL' | SemanticEntityType>(typeParam);
  const [selectedPrecision, setSelectedPrecision] = useState(0.22);
  const [results, setResults] = useState<SemanticSearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Keep local query in sync with URL
  useEffect(() => {
    setInputQuery(queryParam);
  }, [queryParam]);

  // Keep active tab in sync with URL
  useEffect(() => {
    setActiveTab(typeParam);
  }, [typeParam]);

  // Execute search when URL query, tab or precision changes
  useEffect(() => {
    const trimmed = queryParam.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const entityTypes = activeTab === 'ALL' ? undefined : [activeTab];
    searchApi
      .search({
        query: trimmed,
        entity_types: entityTypes,
        limit: 30,
        score_threshold: selectedPrecision,
      })
      .then((res) => {
        if (isMounted) {
          startTransition(() => {
            setResults(res.results || []);
          });
        }
      })
      .catch((err) => {
        console.warn('Semantic search request error:', err);
        if (isMounted) setResults([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [queryParam, activeTab, selectedPrecision]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputQuery.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed, ...(activeTab !== 'ALL' ? { type: activeTab } : {}) });
    }
  };

  const handleTabChange = (tab: 'ALL' | SemanticEntityType) => {
    setActiveTab(tab);
    setSearchParams({
      q: queryParam,
      ...(tab !== 'ALL' ? { type: tab } : {}),
    });
  };

  const getItemLink = (item: SemanticSearchResultItem) => {
    switch (item.entity_type) {
      case 'COURSE':
        return item.course_code ? `/courses?q=${encodeURIComponent(item.course_code)}` : `/courses`;
      case 'QUESTION':
        return `/questions/${item.entity_id}`;
      case 'ARTICLE':
        return `/articles/${item.entity_id}`;
      case 'USER':
        return `/profile/${item.student_code || item.entity_id}`;
      case 'STUDY_MATERIAL':
        return `/materials/${item.entity_id}`;
      default:
        return `/search?q=${encodeURIComponent(queryParam)}`;
    }
  };

  const getEntityBadge = (type: string) => {
    switch (type) {
      case 'COURSE':
        return { label: t('Môn học'), color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' };
      case 'QUESTION':
        return { label: t('Câu hỏi & Thảo luận'), color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' };
      case 'ARTICLE':
        return { label: t('Bài viết học thuật'), color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' };
      case 'USER':
        return { label: t('Sinh viên'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' };
      case 'STUDY_MATERIAL':
        return { label: t('Tài liệu học tập'), color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800' };
      default:
        return { label: type, color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-[#0076D1] to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FHub AI Vector Semantic Search (1024-dim Embeddings)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('search.title', 'Tìm kiếm ngữ nghĩa thông minh')}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100">
            {t('search.subTitle', 'Tìm kiếm bằng ngôn ngữ tự nhiên: môn học, tài liệu ôn thi, bài giải mẫu và kết nối bạn học trên toàn hệ thống FPT University.')}
          </p>

          {/* Search Box Input */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-lg border border-white/20">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={t('search.pagePlaceholder', 'Nhập câu hỏi hoặc kiến thức bạn muốn tìm kiếm...')}
                className="w-full bg-transparent text-slate-900 text-sm px-3 py-2.5 focus:outline-none placeholder-slate-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0076D1] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer"
              >
                {t('common.search', 'Tìm kiếm')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0076D1]" />
              <span>{t('search.filterHeading', 'Bộ lọc tìm kiếm')}</span>
            </h3>
          </div>

          {/* Entity Type Navigation List */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              {t('search.categoryLabel', 'Phân loại nội dung')}
            </label>
            {ENTITY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-[#0076D1] dark:bg-blue-950/60 dark:text-blue-300 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {/* AI Precision Threshold Slider / Level */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              {t('search.precisionLevel', 'Độ nhạy ngữ nghĩa AI')}
            </label>
            <div className="space-y-1.5">
              {PRECISION_LEVELS.map((lvl) => (
                <label
                  key={lvl.threshold}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedPrecision === lvl.threshold
                      ? 'border-[#0076D1] bg-blue-50/50 dark:bg-blue-950/40 text-[#0076D1] font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="precision"
                    checked={selectedPrecision === lvl.threshold}
                    onChange={() => setSelectedPrecision(lvl.threshold)}
                    className="accent-[#0076D1]"
                  />
                  <span>{lvl.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Search Info Box */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{t('Mẹo tìm kiếm')}</span>
            </p>
            <p>
              {t('Bạn không cần nhớ chính xác mã môn hay tiêu đề. Hãy mô tả vấn đề gặp phải, AI sẽ tự động phân tích ngữ nghĩa để tìm bài viết phù hợp nhất.')}
            </p>
          </div>
        </div>

        {/* Right Search Results Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {queryParam.trim() ? (
                <span>
                  {t('search.foundResults', 'Tìm thấy')} <strong className="text-slate-900 dark:text-slate-100">{results.length}</strong> {t('kết quả ngữ nghĩa cho')} <strong className="text-[#0076D1]">"{queryParam}"</strong>
                </span>
              ) : (
                <span>{t('search.readyPrompt', 'Sẵn sàng tìm kiếm tri thức FHub')}</span>
              )}
            </div>

            {results.length > 0 && (
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Vector Match Active
              </span>
            )}
          </div>

          {/* Result Cards List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 animate-pulse shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-24 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="w-full h-10 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
              ))}
            </div>
          ) : !queryParam.trim() ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-2xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0076D1] flex items-center justify-center">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {t('search.emptyPrompt', 'Bắt đầu tìm kiếm với bất kỳ câu hỏi nào')}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {t('Ví dụ: "làm sao để pass môn PRN231", "kinh nghiệm phỏng vấn OJT kỳ chuyên ngành", "sinh viên chuyên ngành SE"...')}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
              <div className="text-4xl">🔍</div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {t('search.noResultsFound', 'Không tìm thấy nội dung phù hợp với câu hỏi của bạn')}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {t('Không có tài liệu hoặc câu hỏi nào đạt ngưỡng tương đồng vector. Bạn có thể giảm độ nhạy hoặc đặt câu hỏi mới lên cộng đồng.')}
                </p>
              </div>

              {/* Action Button: Post Question directly */}
              <div className="pt-2">
                <button
                  onClick={() => setIsAskModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0076D1] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('search.askCommunity', 'Đặt câu hỏi này lên Diễn đàn ngay')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((item, idx) => {
                const badge = getEntityBadge(item.entity_type);
                const scorePercent = Math.round(item.score * 100);
                const link = getItemLink(item);

                return (
                  <div
                    key={item.point_id || `${item.entity_type}-${item.entity_id}-${idx}`}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all space-y-3"
                  >
                    {/* Header: Entity Type + Similarity Score */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>

                        {item.course_code && (
                          <span className="font-mono text-xs font-bold text-[#0076D1] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/40">
                            {item.course_code}
                          </span>
                        )}

                        {item.student_code && (
                          <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {item.student_code}
                          </span>
                        )}

                        {item.status && (
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            • {item.status}
                          </span>
                        )}
                      </div>

                      {/* AI Similarity score */}
                      <span
                        title={`Cosine Similarity Score: ${item.score}`}
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          scorePercent >= 80
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : scorePercent >= 50
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        {scorePercent}% {t('độ phù hợp')}
                      </span>
                    </div>

                    {/* Title & Link */}
                    <div>
                      <Link
                        to={link}
                        className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-[#0076D1] dark:hover:text-blue-400 transition-colors inline-block"
                      >
                        {item.title || item.full_name || item.course_name}
                      </Link>

                      {/* Content snippet */}
                      {item.content_snippet && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {item.content_snippet}
                        </p>
                      )}
                    </div>

                    {/* Footer Row: Details & Direct Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="text-slate-400 flex items-center gap-2">
                        {item.entity_type === 'USER' && (
                          <span>{t('Sinh viên FPT University')}</span>
                        )}
                        {item.entity_type === 'COURSE' && item.course_name && (
                          <span>{item.course_name}</span>
                        )}
                        {item.created_at && (
                          <span>
                            {new Date(item.created_at).toLocaleDateString(locale, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      <Link
                        to={link}
                        className="inline-flex items-center gap-1 font-bold text-xs text-[#0076D1] hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        <span>{item.entity_type === 'USER' ? t('Xem hồ sơ') : t('Xem chi tiết')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ask Question Modal with Query Pre-fill */}
      {isAskModalOpen && (
        <AskQuestionModal
          isOpen={isAskModalOpen}
          onClose={() => setIsAskModalOpen(false)}
          onCreated={(newQ) => {
            setIsAskModalOpen(false);
            navigate(`/questions/${newQ.id}`);
          }}
          initialTitle={queryParam}
        />
      )}
    </div>
  );
};
export default SearchResultsPage;
