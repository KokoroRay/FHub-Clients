import React, { useState } from 'react';
import { Link2, Globe, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { mockCourses } from '../../services/mockData';
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
  const [courseCode, setCourseCode] = useState('DBI202');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      const newMat: StudyMaterial = {
        id: `mat-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || `Liên kết tài liệu ngoài: ${cleanUrl}`,
        courseCode,
        fileType: 'CODE',
        fileSizeMb: 0.1,
        downloadUrl: cleanUrl,
        downloadsCount: 0,
        author: {
          id: currentUser?.id || 'u-self',
          fullName: currentUser?.fullName || 'Sinh viên FHub',
          avatarUrl: currentUser?.avatarUrl,
        },
        semesterUploaded: 'Spring 2025',
        createdAt: new Date().toISOString(),
      };
      onAdded(newMat);
      setIsSubmitting(false);
      setTitle('');
      setLinkUrl('');
      setDescription('');
      setErrorMessage(null);
      onClose();
    }, 400);
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

        <Select
          label="Môn học liên quan *"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          options={mockCourses.map((c) => ({
            value: c.code,
            label: `${c.code} - ${c.title}`,
          }))}
        />

        <Textarea
          label="Ghi chú & Hướng dẫn truy cập"
          placeholder="Tài liệu này mở quyền xem công khai hay cần xin quyền..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
