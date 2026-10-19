import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  MessageSquare,
  FileText,
  Workflow,
  Star,
  Download,
  Plus,
  ArrowLeft,
  Check,
  Share2,
  FileDown,
  GraduationCap,
} from 'lucide-react';
import { courseNodesApi, CourseNodeListItem } from '../../services/api/adminApi';
import { questionApi, studyMaterialApi, workflowApi, courseReviewApi, QuestionListItem, StudyMaterialListItem, WorkflowListItem, CourseReviewListItem } from '../../services/api/contentApi';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { Textarea } from '../../components/common/Input';

export const CourseDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();

  const [course, setCourse] = useState<CourseNodeListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isFollowed, setIsFollowed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [courseQuestions, setCourseQuestions] = useState<QuestionListItem[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<StudyMaterialListItem[]>([]);
  const [courseWorkflows, setCourseWorkflows] = useState<WorkflowListItem[]>([]);
  const [courseReviews, setCourseReviews] = useState<CourseReviewListItem[]>([]);

  useEffect(() => {
    if (!code) return;
    let isMounted = true;
    setIsLoading(true);

    courseNodesApi.getCourseNodes({ search: code, pageSize: 50 })
      .then((res) => {
        if (!isMounted) return;
        const items = res?.items || [];
        const match = items.find((c: any) => (c.code || c.courseCode || '').toLowerCase() === code.toLowerCase()) || items[0] || null;
        setCourse(match);
        if (match) {
          const cId = (match as any).courseNodeId || (match as any).id;
          // Fetch sub-items for this course
          questionApi.getQuestions({ courseId: cId, pageSize: 20 })
            .then((qRes) => { if (isMounted) setCourseQuestions(qRes?.items || []); })
            .catch(() => { if (isMounted) setCourseQuestions([]); });

          studyMaterialApi.getMaterials({ courseId: cId, pageSize: 20 })
            .then((mRes) => { if (isMounted) setCourseMaterials(mRes?.items || []); })
            .catch(() => { if (isMounted) setCourseMaterials([]); });

          workflowApi.getWorkflows({ courseId: cId, pageSize: 20 })
            .then((wRes) => { if (isMounted) setCourseWorkflows(wRes?.items || []); })
            .catch(() => { if (isMounted) setCourseWorkflows([]); });

          courseReviewApi.getReviews({ courseId: cId, pageSize: 20 })
            .then((rRes) => { if (isMounted) setCourseReviews(rRes?.items || []); })
            .catch(() => { if (isMounted) setCourseReviews([]); });
        }
      })
      .catch(() => {
        if (isMounted) setCourse(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
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
      <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Không tìm thấy môn học</h3>
        <p className="text-xs text-slate-500">Mã môn học {code} không tồn tại trong hệ thống.</p>
        <Link to="/courses" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách môn học
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan & Đề cương', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'discussions', label: 'Hỏi đáp & Thảo luận', count: courseQuestions.length, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'materials', label: 'Tài liệu học tập', count: courseMaterials.length, icon: <Download className="w-4 h-4" /> },
    { id: 'workflows', label: 'Workflows thực hành', count: courseWorkflows.length, icon: <Workflow className="w-4 h-4" /> },
    { id: 'reviews', label: 'Đánh giá môn học', count: courseReviews.length, icon: <Star className="w-4 h-4" /> },
  ];

  const rating = (course as any).averageRating || 0;
  const followers = (course as any).followerCount || 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại Course Hub
      </Link>

      {/* Hero Course Header (Figma #93:5039 Course Node Detail) */}
      <div className="bg-white text-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-bold text-[#0076D1] tracking-tight">{course.code}</span>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#181C22] tracking-tight leading-tight">{course.name}</h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {course.description || 'Chương trình đào tạo tiêu chuẩn của trường.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsFollowed(!isFollowed)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isFollowed 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' 
                  : 'bg-[#0076D1] hover:bg-blue-700 text-white'
              }`}
            >
              {isFollowed ? <Check className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4" />}
              <span>{isFollowed ? 'Đang theo dõi' : 'Theo dõi môn'}</span>
            </button>
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Đánh giá</span>
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs">
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
            <span className="flex items-center gap-1.5 font-bold text-amber-600">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {rating > 0 ? rating.toFixed(1) : '0'} / 5.0 ({courseReviews.length} đánh giá)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-4 h-4 text-[#0076D1]" /> {followers.toLocaleString()} Sinh viên theo dõi
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
                    {course.description || `Môn học ${course.code} (${course.name}) thuộc chương trình đào tạo của Trường Đại học FPT.`}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Số tín chỉ</span>
                      <strong className="text-slate-800 text-sm">{course.credits || 3} Tín chỉ</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Học kỳ gợi nghị</span>
                      <strong className="text-slate-800 text-sm">Học kỳ {course.semester || 'N/A'}</strong>
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
                    <span className="text-slate-600 dark:text-slate-400">Progress Tests & Lab</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">Theo Syllabus</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Practical Exam (PE)</span>
                    <span className="font-bold text-blue-600">Theo Syllabus</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Final Exam (FE)</span>
                    <span className="font-bold text-purple-600">Theo Syllabus</span>
                  </div>
                  <div className="pt-1 flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>Điểm qua môn:</span>
                    <span className="text-emerald-600 font-extrabold text-sm">≥ 5.0 / 10</span>
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
              <Link to="/discussions?action=create">
                <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Đặt câu hỏi môn này
                </Button>
              </Link>
            </div>
            {courseQuestions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                Chưa có câu hỏi thảo luận nào cho môn học này.
              </div>
            ) : (
              courseQuestions.map((q) => (
                <Card key={q.questionId} hoverable>
                  <CardBody className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {q.isAnonymous ? 'Ẩn danh FPTer' : (q.authorDisplayName || `User #${q.authorUserId || 1}`)}
                      </span>
                      {q.hasBestAnswer && <Badge variant="success" size="sm">Đã có Best Answer</Badge>}
                    </div>
                    <Link to={`/discussions/${q.questionId}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 block">
                      {q.title}
                    </Link>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{q.body}</p>
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
              <Link to="/materials?action=upload">
                <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Đóng góp tài liệu
                </Button>
              </Link>
            </div>
            {courseMaterials.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                Chưa có tài liệu nào cho môn học này.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseMaterials.map((m) => (
                  <Card key={m.studyMaterialId} hoverable>
                    <CardBody className="p-4 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <Badge variant="primary" size="sm">{m.materialType || 'PDF'}</Badge>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{m.title}</h4>
                        <p className="text-[11px] text-slate-500">
                          {m.fileSizeBytes ? `${(m.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : 'Tài liệu'} • {m.downloadCount || 0} lượt tải
                        </p>
                      </div>
                      <Link to={`/materials/${m.studyMaterialId}`}>
                        <Button size="sm" variant="secondary" leftIcon={<FileDown className="w-4 h-4" />}>
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
                Workflows & Kiến trúc mẫu ({courseWorkflows.length})
              </h3>
              <Link to="/workflows?action=create">
                <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Chia sẻ Workflow
                </Button>
              </Link>
            </div>
            {courseWorkflows.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                Chưa có workflow nào cho môn học này.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseWorkflows.map((w) => (
                  <Card key={w.workflowId} hoverable>
                    <CardBody className="p-5 space-y-2">
                      <Badge variant="purple" size="sm">v{(w as any).version || 1}</Badge>
                      <Link to={`/workflows/${w.workflowId}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 block">
                        {w.title}
                      </Link>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{w.summary}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Nhận xét & Kinh nghiệm học ({courseReviews.length})
              </h3>
              <Button size="sm" variant="primary" onClick={() => setShowReviewModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Viết đánh giá
              </Button>
            </div>
            {courseReviews.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                Chưa có đánh giá nào cho môn học này.
              </div>
            ) : (
              courseReviews.map((r) => (
                <Card key={r.courseReviewId}>
                  <CardBody className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {r.isAnonymous ? 'Sinh viên ẩn danh' : `Sinh viên #${r.authorUserId || 1}`}
                      </span>
                      <div className="flex items-center text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="ml-1">{r.overallRating} / 5.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {r.reviewContent || r.survivalTips}
                    </p>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={`Đánh giá môn học ${course.code}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => setShowReviewModal(false)}>Gửi đánh giá</Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Điểm đánh giá tổng quan (1-5 sao):</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 cursor-pointer"
                >
                  <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Kinh nghiệm học & lời khuyên cho khóa dưới"
            placeholder="Chia sẻ về độ khó, cách làm lab, giảng viên và mẹo thi PE/FE..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
};
