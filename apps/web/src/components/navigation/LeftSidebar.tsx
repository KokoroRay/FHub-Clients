import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  HelpCircle,
  FileText,
  Workflow,
  Download,
  ShoppingBag,
  Bookmark,
  Users,
  LifeBuoy,
  ShieldCheck,
  Megaphone,
  Award,
  Settings2,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LeftSidebar: React.FC = () => {
  const { currentRole, currentUser } = useAuth();

  const mainNav = [
    { name: 'Global Feed', path: '/', icon: Compass },
    { name: 'Course Hub', path: '/courses', icon: BookOpen },
    { name: 'Discussions & Q&A', path: '/discussions', icon: HelpCircle },
    { name: 'Tech Articles', path: '/articles', icon: FileText },
    { name: 'Shared Workflows', path: '/workflows', icon: Workflow },
    { name: 'Study Materials', path: '/materials', icon: Download },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
  ];

  const secondaryNav = [
    { name: 'Mentorship Pairing', path: '/mentorship', icon: Users },
    { name: 'Đã lưu (Bookmarks)', path: '/bookmarks', icon: Bookmark },
    { name: 'Support & Tickets', path: '/tickets', icon: LifeBuoy },
  ];

  const adminNav = [
    { name: 'Admin Control Center', path: '/admin/campus', icon: Settings2 },
    { name: 'Staff Governance', path: '/staff/accounts', icon: Activity },
  ];

  const modNav = [
    { name: 'Moderator Desk', path: '/moderator', icon: ShieldCheck },
    { name: 'Official Broadcasts', path: '/broadcasts', icon: Megaphone },
    { name: 'Alumni Karma & Endorse', path: '/alumni', icon: Award },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
      isActive
        ? 'bg-blue-600 text-white shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
    }`;

  return (
    <aside className="w-64 shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-5.5rem)] overflow-y-auto pr-2">
      <div className="space-y-6">
        {/* Main Navigation */}
        <div>
          <h4 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Academic Hub
          </h4>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} end={item.path === '/'} className={linkClass}>
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div>
          <h4 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Community & Support
          </h4>
          <nav className="space-y-1">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin / Staff Navigation if Role matched */}
        {(currentRole === 'Admin' || currentRole === 'Staff') && (
          <div>
            <h4 className="px-3 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Management Portal</span>
            </h4>
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={linkClass}>
                    <Icon className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Moderator / School Rep / Alumni Tools */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
          <h4 className="px-3 text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
            Special Roles Desk
          </h4>
          <nav className="space-y-1">
            {modNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  <Icon className="w-4 h-4 shrink-0 text-purple-500" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick User Karma / Mini Stats */}
        {currentUser && (
          <div className="p-3.5 bg-linear-to-br from-slate-50 to-slate-100/80 dark:from-slate-800/40 dark:to-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Điểm Karma</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">{currentUser.karma.toLocaleString()} pts</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Huy hiệu: {currentUser.badges.length}</span>
              <span className="text-emerald-600 font-semibold">{currentUser.campus} Campus</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
