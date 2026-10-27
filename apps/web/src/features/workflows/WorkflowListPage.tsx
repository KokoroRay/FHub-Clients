import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Bookmark,
  Eye,
  ArrowRight,
  Code2,
  Palette,
  CheckCircle,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { SharedWorkflow } from '../../types';
import { CreateWorkflowModal } from './CreateWorkflowModal';
import { workflowApi } from '../../services/api/contentApi';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';

export const WorkflowListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shouldOpenCreate = searchParams.get('action') === 'create';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'most_used' | 'most_viewed'>('newest');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(shouldOpenCreate);
  const [workflows, setWorkflows] = useState<SharedWorkflow[]>([]);

  React.useEffect(() => {
    const fetchWfs = async () => {
      try {
        const res = await workflowApi.getWorkflows({ search: searchQuery.trim() || undefined });
        if (res && res.items) {
          const mapped: SharedWorkflow[] = res.items.map((item) => ({
            id: String(item.workflowId),
            title: item.title,
            description: item.summary || item.title,
            courseCode: 'PRN211',
            technology: '.NET / C#',
            steps: [
              { stepNumber: 1, title: 'Bước 1: Khởi tạo', instruction: 'Thực hiện các bước quy trình', codeSnippet: 'dotnet build', language: 'bash' }
            ],
            author: {
              id: String(item.authorUserId),
              fullName: 'Sinh viên FPT',
              role: 'Student',
              campus: 'FU',
            },
            viewsCount: 0,
            usageCount: 0,
            tags: ['dotnet', 'workflow'],
            createdAt: item.createdAt || new Date().toISOString(),
          }));
          setWorkflows(mapped);
        }
      } catch (err) {
        setWorkflows([]);
      }
    };
    fetchWfs();
  }, [searchQuery]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getCategoryTheme = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'ui/ux':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <Palette className="w-3 h-3 text-purple-600" />,
        };
      case 'testing':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <CheckCircle className="w-3 h-3 text-amber-600" />,
        };
      case 'productivity':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Clock className="w-3 h-3 text-emerald-600" />,
        };
      default:
        return {
          bg: 'bg-blue-50 text-[#0076D1] border-blue-200',
          icon: <Code2 className="w-3 h-3 text-[#0076D1]" />,
        };
    }
  };

  const filteredWorkflows = workflows
    .filter((wf) => {
      const matchCat =
        selectedCategory === 'ALL' ||
        (wf.category && wf.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchCourse =
        selectedCourse === 'ALL' ||
        wf.courseCode.toLowerCase() === selectedCourse.toLowerCase();
      const matchSearch =
        wf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wf.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wf.technology.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wf.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchCourse && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'most_used') return b.usageCount - a.usageCount;
      if (sortBy === 'most_viewed') return b.viewsCount - a.viewsCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      {/* 1. Header Section (Figma #94:5625) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#181C22] tracking-tight">
              Shared Workflows
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0076D1] border border-blue-100">
              {filteredWorkflows.length} Workflows
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#404753] mt-1">
            Discover, review, and reuse structured academic workflows shared by the FHub Community.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* 2. Search & Filters Unified Toolbar (Figma #94:5648) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows by title, description, or tag..."
            className="w-full bg-[#F8F9FF] border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1]"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Development">Development</option>
              <option value="UI/UX">UI/UX</option>
              <option value="Testing">Testing</option>
              <option value="Productivity">Productivity</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Course Dropdown */}
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
            >
              <option value="ALL">All Courses</option>
              <option value="SWP391">SWP391</option>
              <option value="PRN211">PRN211</option>
              <option value="SWE201">SWE201</option>
              <option value="PRM392">PRM392</option>
              <option value="General">General</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="most_used">Sort: Most Applied</option>
              <option value="most_viewed">Sort: Most Viewed</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Workflow List Grid (2 Columns) (Figma #94:5684) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorkflows.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No workflows found matching your criteria.
          </div>
        ) : (
          filteredWorkflows.map((wf) => {
            const theme = getCategoryTheme(wf.category);
            const isBookmarked = bookmarkedIds.has(wf.id);

            return (
              <div
                key={wf.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
              >
                {/* Top Row: Badges & Bookmark */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${theme.bg}`}
                      >
                        {theme.icon}
                        <span>{wf.category || 'Development'}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {wf.courseCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => toggleBookmark(wf.id, e)}
                        title={isBookmarked ? 'Unsave workflow' : 'Save workflow'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isBookmarked ? 'fill-[#0076D1] text-[#0076D1]' : ''
                          }`}
                        />
                      </button>
                      <ContentActionMenu
                        targetType="WORKFLOW"
                        targetId={wf.id}
                        targetTitle={wf.title}
                        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/workflows/${wf.id}`}
                      />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <Link
                      to={`/workflows/${wf.id}`}
                      className="font-bold text-base text-[#181C22] hover:text-[#0076D1] transition-colors line-clamp-1 block leading-snug"
                    >
                      {wf.title}
                    </Link>
                    <p className="text-xs text-[#404753] line-clamp-2 mt-1 leading-relaxed">
                      {wf.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Segment: Creator, Stats & Action */}
                <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    {/* Creator Section */}
                    <div className="flex items-center gap-2">
                      {wf.author.avatarUrl ? (
                        <img
                          src={wf.author.avatarUrl}
                          alt={wf.author.fullName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0076D1] flex items-center justify-center font-bold text-xs">
                          {wf.author.fullName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-800 line-clamp-1">
                          {wf.author.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {wf.author.role} · {wf.author.campus || 'CS'}
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 text-slate-500 font-semibold">
                      <span className="flex items-center gap-1" title="Views">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{wf.viewsCount}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[#0076D1]" title="Applications">
                        <Layers className="w-3.5 h-3.5 text-[#0076D1]" />
                        <span>{wf.usageCount}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 text-[11px]">
                      {new Date(wf.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <Link
                      to={`/workflows/${wf.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0076D1] hover:text-[#005DA7] transition-colors"
                    >
                      <span>View Workflow</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
