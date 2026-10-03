import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Award,
  BookOpen,
  ThumbsUp,
  FileText,
  Workflow,
  Settings,
  ShieldCheck,
  Globe,
  Link2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCurrentUser, mockQuestions, mockArticles, mockWorkflows } from '../../services/mockData';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const user = currentUser || mockCurrentUser;
  const [activeTab, setActiveTab] = useState<'contributions' | 'votes' | 'badges'>('contributions');

  const userQuestions = mockQuestions.filter((q) => q.author.id === user.id);
  const userWorkflows = mockWorkflows.filter((w) => w.author.id === user.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Hero Header */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800" />
        <CardBody className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-md"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">{user.fullName}</h1>
                  <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                    Đã xác minh
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  {user.studentId} • {user.major} • Campus {user.campus}
                </p>
              </div>
            </div>

            <Link to="/settings">
              <Button variant="outline" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
                Thiết lập tài khoản
              </Button>
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {user.bio}
          </p>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="font-bold text-blue-600 font-mono text-sm">{user.karma.toLocaleString()} Karma Points</span>
              <span>• Tham gia từ: 09/2025</span>
            </div>

            <div className="flex items-center gap-3">
              {user.githubUrl && (
                <a href={user.githubUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900" title="GitHub">
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {user.linkedinUrl && (
                <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-sky-600" title="LinkedIn">
                  <Link2 className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'contributions', label: 'Đóng góp học thuật', count: userQuestions.length + userWorkflows.length, icon: <BookOpen className="w-4 h-4" /> },
          { id: 'badges', label: 'Huy hiệu đã đạt', count: user.badges.length, icon: <Award className="w-4 h-4" /> },
          { id: 'votes', label: 'Lịch sử Upvote', icon: <ThumbsUp className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'contributions' && (
          <div className="space-y-3">
            {userQuestions.map((q) => (
              <Card key={q.id} hoverable>
                <CardBody className="p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{q.courseCode}</Badge>
                    <span className="text-xs text-slate-400">Câu hỏi Q&A</span>
                  </div>
                  <Link to={`/discussions/${q.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 block">
                    {q.title}
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.badges.map((b) => (
              <Card key={b.id}>
                <CardBody className="p-4 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-2xl shrink-0">
                    {b.icon || '🏅'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{b.name}</h4>
                    <p className="text-xs text-slate-500">{b.description}</p>
                    <span className="text-[10px] text-amber-600 font-bold block mt-0.5">+{b.karmaReward} Karma</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'votes' && (
          <Card>
            <CardBody className="p-6 text-center text-xs text-slate-400">
              Bạn đã upvote cho 48 câu hỏi và 22 bài viết hữu ích trong học kỳ này.
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};
