import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  Search, 
  Trash2, 
  FileText, 
  Workflow, 
  HelpCircle, 
  BookOpen, 
  ExternalLink, 
  CheckCircle, 
  ShieldCheck, 
  Download,
  Filter,
  Check
} from 'lucide-react';

interface BookmarkItem {
  id: string;
  type: 'question' | 'article' | 'material' | 'workflow';
  typeLabel: string;
  typeColor: string;
  title: string;
  summary: string;
  savedTime: string;
  url: string;
  tags: string[];
  courseCode?: string;
  votes?: number;
  answers?: number;
  isSolved?: boolean;
  downloads?: number;
  fileFormat?: string;
  fileSize?: string;
  isVerified?: boolean;
}

import { bookmarkApi } from '../../services/api/studentApi';
import { questionApi, articleApi, studyMaterialApi, workflowApi } from '../../services/api/contentApi';
import { useLanguage } from '../../context/LanguageContext';

export const BookmarksPage: React.FC = () => {
  const { formatDate, formatTime, locale, t } = useLanguage();
  const [allBookmarks, setAllBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'question' | 'article' | 'material' | 'workflow'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'votes'>('recent');

  useEffect(() => {
    let isMounted = true;
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const res = await bookmarkApi.getBookmarks();
        if (!isMounted) return;

        if (res && res.length > 0) {
          const colorMap: Record<string, string> = {
            question: 'bg-blue-50 text-[#0076D1] border-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800',
            article: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
            material: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800',
            workflow: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800',
          };
          const urlMap: Record<string, string> = {
            question: `/discussions`,
            article: `/articles`,
            material: `/materials`,
            workflow: `/workflows`,
          };

          const mapped: BookmarkItem[] = await Promise.all(
            res.map(async (b) => {
              const rawType = (b.targetType || '').toLowerCase();
              const typeLower = (rawType === 'studymaterial' || rawType === 'material')
                ? 'material'
                : (rawType as 'question' | 'article' | 'material' | 'workflow');

              let title = b.title || '';
              let summary = b.summary || b.note || '';
              let tags: string[] = [];
              let courseCode = '';
              let votes = 0;
              let answers = 0;
              let isSolved = false;

              // Dynamically fetch actual details from the corresponding microservice
              try {
                if (typeLower === 'question') {
                  const q: any = await questionApi.getQuestionById(b.targetId);
                  if (q) {
                    title = q.title || title;
                    summary = q.body || q.content || summary;
                    courseCode = q.courseCode || (q.courseId ? `COURSE-${q.courseId}` : '');
                    votes = q.upvoteCount || q.votesCount || 0;
                    answers = q.answerCount || q.answersCount || 0;
                    isSolved = !!(q.hasBestAnswer || q.isSolved);
                    if (q.tags && Array.isArray(q.tags)) {
                      tags = q.tags.map((t: any) => typeof t === 'string' ? t : t.name);
                    }
                  }
                } else if (typeLower === 'article') {
                  const art: any = await articleApi.getArticleById(b.targetId);
                  if (art) {
                    title = art.title || title;
                    summary = art.summary || (art.content ? art.content.slice(0, 150) + '...' : summary);
                    tags = art.tags || [];
                    courseCode = (art as any).courseCode || '';
                    votes = (art as any).likesCount || 0;
                  }
                } else if (typeLower === 'material') {
                  const mat = await studyMaterialApi.getMaterialById(b.targetId);
                  if (mat) {
                    title = mat.title || title;
                    summary = mat.description || summary;
                    courseCode = (mat as any).courseCode || '';
                    tags = (mat as any).tags || [];
                  }
                } else if (typeLower === 'workflow') {
                  const wf = await workflowApi.getWorkflowById(b.targetId);
                  if (wf) {
                    title = wf.title || title;
                    summary = wf.summary || summary;
                    courseCode = (wf as any).courseCode || (wf.courseId ? `COURSE-${wf.courseId}` : '');
                    tags = (wf as any).tags || [];
                  }
                }
              } catch (err) {
                // Ignore single item error and fallback gracefully
              }

              if (!title) {
                const label = typeLower === 'question' ? t('feed.question', 'Câu hỏi') 
                  : typeLower === 'article' ? t('nav.articles', 'Bài viết')
                  : typeLower === 'material' ? t('nav.materials', 'Tài liệu')
                  : t('nav.workflows', 'Quy trình');
                title = `${label} #${b.targetId}`;
              }

              return {
                id: String(b.id || b.bookmarkId),
                type: typeLower,
                typeLabel: (b.targetType || 'ARTICLE').toUpperCase(),
                typeColor: colorMap[typeLower] || colorMap.article,
                title,
                summary: summary || t('common.noDescription', 'Không có mô tả chi tiết.'),
                savedTime: b.createdAt ? b.createdAt : new Date().toISOString(),
                url: `${urlMap[typeLower] || '/articles'}/${b.targetId}`,
                tags,
                courseCode,
                votes,
                answers,
                isSolved,
              };
            })
          );

          if (isMounted) {
            setAllBookmarks(mapped);
          }
        } else {
          if (isMounted) setAllBookmarks([]);
        }
      } catch (err) {
        console.warn('Backend bookmarks notice:', err);
        if (isMounted) setAllBookmarks([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBookmarks();
    return () => { isMounted = false; };
  }, []);

  const counts = useMemo(() => ({
    all: allBookmarks.length,
    question: allBookmarks.filter(b => b.type === 'question').length,
    article: allBookmarks.filter(b => b.type === 'article').length,
    material: allBookmarks.filter(b => b.type === 'material').length,
    workflow: allBookmarks.filter(b => b.type === 'workflow').length,
  }), [allBookmarks]);

  const handleRemoveBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAllBookmarks(prev => prev.filter(b => b.id !== id));
    bookmarkApi.removeBookmark(id).catch(err => console.warn('Remove bookmark notice:', err));
  };

  const filteredBookmarks = useMemo(() => {
    return allBookmarks.filter(b => {
      if (activeTab !== 'all' && b.type !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.summary.toLowerCase().includes(q) ||
          b.tags.some(t => t.toLowerCase().includes(q)) ||
          (b.courseCode && b.courseCode.toLowerCase().includes(q))
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'votes') {
        return (b.votes || 0) - (a.votes || 0);
      }
      return new Date(b.savedTime).getTime() - new Date(a.savedTime).getTime();
    });
  }, [allBookmarks, activeTab, searchQuery, sortBy]);

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Page Header (Figma #93:3918) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-[#181C22] dark:text-slate-100">{t('My Bookmarks')}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF5FF] dark:bg-blue-950/60 text-[#0076D1] dark:text-blue-400 border border-[#BFDBFE] dark:border-blue-800">
              {allBookmarks.length} {t('saved items')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('Your saved curriculum questions, guides, and study materials, organized for seamless revision.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 Cols: Filter Tabs, Search Bar & Bookmarks Feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter Bar with Horizontal Tabs & Search */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: t("All Items"), count: counts.all },
                { id: 'question', label: t("Discussions"), count: counts.question },
                { id: 'article', label: t("Guides & Articles"), count: counts.article },
                { id: 'material', label: t("Study Materials"), count: counts.material },
                { id: 'workflow', label: t("Workflows"), count: counts.workflow },
              ].map(tab => (
                <button
                  key={tab.id}
                  id={`tab-bookmark-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#0076D1] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-blue-400 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('Search saved items by title, tag, or course...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="recent">{t('Recently Saved')}</option>
                <option value="votes">{t('Most Upvoted')}</option>
              </select>
            </div>
          </div>

          {/* Bookmarks List Container */}
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-400 border border-slate-100 dark:border-slate-800 shadow-xs">
              <p className="text-xs">{t('bookmarks.loading', 'Đang tải danh sách dấu trang...')}</p>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-400 border border-slate-100 dark:border-slate-800 shadow-xs">
              <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#0076D1]" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('No bookmarks yet')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('Save questions, articles, and materials to revise anytime.')}</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredBookmarks.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-slate-200 dark:hover:border-slate-700 transition-all space-y-3 group"
                >
                  {/* Top Meta Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${item.typeColor}`}>
                        {t(item.typeLabel)}
                      </span>
                      {item.courseCode && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.courseCode}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {formatDate(item.savedTime)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleRemoveBookmark(item.id, e)}
                      title={t("Remove bookmark")}
                      className="p-1.5 text-[#0076D1] hover:text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <Link
                      to={item.url}
                      className="text-base font-bold text-[#181C22] dark:text-slate-100 group-hover:text-[#0076D1] dark:group-hover:text-blue-400 transition-colors block line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                  </div>

                  {/* Bottom Badges & Metrics Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-50 dark:border-slate-800/80 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 font-medium">
                      {item.votes !== undefined && item.votes > 0 && (
                        <span>{item.votes} {t('votes')}</span>
                      )}
                      {item.answers !== undefined && item.answers > 0 && (
                        <span>{item.answers} {t('answers')}</span>
                      )}
                      {item.isSolved && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {t('Solved')}
                        </span>
                      )}
                      {item.fileFormat && (
                        <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                          {item.fileFormat} {item.fileSize}
                        </span>
                      )}
                      {item.downloads !== undefined && item.downloads > 0 && (
                        <span>{item.downloads} {t('downloads')}</span>
                      )}
                      {item.isVerified && (
                        <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#0076D1]" />
                          {t('Verified by Lecturer')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Bookmark Tips & Sync Status (Figma #93:4118) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#0076D1]" />
              <span>{t('Bookmark Tips')}</span>
            </h3>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{t('Exam & Milestone Sprint')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('bookmarks.examSprintDesc', 'Lưu lại các câu hỏi, mẹo lập trình và tài liệu hữu ích để ôn tập nhanh trong kỳ thi và bảo vệ đồ án.')}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{t('Topic Filtering')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('bookmarks.topicFilterDesc', 'Sử dụng các tab bộ lọc danh mục để nhanh chóng chuyển đổi giữa Thảo luận, Bài viết, Tài liệu và Quy trình.')}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{t('Focused Feed')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('bookmarks.focusedFeedDesc', 'Xóa bớt các mục đã học xong để giữ cho danh sách ôn tập luôn tinh gọn và trọng tâm.')}
                </p>
              </div>
            </div>

            {/* Offline Sync Card */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('SYNC STATUS')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {t('Active')}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t('Đồng bộ dữ liệu trực tiếp')}
              </p>
            </div>

            {/* Dynamic Sync Info Box */}
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('bookmarks.syncDesc', 'Dữ liệu dấu trang được liên kết trực tiếp với tài khoản của bạn, tự động cập nhật trên mọi thiết bị đăng nhập.')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
