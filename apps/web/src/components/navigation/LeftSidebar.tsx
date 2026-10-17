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
  const { currentUser } = useAuth();

  const mainNav = [
    { name: 'Global Feed', path: '/', icon: Compass },
    { name: 'Course Hub', path: '/courses', icon: BookOpen },
    { name: 'Shared Workflows', path: '/workflows', icon: Workflow },
    { name: 'Articles', path: '/articles', icon: FileText },
    { name: 'Course Evaluations', path: '/course-evaluations', icon: Sparkles },
    { name: 'Study Materials', path: '/materials', icon: Download },
    { name: 'Questions', path: '/discussions', icon: HelpCircle },
  ];

  const commNav = [
    { name: 'Messages', path: '/messages', icon: Users, badge: 2 },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
  ];

  const personalNav = [
    { name: 'My Profile', path: '/profile', icon: Award },
    { name: 'Preferences & Privacy', path: '/settings', icon: Settings2 },
    { name: 'Notifications', path: '/notifications', icon: Megaphone },
    { name: 'Support Tickets', path: '/tickets', icon: LifeBuoy },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
      isActive
        ? 'bg-[#0076D1] text-white shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
    }`;

  return (
    <aside className="w-[230px] shrink-0 hidden lg:block sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-2">
      <div className="space-y-6">
        {/* Section A: MAIN NAVIGATION */}
        <div>
          <h4 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            MAIN NAVIGATION
          </h4>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} end={item.path === '/'} className={linkClass}>
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Section B: COMMUNICATION */}
        <div>
          <h4 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            COMMUNICATION
          </h4>
          <nav className="space-y-1">
            {commNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#0076D1] text-white group-hover:bg-white group-hover:text-[#0076D1] transition-colors">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Section C: PERSONAL */}
        <div>
          <h4 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            PERSONAL
          </h4>
          <nav className="space-y-1">
            {personalNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};
