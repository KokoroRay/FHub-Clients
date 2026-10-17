import React, { useState, useMemo } from 'react';
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
import { mockCourses } from '../../services/mockData';
import { CourseReview } from '../../types';
import { CreateCourseEvaluationModal } from './CreateCourseEvaluationModal';

const initialEvaluations: (CourseReview & { courseTitle?: string; shortReview?: string })[] = [
  {
    id: 'eval-1',
    courseCode: 'PRN211',
    courseTitle: 'Basic Cross-Platform Programming',
    shortReview: '“Helpful practical exercises and clear examples.”',
    reviewer: {
      id: 'u-1',
      fullName: 'Minh Tran',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    rating: 5,
    workloadRating: 4,
    difficultyRating: 3,
    comment:
      'PRN211 là môn học nền tảng cực tốt về C# và hệ sinh thái .NET. Thầy Bình dạy rất chi tiết về async/await và Entity Framework Core. Chú ý làm kỹ các Lab WPF và nộp assignment đúng hạn thì việc qua môn và đạt điểm 8+ hoàn toàn trong tầm tay.',
    semesterTaken: 'Spring 2025',
    lecturerName: 'Thầy Bùi Đình Bình',
    upvotes: 42,
    createdAt: '2026-10-12T08:00:00Z',
  },
  {
    id: 'eval-2',
    courseCode: 'PRN221',
    courseTitle: 'Advanced Cross-Platform Programming',
    shortReview: '“Good projects, but some topics need more explanation.”',
    reviewer: {
      id: 'u-2',
      fullName: 'Linh Nguyen',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
    rating: 4,
    workloadRating: 4,
    difficultyRating: 4,
    comment:
      'Môn học đi sâu vào Clean Architecture, CQRS và gRPC. Cần đầu tư thời gian tìm hiểu về Unit Test và SignalR thời gian thực để bảo vệ đồ án trước ban giám khảo.',
    semesterTaken: 'Fall 2025',
    lecturerName: 'Thầy Nguyễn Văn Nam',
    upvotes: 28,
    createdAt: '2026-10-10T10:30:00Z',
  },
  {
    id: 'eval-3',
    courseCode: 'SWP391',
    courseTitle: 'Software Project',
    shortReview: '“Useful teamwork experience and realistic project tasks.”',
    reviewer: {
      id: 'u-3',
      fullName: 'An Nguyen',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    rating: 5,
    workloadRating: 5,
    difficultyRating: 5,
    comment:
      'Dự án phần mềm thực chiến đầu tiên với mô hình Agile/Scrum. Nên dùng React + ASP.NET Core hoặc Java Spring Boot. Nhóm phải họp thường xuyên và dùng Git Flow chuẩn để tránh xung đột mã nguồn.',
    semesterTaken: 'Spring 2025',
    lecturerName: 'Hội đồng Bộ môn SE',
    upvotes: 56,
    createdAt: '2026-10-08T14:15:00Z',
  },
  {
    id: 'eval-4',
    courseCode: 'DBI202',
    courseTitle: 'Database Systems',
    shortReview: '“The fundamentals are useful, but practice is important.”',
    reviewer: {
      id: 'u-4',
      fullName: 'Bao Pham',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
    rating: 4,
    workloadRating: 3,
    difficultyRating: 4,
    comment:
      'Môn cơ sở dữ liệu quan trọng bậc nhất của ngành KTPM. Chú ý phần Chuẩn hóa 1NF, 2NF, 3NF và viết Store Procedure / Trigger. Đề thi Practical có thời gian khá gấp nên cần luyện gõ code SQL nhuần nhuyễn.',
    semesterTaken: 'Fall 2025',
    lecturerName: 'Thầy Trần Quốc Tuấn',
    upvotes: 35,
    createdAt: '2026-10-05T09:00:00Z',
  },
  {
    id: 'eval-5',
    courseCode: 'SWE201',
    courseTitle: 'Introduction to Software Engineering',
    shortReview: '“Well-structured material covering UML, SRS, and IEEE standards.”',
    reviewer: {
      id: 'u-5',
      fullName: 'Hoang Long',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    },
    rating: 5,
    workloadRating: 4,
    difficultyRating: 3,
    comment:
      'SWE201 rất nặng về viết tài liệu SRS và vẽ biểu đồ Use-Case / Class Diagram. Đề tài nhóm nên chốt sớm từ tuần 2. Cần bám sát chuẩn IEEE 830 và ma trận truy vết.',
    semesterTaken: 'Spring 2025',
    lecturerName: 'Cô Nguyễn Thị Lan',
    upvotes: 31,
    createdAt: '2026-09-28T11:20:00Z',
  },
  {
    id: 'eval-6',
    courseCode: 'PRM392',
    courseTitle: 'Mobile Programming',
    shortReview: '“Building cross-platform apps with Flutter and REST APIs was rewarding.”',
    reviewer: {
      id: 'u-6',
      fullName: 'Thu Ha',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
    rating: 4,
    workloadRating: 4,
    difficultyRating: 4,
    comment:
      'Khóa học thực chiến về lập trình di động với Flutter / Android Kotlin. Chú ý kiến trúc State Management (Bloc / Provider) để cấu trúc code không bị spaghetti.',
    semesterTaken: 'Fall 2025',
    lecturerName: 'Thầy Lê Hoàng',
    upvotes: 24,
    createdAt: '2026-09-20T16:00:00Z',
  },
];

export const CourseEvaluationListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'create');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

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

  const getCourseTitle = (code: string) => {
    const course = mockCourses.find((c) => c.code.toLowerCase() === code.toLowerCase());
    return course ? course.title : 'Academic Course';
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
