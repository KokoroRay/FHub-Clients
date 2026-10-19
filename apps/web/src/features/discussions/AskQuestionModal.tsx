import React, { useState } from 'react';
import { HelpCircle, EyeOff, Tag, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCourses } from '../../services/mockData';
import { QuestionPost } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';

import { questionApi } from '../../services/api/contentApi';

export interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (question: QuestionPost) => void;
}

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseCode, setCourseCode] = useState('PRN211');
  const [tagsInput, setTagsInput] = useState('dotnet, csharp, clean-architecture');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 10) {
      setErrorMessage('Tiêu đề câu hỏi quá ngắn. Vui lòng nhập ít nhất 10 ký tự để người khác dễ hiểu vấn đề.');
      return;
    }
    if (content.trim().length < 20) {
      setErrorMessage('Nội dung chi tiết câu hỏi cần tối thiểu 20 ký tự.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await questionApi.createQuestion({
        title: title.trim(),
        body: content.trim(),
        isAnonymous,
      });

      const newQuestion: QuestionPost = {
        id: String(res.questionId),
        title: res.title,
        content: res.body,
        courseCode,
        author: {
          id: String(res.authorUserId || currentUser?.id || 'anon'),
          fullName: isAnonymous ? 'Ẩn danh FPTer' : (res.authorDisplayName || currentUser?.fullName || 'Sinh viên FHub'),
          avatarUrl: isAnonymous ? undefined : currentUser?.avatarUrl,
          role: currentUser?.role || 'Student',
          karma: isAnonymous ? 0 : currentUser?.karma || 0,
          isAnonymous,
          campus: currentUser?.campus || 'FU-HL',
        },
        tags: tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
        upvotes: 1,
        downvotes: 0,
        userVote: 'UP',
        answersCount: 0,
        viewsCount: 1,
        isSolved: false,
        createdAt: res.createdAt || new Date().toISOString(),
      };

      onCreated(newQuestion);
      setTitle('');
      setContent('');
      setErrorMessage(null);
      onClose();
    } catch (err: any) {
      console.error('Failed to create question via API, falling back locally:', err);
      const fallbackQuestion: QuestionPost = {
        id: `q-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        courseCode,
        author: {
          id: currentUser?.id || 'anon',
          fullName: isAnonymous ? 'Ẩn danh FPTer' : currentUser?.fullName || 'Sinh viên FHub',
          avatarUrl: isAnonymous ? undefined : currentUser?.avatarUrl,
          role: currentUser?.role || 'Student',
          karma: isAnonymous ? 0 : currentUser?.karma || 0,
          isAnonymous,
          campus: currentUser?.campus || 'FU-HL',
        },
        tags: tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
        upvotes: 1,
        downvotes: 0,
        userVote: 'UP',
        answersCount: 0,
        viewsCount: 1,
        isSolved: false,
        createdAt: new Date().toISOString(),
      };
      onCreated(fallbackQuestion);
      setTitle('');
      setContent('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đặt câu hỏi thảo luận mới"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Đăng câu hỏi
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        <Input
          label="Tiêu đề câu hỏi (Ngắn gọn, trọng tâm vấn đề)"
          placeholder="Ví dụ: Làm sao để xử lý lỗi connection pool timeout trong EF Core?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Môn học liên quan"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            options={mockCourses.map((c) => ({
              value: c.code,
              label: `${c.code} - ${c.title}`,
            }))}
          />

          <Input
            label="Tags (Cách nhau bằng dấu phẩy)"
            placeholder="dotnet, efcore, bug, assignment"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>

        <Textarea
          label="Chi tiết câu hỏi & Code snippet (Markdown hỗ trợ)"
          placeholder="Mô tả hoàn cảnh gặp lỗi, các bước đã thử và mong muốn được hỗ trợ..."
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        {/* Anonymity Checkbox */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EyeOff className="w-4 h-4 text-purple-600" />
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Đăng ẩn danh (Anonymous Post)
              </span>
              <p className="text-[11px] text-slate-400">
                Tên và mã sinh viên của bạn sẽ được ẩn hoàn toàn đối với cộng đồng.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      </form>
    </Modal>
  );
};
