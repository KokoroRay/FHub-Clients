import React, { useState, useEffect } from 'react';
import { Star, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { courseNodesApi } from '../../services/api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { CourseReview } from '../../types';
import { courseReviewApi } from '../../services/api/contentApi';

export interface CreateCourseEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (evaluation: CourseReview) => void;
  defaultCourseCode?: string;
}

export const CreateCourseEvaluationModal: React.FC<CreateCourseEvaluationModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  defaultCourseCode = '',
}) => {
  const { currentUser } = useAuth();
  const [courseCode, setCourseCode] = useState(defaultCourseCode);
  const [semesterTaken, setSemesterTaken] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [rating, setRating] = useState(5);
  const [workloadRating, setWorkloadRating] = useState(3);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courses, setCourses] = useState<Array<{ code: string; title: string }>>([]);

  useEffect(() => {
    let isMounted = true;
    const loadCourses = async () => {
      try {
        const res = await courseNodesApi.getCourseNodes();
        const items = (res as any)?.items || res || [];
        if (isMounted && Array.isArray(items) && items.length > 0) {
          const mapped = items.map((c: any) => ({
            code: c.code || c.courseCode,
            title: c.name || c.title || c.code,
          }));
          setCourses(mapped);
          if (!courseCode && mapped[0]) {
            setCourseCode(mapped[0].code);
          }
        }
      } catch (err) {
        console.warn('Failed to load courses in evaluation modal:', err);
      }
    };
    loadCourses();
    return () => { isMounted = false; };
  }, [courseCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 20) {
      setErrorMessage('Nội dung nhận xét đánh giá môn học cần tối thiểu 20 ký tự để cung cấp thông tin hữu ích cho các bạn sinh viên khác.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const courseNum = Number(courseCode.replace(/\D/g, '')) || 1;
      const parts = semesterTaken.trim().split(' ');
      const sem = parts[0]?.toUpperCase() || 'FA';
      const year = Number(parts[1]) || 2025;

      const res = await courseReviewApi.createReview({
        courseId: courseNum,
        semesterCode: sem,
        academicYear: year,
        overallRating: rating,
        difficultyRating,
        workloadRating,
        reviewContent: comment.trim(),
        survivalTips: lecturerName.trim() ? `Giảng viên: ${lecturerName.trim()}` : undefined,
      });

      const newReview: CourseReview = {
        id: String(res.courseReviewId),
        courseCode,
        reviewer: {
          id: currentUser?.id || 'u-self',
          fullName: currentUser?.fullName || 'Sinh viên FHub',
          avatarUrl: currentUser?.avatarUrl,
        },
        rating: res.overallRating,
        workloadRating: res.workloadRating,
        difficultyRating: res.difficultyRating,
        comment: res.reviewContent || comment.trim(),
        semesterTaken: `${res.semesterCode} ${res.academicYear}`,
        lecturerName: lecturerName.trim() || undefined,
        upvotes: 1,
        createdAt: res.createdAt || new Date().toISOString(),
      };

      onCreated(newReview);
      setComment('');
      setLecturerName('');
      onClose();
    } catch (err: any) {
      console.warn('API error creating course review, saving locally:', err);
      const fallbackReview: CourseReview = {
        id: `rev-${Date.now()}`,
        courseCode,
        reviewer: {
          id: currentUser?.id || 'u-self',
          fullName: currentUser?.fullName || 'Sinh viên FHub',
          avatarUrl: currentUser?.avatarUrl,
        },
        rating,
        workloadRating,
        difficultyRating,
        comment: comment.trim(),
        semesterTaken,
        lecturerName: lecturerName.trim() || undefined,
        upvotes: 1,
        createdAt: new Date().toISOString(),
      };
      onCreated(fallbackReview);
      setComment('');
      setLecturerName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Viết đánh giá môn học (Course Evaluation)"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Gửi đánh giá
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Môn học đánh giá *"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            options={courses.map((c) => ({
              value: c.code,
              label: `${c.code} - ${c.title}`,
            }))}
          />
          <Input
            label="Kỳ học đã học *"
            value={semesterTaken}
            onChange={(e) => setSemesterTaken(e.target.value)}
            placeholder="Ví dụ: Spring 2025, Fall 2024"
            required
          />
        </div>

        <Input
          label="Tên giảng viên đứng lớp (Không bắt buộc)"
          placeholder="Ví dụ: Thầy Bùi Đình Bình, Cô Nguyễn Thị Lan..."
          value={lecturerName}
          onChange={(e) => setLecturerName(e.target.value)}
        />

        {/* Rating Bars */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Đánh giá chung (Overall Rating): {rating}/5</span>
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 cursor-pointer ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    onClick={() => setRating(s)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-xs">
            <div>
              <span className="font-semibold text-slate-600 block mb-1">
                Khối lượng bài tập (Workload): {workloadRating}/5
              </span>
              <input
                type="range"
                min="1"
                max="5"
                value={workloadRating}
                onChange={(e) => setWorkloadRating(Number(e.target.value))}
                className="w-full accent-[#0076D1] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">1: Rất nhẹ • 5: Rất nặng</span>
            </div>

            <div>
              <span className="font-semibold text-slate-600 block mb-1">
                Độ khó thi Practical Exam: {difficultyRating}/5
              </span>
              <input
                type="range"
                min="1"
                max="5"
                value={difficultyRating}
                onChange={(e) => setDifficultyRating(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">1: Dễ qua môn • 5: Khó & gắt</span>
            </div>
          </div>
        </div>

        <Textarea
          label="Nội dung đánh giá & Kinh nghiệm học tập thực tế *"
          placeholder="Chia sẻ về cấu trúc môn, độ khó các Assignment, lời khuyên ôn thi Practical/PE, tài liệu nên chuẩn bị..."
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />

        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 text-[#0076D1] shrink-0" />
          <span>
            Đánh giá của bạn sẽ giúp hàng ngàn sinh viên các khóa sau định hướng kế hoạch học tập tốt hơn.
          </span>
        </div>
      </form>
    </Modal>
  );
};
