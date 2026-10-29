import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { CourseSelect } from '../../components/common/CourseSelect';
import { CourseNodeListItem } from '../../services/api/adminApi';
import { studyMaterialApi } from '../../services/api/contentApi';
import { StudyMaterial } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseNodeListItem | undefined>(undefined);
  
  const [fileType, setFileType] = useState<'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'CODE'>('PDF');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSizeMb, setFileSizeMb] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const mb = Number((file.size / (1024 * 1024)).toFixed(2));
      if (mb > 50) {
        setErrorMessage(t('materialUploadModal.errorOver50Mb', 'Dung lượng file vượt quá 50MB. Vui lòng nén file hoặc chia sẻ qua liên kết ngoài.'));
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);
      setSelectedFileName(file.name);
      setFileSizeMb(mb);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setFileType('PDF');
      else if (ext === 'docx' || ext === 'doc') setFileType('DOCX');
      else if (ext === 'pptx' || ext === 'ppt') setFileType('PPTX');
      else if (['zip', 'rar', '7z'].includes(ext || '')) setFileType('ZIP');
      else if (['cs', 'java', 'py', 'sql', 'cpp', 'c', 'json', 'md', 'txt'].includes(ext || '')) setFileType('CODE');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage(t('materialUploadModal.errorNoFile', 'Vui lòng chọn một tập tin tài liệu từ thiết bị.'));
      return;
    }
    if (!title.trim()) {
      setErrorMessage(t('materialUploadModal.errorNoTitle', 'Vui lòng nhập tiêu đề mô tả tài liệu.'));
      return;
    }
    if (fileSizeMb > 50) {
      setErrorMessage('Dung lượng file không được vượt quá 50MB.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const courseIdNum = Number(selectedCourse?.courseNodeId ?? selectedCourse?.id);
      const effectiveCourseId = (courseIdNum && courseIdNum > 0) ? courseIdNum : 1;

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('courseId', String(effectiveCourseId));
      formData.append('title', title.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const created = await studyMaterialApi.uploadFile(formData);

      const newMat: StudyMaterial = {
        id: String(created.studyMaterialId),
        title: created.title,
        description: created.description || description.trim() || 'Tài liệu học tập FHub',
        courseCode: courseCode || selectedCourse?.courseCode || selectedCourse?.code || `COURSE-${created.courseId}`,
        fileType: fileType,
        fileSizeMb: created.fileSizeBytes ? Number((created.fileSizeBytes / (1024 * 1024)).toFixed(1)) : fileSizeMb,
        downloadUrl: `/api/content/study-materials/${created.studyMaterialId}/download`,
        downloadsCount: created.downloadCount || 0,
        author: {
          id: currentUser?.id || String(created.uploaderUserId),
          fullName: currentUser?.fullName || 'Sinh viên FHub',
          avatarUrl: currentUser?.avatarUrl,
        },
        semesterUploaded: '',
        createdAt: created.createdAt || new Date().toISOString(),
      };

      onUploaded(newMat);
      setTitle('');
      setDescription('');
      setSelectedFileName(null);
      setSelectedFile(null);
      setErrorMessage(null);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải lên tài liệu.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('materialUploadModal.uploadTitle', 'Upload Study Material (Tải lên tài liệu học tập)')}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>{t('common.cancel', 'Hủy')}</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>{t('materialUploadModal.uploadBtn', 'Tải lên (+20 Karma)')}</Button>
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
            accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.zip,.rar,.7z,.cs,.java,.py,.cpp,.c,.sql,.json,.md,.txt"
          />
          <UploadCloud className="w-9 h-9 mx-auto text-[#0076D1]" />
          {selectedFileName ? (
            <div className="space-y-1">
              <span className="font-bold text-xs text-emerald-600 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {t('materialUploadModal.fileSelected', 'Đã chọn:')} {selectedFileName}
              </span>
              <span className="text-[11px] text-slate-400">{t('materialUploadModal.fileSize', 'Dung lượng:')} {fileSizeMb} MB</span>
            </div>
          ) : (
            <div>
              <p className="font-bold text-xs text-slate-800">
                {t('materialUploadModal.dragDropText', 'Kéo thả file vào đây hoặc')} <span className="text-[#0076D1] underline">{t('materialUploadModal.chooseFileText', 'chọn file từ máy tính')}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{t('materialUploadModal.supportedFormats', 'Hỗ trợ PDF, Word, PowerPoint, Excel, ZIP, RAR, Source Code (Tối đa 50MB)')}</p>
            </div>
          )}
        </div>

        <Input
          label={t('materialUploadModal.titleLabel', 'Tiêu đề tài liệu *')}
          placeholder={t('materialUploadModal.titlePlaceholder', 'Ví dụ: PRN211_Complete_Summary_Cheatsheet.pdf')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CourseSelect
            label={t('materialUploadModal.courseLabel', 'Môn học liên quan *')}
            value={courseCode}
            onChange={(code, course) => {
              setCourseCode(code);
              setSelectedCourse(course);
            }}
            required
          />
          <Select
            label={t('materialUploadModal.formatLabel', 'Loại file (Format) *')}
            value={fileType}
            onChange={(e) => setFileType(e.target.value as any)}
            options={[
              { value: 'PDF', label: 'PDF Document (.pdf)' },
              { value: 'DOCX', label: 'Word Document (.docx, .doc)' },
              { value: 'ZIP', label: 'Archive / Compressed (.zip, .rar, .7z)' },
              { value: 'PPTX', label: 'Slide Presentation (.pptx, .ppt)' },
              { value: 'CODE', label: 'Source Code File (.cs, .java, .py, .sql, .cpp, .c)' },
            ]}
          />
        </div>

        <Textarea
          label={t('materialUploadModal.descLabel', 'Mô tả nội dung & Hướng dẫn sử dụng')}
          placeholder={t('materialUploadModal.descPlaceholder', 'Tài liệu này bao gồm những kiến thức nào, dùng cho bài thi PE hay Assignment...')}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
