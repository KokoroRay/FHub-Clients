import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Code } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { courseNodesApi } from '../../services/api/adminApi';
import { SharedWorkflow } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { CourseSelect } from '../../components/common/CourseSelect';
import { filterCompactCourses } from '../../utils/courseFilter';

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
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [technology, setTechnology] = useState('');
  const [tags, setTags] = useState('');
  const [courses, setCourses] = useState<Array<{ code: string; title: string }>>([]);

  useEffect(() => {
    let isMounted = true;
    const loadCourses = async () => {
      try {
        const res = await courseNodesApi.getCourseNodes({ pageSize: 150 });
        const items = (res as any)?.items || res || [];
        if (isMounted && Array.isArray(items) && items.length > 0) {
          const filtered = filterCompactCourses(items, currentUser);
          const mapped = filtered.map((c: any) => ({
            code: c.code || c.courseCode,
            title: c.name || c.title || c.code,
          }));
          setCourses(mapped);
          if (!courseCode && mapped[0]) setCourseCode(mapped[0].code);
        }
      } catch (err) {
        console.warn('Failed to load courses in workflow modal:', err);
      }
    };
    loadCourses();
    return () => { isMounted = false; };
  }, [courseCode]);

  const [steps, setSteps] = useState([
    { stepNumber: 1, title: '', instruction: '', codeSnippet: '', language: 'bash' },
  ]);

  const addStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        title: '',
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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 8) {
      setErrorMessage(t('workflowModal.errorTitleMin', 'Tên workflow cần tối thiểu 8 ký tự.'));
      return;
    }
    if (steps.length === 0 || !steps.some((s) => s.title.trim() || s.instruction.trim())) {
      setErrorMessage(t('workflowModal.errorStepsMin', 'Workflow cần ít nhất 1 bước với tiêu đề hoặc hướng dẫn cụ thể.'));
      return;
    }

    setErrorMessage(null);
    const newWf: SharedWorkflow = {
      id: `wf-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      courseCode,
      technology,
      steps,
      author: {
        id: currentUser?.id || 'usr-1',
        fullName: currentUser?.fullName || t("Sinh viên FHub"),
        avatarUrl: currentUser?.avatarUrl,
        role: currentUser?.role || 'Student',
        campus: currentUser?.campus || 'FU-HL',
      },
      viewsCount: 1,
      usageCount: 0,
      tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    // Asynchronously persist to backend WorkflowsController
    import('../../services/api/contentApi').then(({ workflowApi }) => {
      workflowApi.createWorkflow({
        title: title.trim(),
        summary: description.trim(),
        steps: steps.map((s, idx) => ({
          stepNumber: idx + 1,
          title: s.title,
          content: `${s.instruction}\n\`\`\`${s.language || 'bash'}\n${s.codeSnippet || ''}\n\`\`\``,
        })),
      }).catch((err) => console.warn('Backend workflow save notice:', err));
    });

    onCreated(newWf);
    setErrorMessage(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('workflowModal.title', 'Chia sẻ Quy trình & Hướng dẫn học tập (Workflow)')}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>{t('common.cancel', 'Hủy')}</Button>
          <Button variant="primary" onClick={handleSubmit}>{t('workflowModal.publish', 'Xuất bản Workflow (+25 Karma)')}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {t(errorMessage)}
          </div>
        )}
        <Input
          label={t('workflowModal.nameLabel', 'Tên Workflow')}
          placeholder={t('workflowModal.namePlaceholder', 'Ví dụ: Quy trình làm bài tập lớn Assignment, Quy trình làm đồ án Capstone, Quy trình thiết kế Figma UI/UX, Quy trình phân tích SPSS...')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CourseSelect
            label={t('workflowModal.courseLabel', 'Môn học áp dụng *')}
            value={courseCode}
            onChange={(code) => setCourseCode(code)}
            required
          />
          <Input
            label={t('workflowModal.techLabel', 'Công cụ / Phần mềm / Công nghệ')}
            placeholder={t("Figma, SPSS, Excel, Canva, React, Python, Premiere, Jira, Photoshop...")}
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
          />
        </div>

        <Textarea
          label={t('workflowModal.descLabel', 'Mô tả tóm tắt quy trình')}
          placeholder={t('workflowModal.descPlaceholder', 'Quy trình này giúp sinh viên làm gì? Giải quyết vấn đề nào...')}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t('workflowModal.stepsHeading', 'Các bước thực hiện')}</h4>
            <Button variant="secondary" size="sm" type="button" onClick={addStep} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              {t('workflowModal.addStep', 'Thêm bước mới')}
            </Button>
          </div>

          {steps.map((step, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-600">{t('workflowModal.stepPrefix', 'Bước')} {step.stepNumber}</span>
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(idx)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Input
                placeholder={t('workflowModal.stepTitlePlaceholder', 'Tiêu đề bước (Ví dụ: Cấu hình DbContext)')}
                value={step.title}
                onChange={(e) => updateStep(idx, 'title', e.target.value)}
                required
              />

              <Textarea
                placeholder={t('workflowModal.stepInstructionPlaceholder', 'Hướng dẫn chi tiết bước này...')}
                rows={2}
                value={step.instruction}
                onChange={(e) => updateStep(idx, 'instruction', e.target.value)}
              />

              <Textarea
                placeholder={t('workflowModal.stepCodePlaceholder', 'Đoạn mã (Code snippet / Terminal command)...')}
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
