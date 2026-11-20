import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Bookmark,
  Share2,
  Clock,
  Eye,
  ArrowLeft,
  Sparkles,
  Layers,
  Check,
  Copy,
  Plus,
  MessageSquare,
  CornerDownRight,
  ListFilter,
  Send,
  Edit3,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Award,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Input';
import { MarkdownPreview } from '../../components/common/MarkdownPreview';
import { articleApi } from '../../services/api/contentApi';
import { voteApi, bookmarkApi, notificationApi, profileApi, followApi, studentReputationApi } from '../../services/api/studentApi';
import { normalizeMediaUrl } from '../../utils/mediaUtils';
import { formatDisplayDate, calculateReadingTime, isUserAlumni } from '../../utils/fptEmailValidator';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import { SocialShareModal } from '../../components/common/SocialShareModal';
import { UserHoverCard } from '../../components/common/UserHoverCard';
import { SeriesSidebarCard } from '../../components/common/SeriesSidebarCard';
import { resolveUserCampus } from '../../utils/taxonomyUtils';
import {
  loadAllSemanticTags,
  getSemanticTagMap,
  resolveTagNames,
  resolveCategoryFromTags,
} from '../../utils/tagUtils';

export const ArticleDetailPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { formatDate, locale, t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    const loadDetail = async () => {
      try {
        setIsLoading(true);
        const [data, tagsRes] = await Promise.all([
          articleApi.getArticleById(id),
          loadAllSemanticTags(),
        ]);
        if (isMounted && data) {
          const tagMap = getSemanticTagMap(tagsRes);
          const tags = resolveTagNames(data.semanticTagIds, tagMap);
          const category = resolveCategoryFromTags(data.semanticTagIds, tagMap) || (tags.length > 0 ? tags[0] : t("Bài viết học thuật"));
          setArticle({
            id: String(data.articleId),
            version: data.version,
            title: data.title,
            summary: data.summary || '',
            content: data.content || '',
            coverImage: data.coverImageUrl || '',
            createdAt: data.createdAt,
            readTimeMinutes: calculateReadingTime(data.content, data.summary, data.title),
            viewsCount: 0,
            category,
            tags,
            authorUserId: data.authorUserId,
            author: {
              fullName: data.authorStaffId
                ? 'FPT Faculty Staff'
                : (data.authorUserId && currentUser?.id && String(data.authorUserId) === String(currentUser.id) ? (currentUser.fullName || null) : null) || (data as any).authorDisplayName || (data as any).authorName || (data.authorUserId ? `Sinh viên FPT (#${data.authorUserId})` : 'Thành viên FHub'),
              role: data.authorStaffId ? 'Staff' : 'Student',
              campus: (data.authorUserId && currentUser?.id && String(data.authorUserId) === String(currentUser.id) ? resolveUserCampus(currentUser) : resolveUserCampus(data)),
              major: (data.authorUserId && currentUser?.id && String(data.authorUserId) === String(currentUser.id) ? (currentUser.major || '') : ''),
              avatarUrl: '',
              bio: '',
            },
          });
          setVoteScore(0);
          setUserVote(null);

          if (data.authorUserId) {
            const authorId = Number(data.authorUserId);

            // 1. Fetch real author profile from DB
            profileApi.getProfile(authorId).then((p: any) => {
              if (!isMounted || !p) return;
              const realName = p.displayName || p.fullName || (data as any).authorDisplayName || (data as any).authorName;
              setArticle((prev: any) => prev ? {
                ...prev,
                author: {
                  ...prev.author,
                  fullName: realName || prev.author.fullName,
                  avatarUrl: p.avatarUrl || prev.author.avatarUrl,
                  campus: resolveUserCampus(p) || prev.author.campus || '',
                  major: p.majorCode || p.major || prev.author.major || '',
                  bio: p.bio || '',
                }
              } : prev);
              setAuthorStats((prev) => ({
                ...prev,
                bio: p.bio || '',
              }));
            }).catch(() => {});

            // 2. Fetch real follow stats, follow status, karma and articles count
            Promise.allSettled([
              followApi.getFollowStats(authorId),
              followApi.getFollowStatus(authorId),
              studentReputationApi.getAccount(authorId),
              articleApi.getArticles({ authorUserId: authorId, pageSize: 1 })
            ]).then(([statsRes, statusRes, repRes, articlesRes]) => {
              if (!isMounted) return;
              if (statsRes.status === 'fulfilled' && statsRes.value) {
                setAuthorStats((prev) => ({
                  ...prev,
                  followersCount: statsRes.value.followers_count ?? 0,
                }));
              }
              if (statusRes.status === 'fulfilled' && statusRes.value) {
                setIsFollowingAuthor(Boolean(statusRes.value.is_following));
              }
              if (repRes.status === 'fulfilled' && repRes.value) {
                const rep = repRes.value;
                setAuthorStats((prev) => ({
                  ...prev,
                  karma: rep.karma ?? rep.total_points ?? rep.points ?? 0,
                }));
              }
              if (articlesRes.status === 'fulfilled' && articlesRes.value) {
                setAuthorStats((prev) => ({
                  ...prev,
                  articlesCount: articlesRes.value.totalCount ?? 1,
                }));
              }
            }).catch(() => {});
          }

          const numId = Number(id.replace(/\D/g, ''));
          if (numId) {
            try {
              const stats = await voteApi.getStats('ARTICLE', numId);
              if (isMounted) {
                setVoteScore(stats.score);
                setUserVote(stats.myVoteValue === 1 ? 'UP' : stats.myVoteValue === -1 ? 'DOWN' : null);
              }
            } catch {}

            try {
              const bList = await bookmarkApi.getBookmarks('Article');
              const found = bList.find((b) => Number(b.targetId) === numId);
              if (found && isMounted) {
                setIsBookmarked(true);
                setBookmarkId(found.id);
              }
            } catch {}
          }
        }
      } catch (err) {
        if (isMounted) setArticle(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadDetail();
    return () => { isMounted = false; };
  }, [id]);

  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(null);
  const [voteScore, setVoteScore] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<number | string | null>(null);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);
  const [authorStats, setAuthorStats] = useState<{
    followersCount: number;
    karma: number;
    articlesCount: number;
    bio?: string;
  }>({
    followersCount: 0,
    karma: 0,
    articlesCount: 1,
    bio: '',
  });
  const [isCopiedShare, setIsCopiedShare] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleToggleFollow = async () => {
    if (!article?.authorUserId || isFollowLoading) return;
    const authorId = Number(article.authorUserId);
    setIsFollowLoading(true);
    try {
      if (isFollowingAuthor) {
        await followApi.unfollowUser(authorId);
        setIsFollowingAuthor(false);
        setAuthorStats((prev) => ({ ...prev, followersCount: Math.max(0, prev.followersCount - 1) }));
      } else {
        await followApi.followUser(authorId);
        setIsFollowingAuthor(true);
        setAuthorStats((prev) => ({ ...prev, followersCount: prev.followersCount + 1 }));
      }
    } catch (err) {
      console.warn('Failed to toggle follow author:', err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const isOwnArticle = Boolean(
    currentUser?.id &&
    article?.authorUserId &&
    String(currentUser.id).replace(/\D/g, '') === String(article.authorUserId).replace(/\D/g, '')
  );

  const isArticleOwner = Boolean(
    currentUser && (
      (article?.authorUserId && (
        String(currentUser.id) === String(article.authorUserId) ||
        String(currentUser.id).replace(/\D/g, '') === String(article.authorUserId).replace(/\D/g, '')
      )) ||
      currentUser.role === 'Admin'
    )
  );

  const handleShareArticle = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url);
      setIsCopiedShare(true);
      setTimeout(() => setIsCopiedShare(false), 2000);
    }
  };
  const [copiedCode, setCopiedCode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showDeleteArticleModal, setShowDeleteArticleModal] = useState(false);
  const [isDeletingArticle, setIsDeletingArticle] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [hiddenCommentIds, setHiddenCommentIds] = useState<Set<string>>(new Set());

  const toggleHideComment = (cmtId: string) => {
    setHiddenCommentIds(prev => {
      const next = new Set(prev);
      if (next.has(cmtId)) next.delete(cmtId);
      else next.add(cmtId);
      return next;
    });
  };

  const handleVote = async (direction: 'UP' | 'DOWN') => {
    if (!id) return;
    const numId = Number(id.replace(/\D/g, ''));
    if (!numId) return;

    const voteValue = direction === 'UP' ? 1 : -1;
    const prevVote = userVote;
    const prevScore = voteScore;

    let nextVote: 'UP' | 'DOWN' | null = direction;
    let nextScore = prevScore;

    if (prevVote === direction) {
      nextVote = null;
      nextScore -= voteValue;
    } else if (prevVote) {
      nextScore += voteValue * 2;
    } else {
      nextScore += voteValue;
    }

    setUserVote(nextVote);
    setVoteScore(nextScore);

    try {
      if (prevVote === direction) {
        await voteApi.removeVote('ARTICLE', numId);
      } else {
        await voteApi.vote({
          target_type: 'ARTICLE',
          target_id: numId,
          vote_value: voteValue,
        });
      }
      const stats = await voteApi.getStats('ARTICLE', numId);
      setVoteScore(stats.score);
      setUserVote(stats.myVoteValue === 1 ? 'UP' : stats.myVoteValue === -1 ? 'DOWN' : null);

      if (direction === 'UP' && prevVote !== 'UP' && article?.authorUserId && String(article.authorUserId) !== String(currentUser?.id)) {
        const senderName = currentUser?.fullName || (currentUser as any)?.displayName || t('common.peerStudent', 'Một bạn học');
        notificationApi.createNotification({
          recipientUserId: Number(article.authorUserId),
          type: 'UPVOTE',
          title: `${senderName} đã bình chọn bài viết của bạn`,
          message: `"${article.title?.slice(0, 80)}..."`,
          actionUrl: `/articles/${id}`,
          targetType: 'ARTICLE',
          targetId: numId,
        });
      }
    } catch (err) {
      setUserVote(prevVote);
      setVoteScore(prevScore);
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
        const res = await bookmarkApi.addBookmark('Article', numId);
        setIsBookmarked(true);
        const bId = res?.bookmark_id ?? res?.data?.bookmark_id ?? res?.id;
        setBookmarkId(bId || Date.now());
      } catch (err) {
        console.warn('Failed to add bookmark:', err);
      }
    }
  };

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const authorName = currentUser?.fullName || (currentUser as any)?.displayName || 'Bạn (Sinh viên FHub)';
    const textToSend = commentText;
    setComments([
      ...comments,
      {
        id: `cmt-${Date.now()}`,
        author: { fullName: authorName, avatarUrl: currentUser?.avatarUrl || '', campus: currentUser?.campus || 'FU' },
        content: textToSend,
        createdAt: t('common.justNow', 'Vừa xong'),
      },
    ]);
    setCommentText('');

    if (article?.authorUserId && String(article.authorUserId) !== String(currentUser?.id)) {
      notificationApi.createNotification({
        recipientUserId: Number(article.authorUserId),
        type: 'COMMENT',
        title: `${authorName} đã bình luận bài viết của bạn`,
        message: `"${textToSend.slice(0, 80)}..."`,
        actionUrl: `/articles/${id}`,
        targetType: 'ARTICLE',
        targetId: Number(id?.replace(/\D/g, '') || 0),
      });
    }
  };

  const tocItems = [
    { id: 'intro', title: '1. Introduction' },
    { id: 'content', title: '2. Content Details' },
  ];

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        {t('Loading...')}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">{t('No data found')}</h3>
        <p className="text-xs text-slate-500">{t("Bài viết này không tồn tại hoặc đã bị gỡ bỏ.")}</p>
        <Link to="/articles" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700">
          <ArrowLeft className="w-4 h-4" /> {t('Back to Articles')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/articles" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />  {t("Quay lại danh sách bài viết")}</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Article Content Column (Figma Frame 7: FHub | Article: Understanding...) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            {article.coverImage && !coverImageError ? (
              <div className="h-72 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                <img
                  src={normalizeMediaUrl(article.coverImage)}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={() => setCoverImageError(true)}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="purple" size="md">{article.category}</Badge>
                </div>
              </div>
            ) : (
              <div className="px-6 pt-6 sm:px-8 sm:pt-8 flex gap-2">
                <Badge variant="purple" size="md">{article.category}</Badge>
              </div>
            )}

            <CardBody className="p-6 sm:p-8 space-y-6">
              {/* Header Metadata */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> {article.readTimeMinutes}  {t("phút đọc")}</span>
                  {article.isSeries && (
                    <Badge variant="warning" size="sm" icon={<Layers className="w-3 h-3" />}>
                      {t("Series:")} {article.seriesName}
                    </Badge>
                  )}
                  <span>• {formatDisplayDate(article.createdAt)}</span>
                  <span>• {article.viewsCount}  {t("lượt xem")}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                  {article.title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {article.summary}
                </p>

                {/* Author Card Header */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                  <UserHoverCard
                    userId={article.authorUserId}
                    initialData={{
                      fullName: article.author.fullName,
                      avatarUrl: article.author.avatarUrl,
                      campus: article.author.campus,
                    }}
                  >
                    <div className="flex items-center gap-3 group cursor-pointer">
                      <img src={normalizeMediaUrl(article.author.avatarUrl)} alt={article.author.fullName} className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 group-hover:ring-2 group-hover:ring-[#0076D1] transition-all" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-[#0076D1] dark:group-hover:text-blue-400 group-hover:underline transition-colors">{article.author.fullName}</span>
                          <Badge variant="neutral" size="sm">{t(article.author.role)}</Badge>
                          {isUserAlumni(article.author) && (
                            <Badge variant="warning" size="sm" icon={<Award className="w-3 h-3" />}>
                              Alumni
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {article.author.campus ? <span>{article.author.campus}</span> : null}{article.author.major ? <span> • {article.author.major}</span> : null}</div>
                      </div>
                    </div>
                  </UserHoverCard>

                  <div className="flex items-center gap-2">
                    {!isOwnArticle && (
                      <Button
                        size="sm"
                        variant={isFollowingAuthor ? 'secondary' : 'outline'}
                        onClick={handleToggleFollow}
                        disabled={isFollowLoading}
                        leftIcon={isFollowingAuthor ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Plus className="w-3.5 h-3.5" />}
                      >
                        {isFollowingAuthor ? t("Đang theo dõi") : t("Theo dõi")}
                      </Button>
                    )}
                    <div className="inline-flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <button
                        onClick={() => handleVote('UP')}
                        className={`p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                          userVote === 'UP' ? 'text-[#0076D1] font-bold bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title={t('common.upvote', 'Bình chọn tích cực')}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 px-2 min-w-[20px] text-center">
                        {voteScore}
                      </span>
                      <button
                        onClick={() => handleVote('DOWN')}
                        className={`p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                          userVote === 'DOWN' ? 'text-rose-600 font-bold bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title={t('common.downvote', 'Bình chọn tiêu cực')}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <Button
                      variant={isBookmarked ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={toggleBookmark}
                      leftIcon={<Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />}
                    >
                      {isBookmarked ? t("Đã lưu") : t("Lưu")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsShareModalOpen(true)}
                      leftIcon={<Share2 className="w-3.5 h-3.5 text-slate-500" />}
                    >
                      {t("common.share", "Chia sẻ")}
                    </Button>
                    {isArticleOwner && (
                      <>
                        <Button
                          id="btn-edit-article"
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/articles/${article.id}/edit`)}
                          leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
                        >
                          {t('Edit')}
                        </Button>
                        <Button
                          id="btn-delete-article"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDeleteError(null);
                            setShowDeleteArticleModal(true);
                          }}
                          className="text-red-600 hover:bg-red-50"
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          {t('Delete')}
                        </Button>
                      </>
                    )}
                    <ContentActionMenu
                      targetType="ARTICLE"
                      targetId={article.id}
                      targetTitle={article.title}
                      shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                    />
                  </div>
                </div>
              </div>

              {/* Rich Body Content */}
              {article.content && article.content.trim().length > 0 ? (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <MarkdownPreview content={article.content} />
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  <p>{article.summary}</p>
                  <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-xs text-slate-600 dark:text-slate-300">
                    {t('articles.noContentFallback', 'Bài viết đang cập nhật nội dung chi tiết. Sinh viên có thể để lại bình luận hoặc trao đổi trực tiếp với tác giả bên dưới.')}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                {(article.tags || []).map((t: string) => (
                  <span key={t} className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    #{t}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Comments & Discussion Section */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>{t('Conversation & Updates')} ({comments.length})</span>
              </h3>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-3">
                <Textarea
                  placeholder={t("Viết nhận xét, đặt câu hỏi cho tác giả bài viết...")}
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!commentText.trim()}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    {t('Send Reply')}
                  </Button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {comments.map((cmt) => {
                  const isCmtAuthor = Boolean(
                    currentUser && (
                      (cmt.author?.id && (
                        String(currentUser.id) === String(cmt.author.id) ||
                        String(currentUser.id).replace(/\D/g, '') === String(cmt.author.id).replace(/\D/g, '')
                      )) ||
                      (currentUser.fullName && cmt.author?.fullName && currentUser.fullName.trim().toLowerCase() === cmt.author.fullName.trim().toLowerCase())
                    )
                  );
                  return (
                    <div key={cmt.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <img src={cmt.author.avatarUrl} alt={cmt.author.fullName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{cmt.author.fullName}</span>
                            <Badge variant="neutral" size="sm">{cmt.author.campus}</Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">{formatDate(cmt.createdAt)}</span>
                            <ContentActionMenu
                              targetType="OTHER"
                              targetId={cmt.id}
                              targetTitle={t("Bình luận của {p0}", undefined, { p0: cmt.author?.fullName || 'Sinh viên' })}
                              shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/articles/${id}#comment-${cmt.id}`}
                              isOwner={isArticleOwner || isCmtAuthor}
                              canHide={isArticleOwner}
                              isHidden={hiddenCommentIds.has(cmt.id)}
                              onHide={() => toggleHideComment(cmt.id)}
                              hideLabel={t('articles.hideComment', 'Ẩn bình luận')}
                              onDelete={() => setComments(prev => prev.filter(c => c.id !== cmt.id))}
                              deleteLabel={t('articles.deleteComment', 'Xóa bình luận')}
                              canEdit={isCmtAuthor}
                            />
                          </div>
                        </div>
                        {hiddenCommentIds.has(cmt.id) ? (
                          <p className="text-xs text-amber-600 dark:text-amber-400 italic bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded-lg border border-dashed border-amber-200 dark:border-amber-900/60">
                            {t('articles.commentHidden', 'Bình luận này đã bị ẩn bởi chủ bài viết')}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{cmt.content}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar Column (Series, TOC & Author Profile, Figma Frame 7) */}
        <div className="space-y-6 sticky top-20">
          {/* Series Playlist Navigation (when opened from a Series) */}
          <SeriesSidebarCard currentType="ARTICLE" currentId={article.id} variant="sidebar" />

          {/* Table of Contents */}
          <Card>
            <CardHeader className="p-4 pb-2.5">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ListFilter className="w-4 h-4 text-blue-600" />
                <span>{t('Table of Contents')}</span>
              </h4>
            </CardHeader>
            <CardBody className="p-4 pt-0 space-y-1.5 text-xs">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block py-1.5 px-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors font-medium"
                >
                  {item.title}
                </a>
              ))}
            </CardBody>
          </Card>

          {/* Author Profile Card */}
          <Card>
            <CardBody className="p-5 text-center space-y-3">
              <img
                src={normalizeMediaUrl(article.author.avatarUrl)}
                alt={article.author.fullName}
                className="w-16 h-16 rounded-2xl mx-auto object-cover ring-2 ring-blue-500/30"
              />
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{article.author.fullName}</h4>
                <p className="text-xs text-slate-400 font-medium">
                  {t(article.author.role)}{article.author.campus ? ` • ${article.author.campus}` : ""}
                  {isUserAlumni(article.author) ? " • Alumni" : ""}
                </p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {authorStats.bio || article.author.bio || t("Thành viên đóng góp kiến thức và kinh nghiệm cho cộng đồng sinh viên FHub.")}
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-around text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{authorStats.articlesCount}</div>
                  <div className="text-[10px] text-slate-400">{t('Articles')}</div>
                </div>
                <div>
                  <div className="font-bold text-blue-600">{authorStats.karma.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">{t("Karma")}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{authorStats.followersCount.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">{t('Followers')}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ─── 3.6.5 Delete Article Confirmation Modal ──────────────────────────── */}
      {showDeleteArticleModal && article && (
        <div id="modal-delete-article" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("Xóa Bài Viết Kỹ Thuật")}</h3>
                <p className="text-xs text-slate-500">{t("Xác nhận xóa vĩnh viễn")}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("Bạn có chắc chắn muốn xóa bài viết")} <strong>"{article.title}"</strong>{t("? Toàn bộ nội dung, lượt thích và thảo luận sẽ bị xóa vĩnh viễn khỏi nền tảng.")}</p>

            {deleteError && (
              <div role="alert" className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isDeletingArticle}
                onClick={() => setShowDeleteArticleModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                {t("Hủy")}</button>
              <button
                id="btn-confirm-delete-article"
                type="button"
                disabled={isDeletingArticle}
                onClick={async () => {
                  if (isDeletingArticle) return;
                  setIsDeletingArticle(true);
                  setDeleteError(null);
                  try {
                    const numId = Number((id || '').replace(/\D/g, ''));
                    if (numId) {
                      await articleApi.deleteArticle(numId, article.version);
                    }
                    setShowDeleteArticleModal(false);
                    navigate('/articles');
                  } catch (err: any) {
                    console.error('Failed to delete article:', err);
                    setDeleteError(err?.response?.data?.message || err?.message || t('Không thể xóa bài viết. Vui lòng thử lại.'));
                  } finally {
                    setIsDeletingArticle(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {isDeletingArticle ? t("Đang xóa...") : t("Xác nhận xóa")}</button>
            </div>
          </div>
        </div>
      )}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={article?.title || ''}
        url={typeof window !== 'undefined' ? window.location.href : `/articles/${id}`}
        description={article?.summary || ''}
      />
    </div>
  );
};
