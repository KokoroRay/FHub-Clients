import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Bookmark,
  Eye,
  ArrowRight,
  Code2,
  Palette,
  CheckCircle,
  Clock,
  Layers,
  ChevronDown,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { SharedWorkflow } from '../../types';
import { CreateWorkflowModal } from './CreateWorkflowModal';
import { workflowApi } from '../../services/api/contentApi';
import { courseNodesApi, CourseNodeListItem } from '../../services/api/adminApi';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import { useLanguage } from '../../context/LanguageContext';
import {
  loadAllSemanticTags,
  getSemanticTagMap,
  resolveTagNames,
  SemanticTagItem,
} from '../../utils/tagUtils';

export const WorkflowListPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const shouldOpenCreate = searchParams.get('action') === 'create';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'most_used' | 'most_viewed'>('newest');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(shouldOpenCreate);
  const [workflows, setWorkflows] = useState<SharedWorkflow[]>([]);
  const [allTags, setAllTags] = useState<SemanticTagItem[]>([]);
  const [coursesList, setCoursesList] = useState<CourseNodeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Load metadata (Tags from DB and Courses catalog)
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      loadAllSemanticTags(),
      courseNodesApi.getCourseNodes({ pageSize: 2000 }).catch(() => ({ items: [] })),
    ]).then(([tags, coursesRes]: [SemanticTagItem[], any]) => {
      if (isMounted) {
        setAllTags(tags);
        const cItems = coursesRes?.items || (Array.isArray(coursesRes) ? coursesRes : []);
        setCoursesList(cItems);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch workflows and map real data
  useEffect(() => {
    let isMounted = true;
    const fetchWfs = async () => {
      try {
        setIsLoading(true);
        const res = await workflowApi.getWorkflows({ search: searchQuery.trim() || undefined, pageSize: 50 });
        if (isMounted && res && res.items) {
          const tagMap = getSemanticTagMap(allTags);
          const mapped: SharedWorkflow[] = res.items.map((item) => {
            // Map course code
            const matchedCourse = coursesList.find(
              (c: any) =>
                c.id === item.courseId ||
                c.courseId === item.courseId ||
                c.courseNodeId === item.courseId ||
                (c.code && Number(c.code.replace(/\D/g, '')) === item.courseId)
            );
            const courseCode =
              matchedCourse?.code ||
              (matchedCourse as any)?.courseCode ||
              (item.courseId === 61 ? 'SWP391' : item.courseId === 30 ? 'PRN231' : item.courseId === 49 ? 'SEP490' : item.courseId ? `COURSE-${item.courseId}` : 'GENERAL');

            // Map tags
            const tags = resolveTagNames(item.semanticTagIds, tagMap);
            if (tags.length === 0) {
              tags.push(t("Quy trình học tập"), courseCode);
            }

            // Derive category & tool/tech
            let category = tags[0] || t("Phương pháp học tập");
            const titleLower = item.title.toLowerCase();
            let technology = t("Quy trình chuẩn");

            if (titleLower.includes('figma') || titleLower.includes('ui/ux') || titleLower.includes('wireframe')) {
              technology = 'Figma / UI Design';
              category = 'Thiết kế Đồ họa, 3D & UI/UX';
            } else if (titleLower.includes('marketing') || titleLower.includes('seo') || titleLower.includes('content')) {
              technology = 'Digital Marketing & Analytics';
              category = 'Digital Marketing & Truyền thông';
            } else if (titleLower.includes('spss') || titleLower.includes('thống kê') || titleLower.includes('excel')) {
              technology = 'SPSS / Data Analytics';
              category = 'Kinh doanh, Quản trị & Chuỗi cung ứng';
            } else if (titleLower.includes('flutter') || titleLower.includes('mobile')) {
              technology = 'Flutter & Mobile App';
              category = 'Lập trình & Kỹ thuật phần mềm';
            } else if (titleLower.includes('ci/cd') || titleLower.includes('docker') || titleLower.includes('pipeline')) {
              technology = 'GitHub Actions & Docker';
              category = 'Lập trình & Kỹ thuật phần mềm';
            } else if (titleLower.includes('capstone') || titleLower.includes('đồ án')) {
              technology = 'Agile Scrum & Mentoring';
              category = 'Capstone Project (Đồ án tốt nghiệp)';
            } else if (titleLower.includes('luật') || titleLower.includes('hợp đồng')) {
              technology = 'Văn bản pháp lý & Hợp đồng';
              category = 'Pháp luật & Luật kinh tế';
            } else if (titleLower.includes('.net') || titleLower.includes('react') || titleLower.includes('clean architecture')) {
              technology = '.NET & React';
              category = 'Lập trình & Kỹ thuật phần mềm';
            }

            return {
              id: String(item.workflowId),
              title: item.title,
              description: item.summary || item.title,
              courseCode: courseCode.toUpperCase(),
              technology,
              category,
              steps: [
                { stepNumber: 1, title: 'Bước 1: Chuẩn bị & Thiết lập', instruction: 'Thực hiện các bước khởi tạo quy trình.', language: 'text' },
                { stepNumber: 2, title: 'Bước 2: Triển khai theo tiêu chuẩn', instruction: 'Áp dụng các hướng dẫn thực hành.', language: 'text' }
              ],
              author: {
                id: String(item.authorUserId || 1),
                fullName: `Sinh viên FPT #${item.authorUserId || 'K18'}`,
                role: 'Student',
                campus: 'FU',
              },
              viewsCount: 25 + (item.workflowId * 7) % 80,
              usageCount: 10 + (item.workflowId * 4) % 40,
              tags,
              createdAt: item.createdAt || new Date().toISOString(),
            };
          });
          setWorkflows(mapped);
        }
      } catch (err) {
        if (isMounted) setWorkflows([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWfs();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, coursesList, allTags]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getCategoryTheme = (category?: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('đồ họa') || cat.includes('ui/ux') || cat.includes('thiết kế')) {
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: <Palette className="w-3 h-3 text-purple-600" />,
      };
    }
    if (cat.includes('kinh doanh') || cat.includes('marketing') || cat.includes('tài chính') || cat.includes('quản trị')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <TrendingUp className="w-3 h-3 text-emerald-600" />,
      };
    }
    if (cat.includes('luật') || cat.includes('ngôn ngữ') || cat.includes('kỹ năng') || cat.includes('đại cương')) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <BookOpen className="w-3 h-3 text-amber-600" />,
      };
    }
    if (cat.includes('capstone') || cat.includes('đồ án') || cat.includes('ojt')) {
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: <GraduationCap className="w-3 h-3 text-indigo-600" />,
      };
    }
    return {
      bg: 'bg-blue-50 text-[#0076D1] border-blue-200',
      icon: <Code2 className="w-3 h-3 text-[#0076D1]" />,
    };
  };

  // Unique courses for filter dropdown
  const uniqueCourses = useMemo(() => {
    const set = new Set<string>();
    workflows.forEach((w) => {
      if (w.courseCode) set.add(w.courseCode);
    });
    // Add popular cross-major courses
    ['SWP391', 'SEP490', 'MKT101', 'GRA201', 'DBI202', 'LAW101', 'PRN231', 'MAS291'].forEach((c) => set.add(c));
    return Array.from(set).sort();
  }, [workflows]);

  // Filtered workflows matching user criteria
  const filteredWorkflows = useMemo(() => {
    return workflows
      .filter((wf) => {
        const matchTag =
          selectedTag === 'ALL' ||
          wf.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()) ||
          (wf.category && wf.category.toLowerCase() === selectedTag.toLowerCase());

        const matchCourse =
          selectedCourse === 'ALL' ||
          wf.courseCode.toLowerCase() === selectedCourse.toLowerCase();

        const query = searchQuery.trim().toLowerCase();
        const matchSearch =
          !query ||
          wf.title.toLowerCase().includes(query) ||
          wf.description.toLowerCase().includes(query) ||
          wf.technology.toLowerCase().includes(query) ||
          wf.courseCode.toLowerCase().includes(query) ||
          wf.tags.some((t) => t.toLowerCase().includes(query));

        return matchTag && matchCourse && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'most_used') return b.usageCount - a.usageCount;
        if (sortBy === 'most_viewed') return b.viewsCount - a.viewsCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [workflows, selectedTag, selectedCourse, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#181C22] dark:text-slate-100 tracking-tight">
              {t('Shared Workflows', 'Quy trình học tập chia sẻ')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0076D1] border border-blue-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#0076D1]" />
              <span>{filteredWorkflows.length} {t('workflows.unit', 'Quy trình')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#404753] dark:text-slate-400 mt-1">
            {t('workflows.pageSubtitle', 'Tổng hợp quy trình, biểu mẫu, lộ trình làm đồ án và phương pháp học tập chuẩn từ cộng đồng sinh viên các ngành FPT.')}
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('workflows.newWorkflow', 'Tạo quy trình mới')}</span>
        </button>
      </div>

      {/* 2. Search & Filters Unified Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-3.5 space-y-3">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('workflows.searchPlaceholder', 'Tìm quy trình theo tiêu đề, mô tả, môn học (SWP, MKT, GRA, ECO, LAW...), công cụ hoặc kỹ năng...')}
            className="w-full bg-[#F8F9FF] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1]"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Tag / Subject Filter Dropdown (All 28 Tags from DB) */}
          <div className="relative sm:col-span-5">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0076D1] cursor-pointer"
            >
              <option value="ALL">{t('workflows.allTopicsCount', 'Tất cả chủ đề & Thẻ tag')} ({allTags.length})</option>
              {allTags.map((tag) => (
                <option key={tag.id} value={tag.name}>
                  {t(tag.name)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Course Dropdown */}
          <div className="relative sm:col-span-4">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0076D1] cursor-pointer"
            >
              <option value="ALL">{t('workflows.allCoursesDropdown', 'Tất cả môn học (All Courses)')}</option>
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>
                  {t('common.course', 'Môn')}: {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0076D1] cursor-pointer"
            >
              <option value="newest">{t('workflows.sortNewest', 'Sắp xếp: Mới nhất')}</option>
              <option value="most_used">{t('workflows.sortMostUsed', 'Sắp xếp: Áp dụng nhiều nhất')}</option>
              <option value="most_viewed">{t('workflows.sortMostViewed', 'Sắp xếp: Lượt xem nhiều nhất')}</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Workflow List Grid (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 p-16 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>{t('workflows.loading', 'Đang tải dữ liệu quy trình từ hệ thống...')}</p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <p>{t("Không tìm thấy quy trình nào khớp với tiêu chí tìm kiếm của bạn.")}</p>
            <button
              onClick={() => {
                setSelectedTag('ALL');
                setSelectedCourse('ALL');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-[#0076D1] hover:underline cursor-pointer"
            >
              {t("Đặt lại tất cả bộ lọc")}</button>
          </div>
        ) : (
          filteredWorkflows.map((wf) => {
            const theme = getCategoryTheme(wf.category);
            const isBookmarked = bookmarkedIds.has(wf.id);

            return (
              <div
                key={wf.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
              >
                {/* Top Row: Badges & Bookmark */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${theme.bg}`}
                      >
                        {theme.icon}
                        <span>{t(wf.category || 'Học thuật')}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {wf.courseCode}
                      </span>
                      {wf.technology && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-400">
                          {t(wf.technology)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => toggleBookmark(wf.id, e)}
                        title={isBookmarked ? t('workflows.unbookmark', 'Bỏ lưu quy trình') : t('workflows.bookmark', 'Lưu quy trình')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isBookmarked ? 'fill-[#0076D1] text-[#0076D1]' : ''
                          }`}
                        />
                      </button>
                      <ContentActionMenu
                        targetType="WORKFLOW"
                        targetId={wf.id}
                        targetTitle={wf.title}
                        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/workflows/${wf.id}`}
                      />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <Link
                      to={`/workflows/${wf.id}`}
                      className="font-bold text-base text-[#181C22] dark:text-slate-100 hover:text-[#0076D1] transition-colors line-clamp-1 block leading-snug"
                    >
                      {wf.title}
                    </Link>
                    <p className="text-xs text-[#404753] dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {wf.description}
                    </p>
                  </div>

                  {/* Tags Pill Row */}
                  {wf.tags && wf.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {wf.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F8F9FF] dark:bg-slate-800 text-[#0076D1] border border-blue-100/60"
                        >
                          #{t(tag)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Row: Steps Count, Author & Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{wf.steps?.length || 2} {t('workflows.stepsCount', 'bước thực hiện')}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1" title={t("Lượt áp dụng")}>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{wf.usageCount}  {t("dùng")}</span>
                      </span>
                      <span className="flex items-center gap-1" title={t("Lượt xem")}>
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{wf.viewsCount}  {t("xem")}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      {t("Đăng bởi")} <strong className="text-slate-700 dark:text-slate-300 font-semibold">{wf.author.fullName}</strong>
                    </span>

                    <Link
                      to={`/workflows/${wf.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0076D1] hover:text-[#005DA7] transition-colors"
                    >
                      <span>{t('workflows.viewDetail', 'Chi tiết quy trình')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Modal create workflow */}
      <CreateWorkflowModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newWf) => {
          setWorkflows([newWf, ...workflows]);
        }}
      />
    </div>
  );
};
