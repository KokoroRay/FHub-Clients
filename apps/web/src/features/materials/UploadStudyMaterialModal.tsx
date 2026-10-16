import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { mockCourses } from '../../services/mockData';
import { StudyMaterial } from '../../types';
import { useAuth } from '../../context/AuthContext';

export interface UploadStudyMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (material: StudyMaterial) => void;
}

export const UploadStudyMaterialModal: React.FC<UploadStudyMaterialModalProps> = ({
  isOpen,
  onClose,
  onUploaded,
}) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('PRN211');
  const [fileType, setFileType] = useState<'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'CODE'>('PDF');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileSizeMb, setFileSizeMb] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const mb = Number((file.size / (1024 * 1024)).toFixed(2));
      if (mb > 50) {
        setErrorMessage('Dung lượng file vượt quá 50MB. Vui lòng nén file hoặc chia sẻ qua liên kết ngoài.');
        return;
      }
      setErrorMessage(null);
      setSelectedFileName(file.name);
      setFileSizeMb(mb);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileName) {
      setErrorMessage('Vui lòng chọn một tập tin tài liệu từ thiết bị.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề mô tả tài liệu.');
      return;
    }
    if (fileSizeMb > 50) {
      setErrorMessage('Dung lượng file không được vượt quá 50MB.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    setTimeout(() => {
      const newMat: StudyMaterial = {
        id: `mat-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || 'Tài liệu học tập do sinh viên FHub chia sẻ.',
        courseCode,
        fileType,
        fileSizeMb: fileSizeMb || 1.2,
        downloadUrl: '#',
        downloadsCount: 0,
        author: {
          id: currentUser?.id || 'u-self',
          fullName: currentUser?.fullName || 'Sinh viên FHub',
          avatarUrl: currentUser?.avatarUrl,
        },
        semesterUploaded: 'Spring 2025',
        createdAt: new Date().toISOString(),
      };
      onUploaded(newMat);
      setIsSubmitting(false);
      setTitle('');
      setDescription('');
      setSelectedFileName(null);
      setErrorMessage(null);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Study Material (Tải lên tài liệu học tập)"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Tải lên (+20 Karma)
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

        {/* Drag Drop Area */}
        <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2 bg-slate-50 relative hover:border-[#0076D1] transition-colors">
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            accept=".pdf,.docx,.zip,.pptx,.cs,.java,.sql"
          />
          <UploadCloud className="w-9 h-9 mx-auto text-[#0076D1]" />
          {selectedFileName ? (
            <div className="space-y-1">
              <span className="font-bold text-xs text-emerald-600 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Đã chọn: {selectedFileName}
              </span>
              <span className="text-[11px] text-slate-400">Dung lượng: {fileSizeMb} MB</span>
            </div>
          ) : (
            <div>
              <p className="font-bold text-xs text-slate-800">
                Kéo thả file vào đây hoặc <span className="text-[#0076D1] underline">chọn file từ máy tính</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ PDF, DOCX, ZIP, PPTX, Source Code (Tối đa 50MB)</p>
            </div>
          )}
        </div>

        <Input
          label="Tiêu đề tài liệu *"
          placeholder="Ví dụ: PRN211_Complete_Summary_Cheatsheet.pdf"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Môn học liên quan *"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            options={mockCourses.map((c) => ({
              value: c.code,
              label: `${c.code} - ${c.title}`,
            }))}
          />
          <Select
            label="Loại file (Format) *"
            value={fileType}
            onChange={(e) => setFileType(e.target.value as any)}
            options={[
              { value: 'PDF', label: 'PDF Document (.pdf)' },
              { value: 'DOCX', label: 'Word Document (.docx)' },
              { value: 'ZIP', label: 'Archive / Project Source (.zip)' },
              { value: 'PPTX', label: 'Slide Presentation (.pptx)' },
              { value: 'CODE', label: 'Source Code File (.cs, .sql, .java)' },
            ]}
          />
        </div>

        <Textarea
          label="Mô tả nội dung & Hướng dẫn sử dụng"
          placeholder="Tài liệu này bao gồm những kiến thức nào, dùng cho bài thi PE hay Assignment..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
