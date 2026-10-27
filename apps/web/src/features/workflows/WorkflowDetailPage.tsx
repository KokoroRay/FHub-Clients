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
} from 'lucide-react';
import { workflowApi } from '../../services/api/contentApi';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const WorkflowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [workflow, setWorkflow] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    const fetchWorkflow = async () => {
      try {
        setIsLoading(true);
        const data = await workflowApi.getWorkflowById(id);
        if (isMounted && data) {
          setWorkflow({
            id: String(data.workflowId),
            title: data.title,
            description: data.summary || '',
            courseCode: 'PRN211',
            technology: '.NET / C#',
            version: (data as any).version || 1,
            author: {
              fullName: `Author #${data.authorUserId || 1}`,
              role: 'Student',
              avatarUrl: '',
            },
            usageCount: 0,
            viewsCount: 0,
            steps: (data.steps || []).map((s: any) => ({
              stepNumber: s.stepNumber,
              title: s.stepTitle || `Bước ${s.stepNumber}`,
              instruction: s.instruction || '',
              codeSnippet: s.codeSnippet || '',
              language: s.language || 'csharp',
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
        Đang tải workflow...
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Không tìm thấy workflow</h3>
        <p className="text-xs text-slate-500">Workflow này không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link to="/workflows" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Workflows
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Back button */}
      <Link to="/workflows" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Workflows
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
              <Button variant="primary" leftIcon={<Play className="w-4 h-4" />}>
                Áp dụng Workflow
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
                <span className="text-[10px] text-slate-400 block">{workflow.author.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 font-semibold">
              <span className="text-blue-600">{workflow.usageCount} lượt áp dụng</span>
              <span>{workflow.viewsCount} lượt xem</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Steps Execution Guide */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            <span>Các bước thực hiện chi tiết ({workflow.steps.length} bước)</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Tiến độ: {completedSteps.length} / {workflow.steps.length} hoàn thành
          </span>
        </div>

        {workflow.steps.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            Workflow này chưa có bước thực hiện chi tiết nào.
          </div>
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
                      Step {step.stepNumber}
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
                          <span>{copiedStep === step.stepNumber ? 'Đã sao chép' : 'Sao chép'}</span>
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
    </div>
  );
};
