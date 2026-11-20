import React, { useState } from 'react';
import { Plus, Trash2, Award, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CourseNodeListItem } from '../../services/api/adminApi';
import { workflowApi, alumniApi } from '../../services/api/contentApi';
import { SharedWorkflow } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { CourseSelect } from '../../components/common/CourseSelect';

export interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (wf: SharedWorkflow) => void;
}

interface StepDraft {
  stepNumber: number;
  title: string;
  instruction: string;
  codeSnippet: string;
  language: string;
}

const createInitialStep = (): StepDraft => ({
  stepNumber: 1,
  title: '',
  instruction: '',
  codeSnippet: '',
  language: 'bash',
});

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
  const [selectedCourse, setSelectedCourse] = useState<CourseNodeListItem | undefined>(undefined);
  const [technology, setTechnology] = useState('');
  const [tags, setTags] = useState('');
  const [steps, setSteps] = useState<StepDraft[]>([createInitialStep()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const updateStep = (index: number, field: keyof StepDraft, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCourseCode('');
    setSelectedCourse(undefined);
    setTechnology('');
    setTags('');
    setSteps([createInitialStep()]);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanTitle = title.trim();
    if (cleanTitle.length < 3) {
      setErrorMessage(t('workflowModal.errorTitleMin', 'Tên workflow cần tối thiểu 3 ký tự.'));
      return;
    }

    if (steps.length === 0) {
      setErrorMessage(t('workflowModal.errorStepsMin', 'Workflow cần ít nhất 1 bước thực hiện.'));
      return;
    }

    // Validate each step has title (>=2 chars) and content (>=2 chars) to satisfy backend rules
    const normalizedSteps = [];
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const stepTitle = s.title.trim();
      const instruction = s.instruction.trim();
      const code = s.codeSnippet.trim();
      const combinedContent = code
        ? (instruction ? `${instruction}\n\`\`\`${s.language || 'bash'}\n${code}\n\`\`\`` : `\`\`\`${s.language || 'bash'}\n${code}\n\`\`\``)
        : instruction;

      if (stepTitle.length < 2) {
        setErrorMessage(t('workflowModal.errorStepTitleMin', `Bước ${i + 1}: Tiêu đề bước cần tối thiểu 2 ký tự.`));
        return;
      }
      if (combinedContent.length < 2) {
        setErrorMessage(t('workflowModal.errorStepContentMin', `Bước ${i + 1}: Vui lòng nhập hướng dẫn chi tiết hoặc đoạn mã (tối thiểu 2 ký tự).`));
        return;
      }

      normalizedSteps.push({
        stepNumber: i + 1,
        title: stepTitle,
        content: combinedContent,
      });
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const isAlumni = currentUser?.role === 'Alumni';
      const courseIdNum = Number(selectedCourse?.courseNodeId ?? selectedCourse?.id);
      const effectiveCourseId = courseCode && courseIdNum && courseIdNum > 0 ? courseIdNum : null;

      const payload = {
        title: cleanTitle,
        summary: description.trim() || undefined,
        courseId: effectiveCourseId,
        status: 'PUBLISHED' as const,
        steps: normalizedSteps,
      };

      const created = isAlumni
        ? await alumniApi.createIndustryWorkflow(payload)
        : await workflowApi.createWorkflow(payload);

      const resolvedCourseCode = created?.courseId
        ? (courseCode || selectedCourse?.courseCode || selectedCourse?.code || `COURSE-${created.courseId}`)
        : 'GENERAL';

      const newWf: SharedWorkflow = {
        id: String(created.workflowId),
        title: created.title || cleanTitle,
        description: created.summary || description.trim() || cleanTitle,
        courseCode: resolvedCourseCode.toUpperCase(),
        technology: technology.trim() || t('Quy trình chuẩn'),
        steps: steps.map((s, idx) => ({
          stepNumber: idx + 1,
          title: s.title.trim(),
          instruction: s.instruction.trim(),
          codeSnippet: s.codeSnippet.trim(),
          language: s.language || 'bash',
        })),
        author: {
          id: currentUser?.id || String(created.authorUserId || '1'),
          fullName: currentUser?.fullName || t('Sinh viên FHub'),
          avatarUrl: currentUser?.avatarUrl,
          role: currentUser?.role || 'Student',
          campus: currentUser?.campus || '',
        },
        viewsCount: 0,
        usageCount: 0,
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean),
        createdAt: created.createdAt || new Date().toISOString(),
      };

      onCreated(newWf);
      resetForm();
      onClose();
    } catch (err: any) {
      const backendErrors = err?.response?.data?.errors;
      const firstValidationMsg =
        backendErrors && typeof backendErrors === 'object'
          ? Object.values(backendErrors).flat().join(' ')
          : null;
      const msg =
        firstValidationMsg ||
        err?.response?.data?.message ||
        err?.message ||
        t('Không thể tạo workflow trên hệ thống. Vui lòng kiểm tra lại dữ liệu.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlumni = currentUser?.role === 'Alumni';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isAlumni
          ? t('workflowModal.alumniTitle', 'Chia sẻ Quy trình Thực tế Ngành (Industry Workflow)')
          : t('workflowModal.title', 'Chia sẻ Quy trình & Hướng dẫn học tập (Workflow)')
      }
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel', 'Hủy')}
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {isAlumni
              ? t('workflowModal.publishAlumni', 'Xuất bản Industry Workflow (Alumni)')
              : t('workflowModal.publish', 'Xuất bản Workflow (+25 Karma)')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {isAlumni && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Award className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              {t(
                'workflowModal.alumniAutoBadge',
                'Tài khoản Cựu sinh viên (Alumni). Quy trình này sẽ được gắn huy hiệu Verified Industry Workflow.'
              )}
            </span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{t(errorMessage)}</span>
          </div>
        )}
        <Input
          label={t('workflowModal.nameLabel', 'Tên Workflow *')}
          placeholder={t('workflowModal.namePlaceholder', 'Ví dụ: Quy trình làm bài tập lớn Assignment, Quy trình làm đồ án Capstone, Quy trình thiết kế Figma UI/UX...')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CourseSelect
            label={t('workflowModal.courseLabelOptional', 'Môn học áp dụng (Không bắt buộc)')}
            value={courseCode}
            onChange={(code, course) => {
              setCourseCode(code);
              setSelectedCourse(course);
            }}
            allowEmpty={true}
            emptyLabel="-- Chung (Không gắn môn) --"
            required={false}
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
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {t('workflowModal.stepsHeading', 'Các bước thực hiện')} ({steps.length})
            </h4>
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
                placeholder={t('workflowModal.stepTitlePlaceholder', 'Tiêu đề bước * (Ví dụ: Cấu hình DbContext)')}
                value={step.title}
                onChange={(e) => updateStep(idx, 'title', e.target.value)}
                required
              />

              <Textarea
                placeholder={t('workflowModal.stepInstructionPlaceholder', 'Hướng dẫn chi tiết bước này *...')}
                rows={2}
                value={step.instruction}
                onChange={(e) => updateStep(idx, 'instruction', e.target.value)}
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">{t('Đoạn mã / Lệnh (Tùy chọn)')}</span>
                  <select
                    value={step.language}
                    onChange={(e) => updateStep(idx, 'language', e.target.value)}
                    className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-0.5 text-slate-600 dark:text-slate-300"
                  >
                    <option value="bash">bash</option>
                    <option value="csharp">csharp</option>
                    <option value="typescript">typescript</option>
                    <option value="python">python</option>
                    <option value="sql">sql</option>
                    <option value="json">json</option>
                    <option value="yaml">yaml</option>
                    <option value="text">text</option>
                  </select>
                </div>
                <Textarea
                  placeholder={t('workflowModal.stepCodePlaceholder', 'Đoạn mã (Code snippet / Terminal command)...')}
                  rows={3}
                  value={step.codeSnippet || ''}
                  onChange={(e) => updateStep(idx, 'codeSnippet', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </form>
    </Modal>
  );
};
