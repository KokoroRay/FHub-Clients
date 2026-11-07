import React, { useState, useEffect } from 'react';

import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  CheckCircle2,
  Check,
  ShieldCheck,
  Share2,
  Bookmark,
  ArrowLeft,
  Sparkles,
  Lock,
  Unlock,
  EyeOff,
  Pin,
  Copy,
  Code,
  Bold,
  Italic,
  List,
  Quote,
  Send,
  CornerDownRight,
  BarChart2,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api/client';
import { useLanguage } from '../../context/LanguageContext';
import { questionApi, alumniApi } from '../../services/api/contentApi';
import { voteApi, bookmarkApi, profileApi, notificationApi } from '../../services/api/studentApi';
import { courseNodesApi, semanticTagsApi } from '../../services/api/adminApi';
import { normalizeMediaUrl } from '../../utils/mediaUtils';
import { Answer, CommentItem, QuestionPost } from '../../types';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { UserHoverCard } from '../../components/common/UserHoverCard';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Input';
import { MarkdownPreview } from '../../components/common/MarkdownPreview';
import { SocialShareModal } from '../../components/common/SocialShareModal';
import { resolveUserCampus } from '../../utils/taxonomyUtils';
import { VotingStatsModal } from './VotingStatsModal';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';

export const QuestionDetailPage: React.FC = () => {
  const { formatDate, locale, t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, currentRole, updateUser } = useAuth();

  const [question, setQuestion] = useState<QuestionPost | null>(null);
  const [upvotes, setUpvotes] = useState(0);
  const [voteDetails, setVoteDetails] = useState<{ upvotes: number; downvotes: number }>({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<number | string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [composerTab, setComposerTab] = useState<'write' | 'preview'>('write');
  const [isVotingStatsOpen, setIsVotingStatsOpen] = useState(false);
  const [isCopiedShare, setIsCopiedShare] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShareQuestion = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url);
      setIsCopiedShare(true);
      setTimeout(() => setIsCopiedShare(false), 2000);
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editingAnswerBody, setEditingAnswerBody] = useState('');
  const [deletingAnswerId, setDeletingAnswerId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [editQuestionTitle, setEditQuestionTitle] = useState('');
  const [editQuestionBody, setEditQuestionBody] = useState('');
  const [authorProfiles, setAuthorProfiles] = useState<Record<number, { fullName: string; avatarUrl?: string; campus?: string }>>({});

  const KNOWN_SEED_USERS: Record<number, string> = {
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

  const getAuthorDisplayName = (
    authorId?: string | number,
    displayName?: string | null,
    isAnon?: boolean
  ) => {
    if (isAnon) return t('common.anonymous', 'Ẩn danh FPTer');
    const numId = Number(authorId);
    if (numId && currentUser?.id && String(numId) === String(currentUser.id)) {
      return currentUser.fullName || (currentUser as any)?.displayName || currentUser.email?.split('@')[0] || t('common.you', 'Bạn');
    }
    if (displayName && displayName.trim()) {
      const trimmed = displayName.trim();
      const isPlaceholder =
        trimmed.startsWith('Sinh viên') ||
        trimmed.startsWith('User #') ||
        trimmed === 'Thành viên FHub' ||
        trimmed === 'FHub Member' ||
        trimmed === 'Anonymous Student';
      if (!isPlaceholder) return trimmed;
    }
    if (numId && authorProfiles[numId]?.fullName) return authorProfiles[numId].fullName;
    if (numId && KNOWN_SEED_USERS[numId]) return KNOWN_SEED_USERS[numId];
    return t('common.fhubMember', 'Thành viên FHub');
  };

  const getAuthorAvatar = (
    authorId?: string | number,
    avatarUrl?: string | null,
    isAnon?: boolean
  ) => {
    if (isAnon) return '';
    const numId = Number(authorId);
    if (numId && currentUser?.id && String(numId) === String(currentUser.id) && currentUser.avatarUrl) {
      return currentUser.avatarUrl;
    }
    if (numId && authorProfiles[numId]?.avatarUrl) return authorProfiles[numId].avatarUrl;
    if (avatarUrl && avatarUrl.trim()) return avatarUrl;
    return '';
  };

  const getAuthorCampus = (
    authorId?: string | number,
    authorCampus?: string | null,
    isAnon?: boolean
  ) => {
    if (isAnon) return '';
    const numId = Number(authorId);
    if (numId && currentUser?.id && String(numId) === String(currentUser.id)) {
      return resolveUserCampus(currentUser);
    }
    if (numId && authorProfiles[numId]?.campus) {
      return resolveUserCampus(authorProfiles[numId]);
    }
    if (authorCampus && authorCampus.trim()) {
      return resolveUserCampus({ campus: authorCampus.trim() });
    }
    return '';
  };

  useEffect(() => {
    if (!id) return;
    const numId = Number(id.replace(/\D/g, ''));
    if (!numId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const data = await questionApi.getQuestionById(numId);
        if (isMounted && data) {
          let mappedCourseCode = data.courseId ? `COURSE-${data.courseId}` : undefined;
          let mappedTags = ['fhub', 'qa'];

          try {
            const [cRes, tRes] = await Promise.all([
              courseNodesApi.getCourseNodes({ pageSize: 100 }),
              semanticTagsApi.getTags({ pageSize: 100 }),
            ]);
            const cItems = (cRes as any)?.items || cRes || [];
            if (Array.isArray(cItems) && data.courseId) {
              const found = cItems.find((c: any) => Number(c.id || c.courseNodeId) === Number(data.courseId));
              if (found) mappedCourseCode = found.code || found.courseCode;
            }
            const tItems = (tRes as any)?.items || (tRes as any)?.data?.items || tRes || [];
            if (Array.isArray(tItems) && data.semanticTagIds && data.semanticTagIds.length > 0) {
              const tagMap: Record<number, string> = {};
              tItems.forEach((t: any) => {
                const tid = Number(t.semanticTagId || t.id);
                const tname = (t.tagName || t.name || '').toLowerCase().trim();
                if (tid && tname) tagMap[tid] = tname;
              });
              mappedTags = data.semanticTagIds.map((id: number) => tagMap[id] || `tag-${id}`);
            }
          } catch {}

          setQuestion({
            id: String(data.questionId),
            title: data.title,
            content: data.body,
            courseCode: mappedCourseCode,
            author: {
              id: String(data.authorUserId || ''),
              fullName: getAuthorDisplayName(data.authorUserId, data.authorDisplayName, data.isAnonymous),
              role: 'Student',
              karma: data.upvoteCount || 0,
              campus: (data.authorUserId && currentUser?.id && String(data.authorUserId) === String(currentUser.id) ? resolveUserCampus(currentUser) : resolveUserCampus(data)),
              isAnonymous: data.isAnonymous,
            },
            tags: mappedTags,
            upvotes: data.upvoteCount || 0,
            downvotes: data.downvoteCount || 0,
            answersCount: data.answerCount || 0,
            viewsCount: data.viewCount || 0,
            isSolved: data.hasBestAnswer || false,
            isLocked: data.areCommentsLocked || false,
            isPinned: data.isPinned || false,
            createdAt: data.createdAt,
          });
          setIsLocked(data.areCommentsLocked || false);
          setIsPinned(data.isPinned || false);
        }

        // Fetch question vote stats from interaction service
        try {
          const qStats = await voteApi.getStats('QUESTION', numId);
          if (isMounted) {
            const baseUp = data?.upvoteCount || 0;
            const baseDown = data?.downvoteCount || 0;
            const hasLiveVotes = qStats.upvotes > 0 || qStats.downvotes > 0 || qStats.myVoteValue !== null;
            const effectiveUp = hasLiveVotes ? qStats.upvotes : baseUp;
            const effectiveDown = hasLiveVotes ? qStats.downvotes : baseDown;
            const effectiveScore = hasLiveVotes ? qStats.score : (baseUp - baseDown);
            setUpvotes(effectiveScore);
            setUserVote(qStats.myVoteValue === 1 ? 'UP' : qStats.myVoteValue === -1 ? 'DOWN' : null);
            setVoteDetails({ upvotes: effectiveUp, downvotes: effectiveDown });
          }
        } catch {
          if (isMounted && data) {
            const baseUp = data.upvoteCount || 0;
            const baseDown = data.downvoteCount || 0;
            setUpvotes(baseUp - baseDown);
            setVoteDetails({ upvotes: baseUp, downvotes: baseDown });
          }
        }

        // Fetch bookmark status for this question
        try {
          const bList = await bookmarkApi.getBookmarks('Question');
          const found = bList.find((b) => Number(b.targetId) === numId);
          if (found && isMounted) {
            setIsBookmarked(true);
            setBookmarkId(found.id);
          }
        } catch {}

        // Fetch caller's active votes across platform
        let myVotesMap: Record<string, number> = {};
        try {
          const myVotes = await voteApi.getMyVotes();
          myVotes.forEach((v) => {
            if (v.targetType === 'ANSWER') {
              myVotesMap[String(v.targetId)] = v.voteValue;
            }
          });
        } catch {}

        const answersData = await questionApi.getAnswers(numId);
        const answersWithComments = await Promise.all(
          (answersData || []).map(async (ans) => {
            if (ans.comments && ans.comments.length > 0) return ans;
            try {
              const cList = await questionApi.getAnswerComments(ans.answerId);
              const commentsArr = Array.isArray(cList) ? cList : ((cList as any)?.data || []);
              return { ...ans, comments: commentsArr };
            } catch {
              return { ...ans, comments: [] };
            }
          })
        );
        if (isMounted) {
          const mappedAnswers: Answer[] = (answersWithComments || []).map((ans) => {
            const userVoteVal = myVotesMap[String(ans.answerId)];
            return {
              id: String(ans.answerId),
              questionId: String(ans.questionId),
              author: {
                id: String(ans.authorUserId || ''),
                fullName: getAuthorDisplayName(ans.authorUserId, ans.authorDisplayName, ans.isAnonymous),
                avatarUrl: '',
                role: ans.isModeratorVerified ? 'Alumni' : 'Student',
                karma: 0,
                campus: (ans.authorUserId && currentUser?.id && String(ans.authorUserId) === String(currentUser.id) ? resolveUserCampus(currentUser) : resolveUserCampus(ans)),
                isAnonymous: ans.isAnonymous,
              },
              content: ans.body,
              upvotes: (ans.upvoteCount || 0) - (ans.downvoteCount || 0),
              downvotes: ans.downvoteCount || 0,
              userVote: userVoteVal === 1 ? 'UP' : userVoteVal === -1 ? 'DOWN' : null,
              isBestAnswer: ans.isBestAnswer || false,
              isModVerified: ans.isModeratorVerified || false,
              comments: (ans.comments && ans.comments.length > 0) ? ans.comments.map((c: any) => ({
                id: String(c.commentId),
                parentId: String(ans.answerId),
                author: {
                  id: String(c.authorUserId || ''),
                  fullName: getAuthorDisplayName(c.authorUserId, c.authorDisplayName, false)
                },
                content: c.body,
                createdAt: c.createdAt || 'Just now',
              })) : [],
              createdAt: ans.createdAt,
            };
          });
          setAnswers(mappedAnswers);

          // Batch fetch profiles for all non-anonymous authors
          const authorIdsToFetch = Array.from(new Set([
            !data.isAnonymous && data.authorUserId ? Number(data.authorUserId) : null,
            ...(answersData || []).filter((a: any) => !a.isAnonymous && a.authorUserId).map((a: any) => Number(a.authorUserId)),
            ...((answersData || []).flatMap((a: any) => (a.comments || []).filter((cm: any) => cm.authorUserId).map((cm: any) => Number(cm.authorUserId))))
          ])).filter((uid): uid is number => typeof uid === 'number' && uid > 0 && uid !== Number(currentUser?.id));

          if (authorIdsToFetch.length > 0) {
            Promise.allSettled(authorIdsToFetch.map(uid => profileApi.getProfile(uid)))
              .then(results => {
                if (!isMounted) return;
                const mapped: Record<number, { fullName: string; avatarUrl?: string; campus?: string }> = {};
                results.forEach((r, idx) => {
                  if (r.status === 'fulfilled' && r.value) {
                    const p = r.value;
                    const uid = authorIdsToFetch[idx];
                    const name = p.fullName || p.displayName || p.name;
                    if (name) {
                      mapped[uid] = {
                        fullName: name,
                        avatarUrl: p.avatarUrl || '',
                        campus: resolveUserCampus(p),
                      };
                    }
                  }
                });
                if (Object.keys(mapped).length > 0) {
                  setAuthorProfiles(prev => ({ ...prev, ...mapped }));
                }
              })
              .catch(() => {});
          }

          // Batch fetch answer vote statistics from interaction service
          const ansIdsToFetch = (answersData || [])
            .map((a: any) => Number(a.answerId))
            .filter((nid: number) => !isNaN(nid) && nid > 0);

          if (ansIdsToFetch.length > 0) {
            Promise.allSettled(ansIdsToFetch.map((nid: number) => voteApi.getStats('ANSWER', nid)))
              .then(results => {
                if (!isMounted) return;
                setAnswers(prev =>
                  prev.map(a => {
                    const numAId = Number(a.id);
                    const idx = ansIdsToFetch.indexOf(numAId);
                    if (idx !== -1 && results[idx].status === 'fulfilled') {
                      const st = (results[idx] as PromiseFulfilledResult<any>).value;
                      return {
                        ...a,
                        upvotes: st.score,
                        userVote: st.myVoteValue === 1 ? 'UP' : st.myVoteValue === -1 ? 'DOWN' : a.userVote,
                      };
                    }
                    return a;
                  })
                );
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        if (isMounted) {
          setQuestion(null);
          setAnswers([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchDetail();
    return () => { isMounted = false; };
  }, [id]);

    // Ownership & Permission Checks
  const isQuestionAuthor = Boolean(
    currentUser &&
    question?.author?.id &&
    String(currentUser.id) === String(question.author.id)
  );
  const isAdminOrMod = currentUser?.role === 'Admin' || currentUser?.role === 'Community Moderator';
  const canEditQuestion = isQuestionAuthor || isAdminOrMod;
  const canDeleteQuestion = isQuestionAuthor || isAdminOrMod;

  const canEditAnswer = (ans: Answer) => Boolean(
    currentUser &&
    ans.author?.id &&
    (String(currentUser.id) === String(ans.author.id) || isAdminOrMod)
  );
  const canDeleteAnswer = (ans: Answer) => Boolean(
    currentUser &&
    ans.author?.id &&
    (String(currentUser.id) === String(ans.author.id) || isAdminOrMod)
  );

  const canMarkBestAnswer = isQuestionAuthor || isAdminOrMod;

  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleVoteQuestion = async (type: 'UP' | 'DOWN') => {
    if (!id) return;
    const numId = Number(id.replace(/\D/g, ''));
    if (!numId) return;

    const prevVote = userVote;
    const prevScore = upvotes;

    let nextVote: 'UP' | 'DOWN' | null = type;
    let nextScore = prevScore;

    if (prevVote === type) {
      nextVote = null;
      nextScore += type === 'UP' ? -1 : 1;
    } else if (prevVote === null) {
      nextScore += type === 'UP' ? 1 : -1;
    } else {
      nextScore += type === 'UP' ? 2 : -2;
    }

    setUserVote(nextVote);
    setUpvotes(nextScore);

    try {
      if (prevVote === type) {
        await voteApi.removeVote('QUESTION', numId);
      } else {
        await voteApi.vote({
          target_type: 'QUESTION',
          target_id: numId,
          vote_value: type === 'UP' ? 1 : -1,
        });
      }
      const stats = await voteApi.getStats('QUESTION', numId);
      setUpvotes(stats.score);
      setUserVote(stats.myVoteValue === 1 ? 'UP' : stats.myVoteValue === -1 ? 'DOWN' : null);
      setVoteDetails({ upvotes: stats.upvotes, downvotes: stats.downvotes });

      if (type === 'UP' && question?.author?.id && String(question.author.id) !== String(currentUser?.id)) {
        const senderName = currentUser?.fullName || (currentUser as any)?.displayName || t('common.peerStudent', 'Một bạn học');
        notificationApi.createNotification({
          recipientUserId: Number(question.author.id),
          type: 'UPVOTE',
          title: `${senderName} đã thích câu hỏi của bạn`,
          message: `"${question.title?.slice(0, 80)}..."`,
          actionUrl: `/questions/${id}`,
          targetType: 'QUESTION',
          targetId: numId,
        });
      }
    } catch (err) {
      setUserVote(prevVote);
      setUpvotes(prevScore);
    }
  };

  const toggleBookmark = async () => {
    if (!id) return;
    const numId = Number(id.replace(/\D/g, ''));
    if (!numId) return;

    if (isBookmarked && bookmarkId) {
      try {
        await bookmarkApi.removeBookmark(bookmarkId);
        setIsBookmarked(false);
        setBookmarkId(null);
      } catch (err) {
        console.warn('Failed to remove bookmark:', err);
      }
    } else {
      try {
        const res = await bookmarkApi.addBookmark('Question', numId);
        setIsBookmarked(true);
        const bId = res?.bookmark_id ?? res?.data?.bookmark_id ?? res?.id;
        setBookmarkId(bId || Date.now());
      } catch (err) {
        console.warn('Failed to add bookmark:', err);
      }
    }
  };

  const handleVoteAnswer = async (ansId: string, type: 'UP' | 'DOWN') => {
    const numAnsId = Number(ansId.replace(/\D/g, ''));
    if (!numAnsId) return;

    const currentAns = answers.find((a) => a.id === ansId);
    const prevVote = currentAns?.userVote || null;
    const prevScore = currentAns?.upvotes || 0;

    let nextVote: 'UP' | 'DOWN' | null = type;
    let nextScore = prevScore;

    if (prevVote === type) {
      nextVote = null;
      nextScore += type === 'UP' ? -1 : 1;
    } else if (prevVote === null) {
      nextScore += type === 'UP' ? 1 : -1;
    } else {
      nextScore += type === 'UP' ? 2 : -2;
    }

    setAnswers((prev) =>
      prev.map((a) => (a.id === ansId ? { ...a, userVote: nextVote, upvotes: nextScore } : a))
    );

    try {
      if (prevVote === type) {
        await voteApi.removeVote('ANSWER', numAnsId);
      } else {
        await voteApi.vote({
          target_type: 'ANSWER',
          target_id: numAnsId,
          vote_value: type === 'UP' ? 1 : -1,
        });
      }
      const stats = await voteApi.getStats('ANSWER', numAnsId);
      setAnswers((prev) =>
        prev.map((a) =>
          a.id === ansId
            ? {
                ...a,
                upvotes: stats.score,
                userVote: stats.myVoteValue === 1 ? 'UP' : stats.myVoteValue === -1 ? 'DOWN' : null,
              }
            : a
        )
      );

      if (type === 'UP' && currentAns?.author?.id && String(currentAns.author.id) !== String(currentUser?.id)) {
        const senderName = currentUser?.fullName || (currentUser as any)?.displayName || t('common.peerStudent', 'Một bạn học');
        notificationApi.createNotification({
          recipientUserId: Number(currentAns.author.id),
          type: 'UPVOTE',
          title: `${senderName} đã thích câu trả lời của bạn`,
          message: `"${currentAns.content?.slice(0, 80)}..."`,
          actionUrl: `/questions/${id}#${ansId}`,
          targetType: 'ANSWER',
          targetId: numAnsId,
        });
      }
    } catch (err) {
      setAnswers((prev) =>
        prev.map((a) => (a.id === ansId ? { ...a, userVote: prevVote, upvotes: prevScore } : a))
      );
    }
  };

  const handleMarkBestAnswer = async (ansId: string) => {
    if (!question) return;
    const targetAns = answers.find(a => a.id === ansId);
    if (!targetAns) return;
    const isCurrentlyBest = !!targetAns.isBestAnswer;

    const numQId = Number(question.id.replace(/\D/g, ''));
    const numAnsId = Number(ansId.replace(/\D/g, ''));
    if (numQId) {
      try {
        if (isCurrentlyBest) {
          await questionApi.unmarkBestAnswer(numQId);
        } else if (numAnsId) {
          await questionApi.markBestAnswer(numQId, numAnsId);
        }
      } catch (err) {
        console.warn('API error toggling best answer:', err);
      }
    }
    setAnswers((prev) =>
      prev.map((a) => ({
        ...a,
        isBestAnswer: a.id === ansId ? !isCurrentlyBest : false,
      }))
    );
  };

  const handleSaveEditAnswer = async (ansId: string) => {
    if (!question || !editingAnswerBody.trim()) return;
    const numQId = Number(question.id.replace(/\D/g, ''));
    const numAnsId = Number(ansId.replace(/\D/g, ''));
    if (numQId && numAnsId) {
      try {
        await questionApi.updateAnswer(numQId, numAnsId, { body: editingAnswerBody.trim() });
      } catch (err) {
        console.warn('API error updating answer:', err);
      }
    }
    setAnswers(prev => prev.map(a => a.id === ansId ? { ...a, content: editingAnswerBody.trim() } : a));
    setEditingAnswerId(null);
    setEditingAnswerBody('');
  };

  const handleConfirmDeleteAnswer = async () => {
    if (!question || !deletingAnswerId) return;
    const numQId = Number(question.id.replace(/\D/g, ''));
    const numAnsId = Number(deletingAnswerId.replace(/\D/g, ''));
    if (numQId && numAnsId) {
      try {
        await questionApi.deleteAnswer(numQId, numAnsId);
      } catch (err) {
        console.warn('API error deleting answer:', err);
      }
    }
    setAnswers(prev => prev.filter(a => a.id !== deletingAnswerId));
    setDeletingAnswerId(null);
  };

  const handleToggleModVerified = (ansId: string) => {
    setAnswers((prev) =>
      prev.map((a) => (a.id === ansId ? { ...a, isModVerified: !a.isModVerified } : a))
    );
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !newAnswerContent.trim()) return;

    const numQId = Number(question.id.replace(/\D/g, ''));
    let createdAnsId = `ans-${Date.now()}`;
    if (numQId) {
      try {
        if (currentUser?.role === 'Alumni') {
          const res = await alumniApi.createExpertAnswer(numQId, { body: newAnswerContent.trim(), industryContext: 'Alumni Insight' });
          if (res && (res.answerId || res.data?.answerId)) {
            createdAnsId = String(res.answerId || res.data?.answerId);
          }
        } else {
          const res = await questionApi.createAnswer(numQId, { body: newAnswerContent.trim() });
          try {
            await apiClient.post('/api/reputation/events', {
              user_id: Number(currentUser?.id),
              rule_code: 'ANSWER_CREATED',
              source_type: 'Answer',
              source_id: Number(res.answerId || (res as any).id),
            });
            updateUser?.({ karma: ((currentUser as any)?.karma || 0) + 2 });
          } catch {}
          createdAnsId = String(res.answerId);
        }
      } catch (err) {
        console.warn('API error creating answer, saving locally:', err);
      }
    }

    const newAns: Answer = {
      id: createdAnsId,
      questionId: question.id,
      author: {
        id: currentUser?.id || 'usr-current',
        fullName: currentUser?.fullName || (currentUser as any)?.displayName || currentUser?.email?.split('@')[0] || t('common.you', 'Bạn'),
        avatarUrl: currentUser?.avatarUrl,
        role: currentUser?.role || 'Student',
        karma: currentUser?.karma || 0,
        campus: resolveUserCampus(currentUser),
      },
      content: newAnswerContent,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      isBestAnswer: false,
      isModVerified: false,
      comments: [],
      createdAt: new Date().toISOString(),
    };

    setAnswers([...answers, newAns]);
    setNewAnswerContent('');

    if (question?.author?.id && String(question.author.id) !== String(currentUser?.id)) {
      const senderName = currentUser?.fullName || (currentUser as any)?.displayName || t('common.peerStudent', 'Một bạn học');
      notificationApi.createNotification({
        recipientUserId: Number(question.author.id),
        type: 'ANSWER',
        title: `${senderName} đã trả lời câu hỏi của bạn`,
        message: `"${question.title?.slice(0, 80)}..."`,
        actionUrl: `/questions/${id}`,
        targetType: 'QUESTION',
        targetId: numQId,
      });
    }
  };

  const handleAddComment = async (ansId: string) => {
    const text = commentInputs[ansId];
    if (!text || !text.trim()) return;

    const numAnsId = Number(ansId.replace(/\D/g, ''));
    let commentId = `c-${Date.now()}`;
    if (numAnsId) {
      try {
        const res = await questionApi.createAnswerComment(numAnsId, { body: text.trim() });
        commentId = String(res.commentId);
      } catch (err) {
        console.warn('API error creating comment:', err);
      }
    }

    const newComment: CommentItem = {
      id: commentId,
      parentId: ansId,
      author: {
        id: currentUser?.id || 'usr-current',
        fullName: currentUser?.fullName || (currentUser as any)?.displayName || currentUser?.email?.split('@')[0] || t('common.you', 'Bạn'),
      },
      content: text,
      createdAt: t('common.justNow', 'Vừa xong'),
    };

    setAnswers((prev) =>
      prev.map((a) => (a.id === ansId ? { ...a, comments: [...a.comments, newComment] } : a))
    );
    setCommentInputs({ ...commentInputs, [ansId]: '' });

    const targetAns = answers.find(a => a.id === ansId);
    if (targetAns?.author?.id && String(targetAns.author.id) !== String(currentUser?.id)) {
      const senderName = currentUser?.fullName || (currentUser as any)?.displayName || t('common.peerStudent', 'Một bạn học');
      notificationApi.createNotification({
        recipientUserId: Number(targetAns.author.id),
        type: 'COMMENT',
        title: `${senderName} đã bình luận vào câu trả lời của bạn`,
        message: `"${text.slice(0, 80)}..."`,
        actionUrl: `/questions/${id}#${ansId}`,
        targetType: 'ANSWER',
        targetId: numAnsId,
      });
    }
  };

  const copySnippet = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        {t('Loading...')}
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">{t('No data found')}</h3>
        <p className="text-xs text-slate-500">{t('questions.notFound', 'Câu hỏi này không tồn tại hoặc đã bị xóa.')}</p>
        <Link to="/discussions" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700">
          <ArrowLeft className="w-4 h-4" /> {t('Back to Discussions')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
        <Link to="/courses" className="hover:text-blue-600 transition-colors">{t("Course Hub")}</Link>
        <span>/</span>
        {question.courseCode && (
          <>
            <Link to={`/courses/${question.courseCode}`} className="font-bold text-blue-600 hover:underline">
              {question.courseCode}
            </Link>
            <span>/</span>
          </>
        )}
        <Link to="/discussions" className="hover:text-blue-600 transition-colors">{t("Discussions")}</Link>
        <span>/</span>
        <span className="text-slate-400 truncate max-w-[200px]">{question.title}</span>
      </div>

      {/* Main Question Card (Figma Frame 5: Discussions Detail) */}
      <Card>
        <CardBody className="p-6 sm:p-8 space-y-5">

          {/* Header Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {question.courseCode && (
                <Link to={`/courses/${question.courseCode}`}>
                  <Badge variant="primary" size="md">
                    {question.courseCode}
                  </Badge>
                </Link>
              )}
              {isPinned && <Badge variant="warning" size="sm">{t('Pinned')}</Badge>}
              {isLocked && <Badge variant="danger" size="sm" icon={<Lock className="w-3 h-3" />}>{t('Closed')}</Badge>}
              {question.isSolved && (
                <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                  {t("Đã giải quyết")}</Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              {question.title}
            </h1>

            <div className="flex items-center justify-between gap-4 pt-2 border-b border-slate-100 dark:border-slate-800 pb-4 text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                {question.author.isAnonymous ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold border border-purple-200 dark:border-purple-800 shrink-0">
                      <EyeOff className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{t('Anonymous FPTer')}</span>
                        <Badge variant="purple" size="sm">{t('Anonymous Author')}</Badge>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {t('questions.askedAt', 'Đã hỏi:')} {new Date(question.createdAt).toLocaleDateString(locale)} • {t('questions.views', 'Xem:')} {question.viewsCount} {t('questions.viewsSuffix', 'lượt')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <UserHoverCard
                    userId={question.author.id}
                    initialData={{
                      fullName: getAuthorDisplayName(question.author.id, question.author.fullName, question.author.isAnonymous),
                      avatarUrl: getAuthorAvatar(question.author.id, question.author.avatarUrl, question.author.isAnonymous),
                      campus: question.author.campus,
                    }}
                  >
                    <div className="flex items-center gap-2.5 group cursor-pointer">
                      <img
                        src={normalizeMediaUrl(getAuthorAvatar(question.author.id, question.author.avatarUrl, question.author.isAnonymous)) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={getAuthorDisplayName(question.author.id, question.author.fullName, question.author.isAnonymous)}
                        className="w-8 h-8 rounded-full object-cover group-hover:ring-2 group-hover:ring-[#0076D1] transition-all"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0076D1] dark:group-hover:text-blue-400 group-hover:underline transition-colors">
                            {getAuthorDisplayName(question.author.id, question.author.fullName, question.author.isAnonymous)}
                          </span>
                          {getAuthorCampus(question.author.id, question.author.campus, question.author.isAnonymous) ? (
                            <Badge variant="neutral" size="sm">{getAuthorCampus(question.author.id, question.author.campus, question.author.isAnonymous)}</Badge>
                          ) : null}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {t('questions.askedAt', 'Đã hỏi:')} {new Date(question.createdAt).toLocaleDateString(locale)} • {t('questions.views', 'Xem:')} {question.viewsCount} {t('questions.viewsSuffix', 'lượt')}
                        </span>
                      </div>
                    </div>
                  </UserHoverCard>
                )}
              </div>

              <div className="flex items-center gap-2">
                {canEditQuestion && (
                  <Button
                    id="btn-edit-question"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditQuestionTitle(question.title);
                      setEditQuestionBody(question.content);
                      setShowEditQuestionModal(true);
                    }}
                    leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
                  >
                    {t('Edit')}
                  </Button>
                )}
                {canDeleteQuestion && (
                  <Button
                    id="btn-delete-question"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteQuestionModal(true)}
                    className="text-red-600 hover:bg-red-50"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    {t('Delete')}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={isBookmarked ? 'secondary' : 'outline'}
                  onClick={toggleBookmark}
                  leftIcon={<Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600' : ''}`} />}
                >
                  {isBookmarked ? t('common.saved', 'Đã lưu') : t('common.bookmark', 'Lưu')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsShareModalOpen(true)}
                  leftIcon={<Share2 className="w-3.5 h-3.5" />}
                >
                  {t('common.share', 'Chia sẻ')}
                </Button>
                <ContentActionMenu
                  targetType="QUESTION"
                  targetId={question.id}
                  targetTitle={question.title}
                  shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                />
              </div>
            </div>
          </div>

          {/* Question Content with Markdown rendering */}
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <MarkdownPreview content={question.content} />
          </div>

          {/* Question Tags & Voting Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {question.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/discussions?tag=${tag}`}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleVoteQuestion('UP')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    userVote === 'UP' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{upvotes}</span>
                </button>
                <button
                  onClick={() => handleVoteQuestion('DOWN')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    userVote === 'DOWN' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setIsVotingStatsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0076D1] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                title={t("View Voting Stats Detail")}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{t('Voting Stats')}</span>
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Accepted Best Answer Highlight Banner (Figma Frame 5) */}
      {answers.some((a) => a.isBestAnswer) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-300/80 dark:border-emerald-800/80 flex items-center justify-between gap-3 text-emerald-950 dark:text-emerald-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                {t('Accepted Best Answer by Author')}
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                {t('questions.bestAnswerSolvedNotice', 'Câu trả lời chính xác đã giải quyết được vấn đề • Đã cộng +50 Karma cho tác giả')}
              </p>
            </div>
          </div>
          <Badge variant="success" size="md">
            {t("+50 Karma")}</Badge>
        </div>
      )}

      {/* Answers Section List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
            {answers.length} {t('Answers')}
          </h2>
          <span className="text-xs text-slate-400">{t('questions.sortByHighestScore', 'Sắp xếp theo: Điểm cao nhất')}</span>
        </div>

        {answers.map((ans) => (
          <Card
            key={ans.id}
            className={`${ans.isBestAnswer ? 'border-2 border-emerald-500/80 shadow-xs ring-2 ring-emerald-500/10' : ''}`}
          >
            <CardBody className="p-6 space-y-4">
              {/* Answer Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {ans.author.isAnonymous ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold border border-purple-200 dark:border-purple-800 shrink-0">
                        <EyeOff className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {getAuthorDisplayName(ans.author.id, ans.author.fullName, ans.author.isAnonymous)}
                          </span>
                          <Badge variant="purple" size="sm">{t("Ẩn danh")}</Badge>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {`${t('questions.answeredAt', 'Trả lời:')} ${new Date(ans.createdAt).toLocaleDateString(locale)}`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <UserHoverCard
                      userId={ans.author.id}
                      initialData={{
                        fullName: getAuthorDisplayName(ans.author.id, ans.author.fullName, ans.author.isAnonymous),
                        avatarUrl: getAuthorAvatar(ans.author.id, ans.author.avatarUrl, ans.author.isAnonymous),
                        campus: ans.author.campus,
                      }}
                    >
                      <div className="flex items-center gap-3 group cursor-pointer">
                        <img
                          src={normalizeMediaUrl(getAuthorAvatar(ans.author.id, ans.author.avatarUrl, ans.author.isAnonymous)) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={getAuthorDisplayName(ans.author.id, ans.author.fullName, ans.author.isAnonymous)}
                          className="w-8 h-8 rounded-full object-cover group-hover:ring-2 group-hover:ring-[#0076D1] transition-all"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-[#0076D1] dark:group-hover:text-blue-400 group-hover:underline transition-colors">
                              {getAuthorDisplayName(ans.author.id, ans.author.fullName, ans.author.isAnonymous)}
                            </span>
                            <Badge variant="purple" size="sm">{t(ans.author.role)}</Badge>
                            {getAuthorCampus(ans.author.id, ans.author.campus, ans.author.isAnonymous) ? (
                              <Badge variant="neutral" size="sm">{getAuthorCampus(ans.author.id, ans.author.campus, ans.author.isAnonymous)}</Badge>
                            ) : null}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {t("Karma: {p0} pts • {p1} {p2}", undefined, { p0: ans.author.karma.toLocaleString(locale), p1: t('questions.answeredAt', 'Trả lời:'), p2: new Date(ans.createdAt).toLocaleDateString(locale) })}
                          </span>
                        </div>
                      </div>
                    </UserHoverCard>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {ans.isBestAnswer && (
                    <Badge variant="success" size="md" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                      {t("Best Answer")}</Badge>
                  )}
                  {ans.isModVerified && (
                    <Badge variant="info" size="sm" icon={<Check className="w-3 h-3" />}>
                      {t("Mod Verified")}</Badge>
                  )}
                </div>
              </div>

              {/* Answer Content / Inline Edit Answer (3.4.7) */}
              {editingAnswerId === ans.id ? (
                <div id={`inline-edit-answer-${ans.id}`} className="space-y-2 p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
                  <label className="text-xs font-semibold text-blue-900 dark:text-blue-300 block">{t("Chỉnh sửa câu trả lời")}</label>
                  <textarea
                    rows={4}
                    value={editingAnswerBody}
                    onChange={(e) => setEditingAnswerBody(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => { setEditingAnswerId(null); setEditingAnswerBody(''); }}>{t("Hủy")}</Button>
                    <Button size="sm" variant="primary" onClick={() => handleSaveEditAnswer(ans.id)}>{t("Lưu thay đổi")}</Button>
                  </div>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  <MarkdownPreview content={ans.content} />
                </div>
              )}

              {/* Action Buttons on Answer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVoteAnswer(ans.id, 'UP')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      ans.userVote === 'UP' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{ans.upvotes}</span>
                  </button>
                  <button
                    onClick={() => handleVoteAnswer(ans.id, 'DOWN')}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                      ans.userVote === 'DOWN' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {canEditAnswer(ans) && (
                    <Button
                      id={`btn-edit-answer-${ans.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (editingAnswerId === ans.id) {
                          setEditingAnswerId(null);
                          setEditingAnswerBody('');
                        } else {
                          setEditingAnswerId(ans.id);
                          setEditingAnswerBody(ans.content);
                        }
                      }}
                      leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
                    >
                      {t('Edit')}
                    </Button>
                  )}
                  {canDeleteAnswer(ans) && (
                    <Button
                      id={`btn-delete-answer-${ans.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingAnswerId(ans.id)}
                      className="text-red-600 hover:bg-red-50"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      {t('Delete')}
                    </Button>
                  )}
                  {canMarkBestAnswer && String(ans.author?.id || '') !== String(currentUser?.id || '') && (
                    <Button
                      size="sm"
                      variant={ans.isBestAnswer ? 'secondary' : 'outline'}
                      onClick={() => handleMarkBestAnswer(ans.id)}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    >
                      {ans.isBestAnswer ? t('Cancel') : t('Best Answer')}
                    </Button>
                  )}
                  <ContentActionMenu
                    targetType="ANSWER"
                    targetId={ans.id}
                    targetTitle={`${t('questions.answerOf', 'Câu trả lời của')} ${ans.author?.fullName || t('common.studentNumber', 'Sinh viên')}`}
                  />
                </div>
              </div>

              {/* Comment Thread under Answer */}
              {ans.comments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  {ans.comments.map((cmt) => (
                    <div key={cmt.id} className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {editingCommentId === cmt.id ? (
                        <div id={`inline-edit-comment-${cmt.id}`} className="flex items-center gap-2 p-2 bg-blue-50/60 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800">
                          <input
                            type="text"
                            defaultValue={cmt.content}
                            className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                          />
                          <Button size="sm" variant="primary" onClick={() => setEditingCommentId(null)}>{t("Cập nhật")}</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>{t("Hủy")}</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <CornerDownRight className="w-3 h-3 text-slate-400" />
                          <span>{getAuthorDisplayName(cmt.author.id, cmt.author.fullName)}:</span>
                          <span className="font-normal text-slate-600 dark:text-slate-300">{cmt.content}</span>
                          <span className="text-[10px] text-slate-400 ml-auto">{formatDate(cmt.createdAt)}</span>
                          <button
                            id={`btn-edit-comment-${cmt.id}`}
                            onClick={() => setEditingCommentId(cmt.id)}
                            className="text-slate-400 hover:text-slate-600 ml-2"
                            title={t("Sửa bình luận")}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            id={`btn-delete-comment-${cmt.id}`}
                            onClick={() => setDeletingCommentId(cmt.id)}
                            className="text-slate-400 hover:text-red-500 ml-1"
                            title={t("Xóa bình luận")}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Add Comment Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder={t('Write a reply to the support team...')}
                  value={commentInputs[ans.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [ans.id]: e.target.value })}
                  className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <Button size="sm" variant="secondary" onClick={() => handleAddComment(ans.id)}>{t('common.send', 'Gửi')}</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Answer Composer (Figma Frame 5: Markdown Answer Editor) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {t('Your Answer')}
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setComposerTab('write')}
                className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer ${
                  composerTab === 'write' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {t('questions.tabWrite', 'Soạn thảo')}
              </button>
              <button
                onClick={() => setComposerTab('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer ${
                  composerTab === 'preview' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {t('questions.tabPreview', 'Xem trước')}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-5 space-y-4">
          {isLocked ? (
            <div className="p-8 text-center space-y-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <Lock className="w-8 h-8 mx-auto text-rose-500" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{t('questions.lockedTitle', 'Thảo luận này đã bị khóa bình luận')}</h4>
              <p className="text-xs text-slate-500">{t('questions.lockedDesc', 'Điều hành viên đã tạm khóa thảo luận này để rà soát hoặc ngăn chặn vi phạm nội quy.')}</p>
            </div>
          ) : (
            <>
              {composerTab === 'write' ? (
                <div className="space-y-2">
              {/* Markdown Helper Toolbar */}
              <div className="flex items-center gap-1 pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                <button
                  type="button"
                  onClick={() => setNewAnswerContent((c) => `${c}\n\`\`\`csharp\n// your code here\n\`\`\`\n`)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-mono flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                  title={t('questions.addCodeBlock', 'Thêm Code Block')}
                >
                  <Code className="w-3.5 h-3.5" /> <span>{t("Code")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewAnswerContent((c) => t("{p0} **in đậm** ", undefined, { p0: c }))}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs hover:text-blue-600 cursor-pointer"
                  title={t('questions.bold', 'In đậm')}
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNewAnswerContent((c) => t("{p0} *in nghiêng* ", undefined, { p0: c }))}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs hover:text-blue-600 cursor-pointer"
                  title={t('questions.italic', 'In nghiêng')}
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNewAnswerContent((c) => `${c}\n- Item 1\n- Item 2\n`)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs hover:text-blue-600 cursor-pointer"
                  title={t('questions.list', 'Danh sách')}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNewAnswerContent((c) => t("{p0}\n> Trích dẫn\n", undefined, { p0: c }))}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs hover:text-blue-600 cursor-pointer"
                  title={t('questions.quote', 'Trích dẫn')}
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>

              <Textarea
                placeholder={t('questions.answerPlaceholder', 'Nhập nội dung giải đáp chi tiết, hướng dẫn từng bước và kèm code snippet mẫu...')}
                rows={6}
                value={newAnswerContent}
                onChange={(e) => setNewAnswerContent(e.target.value)}
              />
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl min-h-[160px] text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <MarkdownPreview content={newAnswerContent} />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-400">
              💡 {t('questions.markdownHelperNotice', 'Hỗ trợ Markdown: dùng ```csharp để highlight code.')}
            </p>
            <Button
              variant="primary"
              onClick={handleSubmitAnswer}
              disabled={!newAnswerContent.trim()}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="shadow-xs"
            >
              {t('Submit Answer')}  {t("(+15 Karma)")}</Button>
          </div>
        </>
      )}
    </CardBody>
      </Card>

      <VotingStatsModal
        isOpen={isVotingStatsOpen}
        onClose={() => setIsVotingStatsOpen(false)}
        question={question}
        upvotesCount={voteDetails.upvotes}
        downvotesCount={voteDetails.downvotes}
      />

      {/* ─── 3.4.4 Edit Question Post Modal ────────────────────────────────────── */}
      {showEditQuestionModal && question && (
        <div id="modal-edit-question" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0076D1]" />
                <span>{t("Chỉnh Sửa Câu Hỏi Học Thuật")}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditQuestionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("Tiêu đề câu hỏi")}</label>
                <input
                  type="text"
                  value={editQuestionTitle}
                  onChange={(e) => setEditQuestionTitle(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("Môn học & Tags")}</label>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-[#0076D1] border border-blue-200 rounded-lg text-xs font-mono font-bold">
                    {question.courseCode || 'SWP391'}
                  </span>
                  {question.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("Nội dung câu hỏi (Markdown)")}</label>
                <textarea
                  rows={6}
                  value={editQuestionBody}
                  onChange={(e) => setEditQuestionBody(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditQuestionModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}</button>
              <button
                id="btn-save-edit-question"
                type="button"
                onClick={async () => {
                  if (!id) return;
                  const numId = Number(id.replace(/\D/g, ''));
                  try {
                    await questionApi.updateQuestion(numId, {
                      title: editQuestionTitle,
                      body: editQuestionBody,
                    });
                    setQuestion((prev) => prev ? ({
                      ...prev,
                      title: editQuestionTitle,
                      content: editQuestionBody,
                    }) : null);
                    setShowEditQuestionModal(false);
                  } catch (err) {
                    console.error('Failed to update question:', err);
                  }
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Lưu thay đổi")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3.4.5 Delete Question Confirmation Modal ──────────────────────────── */}
      {showDeleteQuestionModal && question && (
        <div id="modal-delete-question" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("Xóa Bài Đăng Câu Hỏi")}</h3>
                <p className="text-xs text-slate-500">{t("Hành động không thể hoàn tác")}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("Bạn có chắc chắn muốn xóa câu hỏi")} <strong>"{question.title}"</strong>{t("? Toàn bộ")} <strong>{answers.length}  {t("câu trả lời")}</strong>  {t("và các thảo luận liên quan sẽ bị xóa vĩnh viễn khỏi diễn đàn.")}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteQuestionModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}</button>
              <button
                id="btn-confirm-delete-question"
                type="button"
                onClick={async () => {
                  if (!id) return;
                  const numId = Number(id.replace(/\D/g, ''));
                  try {
                    await questionApi.deleteQuestion(numId);
                    setShowDeleteQuestionModal(false);
                    navigate('/discussions');
                  } catch (err) {
                    console.error('Failed to delete question:', err);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Xác nhận xóa")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3.4.8 Delete Answer Confirmation Modal ────────────────────────────── */}
      {deletingAnswerId && (
        <div id="modal-delete-answer" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("Xóa Câu Trả Lời")}</h3>
                <p className="text-xs text-slate-500">{t("Xác nhận xóa câu trả lời")}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("Bạn có chắc chắn muốn xóa câu trả lời này? Điểm danh tiếng (Karma) tương ứng của bạn sẽ được hoàn lại về trạng thái trước đó.")}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingAnswerId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}</button>
              <button
                id="btn-confirm-delete-answer"
                type="button"
                onClick={handleConfirmDeleteAnswer}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Xác nhận xóa")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3.4.11 Delete Comment Confirmation Modal ──────────────────────────── */}
      {deletingCommentId && (
        <div id="modal-delete-comment" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("Xóa Bình Luận")}</h3>
                <p className="text-xs text-slate-500">{t("Gỡ bỏ ý kiến phản hồi")}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("Bạn có chắc chắn muốn gỡ bỏ bình luận này khỏi câu trả lời?")}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingCommentId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}</button>
              <button
                id="btn-confirm-delete-comment"
                type="button"
                onClick={() => {
                  setAnswers(prev => prev.map(a => ({
                    ...a,
                    comments: a.comments.filter(c => c.id !== deletingCommentId)
                  })));
                  setDeletingCommentId(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Xác nhận xóa")}</button>
            </div>
          </div>
        </div>
      )}
      {question && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={question.title}
          url={typeof window !== 'undefined' ? window.location.href : `/discussions/${question.id}`}
          description={question.content?.slice(0, 160)}
        />
      )}
    </div>
  );
};
