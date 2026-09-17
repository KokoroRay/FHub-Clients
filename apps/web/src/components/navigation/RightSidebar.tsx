import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Tag,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCourses, mockCampuses } from '../../services/mockData';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';

export const RightSidebar: React.FC = () => {
  const { currentCampus } = useAuth();
  const campusObj = mockCampuses.find((c) => c.code === currentCampus) || mockCampuses[0];

  const popularTags = [
    { name: 'dotnet', count: 420 },
    { name: 'efcore', count: 310 },
    { name: 'clean-architecture', count: 280 },
    { name: 'react', count: 250 },
    { name: 'swp391', count: 195 },
    { name: 'sql-server', count: 160 },
  ];

  const topContributors = [
    { name: 'Nguyễn Văn A', karma: '1,250', badge: 'Gold', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { name: 'Lê Hoàng Long', karma: '2,890', badge: 'Alumni', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { name: 'Trần Thị B', karma: '890', badge: 'Silver', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  ];

  return (
    <aside className="w-80 shrink-0 hidden xl:block sticky top-20 h-[calc(100vh-5.5rem)] overflow-y-auto pl-2 space-y-4">
      {/* Current Academic Context Card */}
      <Card className="bg-linear-to-br from-[#005da7] to-[#004175] text-white border-0 shadow-md">
        <CardBody className="p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-sky-200 uppercase">
              Academic Context
            </span>
            <Badge variant="neutral" size="sm" className="bg-white/20 text-white border-0">
              {campusObj.code}
            </Badge>
          </div>
          <div>
            <h4 className="font-bold text-sm">{campusObj.name}</h4>
            <p className="text-[11px] text-sky-100/80 mt-0.5 line-clamp-1">{campusObj.location}</p>
          </div>
          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-sky-100">
            <span>Sinh viên active:</span>
            <span className="font-bold">{campusObj.studentCount.toLocaleString()}</span>
          </div>
        </CardBody>
      </Card>

      {/* AI Academic Assistant Promo */}
      <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20">
        <CardBody className="p-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-xs text-purple-900 dark:text-purple-200">FHub AI Assistant</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Hỏi đáp RAG môn học, tóm tắt tài liệu và gợi ý đề cương ôn tập.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Trending Course Nodes */}
      <Card>
        <CardHeader className="p-3.5 pb-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#005da7]" />
              <span>Môn học sôi nổi</span>
            </h4>
            <Link to="/courses" className="text-[11px] text-[#005da7] hover:underline flex items-center gap-0.5">
              Tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardBody className="p-3.5 pt-0 space-y-2.5">
          {mockCourses.slice(0, 3).map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.code}`}
              className="flex items-start justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-[#005da7] group-hover:underline">{c.code}</span>
                  <span className="text-[10px] text-slate-400">HK {c.semester}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">{c.title}</p>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {c.followerCount}
              </span>
            </Link>
          ))}
        </CardBody>
      </Card>

      {/* Popular Semantic Tags */}
      <Card>
        <CardHeader className="p-3.5 pb-2">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-purple-600" />
            <span>Tags phổ biến</span>
          </h4>
        </CardHeader>
        <CardBody className="p-3.5 pt-0 flex flex-wrap gap-1.5">
          {popularTags.map((t) => (
            <Link
              key={t.name}
              to={`/discussions?tag=${t.name}`}
              className="text-[11px] font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-[#cfe1fe] hover:text-[#005da7] transition-colors"
            >
              #{t.name} <span className="text-slate-400 text-[10px]">({t.count})</span>
            </Link>
          ))}
        </CardBody>
      </Card>

      {/* Top Karma Contributors */}
      <Card>
        <CardHeader className="p-3.5 pb-2">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Top Đóng góp (Karma)</span>
          </h4>
        </CardHeader>
        <CardBody className="p-3.5 pt-0 space-y-2">
          {topContributors.map((user, idx) => (
            <div key={user.name} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[11px] text-slate-400 w-3.5">{idx + 1}</span>
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{user.name}</span>
              </div>
              <span className="font-extrabold text-[#005da7]">{user.karma} pts</span>
            </div>
          ))}
        </CardBody>
      </Card>
    </aside>
  );
};
