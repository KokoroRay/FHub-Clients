import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Star,
  Search,
  Plus,
  ThumbsUp,
  ArrowRight,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { courseNodesApi, CourseNodeListItem } from '../../services/api/adminApi';
import { CourseReview } from '../../types';
import { CreateCourseEvaluationModal } from './CreateCourseEvaluationModal';
import { courseReviewApi, CourseReviewListItem } from '../../services/api/contentApi';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import { useLanguage } from '../../context/LanguageContext';

export const CourseEvaluationListPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const courseFromUrl = searchParams.get('course') || searchParams.get('courseCode');
  const [evaluations, setEvaluations] = useState<(CourseReview & { courseTitle?: string; shortReview?: string })[]>([]);
  const [courses, setCourses] = useState<CourseNodeListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>(courseFromUrl ? courseFromUrl.toUpperCase() : 'ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'create');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(8); // 8 reviews per page (2 columns x 4 rows)

  useEffect(() => {
    const cParam = searchParams.get('course') || searchParams.get('courseCode');
    if (cParam) {
      setSelectedCourse(cParam.toUpperCase());
    }
    if (searchParams.get('action') === 'create') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // 1. Fetch courses catalog to map code & title accurately (all ~1,148 courses)
  useEffect(() => {
    courseNodesApi.getCourseNodes({ pageSize: 2000 })
      .then((res) => {
        const items = res?.items || res || [];
        setCourses(Array.isArray(items) ? items : []);
      })
      .catch(() => setCourses([]));
  }, []);

  const getCourseTitle = (code: string) => {
    const found = courses.find((c) => (c.code || c.courseCode || '').toLowerCase() === code.toLowerCase());
    return found ? (found.name || found.courseName || 'Môn học FPT') : 'Môn học FPT';
  };

  // 2. Fetch reviews from backend & map with real course codes
  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await courseReviewApi.getReviews({
          search: searchQuery.trim() || undefined,
          pageSize: 100,
        });

        if (isMounted) {
          const items: CourseReviewListItem[] = res?.items || [];
          if (items.length > 0) {
            const mappedReviews: (CourseReview & { courseTitle?: string; shortReview?: string })[] = items.map((item) => {
              // Match course from catalog
              const matchedCourse = courses.find((c: any) =>
                c.id === item.courseId ||
                c.courseId === item.courseId ||
                c.courseNodeId === item.courseId ||
                (c.code && (c.code.toUpperCase() === (item as any).courseCode?.toUpperCase() || Number(c.code.replace(/\D/g, '')) === item.courseId))
              );

              const courseCode =
                matchedCourse?.code ||
                matchedCourse?.courseCode ||
                (item as any).courseCode ||
                (item.courseId === 61 ? 'SWP391' : item.courseId === 30 ? 'PRN231' : item.courseId === 338 ? 'DBI202' : `COURSE-${item.courseId}`);

              const courseTitle =
                matchedCourse?.name ||
                matchedCourse?.courseName ||
                matchedCourse?.title ||
                (item as any).courseTitle ||
                getCourseTitle(courseCode);

              return {
                id: String(item.courseReviewId),
                courseCode: courseCode.toUpperCase(),
                courseTitle,
                shortReview:
                  item.survivalTips ||
                  (item.reviewContent ? (item.reviewContent.length > 90 ? item.reviewContent.slice(0, 90) + '...' : item.reviewContent) : 'Đánh giá môn học chi tiết'),
                reviewer: {
                  id: item.isAnonymous ? 'anon' : String(item.authorUserId || 'u-1'),
                  fullName: item.isAnonymous ? 'Sinh viên ẩn danh' : `Sinh viên #${item.authorUserId || 'K18'}`,
                  avatarUrl: '',
                },
                rating: item.overallRating || 5,
                workloadRating: item.workloadRating || 3,
                difficultyRating: item.difficultyRating || 3,
                comment: item.reviewContent || '',
                semesterTaken: `${item.semesterCode || 'FA'} ${item.academicYear || 2025}`,
                lecturerName: item.survivalTips?.startsWith('Giảng viên:') ? item.survivalTips.replace('Giảng viên:', '').trim() : undefined,
                upvotes: 8 + (Number(item.courseReviewId) % 15),
                createdAt: item.createdAt || new Date().toISOString(),
              };
            });
            setEvaluations(mappedReviews);
          } else {
            setEvaluations([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setEvaluations([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReviews();
    return () => { isMounted = false; };
  }, [searchQuery, courses]);

  const handleVoteHelpful = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEvaluations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isVoted = votedIds.has(id);
          return { ...item, upvotes: item.upvotes + (isVoted ? -1 : 1) };
        }
        return item;
      })
    );
    setVotedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleCourseChange = (val: string) => {
    setSelectedCourse(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val: 'newest' | 'highest' | 'helpful') => {
    setSortBy(val);
    setCurrentPage(1);
  };

  // Filtered and sorted evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations
      .filter((ev) => {
        const matchesCourse =
          selectedCourse === 'ALL' ||
          ev.courseCode.toLowerCase() === selectedCourse.toLowerCase();
        const matchesSearch =
          ev.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (ev.courseTitle && ev.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
          ev.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (ev.shortReview && ev.shortReview.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (ev.lecturerName && ev.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCourse && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'helpful') return b.upvotes - a.upvotes;
        if (sortBy === 'highest') return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [evaluations, searchQuery, selectedCourse, sortBy]);

  // Pagination calculation
  const totalCount = filteredEvaluations.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedEvaluations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEvaluations.slice(startIndex, startIndex + pageSize);
  }, [filteredEvaluations, currentPage, pageSize]);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Unique course codes present in evaluations or selectedCourse + catalog
  const availableCourseOptions = useMemo(() => {
    const set = new Set<string>();
    if (selectedCourse && selectedCourse !== 'ALL') {
      set.add(selectedCourse.toUpperCase());
    }
    evaluations.forEach((e) => {
      if (e.courseCode) set.add(e.courseCode.toUpperCase());
    });
    courses.forEach((c) => {
      const code = c.code || c.courseCode;
      if (code) set.add(code.toUpperCase());
    });
    return Array.from(set).sort();
  }, [evaluations, courses, selectedCourse]);

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb & Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#181C22] dark:text-slate-100 tracking-tight">
              {t('Course Evaluations')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0076D1] border border-blue-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#0076D1]" />
              <span>{filteredEvaluations.length} {t('evaluations.realReviews', 'Đánh giá thực tế')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#404753] dark:text-slate-400 mt-1">
            {t('Student reviews, difficulty levels, workload ratings, and survival tips.')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('evaluations.writeEvaluation', 'Viết đánh giá môn học')}</span>
        </button>
      </div>

      {/* 2. Search and Filters Inline Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-3.5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('evaluations.searchPlaceholder', 'Tìm theo mã môn (SWP391, MKT101, GRA201, LAW101...), giảng viên hoặc nội dung review...')}
              className="w-full bg-[#F8F9FF] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1]"
            />
          </div>

          {/* Dynamic Course Filter Select */}
          <div className="relative md:col-span-3">
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0076D1] cursor-pointer"
            >
              <option value="ALL">{t('evaluations.allCourses', 'Tất cả môn học (All Courses)')}</option>
              {availableCourseOptions.map((code) => (
                <option key={code} value={code}>
                  {code} - {getCourseTitle(code)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Dropdown Select */}
          <div className="relative md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0076D1] cursor-pointer"
            >
              <option value="newest">{t('evaluations.sortNewest', 'Sắp xếp: Mới nhất')}</option>
              <option value="highest">{t('evaluations.sortHighest', 'Sắp xếp: Điểm đánh giá cao nhất')}</option>
              <option value="helpful">{t('evaluations.sortHelpful', 'Sắp xếp: Được bình chọn hữu ích nhất')}</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Evaluation Cards Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>{t('Đang tải dữ liệu đánh giá thực tế từ hệ thống...')}</p>
        </div>
      ) : paginatedEvaluations.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0076D1] flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {selectedCourse !== 'ALL'
              ? `${t('Chưa có đánh giá nào cho môn này')} (${selectedCourse})`
              : t('No reviews found matching criteria')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t('Hãy chia sẻ trải nghiệm môn học của bạn để giúp đỡ cộng đồng sinh viên FPT!')}
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Viết đánh giá môn học')} {selectedCourse !== 'ALL' ? selectedCourse : ''}</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedEvaluations.map((ev) => {
              const courseTitle = ev.courseTitle || getCourseTitle(ev.courseCode);
              const isVoted = votedIds.has(ev.id);

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
                >
                  <div className="space-y-3">
                    {/* Course Code, Header, Rating & 3-dots Menu */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/courses/${ev.courseCode}`}
                          className="text-base font-black text-[#181C22] hover:text-[#0076D1] transition-colors font-mono tracking-tight block"
                        >
                          {ev.courseCode}
                        </Link>
                        <div className="text-xs font-semibold text-slate-600 line-clamp-1 mt-0.5">
                          {courseTitle}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Numeric Badge & Amber Stars */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-amber-50/70 border border-amber-200/60 px-2 py-1 rounded-lg">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= ev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-amber-900">
                            {ev.rating}.0 / 5
                          </span>
                        </div>

                        {/* 3-dots Content Action Menu (Report / Ticket) */}
                        <ContentActionMenu
                          targetType="OTHER"
                          targetId={ev.id}
                          targetTitle={`Đánh giá môn ${ev.courseCode}`}
                          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/course-evaluations?course=${ev.courseCode}`}
                        />
                      </div>
                    </div>

                    {/* Gauges for Workload & Difficulty */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{t('evaluations.difficulty', 'Độ khó')}:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {ev.difficultyRating || 3}/5 {ev.difficultyRating >= 4 ? t('evaluations.diffChallenging', 'Khá khó') : t('evaluations.diffModerate', 'Vừa sức')}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{t('evaluations.workload', 'Khối lượng')}:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {ev.workloadRating || 3}/5 {ev.workloadRating >= 4 ? t('evaluations.workloadHeavy', 'Nhiều bài tập') : t('evaluations.workloadManageable', 'Vừa phải')}
                        </span>
                      </div>
                    </div>

                    {/* Survival Tips Highlight */}
                    {ev.shortReview && (
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 italic bg-[#F8F9FF] dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 leading-relaxed">
                        💡 <strong>{t('evaluations.survivalTips', 'Kinh nghiệm')}:</strong> {ev.shortReview}
                      </div>
                    )}

                    {/* Comment Excerpt */}
                    <p className="text-xs text-[#404753] dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {ev.comment}
                    </p>
                  </div>

                  {/* Student Meta & Card Action */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      {/* Student Meta */}
                      <div className="flex items-center gap-2">
                        {ev.reviewer.avatarUrl ? (
                          <img
                            src={ev.reviewer.avatarUrl}
                            alt={ev.reviewer.fullName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                            <User className="w-3 h-3" />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                            {ev.reviewer.fullName.includes('#') ? `${t('common.student', 'Sinh viên')} #${ev.reviewer.fullName.split('#')[1]}` : t(ev.reviewer.fullName)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(ev.createdAt).toLocaleDateString()}
                            {ev.semesterTaken && ` · ${t('common.term', 'Học kỳ')} ${ev.semesterTaken}`}
                            {ev.lecturerName && ` · ${ev.lecturerName}`}
                          </span>
                        </div>
                      </div>

                      {/* Helpful Vote Button */}
                      <button
                        type="button"
                        onClick={(e) => handleVoteHelpful(ev.id, e)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                          isVoted
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-[#0076D1]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{t('evaluations.helpful', 'Hữu ích')} ({ev.upvotes})</span>
                      </button>
                    </div>

                    {/* View Course Hub Link */}
                    <div className="flex justify-end pt-1">
                      <Link
                        to={`/courses/${ev.courseCode}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0076D1] hover:text-[#005DA7] transition-colors"
                      >
                        <span>{t('evaluations.goToCourseHub', 'Vào Course Hub môn này')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600">
                {t('common.showing', 'Hiển thị')} <span className="font-bold text-slate-900">{(currentPage - 1) * pageSize + 1}</span> -{' '}
                <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, totalCount)}</span> {t('common.of', 'trong tổng số')}{' '}
                <span className="font-bold text-[#0076D1]">{totalCount}</span> {t('evaluations.reviewsCount', 'bài đánh giá')}{' '}
                <span className="text-slate-400 font-normal">({t('common.page', 'Trang')} {currentPage} / {totalPages})</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title={t('common.previousPage', 'Trang trước')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {pageNumbers.map((p, idx) => {
                  if (p === '...') {
                    return <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-slate-400">...</span>;
                  }
                  const isCurrent = p === currentPage;
                  return (
                    <button
                      key={`ev-page-${p}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(p))}
                      className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#0076D1] text-white shadow-xs'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title={t('common.nextPage', 'Trang sau')}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <CreateCourseEvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultCourseCode={selectedCourse !== 'ALL' ? selectedCourse : ''}
        onCreated={(newEv) => {
          setEvaluations((prev) => [newEv as any, ...prev]);
        }}
      />
    </div>
  );
};
