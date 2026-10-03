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
  Building,
  GraduationCap,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { mockCourses, mockQuestions, mockMaterials, mockWorkflows, mockCourseReviews, mockCampuses } from '../../services/mockData';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';

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
    { id: 'overview', label: 'Tổng quan & Đề cương', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'discussions', label: 'Hỏi đáp & Thảo luận', count: courseQuestions.length, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'materials', label: 'Tài liệu học tập', count: courseMaterials.length, icon: <Download className="w-4 h-4" /> },
    { id: 'workflows', label: 'Workflows thực hành', count: courseWorkflows.length, icon: <Workflow className="w-4 h-4" /> },
    { id: 'reviews', label: 'Đánh giá môn học', count: courseReviews.length, icon: <Star className="w-4 h-4" /> },
  ];

  const campusOfferings = [
    { campus: 'FU-HL (Hà Nội)', code: 'HL', lecturer: 'TS. Nguyễn Hoàng Nam', syllabusVer: 'v2025.1', semester: 'Spring/Summer/Fall', status: 'Active' },
    { campus: 'FU-HCM (TP.HCM)', code: 'HCM', lecturer: 'ThS. Trần Quốc Bảo', syllabusVer: 'v2025.1', semester: 'Spring/Summer/Fall', status: 'Active' },
    { campus: 'FU-DN (Đà Nẵng)', code: 'DN', lecturer: 'TS. Lê Đức Thắng', syllabusVer: 'v2025.1', semester: 'Spring/Fall', status: 'Active' },
    { campus: 'FU-CT (Cần Thơ)', code: 'CT', lecturer: 'ThS. Võ Minh Trí', syllabusVer: 'v2024.3', semester: 'Spring/Fall', status: 'Active' },
    { campus: 'FU-QN (Quy Nhơn)', code: 'QN', lecturer: 'ThS. Đặng Hải Đăng', syllabusVer: 'v2024.3', semester: 'Spring/Fall', status: 'Active' },
  ];

  const topicsBreakdown = [
    { id: 1, title: 'C# 12 & .NET 8 Advanced Language Features', desc: 'Record types, pattern matching, async streams, memory management & span.' },
    { id: 2, title: 'Entity Framework Core 8 & SQL Server Integration', desc: 'DbContext pooling, migrations, Fluent API, lazy/eager loading, query optimization.' },
    { id: 3, title: 'Cross-Platform UI Architecture (WPF / .NET MAUI)', desc: 'MVVM design pattern, XAML bindings, commands, converters, dependency injection in client apps.' },
    { id: 4, title: 'Clean Architecture, Repository Pattern & Unit of Work', desc: 'Domain-Driven Design basics, CQRS pattern, MediatR, unit testing and mock frameworks.' },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại Course Hub
      </Link>

      {/* Hero Course Header (Figma Frame 3: Course Hub Details) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-black text-blue-400 tracking-tight">{course.code}</span>
              <Badge variant="primary" size="sm" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                {course.majorCode} Department
              </Badge>
              <Badge variant="neutral" size="sm" className="bg-white/10 text-white border-0 font-medium">
                Học kỳ {course.semester}
              </Badge>
              <Badge variant="neutral" size="sm" className="bg-white/10 text-white border-0 font-medium">
                {course.credits} Tín chỉ
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{course.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant={isFollowed ? 'secondary' : 'primary'}
              onClick={() => setIsFollowed(!isFollowed)}
              leftIcon={isFollowed ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              className={isFollowed ? 'bg-white text-blue-700 hover:bg-slate-100' : ''}
            >
              {isFollowed ? 'Đã theo dõi môn' : 'Theo dõi môn học'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(true)}
              className="border-white/20 text-white hover:bg-white/10"
              leftIcon={<Star className="w-4 h-4 text-amber-400" />}
            >
              Đánh giá
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 p-2.5">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Prerequisites & Quick Stats Row */}
        <div className="pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Môn tiên quyết:</span>
            {course.prerequisites?.map((pre) => (
              <Link key={pre} to={`/courses/${pre}`} className="font-bold text-blue-400 hover:underline bg-white/10 px-2 py-0.5 rounded-md">
                {pre}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" /> {course.averageRating} / 5.0 (240 đánh giá)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-4 h-4 text-blue-400" /> {course.followerCount.toLocaleString()} Sinh viên theo dõi
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
                    <span>Mục tiêu & Chuẩn đầu ra môn học (CLOs)</span>
                  </h3>
                </CardHeader>
                <CardBody className="p-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Môn học <strong>{course.code}</strong> cung cấp cho sinh viên kiến thức chuyên sâu và kỹ năng thực hành lập trình ứng dụng hiện đại:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-1">
                    <li>Nắm vững cú pháp nâng cao của C# .NET và các Design Patterns thực tế trong kiến trúc phần mềm.</li>
                    <li>Sử dụng Entity Framework Core để thiết kế ORM, quản lý migrations và tối ưu hóa truy vấn dữ liệu SQL Server.</li>
                    <li>Xây dựng kiến trúc phân tầng chuẩn Clean Architecture (Domain, Application, Infrastructure, UI).</li>
                    <li>Thực hành làm việc nhóm với quy trình Git flow, testing và đóng gói ứng dụng desktop/mobile.</li>
                  </ul>
                </CardBody>
              </Card>

              {/* Topics Breakdown */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>Kiến thức trọng tâm & Topics</span>
                  </h3>
                </CardHeader>
                <CardBody className="p-5 space-y-3">
                  {topicsBreakdown.map((topic) => (
                    <div key={topic.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                          {topic.id}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{topic.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 pl-7 leading-relaxed">{topic.desc}</p>
                    </div>
                  ))}
                </CardBody>
              </Card>

              {/* 5-Campus Offering Matrix (Figma Frame 3) */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-600" />
                    <span>Phân phối môn học trên 5 Cơ sở FPT</span>
                  </h3>
                </CardHeader>
                <CardBody className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                        <th className="py-3 px-4 font-semibold">Cơ sở</th>
                        <th className="py-3 px-4 font-semibold">Giảng viên phụ trách</th>
                        <th className="py-3 px-4 font-semibold">Phiên bản Syllabus</th>
                        <th className="py-3 px-4 font-semibold">Kỳ mở lớp</th>
                        <th className="py-3 px-4 font-semibold">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {campusOfferings.map((co) => (
                        <tr key={co.code} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{co.campus}</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{co.lecturer}</td>
                          <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 font-semibold">{co.syllabusVer}</td>
                          <td className="py-3 px-4 text-slate-500">{co.semester}</td>
                          <td className="py-3 px-4">
                            <Badge variant="success" size="sm">{co.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardBody>
              </Card>
            </div>

            {/* Right Column: Assessment Scheme & Ratings Breakdown */}
            <div className="space-y-6">
              {/* Assessment Scheme */}
              <Card>
                <CardHeader>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    Cơ cấu điểm & Thi cử
                  </h4>
                </CardHeader>
                <CardBody className="p-5 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Progress Tests & Lab (30%)</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">Min 4.0 / 10</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Practical Exam - PE (30%)</span>
                    <span className="font-bold text-blue-600">Min 4.0 / 10</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Final Exam - FE (40%)</span>
                    <span className="font-bold text-purple-600">Min 4.0 / 10</span>
                  </div>
                  <div className="pt-1 flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>Điểm tổng kết qua môn:</span>
                    <span className="text-emerald-600 font-extrabold text-sm">≥ 5.0 / 10</span>
                  </div>
                </CardBody>
              </Card>

              {/* Rating Breakdown Card */}
              <Card>
                <CardHeader>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Đánh giá từ sinh viên</span>
                  </h4>
                </CardHeader>
                <CardBody className="p-5 space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Chất lượng môn học</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">4.8 / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Tính ứng dụng thực tế</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">4.9 / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98%' }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Độ nặng khối lượng học</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Vừa phải (3.5/5)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '70%' }} />
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
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Thảo luận & Hỏi đáp ({courseQuestions.length})
              </h3>
              <Link to="/discussions?action=create">
                <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Đặt câu hỏi môn này
                </Button>
              </Link>
            </div>
            {courseQuestions.map((q) => (
              <Card key={q.id} hoverable>
                <CardBody className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={q.author.avatarUrl} alt={q.author.fullName} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{q.author.fullName}</span>
                      <span className="text-[10px] text-slate-400">• {new Date(q.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {q.isSolved && <Badge variant="success" size="sm">Đã có Best Answer</Badge>}
                  </div>
                  <Link to={`/discussions/${q.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 block">
                    {q.title}
                  </Link>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{q.content}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Tài liệu & Đề thi môn {course.code}
              </h3>
              <Link to="/materials?action=upload">
                <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Đóng góp tài liệu
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseMaterials.map((m) => (
                <Card key={m.id} hoverable>
                  <CardBody className="p-4 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Badge variant="primary" size="sm">{m.fileType || 'PDF'}</Badge>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{m.title}</h4>
                      <p className="text-[11px] text-slate-500">{m.fileSizeMb ? `${m.fileSizeMb} MB` : '1.5 MB'} • {m.downloadsCount} lượt tải</p>
                    </div>
                    <Button size="sm" variant="secondary" leftIcon={<FileDown className="w-4 h-4" />}>
                      Tải về
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
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Workflows & Kiến trúc mẫu
              </h3>
              <Link to="/workflows?action=create">
                <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Chia sẻ Workflow
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseWorkflows.map((w) => (
                <Card key={w.id} hoverable>
                  <CardBody className="p-5 space-y-2">
                    <Badge variant="purple" size="sm">{w.technology}</Badge>
                    <Link to={`/workflows/${w.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 block">
                      {w.title}
                    </Link>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{w.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
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
            {courseReviews.map((r) => (
              <Card key={r.id}>
                <CardBody className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{r.reviewer?.fullName || 'Sinh viên ẩn danh'}</span>
                      <Badge variant="neutral" size="sm">{r.semesterTaken || 'FA24'}</Badge>
                    </div>
                    <div className="flex items-center text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="ml-1">{r.rating} / 5.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{r.comment}</p>
                </CardBody>
              </Card>
            ))}
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
