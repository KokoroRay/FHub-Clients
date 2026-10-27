import React, { useState } from 'react';
import { Link2, Globe, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { CourseSelect } from '../../components/common/CourseSelect';
import { CourseNodeListItem } from '../../services/api/adminApi';
import { studyMaterialApi } from '../../services/api/contentApi';
import { StudyMaterial } from '../../types';
import { useAuth } from '../../context/AuthContext';

export interface AddExternalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (material: StudyMaterial) => void;
}

export const AddExternalLinkModal: React.FC<AddExternalLinkModalProps> = ({
  isOpen,
  onClose,
  onAdded,
}) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseNodeListItem | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề tài liệu.');
      return;
    }
    const cleanUrl = linkUrl.trim();
    if (!cleanUrl) {
      setErrorMessage('Vui lòng nhập liên kết URL tài liệu.');
      return;
    }
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setErrorMessage('Đường dẫn URL không hợp lệ. Vui lòng nhập URL bắt đầu bằng https:// hoặc http://');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const courseIdNum = Number(selectedCourse?.courseNodeId ?? selectedCourse?.id);
      const effectiveCourseId = (courseIdNum && courseIdNum > 0) ? courseIdNum : 1;

      const created = await studyMaterialApi.addExternalLink({
        courseId: effectiveCourseId,
        title: title.trim(),
        externalUrl: cleanUrl,
        description: description.trim() || undefined,
      });

      const newMat: StudyMaterial = {
        id: String(created.studyMaterialId),
        title: created.title,
        description: created.description || cleanUrl,
        courseCode: courseCode || selectedCourse?.courseCode || selectedCourse?.code || `COURSE-${created.courseId}`,
        fileType: 'CODE',
        fileSizeMb: 0,
        downloadUrl: cleanUrl,
        downloadsCount: 0,
        author: {
          id: currentUser?.id || String(created.uploaderUserId),
          fullName: currentUser?.fullName || 'Sinh viên FHub',
          avatarUrl: currentUser?.avatarUrl,
        },
        semesterUploaded: '',
        createdAt: created.createdAt || new Date().toISOString(),
      };

      onAdded(newMat);
      setTitle('');
      setLinkUrl('');
      setDescription('');
      setErrorMessage(null);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi thêm liên kết tài liệu.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add External Material Link (Thêm liên kết tài liệu ngoài)"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Thêm liên kết
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
        <Input
          label="Tiêu đề tài liệu *"
          placeholder="Ví dụ: DBI202 SQL Server Sample Database Script"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Đường dẫn URL ngoài (Google Drive, GitHub, Notion, OneDrive...) *"
          placeholder="https://github.com/example/sample-db"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
          required
        />

        <CourseSelect
          label="Môn học liên quan *"
          value={courseCode}
          onChange={(code, course) => {
            setCourseCode(code);
            setSelectedCourse(course);
          }}
          required
        />

        <Textarea
          label="Mô tả & Hướng dẫn truy cập"
          placeholder="Mô tả chi tiết tài liệu, lưu ý khi truy cập..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
