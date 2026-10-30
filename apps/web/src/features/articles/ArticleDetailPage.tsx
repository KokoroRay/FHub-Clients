import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Heart,
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
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { useLanguage } from '../../context/LanguageContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Input';
import { MarkdownPreview } from '../../components/common/MarkdownPreview';
import { articleApi } from '../../services/api/contentApi';
import { voteApi, bookmarkApi } from '../../services/api/studentApi';
import { normalizeMediaUrl } from '../../utils/mediaUtils';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';
import {
  loadAllSemanticTags,
  getSemanticTagMap,
  resolveTagNames,
  resolveCategoryFromTags,
} from '../../utils/tagUtils';

export const ArticleDetailPage: React.FC = () => {
  const { formatDate, locale, t } = useLanguage();
  const { id } = useParams<{ id: string }>();
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
            title: data.title,
            summary: data.summary || '',
            content: data.content || '',
            coverImage: data.coverImageUrl || '',
            createdAt: data.createdAt,
            readTimeMinutes: 4,
            viewsCount: 0,
            likesCount: 0,
            category,
            tags,
            author: {
              fullName: data.authorStaffId ? 'FPT Faculty Staff' : 'Nguyen Minh Tam (CE181522)',
              role: data.authorStaffId ? 'Staff' : 'Student',
              campus: 'FPT University - Can Tho',
              avatarUrl: '',
            },
          });
          setLikesCount(0);

          const numId = Number(id.replace(/\D/g, ''));
          if (numId) {
            try {
              const stats = await voteApi.getStats('ARTICLE', numId);
              if (isMounted) {
                setLikesCount(stats.score);
                setIsLiked(stats.myVoteValue === 1);
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

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<number | string | null>(null);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showEditArticleModal, setShowEditArticleModal] = useState(false);
  const [showDeleteArticleModal, setShowDeleteArticleModal] = useState(false);
  const [editArticleTitle, setEditArticleTitle] = useState('');
  const [editArticleSummary, setEditArticleSummary] = useState('');
  const [editArticleContent, setEditArticleContent] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  const toggleLike = async () => {
    if (!id) return;
    const numId = Number(id.replace(/\D/g, ''));
    if (!numId) return;

    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      await voteApi.vote({
        target_type: 'ARTICLE',
        target_id: numId,
        vote_value: prevLiked ? -1 : 1,
      });
      const stats = await voteApi.getStats('ARTICLE', numId);
      setLikesCount(stats.score);
      setIsLiked(stats.myVoteValue === 1);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
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
    setComments([
      ...comments,
      {
        id: `cmt-${Date.now()}`,
        author: { fullName: 'Bạn (Sinh viên FHub)', avatarUrl: '', campus: 'FU' },
        content: commentText,
        createdAt: 'Vừa xong',
      },
    ]);
    setCommentText('');
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
            {article.coverImage && (
              <div className="h-72 w-full bg-slate-100 overflow-hidden relative">
                <img src={normalizeMediaUrl(article.coverImage)} alt={article.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="purple" size="md">{article.category}</Badge>
                </div>
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
                  <span>• {new Date(article.createdAt).toLocaleDateString(locale)}</span>
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
                  <div className="flex items-center gap-3">
                    <img src={normalizeMediaUrl(article.author.avatarUrl)} alt={article.author.fullName} className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{article.author.fullName}</span>
                        <Badge variant="neutral" size="sm">{t(article.author.role)}</Badge>
                      </div>
                      <div className="text-xs text-slate-400">
                        {article.author.campus || 'FU-HL'}  {t("• Kỹ thuật phần mềm (SE)")}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isFollowingAuthor ? 'secondary' : 'outline'}
                      onClick={() => setIsFollowingAuthor(!isFollowingAuthor)}
                      leftIcon={isFollowingAuthor ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    >
                      {isFollowingAuthor ? t("Đang theo dõi") : t("Theo dõi")}
                    </Button>
                    <Button
                      variant={isLiked ? 'primary' : 'outline'}
                      size="sm"
                      onClick={toggleLike}
                      leftIcon={<Heart className={`w-4 h-4 ${isLiked ? 'fill-white text-white' : 'text-rose-500'}`} />}
                    >
                      {likesCount}
                    </Button>
                    <Button
                      variant={isBookmarked ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={toggleBookmark}
                      leftIcon={<Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />}
                    >
                      {isBookmarked ? t("Đã lưu") : t("Lưu")}
                    </Button>
                    <Button
                      id="btn-edit-article"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditArticleTitle(article.title);
                        setEditArticleSummary(article.summary);
                        setEditArticleContent(article.content);
                        setShowEditArticleModal(true);
                      }}
                      leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
                    >
                      {t('Edit')}
                    </Button>
                    <Button
                      id="btn-delete-article"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteArticleModal(true)}
                      className="text-red-600 hover:bg-red-50"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      {t('Delete')}
                    </Button>
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
                {comments.map((cmt) => (
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
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{cmt.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar Column (TOC & Author Profile, Figma Frame 7) */}
        <div className="space-y-6 sticky top-20">
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
                <p className="text-xs text-slate-400 font-medium">{t(article.author.role)} • {article.author.campus || 'FU-HL'}</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("Đam mê xây dựng hệ thống backend hiệu năng cao và chia sẻ kiến trúc phần mềm cho cộng đồng sinh viên FPT.")}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-around text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">8</div>
                  <div className="text-[10px] text-slate-400">{t('Articles')}</div>
                </div>
                <div>
                  <div className="font-bold text-blue-600">2,890</div>
                  <div className="text-[10px] text-slate-400">{t("Karma")}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">450</div>
                  <div className="text-[10px] text-slate-400">{t('Followers')}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ─── 3.6.4 Edit Article Modal ────────────────────────────────────────── */}
      {showEditArticleModal && article && (
        <div id="modal-edit-article" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0076D1]" />
                <span>{t("Chỉnh Sửa Bài Viết Kỹ Thuật")}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditArticleModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("Tiêu đề bài viết")}</label>
                <input
                  type="text"
                  value={editArticleTitle}
                  onChange={(e) => setEditArticleTitle(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("Tóm tắt ngắn (Summary)")}</label>
                <textarea
                  rows={2}
                  value={editArticleSummary}
                  onChange={(e) => setEditArticleSummary(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{t("Nội dung bài viết (Markdown)")}</label>
                <textarea
                  rows={6}
                  value={editArticleContent}
                  onChange={(e) => setEditArticleContent(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditArticleModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}</button>
              <button
                id="btn-save-edit-article"
                type="button"
                onClick={() => {
                  setArticle({
                    ...article,
                    title: editArticleTitle,
                    summary: editArticleSummary,
                    content: editArticleContent,
                  });
                  setShowEditArticleModal(false);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Lưu thay đổi")}</button>
            </div>
          </div>
        </div>
      )}

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

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteArticleModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}</button>
              <button
                id="btn-confirm-delete-article"
                type="button"
                onClick={() => {
                  setShowDeleteArticleModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Xác nhận xóa")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
