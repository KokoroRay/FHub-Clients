import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  Search, 
  Trash2, 
  FileText, 
  Workflow, 
  HelpCircle, 
  BookOpen, 
  ExternalLink, 
  CheckCircle, 
  ShieldCheck, 
  Download,
  Filter,
  Check
} from 'lucide-react';

interface BookmarkItem {
  id: string;
  type: 'question' | 'article' | 'material' | 'workflow';
  typeLabel: string;
  typeColor: string;
  title: string;
  summary: string;
  savedTime: string;
  url: string;
  tags: string[];
  courseCode?: string;
  votes?: number;
  answers?: number;
  isSolved?: boolean;
  downloads?: number;
  fileFormat?: string;
  fileSize?: string;
  isVerified?: boolean;
}

const INITIAL_BOOKMARKS: BookmarkItem[] = [
  {
    id: 'bm-1',
    type: 'question',
    typeLabel: 'QUESTION',
    typeColor: 'bg-blue-50 text-[#0076D1] border-blue-100',
    title: 'How to handle async operations in WinForms?',
    summary: 'Understanding async/await and avoiding UI thread blocking when running long database operations with Entity Framework Core and background progress…',
    savedTime: 'Saved 2 hours ago',
    url: '/discussions/1',
    tags: ['#async-programming', 'WinForms'],
    courseCode: 'PRN211',
    votes: 8,
    answers: 3,
    isSolved: true,
  },
  {
    id: 'bm-2',
    type: 'article',
    typeLabel: 'ARTICLE',
    typeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    title: 'Clean Architecture in ASP.NET Core',
    summary: 'A practical overview of organizing a maintainable .NET application following domain-driven patterns, inversion of control, and testing strategies.',
    savedTime: 'Saved Yesterday',
    url: '/articles/1',
    tags: ['Backend Development', 'C#', 'ASP.NET'],
    votes: 45,
  },
  {
    id: 'bm-3',
    type: 'material',
    typeLabel: 'STUDY MATERIAL',
    typeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    title: 'PRN211 Programming Notes',
    summary: 'A concise collection of course notes, WinForms design samples, LINQ cheat sheets, and practical assignment prep code snippets for midterm revision.',
    savedTime: 'Saved 2 days ago',
    url: '/materials/1',
    tags: ['Midterm Revision', 'LINQ'],
    courseCode: 'PRN211',
    downloads: 142,
    fileFormat: 'PDF',
    fileSize: '2.4 MB',
    isVerified: true,
  },
  {
    id: 'bm-4',
    type: 'question',
    typeLabel: 'QUESTION',
    typeColor: 'bg-blue-50 text-[#0076D1] border-blue-100',
    title: 'Best practices for Entity Framework Core queries',
    summary: 'Tips for writing efficient and maintainable database queries, preventing Cartesian explosions with AsSplitQuery, and avoiding the N+1 select problem.',
    savedTime: 'Saved 3 days ago',
    url: '/discussions/2',
    tags: ['EF Core', 'Database'],
    courseCode: 'PRN211',
    votes: 12,
    answers: 5,
    isSolved: true,
  },
  {
    id: 'bm-5',
    type: 'workflow',
    typeLabel: 'WORKFLOW',
    typeColor: 'bg-purple-50 text-purple-700 border-purple-100',
    title: 'ASP.NET Core REST API Pipeline with JWT & Swagger',
    summary: 'Step-by-step verified workflow for initializing an ASP.NET 8 Web API project with clean token-based authentication and database migrations.',
    savedTime: 'Saved 4 days ago',
    url: '/workflows/1',
    tags: ['Web API', 'JWT'],
    courseCode: 'SWP391',
    votes: 28,
  },
];

import { bookmarkApi } from '../../services/api/studentApi';

export const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(INITIAL_BOOKMARKS);
  const [activeTab, setActiveTab] = useState<'all' | 'question' | 'article' | 'material' | 'workflow'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'votes'>('recent');

  React.useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const typeParam = activeTab !== 'all' ? activeTab.toUpperCase() : undefined;
        const res = await bookmarkApi.getBookmarks(typeParam);
        if (res && res.length > 0) {
          const mapped: BookmarkItem[] = res.map((b) => ({
            id: String(b.id),
            type: (b.targetType.toLowerCase() as any) || 'article',
            typeLabel: b.targetType || 'ARTICLE',
            typeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            title: b.title || `Bookmark #${b.id}`,
            summary: b.summary || 'Nội dung đã lưu vào dấu trang cá nhân.',
            savedTime: new Date(b.createdAt).toLocaleDateString('vi-VN'),
            url: b.targetType === 'ARTICLE' ? `/articles/${b.targetId}` : b.targetType === 'WORKFLOW' ? `/workflows/${b.targetId}` : `/discussions/${b.targetId}`,
            tags: ['saved'],
          }));
          setBookmarks([...mapped, ...INITIAL_BOOKMARKS]);
        }
      } catch (err) {
        console.warn('Backend bookmarks notice:', err);
      }
    };
    fetchBookmarks();
  }, [activeTab]);

  const counts = {
    all: bookmarks.length,
    question: bookmarks.filter(b => b.type === 'question').length,
    article: bookmarks.filter(b => b.type === 'article').length,
    material: bookmarks.filter(b => b.type === 'material').length,
    workflow: bookmarks.filter(b => b.type === 'workflow').length,
  };

  const handleRemoveBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks(prev => prev.filter(b => b.id !== id));
    bookmarkApi.removeBookmark(id).catch(err => console.warn('Remove bookmark notice:', err));
  };

  const filteredBookmarks = bookmarks.filter(b => {
    if (activeTab !== 'all' && b.type !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q)) ||
        (b.courseCode && b.courseCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Page Header (Figma #93:3918) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-[#181C22]">My Bookmarks</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF5FF] text-[#0076D1] border border-[#BFDBFE]">
              {bookmarks.length} saved items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Your saved curriculum questions, guides, and study materials, organized for seamless revision.
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 shadow-2xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Synced across all your devices</span>
        </div>
      </div>

      {/* Main 2-column Grid (List + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Controls Bar: Category Tabs & Search */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All', count: counts.all },
                { id: 'question', label: 'Questions', count: counts.question },
                { id: 'article', label: 'Articles', count: counts.article },
                { id: 'material', label: 'Study Materials', count: counts.material },
                { id: 'workflow', label: 'Workflows', count: counts.workflow },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#0076D1] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-blue-400 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search saved items by title, tag, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-700"
              >
                <option value="recent">Recently Saved</option>
                <option value="votes">Most Upvoted</option>
              </select>
            </div>
          </div>

          {/* Bookmarks List Container */}
          {filteredBookmarks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100 shadow-xs">
              <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold text-slate-700">No saved bookmarks found</p>
              <p className="text-xs text-slate-400 mt-1">Bookmark questions, articles, and study materials to revise them here anytime.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredBookmarks.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:border-slate-200 transition-all space-y-3 group"
                >
                  {/* Top Meta Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${item.typeColor}`}>
                        {item.typeLabel}
                      </span>
                      {item.courseCode && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.courseCode}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {item.savedTime}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleRemoveBookmark(item.id, e)}
                      title="Remove bookmark"
                      className="p-1.5 text-[#0076D1] hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <Link
                      to={item.url}
                      className="text-base font-bold text-[#181C22] group-hover:text-[#0076D1] transition-colors block line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                  </div>

                  {/* Bottom Badges & Metrics Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-50 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md text-[11px] bg-slate-50 text-slate-600 border border-slate-200">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 font-medium">
                      {item.votes !== undefined && (
                        <span>{item.votes} votes</span>
                      )}
                      {item.answers !== undefined && (
                        <span>{item.answers} answers</span>
                      )}
                      {item.isSolved && (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Solved
                        </span>
                      )}
                      {item.fileFormat && (
                        <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                          {item.fileFormat} {item.fileSize}
                        </span>
                      )}
                      {item.downloads !== undefined && (
                        <span>{item.downloads} downloads</span>
                      )}
                      {item.isVerified && (
                        <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#0076D1]" />
                          Verified by Lecturer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Bookmark Tips & Sync Status (Figma #93:4118) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#0076D1]" />
              <span>Bookmark Tips</span>
            </h3>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-800 mb-1">Exam & Milestone Sprint</p>
                <p className="text-[11px] text-slate-500">
                  Save useful questions and sample code for quick revision during exam weeks and assignment checkpoints.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-800 mb-1">Topic Filtering</p>
                <p className="text-[11px] text-slate-500">
                  Use category filters to quickly organize your study sessions between code snippets, workflows, and slide PDFs.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-800 mb-1">Focused Feed</p>
                <p className="text-[11px] text-slate-500">
                  Remove bookmarks when no longer needed to maintain a focused study feed and free up offline storage.
                </p>
              </div>
            </div>

            {/* Offline Sync Card */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  SYNC STATUS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Offline Access Ready
              </p>
            </div>

            {/* Enrolled Courses Box */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-slate-600 leading-relaxed">
              Saved materials are automatically categorized under your enrolled courses <strong className="text-slate-800">PRN211</strong> & <strong className="text-slate-800">SWP391</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
