import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Trash2 } from 'lucide-react';
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

const MAX_FILES = 10;
const MAX_SINGLE_FILE_MB = 50;
const MAX_TOTAL_MB = 200;

const inferFileType = (fileName: string): 'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'CODE' => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'docx' || ext === 'doc') return 'DOCX';
  if (ext === 'pptx' || ext === 'ppt') return 'PPTX';
  if (['zip', 'rar', '7z'].includes(ext || '')) return 'ZIP';
  if (['cs', 'java', 'py', 'sql', 'cpp', 'c', 'json', 'md', 'txt', 'xlsx', 'xls'].includes(ext || '')) return 'CODE';
  return 'PDF';
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const UploadStudyMaterialModal: React.FC<UploadStudyMaterialModalProps> = ({
  isOpen,
  onClose,
  onUploaded,
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseNodeListItem | undefined>(undefined);

  const [fileType, setFileType] = useState<'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'CODE'>('PDF');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalSizeBytes = selectedFiles.reduce((sum, f) => sum + f.size, 0);
  const totalSizeMb = Number((totalSizeBytes / (1024 * 1024)).toFixed(2));

  const addFiles = (incoming: FileList | File[]) => {
    const incomingArray = Array.from(incoming);
    if (incomingArray.length === 0) return;

    const oversized = incomingArray.find((f) => f.size > MAX_SINGLE_FILE_MB * 1024 * 1024);
    if (oversized) {
      setErrorMessage(
        t(
          'materialUploadModal.errorOver50Mb',
          `File "${oversized.name}" vượt quá 50MB. Vui lòng nén file hoặc chia sẻ qua liên kết ngoài.`
        )
      );
      return;
    }

    const emptyFile = incomingArray.find((f) => f.size === 0);
    if (emptyFile) {
      setErrorMessage(t('materialUploadModal.errorEmptyFile', `File "${emptyFile.name}" bị rỗng (0 bytes).`));
      return;
    }

    const merged = [...selectedFiles];
    for (const file of incomingArray) {
      const exists = merged.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
      );
      if (!exists) {
        merged.push(file);
      }
    }

    if (merged.length > MAX_FILES) {
      setErrorMessage(
        t('materialUploadModal.errorMaxFiles', `Chỉ có thể tải lên tối đa ${MAX_FILES} file cùng lúc.`)
      );
      return;
    }

    const mergedTotalBytes = merged.reduce((sum, f) => sum + f.size, 0);
    if (mergedTotalBytes > MAX_TOTAL_MB * 1024 * 1024) {
      setErrorMessage(
        t('materialUploadModal.errorMaxTotalSize', `Tổng dung lượng các file không được vượt quá ${MAX_TOTAL_MB}MB.`)
      );
      return;
    }

    setErrorMessage(null);
    setSelectedFiles(merged);

    if (!title && merged.length > 0) {
      setTitle(merged[0].name.replace(/\.[^/.]+$/, ''));
    }
    if (merged.length > 0) {
      setFileType(inferFileType(merged[0].name));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removeFileAt = (index: number) => {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length > 0) {
        setFileType(inferFileType(next[0].name));
      }
      return next;
    });
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setErrorMessage(t('materialUploadModal.errorNoFile', 'Vui lòng chọn ít nhất một tập tin tài liệu từ thiết bị.'));
      return;
    }
    if (!title.trim()) {
      setErrorMessage(t('materialUploadModal.errorNoTitle', 'Vui lòng nhập tiêu đề mô tả tài liệu.'));
      return;
    }
    if (totalSizeMb > MAX_TOTAL_MB) {
      setErrorMessage(t('materialUploadModal.errorMaxTotalSize', `Tổng dung lượng không được vượt quá ${MAX_TOTAL_MB}MB.`));
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const courseIdNum = Number(selectedCourse?.courseNodeId ?? selectedCourse?.id);
      const effectiveCourseId = courseCode && courseIdNum && courseIdNum > 0 ? courseIdNum : null;

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      if (effectiveCourseId !== null) {
        formData.append('courseId', String(effectiveCourseId));
      }
      formData.append('title', title.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const created = await studyMaterialApi.uploadFile(formData);

      const mappedFiles = (created.files || []).map((f) => ({
        id: String(f.studyMaterialFileId),
        fileName: f.fileName,
        fileSizeBytes: f.fileSizeBytes,
        fileSizeMb: Number((f.fileSizeBytes / (1024 * 1024)).toFixed(2)),
        mimeType: f.mimeType,
        displayOrder: f.displayOrder,
      }));

      const resolvedCourseCode = created.courseId
        ? (courseCode || selectedCourse?.courseCode || selectedCourse?.code || `COURSE-${created.courseId}`)
        : 'Other';

      const newMat: StudyMaterial = {
        id: String(created.studyMaterialId),
        title: created.title,
        description: created.description || description.trim() || t('Tài liệu học tập FHub'),
        courseId: created.courseId ?? null,
        courseCode: resolvedCourseCode,
        fileType: fileType,
        fileSizeMb: created.fileSizeBytes ? Number((created.fileSizeBytes / (1024 * 1024)).toFixed(2)) : totalSizeMb,
        downloadUrl: `/api/content/study-materials/${created.studyMaterialId}/download`,
        downloadsCount: created.downloadCount || 0,
        author: {
          id: currentUser?.id || String(created.uploaderUserId),
          fullName: currentUser?.fullName || t('Sinh viên FHub'),
          avatarUrl: currentUser?.avatarUrl,
        },
        semesterUploaded: '',
        files: mappedFiles,
        createdAt: created.createdAt || new Date().toISOString(),
      };

      onUploaded(newMat);
      setTitle('');
      setDescription('');
      setCourseCode('');
      setSelectedCourse(undefined);
      setSelectedFiles([]);
      setErrorMessage(null);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('Có lỗi xảy ra khi tải lên tài liệu.');
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
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {selectedFiles.length > 1
              ? `${t('materialUploadModal.uploadMultiBtn', 'Tải lên')} ${selectedFiles.length} file (+20 Karma)`
              : t('materialUploadModal.uploadBtn', 'Tải lên (+20 Karma)')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{t(errorMessage)}</span>
          </div>
        )}

        {/* Drag Drop Area (Multi-file) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`p-5 border-2 border-dashed rounded-2xl text-center space-y-2 relative transition-colors ${
            isDragging
              ? 'border-[#0076D1] bg-blue-50/60'
              : 'border-slate-300 bg-slate-50 hover:border-[#0076D1]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.zip,.rar,.7z,.cs,.java,.py,.cpp,.c,.sql,.json,.md,.txt"
          />
          <UploadCloud className="w-9 h-9 mx-auto text-[#0076D1]" />
          <div>
            <p className="font-bold text-xs text-slate-800">
              {t('materialUploadModal.dragDropMultiText', 'Kéo thả một hoặc nhiều file vào đây, hoặc')}{' '}
              <span className="text-[#0076D1] underline">
                {t('materialUploadModal.chooseFilesText', 'chọn file từ máy tính')}
              </span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {t(
                'materialUploadModal.supportedMultiFormats',
                `Hỗ trợ PDF, Word, PowerPoint, Excel, ZIP, RAR, Source Code (Tối đa ${MAX_FILES} file, mỗi file ≤ ${MAX_SINGLE_FILE_MB}MB)`
              )}
            </p>
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {t('materialUploadModal.filesSelectedCount', 'Đã chọn')} {selectedFiles.length}/{MAX_FILES} file ({totalSizeMb} MB)
              </span>
              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('common.clearAll', 'Xóa tất cả')}
              </button>
            </div>
            <ul className="max-h-40 overflow-y-auto divide-y divide-slate-100">
              {selectedFiles.map((file, idx) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="px-3.5 py-2 flex items-center justify-between gap-2 text-xs hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-[#0076D1] shrink-0" />
                    <span className="font-medium text-slate-800 truncate" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFileAt(idx)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    title={t('common.remove', 'Gỡ bỏ')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Input
          label={t('materialUploadModal.titleLabel', 'Tiêu đề tài liệu *')}
          placeholder={t('materialUploadModal.titlePlaceholder', 'Ví dụ: PRN211_Complete_Summary_Cheatsheet')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CourseSelect
            label={t('materialUploadModal.courseLabelOptional', 'Môn học liên quan (Không bắt buộc)')}
            value={courseCode}
            onChange={(code, course) => {
              setCourseCode(code);
              setSelectedCourse(course);
            }}
            allowEmpty={true}
            emptyLabel="-- Khác (Other) --"
            required={false}
            helperText={t('materialUploadModal.courseOptionalHint', 'Để trống nếu tài liệu không thuộc môn học cụ thể (sẽ hiển thị dạng Other).')}
          />
          <Select
            label={t('materialUploadModal.formatLabel', 'Loại file chính (Format)')}
            value={fileType}
            onChange={(e) => setFileType(e.target.value as any)}
            options={[
              { value: 'PDF', label: t('PDF Document (.pdf)') },
              { value: 'DOCX', label: t('Word Document (.docx, .doc)') },
              { value: 'ZIP', label: t('Archive / Compressed (.zip, .rar, .7z)') },
              { value: 'PPTX', label: t('Slide Presentation (.pptx, .ppt)') },
              { value: 'CODE', label: t('Source Code File (.cs, .java, .py, .sql, .cpp, .c)') },
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
