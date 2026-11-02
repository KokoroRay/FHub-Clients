import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Eye,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  MessageSquare,
  Loader2,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCampusDetails } from '../../hooks/useCampusDetails';
import { AskQuestionModal } from '../discussions/AskQuestionModal';
import { QuestionPost } from '../../types';
import { questionApi } from '../../services/api/contentApi';
import { voteApi } from '../../services/api/studentApi';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import { normalizeMediaUrl } from '../../utils/mediaUtils';

// Helper to extract clean text and attached images/GIFs from markdown
function parseQuestionContent(rawBody: string = '') {
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: Array<{ alt: string; url: string; isGif: boolean }> = [];
  let match;
  while ((match = imgRegex.exec(rawBody)) !== null) {
    const url = match[2];
    const alt = match[1] || 'image';
    const isGif = url.toLowerCase().includes('.gif') || alt.toLowerCase().includes('gif');
    images.push({ alt, url, isGif });
  }
  const cleanText = rawBody.replace(imgRegex, '').trim();
  return { cleanText, images };
}

export const FeedPage: React.FC = () => {
  const { currentUser, currentCampus, isAuthenticated } = useAuth();
  const avatarUrl = normalizeMediaUrl(currentUser?.avatarUrl);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const { locale, t } = useLanguage();
  const campusInfo = useCampusDetails(currentUser?.campus || currentCampus);
  const navigate = useNavigate();

  // StackOverflow style tabs: 'interesting' | 'recent' | 'voted' | 'unanswered'
  const [questionTab, setQuestionTab] = useState<'interesting' | 'recent' | 'voted' | 'unanswered'>('interesting');
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Questions & infinite feed state
  const [questions, setQuestions] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [votes, setVotes] = useState<Record<string, { count: number; userVote: 'UP' | 'DOWN' | null }>>({});

  // 1. Fetch initial questions when tab changes
  useEffect(() => {
    let isMounted = true;
    const loadQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        setPageNumber(1);
        setHasMore(true);

        const sortBy = questionTab === 'voted' ? 'views' : 'newest';
        const res = await questionApi.getQuestions({
          pageNumber: 1,
          pageSize: 10,
          sortBy,
        });

        if (isMounted) {
          let items = res?.items || [];

          // For 'unanswered' tab, filter questions with 0 answers
          if (questionTab === 'unanswered') {
            items = items.filter((q: any) => (q.answerCount || 0) === 0);
          }

          setQuestions(items);
          if (items.length < 10) {
            setHasMore(false);
          }

          // Load user votes
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
        }
      } catch (err) {
        if (isMounted) {
          setQuestions([]);
          setHasMore(false);
        }
      } finally {
        if (isMounted) setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
    return () => { isMounted = false; };
  }, [questionTab, isAuthenticated]);

  // 2. Load more questions (Infinite Feed)
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = pageNumber + 1;

    try {
      const sortBy = questionTab === 'voted' ? 'views' : 'newest';
      const res = await questionApi.getQuestions({
        pageNumber: nextPage,
        pageSize: 10,
        sortBy,
      });

      const newItems = res?.items || [];
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setQuestions((prev) => [...prev, ...newItems]);
        setPageNumber(nextPage);
        if (newItems.length < 10) setHasMore(false);

        // Update vote state for new items
        setVotes((prev) => {
          const nextVotes = { ...prev };
          newItems.forEach((q: any) => {
            const qId = String(q.questionId);
            if (!nextVotes[qId]) {
              nextVotes[qId] = {
                count: (q.upvoteCount || 0) - (q.downvoteCount || 0),
                userVote: null,
              };
            }
          });
          return nextVotes;
        });
      }
    } catch (err) {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

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

  const studentName = currentUser?.fullName || t("Sinh viên FHub");
  const studentInitials = studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'SV';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. Header Banner & Quick Ask Box */}
      <div className="bg-white dark:bg-[#272727] rounded-2xl p-6 border border-slate-200/90 dark:border-transparent hover:dark:border-[#444444] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0076D1] border border-blue-100 cursor-default"
            title={`${t(campusInfo.fullName)}${campusInfo.address ? `\n${t('Địa chỉ:')} ${campusInfo.address}` : ''}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0076D1]" />
            <span>{t('common.campus', 'Campus')}: {campusInfo.shortName}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('auth.welcomeBack', 'Welcome back to FHub')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            {t('app.tagline', 'Learn, collaborate, share knowledge, and grow with your academic community.')}
          </p>
        </div>

        {/* Quick Ask Button */}
        <button
          onClick={() => setIsAskModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('feed.askQuestion', 'Đặt câu hỏi ngay')}</span>
        </button>
      </div>

      {/* 2. Primary StackOverflow Style Feed Section */}
      <div className="bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent dark:hover:border-[#444444] shadow-2xs overflow-hidden transition-colors">
        {/* Section Header with StackOverflow Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0076D1] flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {questionTab === 'interesting' ? t('feed.interestingTitle', 'Interesting posts for you') : t('nav.questions', 'Questions & Discussions')}
              </h2>
              <p className="text-[11px] text-slate-400">
                {questionTab === 'interesting'
                  ? t('feed.interestingSubtitle', 'Bài viết gợi ý dựa trên môn học và xu hướng trao đổi học thuật của bạn')
                  : t('feed.allQuestionsSubtitle', 'Tất cả câu hỏi và thảo luận học thuật từ cộng đồng sinh viên FPT')}
              </p>
            </div>
          </div>

          {/* StackOverflow Filter Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setQuestionTab('interesting')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                questionTab === 'interesting'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('feed.tabInteresting', 'Dành cho bạn')}</span>
            </button>
            <button
              onClick={() => setQuestionTab('recent')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                questionTab === 'recent'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('feed.tabNewest', 'Mới nhất')}
            </button>
            <button
              onClick={() => setQuestionTab('voted')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                questionTab === 'voted'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('feed.tabTopVoted', 'Bình chọn nhiều')}
            </button>
            <button
              onClick={() => setQuestionTab('unanswered')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                questionTab === 'unanswered'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('feed.tabUnanswered', 'Chưa trả lời')}
            </button>
          </div>
        </div>

        {/* Interesting Posts Info Bar */}
        {questionTab === 'interesting' && (
          <div className="px-5 py-2.5 bg-amber-50/60 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {t('feed.interestingBanner', 'Được cá nhân hóa cho bạn dựa trên các chủ đề trao đổi sôi nổi tại cơ sở FPT của bạn.')}
              </span>
            </div>
            <Link to="/discussions" className="font-bold hover:underline shrink-0 ml-2">
              {t('feed.browseAllDiscussions', 'Xem tất cả thảo luận')} →
            </Link>
          </div>
        )}

        {/* Question Cards Feed */}
        {isLoadingQuestions ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-medium">{t('feed.loadingQuestions', 'Đang tải danh sách câu hỏi...')}</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">{t('feed.emptyQuestions', 'Chưa có câu hỏi hoặc thảo luận nào')}</p>
            <p className="text-[11px] text-slate-400 mt-1">{t('feed.emptyQuestionsDesc', 'Hãy là người đầu tiên đặt câu hỏi để nhận trợ giúp từ bạn học và giảng viên!')}</p>
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="mt-3 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 transition-colors"
            >
              + {t('feed.askQuestionNow', 'Đặt câu hỏi ngay')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {questions.map((q, idx) => {
              const qId = String(q.questionId || q.id || idx);
              const authorName = q.isAnonymous ? t('common.anonymous', 'Ẩn danh FPTer') : (q.authorDisplayName || `Sinh viên #${q.authorUserId || 1}`);
              const voteInfo = votes[qId] || { count: (q.upvoteCount || 0) - (q.downvoteCount || 0), userVote: null };
              const { cleanText, images } = parseQuestionContent(q.body || q.content);

              return (
                <div key={qId} className="p-5 flex flex-col sm:flex-row items-start gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Left: StackOverflow Style Stats Badges Column */}
                  <div className="flex sm:flex-col items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                    {/* Votes Box */}
                    <div className="flex sm:flex-col items-center justify-center px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 min-w-[56px] text-center">
                      <button
                        onClick={() => handleVote(qId, 'UP')}
                        className={`p-0.5 rounded hover:bg-slate-200/60 cursor-pointer transition-colors ${
                          voteInfo.userVote === 'UP' ? 'text-[#0076D1] font-bold' : 'text-slate-400'
                        }`}
                        title={t('common.upvote', 'Bình chọn hữu ích')}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 my-0.5">
                        {voteInfo.count}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">{t('votes', 'phiếu')}</span>
                    </div>

                    {/* Answers Box (StackOverflow Badge) */}
                    <div
                      className={`flex sm:flex-col items-center justify-center px-3 py-1.5 sm:py-2 rounded-xl min-w-[56px] text-center border transition-all ${
                        q.isSolved || q.hasBestAnswer
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : (q.answerCount || 0) > 0
                          ? 'border-emerald-600/70 text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30'
                          : 'border-slate-200/80 dark:border-slate-700 text-slate-400 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-extrabold flex items-center gap-1">
                        {q.isSolved || q.hasBestAnswer ? <CheckCircle2 className="w-3 h-3 text-white" /> : null}
                        {q.answerCount || 0}
                      </span>
                      <span className="text-[9px] uppercase font-semibold">{t('answers', 'trả lời')}</span>
                    </div>

                    {/* Views Count */}
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 px-1">
                      <Eye className="w-3 h-3" />
                      <span>{q.viewCount || q.viewsCount || 0}</span>
                    </div>
                  </div>

                  {/* Right: Question Body & Social Media Attached Media */}
                  <div className="flex-1 min-w-0 space-y-2 w-full">
                    {/* Header: Author & Course Tag */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{authorName}</span>
                        <span className="text-slate-400">
                          • {q.createdAt ? new Date(q.createdAt).toLocaleDateString(locale) : t('common.recent', 'Mới đây')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {q.courseId && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-[#0076D1] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                            #{q.courseCode || `Môn ${q.courseId}`}
                          </span>
                        )}
                        <ContentActionMenu
                          targetType="QUESTION"
                          targetId={qId}
                          targetTitle={q.title}
                          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/discussions/${qId}`}
                        />
                      </div>
                    </div>

                    {/* Question Title */}
                    <Link
                      to={`/discussions/${qId}`}
                      className="block text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 hover:text-[#0076D1] dark:hover:text-blue-400 transition-colors leading-snug"
                    >
                      {q.title}
                    </Link>

                    {/* Clean Question Text (Without messy raw markdown image links) */}
                    {cleanText && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {cleanText}
                      </p>
                    )}

                    {/* Facebook Style Attached Images / GIFs Gallery */}
                    {images.length > 0 && (
                      <Link to={`/discussions/${qId}`} className="block mt-2 group">
                        {images.length === 1 ? (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/5 dark:bg-slate-900 max-h-[360px] flex items-center justify-center shadow-xs">
                            <img
                              src={normalizeMediaUrl(images[0].url)}
                              alt={images[0].alt}
                              loading="lazy"
                              className="w-full h-full max-h-[360px] object-cover group-hover:scale-[1.01] transition-transform duration-200"
                            />
                            {images[0].isGif && (
                              <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold tracking-wider backdrop-blur-xs shadow-xs">
                                GIF
                              </span>
                            )}
                          </div>
                        ) : images.length === 2 ? (
                          <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
                            {images.slice(0, 2).map((img, i) => (
                              <div key={i} className="relative aspect-video bg-slate-950/5 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                <img src={normalizeMediaUrl(img.url)} alt={img.alt} loading="lazy" className="w-full h-full object-cover" />
                                {img.isGif && (
                                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[9px] font-bold tracking-wider">
                                    GIF
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
                            {images.slice(0, 3).map((img, i) => (
                              <div key={i} className="relative aspect-square bg-slate-950/5 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                <img src={normalizeMediaUrl(img.url)} alt={img.alt} loading="lazy" className="w-full h-full object-cover" />
                                {i === 2 && images.length > 3 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm">
                                    +{images.length - 2}
                                  </div>
                                )}
                                {img.isGif && (
                                  <span className="absolute bottom-1.5 left-1.5 px-1 py-0.5 rounded bg-black/80 text-white font-mono text-[9px] font-bold tracking-wider">
                                    GIF
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </Link>
                    )}

                    {/* Footer: Tags & Action Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleBookmark(qId)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                            bookmarkedIds.has(qId) ? 'text-[#0076D1] font-bold' : ''
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.has(qId) ? 'fill-[#0076D1]' : ''}`} />
                          <span>{t('common.bookmark', 'Lưu')}</span>
                        </button>
                      </div>

                      <Link
                        to={`/discussions/${qId}`}
                        className="text-xs font-semibold text-[#0076D1] hover:underline flex items-center gap-1"
                      >
                        <span>{t('common.viewDetails', 'Xem chi tiết & Thảo luận')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Infinite Feed Loader / Load More Button */}
        {questions.length > 0 && (
          <div className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-center">
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('feed.loadingMore', 'Đang tải thêm câu hỏi...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('feed.loadMore', 'Tải thêm thảo luận')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            ) : (
              <p className="text-xs text-slate-400 font-medium py-1">
                {t('feed.allLoaded', 'Bạn đã xem hết các câu hỏi gần đây.')}
              </p>
            )}
          </div>
        )}
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
