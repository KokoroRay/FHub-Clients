import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Users,
  Bookmark,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from 'lucide-react';
import { courseNodesApi, majorsApi, CourseNodeListItem, MajorListItem } from '../../services/api/adminApi';
import { useLanguage } from '../../context/LanguageContext';

export const CourseListPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedMajor, setSelectedMajor] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'rating' | 'popular'>('code');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<CourseNodeListItem[]>([]);
  const [majors, setMajors] = useState<MajorListItem[]>([]);
  const [bookmarkedCodes, setBookmarkedCodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(24); // 24 items fits 1, 2, 3, 4 columns nicely

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Fetch complete catalog (~1,000+ courses) so client-side filter and navigation is blazing fast
    courseNodesApi.getCourseNodes({ pageSize: 2000 })
      .then((res) => {
        if (isMounted) {
          const items = res?.items || res || [];
          setCourses(Array.isArray(items) ? items : []);
        }
      })
      .catch(() => {
        if (isMounted) setCourses([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    majorsApi.getMajors({ pageSize: 50 })
      .then((res) => {
        if (isMounted) setMajors(res?.items || []);
      })
      .catch(() => {
        if (isMounted) setMajors([]);
      });

    return () => { isMounted = false; };
  }, []);

  const toggleBookmark = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  // Reset to first page when any search/filter changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleMajorChange = (val: string) => {
    setSelectedMajor(val);
    setCurrentPage(1);
  };

  const handleSemesterChange = (val: string) => {
    setSelectedSemester(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val: 'code' | 'rating' | 'popular') => {
    setSortBy(val);
    setCurrentPage(1);
  };

  // Full filter bar allows student to see all courses across all departments
  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        const matchMajor =
          selectedMajor === 'ALL' ||
          (c.majorCode && c.majorCode.toUpperCase() === selectedMajor.toUpperCase()) ||
          String(c.majorId) === selectedMajor;
        const matchSemester =
          selectedSemester === 'ALL' || String(c.semester) === selectedSemester;
        const codeStr = (c.code || c.courseCode || '').toLowerCase();
        const nameStr = (c.name || c.courseName || '').toLowerCase();
        const matchSearch =
          codeStr.includes(searchQuery.toLowerCase()) ||
          nameStr.includes(searchQuery.toLowerCase()) ||
          (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchMajor && matchSemester && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return ((b as any).averageRating || 0) - ((a as any).averageRating || 0);
        if (sortBy === 'popular') return ((b as any).followerCount || 0) - ((a as any).followerCount || 0);
        return (a.code || a.courseCode || '').localeCompare(b.code || b.courseCode || '');
      });
  }, [courses, selectedMajor, selectedSemester, sortBy, searchQuery]);

  // Pagination calculations
  const totalCount = filteredCourses.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCourses.slice(startIndex, startIndex + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  // Generate page numbers window
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#181C22] tracking-tight">
              {t('nav.courseHub', 'Course Hub')}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D3E3FF] text-[#001C39]">
              <BookOpen className="w-3.5 h-3.5 text-[#0076D1]" />
              <span>{filteredCourses.length.toLocaleString()} / {courses.length.toLocaleString()} {t('courses.coursesCount', 'môn học')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#404753] mt-1">
            {t('courses.subtitle', 'Không gian học tập & theo dõi môn học toàn trường FPT. Đăng ký theo dõi để nhận thông báo bài giảng, hỏi đáp và tài nguyên mới.')}
          </p>
        </div>

        {/* Page size quick selector */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{t('courses.perPage', 'Mỗi trang')}:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 cursor-pointer focus:border-[#0076D1]"
          >
            <option value={12}>12 {t('courses.coursesCount', 'môn')}</option>
            <option value={24}>24 {t('courses.coursesCount', 'môn')}</option>
            <option value={48}>48 {t('courses.coursesCount', 'môn')}</option>
            <option value={96}>96 {t('courses.coursesCount', 'môn')}</option>
          </select>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search input (5 cols) */}
        <div className="relative md:col-span-5">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('courses.searchPlaceholder', 'Tìm theo mã môn (PRN211, SWP391...) hoặc tên môn...')}
            className="w-full bg-[#F0F3FD] border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-[#707785] focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
          />
        </div>

        {/* Major / Department filter (3 cols) */}
        <div className="md:col-span-3">
          <select
            value={selectedMajor}
            onChange={(e) => handleMajorChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
          >
            <option value="ALL">{t('common.allMajors', 'Tất cả ngành học (All Departments)')}</option>
            {majors.map((m) => (
              <option key={m.code} value={m.code}>
                {m.code} - {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester filter (2 cols) */}
        <div className="md:col-span-2">
          <select
            value={selectedSemester}
            onChange={(e) => handleSemesterChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
          >
            <option value="ALL">{t('common.allSemesters', 'Tất cả học kỳ')}</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
              <option key={s} value={String(s)}>
                {t('common.term', 'Học kỳ')} {s}
              </option>
            ))}
          </select>
        </div>

        {/* Sort by dropdown (2 cols) */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
          >
            <option value="code">{t('courses.sortCode', 'Sắp xếp: Mã môn (A-Z)')}</option>
            <option value="rating">{t('courses.sortRating', 'Sắp xếp: Đánh giá cao nhất')}</option>
            <option value="popular">{t('courses.sortPopular', 'Sắp xếp: Đông sinh viên nhất')}</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 space-y-2">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>{t('Loading data...', 'Đang tải danh mục hơn 1,000 môn học FPT University...')}</p>
        </div>
      ) : paginatedCourses.length === 0 ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">{t('No data found', 'Không tìm thấy môn học nào phù hợp')}</h3>
          <p className="text-xs text-slate-500">{t('Try adjusting your search or filters.', 'Hãy thử đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc ngành/kỳ học.')}</p>
        </div>
      ) : (
        <>
          {/* Course Cards Grid: 3-column desktop layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCourses.map((c) => {
              const courseCode = c.code || c.courseCode || '';
              const isBookmarked = bookmarkedCodes.has(courseCode);
              const enrolled = (c as any).followerCount || (c as any).follower_count || 0;
              const rating = (c as any).averageRating || (c as any).average_rating || 0;

              return (
                <div
                  key={c.id || courseCode}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#0076D1]/40 transition-all p-5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top row: Code Pill & Bookmark button */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#D3E3FF] text-[#0076D1]">
                        {courseCode}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(courseCode, e)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'bg-blue-50 border-blue-200 text-[#0076D1]'
                            : 'border-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                        title="Bookmark Course"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#0076D1]' : ''}`} />
                      </button>
                    </div>

                    {/* Course Title */}
                    <Link
                      to={`/courses/${c.code}`}
                      className="font-bold text-sm sm:text-base text-[#181C22] group-hover:text-[#0076D1] transition-colors line-clamp-1 block leading-snug"
                    >
                      {c.name}
                    </Link>

                    {/* Description */}
                    <p className="text-xs text-[#404753] line-clamp-2 leading-relaxed">
                      {c.description || 'Chương trình đào tạo tiêu chuẩn của trường Đại học FPT.'}
                    </p>

                    {/* Metadata Row: Term, Credits, Rating */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-1">
                      {c.semester && <span>{t('common.term', 'Kỳ')} {c.semester}</span>}
                      {c.semester && <span>•</span>}
                      <span>{c.credits || 3} {t('common.credits', 'Tín chỉ')}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rating > 0 ? rating.toFixed(1) : t('courses.noRating', 'Chưa có điểm')}</span>
                      </span>
                    </div>

                    {/* Topic / Department Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.majorCode && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-[#404753]">
                          {t('common.major', 'Ngành')}: {c.majorCode}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-[#0076D1]">
                        {(c.credits || 3) >= 4 ? t('courses.specializedCourse', 'Môn Chuyên Ngành') : t('courses.coreCourse', 'Môn Cơ Sở')}
                      </span>
                    </div>
                  </div>

                  {/* View Course Action Button */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#0076D1]" />
                      <span>{enrolled.toLocaleString()} {t('courses.followers', 'theo dõi')}</span>
                    </span>

                    <Link
                      to={`/courses/${c.code}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0076D1] group-hover:underline"
                    >
                      <span>{t('courses.viewCourseHub', 'Vào Course Hub')}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Pagination Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              {t('common.showing', 'Hiển thị')} <span className="font-bold text-slate-900">{(currentPage - 1) * pageSize + 1}</span> -{' '}
              <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, totalCount)}</span> {t('common.of', 'trong tổng số')}{' '}
              <span className="font-bold text-[#0076D1]">{totalCount.toLocaleString()}</span> {t('courses.coursesCount', 'môn học')}{' '}
              <span className="text-slate-400 font-normal">({t('common.page', 'Trang')} {currentPage} / {totalPages})</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* First Page button */}
              <button
                type="button"
                onClick={() => {
                  setCurrentPage(1);
                  window.scrollTo({ top: 180, behavior: 'smooth' });
                }}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title={t('common.firstPage', 'Trang đầu')}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page button */}
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 180, behavior: 'smooth' });
                }}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title={t('common.previousPage', 'Trang trước')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {pageNumbers.map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-slate-400">
                      ...
                    </span>
                  );
                }
                const isCurrent = p === currentPage;
                return (
                  <button
                    key={`page-${p}`}
                    type="button"
                    onClick={() => {
                      setCurrentPage(Number(p));
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#0076D1] text-white shadow-xs'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              {/* Next Page button */}
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 180, behavior: 'smooth' });
                }}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title={t('common.nextPage', 'Trang sau')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page button */}
              <button
                type="button"
                onClick={() => {
                  setCurrentPage(totalPages);
                  window.scrollTo({ top: 180, behavior: 'smooth' });
                }}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title={t('common.lastPage', 'Trang cuối')}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
