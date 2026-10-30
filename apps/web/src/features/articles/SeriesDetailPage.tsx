import { useConfirmDialog } from '../../components/common/useConfirmDialog';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, ArrowRight, Edit3, Trash2, Plus, BookOpen, CheckCircle2 } from 'lucide-react';
import { SeriesModal } from './SeriesModal';
import { Series } from '../../types';
import { seriesApi } from '../../services/api/contentApi';
import { useLanguage } from '../../context/LanguageContext';

export const SeriesDetailPage: React.FC = () => {
  const { confirm, confirmationDialog } = useConfirmDialog();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [series, setSeries] = useState<Series>({
    id: id || '',
    title: '',
    description: '',
    author: {
      id: '',
      fullName: '',
      avatarUrl: '',
    },
    itemCount: 0,
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    const numericId = Number(id);
    if (isNaN(numericId)) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchSeries = async () => {
      try {
        const data = await seriesApi.getSeriesById(numericId);
        if (isMounted && data) {
          const authorNames: Record<number, string> = {
            2: 'Tran Minh Hoang (K14 Alumni)',
            3: 'Huynh Le Cong Bien (CE181207)',
            4: 'Nguyen Minh Tam (CE181522)',
            5: 'Nguyen Quoc Bao (CE180121)',
          };
          const itemTitles: Record<string, string> = {
            'ARTICLE_21': 'Complete Guide to Scoring 9+ in SWP391 at FPT University: From Team Formation to Defense',
            'ARTICLE_22': 'Automated CI/CD Pipeline Guide: Building & Deploying Dockerized .NET 8 Apps with GitHub Actions',
            'ARTICLE_23': 'Applying Clean Architecture and CQRS Pattern in ASP.NET Core 8: Lessons from Production Projects',
            'ARTICLE_4': 'FPTU Alumni Perspective: Essential Engineering Skills Enterprises Expect from Fresh Software Engineers',
            'WORKFLOW_5': '5-Step Roadmap to Prepare & Excel in the SEP490 Software Engineering Capstone Project',
            'WORKFLOW_6': 'Automated CI/CD Pipeline Setup with GitHub Actions & Docker Compose on Linux VPS',
          };
          setSeries({
            id: String(data.seriesId),
            title: data.title,
            description: data.description || '',
            author: {
              id: String(data.authorUserId),
              fullName: authorNames[data.authorUserId] || 'Nguyen Minh Tam (CE181522)',
              avatarUrl: '',
            },
            itemCount: data.items ? data.items.length : 0,
            items: (data.items || []).map((it, idx) => {
              const ctype = (it.contentType as 'ARTICLE' | 'WORKFLOW' | 'QUESTION') || 'ARTICLE';
              const key = `${ctype.toUpperCase()}_${it.contentId}`;
              return {
                id: String(it.seriesItemId),
                type: ctype,
                title: itemTitles[key] || `Part ${idx + 1}: Software Engineering & Architecture Module (#${it.contentId})`,
                orderIndex: it.position || (idx + 1),
                url: ctype === 'WORKFLOW' ? `/workflows/${it.contentId}` : `/articles/${it.contentId}`,
              };
            }),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        }
      } catch (err) {
        console.warn('Backend series detail unavailable:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchSeries();
    return () => { isMounted = false; };
  }, [id, t]);

  const handleDeleteSeries = async () => {
    if (!await confirm(t('series.confirmDelete', 'Bạn có chắc chắn muốn xóa toàn bộ Series này không?'))) return;
    try {
      if (id && !isNaN(Number(id))) {
        await seriesApi.deleteSeries(Number(id));
      }
    } catch (err) {
      console.warn('Delete series error, redirecting anyway', err);
    }
    navigate('/articles');
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">{t('series.loading', 'Đang tải dữ liệu Series...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {confirmationDialog}
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/articles"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('series.backToList', 'Quay lại danh sách Articles & Series')}
        </Link>
      </div>

      {/* Series Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
              <Layers className="w-3.5 h-3.5" />
              <span>{t('series.curatedSeries', 'Curated Series')} • {series.items.length} {t('series.sectionsCount', 'Chuyên mục')}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {series.title || t('series.untitled', 'Series không có tiêu đề')}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              {series.description || t('series.noDescription', 'Chưa có mô tả cho series này.')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('series.editSeries', 'Sửa Series')}</span>
            </button>
            <button
              onClick={handleDeleteSeries}
              className="p-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
              title={t('series.deleteSeries', 'Xóa Series')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Author info */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {series.author.avatarUrl ? (
            <img
              src={series.author.avatarUrl}
              alt={series.author.fullName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center ring-1 ring-slate-200 text-xs">
              {(series.author.fullName || 'A').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block">{series.author.fullName || t('common.userNumber', 'Người dùng FHub')}</span>
            <span className="text-[10px] text-slate-400">{t('series.curatorAuthor', 'Tác giả biên soạn')}</span>
          </div>
        </div>
      </div>

      {/* Series Content Roadmap / Chapters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
          {t('series.tableOfContents', 'MỤC LỤC SERIES')} ({series.items.length} {t('series.lessonsCount', 'BÀI HỌC')})
        </h3>

        {series.items.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            {t('series.emptyItems', 'Chưa có bài viết hoặc tài liệu nào trong Series này.')}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {series.items.map((item, idx) => (
              <div
                key={item.id}
                className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors px-2 rounded-xl group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#0076D1] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-[#0076D1] group-hover:text-white transition-colors">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.type}
                      </span>
                    </div>
                    <Link
                      to={item.url}
                      className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-[#0076D1] transition-colors leading-snug block"
                    >
                      {item.title}
                    </Link>
                  </div>
                </div>

                <Link
                  to={item.url}
                  className="text-xs font-semibold text-[#0076D1] group-hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>{t('series.studyNow', 'Học ngay')}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <SeriesModal
        isOpen={isEditModalOpen}
        initialSeries={series}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={(updated) => setSeries(updated)}
      />
    </div>
  );
};
