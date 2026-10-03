import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Pin,
  Copy,
  Code,
  Bold,
  Italic,
  List,
  Quote,
  Send,
  CornerDownRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockQuestions } from '../../services/mockData';
import { Answer, CommentItem } from '../../types';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Input';

export const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, currentRole } = useAuth();

  const question = mockQuestions.find((q) => q.id === id) || mockQuestions[0];
  const [upvotes, setUpvotes] = useState(question.upvotes);
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(question.userVote || null);
  const [isLocked, setIsLocked] = useState(question.isLocked || false);
  const [isPinned, setIsPinned] = useState(question.isPinned || false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [composerTab, setComposerTab] = useState<'write' | 'preview'>('write');

  const [answers, setAnswers] = useState<Answer[]>([
    {
      id: 'ans-1',
      questionId: question.id,
      author: {
        id: 'usr-3',
        fullName: 'Lê Hoàng Long',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        role: 'Alumni',
        karma: 2890,
        campus: 'FU-HL',
      },
      content: `Để tối ưu DbContext và tránh timeout connection pool trong ASP.NET Core, bạn nên áp dụng các giải pháp sau:

1. **Sử dụng DbContext Pooling**:
Thay vì \`AddDbContext\`, hãy dùng \`AddDbContextPool\` để tái sử dụng các instance đã được khởi tạo, giảm tải GC:
\`\`\`csharp
builder.Services.AddDbContextPool<AppDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions => {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null);
    }),
    poolSize: 128);
\`\`\`

2. **Luôn dùng AsNoTracking() cho các câu truy vấn Read-Only**:
\`\`\`csharp
var users = await _context.Users.AsNoTracking().ToListAsync();
\`\`\`

3. **Đảm bảo không giữ DbContext trong Singleton**:
Kiểm tra xem có service Singleton nào đang inject DbContext hay không để tránh Captive Dependency.`,
      upvotes: 45,
      downvotes: 0,
      userVote: 'UP',
      isBestAnswer: true,
      isModVerified: true,
      comments: [
        {
          id: 'c-1',
          parentId: 'ans-1',
          author: { id: 'usr-1', fullName: 'Nguyễn Văn A' },
          content: 'Em đã thử bật DbContextPool và EnableRetryOnFailure, lỗi timeout đã hết hoàn toàn! Cảm ơn anh Long nhiều ạ.',
          createdAt: 'Hôm qua',
        },
      ],
      createdAt: '2026-03-15T14:20:00Z',
    },
    {
      id: 'ans-2',
      questionId: question.id,
      author: {
        id: 'usr-4',
        fullName: 'Phạm Minh Đức',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        role: 'Community Moderator',
        karma: 1800,
        campus: 'FU-HCM',
      },
      content: `Bổ sung thêm: Nếu dùng Dapper cho các query báo cáo nặng thì tốc độ đọc còn nhanh gấp 3-5 lần so với EF Core thông thường nhé. Bạn có thể kết hợp cả 2: Dapper cho Query (Read), EF Core cho Command (Write) theo mô hình CQRS nhẹ.`,
      upvotes: 12,
      downvotes: 0,
      userVote: null,
      isBestAnswer: false,
      isModVerified: false,
      comments: [],
      createdAt: '2026-03-15T16:00:00Z',
    },
  ]);

  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleVoteQuestion = (type: 'UP' | 'DOWN') => {
    if (userVote === type) {
      setUserVote(null);
      setUpvotes((v) => (type === 'UP' ? v - 1 : v + 1));
    } else {
      setUpvotes((v) => (type === 'UP' ? (userVote === 'DOWN' ? v + 2 : v + 1) : userVote === 'UP' ? v - 2 : v - 1));
      setUserVote(type);
    }
  };

  const handleVoteAnswer = (ansId: string, type: 'UP' | 'DOWN') => {
    setAnswers((prev) =>
      prev.map((a) => {
        if (a.id !== ansId) return a;
        const current = a.userVote;
        if (current === type) {
          return { ...a, userVote: null, upvotes: type === 'UP' ? a.upvotes - 1 : a.upvotes + 1 };
        }
        return {
          ...a,
          userVote: type,
          upvotes: type === 'UP' ? (current === 'DOWN' ? a.upvotes + 2 : a.upvotes + 1) : current === 'UP' ? a.upvotes - 2 : a.upvotes - 1,
        };
      })
    );
  };

  const handleMarkBestAnswer = (ansId: string) => {
    setAnswers((prev) =>
      prev.map((a) => ({
        ...a,
        isBestAnswer: a.id === ansId ? !a.isBestAnswer : false,
      }))
    );
  };

  const handleToggleModVerified = (ansId: string) => {
    setAnswers((prev) =>
      prev.map((a) => (a.id === ansId ? { ...a, isModVerified: !a.isModVerified } : a))
    );
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerContent.trim()) return;

    const newAns: Answer = {
      id: `ans-${Date.now()}`,
      questionId: question.id,
      author: {
        id: currentUser?.id || 'usr-current',
        fullName: currentUser?.fullName || 'Sinh viên FHub',
        avatarUrl: currentUser?.avatarUrl,
        role: currentUser?.role || 'Student',
        karma: currentUser?.karma || 0,
        campus: currentUser?.campus || 'FU-HL',
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
  };

  const handleAddComment = (ansId: string) => {
    const text = commentInputs[ansId];
    if (!text || !text.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      parentId: ansId,
      author: {
        id: currentUser?.id || 'usr-current',
        fullName: currentUser?.fullName || 'Sinh viên FHub',
      },
      content: text,
      createdAt: 'Vừa xong',
    };

    setAnswers((prev) =>
      prev.map((a) => (a.id === ansId ? { ...a, comments: [...a.comments, newComment] } : a))
    );
    setCommentInputs({ ...commentInputs, [ansId]: '' });
  };

  const copySnippet = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
        <Link to="/courses" className="hover:text-blue-600 transition-colors">Course Hub</Link>
        <span>/</span>
        {question.courseCode && (
          <>
            <Link to={`/courses/${question.courseCode}`} className="font-bold text-blue-600 hover:underline">
              {question.courseCode}
            </Link>
            <span>/</span>
          </>
        )}
        <Link to="/discussions" className="hover:text-blue-600 transition-colors">Discussions</Link>
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
              {isPinned && <Badge variant="warning" size="sm">Ghim đầu mục</Badge>}
              {isLocked && <Badge variant="danger" size="sm" icon={<Lock className="w-3 h-3" />}>Đã khóa</Badge>}
              {question.isSolved && (
                <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                  Đã giải quyết
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              {question.title}
            </h1>

            <div className="flex items-center justify-between gap-4 pt-2 border-b border-slate-100 dark:border-slate-800 pb-4 text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                <img
                  src={question.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={question.author.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{question.author.fullName}</span>
                    <Badge variant="neutral" size="sm">{question.author.campus || 'FU-HL'}</Badge>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Đã hỏi: {new Date(question.createdAt).toLocaleDateString('vi-VN')} • Xem: {question.viewsCount} lượt
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isBookmarked ? 'secondary' : 'outline'}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  leftIcon={<Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600' : ''}`} />}
                >
                  {isBookmarked ? 'Đã lưu' : 'Lưu'}
                </Button>
                <Button size="sm" variant="outline" className="p-2">
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Question Content with Formatted Snippet */}
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
            <p>{question.content}</p>

            {/* Code Snippet Box with Copy Button */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 text-slate-100 border border-slate-800 my-3 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-blue-400">C# • ASP.NET Core EF Configuration</span>
                <button
                  onClick={() =>
                    copySnippet(`// Program.cs Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));`)
                  }
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCode ? 'Đã sao chép!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-slate-200">
                <code>{`// Program.cs Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));`}</code>
              </pre>
            </div>
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
                Accepted Best Answer by Author
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Câu trả lời chính xác đã giải quyết được vấn đề • Đã cộng +50 Karma cho tác giả
              </p>
            </div>
          </div>
          <Badge variant="success" size="md">
            +50 Karma
          </Badge>
        </div>
      )}

      {/* Answers Section List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
            {answers.length} Câu trả lời
          </h2>
          <span className="text-xs text-slate-400">Sắp xếp theo: Điểm cao nhất</span>
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
                  <img src={ans.author.avatarUrl} alt={ans.author.fullName} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{ans.author.fullName}</span>
                      <Badge variant="purple" size="sm">{ans.author.role}</Badge>
                      <Badge variant="neutral" size="sm">{ans.author.campus || 'FU-HL'}</Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Karma: {ans.author.karma.toLocaleString()} pts • Trả lời: {new Date(ans.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {ans.isBestAnswer && (
                    <Badge variant="success" size="md" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                      Best Answer
                    </Badge>
                  )}
                  {ans.isModVerified && (
                    <Badge variant="info" size="sm" icon={<Check className="w-3 h-3" />}>
                      Mod Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Answer Content */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                {ans.content}
              </div>

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
                  <Button
                    size="sm"
                    variant={ans.isBestAnswer ? 'secondary' : 'outline'}
                    onClick={() => handleMarkBestAnswer(ans.id)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  >
                    {ans.isBestAnswer ? 'Hủy chọn Best Answer' : 'Chọn làm Best Answer'}
                  </Button>
                </div>
              </div>

              {/* Comment Thread under Answer */}
              {ans.comments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  {ans.comments.map((cmt) => (
                    <div key={cmt.id} className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <CornerDownRight className="w-3 h-3 text-slate-400" />
                        <span>{cmt.author.fullName}:</span>
                        <span className="font-normal text-slate-600 dark:text-slate-300">{cmt.content}</span>
                        <span className="text-[10px] text-slate-400 ml-auto">{cmt.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Add Comment Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Viết phản hồi ngắn cho câu trả lời này..."
                  value={commentInputs[ans.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [ans.id]: e.target.value })}
                  className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <Button size="sm" variant="secondary" onClick={() => handleAddComment(ans.id)}>
                  Gửi
                </Button>
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
              Câu trả lời của bạn
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setComposerTab('write')}
                className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer ${
                  composerTab === 'write' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Soạn thảo
              </button>
              <button
                onClick={() => setComposerTab('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer ${
                  composerTab === 'preview' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Xem trước
              </button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-5 space-y-4">
          {composerTab === 'write' ? (
            <div className="space-y-2">
              {/* Markdown Helper Toolbar */}
              <div className="flex items-center gap-1 pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                <button
                  type="button"
                  onClick={() => setNewAnswerContent((c) => `${c}\n\`\`\`csharp\n// your code here\n\`\`\`\n`)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-mono flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                  title="Thêm Code Block"
                >
                  <Code className="w-3.5 h-3.5" /> <span>Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewAnswerContent((c) => `${c} **in đậm** `)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs hover:text-blue-600 cursor-pointer"
                  title="In đậm"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNewAnswerContent((c) => `${c} *in nghiêng* `)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs hover:text-blue-600 cursor-pointer"
                  title="In nghiêng"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNewAnswerContent((c) => `${c}\n- Item 1\n- Item 2\n`)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs hover:text-blue-600 cursor-pointer"
                  title="Danh sách"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNewAnswerContent((c) => `${c}\n> Trích dẫn\n`)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs hover:text-blue-600 cursor-pointer"
                  title="Trích dẫn"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>

              <Textarea
                placeholder="Nhập nội dung giải đáp chi tiết, hướng dẫn từng bước và kèm code snippet mẫu..."
                rows={6}
                value={newAnswerContent}
                onChange={(e) => setNewAnswerContent(e.target.value)}
              />
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl min-h-[160px] text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {newAnswerContent || 'Chưa có nội dung để xem trước.'}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-400">
              💡 Hỗ trợ Markdown: dùng <code>```csharp</code> để highlight code.
            </p>
            <Button
              variant="primary"
              onClick={handleSubmitAnswer}
              disabled={!newAnswerContent.trim()}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="shadow-xs"
            >
              Gửi câu trả lời (+15 Karma)
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
