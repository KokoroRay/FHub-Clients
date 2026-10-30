import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { CourseSelect } from '../../components/common/CourseSelect';
import { courseNodesApi } from '../../services/api/adminApi';
import { StudyMaterial } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { filterCompactCourses } from '../../utils/courseFilter';

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
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [title, setTitle] = useState(material.title);
  const [description, setDescription] = useState(material.description);
  const [courseCode, setCourseCode] = useState(material.courseCode);
  
  const [fileType, setFileType] = useState(material.fileType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onUpdated({
        ...material,
        title: title.trim(),
        description: description.trim(),
        courseCode,
        fileType,
      });
      setIsSubmitting(false);
      onClose();
    }, 300);
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
        <Input
          label={t('materialUpdateModal.titleLabel', 'Tiêu đề tài liệu *')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CourseSelect
            label={t('materialUpdateModal.courseLabel', 'Môn học liên quan *')}
            value={courseCode}
            onChange={(code) => setCourseCode(code)}
            required
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
