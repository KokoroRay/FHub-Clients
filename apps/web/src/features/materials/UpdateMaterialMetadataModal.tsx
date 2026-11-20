import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { CourseSelect } from '../../components/common/CourseSelect';
import { CourseNodeListItem } from '../../services/api/adminApi';
import { studyMaterialApi } from '../../services/api/contentApi';
import { StudyMaterial } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export interface UpdateMaterialMetadataModalProps {
  isOpen: boolean;
  material: StudyMaterial;
  onClose: () => void;
  onUpdated: (updated: StudyMaterial) => void;
}

export const UpdateMaterialMetadataModal: React.FC<UpdateMaterialMetadataModalProps> = ({
  isOpen,
  material,
  onClose,
  onUpdated,
}) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState(material.title);
  const [description, setDescription] = useState(material.description);
  const [courseCode, setCourseCode] = useState(material.courseCode === 'Other' ? '' : material.courseCode);
  const [selectedCourse, setSelectedCourse] = useState<CourseNodeListItem | undefined>(undefined);
  const [fileType, setFileType] = useState(material.fileType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setTitle(material.title);
    setDescription(material.description);
    setCourseCode(material.courseCode === 'Other' ? '' : material.courseCode);
    setSelectedCourse(undefined);
    setFileType(material.fileType);
    setErrorMessage(null);
  }, [material, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage(t('Vui lòng nhập tiêu đề tài liệu.'));
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const courseIdNum = Number(selectedCourse?.courseNodeId ?? selectedCourse?.id);
      const effectiveCourseId = !courseCode
        ? null
        : (courseIdNum && courseIdNum > 0 ? courseIdNum : (material.courseId ?? null));

      await studyMaterialApi.updateMetadata(material.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        courseId: effectiveCourseId,
        updateCourseId: true,
      });

      onUpdated({
        ...material,
        title: title.trim(),
        description: description.trim(),
        courseId: effectiveCourseId,
        courseCode: courseCode || 'Other',
        fileType,
      });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('Có lỗi xảy ra khi cập nhật tài liệu.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('materialUpdateModal.title', 'Cập nhật thông tin tài liệu (Update Material Metadata)')}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>{t('common.cancel', 'Hủy')}</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>{t('materialUpdateModal.saveBtn', 'Lưu thay đổi')}</Button>
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

        <Input
          label={t('materialUpdateModal.titleLabel', 'Tiêu đề tài liệu *')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CourseSelect
            label={t('materialUpdateModal.courseLabelOptional', 'Môn học liên quan (Không bắt buộc)')}
            value={courseCode}
            onChange={(code, course) => {
              setCourseCode(code);
              setSelectedCourse(course);
            }}
            allowEmpty={true}
            emptyLabel="-- Khác (Other) --"
            required={false}
          />
          <Select
            label={t('materialUpdateModal.formatLabel', 'Loại file')}
            value={fileType}
            onChange={(e) => setFileType(e.target.value as any)}
            options={[
              { value: 'PDF', label: t("PDF Document (.pdf)") },
              { value: 'DOCX', label: t("Word Document (.docx)") },
              { value: 'ZIP', label: t("Archive / Source (.zip)") },
              { value: 'PPTX', label: t("Slide Presentation (.pptx)") },
              { value: 'CODE', label: t("Source Code File (.cs, .sql)") },
            ]}
          />
        </div>

        <Textarea
          label={t('materialUpdateModal.descLabel', 'Mô tả nội dung')}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
