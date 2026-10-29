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
  const { t } = useLanguage();
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
          const category = resolveCategoryFromTags(data.semanticTagIds, tagMap) || (tags.length > 0 ? tags[0] : 'Bài viết học thuật');
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
              fullName: data.authorStaffId ? 'FPT Faculty Staff' : `Author #${data.authorUserId || 1}`,
              role: data.authorStaffId ? 'Staff' : 'Student',
              campus: 'FU',
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
        <p className="text-xs text-slate-500">Bài viết này không tồn tại hoặc đã bị gỡ bỏ.</p>
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
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài viết
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Article Content Column (Figma Frame 7: FHub | Article: Understanding...) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            {article.coverImage && (
              <div className="h-72 w-full bg-slate-100 overflow-hidden relative">
                <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
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
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> {article.readTimeMinutes} phút đọc
                  </span>
                  {article.isSeries && (
                    <Badge variant="warning" size="sm" icon={<Layers className="w-3 h-3" />}>
                      Series: {article.seriesName}
                    </Badge>
                  )}
                  <span>• {new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
                  <span>• {article.viewsCount} lượt xem</span>
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
                        <Badge variant="neutral" size="sm">{article.author.role}</Badge>
                      </div>
                      <div className="text-xs text-slate-400">
                        {article.author.campus || 'FU-HL'} • Kỹ thuật phần mềm (SE)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isFollowingAuthor ? 'secondary' : 'outline'}
                      onClick={() => setIsFollowingAuthor(!isFollowingAuthor)}
                      leftIcon={isFollowingAuthor ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    >
                      {isFollowingAuthor ? 'Đang theo dõi' : 'Theo dõi'}
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
                      {isBookmarked ? 'Đã lưu' : 'Lưu'}
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

              {/* Rich Body Content (Figma Frame 7) */}
              <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {/* Section 1 */}
                <section id="intro" className="space-y-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">1. Introduction</h2>
                  <p>
                    Trong quá trình xây dựng các ứng dụng lớn với ASP.NET Core, việc quản lý vòng đời của các object (Dependencies) là yếu tố quyết định đến tính mở rộng (Scalability), khả năng viết Unit Test và hiệu năng tổng thể của ứng dụng.
                  </p>
                </section>

                {/* Section 2 */}
                <section id="what-is-di" className="space-y-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">2. What is Dependency Injection?</h2>
                  <p>
                    Dependency Injection (DI) là một kỹ thuật triển khai nguyên lý <em>Inversion of Control (IoC)</em>, giúp tách rời sự phụ thuộc giữa các class. Thay vì class tự khởi tạo đối tượng phụ thuộc bằng từ khóa <code>new</code>, IoC Container của .NET sẽ tự động inject qua Constructor.
                  </p>
                </section>

                {/* Section 3 */}
                <section id="registering-services" className="space-y-3">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">3. Registering Services (Lifecycles)</h2>
                  <p>
                    ASP.NET Core cung cấp 3 loại Service Lifecycles chính:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 space-y-1">
                      <h4 className="font-bold text-xs text-blue-900 dark:text-blue-200">Transient</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Được tạo mới mỗi khi có request inject. Thích hợp cho service nhẹ, stateless.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-900/60 space-y-1">
                      <h4 className="font-bold text-xs text-purple-900 dark:text-purple-200">Scoped</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Được tạo 1 lần cho mỗi HTTP Request. Chuẩn cho DbContext và Unit of Work.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60 space-y-1">
                      <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">Singleton</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Chỉ 1 instance duy nhất được tạo cho toàn bộ vòng đời ứng dụng. Dùng cho Cache.</p>
                    </div>
                  </div>

                  {/* Code snippet block */}
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 text-slate-100 border border-slate-800 my-4 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400">
                      <span className="font-semibold text-blue-400">Program.cs • Service Registration</span>
                      <button
                        onClick={() =>
                          copySnippet(`var builder = WebApplication.CreateBuilder(args);

// Register Services with different lifecycles
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddSingleton<IMemoryCacheProvider, MemoryCacheProvider>();`)
                        }
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedCode ? t('Copied') : t('Copy Link')}</span>
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-slate-200">
                      <code>{`var builder = WebApplication.CreateBuilder(args);

// Register Services with different lifecycles
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddSingleton<IMemoryCacheProvider, MemoryCacheProvider>();`}</code>
                    </pre>
                  </div>
                </section>

                {/* Section 4 */}
                <section id="injecting-dependencies" className="space-y-3">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">4. Injecting Dependencies</h2>
                  <p>
                    Inject interface vào Controller hoặc Service thông qua Constructor:
                  </p>
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 text-slate-100 border border-slate-800 my-4 font-mono text-xs">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400">
                      <span className="font-semibold text-purple-400">UsersController.cs</span>
                    </div>
                    <pre className="p-4 overflow-x-auto text-slate-200">
                      <code>{`public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;

    public UsersController(IUserRepository userRepository, IEmailService emailService)
    {
        _userRepository = userRepository;
        _emailService = emailService;
    }
}`}</code>
                    </pre>
                  </div>
                </section>

                {/* Section 5: Anti-Patterns */}
                <section id="anti-patterns" className="space-y-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">5. Common Anti-Patterns</h2>
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 space-y-1">
                    <h5 className="font-bold text-xs">⚠️ Captive Dependency Alert:</h5>
                    <p className="text-xs text-amber-900 dark:text-amber-300">
                      Tuyệt đối không inject một <code>Scoped</code> service (như DbContext) vào một <code>Singleton</code> service. Điều này sẽ khiến DbContext bị giữ sống mãi mãi và gây lỗi đa luồng nghiêm trọng!
                    </p>
                  </div>
                </section>
              </div>

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
                  placeholder="Viết nhận xét, đặt câu hỏi cho tác giả bài viết..."
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
                          <span className="text-[10px] text-slate-400">{cmt.createdAt}</span>
                          <ContentActionMenu
                            targetType="OTHER"
                            targetId={cmt.id}
                            targetTitle={`Bình luận của ${cmt.author?.fullName || 'Sinh viên'}`}
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
                <p className="text-xs text-slate-400 font-medium">{article.author.role} • {article.author.campus || 'FU-HL'}</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đam mê xây dựng hệ thống backend hiệu năng cao và chia sẻ kiến trúc phần mềm cho cộng đồng sinh viên FPT.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-around text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">8</div>
                  <div className="text-[10px] text-slate-400">{t('Articles')}</div>
                </div>
                <div>
                  <div className="font-bold text-blue-600">2,890</div>
                  <div className="text-[10px] text-slate-400">Karma</div>
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
    </div>
  );
};
