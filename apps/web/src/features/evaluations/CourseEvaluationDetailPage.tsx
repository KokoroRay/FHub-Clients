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
import { useLanguage } from '../../context/LanguageContext';
import { courseReviewApi } from '../../services/api/contentApi';

interface ReviewDetail {
  id: string;
  courseCode: string;
  courseTitle: string;
  reviewer: {
    id: string;
    fullName: string;
    avatarUrl: string;
    studentId: string;
  };
  rating: number;
  workloadRating: number;
  difficultyRating: number;
  title: string;
  comment: string;
  semesterTaken: string;
  lecturerName: string;
  upvotes: number;
  createdAt: string;
}

interface ReviewComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
}

export const CourseEvaluationDetailPage: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [evaluation, setEvaluation] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const numericId = Number(id);
    if (isNaN(numericId)) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchReview = async () => {
      try {
        setLoading(true);
        const data = await courseReviewApi.getReviewById(numericId);
        if (isMounted && data) {
          setEvaluation({
            id: String(data.courseReviewId),
            courseCode: `CRS-${data.courseId}`,
            courseTitle: `Course #${data.courseId}`,
            reviewer: {
              id: data.isAnonymous ? 'anon' : String(data.authorUserId || ''),
              fullName: data.isAnonymous ? 'Sinh viên ẩn danh' : `Sinh viên #${data.authorUserId || ''}`,
              avatarUrl: '',
              studentId: data.isAnonymous ? 'ANONYMOUS' : 'SE-STUDENT',
            },
            rating: data.overallRating || 0,
            workloadRating: data.workloadRating || 0,
            difficultyRating: data.difficultyRating || 0,
            title: data.survivalTips || `Đánh giá môn học #${data.courseId}`,
            comment: data.reviewContent || '',
            semesterTaken: `${data.semesterCode || ''} ${data.academicYear || ''}`.trim() || 'N/A',
            lecturerName: 'Bộ môn FPTU',
            upvotes: 0,
            createdAt: data.createdAt,
          });
        }
      } catch (err) {
        console.warn('Backend course review detail unavailable:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReview();
    return () => { isMounted = false; };
  }, [id]);
  const handleVote = () => {
    setIsUpvoted(!isUpvoted);
    setEvaluation((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        upvotes: (prev.upvotes || 0) + (isUpvoted ? -1 : 1),
      };
    });
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Link
          to="/course-evaluations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('Back to Reviews')}
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center text-xs text-slate-400">
          {t('Loading...')}
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="space-y-6">
        <Link
          to="/course-evaluations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('Back to Reviews')}
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 mb-1">{t('No data found')}</h3>
          <p className="text-xs text-slate-400 mb-4">Bài đánh giá môn học này không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate('/course-evaluations')}
            className="px-4 py-2 bg-[#0076D1] hover:bg-[#005DA7] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {t('Back to Reviews')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/course-evaluations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('Back to Reviews')}
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
              {t('Course Hub')}: <strong className="text-slate-800">{evaluation.courseTitle}</strong> • Giảng viên:{' '}
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
            {evaluation.reviewer.avatarUrl ? (
              <img
                src={evaluation.reviewer.avatarUrl}
                alt={evaluation.reviewer.fullName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs ring-1 ring-slate-200">
                <User className="w-4 h-4" />
              </div>
            )}
            <div>
              <span className="font-bold text-slate-800 block">{evaluation.reviewer.fullName}</span>
              <span className="text-[10px] text-slate-400 font-mono">{evaluation.reviewer.studentId}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-500 text-[11px]">
            <span>{t('Semester')}: <strong className="text-slate-700">{evaluation.semesterTaken}</strong></span>
            <span>{t('Workload')}: <strong className="text-slate-700">{evaluation.workloadRating}/5</strong></span>
            <span>{t('Difficulty')}: <strong className="text-slate-700">{evaluation.difficultyRating}/5</strong></span>
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
          {comments.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ!
            </div>
          ) : (
            comments.map((c) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};
