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
} from 'lucide-react';
import { courseNodesApi, CourseNodeListItem } from '../../services/api/adminApi';
import { CourseReview } from '../../types';
import { CreateCourseEvaluationModal } from './CreateCourseEvaluationModal';
import { courseReviewApi } from '../../services/api/contentApi';

export const CourseEvaluationListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [evaluations, setEvaluations] = useState<(CourseReview & { courseTitle?: string; shortReview?: string })[]>([]);
  const [courses, setCourses] = useState<CourseNodeListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'create');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    courseNodesApi.getCourseNodes({ pageSize: 50 })
      .then((res) => setCourses(res?.items || []))
      .catch(() => setCourses([]));
  }, []);

  const getCourseTitle = (code: string) => {
    const found = courses.find((c) => (c.code || c.courseCode || '').toLowerCase() === code.toLowerCase());
    return found ? (found.name || found.courseName || 'Môn học FPT') : 'Môn học FPT';
  };

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await courseReviewApi.getReviews({
          search: searchQuery.trim() || undefined,
          pageSize: 50,
        });
        if (isMounted) {
          const items = res?.items || [];
          const mappedReviews: (CourseReview & { courseTitle?: string; shortReview?: string })[] = items.map((item) => ({
            id: String(item.courseReviewId),
            courseCode: `CRS-${item.courseId}`,
            courseTitle: `Course #${item.courseId}`,
            shortReview: item.survivalTips || (item.reviewContent ? item.reviewContent.slice(0, 80) + '...' : 'Đánh giá môn học chi tiết'),
            reviewer: {
              id: item.isAnonymous ? 'anon' : String(item.authorUserId || 'u-1'),
              fullName: item.isAnonymous ? 'Sinh viên ẩn danh' : `Sinh viên #${item.authorUserId || 1}`,
              avatarUrl: '',
            },
            rating: item.overallRating,
            workloadRating: item.workloadRating,
            difficultyRating: item.difficultyRating,
            comment: item.reviewContent || '',
            semesterTaken: `${item.semesterCode} ${item.academicYear}`,
            lecturerName: 'Bộ môn FPTU',
            upvotes: 0,
            createdAt: item.createdAt,
          }));
          setEvaluations(mappedReviews);
        }
      } catch (err) {
        if (isMounted) setEvaluations([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchReviews();
    return () => { isMounted = false; };
  }, [searchQuery]);

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

  const filteredEvaluations = useMemo(() => {
    return evaluations
      .filter((ev) => {
        const matchesCourse = selectedCourse === 'ALL' || ev.courseCode.toLowerCase() === selectedCourse.toLowerCase();
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

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb & Top Page Header (Figma #97:119) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#181C22] tracking-tight">
              Course Evaluations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0076D1] border border-blue-100">
              {filteredEvaluations.length} Reviews
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#404753] mt-1">
            Read student feedback to help choose your courses.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Evaluation</span>
        </button>
      </div>

      {/* 2. Search and Filters Inline Toolbar (Figma #97:144) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses or evaluations..."
              className="w-full bg-[#F8F9FF] border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1]"
            />
          </div>

          {/* Course Filter Select */}
          <div className="relative md:col-span-3">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
            >
              <option value="ALL">All Courses</option>
              <option value="PRN211">PRN211</option>
              <option value="PRN221">PRN221</option>
              <option value="SWP391">SWP391</option>
              <option value="DBI202">DBI202</option>
              <option value="SWE201">SWE201</option>
              <option value="PRM392">PRM392</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Dropdown Select */}
          <div className="relative md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="highest">Sort: Highest Rating</option>
              <option value="helpful">Sort: Most Helpful</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Evaluation Cards Grid (2-column desktop layout) (Figma #97:171) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvaluations.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No course evaluations found matching your criteria.
          </div>
        ) : (
          filteredEvaluations.map((ev) => {
            const courseTitle = ev.courseTitle || getCourseTitle(ev.courseCode);
            const isVoted = votedIds.has(ev.id);

            return (
              <div
                key={ev.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
              >
                <div className="space-y-3">
                  {/* Course Code, Header & Rating (Figma #97:174) */}
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
                  </div>

                  {/* Short Review Sentence (Figma #97:192) */}
                  {ev.shortReview && (
                    <div className="text-xs font-medium text-slate-800 italic bg-[#F8F9FF] p-2.5 rounded-lg border border-slate-100">
                      {ev.shortReview}
                    </div>
                  )}

                  {/* Comment Excerpt */}
                  <p className="text-xs text-[#404753] line-clamp-2 leading-relaxed">
                    {ev.comment}
                  </p>
                </div>

                {/* Student Meta & Card Action (Figma #97:195) */}
                <div className="pt-4 border-t border-slate-100 mt-4 space-y-2.5">
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
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                          <User className="w-3 h-3" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-800 block leading-tight">
                          {ev.reviewer.fullName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ev.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {ev.semesterTaken && ` · ${ev.semesterTaken}`}
                        </span>
                      </div>
                    </div>

                    {/* Helpful Vote Button */}
                    <button
                      onClick={(e) => handleVoteHelpful(ev.id, e)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        isVoted
                          ? 'bg-blue-50 border-blue-200 text-[#0076D1]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({ev.upvotes})</span>
                    </button>
                  </div>

                  {/* View Evaluation Link */}
                  <div className="flex justify-end pt-1">
                    <Link
                      to={`/course-evaluations/${ev.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0076D1] hover:text-[#005DA7] transition-colors"
                    >
                      <span>View Evaluation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <CreateCourseEvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newEv) => {
          setEvaluations([newEv as any, ...evaluations]);
        }}
      />
    </div>
  );
};
