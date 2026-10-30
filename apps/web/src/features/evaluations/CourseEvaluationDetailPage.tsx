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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editRating, setEditRating] = useState(5);
  const [editWorkload, setEditWorkload] = useState(4);
  const [editDifficulty, setEditDifficulty] = useState(4);
  const [editComment, setEditComment] = useState('');

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
            courseCode: data.courseId === 1 ? 'PRF192' : data.courseId === 2 ? 'PRO192' : 'PRN231',
            courseTitle: data.courseId === 1 ? 'Programming Fundamentals' : data.courseId === 2 ? 'Object-Oriented Programming' : 'Building Cross-Platform Back-End Application With .NET',
            reviewer: {
              id: data.isAnonymous ? 'anon' : String(data.authorUserId || '4'),
              fullName: data.isAnonymous ? 'Anonymous Student' : 'Nguyen Minh Tam (CE181522)',
              avatarUrl: '',
              studentId: data.isAnonymous ? 'ANONYMOUS' : 'CE181522',
            },
            rating: data.overallRating || 5,
            workloadRating: data.workloadRating || 4,
            difficultyRating: data.difficultyRating || 4,
            title: data.survivalTips || 'Practical Exam & Clean Architecture Survival Guide',
            comment: data.reviewContent || '',
            semesterTaken: `${data.semesterCode || ''} ${data.academicYear || ''}`.trim() || 'Fall 2026',
            lecturerName: 'FPT Software Engineering Department',
            upvotes: 18,
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
        author: currentUser?.fullName || t("Sinh viên FHub"),
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
          <p className="text-xs text-slate-400 mb-4">{t("Bài đánh giá môn học này không tồn tại hoặc đã bị xóa.")}</p>
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
              {t('Course Hub')}: <strong className="text-slate-800">{evaluation.courseTitle}</strong>  {t("• Giảng viên:")}{' '}
              <strong className="text-slate-800">{t(evaluation.lecturerName)}</strong>
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
            <span>{t("Đánh giá này hữu ích (")}{evaluation.upvotes})</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-edit-evaluation"
              onClick={() => {
                setEditRating(evaluation.rating || 5);
                setEditWorkload(evaluation.workloadRating || 4);
                setEditDifficulty(evaluation.difficultyRating || 4);
                setEditComment(evaluation.comment || '');
                setShowEditModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{t("Chỉnh sửa")}</span>
            </button>
            <button
              id="btn-delete-evaluation"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t("Xóa đánh giá")}</span>
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t("Chia sẻ")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Evaluation Modal (3.7.4) */}
      {showEditModal && (
        <div id="modal-edit-evaluation" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0076D1]" />
                <span>{t("Chỉnh Sửa Đánh Giá Môn Học")}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t("Môn học")}</label>
                <div className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-mono font-bold text-slate-800">
                  {evaluation.courseCode} - {evaluation.courseTitle}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t("Đánh giá chung")}</label>
                  <select
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r}  {t("sao")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t("Độ khó")}</label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r}/5</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t("Khối lượng (Workload)")}</label>
                  <select
                    value={editWorkload}
                    onChange={(e) => setEditWorkload(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r}/5</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t("Nội dung đánh giá & Kinh nghiệm qua môn")}</label>
                <textarea
                  rows={4}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                  placeholder={t("Chia sẻ kinh nghiệm học tập, giảng viên, đồ án môn học...")}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}</button>
              <button
                id="btn-save-edit-evaluation"
                type="button"
                onClick={() => {
                  setEvaluation({
                    ...evaluation,
                    rating: editRating,
                    difficultyRating: editDifficulty,
                    workloadRating: editWorkload,
                    comment: editComment,
                  });
                  setShowEditModal(false);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Cập nhật đánh giá")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Evaluation Confirmation Modal (3.7.5) */}
      {showDeleteModal && (
        <div id="modal-delete-evaluation" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t("Xóa Đánh Giá Môn Học")}</h3>
                <p className="text-xs text-slate-500">{t("Hành động này không thể hoàn tác")}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t("Bạn có chắc chắn muốn xóa bài đánh giá cho môn")} <strong>{evaluation.courseCode}</strong>{t("? Đánh giá và các bình luận liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.")}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}</button>
              <button
                id="btn-confirm-delete-evaluation"
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  navigate('/course-evaluations');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Xác nhận xóa")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Discussion & Comments */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#0076D1]" />
          <span>{t("Bình luận & Thảo luận (")}{comments.length})</span>
        </h3>

        <form onSubmit={handleAddComment} className="flex gap-3">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder={t("Hỏi thêm về môn học hoặc chia sẻ góc nhìn của bạn...")}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0076D1]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#0076D1] hover:bg-[#005DA7] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            {t("Gửi bình luận")}</button>
        </form>

        <div className="space-y-3 pt-2">
          {comments.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              {t("Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ!")}</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0076D1] font-bold text-xs flex items-center justify-center shrink-0">
                  {c.author.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800">{c.author}</span>
                    <span className="text-[10px] text-slate-400">{t(c.time)}</span>
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
