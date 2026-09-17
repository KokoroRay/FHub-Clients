import React, { useState } from 'react';
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
  ThumbsUp,
  FileDown,
} from 'lucide-react';
import { mockCourses, mockQuestions, mockMaterials, mockWorkflows, mockCourseReviews } from '../../services/mockData';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';

export const CourseDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const course = mockCourses.find((c) => c.code.toLowerCase() === (code || '').toLowerCase()) || mockCourses[0];

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isFollowed, setIsFollowed] = useState(course.isFollowed || false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewWorkload, setReviewWorkload] = useState(3);
  const [reviewComment, setReviewComment] = useState('');

  const courseQuestions = mockQuestions.filter((q) => q.courseCode === course.code);
  const courseMaterials = mockMaterials.filter((m) => m.courseCode === course.code);
  const courseWorkflows = mockWorkflows.filter((w) => w.courseCode === course.code);
  const courseReviews = mockCourseReviews.filter((r) => r.courseCode === course.code);

  const tabs = [
    { id: 'overview', label: 'Tổng quan môn học', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'discussions', label: 'Hỏi đáp & Thảo luận', count: courseQuestions.length, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'materials', label: 'Tài liệu học tập', count: courseMaterials.length, icon: <Download className="w-4 h-4" /> },
    { id: 'workflows', label: 'Workflows thực hành', count: courseWorkflows.length, icon: <Workflow className="w-4 h-4" /> },
    { id: 'reviews', label: 'Đánh giá môn học', count: courseReviews.length, icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/courses" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#005da7] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại Course Hub
      </Link>

      {/* Hero Course Header (Figma 20:1330) */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-sky-400">{course.code}</span>
              <Badge variant="primary" size="sm">
                {course.majorCode} Department
              </Badge>
              <Badge variant="neutral" size="sm" className="bg-white/10 text-white border-0">
                Học kỳ {course.semester}
              </Badge>
              <Badge variant="neutral" size="sm" className="bg-white/10 text-white border-0">
                {course.credits} Tín chỉ
              </Badge>
            </div>
            <h1 className="text-2xl font-black tracking-tight">{course.title}</h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant={isFollowed ? 'secondary' : 'primary'}
              onClick={() => setIsFollowed(!isFollowed)}
              leftIcon={isFollowed ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            >
              {isFollowed ? 'Đã theo dõi môn' : 'Theo dõi môn học'}
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Prerequisites & Quick Stats */}
        <div className="pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Môn tiên quyết:</span>
            {course.prerequisites?.map((pre) => (
              <Link key={pre} to={`/courses/${pre}`} className="font-bold text-sky-400 hover:underline">
                {pre}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" /> {course.averageRating} / 5.0
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Users className="w-4 h-4" /> {course.followerCount.toLocaleString()} Sinh viên theo dõi
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Mục tiêu & Chuẩn đầu ra môn học
                  </h3>
                </CardHeader>
                <CardBody className="p-5 text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Môn học <strong>{course.code}</strong> cung cấp cho sinh viên kiến thức chuyên sâu và kỹ năng thực hành lập trình ứng dụng hiện đại:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li>Nắm vững cú pháp nâng cao của ngôn ngữ và các Design Patterns thực tế.</li>
                    <li>Sử dụng Entity Framework Core để thiết kế ORM và tối ưu câu truy vấn cơ sở dữ liệu.</li>
                    <li>Xây dựng kiến trúc phân tầng chuẩn Clean Architecture và Repository Pattern.</li>
                    <li>Thực hành làm việc nhóm, quản lý mã nguồn bằng Git và quy trình CI/CD cơ bản.</li>
                  </ul>
                </CardBody>
              </Card>

              {/* Top Questions in this course */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Câu hỏi Q&A nổi bật môn {course.code}
                  </h3>
                  <button onClick={() => setActiveTab('discussions')} className="text-xs text-[#005da7] hover:underline font-semibold cursor-pointer">
                    Xem tất cả ({courseQuestions.length})
                  </button>
                </CardHeader>
                <CardBody className="p-5 space-y-3">
                  {courseQuestions.map((q) => (
                    <div key={q.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors">
                      <Link to={`/discussions/${q.id}`} className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-[#005da7]">
                        {q.title}
                      </Link>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{q.author.fullName}</span>
                        <span>{q.answersCount} câu trả lời • {q.upvotes} upvotes</span>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>

            {/* Sidebar Context */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Giảng viên gợi ý môn học
                  </h4>
                </CardHeader>
                <CardBody className="p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" alt="Lecturer" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-200">Thầy Trần Đình Khang</h5>
                      <p className="text-[10px] text-slate-400">Bộ môn Kỹ thuật phần mềm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80" alt="Lecturer" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-200">Cô Nguyễn Mai Lan</h5>
                      <p className="text-[10px] text-slate-400">Bộ môn Hệ thống thông tin</p>
                    </div>
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
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Thảo luận & Hỏi đáp môn {course.code}
              </h3>
              <Link to="/discussions?action=create">
                <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Đặt câu hỏi mới
                </Button>
              </Link>
            </div>

            {courseQuestions.map((q) => (
              <Card key={q.id} hoverable>
                <CardBody className="p-5 space-y-2">
                  <Link to={`/discussions/${q.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-[#005da7]">
                    {q.title}
                  </Link>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{q.content}</p>
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Người hỏi: {q.author.fullName}</span>
                    <span>{q.answersCount} câu trả lời</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Kho tài liệu & Đề thi mẫu môn {course.code}
              </h3>
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Tải lên tài liệu
              </Button>
            </div>

            <div className="space-y-3">
              {courseMaterials.map((mat) => (
                <Card key={mat.id} hoverable>
                  <CardBody className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#005da7] flex items-center justify-center font-bold text-xs shrink-0">
                        {mat.fileType}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{mat.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {mat.fileSizeMb} MB • Học kỳ {mat.semesterUploaded} • Đăng bởi {mat.author.fullName}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<FileDown className="w-4 h-4" />}>
                      Tải về ({mat.downloadsCount})
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* WORKFLOWS TAB */}
        {activeTab === 'workflows' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Workflows & Code Templates môn {course.code}
              </h3>
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Chia sẻ Workflow mới
              </Button>
            </div>

            {courseWorkflows.map((wf) => (
              <Card key={wf.id} hoverable>
                <CardBody className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="sm">{wf.technology}</Badge>
                    <span className="text-xs text-slate-400">{wf.steps.length} bước thực hiện</span>
                  </div>
                  <Link to={`/workflows/${wf.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-[#005da7] block">
                    {wf.title}
                  </Link>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{wf.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Đánh giá môn học từ sinh viên khóa trước
                </h3>
                <p className="text-xs text-slate-400">Chia sẻ mức độ khó, khối lượng bài tập (workload) và mẹo qua môn.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowReviewModal(true)} leftIcon={<Star className="w-4 h-4" />}>
                Viết Đánh giá
              </Button>
            </div>

            {/* Review Cards */}
            <div className="space-y-3">
              {courseReviews.map((rev) => (
                <Card key={rev.id}>
                  <CardBody className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={rev.reviewer.avatarUrl} alt={rev.reviewer.fullName} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{rev.reviewer.fullName}</span>
                          <span className="text-[10px] text-slate-400 block">Đã học: {rev.semesterTaken} • {rev.lecturerName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                      "{rev.comment}"
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-4">
                        <span>Độ khó: {rev.difficultyRating}/5</span>
                        <span>Khối lượng bài: {rev.workloadRating}/5</span>
                      </div>
                      <button className="flex items-center gap-1 hover:text-[#005da7] cursor-pointer">
                        <ThumbsUp className="w-3.5 h-3.5" /> Hữu ích ({rev.upvotes})
                      </button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={`Đánh giá môn học ${course.code}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => setShowReviewModal(false)}>Gửi đánh giá</Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1">Mức độ hài lòng chung (1-5 sao):</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setReviewRating(s)}
                  className={`p-2 rounded-lg border text-xs font-bold cursor-pointer ${
                    reviewRating >= s ? 'bg-amber-50 border-amber-400 text-amber-700' : 'border-slate-200 text-slate-400'
                  }`}
                >
                  ★ {s} Sao
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Nhận xét chi tiết & kinh nghiệm học"
            placeholder="Chia sẻ cách ôn thi Practical Exam, thầy cô hướng dẫn, đồ án cuối kỳ..."
            rows={4}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
