import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileCode,
  GraduationCap,
  Sparkles,
  HelpCircle,
  Plus,
  MessageSquare,

  Bookmark,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Loader2,
  CheckCircle2,
  BookOpen,
  Award,
  Layers,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRealtime } from '../../context/RealtimeContext';
import { questionApi } from '../../services/api/contentApi';
import { profileApi, voteApi, bookmarkApi } from '../../services/api/studentApi';
import { AskQuestionModal } from '../discussions/AskQuestionModal';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import { normalizeMediaUrl } from '../../utils/mediaUtils';
import { resolveUserMajorName, FPT_CAMPUSES } from '../../utils/taxonomyUtils';
import { extractStudentIdFromEmail } from '../../utils/fptEmailValidator';

// Helper to extract media and clean text from markdown body
const parseBodyMedia = (rawBody: string = '') => {
  if (!rawBody) return { cleanText: '', mediaUrls: [] };
  const mediaUrls: string[] = [];
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = imgRegex.exec(rawBody)) !== null) {
    if (match[2]) {
      mediaUrls.push(match[2].trim());
    }
  }
  const cleanText = rawBody.replace(imgRegex, '').replace(/\s+/g, ' ').trim();
  return { cleanText, mediaUrls };
};

// Module-level in-memory cache to eliminate duplicate author profile fetches across tab changes
const globalAuthorProfileCache: Record<number, { fullName: string; avatarUrl?: string }> = {};

export const FeedPage: React.FC = () => {
  const { currentUser, currentCampus } = useAuth();
  const { t, locale } = useLanguage();
  const { on } = useRealtime();
  const navigate = useNavigate();

  // State
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [questionTab, setQuestionTab] = useState<'interesting' | 'all'>('interesting');
  const [feedFilter, setFeedFilter] = useState<'newest' | 'votes' | 'unanswered'>('newest');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Author profiles cache (id -> { fullName, avatarUrl })
  const [authorProfiles, setAuthorProfiles] = useState<Record<number, { fullName: string; avatarUrl?: string }>>(() => ({ ...globalAuthorProfileCache }));

  // Votes & Bookmarks local state
  const [votes, setVotes] = useState<Record<string, { count: number; userVote: 'UP' | 'DOWN' | null }>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkMap, setBookmarkMap] = useState<Map<string, number | string>>(new Map());

  // Campus info
  const campusMap: Record<string, { shortName: string; fullName: string; address?: string }> = {
    HL: { shortName: 'Hòa Lạc', fullName: 'FPT University - Hòa Lạc (Hà Nội)', address: 'Khu CNC Hòa Lạc, Km 29 Đại lộ Thăng Long, H. Thạch Thất, Hà Nội' },
    HN: { shortName: 'Hòa Lạc', fullName: 'FPT University - Hòa Lạc (Hà Nội)', address: 'Khu CNC Hòa Lạc, Km 29 Đại lộ Thăng Long, H. Thạch Thất, Hà Nội' },
    HCM: { shortName: 'TP. Hồ Chí Minh', fullName: 'FPT University - TP. Hồ Chí Minh', address: 'Lô E2a-7, Đường D1 Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. HCM' },
    DN: { shortName: 'Đà Nẵng', fullName: 'FPT University - Đà Nẵng', address: 'Khu đô thị công nghệ FPT Đà Nẵng, P. Hòa Hải, Q. Ngũ Hành Sơn, TP. Đà Nẵng' },
    CT: { shortName: 'Cần Thơ', fullName: 'FPT University - Cần Thơ', address: 'Số 600 đường Nguyễn Văn Cừ (nối dài), P. An Bình, Q. Ninh Kiều, TP. Cần Thơ' },
    QN: { shortName: 'Quy Nhơn', fullName: 'FPT University - Quy Nhơn', address: 'Khu đô thị An Phú Thịnh, P. Nhơn Bình & Đống Đa, TP. Quy Nhơn, Tỉnh Bình Định' },
  };

  const campusInfo = campusMap[currentCampus || 'HL'] || campusMap.HL;
  const studentName = currentUser?.fullName || t('common.student', 'Sinh viên FHub');
  const studentInitials = studentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'SV';
  const currentUserMajor = resolveUserMajorName(currentUser);
  const studentIdDisplay = currentUser?.studentId || extractStudentIdFromEmail(currentUser?.email) || '';

  // Fetch Questions (Valid SortBy: newest, oldest, views, answers)
  const loadQuestions = async (targetPage: number = 1, append: boolean = false) => {
    try {
      if (targetPage === 1) setLoading(true);
      else setLoadingMore(true);

      const params: any = {
        pageNumber: targetPage,
        pageSize: 10,
      };

      // Backend validator strictly accepts: newest, oldest, views, answers
      if (feedFilter === 'votes') {
        params.sortBy = 'views';
      } else if (feedFilter === 'unanswered') {
        params.sortBy = 'newest';
      } else {
        params.sortBy = 'newest';
      }

      const res = await questionApi.getQuestions(params);
      let items = res?.items || [];

      // Filter for unanswered if requested
      if (feedFilter === 'unanswered') {
        items = items.filter((q: any) => (q.answerCount || 0) === 0);
      }

      // Handle sorting:
      if (feedFilter === 'votes') {
        items.sort((a: any, b: any) => {
          const scoreA = (a.upvoteCount || 0) - (a.downvoteCount || 0);
          const scoreB = (b.upvoteCount || 0) - (b.downvoteCount || 0);
          return scoreB - scoreA;
        });
      } else if (questionTab === 'interesting') {
        // Priority order for "For You" (Dành cho bạn):
        // Pinned first, then high interaction (answers + views), then newest
        items.sort((a: any, b: any) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          const scoreA = (a.answerCount || 0) * 3 + (a.viewCount || 0);
          const scoreB = (b.answerCount || 0) * 3 + (b.viewCount || 0);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }

      if (append) {
        setQuestions(prev => [...prev, ...items]);
      } else {
        setQuestions(items);
      }

      setHasMore(items.length >= 10);
      setPage(targetPage);

      // Initialize votes state with fallback scores
      const newVotes: Record<string, { count: number; userVote: 'UP' | 'DOWN' | null }> = {};
      items.forEach((q: any) => {
        const qId = String(q.questionId || q.id);
        const numId = Number(String(q.questionId || q.id).replace(/\D/g, ''));
        const fallbackCount = (q.upvoteCount || 0) - (q.downvoteCount || 0);
        const entry = { count: fallbackCount, userVote: null as 'UP' | 'DOWN' | null };
        newVotes[qId] = entry;
        if (!isNaN(numId) && numId > 0) {
          newVotes[String(numId)] = entry;
        }
      });
      setVotes(prev => ({ ...prev, ...newVotes }));

      // Synchronize user votes efficiently using 1 single getMyVotes call (reduces 10 parallel HTTP requests)
      if (currentUser && items.length > 0) {
        voteApi.getMyVotes()
          .then(myVotes => {
            const myVoteMap: Record<number, number> = {};
            myVotes.forEach((v: any) => {
              if (v.targetType === 'QUESTION') {
                myVoteMap[Number(v.targetId)] = v.voteValue;
              }
            });
            setVotes(prev => {
              const updated = { ...prev };
              items.forEach((q: any) => {
                const qId = String(q.questionId || q.id);
                const numId = Number(String(q.questionId || q.id).replace(/\D/g, ''));
                const myVal = myVoteMap[numId];
                if (myVal !== undefined) {
                  const currentScore = updated[qId]?.count ?? ((q.upvoteCount || 0) - (q.downvoteCount || 0));
                  const entry = {
                    count: currentScore,
                    userVote: myVal === 1 ? ('UP' as const) : myVal === -1 ? ('DOWN' as const) : null,
                  };
                  updated[qId] = entry;
                  if (!isNaN(numId) && numId > 0) updated[String(numId)] = entry;
                }
              });
              return updated;
            });
          })
          .catch(() => {});
      }

      // Batch load missing author profiles asynchronously using global cache to prevent redundant requests
      const missingAuthorIds = Array.from(new Set(
        items
          .filter((q: any) => !q.isAnonymous && q.authorUserId && q.authorUserId !== Number(currentUser?.id))
          .map((q: any) => Number(q.authorUserId))
      )).filter(id => !globalAuthorProfileCache[id]);

      if (missingAuthorIds.length > 0) {
        Promise.allSettled(missingAuthorIds.map(id => profileApi.getProfile(id)))
          .then(results => {
            const mappedProfiles: Record<number, { fullName: string; avatarUrl?: string }> = {};
            results.forEach((r, idx) => {
              if (r.status === 'fulfilled' && r.value) {
                const val = r.value;
                const authorId = missingAuthorIds[idx];
                const prof = {
                  fullName: val.fullName || val.displayName || '',
                  avatarUrl: val.avatarUrl || '',
                };
                globalAuthorProfileCache[authorId] = prof;
                mappedProfiles[authorId] = prof;
              }
            });
            if (Object.keys(mappedProfiles).length > 0) {
              setAuthorProfiles(prev => ({ ...prev, ...mappedProfiles }));
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      console.warn('Could not fetch questions feed:', err);
      if (!append) setQuestions([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadQuestions(1, false);
  }, [questionTab, feedFilter]);

  const handleVote = async (questionId: string, direction: 'UP' | 'DOWN') => {
    const current = votes[questionId] || { count: 0, userVote: null };
    const numericId = Number(String(questionId).replace(/\D/g, ''));
    const voteValue = direction === 'UP' ? 1 : -1;

    let nextVote: 'UP' | 'DOWN' | null = direction;
    let nextCount = current.count;

    if (current.userVote === direction) {
      nextVote = null;
      nextCount -= voteValue;
    } else if (current.userVote) {
      nextCount += voteValue * 2;
    } else {
      nextCount += voteValue;
    }

    const optimistic = { count: nextCount, userVote: nextVote };
    setVotes(prev => ({
      ...prev,
      [questionId]: optimistic,
      ...(numericId > 0 ? { [String(numericId)]: optimistic } : {}),
    }));

    if (!isNaN(numericId) && numericId > 0) {
      try {
        await voteApi.vote({
          target_type: 'QUESTION',
          target_id: numericId,
          vote_value: voteValue,
        });
        const stats = await voteApi.getStats('QUESTION', numericId);
        const finalEntry = {
          count: stats.score,
          userVote: stats.myVoteValue === 1 ? 'UP' as const : stats.myVoteValue === -1 ? 'DOWN' as const : null,
        };
        setVotes(prev => ({
          ...prev,
          [questionId]: finalEntry,
          [String(numericId)]: finalEntry,
        }));
      } catch (err) {
        console.warn('Vote submission error:', err);
        // Rollback optimistic update on error
        setVotes(prev => ({
          ...prev,
          [questionId]: current,
          ...(numericId > 0 ? { [String(numericId)]: current } : {}),
        }));
      }
    }
  };

  const toggleBookmark = async (id: string) => {
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

  // Helper to resolve accurate author name without "Sinh viên [id]"
  const getAuthorName = (q: any) => {
    if (q.isAnonymous) return t('common.anonymous', 'Ẩn danh FPTer');
    const authorId = Number(q.authorUserId || q.author?.id);
    if (authorId && currentUser?.id && String(authorId) === String(currentUser.id)) {
      return currentUser.fullName || (currentUser as any)?.displayName || currentUser.email?.split('@')[0] || t('common.you', 'Bạn');
    }
    // 1. Check author fields if not a placeholder
    const rawName = q.authorDisplayName || q.author?.fullName || q.author?.name;
    if (rawName && typeof rawName === 'string' && rawName.trim()) {
      const trimmed = rawName.trim();
      const isPlaceholder =
        trimmed.startsWith('Sinh viên') ||
        trimmed.startsWith('User #') ||
        trimmed === 'Thành viên FHub' ||
        trimmed === 'FHub Member' ||
        trimmed === 'Anonymous Student';
      if (!isPlaceholder) return trimmed;
    }
    // 2. Check loaded profile from profile-service
    if (authorId && authorProfiles[authorId]?.fullName) {
      return authorProfiles[authorId].fullName;
    }
    // 3. Check known seed users in FPT system as fallback
    const knownUsers: Record<number, string> = {
      1: 'Nguyễn Văn An',
      2: 'Trần Minh Hoàng',
      3: 'Lê Thị Mai',
      4: 'Phạm Đức Anh',
      5: 'Đỗ Hoàng Nam',
      6: 'Vũ Hải Đăng',
      7: 'Bùi Phương Thảo',
      8: 'Ngô Quốc Bảo',
      9: 'Lê Thị Thu Thảo',
      10: 'Trần Văn Mạnh',
    };
    if (authorId && knownUsers[authorId]) {
      return knownUsers[authorId];
    }
    return t('common.fhubMember', 'Thành viên FHub');
  };

  const getAuthorAvatar = (q: any) => {
    if (q.isAnonymous) return '';
    const authorId = Number(q.authorUserId || q.author?.id);
    if (authorId && currentUser?.id && String(authorId) === String(currentUser.id) && currentUser.avatarUrl) {
      return currentUser.avatarUrl;
    }
    if (authorId && authorProfiles[authorId]?.avatarUrl) {
      return authorProfiles[authorId].avatarUrl;
    }
    if (q.author?.avatarUrl && q.author.avatarUrl.trim()) return q.author.avatarUrl.trim();
    if (q.authorAvatarUrl && q.authorAvatarUrl.trim()) return q.authorAvatarUrl.trim();
    return '';
  };

  return (
    <div className="space-y-6">
      {/* 3.A Welcome Header (Restored Figma #86:118) */}
      <div className="bg-white dark:bg-[#272727] rounded-2xl p-6 border border-slate-200/90 dark:border-transparent dark:hover:border-[#444444] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1.5">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#0076D1] dark:text-blue-400 border border-blue-100 dark:border-blue-800 cursor-default"
            title={`${t(campusInfo.fullName)}${campusInfo.address ? `\n${t('Địa chỉ:')} ${campusInfo.address}` : ''}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0076D1] dark:bg-blue-400" />
            <span>{t('common.campus', 'Campus')}: {campusInfo.shortName}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('auth.welcomeBack', 'Chào mừng trở lại FHub')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            {t('app.tagline', 'Học tập, cộng tác, chia sẻ kiến thức và cùng phát triển với cộng đồng học thuật của bạn.')}
          </p>
        </div>

        {/* Right user badge */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#333333] p-2.5 px-4 rounded-xl border border-slate-100 dark:border-[#272727] shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#0076D1] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 dark:ring-blue-900 shrink-0 overflow-hidden">
            {currentUser?.avatarUrl ? (
              <img
                src={normalizeMediaUrl(currentUser.avatarUrl)}
                alt={studentName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as any).style.display = 'none'; }}
              />
            ) : (
              <span>{studentInitials}</span>
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{studentName}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]" title={currentUserMajor}>
                {currentUserMajor}
              </span>
              {studentIdDisplay && (
                <>
                  <span className="text-slate-300 dark:text-slate-600 text-[10px]">•</span>
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                    {studentIdDisplay}
                  </span>
                </>
              )}
              <span className="text-slate-300 dark:text-slate-600 text-[10px]">•</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-100 dark:border-emerald-800">
                {currentUser?.karma || 0} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3.B Quick Navigation Shortcuts (8 Core Modules from Figma #86:137 - Restored Compact Style) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t('feed.quickShortcuts', 'Phím tắt truy cập nhanh')}
          </h2>
          <span className="text-[11px] text-slate-400">{t('feed.eightModules', '8 phân hệ học tập')}</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-2.5">
          {[
            { label: t('nav.workflows', 'Quy trình'), path: '/workflows', icon: Layers, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400' },
            { label: t('nav.articles', 'Bài viết'), path: '/articles', icon: FileCode, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400' },
            { label: t('nav.materials', 'Tài liệu'), path: '/materials', icon: BookOpen, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400' },
            { label: t('nav.ratings', 'Đánh giá'), path: '/course-ratings', icon: Sparkles, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400' },
            { label: t('nav.courses', 'Môn học'), path: '/courses', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400' },
            { label: t('nav.discussions', 'Thảo luận'), path: '/discussions', icon: HelpCircle, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400' },
            { label: t('nav.helpdesk', 'Hỗ trợ'), path: '/support', icon: LifeBuoy, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 dark:text-teal-400' },
            { label: t('nav.reputation', 'Uy tín'), path: '/reputation', icon: Award, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50 dark:text-orange-400' },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <Link
                key={idx}
                to={item.path}
                className="h-[76px] sm:h-[84px] p-2 flex flex-col items-center justify-between bg-white dark:bg-[#272727] rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-transparent hover:border-blue-400 dark:hover:border-[#444444] dark:hover:bg-[#333333] hover:shadow-xs transition-all text-center group cursor-pointer shadow-2xs"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${item.color}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#0076D1] dark:group-hover:text-blue-400 leading-tight text-center truncate w-full px-0.5">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3.C Academic Resource Shortcuts (Study Materials & Documents Banner - Restored) */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent rounded-2xl p-4 sm:p-5 border border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0076D1] text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('feed.resourceLibraryTitle', 'Kho lưu trữ tài liệu học tập FPT')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('feed.resourceLibraryDesc', 'Đóng góp slide, đề thi mẫu, đồ án và tài liệu học tập để tích lũy điểm uy tín và mở khóa huy hiệu.')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Link
            to="/materials"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#0076D1] dark:text-blue-400 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 transition-colors shadow-2xs"
          >
            {t('feed.exploreMaterials', 'Khám phá tài liệu')}
          </Link>
        </div>
      </div>

      {/* 3.D Questions & Academic Discussions (Main Feed Section) */}
      <div className="bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent dark:hover:border-[#444444] shadow-2xs overflow-hidden transition-colors">
        {/* Section Header: Title, clean Subtitle without unwanted banners, and Ask Button */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0076D1] dark:text-blue-400 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {t('nav.questions', 'Hỏi đáp & Thảo luận')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('feed.discussionsSubtitle', 'Trao đổi kiến thức học thuật, đặt câu hỏi và cùng giải đáp thắc mắc.')}
              </p>
            </div>
          </div>

          {/* Action: Ask Question Button */}
          <button
            onClick={() => setIsAskModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 transition-all cursor-pointer shadow-xs shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('feed.askQuestionNow', 'Đặt câu hỏi ngay')}</span>
          </button>
        </div>

        {/* Optimized Filter Bar: No icons, No scrollbars, Modern pill buttons */}
        <div className="px-4 py-3 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Pill Tabs */}
          <div className="flex flex-wrap items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 gap-1">
            <button
              onClick={() => { setQuestionTab('interesting'); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                questionTab === 'interesting'
                  ? 'bg-white dark:bg-slate-700 text-[#0076D1] dark:text-blue-400 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('feed.forYou', 'Dành cho bạn')}
            </button>
            <button
              onClick={() => { setQuestionTab('all'); setFeedFilter('newest'); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                questionTab === 'all' && feedFilter === 'newest'
                  ? 'bg-white dark:bg-slate-700 text-[#0076D1] dark:text-blue-400 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('feed.recent', 'Mới nhất')}
            </button>
            <button
              onClick={() => { setQuestionTab('all'); setFeedFilter('votes'); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                questionTab === 'all' && feedFilter === 'votes'
                  ? 'bg-white dark:bg-slate-700 text-[#0076D1] dark:text-blue-400 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('feed.topVoted', 'Bình chọn nhiều')}
            </button>
            <button
              onClick={() => { setQuestionTab('all'); setFeedFilter('unanswered'); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                questionTab === 'all' && feedFilter === 'unanswered'
                  ? 'bg-white dark:bg-slate-700 text-[#0076D1] dark:text-blue-400 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('feed.unanswered', 'Chưa trả lời')}
            </button>
          </div>
        </div>

        {/* Questions Feed Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0076D1]" />
            <p className="text-xs">{t('common.loading', 'Đang tải danh sách câu hỏi...')}</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              {t('feed.emptyQuestions', 'Chưa có câu hỏi nào trong danh mục này')}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {t('feed.emptyQuestionsDesc', 'Hãy là người đầu tiên đặt câu hỏi để nhận trợ giúp từ bạn học và giảng viên!')}
            </p>
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="mt-3 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 transition-colors shadow-2xs"
            >
              + {t('feed.askQuestionNow', 'Đặt câu hỏi ngay')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {questions.map((q, idx) => {
              const qId = String(q.questionId || q.id || idx);
              const authorName = getAuthorName(q);
              const voteInfo = votes[qId] || {
                count: (q.upvoteCount || 0) - (q.downvoteCount || 0),
                userVote: null,
              };

              // Extract images & clean text snippet
              const { cleanText, mediaUrls } = parseBodyMedia(q.body || q.content || '');

              return (
                <div
                  key={qId}
                  className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Left: Compact Vertical Vote Counter */}
                  <div className="flex flex-col items-center justify-center min-w-[42px] bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-1 shrink-0 self-start shadow-2xs">
                    <button
                      onClick={() => handleVote(qId, 'UP')}
                      className={`p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
                        voteInfo.userVote === 'UP' ? 'text-[#0076D1] font-bold' : 'text-slate-400'
                      }`}
                      title="Bình chọn tích cực (Upvote)"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 my-0.5">
                      {voteInfo.count}
                    </span>
                    <button
                      onClick={() => handleVote(qId, 'DOWN')}
                      className={`p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
                        voteInfo.userVote === 'DOWN' ? 'text-rose-600 font-bold' : 'text-slate-400'
                      }`}
                      title="Bình chọn tiêu cực (Downvote)"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right: Question Body & Media Preview */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header: Author & Course Tag */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {q.isAnonymous ? (
                          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-[10px] shrink-0 border border-purple-200 dark:border-purple-800">
                            ?
                          </div>
                        ) : (
                          <img
                            src={normalizeMediaUrl(getAuthorAvatar(q)) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={authorName}
                            className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                        )}
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {authorName}
                        </span>
                        {q.isAnonymous && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/60 font-semibold">
                            {t('common.anonymous', 'Ẩn danh')}
                          </span>
                        )}
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

                    {/* Clean Question Text */}
                    {cleanText && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {cleanText}
                      </p>
                    )}

                    {/* Facebook-style Attached Media / Image Grid */}
                    {mediaUrls.length > 0 && (
                      <div className="pt-1">
                        {mediaUrls.length === 1 ? (
                          <div className="relative group max-w-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900/5">
                            <img
                              src={normalizeMediaUrl(mediaUrls[0])}
                              alt="Đính kèm"
                              className="w-full max-h-80 object-cover rounded-xl hover:scale-[1.01] transition-transform cursor-pointer"
                              onClick={() => navigate(`/discussions/${qId}`)}
                            />
                            {mediaUrls[0].toLowerCase().includes('.gif') && (
                              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white tracking-wider">
                                GIF
                              </span>
                            )}
                          </div>
                        ) : mediaUrls.length === 2 ? (
                          <div className="grid grid-cols-2 gap-1.5 max-w-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            {mediaUrls.slice(0, 2).map((url, imgIdx) => (
                              <div key={imgIdx} className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <img
                                  src={normalizeMediaUrl(url)}
                                  alt="Đính kèm"
                                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() => navigate(`/discussions/${qId}`)}
                                />
                                {url.toLowerCase().includes('.gif') && (
                                  <span className="absolute top-1.5 left-1.5 px-1 py-0.2 rounded bg-black/70 text-[9px] font-bold text-white">
                                    GIF
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-1.5 max-w-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            {mediaUrls.slice(0, 3).map((url, imgIdx) => (
                              <div key={imgIdx} className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <img
                                  src={normalizeMediaUrl(url)}
                                  alt="Đính kèm"
                                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() => navigate(`/discussions/${qId}`)}
                                />
                                {imgIdx === 2 && mediaUrls.length > 3 && (
                                  <div
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm cursor-pointer"
                                    onClick={() => navigate(`/discussions/${qId}`)}
                                  >
                                    +{mediaUrls.length - 2}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Metadata & Action Row */}
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 font-medium">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          {q.answerCount || 0} {t('common.answersCount', 'câu trả lời')}
                        </span>
                        <button
                          onClick={() => toggleBookmark(qId)}
                          className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                            bookmarkedIds.has(qId)
                              ? 'text-[#0076D1] dark:text-blue-400 font-bold'
                              : 'text-slate-500 hover:text-[#0076D1] dark:hover:text-blue-400'
                          }`}
                          title={bookmarkedIds.has(qId) ? t('common.saved', 'Đã lưu') : t('common.bookmark', 'Lưu')}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.has(qId) ? 'fill-current' : ''}`} />
                          <span>{bookmarkedIds.has(qId) ? t('common.saved', 'Đã lưu') : t('common.bookmark', 'Lưu')}</span>
                        </button>
                      </div>

                      <Link
                        to={`/discussions/${qId}`}
                        className="text-xs font-semibold text-[#0076D1] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{t('common.viewQuestion', 'Xem chi tiết')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button for Infinite Feed Exploration */}
        {hasMore && !loading && questions.length > 0 && (
          <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
            <button
              onClick={() => loadQuestions(page + 1, true)}
              disabled={loadingMore}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#0076D1] dark:hover:border-blue-400 hover:text-[#0076D1] transition-all cursor-pointer shadow-2xs inline-flex items-center gap-2"
            >
              {loadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loadingMore ? t('common.loading', 'Đang tải thêm...') : t('feed.loadMore', 'Xem thêm câu hỏi...')}</span>
            </button>
          </div>
        )}

        {/* Footer: Clean View All Link */}
        <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            to="/discussions"
            className="text-xs font-bold text-[#0076D1] dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
          >
            <span>{t('common.viewAllQuestions', 'Xem tất cả thảo luận')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onCreated={() => {
          setIsAskModalOpen(false);
          loadQuestions(1, false);
        }}
      />
    </div>
  );
};
