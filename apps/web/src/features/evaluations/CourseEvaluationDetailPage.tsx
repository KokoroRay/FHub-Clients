import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  BookOpen,
  Calendar,
  User,
  GraduationCap,
  Share2,
  Trash2,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courseReviewApi } from '../../services/api/contentApi';

export const CourseEvaluationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [evaluation, setEvaluation] = useState({
    id: id || 'eval-1',
    courseCode: 'PRN211',
    courseTitle: 'Basic Cross-Platform App Programming',
    reviewer: {
      id: 'u-1',
      fullName: 'Le Quang Huy',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      studentId: 'SE172091',
    },
    rating: 5,
    workloadRating: 4,
    difficultyRating: 3,
    title: 'Kinh nghiệm đạt điểm 9+ môn PRN211 kỳ Spring 2025',
    comment:
      'PRN211 là môn học nền tảng cực tốt về C# và hệ sinh thái .NET. Thầy Bình dạy rất chi tiết về async/await, Entity Framework Core và mô hình Clean Architecture. Chú ý làm kỹ các Lab WPF và nộp assignment đúng hạn thì việc qua môn và đạt điểm 8+ hoàn toàn trong tầm tay.\n\nĐề thi Practical Exam (PE) thường gồm 2 phần: xây dựng cơ sở dữ liệu với Code First / Database First, sau đó làm giao diện WinForms hoặc WPF để thực hiện các thao tác CRUD và tìm kiếm dữ liệu. Cần lưu ý việc bind dữ liệu vào DataGridView và bắt ngoại lệ Validation.',
    semesterTaken: 'Spring 2025',
    lecturerName: 'Thầy Bùi Đình Bình',
    upvotes: 42,
    createdAt: '2025-02-14T08:00:00Z',
  });

  useEffect(() => {
    if (!id) return;
    const numericId = Number(id);
    if (isNaN(numericId)) return;

    let isMounted = true;
    const fetchReview = async () => {
      try {
        const data = await courseReviewApi.getReviewById(numericId);
        if (isMounted && data) {
          setEvaluation({
            id: String(data.courseReviewId),
            courseCode: `CRS-${data.courseId}`,
            courseTitle: `Course #${data.courseId}`,
            reviewer: {
              id: data.isAnonymous ? 'anon' : String(data.authorUserId || 'u-1'),
              fullName: data.isAnonymous ? 'Sinh viên ẩn danh' : `Sinh viên #${data.authorUserId || 1}`,
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              studentId: data.isAnonymous ? 'ANONYMOUS' : 'SE-STUDENT',
            },
            rating: data.overallRating,
            workloadRating: data.workloadRating,
            difficultyRating: data.difficultyRating,
            title: data.survivalTips || `Đánh giá môn học #${data.courseId}`,
            comment: data.reviewContent || '',
            semesterTaken: `${data.semesterCode} ${data.academicYear}`,
            lecturerName: 'Bộ môn FPTU',
            upvotes: 0,
            createdAt: data.createdAt,
          });
        }
      } catch (err) {
        console.warn('Backend course review detail unavailable, keeping fallback mock data', err);
      }
    };
    fetchReview();
    return () => { isMounted = false; };
  }, [id]);

  const [isUpvoted, setIsUpvoted] = useState(false);
  const [comments, setComments] = useState([
    {
      id: 'c-1',
      author: 'Nguyen Hoang Minh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      content: 'Cảm ơn bạn đã chia sẻ, đề thi PE có yêu cầu viết Unit Test không bạn ơi?',
      time: '2 ngày trước',
    },
    {
      id: 'c-2',
      author: 'Le Quang Huy',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      content: 'Thường thì PE chỉ yêu cầu CRUD kết nối SQL Server hoàn chỉnh thôi bạn nhé, Unit Test nằm ở assignment!',
      time: '1 ngày trước',
    },
  ]);
  const [commentInput, setCommentInput] = useState('');

  const handleVote = () => {
    setIsUpvoted(!isUpvoted);
    setEvaluation((prev) => ({
      ...prev,
      upvotes: prev.upvotes + (isUpvoted ? -1 : 1),
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments([
      ...comments,
      {
        id: `c-${Date.now()}`,
        author: currentUser?.fullName || 'Sinh viên FHub',
        avatar: currentUser?.avatarUrl || '',
        content: commentInput.trim(),
        time: 'Vừa xong',
      },
    ]);
    setCommentInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/course-evaluations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đánh giá
        </Link>
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link
                to={`/courses/${evaluation.courseCode}`}
                className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 text-[#0076D1] border border-blue-100"
              >
                [{evaluation.courseCode}]
              </Link>
              <h1 className="text-xl font-bold text-slate-900">{evaluation.title}</h1>
            </div>
            <p className="text-xs text-slate-500">
              Môn học: <strong className="text-slate-800">{evaluation.courseTitle}</strong> • Giảng viên:{' '}
              <strong className="text-slate-800">{evaluation.lecturerName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= evaluation.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-800">{evaluation.rating}.0 / 5.0</span>
          </div>
        </div>

        {/* Reviewer Meta Bar */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <img
              src={evaluation.reviewer.avatarUrl}
              alt={evaluation.reviewer.fullName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div>
              <span className="font-bold text-slate-800 block">{evaluation.reviewer.fullName}</span>
              <span className="text-[10px] text-slate-400 font-mono">{evaluation.reviewer.studentId}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-500 text-[11px]">
            <span>Kỳ học: <strong className="text-slate-700">{evaluation.semesterTaken}</strong></span>
            <span>Khối lượng: <strong className="text-slate-700">{evaluation.workloadRating}/5</strong></span>
            <span>Độ khó PE: <strong className="text-slate-700">{evaluation.difficultyRating}/5</strong></span>
          </div>
        </div>

        {/* Content Body */}
        <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
          {evaluation.comment}
        </div>

        {/* Helpful Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleVote}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isUpvoted
                ? 'bg-blue-50 border-blue-300 text-[#0076D1]'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Đánh giá này hữu ích ({evaluation.upvotes})</span>
          </button>

          <button
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* Discussion & Comments */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#0076D1]" />
          <span>Bình luận & Thảo luận ({comments.length})</span>
        </h3>

        <form onSubmit={handleAddComment} className="flex gap-3">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Hỏi thêm về môn học hoặc chia sẻ góc nhìn của bạn..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0076D1]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#0076D1] hover:bg-[#005DA7] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Gửi bình luận
          </button>
        </form>

        <div className="space-y-3 pt-2">
          {comments.map((c) => (
            <div key={c.id} className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0076D1] font-bold text-xs flex items-center justify-center shrink-0">
                {c.author.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-800">{c.author}</span>
                  <span className="text-[10px] text-slate-400">{c.time}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
