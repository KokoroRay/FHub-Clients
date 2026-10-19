import React, { useState, useMemo, useEffect } from 'react';

import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Check,
  RotateCcw,
  Radio,
  Eye,
} from 'lucide-react';
import { QuestionPost } from '../../types';
import { AskQuestionModal } from './AskQuestionModal';
import { questionApi } from '../../services/api/contentApi';

export const QuestionListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTag = searchParams.get('tag');
  const shouldOpenCreate = searchParams.get('action') === 'create';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTag || 'ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'upvoted' | 'answers'>('recent');
  const [isCreateOpen, setIsCreateOpen] = useState(shouldOpenCreate);
  const [questions, setQuestions] = useState<QuestionPost[]>([]);
  const [votesState, setVotesState] = useState<Record<string, { score: number; userVote: 'UP' | 'DOWN' | null }>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchQuestions = async () => {
      try {
        const res = await questionApi.getQuestions({
          search: searchQuery.trim() || undefined,
          sortBy: sortBy === 'upvoted' ? 'upvotes' : sortBy === 'answers' ? 'answers' : 'created_at',
          pageSize: 50,
        });
        if (isMounted) {
          const items = res?.items || [];
          const mapped: QuestionPost[] = items.map((item) => ({
            id: String(item.questionId),
            title: item.title,
            content: item.body,
            courseCode: item.courseId ? `COURSE-${item.courseId}` : undefined,
            author: {
              id: String(item.authorUserId || 'anon'),
              fullName: item.isAnonymous ? 'Ẩn danh FPTer' : (item.authorDisplayName || 'Sinh viên FHub'),
              role: 'Student',
              karma: 0,
              campus: '',
              isAnonymous: item.isAnonymous,
            },
            tags: item.semanticTagIds?.map((t) => `tag-${t}`) || ['qa'],
            upvotes: item.upvoteCount || 0,
            downvotes: item.downvoteCount || 0,
            answersCount: item.answerCount || 0,
            viewsCount: item.viewCount || 0,
            isSolved: item.hasBestAnswer || item.status === 'RESOLVED',
            isLocked: item.areCommentsLocked || false,
            isPinned: item.isPinned || false,
            createdAt: item.createdAt || new Date().toISOString(),
          }));
          setQuestions(mapped);
        }
      } catch (err) {
        if (isMounted) setQuestions([]);
      }
    };
    fetchQuestions();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, sortBy]);

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [questions]);

  const handleVote = (id: string, dir: 'UP' | 'DOWN', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = votesState[id] || {
      score: questions.find((q) => q.id === id)?.upvotes || 0,
      userVote: questions.find((q) => q.id === id)?.userVote || null,
    };

    let newVote: 'UP' | 'DOWN' | null = dir;
    let newScore = current.score;

    if (current.userVote === dir) {
      newVote = null;
      newScore += dir === 'UP' ? -1 : 1;
    } else if (current.userVote === null) {
      newVote = dir;
      newScore += dir === 'UP' ? 1 : -1;
    } else {
      newVote = dir;
      newScore += dir === 'UP' ? 2 : -2;
    }

    setVotesState((prev) => ({
      ...prev,
      [id]: { score: newScore, userVote: newVote },
    }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusTab('all');
    setSelectedCourse('ALL');
    setSelectedTopic('ALL');
    setSortBy('recent');
  };

  const filteredQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        const matchSearch =
          q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (q.courseCode && q.courseCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
          q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchStatus =
          statusTab === 'all'
            ? true
            : statusTab === 'answered'
            ? q.answersCount > 0
            : q.answersCount === 0;

        const matchCourse =
          selectedCourse === 'ALL' ||
          (q.courseCode && q.courseCode.toLowerCase() === selectedCourse.toLowerCase());

        const matchTopic =
          selectedTopic === 'ALL' || q.tags.includes(selectedTopic);

        return matchSearch && matchStatus && matchCourse && matchTopic;
      })
      .sort((a, b) => {
        if (sortBy === 'upvoted') {
          const scoreA = votesState[a.id]?.score ?? a.upvotes;
          const scoreB = votesState[b.id]?.score ?? b.upvotes;
          return scoreB - scoreA;
        }
        if (sortBy === 'answers') {
          return b.answersCount - a.answersCount;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [questions, searchQuery, statusTab, selectedCourse, selectedTopic, sortBy, votesState]);

  return (
    <div className="space-y-6">
      {/* 1. Content Header Block (Figma #87:957) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#181C22] tracking-tight">
            Questions & Discussions
          </h1>
          <p className="text-xs sm:text-sm text-[#404753] mt-1">
            Ask questions, share technical workflows, and resolve course roadblocks together.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ask Question</span>
        </button>
      </div>

      {/* 2. Search & Filter Card (Figma #87:976) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
        {/* Row 1: Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by title, keyword, course code, or tag..."
            className="w-full bg-[#F8F9FF] border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1]"
          />
        </div>

        {/* Row 2: Secondary Dropdowns and Status Tabs (Figma #87:983) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Status Tabs (Figma #87:984) */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setStatusTab('all')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Questions
            </button>
            <button
              onClick={() => setStatusTab('answered')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'answered'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Answered
            </button>
            <button
              onClick={() => setStatusTab('unanswered')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'unanswered'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unanswered
            </button>
          </div>

          {/* Filters & Sorting Dropdowns (Figma #87:991) */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Course Filter */}
            <div className="relative flex-1 sm:w-36">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
              >
                <option value="ALL">All Courses</option>
                <option value="PRN211">PRN211</option>
                <option value="PRN221">PRN221</option>
                <option value="SWP391">SWP391</option>
                <option value="DBI202">DBI202</option>
                <option value="PRM392">PRM392</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Topic Tag Filter */}
            <div className="relative flex-1 sm:w-36">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
              >
                <option value="ALL">All Topics</option>
                {allTopics.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Option */}
            <div className="relative flex-1 sm:w-40">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
              >
                <option value="recent">Sort: Most Recent</option>
                <option value="upvoted">Sort: Most Upvoted</option>
                <option value="answers">Sort: Most Answers</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Active Filter Notification Bar (Figma #87:1023) */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-[#404753]">
        <div className="flex items-center gap-1.5">
          <span>Showing</span>
          <span className="font-bold text-[#181C22]">{filteredQuestions.length}</span>
          <span>discussions matching current criteria</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Sync Active</span>
        </div>
      </div>

      {/* 4. Questions List Container (Figma #87:1035) */}
      <div className="space-y-3.5">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No questions found matching your criteria. Be the first to ask!
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const currentScore = votesState[q.id]?.score ?? q.upvotes;
            const currentUserVote = votesState[q.id]?.userVote ?? q.userVote;

            return (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col sm:flex-row items-start gap-4 hover:border-slate-300 hover:shadow-xs transition-all"
              >
                {/* Left Metric Box (Figma #87:1037) */}
                <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-3 sm:gap-2 shrink-0 w-full sm:w-20 text-center border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-4">
                  {/* Upvote / Downvote Action */}
                  <div className="flex sm:flex-col items-center gap-1">
                    <button
                      onClick={(e) => handleVote(q.id, 'UP', e)}
                      title="Upvote"
                      className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
                        currentUserVote === 'UP' ? 'text-[#0076D1] font-bold' : 'text-slate-400'
                      }`}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-800">
                      {currentScore}
                    </span>
                    <button
                      onClick={(e) => handleVote(q.id, 'DOWN', e)}
                      title="Downvote"
                      className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
                        currentUserVote === 'DOWN' ? 'text-rose-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Answers Count Pill (Figma #87:1047) */}
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                      q.isSolved || q.isModVerified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>{q.answersCount}</span>
                    <span className="text-[11px] font-medium">ans</span>
                    {(q.isSolved || q.isModVerified) && <Check className="w-3 h-3 text-emerald-600" />}
                  </div>
                </div>

                {/* Center Content (Figma #87:1051) */}
                <div className="flex-1 space-y-2 min-w-0">
                  {/* Tags row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {q.courseCode && (
                        <Link
                          to={`/courses/${q.courseCode}`}
                          className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-[#0076D1] border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                          {q.courseCode}
                        </Link>
                      )}
                      {q.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTopic(tag)}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#0076D1] transition-colors cursor-pointer"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>

                    {(q.isSolved || q.isModVerified) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Solution</span>
                      </span>
                    )}
                  </div>

                  {/* Heading 2 - Title */}
                  <Link
                    to={`/discussions/${q.id}`}
                    className="font-bold text-sm sm:text-base text-[#181C22] hover:text-[#0076D1] transition-colors line-clamp-2 leading-snug block"
                  >
                    {q.title}
                  </Link>

                  {/* Preview snippet */}
                  <p className="text-xs text-[#404753] line-clamp-2 leading-relaxed">
                    {q.content}
                  </p>

                  {/* Metadata row */}
                  <div className="pt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      {q.author.avatarUrl ? (
                        <img
                          src={q.author.avatarUrl}
                          alt={q.author.fullName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0076D1] flex items-center justify-center font-bold text-[10px]">
                          {q.author.fullName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-slate-700">
                        @{q.author.fullName.toLowerCase().replace(/\s+/g, '_')}
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(q.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{q.viewsCount} views</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newQ) => {
          setQuestions([newQ, ...questions]);
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
};
