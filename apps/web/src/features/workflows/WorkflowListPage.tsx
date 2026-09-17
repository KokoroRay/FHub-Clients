import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Workflow,
  Search,
  Plus,
  Play,
  Copy,
  Eye,
  CheckCircle2,
  Layers,
  Terminal,
} from 'lucide-react';
import { mockWorkflows, mockCourses } from '../../services/mockData';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CreateWorkflowModal } from './CreateWorkflowModal';

export const WorkflowListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shouldOpenCreate = searchParams.get('action') === 'create';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(shouldOpenCreate);
  const [workflows, setWorkflows] = useState(mockWorkflows);

  const techs = ['ALL', '.NET 8 / C#', 'React / TypeScript', 'Java / Spring Boot', 'Node.js', 'Python'];

  const filteredWorkflows = workflows.filter((wf) => {
    const matchTech = selectedTech === 'ALL' || wf.technology.includes(selectedTech);
    const matchSearch =
      wf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTech && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header (Figma 46:2831) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Shared Workflows & Starter Kits</span>
            <Badge variant="purple" size="md">{filteredWorkflows.length}</Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quy trình thực hành từng bước, boilerplate code mẫu và hướng dẫn đồ án chuẩn hóa.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Chia sẻ Workflow
        </Button>
      </div>

      {/* Tech Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {techs.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTech(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTech === t
                  ? 'bg-[#005da7] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo môn (PRN211...), công nghệ..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#005da7]"
          />
        </div>
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorkflows.map((wf) => (
          <Card key={wf.id} hoverable className="flex flex-col justify-between">
            <CardBody className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">{wf.courseCode}</Badge>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300 px-2 py-0.5 rounded-md">
                    {wf.technology}
                  </span>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                  <Terminal className="w-3.5 h-3.5" /> {wf.steps.length} Bước
                </span>
              </div>

              <div>
                <Link
                  to={`/workflows/${wf.id}`}
                  className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-[#005da7] transition-colors block leading-snug"
                >
                  {wf.title}
                </Link>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {wf.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {wf.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <img src={wf.author.avatarUrl} alt={wf.author.fullName} className="w-5 h-5 rounded-full object-cover" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{wf.author.fullName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#005da7]">{wf.usageCount.toLocaleString()} lượt áp dụng</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {wf.viewsCount}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <CreateWorkflowModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newWf) => {
          setWorkflows([newWf, ...workflows]);
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
};
