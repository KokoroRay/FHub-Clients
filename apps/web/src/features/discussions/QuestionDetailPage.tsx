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
      },
      content: 'Bổ sung thêm: Nếu dùng Dapper cho các query nặng thì tốc độ đọc còn nhanh gấp 3-5 lần so với EF Core thông thường nhé.',
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
        id: currentUser?.id || 'usr-me',
        fullName: currentUser?.fullName || 'Sinh viên FHub',
        avatarUrl: currentUser?.avatarUrl,
        role: currentUser?.role || 'Student',
        karma: currentUser?.karma || 0,
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
    if (!text?.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      parentId: ansId,
      author: {
        id: currentUser?.id || 'me',
        fullName: currentUser?.fullName || 'Bạn',
      },
      content: text,
      createdAt: 'Vừa xong',
    };

    setAnswers((prev) =>
      prev.map((a) => (a.id === ansId ? { ...a, comments: [...a.comments, newComment] } : a))
    );
    setCommentInputs({ ...commentInputs, [ansId]: '' });
  };

  const isModeratorOrAdmin =
    currentRole === 'Community Moderator' || currentRole === 'Admin' || currentRole === 'Staff';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/discussions" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#005da7] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách câu hỏi
      </Link>

      {/* Moderator Action Bar if Mod/Admin */}
      {isModeratorOrAdmin && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span className="font-bold text-xs text-purple-900 dark:text-purple-200">
              Bảng điều khiển Moderator cho câu hỏi này
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPinned(!isPinned)}
              leftIcon={<Pin className="w-3.5 h-3.5" />}
            >
              {isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLocked(!isLocked)}
              leftIcon={<Lock className="w-3.5 h-3.5" />}
            >
              {isLocked ? 'Mở khóa thảo luận' : 'Khóa thảo luận'}
            </Button>
          </div>
        </div>
      )}

      {/* Question Main Card (Figma 23:3111) */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardBody className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {question.courseCode && (
                  <Link to={`/courses/${question.courseCode}`}>
                    <Badge variant="primary" size="md">{question.courseCode}</Badge>
                  </Link>
                )}
                {isPinned && <Badge variant="warning" size="sm">Đã ghim</Badge>}
                {isLocked && <Badge variant="danger" size="sm" icon={<Lock className="w-3 h-3" />}>Đã khóa</Badge>}
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-snug">
                {question.title}
              </h1>
            </div>

            {/* Upvote Box */}
            <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleVoteQuestion('UP')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  userVote === 'UP' ? 'bg-[#005da7] text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-sm my-1 text-slate-800 dark:text-slate-200">{upvotes}</span>
              <button
                onClick={() => handleVoteQuestion('DOWN')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  userVote === 'DOWN' ? 'bg-rose-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Author info */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <img
                src={question.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={question.author.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{question.author.fullName}</span>
                <span className="text-[10px] text-slate-400 block">{question.author.karma} Karma points</span>
              </div>
            </div>
            <span className="text-slate-400">Đăng ngày: 15/03/2026</span>
          </div>

          {/* Full content */}
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 whitespace-pre-line bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl">
            {question.content}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {question.tags.map((tag) => (
              <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                #{tag}
              </span>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Answers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#005da7]" />
            <span>{answers.length} Câu trả lời</span>
          </h2>
        </div>

        {answers.map((ans) => (
          <Card
            key={ans.id}
            className={`${
              ans.isBestAnswer
                ? 'border-emerald-500 dark:border-emerald-600 ring-2 ring-emerald-400/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <CardBody className="p-6 space-y-4">
              {/* Answer Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={ans.author.avatarUrl} alt={ans.author.fullName} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{ans.author.fullName}</span>
                      <Badge variant="purple" size="sm">{ans.author.role}</Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{ans.author.karma} Karma</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {ans.isBestAnswer && (
                    <Badge variant="success" size="md" icon={<Check className="w-3.5 h-3.5" />}>
                      Best Answer (Đã chấp nhận)
                    </Badge>
                  )}
                  {ans.isModVerified && (
                    <Badge variant="purple" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                      Mod Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Answer Content */}
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
                {ans.content}
              </div>

              {/* Answer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVoteAnswer(ans.id, 'UP')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      ans.userVote === 'UP' ? 'bg-[#005da7] text-white border-[#005da7]' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> {ans.upvotes}
                  </button>

                  <button
                    onClick={() => handleMarkBestAnswer(ans.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      ans.isBestAnswer ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-slate-200 hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    {ans.isBestAnswer ? '✓ Bỏ chọn Best Answer' : 'Đánh dấu Best Answer'}
                  </button>

                  {isModeratorOrAdmin && (
                    <button
                      onClick={() => handleToggleModVerified(ans.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        ans.isModVerified ? 'border-purple-500 text-purple-700 bg-purple-50' : 'border-slate-200 hover:bg-slate-100 text-purple-600'
                      }`}
                    >
                      {ans.isModVerified ? '✓ Bỏ Mod Verified' : 'Gắn Mod Verified'}
                    </button>
                  )}
                </div>
              </div>

              {/* Comments list under answer */}
              {ans.comments.length > 0 && (
                <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-2 pt-1">
                  {ans.comments.map((cm) => (
                    <div key={cm.id} className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
                      <span className="font-bold text-slate-800 dark:text-slate-200 mr-1.5">{cm.author.fullName}:</span>
                      <span>{cm.content}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment mini-input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Viết phản hồi ngắn hoặc câu hỏi phụ..."
                  value={commentInputs[ans.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [ans.id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(ans.id)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#005da7]"
                />
                <Button variant="outline" size="sm" onClick={() => handleAddComment(ans.id)}>
                  Gửi
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Answer Editor Box */}
      {!isLocked ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Đóng góp câu trả lời của bạn
            </h3>
          </CardHeader>
          <CardBody className="p-5">
            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <Textarea
                placeholder="Nhập chi tiết lời giải, code snippet và giải thích cặn kẽ..."
                rows={6}
                value={newAnswerContent}
                onChange={(e) => setNewAnswerContent(e.target.value)}
                required
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Câu trả lời hữu ích sẽ nhận được điểm Karma và ghi nhận vào bảng thành tích.
                </span>
                <Button variant="primary" type="submit">
                  Đăng câu trả lời
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : (
        <div className="p-4 bg-slate-100 dark:bg-slate-800 text-center rounded-xl text-xs text-slate-500 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" /> Thảo luận này đã bị khóa bởi Moderator.
        </div>
      )}
    </div>
  );
};
