import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  Play,
  ArrowLeft,
  Terminal,
  Edit3,
  Trash2,
  X,
  Bookmark,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { workflowApi } from '../../services/api/contentApi';
import { bookmarkApi } from '../../services/api/studentApi';
import { courseNodesApi, CourseNodeListItem } from '../../services/api/adminApi';
import { loadAllSemanticTags, getSemanticTagMap, resolveTagNames } from '../../utils/tagUtils';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CourseSelect } from '../../components/common/CourseSelect';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SeriesSidebarCard } from '../../components/common/SeriesSidebarCard';

interface ParsedStep {
  stepNumber: number;
  title: string;
  instruction: string;
  codeSnippet: string;
  language: string;
  mediaUrl?: string;
}

const parseStepContent = (
  rawContent: string
): { instruction: string; codeSnippet: string; language: string } => {
  const text = (rawContent || '').trim();
  if (!text) return { instruction: '', codeSnippet: '', language: 'bash' };

  const fenceMatch = text.match(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/);
  if (fenceMatch) {
    const language = fenceMatch[1]?.trim() || 'bash';
    const codeSnippet = fenceMatch[2]?.trim() || '';
    const before = text.slice(0, fenceMatch.index).trim();
    const after = text.slice((fenceMatch.index ?? 0) + fenceMatch[0].length).trim();
    const instruction = [before, after].filter(Boolean).join('\n\n');
    return { instruction, codeSnippet, language };
  }

  return { instruction: text, codeSnippet: '', language: 'bash' };
};

const serializeStepContent = (
  instruction: string,
  codeSnippet?: string,
  language?: string
): string => {
  const cleanInst = (instruction || '').trim();
  const cleanCode = (codeSnippet || '').trim();
  if (cleanCode) {
    const fenced = `\`\`\`${language || 'bash'}\n${cleanCode}\n\`\`\``;
    return cleanInst ? `${cleanInst}\n${fenced}` : fenced;
  }
  return cleanInst;
};

export const WorkflowDetailPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stepsSectionRef = useRef<HTMLDivElement | null>(null);

  const [workflow, setWorkflow] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [applyBannerNotice, setApplyBannerNotice] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<number | string | null>(null);

  // Full Edit Modal State
  const [showEditWorkflowModal, setShowEditWorkflowModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editSelectedCourse, setEditSelectedCourse] = useState<CourseNodeListItem | undefined>(undefined);
  const [editStatus, setEditStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [editSteps, setEditSteps] = useState<ParsedStep[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Modal State
  const [showDeleteWorkflowModal, setShowDeleteWorkflowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    const fetchWorkflow = async () => {
      try {
        setIsLoading(true);
        const [data, coursesRes, tagsRes] = await Promise.all([
          workflowApi.getWorkflowById(id),
          courseNodesApi.getCourseNodes({ pageSize: 2000 }).catch(() => ({ items: [] })),
          loadAllSemanticTags(),
        ]);
        if (isMounted && data) {
          const cItems = (coursesRes as any)?.items || (Array.isArray(coursesRes) ? coursesRes : []);
          const matchedCourse = cItems.find(
            (c: any) =>
              c.id === data.courseId ||
              c.courseId === data.courseId ||
              c.courseNodeId === data.courseId ||
              (c.code && Number(c.code.replace(/\D/g, '')) === data.courseId)
          );
          const courseCode =
            matchedCourse?.code ||
            (matchedCourse as any)?.courseCode ||
            (data.courseId === 61 ? 'SWP391' : data.courseId === 30 ? 'PRN231' : data.courseId === 49 ? 'SEP490' : data.courseId ? `COURSE-${data.courseId}` : 'CHUNG');

          const tagMap = getSemanticTagMap(tagsRes);
          const tags = resolveTagNames(data.semanticTagIds, tagMap);
          const technology = (data as any).technology || (tags.length > 0 ? tags[0] : t('Quy trình chuẩn'));

          const numId = Number(id ? id.replace(/\D/g, '') : 0);
          if (numId) {
            try {
              const bList = await bookmarkApi.getBookmarks('Workflow');
              const found = bList.find((b: any) => Number(b.targetId || b.externalTargetId) === numId);
              if (found && isMounted) {
                setIsBookmarked(true);
                setBookmarkId(found.id);
              }
            } catch {}
          }

          // Load persisted apply state & completed steps from localStorage
          let savedCompleted: number[] = [];
          let savedApplying = false;
          let savedUsageBonus = 0;
          try {
            const rawProgress = localStorage.getItem(`fhub_wf_progress_${data.workflowId}`);
            if (rawProgress) {
              const parsed = JSON.parse(rawProgress);
              if (Array.isArray(parsed)) savedCompleted = parsed;
            }
            savedApplying = localStorage.getItem(`fhub_wf_applying_${data.workflowId}`) === 'true';
            savedUsageBonus = Number(localStorage.getItem(`fhub_wf_usage_${data.workflowId}`) || '0') || 0;
          } catch {}

          const mappedSteps: ParsedStep[] = (data.steps || [])
            .slice()
            .sort((a: any, b: any) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0))
            .map((s: any, idx: number) => {
              const stepNum = s.stepNumber ?? idx + 1;
              const rawContent = s.content ?? s.instruction ?? '';
              const parsed = parseStepContent(rawContent);
              return {
                stepNumber: stepNum,
                title: s.title || s.stepTitle || t('Bước {p0}', undefined, { p0: stepNum }),
                instruction: parsed.instruction || (s.instruction ?? ''),
                codeSnippet: s.codeSnippet || parsed.codeSnippet || '',
                language: s.language || parsed.language || 'bash',
                mediaUrl: s.mediaUrl,
              };
            });

          setCompletedSteps(savedCompleted);
          setIsApplying(savedApplying);
          setWorkflow({
            id: String(data.workflowId),
            authorUserId: data.authorUserId,
            courseId: data.courseId ?? null,
            status: (data.status as 'PUBLISHED' | 'DRAFT') || 'PUBLISHED',
            semanticTagIds: data.semanticTagIds || [],
            title: data.title,
            description: data.summary || '',
            courseCode,
            technology,
            version: (data as any).version || 1,
            author: {
              fullName:
                (data.authorUserId && currentUser?.id && String(data.authorUserId) === String(currentUser.id)
                  ? currentUser.fullName || null
                  : null) ||
                (data as any).authorDisplayName ||
                (data as any).authorName ||
                (data.authorUserId ? `Sinh viên FPT (#${data.authorUserId})` : 'Thành viên FHub'),
              role: 'Student',
              avatarUrl: '',
            },
            usageCount: savedUsageBonus,
            viewsCount: 1,
            steps: mappedSteps,
          });
        }
      } catch (err) {
        if (isMounted) setWorkflow(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchWorkflow();
    return () => { isMounted = false; };
  }, [id]);

  const persistProgress = (wfId: string, nextCompleted: number[]) => {
    try {
      localStorage.setItem(`fhub_wf_progress_${wfId}`, JSON.stringify(nextCompleted));
    } catch {}
  };

  const handleCopyCode = (stepNum: number, snippet?: string) => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet);
    setCopiedStep(stepNum);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const toggleStepComplete = (stepNum: number) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum];
      if (workflow?.id) persistProgress(workflow.id, next);
      return next;
    });
  };

  const handleApplyWorkflow = () => {
    if (!workflow) return;

    if (!isApplying) {
      setIsApplying(true);
      const nextUsage = (workflow.usageCount || 0) + 1;
      setWorkflow((prev: any) => (prev ? { ...prev, usageCount: nextUsage } : prev));
      try {
        localStorage.setItem(`fhub_wf_applying_${workflow.id}`, 'true');
        localStorage.setItem(`fhub_wf_usage_${workflow.id}`, String(nextUsage));
      } catch {}
      setApplyBannerNotice(
        t('workflowDetail.applyStarted', 'Đã kích hoạt chế độ áp dụng quy trình! Hãy đánh dấu hoàn thành từng bước bên dưới.')
      );
      setTimeout(() => setApplyBannerNotice(null), 4000);
    }

    stepsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCompleteAllSteps = () => {
    if (!workflow) return;
    const allNums = workflow.steps.map((s: ParsedStep) => s.stepNumber);
    setCompletedSteps(allNums);
    persistProgress(workflow.id, allNums);
  };

  const handleResetProgress = () => {
    if (!workflow) return;
    setCompletedSteps([]);
    persistProgress(workflow.id, []);
  };

  const openEditModal = () => {
    if (!workflow) return;
    setEditTitle(workflow.title || '');
    setEditDesc(workflow.description || '');
    setEditCourseCode(workflow.courseCode && workflow.courseCode !== 'CHUNG' && !workflow.courseCode.startsWith('COURSE-') ? workflow.courseCode : '');
    setEditSelectedCourse(undefined);
    setEditStatus(workflow.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED');
    setEditSteps(
      workflow.steps && workflow.steps.length > 0
        ? workflow.steps.map((s: ParsedStep, idx: number) => ({
            stepNumber: idx + 1,
            title: s.title || '',
            instruction: s.instruction || '',
            codeSnippet: s.codeSnippet || '',
            language: s.language || 'bash',
            mediaUrl: s.mediaUrl,
          }))
        : [{ stepNumber: 1, title: '', instruction: '', codeSnippet: '', language: 'bash' }]
    );
    setEditError(null);
    setShowEditWorkflowModal(true);
  };

  const addEditStep = () => {
    setEditSteps((prev) => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        title: '',
        instruction: '',
        codeSnippet: '',
        language: 'bash',
      },
    ]);
  };

  const removeEditStep = (idx: number) => {
    if (editSteps.length <= 1) return;
    setEditSteps((prev) =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 }))
    );
  };

  const moveEditStep = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= editSteps.length) return;
    setEditSteps((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next.map((s, i) => ({ ...s, stepNumber: i + 1 }));
    });
  };

  const updateEditStep = (idx: number, field: keyof ParsedStep, value: string) => {
    setEditSteps((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSaveEdit = async () => {
    if (!workflow || isSavingEdit) return;

    const cleanTitle = editTitle.trim();
    if (cleanTitle.length < 3) {
      setEditError(t('Tiêu đề quy trình cần tối thiểu 3 ký tự.'));
      return;
    }

    if (editSteps.length === 0) {
      setEditError(t('Quy trình cần có ít nhất 1 bước thực hiện.'));
      return;
    }

    const payloadSteps = [];
    for (let i = 0; i < editSteps.length; i++) {
      const s = editSteps[i];
      const stepTitle = s.title.trim();
      const content = serializeStepContent(s.instruction, s.codeSnippet, s.language);
      if (stepTitle.length < 2) {
        setEditError(t(`Bước ${i + 1}: Tiêu đề bước cần tối thiểu 2 ký tự.`));
        return;
      }
      if (content.length < 2) {
        setEditError(t(`Bước ${i + 1}: Hướng dẫn hoặc đoạn mã cần tối thiểu 2 ký tự.`));
        return;
      }
      payloadSteps.push({
        stepNumber: i + 1,
        title: stepTitle,
        content,
        mediaUrl: s.mediaUrl || undefined,
      });
    }

    setEditError(null);
    setIsSavingEdit(true);

    try {
      const selectedCourseIdNum = Number(editSelectedCourse?.courseNodeId ?? editSelectedCourse?.id);
      const effectiveCourseId = !editCourseCode
        ? null
        : selectedCourseIdNum && selectedCourseIdNum > 0
          ? selectedCourseIdNum
          : (workflow.courseId ?? null);

      const updated = await workflowApi.updateWorkflow(workflow.id, {
        title: cleanTitle,
        summary: editDesc.trim() || undefined,
        courseId: effectiveCourseId,
        status: editStatus,
        steps: payloadSteps,
        semanticTagIds: workflow.semanticTagIds?.length ? workflow.semanticTagIds : undefined,
      });

      const updatedSteps: ParsedStep[] = (updated.steps || [])
        .slice()
        .sort((a: any, b: any) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0))
        .map((s: any, idx: number) => {
          const parsed = parseStepContent(s.content || '');
          return {
            stepNumber: s.stepNumber ?? idx + 1,
            title: s.title,
            instruction: parsed.instruction,
            codeSnippet: parsed.codeSnippet,
            language: parsed.language,
            mediaUrl: s.mediaUrl,
          };
        });

      const nextCourseCode = !effectiveCourseId
        ? 'CHUNG'
        : editCourseCode || editSelectedCourse?.courseCode || editSelectedCourse?.code || workflow.courseCode;

      setWorkflow({
        ...workflow,
        title: updated.title || cleanTitle,
        description: updated.summary ?? editDesc.trim(),
        courseId: updated.courseId ?? effectiveCourseId,
        courseCode: nextCourseCode,
        status: updated.status || editStatus,
        steps: updatedSteps,
      });
      setShowEditWorkflowModal(false);
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
        t('Không thể cập nhật workflow. Chỉ tác giả mới có quyền chỉnh sửa.');
      setEditError(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!workflow || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await workflowApi.deleteWorkflow(workflow.id);
      setShowDeleteWorkflowModal(false);
      navigate('/workflows');
    } catch (err: any) {
      setDeleteError(
        err?.response?.data?.message ||
          err?.message ||
          t('Không thể xóa workflow. Chỉ tác giả mới có quyền xóa.')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        {t('Loading...')}
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">{t('No data found')}</h3>
        <p className="text-xs text-slate-500">{t('Workflow này không tồn tại hoặc đã bị gỡ bỏ.')}</p>
        <Link to="/workflows" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700">
          <ArrowLeft className="w-4 h-4" /> {t('Back to Workflows')}
        </Link>
      </div>
    );
  }

  const totalSteps = workflow.steps.length;
  const completedCount = completedSteps.filter((n) => workflow.steps.some((s: ParsedStep) => s.stepNumber === n)).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isAllCompleted = totalSteps > 0 && completedCount === totalSteps;
  const nextUncompletedStep = workflow.steps.find((s: ParsedStep) => !completedSteps.includes(s.stepNumber))?.stepNumber;

  return (
    <div className="space-y-6 w-full">
      {/* Back button */}
      <Link to="/workflows" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('Back to Workflows')}
      </Link>

      {/* Series Playlist Navigation (when opened from a Series) */}
      <SeriesSidebarCard currentType="WORKFLOW" currentId={workflow.id} variant="banner" />

      {/* Header Info */}
      <Card>
        <CardBody className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary" size="md">{workflow.courseCode}</Badge>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300 px-2.5 py-1 rounded-lg border border-purple-200/60 dark:border-purple-800">
                  {workflow.technology}
                </span>
                {workflow.status === 'DRAFT' && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    DRAFT
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {workflow.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                {workflow.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Button
                id="btn-edit-workflow"
                variant="outline"
                size="sm"
                onClick={openEditModal}
                leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
              >
                {t('Edit')}
              </Button>
              <Button
                id="btn-delete-workflow"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteError(null);
                  setShowDeleteWorkflowModal(true);
                }}
                className="text-red-600 hover:bg-red-50"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                {t('Delete')}
              </Button>
              <Button
                variant={isBookmarked ? 'secondary' : 'outline'}
                size="sm"
                onClick={async () => {
                  const numId = Number(id ? id.replace(/\D/g, '') : 0);
                  if (isBookmarked && bookmarkId) {
                    setIsBookmarked(false);
                    try { await bookmarkApi.removeBookmark(bookmarkId); setBookmarkId(null); } catch {}
                  } else if (numId) {
                    setIsBookmarked(true);
                    try { const b = await bookmarkApi.addBookmark('Workflow', numId); setBookmarkId(b?.bookmarkId || b?.id || 1); } catch {}
                  }
                }}
                leftIcon={<Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600 text-blue-600' : 'text-slate-500'}`} />}
              >
                {isBookmarked ? t('common.saved', 'Đã lưu') : t('common.bookmark', 'Lưu')}
              </Button>
              <Button
                id="btn-apply-workflow"
                variant="primary"
                onClick={handleApplyWorkflow}
                leftIcon={isAllCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              >
                {isAllCompleted
                  ? t('Đã hoàn thành ✓')
                  : isApplying
                    ? `${t('Đang áp dụng')} (${completedCount}/${totalSteps})`
                    : t('Apply Workflow')}
              </Button>
              <ContentActionMenu
                targetType="WORKFLOW"
                targetId={workflow.id}
                targetTitle={workflow.title}
                shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                {workflow.author.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{workflow.author.fullName}</span>
                <span className="text-[10px] text-slate-400 block">{t(workflow.author.role)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 font-semibold">
              <span className="text-blue-600">{workflow.usageCount} {t('lượt áp dụng')}</span>
              <span>{workflow.viewsCount} {t('lượt xem')}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Apply Workflow Active Progress Banner */}
      {applyBannerNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{applyBannerNotice}</span>
        </div>
      )}

      {isApplying && totalSteps > 0 && (
        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-[#0076D1]" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {isAllCompleted
                  ? t('Chúc mừng! Bạn đã hoàn thành toàn bộ quy trình này.')
                  : `${t('Đang áp dụng quy trình')}: ${completedCount}/${totalSteps} ${t('bước')} (${progressPercent}%)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isAllCompleted && (
                <button
                  type="button"
                  onClick={handleCompleteAllSteps}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#0076D1] hover:bg-blue-700 text-white transition-colors cursor-pointer"
                >
                  {t('Hoàn thành tất cả')}
                </button>
              )}
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('Đặt lại')}</span>
                </button>
              )}
            </div>
          </div>
          <div className="w-full h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden border border-blue-100 dark:border-blue-900">
            <div
              className={`h-full transition-all duration-300 ${isAllCompleted ? 'bg-emerald-500' : 'bg-[#0076D1]'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps Execution Guide */}
      <div ref={stepsSectionRef} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            <span>{t('Steps Guide')} ({workflow.steps.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {t('Progress')}: {completedCount} / {workflow.steps.length} {t('Completed')}
          </span>
        </div>

        {workflow.steps.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            {t('Workflow này chưa có bước thực hiện chi tiết nào.')}
          </div>
        ) : (
          workflow.steps.map((step: ParsedStep) => {
            const isDone = completedSteps.includes(step.stepNumber);
            const isNextStep = isApplying && nextUncompletedStep === step.stepNumber;
            return (
              <Card
                key={step.stepNumber}
                className={`transition-all ${
                  isDone
                    ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : isNextStep
                      ? 'border-[#0076D1] ring-2 ring-blue-100 dark:ring-blue-950/50'
                      : ''
                }`}
              >
                <CardBody className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleStepComplete(step.stepNumber)}
                        title={isDone ? t('Đánh dấu chưa hoàn thành') : t('Đánh dấu hoàn thành bước này')}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-700 hover:border-blue-500'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <h3 className={`font-bold text-sm sm:text-base ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {step.title}
                      </h3>
                    </div>

                    <span className="text-xs font-mono text-slate-400 shrink-0">
                      {t('Step')} {step.stepNumber}
                    </span>
                  </div>

                  {step.instruction && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pl-9 leading-relaxed whitespace-pre-line">
                      {step.instruction}
                    </p>
                  )}

                  {step.codeSnippet && (
                    <div className="ml-9 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 dark:bg-black text-slate-200 text-xs font-mono">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/60">
                        <span className="text-[11px] text-slate-400 font-sans">{step.language || 'bash'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(step.stepNumber, step.codeSnippet)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedStep === step.stepNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedStep === step.stepNumber ? t('Copied') : t('Copy Code')}</span>
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto leading-relaxed">
                        <code>{step.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })
        )}
      </div>

      {/* ─── Full Edit Workflow Modal ─────────────────────────────────────────── */}
      {showEditWorkflowModal && workflow && (
        <div id="modal-edit-workflow" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 shrink-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0076D1]" />
                <span>{t('Chỉnh sửa quy trình lộ trình')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditWorkflowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('Tiêu đề quy trình *')}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CourseSelect
                  label={t('Môn học áp dụng (Không bắt buộc)')}
                  value={editCourseCode}
                  onChange={(code, course) => {
                    setEditCourseCode(code);
                    setEditSelectedCourse(course);
                  }}
                  allowEmpty={true}
                  emptyLabel="-- Chung (Không gắn môn) --"
                  required={false}
                />

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {t('Trạng thái xuất bản')}
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'PUBLISHED' | 'DRAFT')}
                    className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="PUBLISHED">{t('Đã xuất bản (PUBLISHED)')}</option>
                    <option value="DRAFT">{t('Bản nháp (DRAFT)')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('Tóm tắt lộ trình')}
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Full Steps Editor */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {t('Các bước thực hiện')} ({editSteps.length})
                  </h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={addEditStep}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    {t('Thêm bước mới')}
                  </Button>
                </div>

                {editSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0076D1]">
                        {t('Bước')} {step.stepNumber}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveEditStep(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          title={t('Di chuyển lên')}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveEditStep(idx, 1)}
                          disabled={idx === editSteps.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          title={t('Di chuyển xuống')}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {editSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEditStep(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                            title={t('Xóa bước này')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder={t('Tiêu đề bước *')}
                      value={step.title}
                      onChange={(e) => updateEditStep(idx, 'title', e.target.value)}
                      className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />

                    <textarea
                      rows={2}
                      placeholder={t('Hướng dẫn chi tiết bước này *...')}
                      value={step.instruction}
                      onChange={(e) => updateEditStep(idx, 'instruction', e.target.value)}
                      className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {t('Đoạn mã / Lệnh (Tùy chọn)')}
                        </span>
                        <select
                          value={step.language}
                          onChange={(e) => updateEditStep(idx, 'language', e.target.value)}
                          className="text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-0.5 text-slate-600 dark:text-slate-300"
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
                      <textarea
                        rows={3}
                        placeholder={t('Code snippet / Terminal command...')}
                        value={step.codeSnippet}
                        onChange={(e) => updateEditStep(idx, 'codeSnippet', e.target.value)}
                        className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowEditWorkflowModal(false)}
                disabled={isSavingEdit}
              >
                {t('Hủy')}
              </Button>
              <Button
                id="btn-save-edit-workflow"
                variant="primary"
                onClick={handleSaveEdit}
                isLoading={isSavingEdit}
              >
                {t('Lưu thay đổi')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Workflow Confirmation Modal ───────────────────────────────── */}
      {showDeleteWorkflowModal && workflow && (
        <div id="modal-delete-workflow" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('Xóa quy trình lộ trình')}</h3>
                <p className="text-xs text-slate-500">{t('Xác nhận xóa vĩnh viễn')}</p>
              </div>
            </div>

            {deleteError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('Bạn có chắc chắn muốn xóa workflow')} <strong>"{workflow.title}"</strong>{t('? Toàn bộ')} {workflow.steps.length} {t('bước thực hiện chi tiết sẽ bị xóa vĩnh viễn khỏi hệ thống.')}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteWorkflowModal(false)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {t('Hủy')}
              </button>
              <button
                id="btn-confirm-delete-workflow"
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                {isDeleting ? t('Đang xóa...') : t('Xác nhận xóa')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
