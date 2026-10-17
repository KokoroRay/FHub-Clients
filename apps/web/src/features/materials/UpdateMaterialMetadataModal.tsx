import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { mockCourses } from '../../services/mockData';
import { StudyMaterial } from '../../types';

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
      title="Cập nhật thông tin tài liệu (Update Material Metadata)"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tiêu đề tài liệu *"
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
          <Select
            label="Loại file"
            value={fileType}
            onChange={(e) => setFileType(e.target.value as any)}
            options={[
              { value: 'PDF', label: 'PDF Document (.pdf)' },
              { value: 'DOCX', label: 'Word Document (.docx)' },
              { value: 'ZIP', label: 'Archive / Source (.zip)' },
              { value: 'PPTX', label: 'Slide Presentation (.pptx)' },
              { value: 'CODE', label: 'Source Code File (.cs, .sql)' },
            ]}
          />
        </div>

        <Textarea
          label="Mô tả nội dung"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
