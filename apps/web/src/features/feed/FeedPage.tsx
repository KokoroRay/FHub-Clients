import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Eye,
  CheckCircle2,
  FileText,
  Workflow,
  Sparkles,
  Share2,
  Bookmark,
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

  const campusObj = mockCampuses.find((c) => c.code === currentCampus) || mockCampuses[0];

  const feedTabs = [
    { id: 'all', label: 'Tất cả bài viết', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'questions', label: 'Hỏi đáp Q&A', count: mockQuestions.length, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'articles', label: 'Tech Articles', count: mockArticles.length, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'workflows', label: 'Workflows', count: mockWorkflows.length, icon: <Workflow className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      {/* Banner / Glocal Feed Bar */}
      <div className="bg-linear-to-r from-[#005da7] via-[#0076d1] to-[#6f507e] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full tracking-wide">
              GLOCAL NETWORK
            </span>
            <span className="text-xs text-sky-100">
              {isGlocalLocalOnly ? `Campus ${campusObj.code}` : 'Toàn bộ 5 Cơ sở FPTU'}
            </span>
          </div>
          <h2 className="text-xl font-black">
            Chào mừng đến với FHub Community!
          </h2>
          <p className="text-xs text-sky-100/90 max-w-xl">
            Nền tảng chia sẻ học thuật, giải đáp bài tập, source code mẫu và cẩm nang môn học dành cho sinh viên FPT.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl backdrop-blur-xs">
          <button
            onClick={() => setIsGlocalLocalOnly(false)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isGlocalLocalOnly ? 'bg-white text-[#005da7] shadow-xs' : 'text-white hover:bg-white/10'
            }`}
          >
            Global Feed
          </button>
          <button
            onClick={() => setIsGlocalLocalOnly(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isGlocalLocalOnly ? 'bg-white text-[#005da7] shadow-xs' : 'text-white hover:bg-white/10'
            }`}
          >
            {campusObj.code} Campus
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
        <Tabs tabs={feedTabs} activeTab={activeTab} onChange={(t) => setActiveTab(t as any)} />
      </div>

      {/* Feed Stream */}
      <div className="space-y-4">
        {/* Render Questions */}
        {(activeTab === 'all' || activeTab === 'questions') &&
          mockQuestions.map((q) => (
            <Card key={q.id} hoverable className="transition-all">
              <CardBody className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={q.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={q.author.fullName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {q.author.fullName}
                    </span>
                    {q.author.isAnonymous && (
                      <Badge variant="neutral" size="sm">
                        Ẩn danh
                      </Badge>
                    )}
                    {q.courseCode && (
                      <Badge variant="primary" size="sm">
                        {q.courseCode}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    {q.isPinned && (
                      <Badge variant="warning" size="sm">
                        Ghim
                      </Badge>
                    )}
                    {q.isModVerified && (
                      <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                        Mod Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Link
                    to={`/discussions/${q.id}`}
                    className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-[#005da7] dark:hover:text-[#38bdf8] transition-colors leading-snug line-clamp-2"
                  >
                    {q.title}
                  </Link>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {q.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {q.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 hover:text-[#005da7] transition-colors cursor-pointer">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{q.upvotes}</span>
                    </button>
                    <Link to={`/discussions/${q.id}`} className="flex items-center gap-1.5 hover:text-[#005da7] transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{q.answersCount} câu trả lời</span>
                    </Link>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{q.viewsCount} xem</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer" title="Lưu bài viết">
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

        {/* Render Tech Articles */}
        {(activeTab === 'all' || activeTab === 'articles') &&
          mockArticles.map((art) => (
            <Card key={art.id} hoverable className="transition-all overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {art.coverImage && (
                  <div className="sm:w-48 h-36 sm:h-auto shrink-0 bg-slate-100 overflow-hidden">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="sm">
                      {art.category}
                    </Badge>
                    <span className="text-[11px] text-slate-400">• {art.readTimeMinutes} phút đọc</span>
                    {art.isSeries && (
                      <span className="text-[11px] text-amber-600 font-semibold">• Series: {art.seriesName}</span>
                    )}
                  </div>
                  <Link
                    to={`/articles/${art.id}`}
                    className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-[#005da7] transition-colors line-clamp-2"
                  >
                    {art.title}
                  </Link>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <img src={art.author.avatarUrl} alt={art.author.fullName} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{art.author.fullName}</span>
                      <Badge variant="neutral" size="sm">{art.author.role}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{art.viewsCount.toLocaleString()} lượt đọc</span>
                      <span>❤️ {art.likesCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

        {/* Render Workflows */}
        {(activeTab === 'all' || activeTab === 'workflows') &&
          mockWorkflows.map((wf) => (
            <Card key={wf.id} hoverable>
              <CardBody className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {wf.courseCode}
                    </Badge>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                      {wf.technology}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {wf.steps.length} bước thực hiện
                  </span>
                </div>
                <Link
                  to={`/workflows/${wf.id}`}
                  className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-[#005da7] transition-colors block"
                >
                  {wf.title}
                </Link>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {wf.description}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <img src={wf.author.avatarUrl} alt={wf.author.fullName} className="w-5 h-5 rounded-full object-cover" />
                    <span>{wf.author.fullName}</span>
                  </div>
                  <div className="flex items-center gap-3 font-medium">
                    <span>{wf.usageCount} lượt áp dụng</span>
                    <span>{wf.viewsCount} xem</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
      </div>
    </div>
  );
};
