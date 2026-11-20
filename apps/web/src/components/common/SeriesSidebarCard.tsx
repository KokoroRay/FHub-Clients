import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  GitBranch,
  HelpCircle,
} from 'lucide-react';
import { seriesApi, SeriesDetailDto } from '../../services/api/contentApi';
import { useLanguage } from '../../context/LanguageContext';

type SeriesContentType = 'ARTICLE' | 'WORKFLOW' | 'QUESTION';

interface SeriesSidebarCardProps {
  currentType: SeriesContentType;
  currentId: number | string;
  variant?: 'sidebar' | 'banner';
}

const buildItemUrl = (type: SeriesContentType, contentId: number, seriesId: number | string): string => {
  const base =
    type === 'WORKFLOW'
      ? `/workflows/${contentId}`
      : type === 'QUESTION'
      ? `/discussions/${contentId}`
      : `/articles/${contentId}`;
  return `${base}?seriesId=${seriesId}`;
};

export const SeriesSidebarCard: React.FC<SeriesSidebarCardProps> = ({
  currentType,
  currentId,
  variant = 'sidebar',
}) => {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const seriesIdParam = searchParams.get('seriesId');

  const [series, setSeries] = useState<SeriesDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!seriesIdParam) {
      setSeries(null);
      return;
    }
    const numericSeriesId = Number(seriesIdParam);
    if (isNaN(numericSeriesId) || numericSeriesId <= 0) {
      setSeries(null);
      return;
    }

    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await seriesApi.getSeriesById(numericSeriesId);
        if (isMounted) setSeries(data);
      } catch (err) {
        console.warn('Could not load series navigation context:', err);
        if (isMounted) setSeries(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [seriesIdParam]);

  if (!seriesIdParam) return null;

  if (isLoading && !series) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-3" />
        <div className="space-y-2">
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!series || !series.items || series.items.length === 0) return null;

  const numericCurrentId = Number(String(currentId).replace(/\D/g, ''));
  const orderedItems = [...series.items].sort((a, b) => (a.position || 0) - (b.position || 0));

  const currentIndex = orderedItems.findIndex(
    (item) =>
      (item.contentType || 'ARTICLE').toUpperCase() === currentType &&
      Number(item.contentId) === numericCurrentId
  );

  const prevItem = currentIndex > 0 ? orderedItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < orderedItems.length - 1
      ? orderedItems[currentIndex + 1]
      : null;

  const renderTypeIcon = (type: SeriesContentType) => {
    if (type === 'WORKFLOW') return <GitBranch className="w-3 h-3 text-violet-500 shrink-0" />;
    if (type === 'QUESTION') return <HelpCircle className="w-3 h-3 text-amber-500 shrink-0" />;
    return <FileText className="w-3 h-3 text-[#0076D1] shrink-0" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30 border-b border-blue-100/80 dark:border-blue-900/50 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0076D1] dark:text-blue-400">
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>{t('Series')}</span>
            {currentIndex >= 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#0076D1] dark:text-blue-300">
                {currentIndex + 1} / {orderedItems.length}
              </span>
            )}
          </div>
          <Link
            to={`/series/${series.seriesId}`}
            className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-[#0076D1] transition-colors line-clamp-1 mt-0.5 block"
            title={series.title}
          >
            {series.title}
          </Link>
        </div>

        {variant === 'banner' && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/70 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label={isExpanded ? t('Thu gọn') : t('Mở rộng')}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Items List */}
      {isExpanded && (
        <div
          className={`p-2 space-y-1 overflow-y-auto ${
            variant === 'sidebar' ? 'max-h-72' : 'max-h-60'
          }`}
        >
          {orderedItems.map((item, idx) => {
            const itemType = ((item.contentType || 'ARTICLE').toUpperCase() as SeriesContentType);
            const isActive = idx === currentIndex;
            const url = buildItemUrl(itemType, item.contentId, series.seriesId);
            const label = item.title || `${t('Phần')} ${idx + 1} (#${item.contentId})`;

            return (
              <Link
                key={item.seriesItemId}
                to={url}
                className={`flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-[#0076D1] dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-800/80'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-[#0076D1] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="line-clamp-2 leading-snug block">{label}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 mt-0.5">
                    {renderTypeIcon(itemType)}
                    {itemType === 'WORKFLOW'
                      ? t('Workflow')
                      : itemType === 'QUESTION'
                      ? t('Q&A')
                      : t('Article')}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Prev / Next Controls */}
      {(prevItem || nextItem) && (
        <div className="px-3 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 flex items-center justify-between gap-2 text-[11px]">
          {prevItem ? (
            <Link
              to={buildItemUrl(
                ((prevItem.contentType || 'ARTICLE').toUpperCase() as SeriesContentType),
                prevItem.contentId,
                series.seriesId
              )}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0076D1] transition-colors truncate max-w-[48%]"
              title={prevItem.title || ''}
            >
              <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t('Bài trước')}</span>
            </Link>
          ) : (
            <span />
          )}

          {nextItem ? (
            <Link
              to={buildItemUrl(
                ((nextItem.contentType || 'ARTICLE').toUpperCase() as SeriesContentType),
                nextItem.contentId,
                series.seriesId
              )}
              className="inline-flex items-center gap-1 font-semibold text-[#0076D1] hover:underline transition-colors truncate max-w-[48%] ml-auto"
              title={nextItem.title || ''}
            >
              <span className="truncate">{t('Bài tiếp theo')}</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
};
