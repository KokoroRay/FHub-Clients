import React, { useState, useMemo, useEffect } from 'react';

import { Link, useSearchParams } from 'react-router-dom';
import {
  Bookmark,
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
  Share2,
  Trash2,
} from 'lucide-react';
import { QuestionPost } from '../../types';
import { AskQuestionModal } from './AskQuestionModal';
import { questionApi } from '../../services/api/contentApi';
import { voteApi, bookmarkApi } from '../../services/api/studentApi';
import { apiClient } from '../../services/api/client';
import { courseNodesApi, semanticTagsApi } from '../../services/api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import { UserHoverCard } from '../../components/common/UserHoverCard';
import { SocialShareModal } from '../../components/common/SocialShareModal';
import {
  loadAllSemanticTags,
  getSemanticTagMap,
  resolveTagNames,
  FALLBACK_ALL_TAGS,
  SemanticTagItem,
} from '../../utils/tagUtils';

export const QuestionListPage: React.FC = () => {
  const { currentCampus, currentUser } = useAuth();
  const { locale, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialTag = searchParams.get('tag');
  const shouldOpenCreate = searchParams.get('action') === 'create';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [shareModalData, setShareModalData] = useState<{ isOpen: boolean; title: string; url: string; description?: string } | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<{ id: string; title: string } | null>(null);

  const handleShare = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const numId = Number(id.replace(/\D/g, '')) || id;
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/discussions/${numId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedShareId(id);
      setTimeout(() => setCopiedShareId(null), 2000);
    }
  };

  const handleDeleteQuestion = async (id: string | number) => {
    const numId = Number(String(id).replace(/\D/g, ''));
    if (numId) {
      try {
        await questionApi.deleteQuestion(numId);
      } catch (err) {
        console.warn('Failed to delete question:', err);
      }
    }
    setQuestions((prev) => prev.filter((q) => String(q.id) !== String(id) && Number(String(q.id).replace(/\D/g, '')) !== numId));
  };
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTag || 'ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'upvoted' | 'answers'>('recent');
  const [isCreateOpen, setIsCreateOpen] = useState(shouldOpenCreate);
  const [questions, setQuestions] = useState<QuestionPost[]>([]);
  const [votesState, setVotesState] = useState<Record<string, { score: number; userVote: 'UP' | 'DOWN' | null }>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkMap, setBookmarkMap] = useState<Map<string, number | string>>(new Map());
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: number; code: string; title: string }>>([]);
  const [allTags, setAllTags] = useState<SemanticTagItem[]>(FALLBACK_ALL_TAGS);
  const [tagsMap, setTagsMap] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  
  useEffect(() => {
    let isMounted = true;
    bookmarkApi.getBookmarks('Question')
      .then((bList) => {
        if (!isMounted) return;
        const bMap = new Map<string, number | string>();
        bList.forEach((b) => {
          bMap.set(String(b.targetId), (b.id ?? b.bookmarkId ?? 0));
        });
        setBookmarkMap(bMap);
        setBookmarkedIds(new Set(Array.from(bMap.keys())));
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);
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

          // Fetch accurate live vote stats for loaded questions
          Promise.allSettled(
            items.map(async (item: any) => {
              const numId = Number(String(item.questionId || item.id).replace(/\D/g, ''));
              if (numId > 0) {
                const stats = await voteApi.getStats('QUESTION', numId);
                return { qId: String(item.questionId || item.id), numId, stats };
              }
              return null;
            })
          ).then((results: any[]) => {
            setVotesState((prev) => {
              const updated = { ...prev };
              results.forEach((r) => {
                if (r.status === 'fulfilled' && r.value) {
                  const { qId, numId, stats } = r.value;
                  const prevVote = updated[qId]?.userVote ?? (stats.myVoteValue === 1 ? 'UP' : stats.myVoteValue === -1 ? 'DOWN' : null);
                  const targetQ = items.find((item: any) => String(item.questionId || item.id) === String(qId) || String(item.questionId || item.id).replace(/\D/g, '') === String(numId));
                  const baseCount = targetQ ? ((targetQ.upvoteCount || 0) - (targetQ.downvoteCount || 0)) : 0;
                  const hasLiveVotes = stats.upvotes > 0 || stats.downvotes > 0 || stats.myVoteValue !== null;
                  const finalScore = hasLiveVotes ? stats.score : (updated[qId]?.score ?? baseCount);
                  const entry = { score: finalScore, userVote: prevVote };
                  updated[qId] = entry;
                  updated[String(numId)] = entry;
                }
              });
              return updated;
            });
          }).catch(() => {});
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

    const toggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isBookmarked = bookmarkedIds.has(id);
    const existingBookmarkId = bookmarkMap.get(id);
    const numId = Number(id.replace(/\D/g, '')) || Number(id);

    if (isBookmarked && existingBookmarkId) {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      try {
        await bookmarkApi.removeBookmark(existingBookmarkId);
        setBookmarkMap((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      } catch (err) {
        console.warn('Failed to remove bookmark:', err);
      }
    } else {
      setBookmarkedIds((prev) => new Set(prev).add(id));
      try {
        const res = await bookmarkApi.addBookmark('Question', numId);
        const bId = res?.bookmark_id ?? res?.data?.bookmark_id ?? res?.id ?? Date.now();
        setBookmarkMap((prev) => new Map(prev).set(id, bId));
      } catch (err) {
        console.warn('Failed to add bookmark:', err);
      }
    }
  };

  const handleVote = async (id: string, dir: 'UP' | 'DOWN', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const numId = Number(id.replace(/\D/g, ''));
    if (!numId) return;

    const current = votesState[id] || (numId > 0 ? votesState[String(numId)] : undefined) || {
      score: (() => {
        const q = questions.find((x) => x.id === id || String(x.id).replace(/\D/g, '') === String(numId));
        return (q?.upvotes || 0) - (q?.downvotes || 0);
      })(),
      userVote: questions.find((x) => x.id === id || String(x.id).replace(/\D/g, '') === String(numId))?.userVote || null,
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

    const optimistic = { score: newScore, userVote: newVote };
    setVotesState((prev) => ({
      ...prev,
      [id]: optimistic,
      ...(numId > 0 ? { [String(numId)]: optimistic } : {}),
    }));

    try {
      if (current.userVote === dir) {
        await voteApi.removeVote('QUESTION', numId);
      } else {
        await voteApi.vote({
          target_type: 'QUESTION',
          target_id: numId,
          vote_value: dir === 'UP' ? 1 : -1,
        });
      }
      const stats = await voteApi.getStats('QUESTION', numId);
      const finalEntry = {
        score: stats.score,
        userVote: stats.myVoteValue === 1 ? 'UP' as const : stats.myVoteValue === -1 ? 'DOWN' as const : null,
      };
      setVotesState((prev) => ({
        ...prev,
        [id]: finalEntry,
        ...(numId > 0 ? { [String(numId)]: finalEntry } : {}),
      }));

      if (dir === 'UP') {
        const targetQ = questions.find((x) => x.id === id || String(x.id).replace(/\D/g, '') === String(numId));
        const authorId = targetQ?.author?.id;
        if (authorId && String(authorId) !== String(currentUser?.id)) {
          apiClient.post('/api/reputation/events', {
            user_id: Number(authorId),
            rule_code: 'QUESTION_UPVOTED',
            source_type: 'Question',
            source_id: numId,
          }).catch(() => {});
        }
      }
    } catch (err) {
      setVotesState((prev) => ({
        ...prev,
        [id]: current,
        ...(numId > 0 ? { [String(numId)]: current } : {}),
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
            {t('discussions.title', 'Hỏi đáp & Thảo luận')}
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
                    #{t(tItem)}
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
            const numId = Number(String(q.id).replace(/\D/g, ''));
            const currentScore = votesState[q.id]?.score ?? (numId > 0 ? votesState[String(numId)]?.score : undefined) ?? ((q.upvotes || 0) - (q.downvotes || 0));
            const currentUserVote = votesState[q.id]?.userVote ?? (numId > 0 ? votesState[String(numId)]?.userVote : undefined) ?? q.userVote;

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
                      title={t("Upvote")}
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
                      title={t("Downvote")}
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
                          {t('common.general', 'Chung')}
                        </span>
                      )}
                      {q.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTopic(tag)}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#0076D1] transition-colors cursor-pointer"
                        >
                          #{t(tag)}
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
                        <UserHoverCard
                          userId={q.author.id}
                          initialData={{
                            fullName: q.author.fullName,
                            avatarUrl: q.author.avatarUrl,
                            campus: q.author.campus,
                          }}
                        >
                          <div className="flex items-center gap-1.5 group cursor-pointer">
                            {q.author.avatarUrl ? (
                              <img
                                src={q.author.avatarUrl}
                                alt={q.author.fullName}
                                className="w-5 h-5 rounded-full object-cover group-hover:ring-1 group-hover:ring-[#0076D1] transition-all"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0076D1] flex items-center justify-center font-bold text-[10px] group-hover:ring-1 group-hover:ring-[#0076D1] transition-all">
                                {q.author.fullName.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-[#0076D1] dark:group-hover:text-blue-400 group-hover:underline transition-colors">
                              @{q.author.fullName.toLowerCase().replace(/\s+/g, '_')}
                            </span>
                          </div>
                        </UserHoverCard>
                      )}
                      <span>·</span>
                      <span>
                        {new Date(q.createdAt).toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(q.id, e)}
                        className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                          bookmarkedIds.has(q.id)
                            ? 'bg-blue-50 border-blue-200 text-[#0076D1] dark:bg-blue-950/60 dark:border-blue-800'
                            : 'border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600'
                        }`}
                        title={bookmarkedIds.has(q.id) ? t('common.saved', 'Đã lưu') : t('common.bookmark', 'Lưu')}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.has(q.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShareModalData({
                            isOpen: true,
                            title: q.title,
                            url: `/discussions/${q.id}`,
                            description: q.content,
                          });
                        }}
                        className="p-1 rounded-lg border border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0076D1] transition-colors cursor-pointer"
                        title={t('common.share', 'Chia sẻ')}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {Boolean(
                        (q.author?.id && currentUser?.id && (String(q.author.id) === String(currentUser.id) || String(q.author.id).replace(/\D/g, '') === String(currentUser.id).replace(/\D/g, ''))) ||
                        currentUser?.role === 'Admin'
                      ) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeletingQuestion({ id: q.id, title: q.title });
                          }}
                          title={t('questions.deleteQuestion', 'Xóa câu hỏi')}
                          className="p-1 rounded-lg border border-transparent text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="flex items-center gap-1 text-slate-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{q.viewsCount} {t('views')}</span>
                      </div>
                      <ContentActionMenu
                        targetType="QUESTION"
                        targetId={q.id}
                        targetTitle={q.title}
                        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/discussions/${q.id}`}
                        isOwner={Boolean((q.author?.id && currentUser?.id && (String(q.author.id) === String(currentUser.id) || String(q.author.id).replace(/\D/g, '') === String(currentUser.id).replace(/\D/g, ''))) || currentUser?.role === 'Admin')}
                        onDelete={() => handleDeleteQuestion(q.id)}
                        deleteLabel={t('questions.deleteQuestion', 'Xóa câu hỏi')}
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

      {shareModalData && (
        <SocialShareModal
          isOpen={shareModalData.isOpen}
          onClose={() => setShareModalData(null)}
          title={shareModalData.title}
          url={shareModalData.url}
          description={shareModalData.description}
        />
      )}

      {deletingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {t('questions.confirmDeleteTitle', 'Xác nhận xóa câu hỏi?')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('questions.confirmDeleteDesc', 'Bạn có chắc chắn muốn xóa câu hỏi "{title}"? Toàn bộ câu trả lời và bình luận sẽ bị xóa vĩnh viễn.', { title: deletingQuestion.title })}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingQuestion(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                {t('common.cancel', 'Hủy')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const toDel = deletingQuestion;
                  setDeletingQuestion(null);
                  if (toDel) await handleDeleteQuestion(toDel.id);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {t('common.delete', 'Xác nhận xóa')}
              </button>
            </div>
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
