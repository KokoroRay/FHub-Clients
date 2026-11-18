import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  LifeBuoy,
  Share2,
  Heart,
  Clock,
  Check,
  Trash2,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api/client';
import { useLanguage } from '../../context/LanguageContext';
import { useRealtime } from '../../context/RealtimeContext';
import { questionApi, articleApi, workflowApi } from '../../services/api/contentApi';
import { profileApi, voteApi, bookmarkApi, notificationApi } from '../../services/api/studentApi';
import { AskQuestionModal } from '../discussions/AskQuestionModal';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import { SocialShareModal } from '../../components/common/SocialShareModal';
import { UserHoverCard } from '../../components/common/UserHoverCard';
import { normalizeMediaUrl } from '../../utils/mediaUtils';
import { resolveUserMajorName } from '../../utils/taxonomyUtils';
import { extractStudentIdFromEmail, formatDisplayDate, calculateReadingTime, isUserAlumni } from '../../utils/fptEmailValidator';

// Clean Article Cover Preview component: if loading errors, cleanly renders nothing (no empty gray box)
const ArticleFeedCover: React.FC<{ url: string; title: string; onClick: () => void }> = ({ url, title, onClick }) => {
  const [hasError, setHasError] = useState(false);
  if (hasError || !url) return null;
  return (
    <div className="pt-1 max-w-md">
      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
        <img
          src={normalizeMediaUrl(url)}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
          onClick={onClick}
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
};

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

export type FeedContentType = 'ALL' | 'QUESTION' | 'ARTICLE' | 'WORKFLOW';

export interface UnifiedFeedItem {
  type: 'QUESTION' | 'ARTICLE' | 'WORKFLOW';
  id: string; // e.g. "q-12", "art-34", "wf-56"
  numericId: number;
  title: string;
  summary: string;
  createdAt: string;
  authorUserId?: number;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  isAnonymous?: boolean;
  isAlumni?: boolean;
  courseId?: number;
  courseCode?: string;
  status: string;
  isPinned?: boolean;
  // Question specifics
  answerCount?: number;
  upvoteCount?: number;
  downvoteCount?: number;
  mediaUrls?: string[];
  // Article specifics
  coverImageUrl?: string;
  readTimeMinutes?: number;
  tags?: string[];
  // Workflow specifics
  stepCount?: number;
}

export const FeedPage: React.FC = () => {
  const { currentUser, currentCampus } = useAuth();
  const { t, locale } = useLanguage();
  const { on } = useRealtime();
  const navigate = useNavigate();

  // Feed Filter State
  const [contentTypeFilter, setContentTypeFilter] = useState<FeedContentType>('ALL');
  const [feedSort, setFeedSort] = useState<'forYou' | 'newest' | 'votes' | 'unanswered'>('forYou');

  // Items and Pagination State
  const [feedItems, setFeedItems] = useState<UnifiedFeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Modals & Interactivity
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [shareModalData, setShareModalData] = useState<{ isOpen: boolean; title: string; url: string; description?: string } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: string; numericId: number; title: string; type: 'QUESTION' | 'ARTICLE' | 'WORKFLOW' } | null>(null);

  // Author Profiles Cache (id -> { fullName, avatarUrl })
  const [authorProfiles, setAuthorProfiles] = useState<Record<number, { fullName: string; avatarUrl?: string }>>(() => ({ ...globalAuthorProfileCache }));

  // Votes & Bookmarks local state
  const [votes, setVotes] = useState<Record<string, { count: number; userVote: 'UP' | 'DOWN' | null }>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkMap, setBookmarkMap] = useState<Map<string, number | string>>(new Map());

  // Infinite Scroll Sentinel ref
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Campus Info
  const campusMap: Record<string, { shortName: string; fullName: string; address?: string }> = {
    ALL: { shortName: 'Global', fullName: 'FPT University - Toàn hệ thống (Global)', address: 'Tất cả các phân hiệu FPT trên toàn quốc' },
    GLOBAL: { shortName: 'Global', fullName: 'FPT University - Toàn hệ thống (Global)', address: 'Tất cả các phân hiệu FPT trên toàn quốc' },
    HL: { shortName: 'Hòa Lạc', fullName: 'FPT University - Hòa Lạc (Hà Nội)', address: 'Khu CNC Hòa Lạc, Km 29 Đại lộ Thăng Long, H. Thạch Thất, Hà Nội' },
    HN: { shortName: 'Hòa Lạc', fullName: 'FPT University - Hòa Lạc (Hà Nội)', address: 'Khu CNC Hòa Lạc, Km 29 Đại lộ Thăng Long, H. Thạch Thất, Hà Nội' },
    HCM: { shortName: 'TP. Hồ Chí Minh', fullName: 'FPT University - TP. Hồ Chí Minh', address: 'Lô E2a-7, Đường D1 Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. HCM' },
    DN: { shortName: 'Đà Nẵng', fullName: 'FPT University - Đà Nẵng', address: 'Khu đô thị công nghệ FPT Đà Nẵng, P. Hòa Hải, Q. Ngũ Hành Sơn, TP. Đà Nẵng' },
    CT: { shortName: 'Cần Thơ', fullName: 'FPT University - Cần Thơ', address: 'Số 600 đường Nguyễn Văn Cừ (nối dài), P. An Bình, Q. Ninh Kiều, TP. Cần Thơ' },
    QN: { shortName: 'Quy Nhơn', fullName: 'FPT University - Quy Nhơn', address: 'Khu đô thị An Phú Thịnh, P. Nhơn Bình & Đống Đa, TP. Quy Nhơn, Tỉnh Bình Định' },
  };

  const campusInfo = campusMap[currentCampus || 'ALL'] || campusMap.ALL;
  const studentName = currentUser?.fullName || t('common.student', 'Sinh viên FHub');
  const studentInitials = studentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'SV';
  const currentUserMajor = resolveUserMajorName(currentUser);
  const studentIdDisplay = currentUser?.studentId || extractStudentIdFromEmail(currentUser?.email) || '';

  // ─── Fetch 3 Sources Unified Feed ───────────────────────────────────────────
  const loadFeed = async (targetPage: number = 1, append: boolean = false) => {
    try {
      if (targetPage === 1) setLoading(true);
      else setLoadingMore(true);

      const fetchQuestions = contentTypeFilter === 'ALL' || contentTypeFilter === 'QUESTION';
      const fetchArticles = contentTypeFilter === 'ALL' || contentTypeFilter === 'ARTICLE';
      const fetchWorkflows = contentTypeFilter === 'ALL' || contentTypeFilter === 'WORKFLOW';

      const qPageSize = contentTypeFilter === 'QUESTION' ? 12 : 6;
      const aPageSize = contentTypeFilter === 'ARTICLE' ? 12 : 4;
      const wPageSize = contentTypeFilter === 'WORKFLOW' ? 12 : 4;

      const qParams: any = {
        pageNumber: targetPage,
        pageSize: qPageSize,
        sortBy: feedSort === 'votes' ? 'views' : 'newest',
      };

      const [questionsRes, articlesRes, workflowsRes] = await Promise.allSettled([
        fetchQuestions ? questionApi.getQuestions(qParams) : Promise.resolve({ items: [] }),
        fetchArticles ? articleApi.getArticles({ pageNumber: targetPage, pageSize: aPageSize, status: 'PUBLISHED' }) : Promise.resolve({ items: [] }),
        fetchWorkflows ? workflowApi.getWorkflows({ pageNumber: targetPage, pageSize: wPageSize, status: 'PUBLISHED' }) : Promise.resolve({ items: [] }),
      ]);

      const newUnifiedItems: UnifiedFeedItem[] = [];
      let sourceHadMore = false;

      // 1. Process Questions
      if (questionsRes.status === 'fulfilled' && questionsRes.value?.items) {
        let qItems = questionsRes.value.items.filter((q: any) =>
          q.status === 'OPEN' || q.status === 'RESOLVED' || q.status === 'CLOSED'
        );
        if (feedSort === 'unanswered') {
          qItems = qItems.filter((q: any) => (q.answerCount || 0) === 0);
        }
        if (questionsRes.value.items.length >= qPageSize) sourceHadMore = true;

        qItems.forEach((q: any) => {
          const numId = Number(String(q.questionId || q.id).replace(/\D/g, ''));
          const { cleanText, mediaUrls } = parseBodyMedia(q.body || q.content || '');
          newUnifiedItems.push({
            type: 'QUESTION',
            id: `q-${numId || q.questionId || q.id}`,
            numericId: numId || q.questionId || q.id,
            title: q.title,
            summary: cleanText,
            createdAt: q.createdAt || new Date().toISOString(),
            authorUserId: q.authorUserId || q.author?.id,
            authorDisplayName: q.authorDisplayName || q.author?.fullName || q.author?.name,
            authorAvatarUrl: q.authorAvatarUrl || q.author?.avatarUrl,
            isAnonymous: Boolean(q.isAnonymous),
            courseId: q.courseId,
            courseCode: q.courseCode,
            status: q.status,
            isPinned: Boolean(q.isPinned),
            answerCount: q.answerCount || 0,
            upvoteCount: q.upvoteCount || 0,
            downvoteCount: q.downvoteCount || 0,
            mediaUrls,
            isAlumni: Boolean(
              q.isAlumni ||
              (q.author && q.author.role === 'Alumni') ||
              isUserAlumni(q.authorDisplayName || q.author?.fullName || q.author?.studentCode)
            ),
          });
        });
      }

      // 2. Process Articles
      if (articlesRes.status === 'fulfilled' && articlesRes.value?.items) {
        const aItems = articlesRes.value.items.filter((a: any) =>
          !a.status || a.status === 'PUBLISHED'
        );
        if (articlesRes.value.items.length >= aPageSize) sourceHadMore = true;

        aItems.forEach((a: any) => {
          const numId = Number(String(a.articleId || a.id).replace(/\D/g, ''));
          newUnifiedItems.push({
            type: 'ARTICLE',
            id: `art-${numId || a.articleId || a.id}`,
            numericId: numId || a.articleId || a.id,
            title: a.title,
            summary: a.summary || a.title,
            createdAt: a.createdAt || a.publishedAt || new Date().toISOString(),
            authorUserId: a.authorUserId,
            authorDisplayName: (a as any).authorDisplayName || (a as any).authorName,
            authorAvatarUrl: (a as any).authorAvatarUrl,
            coverImageUrl: a.coverImageUrl ? normalizeMediaUrl(a.coverImageUrl) : undefined,
            status: a.status || 'PUBLISHED',
            isPinned: false,
            upvoteCount: (a as any).upvoteCount ?? (a as any).likeCount ?? 0,
            downvoteCount: (a as any).downvoteCount ?? 0,
            isAlumni: Boolean(
              a.isAlumni ||
              (a as any).authorRole === 'Alumni' ||
              isUserAlumni((a as any).authorDisplayName || (a as any).authorName) ||
              isUserAlumni({ email: (a as any).authorEmail, studentId: (a as any).authorStudentId })
            ),
            readTimeMinutes: calculateReadingTime(a.summary, a.summary, a.title),
          });
        });
      }

      // 3. Process Workflows
      if (workflowsRes.status === 'fulfilled' && workflowsRes.value?.items) {
        const wItems = workflowsRes.value.items.filter((w: any) =>
          !w.status || w.status === 'PUBLISHED'
        );
        if (workflowsRes.value.items.length >= wPageSize) sourceHadMore = true;

        wItems.forEach((w: any) => {
          const numId = Number(String(w.workflowId || w.id).replace(/\D/g, ''));
          newUnifiedItems.push({
            type: 'WORKFLOW',
            id: `wf-${numId || w.workflowId || w.id}`,
            numericId: numId || w.workflowId || w.id,
            title: w.title,
            summary: w.summary || 'Quy trình học tập và chia sẻ kinh nghiệm thực tế.',
            createdAt: w.createdAt || new Date().toISOString(),
            authorUserId: w.authorUserId,
            courseId: w.courseId,
            status: w.status || 'PUBLISHED',
            isPinned: Boolean(w.isPinned),
            stepCount: w.stepCount || 1,
          });
        });
      }

      // Sort items based on feedSort
      newUnifiedItems.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        if (feedSort === 'votes') {
          const scoreA = ((a.upvoteCount || 0) - (a.downvoteCount || 0)) + (a.answerCount || 0);
          const scoreB = ((b.upvoteCount || 0) - (b.downvoteCount || 0)) + (b.answerCount || 0);
          return scoreB - scoreA;
        }
        if (feedSort === 'forYou') {
          const scoreA = (a.answerCount || 0) * 3 + new Date(a.createdAt).getTime() / 1e11;
          const scoreB = (b.answerCount || 0) * 3 + new Date(b.createdAt).getTime() / 1e11;
          return scoreB - scoreA;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      if (append) {
        setFeedItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const filteredNew = newUnifiedItems.filter((i) => !existingIds.has(i.id));
          return [...prev, ...filteredNew];
        });
      } else {
        setFeedItems(newUnifiedItems);
      }

      setHasMore(sourceHadMore && newUnifiedItems.length > 0);
      setPage(targetPage);

      // Initialize votes state
      const newVotes: Record<string, { count: number; userVote: 'UP' | 'DOWN' | null }> = {};
      newUnifiedItems.forEach((item) => {
        const fallbackCount = (item.upvoteCount || 0) - (item.downvoteCount || 0);
        newVotes[item.id] = { count: fallbackCount, userVote: null };
      });
      setVotes((prev) => ({ ...prev, ...newVotes }));

      // Batch load missing author profiles asynchronously
      const missingAuthorIds = Array.from(
        new Set(
          newUnifiedItems
            .filter((item) => !item.isAnonymous && item.authorUserId && item.authorUserId !== Number(currentUser?.id))
            .map((item) => Number(item.authorUserId))
        )
      ).filter((id) => !globalAuthorProfileCache[id]);

      if (missingAuthorIds.length > 0) {
        Promise.allSettled(missingAuthorIds.map((id) => profileApi.getProfile(id)))
          .then((results) => {
            const mappedProfiles: Record<number, { fullName: string; avatarUrl?: string }> = {};
            results.forEach((r, idx) => {
              if (r.status === 'fulfilled' && r.value) {
                const val = r.value;
                const authorId = missingAuthorIds[idx];
                const prof = {
                  fullName: val.displayName || val.fullName || '',
                  avatarUrl: val.avatarUrl || '',
                };
                globalAuthorProfileCache[authorId] = prof;
                mappedProfiles[authorId] = prof;
              }
            });
            if (Object.keys(mappedProfiles).length > 0) {
              setAuthorProfiles((prev) => ({ ...prev, ...mappedProfiles }));
            }
          })
          .catch(() => {});
      }

      // Synchronize current user votes
      if (currentUser && newUnifiedItems.length > 0) {
        voteApi.getMyVotes()
          .then((myVotes) => {
            const myVoteMap: Record<string, number> = {};
            myVotes.forEach((v: any) => {
              if (v.targetType === 'QUESTION') {
                myVoteMap[`q-${v.targetId}`] = v.voteValue;
              } else if (v.targetType === 'ARTICLE') {
                myVoteMap[`art-${v.targetId}`] = v.voteValue;
              }
            });
            setVotes((prev) => {
              const updated = { ...prev };
              newUnifiedItems.forEach((item) => {
                const myVal = myVoteMap[item.id];
                if (myVal !== undefined) {
                  const currentScore = updated[item.id]?.count ?? ((item.upvoteCount || 0) - (item.downvoteCount || 0));
                  updated[item.id] = {
                    count: currentScore,
                    userVote: myVal === 1 ? 'UP' : myVal === -1 ? 'DOWN' : null,
                  };
                }
              });
              return updated;
            });
          })
          .catch(() => {});
      }
    } catch (err) {
      console.warn('Could not fetch feed items:', err);
      if (!append) setFeedItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadFeed(1, false);
  }, [contentTypeFilter, feedSort]);

  // Synchronize user bookmarks across Question, Article, and Workflow
  useEffect(() => {
    if (!currentUser) return;
    Promise.allSettled([
      bookmarkApi.getBookmarks('Question'),
      bookmarkApi.getBookmarks('Article'),
      bookmarkApi.getBookmarks('Workflow'),
    ]).then(([qRes, aRes, wRes]) => {
      const newBookmarkedIds = new Set<string>();
      const newBookmarkMap = new Map<string, number | string>();

      if (qRes.status === 'fulfilled' && Array.isArray(qRes.value)) {
        qRes.value.forEach((b: any) => {
          const idStr = `q-${b.targetId}`;
          newBookmarkedIds.add(idStr);
          newBookmarkMap.set(idStr, b.id);
        });
      }
      if (aRes.status === 'fulfilled' && Array.isArray(aRes.value)) {
        aRes.value.forEach((b: any) => {
          const idStr = `art-${b.targetId}`;
          newBookmarkedIds.add(idStr);
          newBookmarkMap.set(idStr, b.id);
        });
      }
      if (wRes.status === 'fulfilled' && Array.isArray(wRes.value)) {
        wRes.value.forEach((b: any) => {
          const idStr = `wf-${b.targetId}`;
          newBookmarkedIds.add(idStr);
          newBookmarkMap.set(idStr, b.id);
        });
      }

      setBookmarkedIds(newBookmarkedIds);
      setBookmarkMap(newBookmarkMap);
    }).catch(() => {});
  }, [currentUser]);

  // ─── Facebook-like Infinite Scroll (IntersectionObserver) ──────────────────
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading && !loadingMore) {
          loadFeed(page + 1, true);
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, contentTypeFilter, feedSort]);

  // ─── Handlers (Vote, Bookmark, Share, Delete) ──────────────────────────────
  const handleVote = async (item: UnifiedFeedItem, direction: 'UP' | 'DOWN') => {
    const current = votes[item.id] || { count: 0, userVote: null };
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
    setVotes((prev) => ({ ...prev, [item.id]: optimistic }));

    if (item.numericId > 0) {
      try {
        const targetType = item.type === 'ARTICLE' ? 'ARTICLE' : 'QUESTION';
        if (current.userVote === direction) {
          await voteApi.removeVote(targetType, item.numericId);
        } else {
          await voteApi.vote({
            target_type: targetType,
            target_id: item.numericId,
            vote_value: voteValue,
          });
        }
        const stats = await voteApi.getStats(targetType, item.numericId);
        setVotes((prev) => ({
          ...prev,
          [item.id]: {
            count: stats.score,
            userVote: stats.myVoteValue === 1 ? 'UP' : stats.myVoteValue === -1 ? 'DOWN' : null,
          },
        }));

        if (direction === 'UP' && item.authorUserId && String(item.authorUserId) !== String(currentUser?.id)) {
          const senderName = currentUser?.fullName || (currentUser as any)?.displayName || t('common.peerStudent', 'Một bạn học');
          notificationApi.createNotification({
            recipientUserId: Number(item.authorUserId),
            type: 'UPVOTE',
            title: `${senderName} đã thích nội dung của bạn`,
            message: `"${item.title.slice(0, 80)}..."`,
            actionUrl: item.type === 'ARTICLE' ? `/articles/${item.numericId}` : `/discussions/${item.numericId}`,
            targetType: item.type,
            targetId: item.numericId,
          });
        }
      } catch (err) {
        console.warn('Vote submission error:', err);
        setVotes((prev) => ({ ...prev, [item.id]: current }));
      }
    }
  };

  const toggleBookmark = async (item: UnifiedFeedItem) => {
    const isBookmarked = bookmarkedIds.has(item.id);
    const existingBookmarkId = bookmarkMap.get(item.id);

    if (isBookmarked && existingBookmarkId) {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      try {
        await bookmarkApi.removeBookmark(existingBookmarkId);
        setBookmarkMap((prev) => {
          const next = new Map(prev);
          next.delete(item.id);
          return next;
        });
      } catch (err) {
        console.warn('Failed to remove bookmark:', err);
      }
    } else {
      setBookmarkedIds((prev) => new Set(prev).add(item.id));
      try {
        const bookmarkType = item.type === 'ARTICLE' ? 'Article' : item.type === 'WORKFLOW' ? 'Workflow' : 'Question';
        const res = await bookmarkApi.addBookmark(bookmarkType, item.numericId);
        const bId = res?.bookmark_id ?? res?.data?.bookmark_id ?? res?.id ?? Date.now();
        setBookmarkMap((prev) => new Map(prev).set(item.id, bId));
      } catch (err) {
        console.warn('Failed to add bookmark:', err);
      }
    }
  };

  const handleDeleteItem = async (item: { id: string; numericId: number; type: 'QUESTION' | 'ARTICLE' | 'WORKFLOW' }) => {
    try {
      if (item.type === 'QUESTION') {
        await questionApi.deleteQuestion(item.numericId);
      } else if (item.type === 'ARTICLE') {
        await articleApi.deleteArticle(item.numericId);
      } else if (item.type === 'WORKFLOW') {
        await workflowApi.deleteWorkflow(item.numericId);
      }
    } catch (err) {
      console.warn('Failed to delete item:', err);
    }
    setFeedItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  // Helper to resolve accurate author name without "Sinh viên [id]"
  const getAuthorName = (item: UnifiedFeedItem) => {
    if (item.isAnonymous) return t('common.anonymous', 'Ẩn danh FPTer');
    const authorId = Number(item.authorUserId);
    if (authorId && currentUser?.id && String(authorId) === String(currentUser.id)) {
      return currentUser.fullName || (currentUser as any)?.displayName || currentUser.email?.split('@')[0] || t('common.you', 'Bạn');
    }
    const rawName = item.authorDisplayName;
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
    if (authorId && authorProfiles[authorId]?.fullName) {
      return authorProfiles[authorId].fullName;
    }
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
      13: 'Tăng Minh Vĩnh Quang',
    };
    if (authorId && knownUsers[authorId]) {
      return knownUsers[authorId];
    }
    return t('common.fhubMember', 'Thành viên FHub');
  };

  const getAuthorAvatar = (item: UnifiedFeedItem) => {
    if (item.isAnonymous) return '';
    const authorId = Number(item.authorUserId);
    if (authorId && currentUser?.id && String(authorId) === String(currentUser.id) && currentUser.avatarUrl) {
      return currentUser.avatarUrl;
    }
    if (authorId && authorProfiles[authorId]?.avatarUrl) {
      return authorProfiles[authorId].avatarUrl;
    }
    if (item.authorAvatarUrl && item.authorAvatarUrl.trim()) return item.authorAvatarUrl.trim();
    return '';
  };

  const getItemUrl = (item: UnifiedFeedItem) => {
    if (item.type === 'ARTICLE') return `/articles/${item.numericId}`;
    if (item.type === 'WORKFLOW') return `/workflows/${item.numericId}`;
    return `/discussions/${item.numericId}`;
  };

  return (
    <div className="space-y-6">
      {/* 3.A Welcome Header (Figma #86:118) */}
      <div className="rainbow-glow-card bg-white dark:bg-[#272727] rounded-2xl p-6 border border-slate-200/90 dark:border-transparent shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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

      {/* 3.B Quick Navigation Shortcuts (8 Core Modules from Figma #86:137) */}
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
                className="quick-access-card rainbow-glow-card h-[76px] sm:h-[84px] p-2 flex flex-col items-center justify-between bg-white dark:bg-[#272727] rounded-xl sm:rounded-2xl border border-[#38BDF8] dark:border-transparent text-center group cursor-pointer shadow-2xs"
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

      {/* 3.C Academic Resource Banner */}
      <div className="rainbow-glow-card bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent rounded-2xl p-4 sm:p-5 border border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

      {/* 3.D Unified Infinite Feed: Questions, Articles & Workflows (Like Facebook) */}
      <div className="bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent dark:hover:border-[#444444] shadow-2xs overflow-hidden transition-colors">
        {/* Section Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0076D1] dark:text-blue-400 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {t('feed.unifiedFeedTitle', 'Bảng tin hoạt động & Thảo luận cộng đồng')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('feed.unifiedFeedSubtitle', 'Dòng thời gian tích hợp: Hỏi đáp, Bài viết chuyên sâu và Quy trình chia sẻ từ sinh viên FPT.')}
              </p>
            </div>
          </div>

          {/* Action: Ask Question Button */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t('feed.askQuestionNow', 'Đặt câu hỏi ngay')}</span>
            </button>
          </div>
        </div>

        {/* Filter & Sorting Bar */}
        <div className="px-4 py-3 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Content Source Filter Tabs */}
          <div className="flex flex-wrap items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 gap-1">
            <button
              onClick={() => setContentTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                contentTypeFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-[#0076D1] dark:text-blue-400 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('feed.allSources', 'Tất cả')}
            </button>
            <button
              onClick={() => setContentTypeFilter('QUESTION')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                contentTypeFilter === 'QUESTION'
                  ? 'bg-white dark:bg-slate-700 text-[#0076D1] dark:text-blue-400 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('nav.questions', 'Hỏi đáp')}</span>
            </button>
            <button
              onClick={() => setContentTypeFilter('ARTICLE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                contentTypeFilter === 'ARTICLE'
                  ? 'bg-white dark:bg-slate-700 text-[#0076D1] dark:text-blue-400 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-pink-500" />
              <span>{t('nav.articles', 'Bài viết')}</span>
            </button>
            <button
              onClick={() => setContentTypeFilter('WORKFLOW')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                contentTypeFilter === 'WORKFLOW'
                  ? 'bg-white dark:bg-slate-700 text-[#0076D1] dark:text-blue-400 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t('nav.workflows', 'Quy trình')}</span>
            </button>
          </div>

          {/* Sort Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="text-[11px] text-slate-400 mr-1">{t('common.sort', 'Sắp xếp')}:</span>
            <button
              onClick={() => setFeedSort('forYou')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                feedSort === 'forYou'
                  ? 'bg-blue-100/70 text-[#0076D1] dark:bg-blue-950/60 dark:text-blue-400 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('feed.forYou', 'Dành cho bạn')}
            </button>
            <button
              onClick={() => setFeedSort('newest')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                feedSort === 'newest'
                  ? 'bg-blue-100/70 text-[#0076D1] dark:bg-blue-950/60 dark:text-blue-400 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('feed.recent', 'Mới nhất')}
            </button>
            <button
              onClick={() => setFeedSort('votes')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                feedSort === 'votes'
                  ? 'bg-blue-100/70 text-[#0076D1] dark:bg-blue-950/60 dark:text-blue-400 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('feed.topVoted', 'Tương tác nhiều')}
            </button>
            {(contentTypeFilter === 'ALL' || contentTypeFilter === 'QUESTION') && (
              <button
                onClick={() => setFeedSort('unanswered')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  feedSort === 'unanswered'
                    ? 'bg-blue-100/70 text-[#0076D1] dark:bg-blue-950/60 dark:text-blue-400 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('feed.unanswered', 'Chưa trả lời')}
              </button>
            )}
          </div>
        </div>

        {/* Feed Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0076D1]" />
            <p className="text-xs">{t('common.loading', 'Đang tải bảng tin học tập...')}</p>
          </div>
        ) : feedItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Compass className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              {t('feed.emptyFeed', 'Chưa có nội dung nào trong danh mục này')}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {t('feed.emptyFeedDesc', 'Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ bài viết để xây dựng cộng đồng FPT!')}
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
            {feedItems.map((item) => {
              const authorName = getAuthorName(item);
              const authorId = Number(item.authorUserId);
              const authorAvatar = getAuthorAvatar(item);
              const itemUrl = getItemUrl(item);
              const voteInfo = votes[item.id] || { count: (item.upvoteCount || 0) - (item.downvoteCount || 0), userVote: null };
              const currentUserId = currentUser?.id || (currentUser as any)?.userId;
              const isOwner = Boolean(
                currentUser?.role === 'Admin' ||
                (authorId && currentUserId && (
                  String(authorId) === String(currentUserId) ||
                  String(authorId).replace(/\D/g, '') === String(currentUserId).replace(/\D/g, '')
                )) ||
                (item.authorDisplayName && currentUser?.fullName && item.authorDisplayName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase())
              );

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Left: Vote Counter or Type Badge */}
                  {item.type === 'QUESTION' || item.type === 'ARTICLE' ? (
                    <div className="flex flex-col items-center justify-center min-w-[42px] bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-1 shrink-0 self-start shadow-2xs">
                      <button
                        onClick={() => handleVote(item, 'UP')}
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
                        onClick={() => handleVote(item, 'DOWN')}
                        className={`p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
                          voteInfo.userVote === 'DOWN' ? 'text-rose-600 font-bold' : 'text-slate-400'
                        }`}
                        title="Bình chọn tiêu cực (Downvote)"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-w-[42px] bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 rounded-xl p-2 shrink-0 self-start shadow-2xs text-indigo-600 dark:text-indigo-400">
                      <Layers className="w-4 h-4 mb-0.5" />
                      <span className="text-[10px] font-bold">Quy</span>
                    </div>
                  )}

                  {/* Right: Content details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header: Author & Metadata */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {item.isAnonymous ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-[10px] shrink-0 border border-purple-200 dark:border-purple-800">
                              ?
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {authorName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/60 font-semibold">
                              {t('common.anonymous', 'Ẩn danh')}
                            </span>
                          </>
                        ) : (
                          <UserHoverCard
                            userId={authorId}
                            initialData={{
                              fullName: authorName,
                              avatarUrl: authorAvatar,
                            }}
                          >
                            <div className="flex items-center gap-2 group cursor-pointer">
                              <img
                                src={normalizeMediaUrl(authorAvatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                alt={authorName}
                                className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 group-hover:ring-2 group-hover:ring-[#0076D1] transition-all"
                              />
                              <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0076D1] dark:group-hover:text-blue-400 group-hover:underline transition-colors">
                                {authorName}
                              </span>
                              {(item.isAlumni || isUserAlumni({
                                studentId: (authorProfiles[authorId] as any)?.studentId || authorName,
                                email: (authorProfiles[authorId] as any)?.email,
                                role: (authorProfiles[authorId] as any)?.role,
                              })) && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-2xs">
                                  <Award className="w-3 h-3 text-amber-600" />
                                  Alumni
                                </span>
                              )}
                            </div>
                          </UserHoverCard>
                        )}

                        <span className="text-slate-400">
                          • {formatDisplayDate(item.createdAt) || t('common.recent', 'Mới đây')}
                        </span>
                      </div>

                      {/* Right Tag & Action Menu */}
                      <div className="flex items-center gap-2">
                        {item.type === 'ARTICLE' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800">
                            Bài viết
                          </span>
                        )}
                        {item.type === 'WORKFLOW' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                            {item.stepCount || 1} bước
                          </span>
                        )}
                        {item.courseId && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-[#0076D1] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                            #{item.courseCode || `Môn ${item.courseId}`}
                          </span>
                        )}
                        <ContentActionMenu
                          targetType={item.type}
                          targetId={item.numericId}
                          targetTitle={item.title}
                          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}${itemUrl}`}
                          isOwner={isOwner}
                          onDelete={() => setDeletingItem({ id: item.id, numericId: item.numericId, title: item.title, type: item.type })}
                          deleteLabel={t('common.delete', 'Xóa')}
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <Link
                      to={itemUrl}
                      className="block text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 hover:text-[#0076D1] dark:hover:text-blue-400 transition-colors leading-snug"
                    >
                      {item.title}
                    </Link>

                    {/* Excerpt */}
                    {item.summary && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {item.summary}
                      </p>
                    )}

                    {/* Article Cover Image Thumbnail (if available) */}
                    {item.type === 'ARTICLE' && item.coverImageUrl && (
                      <ArticleFeedCover
                        url={item.coverImageUrl}
                        title={item.title}
                        onClick={() => navigate(itemUrl)}
                      />
                    )}

                    {/* Question Attached Media Grid (Facebook Style) */}
                    {item.type === 'QUESTION' && item.mediaUrls && item.mediaUrls.length > 0 && (
                      <div className="pt-1">
                        {item.mediaUrls.length === 1 ? (
                          <div className="relative group max-w-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900/5">
                            <img
                              src={normalizeMediaUrl(item.mediaUrls[0])}
                              alt="Đính kèm"
                              className="w-full max-h-80 object-cover rounded-xl hover:scale-[1.01] transition-transform cursor-pointer"
                              onClick={() => navigate(itemUrl)}
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-1.5 max-w-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            {item.mediaUrls.slice(0, 2).map((url, imgIdx) => (
                              <div key={imgIdx} className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <img
                                  src={normalizeMediaUrl(url)}
                                  alt="Đính kèm"
                                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() => navigate(itemUrl)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Metadata & Action Row */}
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-4">
                        {item.type === 'QUESTION' ? (
                          <span className="flex items-center gap-1.5 font-medium">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                            {item.answerCount || 0} {t('common.answersCount', 'câu trả lời')}
                          </span>
                        ) : item.type === 'ARTICLE' ? (
                          <span className="flex items-center gap-1.5 font-medium text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            {item.readTimeMinutes || 3} {t('common.minutesRead', 'phút đọc')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 font-medium text-indigo-500">
                            <Layers className="w-3.5 h-3.5" />
                            {item.stepCount || 1} {t('common.steps', 'bước thực hiện')}
                          </span>
                        )}

                        <button
                          onClick={() => toggleBookmark(item)}
                          className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                            bookmarkedIds.has(item.id)
                              ? 'text-[#0076D1] dark:text-blue-400 font-bold'
                              : 'text-slate-500 hover:text-[#0076D1] dark:hover:text-blue-400'
                          }`}
                          title={bookmarkedIds.has(item.id) ? t('common.saved', 'Đã lưu') : t('common.bookmark', 'Lưu')}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.has(item.id) ? 'fill-current' : ''}`} />
                          <span>{bookmarkedIds.has(item.id) ? t('common.saved', 'Đã lưu') : t('common.bookmark', 'Lưu')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShareModalData({
                              isOpen: true,
                              title: item.title,
                              url: itemUrl,
                              description: item.summary,
                            });
                          }}
                          className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-[#0076D1] dark:hover:text-blue-400 transition-colors"
                          title={t('common.share', 'Chia sẻ')}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{t('common.share', 'Chia sẻ')}</span>
                        </button>
                      </div>

                      <Link
                        to={itemUrl}
                        className="text-xs font-semibold text-[#0076D1] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>
                          {item.type === 'ARTICLE'
                            ? t('common.readArticle', 'Đọc bài viết')
                            : item.type === 'WORKFLOW'
                            ? t('common.viewWorkflow', 'Xem quy trình')
                            : t('common.viewQuestion', 'Xem chi tiết')}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Facebook-style Infinite Scroll Sentinel & Loader */}
        <div ref={sentinelRef} className="py-5 text-center bg-slate-50/40 dark:bg-slate-800/20">
          {loadingMore && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-[#0076D1]" />
              <span>{t('common.loadingMore', 'Đang tải thêm nội dung...')}</span>
            </div>
          )}
          {!hasMore && !loading && feedItems.length > 0 && (
            <span className="text-[11px] text-slate-400 font-medium">
              {t('feed.allCaughtUp', 'Bạn đã xem hết các bài viết mới nhất trên bảng tin 🎉')}
            </span>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {shareModalData && (
        <SocialShareModal
          isOpen={shareModalData.isOpen}
          onClose={() => setShareModalData(null)}
          title={shareModalData.title}
          url={shareModalData.url}
          description={shareModalData.description}
        />
      )}

      {/* Confirm Delete Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {t('common.confirmDelete', 'Xác nhận xóa nội dung?')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('common.confirmDeleteDesc', 'Bạn có chắc chắn muốn xóa bài viết "{title}"? Toàn bộ dữ liệu liên quan sẽ bị gỡ bỏ khỏi nền tảng.', { title: deletingItem.title })}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                {t('common.cancel', 'Hủy')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const toDel = deletingItem;
                  setDeletingItem(null);
                  if (toDel) await handleDeleteItem(toDel);
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
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onCreated={() => {
          setIsAskModalOpen(false);
          loadFeed(1, false);
        }}
      />
    </div>
  );
};
