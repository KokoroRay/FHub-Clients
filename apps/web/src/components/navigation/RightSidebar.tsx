import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Tag,
  Award,
  Sparkles,
  ArrowRight,
  MapPin,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCourses, mockCampuses } from '../../services/mockData';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';

export const RightSidebar: React.FC = () => {
  const { currentUser, currentCampus } = useAuth();
  const campusObj = mockCampuses.find((c) => c.code === currentCampus) || mockCampuses[0];

  const studentName = currentUser?.fullName || 'Nguyen Van A';
  const studentId = currentUser?.studentId || 'SE172481';
  const avatarInitials = studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'NA';

  const activities = [
    {
      id: 'act-1',
      author: '@duc_anh_swe',
      action: 'posted a question in',
      target: '[PRN211]',
      targetColor: 'text-[#0076D1]',
      dotColor: 'bg-[#0076D1]',
      time: '10m ago',
      link: '/discussions',
    },
    {
      id: 'act-2',
      author: '@linh_lecturer',
      action: 'published an article on',
      target: 'LINQ Best Practices',
      targetColor: 'text-slate-900 font-semibold',
      dotColor: 'bg-emerald-500',
      time: '45m ago',
      link: '/articles',
    },
    {
      id: 'act-3',
      author: '@dev_master',
      action: 'shared workflow',
      target: 'ASP.NET Core Setup',
      targetColor: 'text-slate-900 font-semibold',
      dotColor: 'bg-indigo-500',
      time: '2h ago',
      link: '/workflows',
    },
    {
      id: 'act-4',
      author: '@tuan_db',
      action: 'evaluated course',
      target: '[DBI202]',
      targetColor: 'text-purple-600',
      dotColor: 'bg-amber-500',
      time: '4h ago',
      link: '/course-evaluations',
    },
  ];

  const shortcuts = [
    { name: 'Bookmarks List', path: '/bookmarks', icon: Tag },
    { name: 'Preferences & Privacy', path: '/settings', icon: Sparkles },
    { name: 'Notifications Center', path: '/notifications', icon: Award },
    { name: 'Support Tickets', path: '/tickets', icon: Flame },
  ];

  return (
    <aside className="w-[260px] shrink-0 hidden xl:block sticky top-20 pl-1 space-y-4">
      {/* CARD 1: My Academic Profile (Figma #86:684) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#0076D1] text-white flex items-center justify-center font-bold text-sm ring-2 ring-blue-100 shrink-0">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={studentName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{avatarInitials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-slate-900 truncate leading-tight">{studentName}</h4>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0076D1] border border-blue-100">
              {studentId}
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 shrink-0">Campus:</span>
            <span className="font-medium text-slate-700 truncate text-right">{campusObj.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Major:</span>
            <span className="font-medium text-slate-700">Software Eng.</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Semester:</span>
            <span className="font-mono font-semibold text-slate-700">Term 5 (SP25)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <Link
            to="/profile"
            className="flex items-center justify-between text-xs font-semibold text-[#0076D1] hover:underline"
          >
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* CARD 2: Recent Community Activity (Figma #86:714) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            COMMUNITY ACTIVITY
          </h4>
        </div>

        <div className="space-y-3">
          {activities.map((act) => (
            <Link key={act.id} to={act.link} className="flex items-start gap-2.5 text-xs group block">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${act.dotColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-slate-700 leading-snug group-hover:text-blue-600 transition-colors">
                  <span className="font-bold text-slate-800">{act.author}</span> {act.action}{' '}
                  <span className={act.targetColor}>{act.target}</span>
                </p>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{act.time}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CARD 3: Personal Shortcuts (Figma #86:755) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            PERSONAL SHORTCUTS
          </h4>
        </div>

        <div className="space-y-1">
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <Link
                key={sc.path}
                to={sc.path}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0076D1] transition-colors" />
                  <span>{sc.name}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#0076D1] group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
