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
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { QuestionPost } from '../../types';
import { AskQuestionModal } from './AskQuestionModal';
import { questionApi } from '../../services/api/contentApi';
import { voteApi } from '../../services/api/studentApi';
import { courseNodesApi, semanticTagsApi } from '../../services/api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import {
  loadAllSemanticTags,
  getSemanticTagMap,
  resolveTagNames,
  FALLBACK_ALL_TAGS,
  SemanticTagItem,
} from '../../utils/tagUtils';

export const QuestionListPage: React.FC = () => {
  const { currentCampus } = useAuth();
  const { t } = useLanguage();
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
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: number; code: string; title: string }>>([]);
  const [allTags, setAllTags] = useState<SemanticTagItem[]>(FALLBACK_ALL_TAGS);
  const [tagsMap, setTagsMap] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;
    const loadMetadata = async () => {
      try {
        const [cRes, tags] = await Promise.all([
          courseNodesApi.getCourseNodes({ pageSize: 2000 }).catch(() => ({ items: [] })),
          loadAllSemanticTags(),
        ]);
        if (isMounted) {
          const cItems = (cRes as any)?.items || cRes || [];
          if (Array.isArray(cItems)) {
            setAvailableCourses(
              cItems.map((c: any, idx: number) => {
                const idNum = Number(c.id ?? c.courseNodeId ?? c.courseId);
                return {
                  id: Number.isFinite(idNum) ? idNum : idx + 1,
                  code: c.code || c.courseCode || `C-${idx + 1}`,
                  title: c.name || c.title || c.code || `Course ${idx + 1}`,
                };
              })
            );
          }
          if (tags && tags.length > 0) {
            setAllTags(tags);
            const map: Record<number, string> = {};
            tags.forEach((t) => {
              map[t.id] = t.name;
            });
            setTagsMap(map);
          }
        }
      } catch {}
    };
    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchQuestions = async () => {
      try {
        const res = await questionApi.getQuestions({
          search: searchQuery.trim() || undefined,
          sortBy: sortBy === 'upvoted' ? 'views' : sortBy === 'answers' ? 'answers' : 'newest',
          pageSize: 50,
        });
        if (isMounted) {
          const items = res?.items || [];
          const tagMap = getSemanticTagMap(allTags);
          const mapped: QuestionPost[] = items.map((item) => {
            const matchedCourse = availableCourses.find((c) => c.id === item.courseId);
            const courseCode = matchedCourse ? matchedCourse.code : (item.courseId ? `COURSE-${item.courseId}` : undefined);
            const tags = (item.semanticTagIds && item.semanticTagIds.length > 0)
              ? resolveTagNames(item.semanticTagIds, tagMap)
              : [t('common.study', 'Học tập')];

            return {
              id: String(item.questionId),
              title: item.title,
              content: item.body,
              courseCode,
              author: {
                id: String(item.authorUserId || 'anon'),
                fullName: item.isAnonymous ? t('common.anonymous', 'Ẩn danh FPTer') : (item.authorDisplayName || t('common.userNumber', 'Sinh viên FHub')),
                role: 'Student',
                karma: 0,
                campus: '',
                isAnonymous: item.isAnonymous,
              },
              tags,
              upvotes: item.upvoteCount || 0,
              downvotes: item.downvoteCount || 0,
              answersCount: item.answerCount || 0,
              viewsCount: item.viewCount || 0,
              isSolved: item.hasBestAnswer || item.status === 'RESOLVED',
              isLocked: item.areCommentsLocked || false,
              isPinned: item.isPinned || false,
              createdAt: item.createdAt || new Date().toISOString(),
            };
          });
          setQuestions(mapped);

          let myVotesMap: Record<string, number> = {};
          try {
            const myVotes = await voteApi.getMyVotes();
            myVotes.forEach((v) => {
              if (v.targetType === 'QUESTION') {
                myVotesMap[String(v.targetId)] = v.voteValue;
              }
            });
          } catch {}

          const initialVotesState: Record<string, { score: number; userVote: 'UP' | 'DOWN' | null }> = {};
          items.forEach((item) => {
            const qId = String(item.questionId);
            const myVote = myVotesMap[qId];
            initialVotesState[qId] = {
              score: (item.upvoteCount || 0) - (item.downvoteCount || 0),
              userVote: myVote === 1 ? 'UP' : myVote === -1 ? 'DOWN' : null,
            };
          });
          setVotesState(initialVotesState);

          // Synchronize accurate vote stats from interaction service
          Promise.allSettled(
            items.map(async (item) => {
              const qId = String(item.questionId);
              const stats = await voteApi.getStats('QUESTION', item.questionId);
              return {
                qId,
                score: stats.score,
                userVote: stats.myVoteValue === 1 ? ('UP' as const) : stats.myVoteValue === -1 ? ('DOWN' as const) : null,
              };
            })
          ).then((results) => {
            if (!isMounted) return;
            setVotesState((prev) => {
              const updated = { ...prev };
              results.forEach((res) => {
                if (res.status === 'fulfilled' && res.value) {
                  updated[res.value.qId] = {
                    score: res.value.score,
                    userVote: res.value.userVote,
                  };
                }
              });
              return updated;
            });
          });
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
    const list: string[] = allTags.map((t) => t.name);
    questions.forEach((q) => {
      q.tags.forEach((t) => {
        if (!list.some((existing) => existing.toLowerCase() === t.toLowerCase())) {
          list.push(t);
        }
      });
    });
    return list;
  }, [allTags, questions]);

  const handleVote = async (id: string, dir: 'UP' | 'DOWN', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const numId = Number(id.replace(/\D/g, ''));
    if (!numId) return;

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

    try {
      await voteApi.vote({
        target_type: 'QUESTION',
        target_id: numId,
        vote_value: dir === 'UP' ? 1 : -1,
      });
      const stats = await voteApi.getStats('QUESTION', numId);
      setVotesState((prev) => ({
        ...prev,
        [id]: {
          score: stats.score,
          userVote: stats.myVoteValue === 1 ? 'UP' : stats.myVoteValue === -1 ? 'DOWN' : null,
        },
      }));
    } catch (err) {
      setVotesState((prev) => ({
        ...prev,
        [id]: current,
      }));
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusTab, selectedCourse, selectedTopic, sortBy]);

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
        // Campus Filter: If a specific campus is selected in Header (not ALL/GLOBAL), filter by author campus
        if (currentCampus && currentCampus !== 'ALL' && (currentCampus as any) !== 'GLOBAL') {
          if (q.author.campus && q.author.campus.toUpperCase() !== currentCampus.toUpperCase()) {
            return false;
          }
        }

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
          selectedCourse === 'ALL'
            ? true
            : selectedCourse === 'NONE'
            ? !q.courseCode
            : Boolean(q.courseCode && q.courseCode.toLowerCase() === selectedCourse.toLowerCase());

        const matchTopic =
          selectedTopic === 'ALL' ||
          q.tags.some((t) => t.toLowerCase() === selectedTopic.toLowerCase());

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
  }, [questions, searchQuery, statusTab, selectedCourse, selectedTopic, sortBy, votesState, currentCampus]);

  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* 1. Content Header Block (Figma #87:957) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#181C22] dark:text-slate-100 tracking-tight">
            {t('Questions & Discussions')}
          </h1>
          <p className="text-xs sm:text-sm text-[#404753] dark:text-slate-400 mt-1">
            {t('discussions.subtitle', 'Hỏi đáp bài tập, trao đổi kinh nghiệm thi PE/FE, đồ án Capstone & thảo luận đa chuyên ngành.')}
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('Ask Question')}</span>
        </button>
      </div>

      {/* 2. Search & Filter Card (Figma #87:976) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 space-y-3.5">
        {/* Row 1: Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('discussions.searchPlaceholder', 'Tìm câu hỏi theo tiêu đề, nội dung, mã môn (SWP391, MKT101, GRA201, LAW101...) hoặc thẻ tag...')}
            className="w-full bg-[#F8F9FF] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1]"
          />
        </div>

        {/* Row 2: Secondary Dropdowns and Status Tabs (Figma #87:983) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          {/* Status Tabs (Figma #87:984) */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setStatusTab('all')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('All Questions')}
            </button>
            <button
              onClick={() => setStatusTab('answered')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'answered'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('Answered')}
            </button>
            <button
              onClick={() => setStatusTab('unanswered')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'unanswered'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('Unanswered')}
            </button>
          </div>

          {/* Filters & Sorting Dropdowns (Figma #87:991) */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Course Filter */}
            <div className="relative flex-1 sm:w-36">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0076D1] cursor-pointer"
              >
                <option value="ALL">{t('Tất cả môn học')}</option>
                <option value="NONE">{t('Chung (Không môn học)')}</option>
                {availableCourses.map((c, idx) => (
                  <option key={`${c.code || 'course'}-${c.id ?? idx}`} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Topic Tag Filter */}
            <div className="relative flex-1 sm:w-36">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0076D1] cursor-pointer"
              >
                <option value="ALL">{t('discussions.allTopics', 'Tất cả chủ đề / Thẻ tag')}</option>
                {allTopics.map((tItem) => (
                  <option key={tItem} value={tItem}>
                    #{tItem}
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
                className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0076D1] cursor-pointer"
              >
                <option value="recent">{t('Sort: Most Recent')}</option>
                <option value="upvoted">{t('Sort: Most Upvoted')}</option>
                <option value="answers">{t('Sort: Most Answers')}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              title={t('Làm mới')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Active Filter Notification Bar (Figma #87:1023) */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-xs text-[#404753] dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <span>{t('Showing')}</span>
          <span className="font-bold text-[#181C22] dark:text-slate-100">{filteredQuestions.length}</span>
          <span>{t('discussions matching current criteria')}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t('Live Sync Active')}</span>
        </div>
      </div>

      {/* 4. Questions List Container (Figma #87:1035) */}
      <div className="space-y-3.5">
        {paginatedQuestions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            {t('No questions found matching your criteria. Be the first to ask!')}
          </div>
        ) : (
          paginatedQuestions.map((q) => {
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
                    <span className="text-[11px] font-medium">{t('questions.answersUnit', 'câu')}</span>
                    {(q.isSolved || q.isModVerified) && <Check className="w-3 h-3 text-emerald-600" />}
                  </div>
                </div>

                {/* Center Content (Figma #87:1051) */}
                <div className="flex-1 space-y-2 min-w-0">
                  {/* Tags row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {q.courseCode ? (
                        <Link
                          to={`/courses/${q.courseCode}`}
                          className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-[#0076D1] border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                          {q.courseCode}
                        </Link>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200/60">
                          {t('Chung')}
                        </span>
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
                        <span>{t('Verified Solution')}</span>
                      </span>
                    )}
                  </div>

                  {/* Heading 2 - Title */}
                  <Link
                    to={`/discussions/${q.id}`}
                    className="font-bold text-sm sm:text-base text-[#181C22] dark:text-slate-100 hover:text-[#0076D1] transition-colors line-clamp-2 leading-snug block"
                  >
                    {q.title}
                  </Link>

                  {/* Preview snippet */}
                  <p className="text-xs text-[#404753] dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {q.content}
                  </p>

                  {/* Metadata row */}
                  <div className="pt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      {q.author.isAnonymous ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold border border-purple-200 dark:border-purple-800">
                            <EyeOff className="w-3 h-3" />
                          </div>
                          <span className="font-semibold text-purple-700 dark:text-purple-300 text-xs">
                            {t('Ẩn danh FPTer')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
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
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            @{q.author.fullName.toLowerCase().replace(/\s+/g, '_')}
                          </span>
                        </div>
                      )}
                      <span>·</span>
                      <span>
                        {new Date(q.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{q.viewsCount} {t('views')}</span>
                      </div>
                      <ContentActionMenu
                        targetType="QUESTION"
                        targetId={q.id}
                        targetTitle={q.title}
                        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/discussions/${q.id}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <p className="text-xs text-slate-500">
            {t('Hiển thị')}{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{(currentPage - 1) * pageSize + 1}</span> -{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(currentPage * pageSize, filteredQuestions.length)}</span>{' '}
            {t('trên tổng số')}{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredQuestions.length}</span>{' '}
            {t('câu hỏi')}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title={t('Trang trước')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#0076D1] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title={t('Trang kế tiếp')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
