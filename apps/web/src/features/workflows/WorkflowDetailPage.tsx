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
              <Button variant="outline" className="p-2.5">
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
              <span className="text-blue-600">{workflow.usageCount} lượt áp dụng thành công</span>
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

        {workflow.steps.map((step) => {
          const isDone = completedSteps.includes(step.stepNumber);
          return (
            <Card
              key={step.stepNumber}
              className={`transition-all ${isDone ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10' : ''}`}
            >
              <CardBody className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStepComplete(step.stepNumber)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : step.stepNumber}
                    </button>
                    <div>
                      <h3 className={`font-bold text-sm text-slate-900 dark:text-slate-100 ${isDone ? 'line-through text-slate-400' : ''}`}>
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {step.codeSnippet && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(step.stepNumber, step.codeSnippet)}
                      leftIcon={copiedStep === step.stepNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    >
                      {copiedStep === step.stepNumber ? 'Đã copy' : 'Copy Code'}
                    </Button>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 pl-10 leading-relaxed">
                  {step.description}
                </p>

                {step.codeSnippet && (
                  <div className="ml-10 rounded-xl overflow-hidden bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs shadow-inner">
                    <div className="px-3.5 py-1.5 bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 font-semibold">
                      Bash / Terminal Command
                    </div>
                    <pre className="p-3.5 overflow-x-auto text-slate-200">
                      <code>{step.codeSnippet}</code>
                    </pre>
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
