import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Bell,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCampusDetails } from '../../hooks/useCampusDetails';
import { AskQuestionModal } from '../discussions/AskQuestionModal';
import { QuestionPost } from '../../types';
import { questionApi, articleApi, workflowApi, studyMaterialApi, courseReviewApi, ArticleListItem, WorkflowListItem, StudyMaterialListItem, CourseReviewListItem } from '../../services/api/contentApi';
import { courseNodesApi, CourseNodeListItem } from '../../services/api/adminApi';
import { filterCompactCourses } from '../../utils/courseFilter';
import { notificationApi, NotificationItem, voteApi } from '../../services/api/studentApi';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';

export const FeedPage: React.FC = () => {
  const { currentUser, currentCampus, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const campusInfo = useCampusDetails(currentUser?.campus || currentCampus);
  const navigate = useNavigate();

  const [questionTab, setQuestionTab] = useState<'recent' | 'voted' | 'unanswered'>('recent');
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Dynamic state loaded 100% from backend / database
  const [questions, setQuestions] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [materials, setMaterials] = useState<StudyMaterialListItem[]>([]);
  const [courses, setCourses] = useState<CourseNodeListItem[]>([]);
  const [evaluations, setEvaluations] = useState<CourseReviewListItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [votes, setVotes] = useState<Record<string, { count: number; userVote: 'UP' | 'DOWN' | null }>>({});

  // 1. Fetch questions based on tab
  useEffect(() => {
    let isMounted = true;
    const loadQuestions = async () => {
      try {
        const sortBy = questionTab === 'voted' ? 'views' : 'newest';
        const res = await questionApi.getQuestions({ pageSize: 5, sortBy });
        if (isMounted) {
          const items = res?.items || [];
          setQuestions(items);

          let myVotesMap: Record<string, number> = {};
          if (isAuthenticated) {
            try {
              const myVotes = await voteApi.getMyVotes();
              myVotes.forEach((v) => {
                if (v.targetType === 'QUESTION') {
                  myVotesMap[String(v.targetId)] = v.voteValue;
                }
              });
            } catch {}
          }

          const initialVotes: Record<string, { count: number; userVote: 'UP' | 'DOWN' | null }> = {};
          items.forEach((q: any) => {
            const qId = String(q.questionId);
            const myVote = myVotesMap[qId];
            initialVotes[qId] = {
              count: (q.upvoteCount || 0) - (q.downvoteCount || 0),
              userVote: myVote === 1 ? 'UP' : myVote === -1 ? 'DOWN' : null,
            };
          });
          setVotes(initialVotes);

          // Synchronize accurate vote stats from interaction service
          Promise.allSettled(
            items.map(async (q: any) => {
              const qId = String(q.questionId);
              const stats = await voteApi.getStats('QUESTION', q.questionId);
              return {
                qId,
                count: stats.score,
                userVote: stats.myVoteValue === 1 ? ('UP' as const) : stats.myVoteValue === -1 ? ('DOWN' as const) : null,
              };
            })
          ).then((results) => {
            if (!isMounted) return;
            setVotes((prev) => {
              const updated = { ...prev };
              results.forEach((res) => {
                if (res.status === 'fulfilled' && res.value) {
                  updated[res.value.qId] = {
                    count: res.value.count,
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
    loadQuestions();
    return () => { isMounted = false; };
  }, [questionTab, isAuthenticated]);

  // 2. Fetch other sections from backend
  useEffect(() => {
    let isMounted = true;

    // Courses Hub (Public) - Filtered by major preference for compact shortcut
    courseNodesApi.getCourseNodes({ pageSize: 150 })
      .then((res: any) => {
        if (isMounted) {
          const items: CourseNodeListItem[] = res?.items || [];
          const filtered = filterCompactCourses<CourseNodeListItem>(items, currentUser);
          setCourses(filtered.slice(0, 4));
        }
      })
      .catch(() => { if (isMounted) setCourses([]); });

    // Course Reviews (Public)
    courseReviewApi.getReviews({ pageSize: 2 })
      .then((res) => { if (isMounted) setEvaluations(res?.items || []); })
      .catch(() => { if (isMounted) setEvaluations([]); });

    // Protected student resources require authentication
    if (!isAuthenticated) {
      setWorkflows([]);
      setArticles([]);
      setMaterials([]);
      setNotifications([]);
      return;
    }

    // Workflows
    workflowApi.getWorkflows({ pageSize: 2 })
      .then((res) => { if (isMounted) setWorkflows(res?.items || []); })
      .catch(() => { if (isMounted) setWorkflows([]); });

    // Articles
    articleApi.getArticles({ pageSize: 2 })
      .then((res) => { if (isMounted) setArticles(res?.items || []); })
      .catch(() => { if (isMounted) setArticles([]); });

    // Study Materials
    studyMaterialApi.getMaterials({ pageSize: 3 })
      .then((res) => { if (isMounted) setMaterials(res?.items || []); })
      .catch(() => { if (isMounted) setMaterials([]); });

    // Notifications
    notificationApi.getNotifications({ pageSize: 2 })
      .then((res) => { if (isMounted) setNotifications(res || []); })
      .catch(() => { if (isMounted) setNotifications([]); });

    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const handleVote = async (id: string, dir: 'UP' | 'DOWN') => {
    const numId = Number(id.replace(/\D/g, ''));
    if (!numId) return;

    const current = votes[id] || { count: 0, userVote: null };
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

    setVotes((prev) => ({
      ...prev,
      [id]: { count: newCount, userVote: newVote },
    }));

    try {
      await voteApi.vote({
        target_type: 'QUESTION',
        target_id: numId,
        vote_value: dir === 'UP' ? 1 : -1,
      });
      const stats = await voteApi.getStats('QUESTION', numId);
      setVotes((prev) => ({
        ...prev,
        [id]: {
          count: stats.score,
          userVote: stats.myVoteValue === 1 ? 'UP' : stats.myVoteValue === -1 ? 'DOWN' : null,
        },
      }));
    } catch (err) {
      setVotes((prev) => ({
        ...prev,
        [id]: current,
      }));
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const studentName = currentUser?.fullName || 'Sinh viên FHub';
  const studentInitials = studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'SV';

  return (
    <div className="space-y-6">
      {/* 3.A Welcome Header (Figma #86:118) */}
      <div className="bg-white dark:bg-[#272727] rounded-2xl p-6 border border-slate-200/90 dark:border-[#272727] hover:dark:border-[#444444] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1.5">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0076D1] border border-blue-100 cursor-default"
            title={`${campusInfo.fullName}${campusInfo.address ? `\nĐịa chỉ: ${campusInfo.address}` : ''}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0076D1]" />
            <span>{t('common.campus', 'Campus')}: {campusInfo.shortName}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('auth.welcomeBack', 'Welcome back to FHub')}
          </h1>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            {t('app.tagline', 'Learn, collaborate, share knowledge, and grow with your academic community.')}
          </p>
        </div>

        {/* Right user badge */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#333333] p-2.5 px-4 rounded-xl border border-slate-100 dark:border-[#272727]">
          <div className="w-9 h-9 rounded-full bg-[#0076D1] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 shrink-0">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={studentName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{studentInitials}</span>
            )}
          </div>
          <div className="text-left">
            <span className="block text-[10px] text-slate-400 font-medium">{t('common.loggedInAs', 'Logged in as')}</span>
            <span className="block text-xs font-bold text-slate-800 leading-tight">{studentName}</span>
          </div>
        </div>
      </div>

      {/* 3.B Quick Actions Grid (8 specific actions only) (Figma #86:137) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {t('feed.quickActions', 'QUICK ACTIONS')}
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {/* 1. Ask Question */}
          <button
            onClick={() => setIsAskModalOpen(true)}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent hover:border-blue-400 dark:hover:border-[#444444] dark:hover:bg-[#333333] hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0076D1] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              {t('feed.askQuestion', 'Ask Question')}
            </span>
          </button>

          {/* 2. New Workflow */}
          <button
            onClick={() => navigate('/workflows?action=create')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent hover:border-indigo-400 dark:hover:border-[#444444] dark:hover:bg-[#333333] hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Code className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              {t('feed.newWorkflow', 'New Workflow')}
            </span>
          </button>

          {/* 3. Write Article */}
          <button
            onClick={() => navigate('/articles/create')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent hover:border-emerald-400 dark:hover:border-[#444444] dark:hover:bg-[#333333] hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              {t('feed.writeArticle', 'Write Article')}
            </span>
          </button>

          {/* 4. Write Course Evaluation */}
          <button
            onClick={() => navigate('/course-evaluations?action=create')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent hover:border-amber-400 dark:hover:border-[#444444] dark:hover:bg-[#333333] hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Star className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              {t('feed.writeEvaluation', 'Write Evaluation')}
            </span>
          </button>

          {/* 5. Upload Study Material */}
          <button
            onClick={() => navigate('/materials?action=upload')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent hover:border-rose-400 dark:hover:border-[#444444] dark:hover:bg-[#333333] hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              {t('feed.uploadMaterial', 'Upload Material')}
            </span>
          </button>

          {/* 6. Add External Material Link */}
          <button
            onClick={() => navigate('/materials?action=add-link')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent hover:border-purple-400 dark:hover:border-[#444444] dark:hover:bg-[#333333] hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Link2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              {t('feed.addLink', 'Add Link')}
            </span>
          </button>

          {/* 7. New Conversation */}
          <button
            onClick={() => navigate('/messages')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent hover:border-cyan-400 dark:hover:border-[#444444] dark:hover:bg-[#333333] hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              {t('feed.newChat', 'New Chat')}
            </span>
          </button>

          {/* 8. Create Support Ticket */}
          <button
            onClick={() => navigate('/tickets')}
            className="h-[84px] p-2 flex flex-col items-center justify-between bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent hover:border-slate-400 dark:hover:border-[#444444] dark:hover:bg-[#333333] hover:shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">
              {t('feed.supportTicket', 'Support Ticket')}
            </span>
          </button>
        </div>
      </div>

      {/* 3.C Questions & Discussions (Primary Feed Section) (Figma #86:196) */}
      <div className="bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent dark:hover:border-[#444444] shadow-2xs overflow-hidden transition-colors">
        {/* Section Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0076D1] flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {t('nav.questions', 'Questions & Discussions')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-[#2b2d32] p-0.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-[#949ba4]">
              <button
                onClick={() => setQuestionTab('recent')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  questionTab === 'recent' ? 'bg-white dark:bg-[#313338] text-slate-900 dark:text-[#f2f3f5] shadow-2xs font-bold' : 'hover:text-slate-900 dark:hover:text-[#f2f3f5]'
                }`}
              >
                {t('feed.tabTrending', 'Recent')}
              </button>
              <button
                onClick={() => setQuestionTab('voted')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  questionTab === 'voted' ? 'bg-white dark:bg-[#313338] text-slate-900 dark:text-[#f2f3f5] shadow-2xs font-bold' : 'hover:text-slate-900 dark:hover:text-[#f2f3f5]'
                }`}
              >
                {t('common.upvote', 'Most Voted')}
              </button>
              <button
                onClick={() => setQuestionTab('unanswered')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  questionTab === 'unanswered' ? 'bg-white dark:bg-[#313338] text-slate-900 dark:text-[#f2f3f5] shadow-2xs font-bold' : 'hover:text-slate-900 dark:hover:text-[#f2f3f5]'
                }`}
              >
                {t('feed.tabUnanswered', 'Unanswered')}
              </button>
            </div>

            <button
              onClick={() => setIsAskModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0076D1] dark:bg-[#3b82f6] hover:bg-[#005DA7] dark:hover:bg-[#2563eb] transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <span>{t('feed.askQuestion', 'Ask Question')}</span>
            </button>
          </div>
        </div>

        {/* Question Cards (Figma #86:215) */}
        {questions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">{t('feed.emptyQuestions', 'Chưa có câu hỏi hoặc thảo luận nào')}</p>
            <p className="text-[11px] text-slate-400 mt-1">{t('feed.emptyQuestionsDesc', 'Hãy là người đầu tiên đặt câu hỏi để nhận trợ giúp từ bạn học và giảng viên!')}</p>
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0076D1] bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              + {t('feed.askQuestionNow', 'Đặt câu hỏi ngay')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {questions.map((q, idx) => {
              const qId = String(q.questionId || q.id || idx);
              const authorName = q.isAnonymous ? t('common.anonymous', 'Ẩn danh FPTer') : (q.authorDisplayName || `User #${q.authorUserId || 1}`);
              const voteInfo = votes[qId] || { count: q.upvoteCount || 0, userVote: null };
              return (
                <div key={qId} className="p-5 flex items-start gap-4 border border-transparent dark:hover:border-[#444444] hover:bg-slate-50/60 dark:hover:bg-[#333333] rounded-xl transition-all">
                  {/* Vote Counter */}
                  <div className="flex flex-col items-center bg-slate-50 border border-slate-200/80 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => handleVote(qId, 'UP')}
                      className={`p-1 rounded hover:bg-slate-200/60 cursor-pointer transition-colors ${
                        voteInfo.userVote === 'UP' ? 'text-[#0076D1] font-bold' : 'text-slate-400'
                      }`}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-700 my-0.5">
                      {voteInfo.count}
                    </span>
                    <button
                      onClick={() => handleVote(qId, 'DOWN')}
                      className={`p-1 rounded hover:bg-slate-200/60 cursor-pointer transition-colors ${
                        voteInfo.userVote === 'DOWN' ? 'text-rose-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{authorName}</span>
                        <span className="text-slate-400">
                          • {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : t('common.recent', 'Mới đây')}
                        </span>
                      </div>
                      {q.courseId && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-[#0076D1] border border-blue-100">
                          [{t('common.course', 'Course')} #{q.courseId}]
                        </span>
                      )}
                      <ContentActionMenu
                        targetType="QUESTION"
                        targetId={qId}
                        targetTitle={q.title}
                        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/discussions/${qId}`}
                      />
                    </div>

                    <Link
                      to={`/discussions/${qId}`}
                      className="block text-sm font-bold text-slate-900 hover:text-[#0076D1] transition-colors leading-snug"
                    >
                      {q.title}
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {q.body || q.content}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 font-medium">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          {q.answerCount || 0} {t('common.answersCount', 'answers')}
                        </span>
                        <button
                          onClick={() => toggleBookmark(qId)}
                          className={`flex items-center gap-1 hover:text-[#0076D1] cursor-pointer transition-colors ${
                            bookmarkedIds.has(qId) ? 'text-[#0076D1] font-bold' : ''
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>{t('common.bookmark', 'Bookmark')}</span>
                        </button>
                      </div>
                      <Link to={`/discussions/${qId}`} className="text-xs font-semibold text-[#0076D1] hover:underline flex items-center gap-1">
                        {t('common.viewQuestion', 'View Question')} <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer: View All Link */}
        <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 text-center">
          <Link
            to="/discussions"
            className="text-xs font-bold text-[#0076D1] hover:underline inline-flex items-center gap-1.5"
          >
            <span>{t('common.viewAllQuestions', 'View All Questions')}</span>
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
                <h3 className="font-bold text-sm text-slate-900">{t('feed.recentWorkflows', 'Recent Shared Workflows')}</h3>
              </div>
              <button
                onClick={() => navigate('/workflows?action=create')}
                className="text-xs font-bold text-[#0076D1] hover:underline cursor-pointer"
              >
                + {t('feed.newWorkflow', 'New Workflow')}
              </button>
            </div>

            {workflows.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                {t('feed.emptyWorkflows', 'Chưa có workflow nào được chia sẻ.')}
              </div>
            ) : (
              <div className="space-y-3">
                {workflows.map((wf, idx) => (
                  <div key={wf.workflowId || (wf as any).id || idx} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
                    <Link to={`/workflows/${wf.workflowId}`} className="font-bold text-xs text-slate-800 hover:text-blue-600 block leading-snug">
                      {wf.title}
                    </Link>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {wf.summary || 'Quy trình hướng dẫn thực hành kỹ thuật.'}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">Version {(wf as any).version || 1}</span>
                      <Link to={`/workflows/${wf.workflowId}`} className="text-[11px] font-semibold text-[#0076D1] hover:underline">
                        {t('common.view', 'View')} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <Link to="/workflows" className="text-xs font-bold text-[#0076D1] hover:underline inline-flex items-center gap-1">
              <span>{t('common.viewAllWorkflows', 'View All Workflows')}</span>
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
                <h3 className="font-bold text-sm text-slate-900">{t('feed.recentArticles', 'Recent Articles')}</h3>
              </div>
              <button
                onClick={() => navigate('/articles/create')}
                className="text-xs font-bold text-[#0076D1] hover:underline cursor-pointer"
              >
                + {t('feed.writeArticle', 'Write Article')}
              </button>
            </div>

            {articles.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                {t('feed.emptyArticles', 'Chưa có bài viết nào được đăng tải.')}
              </div>
            ) : (
              <div className="space-y-3">
                {articles.map((art, idx) => (
                  <div key={art.articleId || (art as any).id || idx} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors">
                    <Link to={`/articles/${art.articleId}`} className="font-bold text-xs text-slate-800 hover:text-blue-600 block leading-snug">
                      {art.title}
                    </Link>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {art.summary || 'Bài viết học tập và chia sẻ kinh nghiệm.'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        {art.createdAt ? new Date(art.createdAt).toLocaleDateString() : t('common.recent', 'Gần đây')}
                      </span>
                      <Link to={`/articles/${art.articleId}`} className="font-semibold text-[#0076D1] hover:underline">
                        {t('common.read', 'Read')} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <Link to="/articles" className="text-xs font-bold text-[#0076D1] hover:underline inline-flex items-center gap-1">
              <span>{t('common.viewAllArticles', 'View All Articles')}</span>
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
                <h3 className="font-bold text-sm text-slate-900">{t('nav.studyMaterials', 'Study Materials')}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/materials?action=upload')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-[#0076D1] hover:bg-blue-100 cursor-pointer"
                >
                  {t('common.upload', 'Upload')}
                </button>
                <button
                  onClick={() => navigate('/materials?action=add-link')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  {t('common.addLink', 'Add Link')}
                </button>
              </div>
            </div>

            {materials.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                {t('feed.emptyMaterials', 'Chưa có tài liệu học tập nào được tải lên.')}
              </div>
            ) : (
              <div className="space-y-2.5">
                {materials.map((mat, idx) => (
                  <div key={mat.studyMaterialId || (mat as any).id || idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/40">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                        {mat.materialType || 'DOC'}
                      </span>
                      <div className="truncate">
                        <h5 className="font-bold text-xs text-slate-800 truncate">{mat.title}</h5>
                        <p className="text-[10px] text-slate-400">
                          {mat.fileSizeBytes ? `${(mat.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : 'Tài liệu môn học'}
                        </p>
                      </div>
                    </div>
                    <Link to={`/materials/${mat.studyMaterialId}`} className="text-xs font-bold text-[#0076D1] hover:underline ml-2 shrink-0">
                      {t('common.detail', 'Detail')}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <Link to="/materials" className="text-xs font-bold text-[#0076D1] hover:underline inline-flex items-center gap-1">
              <span>{t('common.viewAllMaterials', 'View All Materials')}</span>
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
                <h3 className="font-bold text-sm text-slate-900">{t('feed.courseHubShortcut', 'Course Hub Shortcut')}</h3>
              </div>
              <Link to="/courses" className="text-xs font-bold text-[#0076D1] hover:underline">
                {t('feed.browseCourses', 'Browse Courses')} →
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                {t('feed.emptyCourses', 'Chưa có môn học nào trong danh mục.')}
              </div>
            ) : (
              <div className="space-y-2.5">
                {courses.map((crs, idx) => {
                  const crsId = crs.courseNodeId || (crs as any).id || idx;
                  const crsCode = crs.courseCode || (crs as any).code || 'FPT';
                  const crsName = crs.courseName || (crs as any).name || 'Môn học';
                  return (
                    <div key={crsId} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-100 text-blue-800">
                            {crsCode}
                          </span>
                          <h5 className="font-bold text-xs text-slate-800">{crsName}</h5>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {crs.credits || 3} {t('common.credits', 'Tín chỉ')} • {crs.description || 'Chương trình đào tạo tiêu chuẩn FPT'}
                        </p>
                      </div>
                      <Link to={`/courses/${crsCode}`} className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-[#0076D1] border border-blue-200 shrink-0">
                        {t('common.view', 'View')}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] font-medium text-slate-400">
              {courses.length} {t('courses.displayCount', 'Môn học hiển thị')}
            </span>
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
                <h3 className="font-bold text-sm text-slate-900">{t('nav.courseEvaluations', 'Course Evaluations')}</h3>
              </div>
              <button
                onClick={() => navigate('/course-evaluations?action=create')}
                className="text-xs font-bold text-[#0076D1] hover:underline cursor-pointer"
              >
                + {t('feed.writeEvaluation', 'Write Evaluation')}
              </button>
            </div>

            {evaluations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                {t('feed.emptyEvaluations', 'Chưa có đánh giá môn học nào.')}
              </div>
            ) : (
              <div className="space-y-3">
                {evaluations.map((ev, idx) => (
                  <div key={ev.courseReviewId || (ev as any).id || idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700">
                        {t('common.course', 'Course')} #{ev.courseId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {ev.semesterCode} {ev.academicYear}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-800">
                      {t('evaluations.overallRating', 'Overall Rating')}: {ev.overallRating}/5 ★
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {ev.reviewContent || ev.survivalTips || 'Đánh giá môn học từ sinh viên.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <Link to="/course-evaluations" className="text-xs font-bold text-[#0076D1] hover:underline inline-flex items-center gap-1">
              <span>{t('common.viewAllEvaluations', 'View All Evaluations')}</span>
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
                <h3 className="font-bold text-sm text-slate-900">{t('feed.recentConversations', 'Recent Conversations')}</h3>
              </div>
              <Link to="/messages" className="text-xs font-bold text-[#0076D1] hover:underline">
                {t('feed.viewAllMessages', 'View All Messages')} →
              </Link>
            </div>

            <div className="p-6 text-center text-slate-400 text-xs">
              {t('feed.emptyConversations', 'Chưa có cuộc trò chuyện nào gần đây.')}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] font-medium text-slate-400">
              0 {t('feed.unreadConversations', 'unread conversations')}
            </span>
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
                <h3 className="font-bold text-sm text-slate-900">{t('feed.notificationsPreview', 'Notifications Preview')}</h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Link to="/settings" className="text-slate-500 hover:text-slate-800">
                  {t('feed.deliverySettings', 'Delivery Settings')}
                </Link>
                <Link to="/notifications" className="font-bold text-[#0076D1] hover:underline">
                  {t('feed.viewAllNotifications', 'View All Notifications')} →
                </Link>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                {t('feed.emptyNotifications', 'Không có thông báo mới nào.')}
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((notif, idx) => {
                  const notifId = (notif as any).notificationId || (notif as any).notification_id || notif.id || idx;
                  const notifMsg = notif.message || (notif as any).body || '';
                  return (
                    <div key={notifId} className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-[#0076D1] shrink-0" />
                        <p className="text-xs text-slate-800 truncate">
                          <strong>{notif.title}</strong>{notifMsg ? `: ${notifMsg}` : ''}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : t('common.recent', 'Gần đây')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Support Helpdesk Shortcut (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <LifeBuoy className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-sm text-slate-900">{t('feed.supportHelpdesk', 'Support Helpdesk')}</h3>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{t('feed.ticketStatus', 'Ticket Status:')}</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0 {t('feed.openIssues', 'Open Issues')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t('feed.supportDesc', 'Need help with academic credentials, course mapping, or forum policy?')}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/tickets')}
              className="py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {t('feed.viewTickets', 'View Tickets')}
            </button>
            <button
              onClick={() => navigate('/tickets')}
              className="py-2 text-xs font-bold rounded-lg bg-[#0076D1] hover:bg-[#005DA7] text-white transition-colors cursor-pointer shadow-2xs"
            >
              {t('feed.createTicket', 'Create Ticket')}
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
