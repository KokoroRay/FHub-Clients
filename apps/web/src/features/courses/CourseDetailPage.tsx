import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  MessageSquare,
  Workflow,
  Star,
  Download,
  Plus,
  ArrowLeft,
  Check,
  Share2,
  FileDown,
  GraduationCap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { courseNodesApi, CourseNodeListItem } from '../../services/api/adminApi';
import {
  questionApi,
  studyMaterialApi,
  workflowApi,
  courseReviewApi,
  QuestionListItem,
  StudyMaterialItem,
  WorkflowListItem,
  CourseReviewListItem,
} from '../../services/api/contentApi';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';

export const CourseDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();

  const [course, setCourse] = useState<CourseNodeListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isFollowed, setIsFollowed] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [isFollowingPending, setIsFollowingPending] = useState(false);

  const [courseQuestions, setCourseQuestions] = useState<QuestionListItem[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<StudyMaterialItem[]>([]);
  const [courseWorkflows, setCourseWorkflows] = useState<WorkflowListItem[]>([]);
  const [courseReviews, setCourseReviews] = useState<CourseReviewListItem[]>([]);

  useEffect(() => {
    if (!code) return;
    let isMounted = true;
    setIsLoading(true);

    courseNodesApi
      .getCourseNodes({ search: code, pageSize: 50 })
      .then(async (res) => {
        if (!isMounted) return;
        const items = res?.items || res || [];
        const match =
          items.find(
            (c: any) =>
              (c.code || c.courseCode || '').toLowerCase() === code.toLowerCase()
          ) ||
          items[0] ||
          null;
        setCourse(match);

        if (match) {
          setIsFollowed(
            Boolean((match as any).isFollowing || (match as any).is_following)
          );
          setFollowCount(
            (match as any).followerCount || (match as any).follower_count || 0
          );

          const cId = Number(
            (match as any).courseId ||
              (match as any).courseNodeId ||
              (match as any).id
          );
          const cCode = match.code || match.courseCode || code;

          // 1. Fetch questions for this course (by courseId, fallback to search by code)
          questionApi
            .getQuestions({ courseId: cId > 0 ? cId : undefined, pageSize: 50 })
            .then(async (qRes) => {
              let qItems = qRes?.items || [];
              if (qItems.length === 0 && cCode) {
                try {
                  const searchQ = await questionApi.getQuestions({
                    search: cCode,
                    pageSize: 50,
                  });
                  qItems = searchQ?.items || [];
                } catch {}
              }
              if (isMounted) setCourseQuestions(qItems);
            })
            .catch(() => {
              if (isMounted) setCourseQuestions([]);
            });

          // 2. Fetch study materials for this course
          studyMaterialApi
            .getMaterials({ courseId: cId > 0 ? cId : undefined, pageSize: 50 })
            .then(async (mRes) => {
              let mItems = mRes?.items || [];
              if (mItems.length === 0 && cCode) {
                try {
                  const searchM = await studyMaterialApi.getMaterials({
                    search: cCode,
                    pageSize: 50,
                  });
                  mItems = searchM?.items || [];
                } catch {}
              }
              if (isMounted) setCourseMaterials(mItems);
            })
            .catch(() => {
              if (isMounted) setCourseMaterials([]);
            });

          // 3. Fetch workflows for this course
          workflowApi
            .getWorkflows({ courseId: cId > 0 ? cId : undefined, pageSize: 50 })
            .then(async (wRes) => {
              let wItems = wRes?.items || [];
              if (wItems.length === 0 && cCode) {
                try {
                  const searchW = await workflowApi.getWorkflows({
                    search: cCode,
                    pageSize: 50,
                  });
                  wItems = searchW?.items || [];
                } catch {}
              }
              if (isMounted) setCourseWorkflows(wItems);
            })
            .catch(() => {
              if (isMounted) setCourseWorkflows([]);
            });

          // 4. Fetch reviews from CourseReview API
          courseReviewApi
            .getReviews({ courseId: cId > 0 ? cId : undefined, pageSize: 50 })
            .then(async (rRes) => {
              let rItems = rRes?.items || [];
              if (rItems.length === 0 && cCode) {
                try {
                  const searchR = await courseReviewApi.getReviews({
                    search: cCode,
                    pageSize: 50,
                  });
                  rItems = searchR?.items || [];
                } catch {}
              }
              if (isMounted) setCourseReviews(rItems);
            })
            .catch(() => {
              if (isMounted) setCourseReviews([]);
            });
        }
      })
      .catch(() => {
        if (isMounted) setCourse(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Đang tải thông tin môn học...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs space-y-4">
        <p>Không tìm thấy môn học yêu cầu.</p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0076D1] text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh mục Course Hub
        </Link>
      </div>
    );
  }

  // Calculate review stats from real reviews
  const avgRating =
    courseReviews.length > 0
      ? courseReviews.reduce((sum, r) => sum + (r.overallRating || 5), 0) /
        courseReviews.length
      : (course as any).averageRating || 4.8;

  const avgDifficulty =
    courseReviews.length > 0
      ? courseReviews.reduce((sum, r) => sum + (r.difficultyRating || 3), 0) /
        courseReviews.length
      : 3.5;

  const avgWorkload =
    courseReviews.length > 0
      ? courseReviews.reduce((sum, r) => sum + (r.workloadRating || 3), 0) /
        courseReviews.length
      : 3.8;

  const getDifficultyLabel = (diff: number) => {
    if (diff <= 2) return 'Tương đối nhẹ';
    if (diff <= 3.5) return 'Trung bình';
    if (diff <= 4.2) return 'Khá nặng & thử thách';
    return 'Rất nặng / Căng thẳng';
  };

  const getWorkloadLabel = (workload: number) => {
    if (workload <= 2) return 'Ít bài tập';
    if (workload <= 3.5) return 'Vừa phải (4-6h/tuần)';
    return 'Nhiều đồ án (8-12h/tuần)';
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan & Đề cương', icon: <BookOpen className="w-4 h-4" /> },
    {
      id: 'discussions',
      label: 'Hỏi đáp & Thảo luận',
      count: courseQuestions.length,
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'materials',
      label: 'Tài liệu học tập',
      count: courseMaterials.length,
      icon: <Download className="w-4 h-4" />,
    },
    {
      id: 'workflows',
      label: 'Workflows thực hành',
      count: courseWorkflows.length,
      icon: <Workflow className="w-4 h-4" />,
    },
    {
      id: 'evaluations',
      label: 'Course Evaluations',
      count: courseReviews.length,
      icon: <Star className="w-4 h-4" />,
    },
  ];

  const followers = followCount || (course as any)?.followerCount || 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại Course Hub
      </Link>

      {/* Hero Course Header (Figma #93:5039 Course Node Detail) */}
      <div className="bg-white text-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-bold text-[#0076D1] tracking-tight">
                {course.code}
              </span>
              {course.majorCode && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0076D1] border border-blue-100">
                  {course.majorCode} Department
                </span>
              )}
              {course.semester && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Học kỳ {course.semester}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {course.credits || 3} Tín chỉ
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#181C22] tracking-tight leading-tight">
              {course.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {course.description ||
                'Chương trình đào tạo tiêu chuẩn của trường Đại học FPT.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Follow / Unfollow */}
            <button
              disabled={isFollowingPending}
              onClick={async () => {
                if (!course) return;
                const cId =
                  (course as any).courseId ||
                  (course as any).courseNodeId ||
                  (course as any).id;
                const prev = isFollowed;
                setIsFollowed(!prev);
                setFollowCount((c) => (prev ? Math.max(0, c - 1) : c + 1));
                setIsFollowingPending(true);
                try {
                  if (prev) {
                    await courseNodesApi.unfollowCourse(cId);
                  } else {
                    await courseNodesApi.followCourse(cId);
                  }
                } catch (err) {
                  console.warn('Follow toggle failed, reverting:', err);
                  setIsFollowed(prev);
                  setFollowCount((c) => (prev ? c + 1 : Math.max(0, c - 1)));
                } finally {
                  setIsFollowingPending(false);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isFollowed
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-[#0076D1] hover:bg-blue-700 text-white'
              }`}
            >
              {isFollowed ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{isFollowed ? 'Đang theo dõi' : 'Theo dõi môn'}</span>
            </button>

            {/* Direct Link to Course Evaluations (UC10) */}
            <Link
              to={`/course-evaluations?course=${course.code}&action=create`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-xs"
              title="Đóng góp đánh giá cho môn này trên chuyên trang Course Evaluations"
            >
              <span>Đánh giá môn này</span>
            </Link>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Đã sao chép liên kết môn học vào bộ nhớ tạm!');
                }
              }}
              className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs cursor-pointer"
              title="Chia sẻ môn học"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Mã môn:</span>
            <span className="font-bold text-[#0076D1] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {course.code}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to={`/course-evaluations?course=${course.code}`}
              className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#0076D1] transition-colors group cursor-pointer"
              title="Xem tất cả đánh giá trên Course Evaluations"
            >
              <span>
                Đánh giá: {avgRating > 0 ? `${avgRating.toFixed(1)}/5.0` : 'Chưa có'} ({courseReviews.length} lượt)
              </span>
              <span className="text-[11px] font-normal text-[#0076D1] group-hover:underline ml-1">
                → Mở Course Evaluations
              </span>
            </Link>

            <span className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-4 h-4 text-[#0076D1]" />{' '}
              {followers.toLocaleString()} Sinh viên theo dõi
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Learning Outcomes */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Mục tiêu môn học & Đề cương</span>
                  </h3>
                </CardHeader>
                <CardBody className="p-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    {course.description ||
                      `Môn học ${course.code} (${course.name}) thuộc chương trình đào tạo của Trường Đại học FPT.`}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">
                        Số tín chỉ
                      </span>
                      <strong className="text-slate-800 text-sm">
                        {course.credits || 3} Tín chỉ
                      </strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">
                        Học kỳ gợi ý
                      </span>
                      <strong className="text-slate-800 text-sm">
                        Học kỳ {course.semester || 'N/A'}
                      </strong>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Right Column: Assessment Scheme */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    Cơ cấu điểm & Thi cử
                  </h4>
                </CardHeader>
                <CardBody className="p-5 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">
                      Progress Tests & Lab
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      Theo Syllabus
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">
                      Practical Exam (PE)
                    </span>
                    <span className="font-bold text-blue-600">Theo Syllabus</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">
                      Final Exam (FE)
                    </span>
                    <span className="font-bold text-purple-600">Theo Syllabus</span>
                  </div>
                  <div className="pt-1 flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>Điểm qua môn:</span>
                    <span className="text-emerald-600 font-extrabold text-sm">
                      ≥ 5.0 / 10
                    </span>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* DISCUSSIONS TAB */}
        {activeTab === 'discussions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Thảo luận & Hỏi đáp ({courseQuestions.length})
              </h3>
              <Link to={`/discussions?action=create&course=${course.code}`}>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Đặt câu hỏi môn này
                </Button>
              </Link>
            </div>
            {courseQuestions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200 space-y-3">
                <p>Chưa có câu hỏi thảo luận nào cho môn học này trong hệ thống.</p>
                <Link to={`/discussions?action=create&course=${course.code}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Hãy là người đầu tiên đặt câu hỏi cho môn {course.code}
                  </Button>
                </Link>
              </div>
            ) : (
              courseQuestions.map((q) => (
                <Card key={q.questionId} hoverable>
                  <CardBody className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {q.isAnonymous
                          ? 'Ẩn danh FPTer'
                          : q.authorDisplayName ||
                            `Sinh viên #${q.authorUserId || 1}`}
                      </span>
                      {q.hasBestAnswer && (
                        <Badge variant="success" size="sm">
                          Đã có Best Answer
                        </Badge>
                      )}
                    </div>
                    <Link
                      to={`/discussions/${q.questionId}`}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 block"
                    >
                      {q.title}
                    </Link>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {q.body}
                    </p>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Tài liệu & Đề thi môn {course.code} ({courseMaterials.length})
              </h3>
              <Link to={`/materials?action=upload&course=${course.code}`}>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Đóng góp tài liệu
                </Button>
              </Link>
            </div>
            {courseMaterials.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200 space-y-3">
                <p>Chưa có tài liệu học tập nào cho môn {course.code}.</p>
                <Link to={`/materials?action=upload&course=${course.code}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Tải lên tài liệu đầu tiên cho môn {course.code}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseMaterials.map((m) => (
                  <Card key={m.studyMaterialId} hoverable>
                    <CardBody className="p-4 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <Badge variant="primary" size="sm">
                          {m.materialType || 'PDF'}
                        </Badge>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {m.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {m.fileSizeBytes
                            ? `${(m.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
                            : 'Tài liệu'}{' '}
                          • {m.downloadCount || 0} lượt tải
                        </p>
                      </div>
                      <Link to={`/materials/${m.studyMaterialId}`}>
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<FileDown className="w-4 h-4" />}
                        >
                          Chi tiết
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WORKFLOWS TAB */}
        {activeTab === 'workflows' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Workflows & Lộ trình thực hành ({courseWorkflows.length})
              </h3>
              <Link to={`/workflows?action=create&course=${course.code}`}>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Chia sẻ Workflow
                </Button>
              </Link>
            </div>
            {courseWorkflows.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200 space-y-3">
                <p>Chưa có workflow nào cho môn học này.</p>
                <Link to={`/workflows?action=create&course=${course.code}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Chia sẻ Workflow đầu tiên cho môn {course.code}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseWorkflows.map((w) => (
                  <Card key={w.workflowId} hoverable>
                    <CardBody className="p-5 space-y-2">
                      <Badge variant="purple" size="sm">
                        v{(w as any).version || 1}
                      </Badge>
                      <Link
                        to={`/workflows/${w.workflowId}`}
                        className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 block"
                      >
                        {w.title}
                      </Link>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {w.summary}
                      </p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COURSE EVALUATIONS TAB (Direct Gateway to UC10) */}
        {activeTab === 'evaluations' && (
          <div className="space-y-6">
            {/* Banner explaining relationship with Course Evaluations */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-blue-50 border border-amber-200/80 rounded-2xl p-6 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Chuyên trang Course Evaluations (UC10)
                    </span>
                    <span className="text-xs text-slate-500">
                      • Đánh giá & Kinh nghiệm thực tế
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Đánh giá môn học {course.code} trên Course Evaluations
                  </h3>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    Hệ thống đánh giá môn học, xếp hạng độ khó, khối lượng bài
                    tập, gợi ý giảng viên và mẹo qua môn được quản lý tập trung
                    tại chuyên trang <strong>Course Evaluations</strong>. Bạn có
                    thể tra cứu đầy đủ và đóng góp ý kiến của mình tại đó.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Link
                    to={`/course-evaluations?course=${course.code}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <span>Mở Course Evaluations</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/course-evaluations?course=${course.code}&action=create`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-xs"
                  >
                    <span>Viết đánh giá</span>
                  </Link>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-amber-200/60 text-center">
                <div className="bg-white/80 p-3 rounded-xl border border-amber-100">
                  <span className="text-[11px] text-slate-500 block">
                    Điểm trung bình
                  </span>
                  <div className="text-base font-extrabold text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{avgRating.toFixed(1)} / 5.0</span>
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-amber-100">
                  <span className="text-[11px] text-slate-500 block">Độ khó</span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5">
                    {getDifficultyLabel(avgDifficulty)}
                  </span>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-amber-100">
                  <span className="text-[11px] text-slate-500 block">
                    Khối lượng bài tập
                  </span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5">
                    {getWorkloadLabel(avgWorkload)}
                  </span>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-amber-100">
                  <span className="text-[11px] text-slate-500 block">
                    Số đánh giá
                  </span>
                  <span className="text-sm font-bold text-[#0076D1] block mt-0.5">
                    {courseReviews.length > 0
                      ? `${courseReviews.length} lượt review`
                      : 'Đang cập nhật'}
                  </span>
                </div>
              </div>
            </div>

            {/* Reviews List from Course Evaluations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">
                  Nhận xét & Kinh nghiệm tiêu biểu ({courseReviews.length})
                </h4>
                <Link
                  to={`/course-evaluations?course=${course.code}`}
                  className="text-xs font-semibold text-[#0076D1] hover:underline flex items-center gap-1"
                >
                  <span>Xem đầy đủ trên Course Evaluations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {courseReviews.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200 space-y-3">
                  <p>
                    Chưa có đánh giá nào cho môn {course.code} trên hệ thống.
                  </p>
                  <Link
                    to={`/course-evaluations?course=${course.code}&action=create`}
                  >
                    <Button
                      size="sm"
                      variant="primary"
                    >
                      Hãy là người đầu tiên đánh giá môn {course.code}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseReviews.map((r) => (
                    <Card key={r.courseReviewId} hoverable>
                      <CardBody className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0076D1] font-bold text-xs flex items-center justify-center">
                              {r.isAnonymous ? '?' : 'SV'}
                            </div>
                            <div>
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                                {r.isAnonymous
                                  ? 'Sinh viên ẩn danh'
                                  : `Sinh viên #${r.authorUserId || 1}`}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Kỳ {r.semesterCode || 'FA24'} •{' '}
                                {new Date(r.createdAt).toLocaleDateString(
                                  'vi-VN'
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{r.overallRating} / 5</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                          {r.reviewContent || r.survivalTips}
                        </p>

                        {r.survivalTips && r.reviewContent && (
                          <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-slate-600">
                            <strong className="text-[#0076D1]">
                              Mẹo sống sót:{' '}
                            </strong>
                            <span>{r.survivalTips}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">
                            Độ khó: {r.difficultyRating || 3}/5
                          </span>
                          <Link
                            to={`/course-evaluations?course=${course.code}`}
                            className="font-bold text-[#0076D1] hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Xem trên Course Evaluations</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
