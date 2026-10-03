import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye,
  CheckCircle2,
  FileText,
  Workflow,
  Sparkles,
  Share2,
  Bookmark,
  Plus,
  BookOpen,
  Award,
  ArrowRight,
  Code,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockQuestions, mockArticles, mockWorkflows, mockCourses, mockCampuses } from '../../services/mockData';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';

export const FeedPage: React.FC = () => {
  const { currentCampus, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'questions' | 'articles' | 'workflows'>('all');
  const [isGlocalLocalOnly, setIsGlocalLocalOnly] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const campusObj = mockCampuses.find((c) => c.code === currentCampus) || mockCampuses[0];

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const feedTabs = [
    { id: 'all', label: 'Tất cả bài viết', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'questions', label: 'Hỏi đáp Q&A', count: mockQuestions.length, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'articles', label: 'Tech Articles', count: mockArticles.length, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'workflows', label: 'Workflows', count: mockWorkflows.length, icon: <Workflow className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Greeting & Glocal Switcher Banner (Figma Frame: Html -> Body) */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 bg-white/20 text-white rounded-full tracking-wide backdrop-blur-xs">
              GLOCAL NETWORK
            </span>
            <span className="text-xs text-blue-100 font-medium">
              {isGlocalLocalOnly ? `Cơ sở ${campusObj.name} (${campusObj.code})` : 'Toàn bộ 5 Cơ sở Đại học FPT'}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Welcome back to FHub 👋
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
            Mạng xã hội học thuật, kho lưu trữ tri thức môn học & quy trình phát triển đồ án dành cho sinh viên FPT.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-xl backdrop-blur-md shrink-0 border border-white/10">
          <button
            onClick={() => setIsGlocalLocalOnly(false)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isGlocalLocalOnly ? 'bg-white text-blue-700 shadow-xs' : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Global Feed
          </button>
          <button
            onClick={() => setIsGlocalLocalOnly(true)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isGlocalLocalOnly ? 'bg-white text-blue-700 shadow-xs' : 'text-white/90 hover:bg-white/10'
            }`}
          >
            {campusObj.code} Campus
          </button>
        </div>
      </div>

      {/* 2. 4 Quick Stat Metric Cards (Figma Frame 1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 leading-none">12</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Môn học theo dõi</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 leading-none">34</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Thảo luận tham gia</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 leading-none">8</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Bài viết xuất bản</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 leading-none">
              {currentUser?.karma?.toLocaleString() || '1,250'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Karma Points</div>
          </div>
        </div>
      </div>

      {/* 3. Two Callout Action Cards (Side-by-side, Figma Frame 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Action Card 1: Share Workflow */}
        <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent dark:from-purple-950/30 dark:to-transparent border border-purple-200/70 dark:border-purple-900/60 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs">
              <Code className="w-4 h-4" />
              <span>Chia sẻ Workflow đồ án</span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              Template kiến trúc & Môi trường
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
              Đăng tải quy trình setup đồ án SWP/PRN giúp khóa dưới tiết kiệm hàng giờ debug.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/workflows?action=create')}
            className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 shadow-xs"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Tạo Workflow
          </Button>
        </div>

        {/* Action Card 2: Write Tech Article */}
        <div className="bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-transparent dark:from-blue-950/30 dark:to-transparent border border-blue-200/70 dark:border-blue-900/60 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold text-xs">
              <FileText className="w-4 h-4" />
              <span>Viết bài Tech Article</span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              Chia sẻ kiến thức chuyên sâu
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
              Viết bài hướng dẫn lập trình, mẹo thi PE/FE và nhận Karma điểm thưởng.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/articles/create')}
            className="shrink-0 shadow-xs"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Viết bài ngay
          </Button>
        </div>
      </div>

      {/* 4. Tabs Filter */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
        <Tabs tabs={feedTabs} activeTab={activeTab} onChange={(t) => setActiveTab(t as any)} />
      </div>

      {/* 5. Feed Stream */}
      <div className="space-y-4">
        {/* Render Questions Stream */}
        {(activeTab === 'all' || activeTab === 'questions') &&
          mockQuestions.map((q) => {
            const isBookmarked = bookmarkedIds.has(q.id);
            const isLiked = likedIds.has(q.id);
            return (
              <Card key={q.id} hoverable className="transition-all">
                <CardBody className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={q.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={q.author.fullName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {q.author.fullName}
                          </span>
                          {q.author.isAnonymous && (
                            <Badge variant="neutral" size="sm">
                              Ẩn danh
                            </Badge>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {new Date(q.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {q.courseCode && (
                            <Link to={`/courses/${q.courseCode}`}>
                              <Badge variant="primary" size="sm">
                                {q.courseCode}
                              </Badge>
                            </Link>
                          )}
                          <Badge variant="neutral" size="sm">
                            {q.author.campus || 'FU-HL'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {q.isPinned && (
                        <Badge variant="warning" size="sm">
                          Ghim
                        </Badge>
                      )}
                      {q.isSolved && (
                        <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                          Đã có Best Answer
                        </Badge>
                      )}
                      {q.isModVerified && (
                        <Badge variant="primary" size="sm" icon={<Check className="w-3 h-3" />}>
                          Mod Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Link
                      to={`/discussions/${q.id}`}
                      className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug line-clamp-2"
                    >
                      {q.title}
                    </Link>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {q.content}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {q.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/discussions?tag=${tag}`}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(q.id)}
                        className={`flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                          isLiked ? 'text-blue-600' : 'hover:text-blue-600'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{q.upvotes + (isLiked ? 1 : 0)}</span>
                      </button>
                      <Link
                        to={`/discussions/${q.id}`}
                        className="flex items-center gap-1.5 font-semibold hover:text-blue-600 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{q.answersCount} câu trả lời</span>
                      </Link>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{q.viewsCount} xem</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                          isBookmarked ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="Lưu câu hỏi"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                      </button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}

        {/* Render Tech Articles Stream */}
        {(activeTab === 'all' || activeTab === 'articles') &&
          mockArticles.map((art) => {
            const isBookmarked = bookmarkedIds.has(art.id);
            const isLiked = likedIds.has(art.id);
            return (
              <Card key={art.id} hoverable className="transition-all overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {art.coverImage && (
                    <div className="sm:w-52 h-40 sm:h-auto shrink-0 bg-slate-100 overflow-hidden relative">
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <Badge variant="purple" size="sm">
                          {art.category}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div className="p-5 flex-1 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                        <span>• {art.readTimeMinutes} phút đọc</span>
                        {art.isSeries && (
                          <span className="text-amber-600 font-bold">• Series: {art.seriesName}</span>
                        )}
                      </div>
                      <Link
                        to={`/articles/${art.id}`}
                        className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
                      >
                        {art.title}
                      </Link>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
                        {art.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <img src={art.author.avatarUrl} alt={art.author.fullName} className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{art.author.fullName}</span>
                        <Badge variant="neutral" size="sm">{art.author.role}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleLike(art.id)}
                          className={`flex items-center gap-1 font-semibold cursor-pointer ${
                            isLiked ? 'text-rose-600' : 'hover:text-rose-600'
                          }`}
                        >
                          <span>❤️ {art.likesCount + (isLiked ? 1 : 0)}</span>
                        </button>
                        <span>{art.viewsCount.toLocaleString()} đọc</span>
                        <button
                          onClick={() => toggleBookmark(art.id)}
                          className={`p-1 hover:text-blue-600 cursor-pointer ${
                            isBookmarked ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

        {/* Render Workflows Stream */}
        {(activeTab === 'all' || activeTab === 'workflows') &&
          mockWorkflows.map((wf) => (
            <Card key={wf.id} hoverable>
              <CardBody className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {wf.courseCode}
                    </Badge>
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 rounded-lg border border-purple-200/60 dark:border-purple-800">
                      {wf.technology}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {wf.steps.length} bước thực hiện
                  </span>
                </div>
                <Link
                  to={`/workflows/${wf.id}`}
                  className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors block leading-snug"
                >
                  {wf.title}
                </Link>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {wf.description}
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <img src={wf.author.avatarUrl} alt={wf.author.fullName} className="w-6 h-6 rounded-full object-cover" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{wf.author.fullName}</span>
                  </div>
                  <div className="flex items-center gap-3 font-semibold">
                    <span className="text-blue-600">{wf.usageCount} áp dụng</span>
                    <span className="text-slate-400">{wf.viewsCount} xem</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
      </div>
    </div>
  );
};
