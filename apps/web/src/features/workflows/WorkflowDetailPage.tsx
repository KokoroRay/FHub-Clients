import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Workflow,
  Copy,
  Check,
  Play,
  ArrowLeft,
  Terminal,
  Share2,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import { workflowApi } from '../../services/api/contentApi';
import { courseNodesApi } from '../../services/api/adminApi';
import { loadAllSemanticTags, getSemanticTagMap, resolveTagNames } from '../../utils/tagUtils';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';

export const WorkflowDetailPage: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();

  const [workflow, setWorkflow] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showEditWorkflowModal, setShowEditWorkflowModal] = useState(false);
  const [showDeleteWorkflowModal, setShowDeleteWorkflowModal] = useState(false);
  const [editWorkflowTitle, setEditWorkflowTitle] = useState('');
  const [editWorkflowDesc, setEditWorkflowDesc] = useState('');

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
          const technology = (data as any).technology || (tags.length > 0 ? tags[0] : t("Quy trình chuẩn"));

          setWorkflow({
            id: String(data.workflowId),
            title: data.title,
            description: data.summary || '',
            courseCode,
            technology,
            version: (data as any).version || 1,
            author: {
              fullName: data.authorUserId === 4 ? 'Nguyen Minh Tam (CE181522)' : 'Nguyen Minh Tam (CE181522)',
              role: 'Student',
              avatarUrl: '',
            },
            usageCount: 0,
            viewsCount: 0,
            steps: (data.steps || []).map((s: any) => ({
              stepNumber: s.stepNumber,
              title: s.stepTitle || t("Bước {p0}", undefined, { p0: s.stepNumber }),
              instruction: s.instruction || '',
              codeSnippet: s.codeSnippet || '',
              language: s.language || 'bash',
            })),
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

  const handleCopyCode = (stepNum: number, snippet?: string) => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet);
    setCopiedStep(stepNum);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const toggleStepComplete = (stepNum: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
    );
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
        <p className="text-xs text-slate-500">{t("Workflow này không tồn tại hoặc đã bị gỡ bỏ.")}</p>
        <Link to="/workflows" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700">
          <ArrowLeft className="w-4 h-4" /> {t('Back to Workflows')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Back button */}
      <Link to="/workflows" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('Back to Workflows')}
      </Link>

      {/* Header Info */}
      <Card>
        <CardBody className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="md">{workflow.courseCode}</Badge>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300 px-2.5 py-1 rounded-lg border border-purple-200/60 dark:border-purple-800">
                  {workflow.technology}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {workflow.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                {workflow.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                id="btn-edit-workflow"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditWorkflowTitle(workflow.title);
                  setEditWorkflowDesc(workflow.description);
                  setShowEditWorkflowModal(true);
                }}
                leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
              >
                {t('Edit')}
              </Button>
              <Button
                id="btn-delete-workflow"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteWorkflowModal(true)}
                className="text-red-600 hover:bg-red-50"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                {t('Delete')}
              </Button>
              <Button variant="primary" leftIcon={<Play className="w-4 h-4" />}>
                {t('Apply Workflow')}
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
              <span className="text-blue-600">{workflow.usageCount}  {t("lượt áp dụng")}</span>
              <span>{workflow.viewsCount}  {t("lượt xem")}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Steps Execution Guide */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            <span>{t('Steps Guide')} ({workflow.steps.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {t('Progress')}: {completedSteps.length} / {workflow.steps.length} {t('Completed')}
          </span>
        </div>

        {workflow.steps.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            {t("Workflow này chưa có bước thực hiện chi tiết nào.")}</div>
        ) : (
          workflow.steps.map((step: any) => {
            const isDone = completedSteps.includes(step.stepNumber);
            return (
              <Card
                key={step.stepNumber}
                className={`transition-all ${isDone ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10' : ''}`}
              >
                <CardBody className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStepComplete(step.stepNumber)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
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

                    <span className="text-xs font-mono text-slate-400">
                      {t('Step')} {step.stepNumber}
                    </span>
                  </div>

                  {step.instruction && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 pl-9 leading-relaxed">
                      {step.instruction}
                    </p>
                  )}

                  {step.codeSnippet && (
                    <div className="ml-9 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 dark:bg-black text-slate-200 text-xs font-mono">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/60">
                        <span className="text-[11px] text-slate-400 font-sans">{step.language || 'bash'}</span>
                        <button
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

      {/* ─── 3.5.4 Edit Workflow Modal ────────────────────────────────────────── */}
      {showEditWorkflowModal && workflow && (
        <div id="modal-edit-workflow" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0076D1]" />
                <span>{t("Chỉnh Sửa Workflow Lộ Trình")}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditWorkflowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("Tiêu đề quy trình")}</label>
                <input
                  type="text"
                  value={editWorkflowTitle}
                  onChange={(e) => setEditWorkflowTitle(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("Môn học & Công nghệ")}</label>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-[#0076D1] border border-blue-200 rounded-lg text-xs font-mono font-bold">
                    {workflow.courseCode || 'SWP391'}
                  </span>
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-mono font-bold">
                    {workflow.technology || 'CI/CD Docker'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("Tóm tắt lộ trình")}</label>
                <textarea
                  rows={4}
                  value={editWorkflowDesc}
                  onChange={(e) => setEditWorkflowDesc(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditWorkflowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}</button>
              <button
                id="btn-save-edit-workflow"
                type="button"
                onClick={() => {
                  setWorkflow({
                    ...workflow,
                    title: editWorkflowTitle,
                    description: editWorkflowDesc,
                  });
                  setShowEditWorkflowModal(false);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Lưu thay đổi")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3.5.5 Delete Workflow Confirmation Modal ─────────────────────────── */}
      {showDeleteWorkflowModal && workflow && (
        <div id="modal-delete-workflow" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("Xóa Workflow Lộ Trình")}</h3>
                <p className="text-xs text-slate-500">{t("Xác nhận xóa vĩnh viễn")}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("Bạn có chắc chắn muốn xóa workflow")} <strong>"{workflow.title}"</strong>{t("? Toàn bộ")} {workflow.steps.length}  {t("bước thực hiện chi tiết sẽ bị xóa vĩnh viễn khỏi hệ thống.")}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteWorkflowModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}</button>
              <button
                id="btn-confirm-delete-workflow"
                type="button"
                onClick={() => {
                  setShowDeleteWorkflowModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Xác nhận xóa")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
