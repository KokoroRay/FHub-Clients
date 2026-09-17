import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Workflow,
  Copy,
  Check,
  Play,
  ArrowLeft,
  Terminal,
  Share2,
  Bookmark,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { mockWorkflows } from '../../services/mockData';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const WorkflowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workflow = mockWorkflows.find((w) => w.id === id) || mockWorkflows[0];

  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link to="/workflows" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#005da7] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Workflows
      </Link>

      {/* Header Info (Figma 46:4058) */}
      <Card>
        <CardBody className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="md">{workflow.courseCode}</Badge>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300 px-2.5 py-1 rounded-lg">
                  {workflow.technology}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {workflow.title}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                {workflow.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="primary" leftIcon={<Play className="w-4 h-4" />}>
                Áp dụng Workflow
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <img src={workflow.author.avatarUrl} alt={workflow.author.fullName} className="w-8 h-8 rounded-full object-cover" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{workflow.author.fullName}</span>
                <span className="text-[10px] text-slate-400 block">{workflow.author.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 font-semibold">
              <span className="text-[#005da7]">{workflow.usageCount} lượt áp dụng thành công</span>
              <span>{workflow.viewsCount} lượt xem</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Steps Execution Guide */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#005da7]" />
            <span>Các bước thực hiện chi tiết ({workflow.steps.length} bước)</span>
          </h2>
          <span className="text-xs text-slate-400">
            Tiến độ: {completedSteps.length} / {workflow.steps.length} hoàn thành
          </span>
        </div>

        {workflow.steps.map((step) => {
          const isDone = completedSteps.includes(step.stepNumber);
          return (
            <Card
              key={step.stepNumber}
              className={`transition-all ${isDone ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20' : ''}`}
            >
              <CardBody className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStepComplete(step.stepNumber)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs cursor-pointer transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#cfe1fe] text-[#005da7] hover:bg-[#aecefe]'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : step.stepNumber}
                    </button>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {step.title}
                    </h3>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Bước {step.stepNumber}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-10">
                  {step.instruction}
                </p>

                {step.codeSnippet && (
                  <div className="pl-10">
                    <div className="relative bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
                        <span>{step.language || 'code'}</span>
                        <button
                          onClick={() => handleCopyCode(step.stepNumber, step.codeSnippet)}
                          className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          {copiedStep === step.stepNumber ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Đã sao chép!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap">{step.codeSnippet}</pre>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
