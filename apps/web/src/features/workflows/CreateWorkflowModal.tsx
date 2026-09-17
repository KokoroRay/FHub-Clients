import React, { useState } from 'react';
import { Plus, Trash2, Code } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCourses } from '../../services/mockData';
import { SharedWorkflow } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';

export interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (wf: SharedWorkflow) => void;
}

export const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('PRN211');
  const [technology, setTechnology] = useState('.NET 8 / C#');
  const [tags, setTags] = useState('dotnet, efcore, crud');

  const [steps, setSteps] = useState([
    { stepNumber: 1, title: 'Bước 1: Cài đặt package', instruction: 'Chạy lệnh cài đặt NuGet packages', codeSnippet: 'dotnet add package ...', language: 'bash' },
  ]);

  const addStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        title: `Bước ${steps.length + 1}: `,
        instruction: '',
        codeSnippet: '',
        language: 'bash',
      },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 }));
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: string, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || steps.length === 0) return;

    const newWf: SharedWorkflow = {
      id: `wf-${Date.now()}`,
      title,
      description,
      courseCode,
      technology,
      steps,
      author: {
        id: currentUser?.id || 'usr-1',
        fullName: currentUser?.fullName || 'Sinh viên FHub',
        avatarUrl: currentUser?.avatarUrl,
        role: currentUser?.role || 'Student',
      },
      viewsCount: 1,
      usageCount: 0,
      tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    onCreated(newWf);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chia sẻ Workflow / Code Boilerplate mới"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit}>Xuất bản Workflow</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Tên Workflow"
          placeholder="Ví dụ: Quy trình Setup Clean Architecture với EF Core & JWT Auth"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Môn học áp dụng"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            options={mockCourses.map((c) => ({ value: c.code, label: `${c.code} - ${c.title}` }))}
          />
          <Input
            label="Công nghệ / Tech Stack"
            placeholder=".NET 8, React, Node.js..."
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
          />
        </div>

        <Textarea
          label="Mô tả tóm tắt quy trình"
          placeholder="Quy trình này giúp sinh viên làm gì? Giải quyết vấn đề nào..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Các bước thực hiện</h4>
            <Button variant="secondary" size="sm" type="button" onClick={addStep} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Thêm bước mới
            </Button>
          </div>

          {steps.map((step, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#005da7]">Bước {step.stepNumber}</span>
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(idx)} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Input
                placeholder="Tiêu đề bước (Ví dụ: Cấu hình DbContext)"
                value={step.title}
                onChange={(e) => updateStep(idx, 'title', e.target.value)}
                required
              />

              <Textarea
                placeholder="Hướng dẫn chi tiết bước này..."
                rows={2}
                value={step.instruction}
                onChange={(e) => updateStep(idx, 'instruction', e.target.value)}
              />

              <Textarea
                placeholder="Đoạn mã (Code snippet / Terminal command)..."
                rows={3}
                value={step.codeSnippet || ''}
                onChange={(e) => updateStep(idx, 'codeSnippet', e.target.value)}
              />
            </div>
          ))}
        </div>
      </form>
    </Modal>
  );
};
