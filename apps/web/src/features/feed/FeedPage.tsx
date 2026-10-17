import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Code,
  FileText,
  Star,
  Upload,
  Link2,
  MessageSquare,
  LifeBuoy,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Bookmark,
  Share2,
  CheckCircle2,
  Bell,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCampuses } from '../../services/mockData';
import { AskQuestionModal } from '../discussions/AskQuestionModal';
import { QuestionPost } from '../../types';

export const FeedPage: React.FC = () => {
  const { currentUser, currentCampus } = useAuth();
  const campusObj = mockCampuses.find((c) => c.code === currentCampus) || mockCampuses[0];
  const navigate = useNavigate();

  const [questionTab, setQuestionTab] = useState<'recent' | 'voted' | 'unanswered'>('recent');
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Vote states for questions
  const [votes, setVotes] = useState<Record<string, { count: number; userVote: 'UP' | 'DOWN' | null }>>({
    'q-1': { count: 142, userVote: null },
    'q-2': { count: 58, userVote: null },
    'q-3': { count: 34, userVote: null },
  });

  const handleVote = (id: string, dir: 'UP' | 'DOWN') => {
    setVotes((prev) => {
      const current = prev[id] || { count: 0, userVote: null };
      let newCount = current.count;
      let newVote: 'UP' | 'DOWN' | null = dir;

      if (current.userVote === dir) {
        newVote = null;
        newCount += dir === 'UP' ? -1 : 1;
      } else if (current.userVote === null) {
        newCount += dir === 'UP' ? 1 : -1;
      } else {
        newCount += dir === 'UP' ? 2 : -2;
      }
      return { ...prev, [id]: { count: newCount, userVote: newVote } };
    });
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const studentName = currentUser?.fullName || 'Nguyen Hoang Minh';
  const studentInitials = studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'NH';

  return (
    <div className="space-y-6">
      {/* 3.A Welcome Header (Figma #86:118) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0076D1] border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0076D1]" />
            <span>Spring 2025 • {campusObj.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back to FHub
          </h1>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Learn, collaborate, share knowledge, and grow with your academic community.
          </p>
        </div>

        {/* Right user badge */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 px-4 rounded-xl border border-slate-100">
          <div className="w-9 h-9 rounded-full bg-[#0076D1] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 shrink-0">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={studentName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{studentInitials}</span>
            )}
          </div>
          <div className="text-left">
            <span className="block text-[10px] text-slate-400 font-medium">Logged in as</span>
            <span className="block text-xs font-bold text-slate-800 leading-tight">{studentName}</span>
          </div>
        </div>
      </div>

      {/* 3.B Quick Actions Grid (8 specific actions only) (Figma #86:137) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          QUICK ACTIONS
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {/* 1. Ask Question */}
          <button
            onClick={() => setIsAskModalOpen(true)}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0076D1] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              Ask<br />Question
            </span>
          </button>

          {/* 2. New Workflow */}
          <button
            onClick={() => navigate('/workflows?action=create')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white rounded-xl border border-slate-200/90 hover:border-indigo-400 hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Code className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              New<br />Workflow
            </span>
          </button>

          {/* 3. Write Article */}
          <button
            onClick={() => navigate('/articles/create')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white rounded-xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              Write<br />Article
            </span>
          </button>

          {/* 4. Write Course Evaluation */}
          <button
            onClick={() => navigate('/course-evaluations?action=create')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white rounded-xl border border-slate-200/90 hover:border-amber-400 hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Star className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              Write<br />Evaluation
            </span>
          </button>

          {/* 5. Upload Study Material */}
          <button
            onClick={() => navigate('/materials?action=upload')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white rounded-xl border border-slate-200/90 hover:border-rose-400 hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              Upload<br />Material
            </span>
          </button>

          {/* 6. Add External Material Link */}
          <button
            onClick={() => navigate('/materials?action=add-link')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white rounded-xl border border-slate-200/90 hover:border-purple-400 hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Link2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              Add<br />Link
            </span>
          </button>

          {/* 7. New Conversation */}
          <button
            onClick={() => navigate('/messages?action=new')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white rounded-xl border border-slate-200/90 hover:border-cyan-400 hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              New<br />Chat
            </span>
          </button>

          {/* 8. Create Support Ticket */}
          <button
            onClick={() => navigate('/tickets?action=create')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white rounded-xl border border-slate-200/90 hover:border-slate-400 hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              Support<br />Ticket
            </span>
          </button>
        </div>
      </div>

      {/* 3.C Questions & Discussions (Primary Feed Section) (Figma #86:196) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Section Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0076D1] flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Questions & Discussions
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
              <button
                onClick={() => setQuestionTab('recent')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  questionTab === 'recent' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setQuestionTab('voted')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  questionTab === 'voted' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Most Voted
              </button>
              <button
                onClick={() => setQuestionTab('unanswered')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  questionTab === 'unanswered' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Unanswered
              </button>
            </div>

            <button
              onClick={() => setIsAskModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <span>Ask Question</span>
            </button>
          </div>
        </div>

        {/* Question Cards (Figma #86:215) */}
        <div className="divide-y divide-slate-100">
          {/* Question 1 */}
          <div className="p-5 flex items-start gap-4 hover:bg-slate-50/60 transition-colors">
            {/* Vote Counter */}
            <div className="flex flex-col items-center bg-slate-50 border border-slate-200/80 rounded-xl p-1 shrink-0">
              <button
                onClick={() => handleVote('q-1', 'UP')}
                className={`p-1 rounded hover:bg-slate-200/60 cursor-pointer transition-colors ${
                  votes['q-1']?.userVote === 'UP' ? 'text-[#0076D1] font-bold' : 'text-slate-400'
                }`}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-700 my-0.5">
                {votes['q-1']?.count || 142}
              </span>
              <button
                onClick={() => handleVote('q-1', 'DOWN')}
                className={`p-1 rounded hover:bg-slate-200/60 cursor-pointer transition-colors ${
                  votes['q-1']?.userVote === 'DOWN' ? 'text-rose-600 font-bold' : 'text-slate-400'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">@duc_anh_swe</span>
                  <span className="text-slate-400">• 4 hours ago</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-[#0076D1] border border-blue-100">
                  [PRN211]
                </span>
              </div>

              <Link
                to="/discussions/q-1"
                className="block text-sm font-bold text-slate-900 hover:text-[#0076D1] transition-colors leading-snug"
              >
                Help understanding async/await lifecycle in WinForms threading?
              </Link>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                I'm struggling to keep the UI responsive while making database calls through Entity Framework. Whenever I call async tasks, the UI locks up unexpectedly...
              </p>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    12 answers
                  </span>
                  <button
                    onClick={() => toggleBookmark('q-1')}
                    className={`flex items-center gap-1 hover:text-[#0076D1] cursor-pointer transition-colors ${
                      bookmarkedIds.has('q-1') ? 'text-[#0076D1] font-bold' : ''
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Bookmark</span>
                  </button>
                </div>
                <Link to="/discussions/q-1" className="text-xs font-semibold text-[#0076D1] hover:underline flex items-center gap-1">
                  View Question <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Question 2 */}
          <div className="p-5 flex items-start gap-4 hover:bg-slate-50/60 transition-colors">
            {/* Vote Counter */}
            <div className="flex flex-col items-center bg-slate-50 border border-slate-200/80 rounded-xl p-1 shrink-0">
              <button
                onClick={() => handleVote('q-2', 'UP')}
                className={`p-1 rounded hover:bg-slate-200/60 cursor-pointer transition-colors ${
                  votes['q-2']?.userVote === 'UP' ? 'text-[#0076D1] font-bold' : 'text-slate-400'
                }`}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-700 my-0.5">
                {votes['q-2']?.count || 58}
              </span>
              <button
                onClick={() => handleVote('q-2', 'DOWN')}
                className={`p-1 rounded hover:bg-slate-200/60 cursor-pointer transition-colors ${
                  votes['q-2']?.userVote === 'DOWN' ? 'text-rose-600 font-bold' : 'text-slate-400'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">@minh_fpt</span>
                  <span className="text-slate-400">• 8 hours ago</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  [SWE201]
                </span>
              </div>

              <Link
                to="/discussions/q-2"
                className="block text-sm font-bold text-slate-900 hover:text-[#0076D1] transition-colors leading-snug"
              >
                What is the standard format for Non-Functional Requirement documentation in SWE201?
              </Link>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                Our team is drafting the SRS document for SWE201. Should usability and security requirements follow the FURPS+ template or standard IEEE 830?
              </p>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    7 answers
                  </span>
                  <button
                    onClick={() => toggleBookmark('q-2')}
                    className={`flex items-center gap-1 hover:text-[#0076D1] cursor-pointer transition-colors ${
                      bookmarkedIds.has('q-2') ? 'text-[#0076D1] font-bold' : ''
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Bookmark</span>
                  </button>
                </div>
                <Link to="/discussions/q-2" className="text-xs font-semibold text-[#0076D1] hover:underline flex items-center gap-1">
                  View Question <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Question 3 */}
          <div className="p-5 flex items-start gap-4 hover:bg-slate-50/60 transition-colors">
            {/* Vote Counter */}
            <div className="flex flex-col items-center bg-slate-50 border border-slate-200/80 rounded-xl p-1 shrink-0">
              <button
                onClick={() => handleVote('q-3', 'UP')}
                className={`p-1 rounded hover:bg-slate-200/60 cursor-pointer transition-colors ${
                  votes['q-3']?.userVote === 'UP' ? 'text-[#0076D1] font-bold' : 'text-slate-400'
                }`}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-700 my-0.5">
                {votes['q-3']?.count || 34}
              </span>
              <button
                onClick={() => handleVote('q-3', 'DOWN')}
                className={`p-1 rounded hover:bg-slate-200/60 cursor-pointer transition-colors ${
                  votes['q-3']?.userVote === 'DOWN' ? 'text-rose-600 font-bold' : 'text-slate-400'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">@khanh_dev</span>
                  <span className="text-slate-400">• 1 day ago</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-100">
                  [DBI202]
                </span>
              </div>

              <Link
                to="/discussions/q-3"
                className="block text-sm font-bold text-slate-900 hover:text-[#0076D1] transition-colors leading-snug"
              >
                Best practices for indexing foreign keys and composite keys in SQL Server
              </Link>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                When dealing with high cardinality queries in DBI202 practical labs, how do non-clustered indexes affect write execution performance?
              </p>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    5 answers
                  </span>
                  <button
                    onClick={() => toggleBookmark('q-3')}
                    className={`flex items-center gap-1 hover:text-[#0076D1] cursor-pointer transition-colors ${
                      bookmarkedIds.has('q-3') ? 'text-[#0076D1] font-bold' : ''
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Bookmark</span>
                  </button>
                </div>
                <Link to="/discussions/q-3" className="text-xs font-semibold text-[#0076D1] hover:underline flex items-center gap-1">
                  View Question <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: View All Link */}
        <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 text-center">
          <Link
            to="/discussions"
            className="text-xs font-bold text-[#0076D1] hover:underline inline-flex items-center gap-1.5"
          >
            <span>View All Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3.D Mid-Feed 2-Column Grid (Workflows & Articles) (Figma #86:332) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Shared Workflows */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Recent Shared Workflows</h3>
              </div>
              <button
                onClick={() => navigate('/workflows?action=create')}
                className="text-xs font-bold text-[#0076D1] hover:underline cursor-pointer"
              >
                + New Workflow
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
                <Link to="/workflows/wf-1" className="font-bold text-xs text-slate-800 hover:text-blue-600 block leading-snug">
                  ASP.NET Core Web API + PostgreSQL Boilerplate
                </Link>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  By @dev_master • Dockerized local environment with clean architecture setup.
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700">#dotnet</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700">#csharp</span>
                  </div>
                  <Link to="/workflows/wf-1" className="text-[11px] font-semibold text-[#0076D1] hover:underline">
                    View →
                  </Link>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
                <Link to="/workflows/wf-2" className="font-bold text-xs text-slate-800 hover:text-blue-600 block leading-snug">
                  Automated Unit Testing with xUnit & Moq
                </Link>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  By @fpt_tester • Ready-to-use testing pipeline with coverage metrics.
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700">#testing</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700">#dotnet</span>
                  </div>
                  <Link to="/workflows/wf-2" className="text-[11px] font-semibold text-[#0076D1] hover:underline">
                    View →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <Link to="/workflows" className="text-xs font-bold text-[#0076D1] hover:underline inline-flex items-center gap-1">
              <span>View All Workflows</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Recent Articles */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Recent Articles</h3>
              </div>
              <button
                onClick={() => navigate('/articles/create')}
                className="text-xs font-bold text-[#0076D1] hover:underline cursor-pointer"
              >
                + Write Article
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
                <Link to="/articles/art-1" className="font-bold text-xs text-slate-800 hover:text-blue-600 block leading-snug">
                  Mastering LINQ in C#: From Basics to Advanced Expression Trees
                </Link>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  By @linh_lecturer • A comprehensive guide to understanding deferred execution.
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">6 min read • 82 reads</span>
                  <Link to="/articles/art-1" className="font-semibold text-[#0076D1] hover:underline">
                    Read →
                  </Link>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
                <Link to="/articles/art-2" className="font-bold text-xs text-slate-800 hover:text-blue-600 block leading-snug">
                  Demystifying Agile Requirements & User Story Mapping
                </Link>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  By @sarah_pm • Practical examples tailored for FPT software project submissions.
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">4 min read • 54 reads</span>
                  <Link to="/articles/art-2" className="font-semibold text-[#0076D1] hover:underline">
                    Read →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <Link to="/articles" className="text-xs font-bold text-[#0076D1] hover:underline inline-flex items-center gap-1">
              <span>View All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3.E Lower Mid-Feed 2-Column Grid (Study Materials & Course Hub Shortcut) (Figma #86:425) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Study Materials */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-900">Study Materials</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/materials?action=upload')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-[#0076D1] hover:bg-blue-100 cursor-pointer"
                >
                  Upload
                </button>
                <button
                  onClick={() => navigate('/materials?action=add-link')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Add Link
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">PDF</span>
                  <div className="truncate">
                    <h5 className="font-bold text-xs text-slate-800 truncate">PRN211_Complete_Summary_Cheatsheet.pdf</h5>
                    <p className="text-[10px] text-slate-400">Course: PRN211 • By @hoang_nam</p>
                  </div>
                </div>
                <Link to="/materials" className="text-xs font-bold text-[#0076D1] hover:underline ml-2 shrink-0">
                  Download
                </Link>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">DOCX</span>
                  <div className="truncate">
                    <h5 className="font-bold text-xs text-slate-800 truncate">SWE201_SRS_Template_Standard_2025.docx</h5>
                    <p className="text-[10px] text-slate-400">Course: SWE201 • By @admin_office</p>
                  </div>
                </div>
                <Link to="/materials" className="text-xs font-bold text-[#0076D1] hover:underline ml-2 shrink-0">
                  Download
                </Link>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">LINK</span>
                  <div className="truncate">
                    <h5 className="font-bold text-xs text-slate-800 truncate">DBI202 SQL Server Sample Database Script</h5>
                    <p className="text-[10px] text-slate-400">Course: DBI202 • By @tuan_db</p>
                  </div>
                </div>
                <Link to="/materials" className="text-xs font-bold text-[#0076D1] hover:underline ml-2 shrink-0">
                  Open
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <Link to="/materials" className="text-xs font-bold text-[#0076D1] hover:underline inline-flex items-center gap-1">
              <span>View All Materials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Course Hub Shortcut */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0076D1]" />
                <h3 className="font-bold text-sm text-slate-900">Course Hub Shortcut</h3>
              </div>
              <Link to="/courses" className="text-xs font-bold text-[#0076D1] hover:underline">
                Browse Courses →
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-100 text-blue-800">PRN211</span>
                    <h5 className="font-bold text-xs text-slate-800">Basic Cross-Platform App Programming</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">3 Credits • C#, .NET Architecture, WPF & MAUI</p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Enrolled
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-100 text-indigo-800">SWE201</span>
                    <h5 className="font-bold text-xs text-slate-800">Software Requirements</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">3 Credits • Requirements elicitation & validation</p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Enrolled
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-100 text-purple-800">DBI202</span>
                    <h5 className="font-bold text-xs text-slate-800">Database Systems</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">3 Credits • Relational algebra, SQL design & indexing</p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Enrolled
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] font-medium text-slate-400">Enrolled in 3 Active Course Nodes</span>
          </div>
        </div>
      </div>

      {/* 3.F Bottom 2-Column Grid (Course Evaluations & Recent Conversations) (Figma #86:532) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Course Evaluations */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">Course Evaluations</h3>
              </div>
              <button
                onClick={() => navigate('/course-evaluations?action=create')}
                className="text-xs font-bold text-[#0076D1] hover:underline cursor-pointer"
              >
                + Write Evaluation
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700">PRN211</span>
                  <span className="text-[10px] text-slate-400">Feb 2025</span>
                </div>
                <h5 className="font-bold text-xs text-slate-800">Comprehensive review on Assignment 1 & 2 difficulty</h5>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  "Great coverage of WPF and asynchronous programming. Practical exam requires speed in creating data access layers..."
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700">SWE201</span>
                  <span className="text-[10px] text-slate-400">Jan 2025</span>
                </div>
                <h5 className="font-bold text-xs text-slate-800">Tips for scoring high on SRS document presentations</h5>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  "Focus heavily on traceability matrix and clear use-case diagrams with correct UML syntax."
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <Link to="/course-evaluations" className="text-xs font-bold text-[#0076D1] hover:underline inline-flex items-center gap-1">
              <span>View All Evaluations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Recent Conversations */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-600" />
                <h3 className="font-bold text-sm text-slate-900">Recent Conversations</h3>
              </div>
              <Link to="/messages" className="text-xs font-bold text-[#0076D1] hover:underline">
                View All Messages →
              </Link>
            </div>

            <div className="space-y-2.5">
              <Link to="/messages" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0076D1] font-bold text-xs flex items-center justify-center shrink-0">
                    DA
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-xs text-slate-800">Duc Anh (SWE)</h5>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0076D1]" />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">Did you commit the updated database connection string yet?</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">12m ago</span>
              </Link>

              <Link to="/messages" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                    TB
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-xs text-slate-800">Thao Binh</h5>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0076D1]" />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">Thanks for sharing the PRN211 test script, it worked!</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">1h ago</span>
              </Link>

              <Link to="/messages" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                    QL
                  </div>
                  <div className="truncate">
                    <h5 className="font-bold text-xs text-slate-800">Quoc Lam</h5>
                    <p className="text-[11px] text-slate-500 truncate">Are we meeting tomorrow at the library at 2 PM?</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">1d ago</span>
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] font-medium text-slate-400">2 unread conversations</span>
          </div>
        </div>
      </div>

      {/* 3.G Additional Preview Row (Notifications Preview & Support Shortcut) (Figma #86:629) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Preview (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#0076D1]" />
                <h3 className="font-bold text-sm text-slate-900">Notifications Preview</h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Link to="/settings" className="text-slate-500 hover:text-slate-800">
                  Delivery Settings
                </Link>
                <Link to="/notifications" className="font-bold text-[#0076D1] hover:underline">
                  View All Notifications →
                </Link>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#0076D1] shrink-0" />
                  <p className="text-xs text-slate-800 truncate">
                    <strong>@mr.binh (Lecturer)</strong> replied to your discussion on WinForms.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">25m ago</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <p className="text-xs text-slate-800 truncate">
                    15 students upvoted your shared workflow <strong>".NET Microservices Setup"</strong>.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">3h ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Helpdesk Shortcut (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <LifeBuoy className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-sm text-slate-900">Support Helpdesk</h3>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Ticket Status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0 Open Issues
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Need help with academic credentials, course mapping, or forum policy?
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/tickets')}
              className="py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              View Tickets
            </button>
            <button
              onClick={() => navigate('/tickets?action=create')}
              className="py-2 text-xs font-bold rounded-lg bg-[#0076D1] hover:bg-[#005DA7] text-white transition-colors cursor-pointer shadow-2xs"
            >
              Create Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onCreated={(newQ: QuestionPost) => {
          setIsAskModalOpen(false);
          navigate(`/discussions/${newQ.id}`);
        }}
      />
    </div>
  );
};
