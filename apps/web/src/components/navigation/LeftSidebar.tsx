import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  HelpCircle,
  FileText,
  Workflow,
  Download,
  Bookmark,
  Users,
  LifeBuoy,
  Megaphone,
  Newspaper,
  Radio,
  GraduationCap,
  Award,
  Settings2,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { extractStudentIdFromEmail } from '../../utils/fptEmailValidator';
import { notificationApi } from '../../services/api/studentApi';

interface NavItemConfig {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  end?: boolean;
  color: {
    bg: string;
    text: string;
    darkBg: string;
    darkText: string;
  };
}

export interface LeftSidebarProps {
  isPinned?: boolean;
  isExpanded?: boolean;
  onTogglePin?: () => void;
  onHoverChange?: (hovered: boolean) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isPinned: externalPinned,
  isExpanded: externalExpanded,
  onTogglePin: externalTogglePin,
  onHoverChange,
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Internal state fallback if not controlled by parent layout
  const [internalPinned, setInternalPinned] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('fhub_sidebar_pinned') === 'true';
  });
  const [internalHovered, setInternalHovered] = useState<boolean>(false);

  const isPinned = externalPinned !== undefined ? externalPinned : internalPinned;
  const isExpanded = externalExpanded !== undefined ? externalExpanded : (isPinned || internalHovered);

  // Dynamic badges (e.g. unread notifications)
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    notificationApi
      .getNotifications({ pageSize: 20 })
      .then((items) => {
        if (isMounted && Array.isArray(items)) {
          const count = items.filter((n: any) => !n.isRead && !n.is_read).length;
          setUnreadNotifications(count);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTogglePin = useCallback(() => {
    if (externalTogglePin) {
      externalTogglePin();
    } else {
      setInternalPinned((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('fhub_sidebar_pinned', String(next));
        } catch {}
        return next;
      });
    }
  }, [externalTogglePin]);

  // Keyboard shortcut (Ctrl + [ or Cmd + [) to toggle Pin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '[' || e.code === 'BracketLeft')) {
        e.preventDefault();
        handleTogglePin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePin]);

  const handleMouseEnter = () => {
    if (onHoverChange) {
      onHoverChange(true);
    } else {
      setInternalHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (onHoverChange) {
      onHoverChange(false);
    } else {
      setInternalHovered(false);
    }
  };

  const myStudentCode =
    (currentUser as any)?.studentCode ||
    currentUser?.studentId ||
    extractStudentIdFromEmail(currentUser?.email);
  const myProfilePath = myStudentCode
    ? `/profile/${myStudentCode}`
    : currentUser?.id
    ? `/profile/${currentUser.id}`
    : '/profile';

  // Colorful Academic Themes for Navigation Items
  const mainNav: NavItemConfig[] = [
    {
      name: t('nav.globalFeed', 'Global Feed'),
      path: '/',
      icon: Compass,
      end: true,
      color: {
        bg: 'bg-rose-50',
        text: 'text-rose-500',
        darkBg: 'dark:bg-rose-950/40',
        darkText: 'dark:text-rose-400',
      },
    },
    {
      name: t('nav.courseHub', 'Course Hub'),
      path: '/courses',
      icon: BookOpen,
      color: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-500',
        darkBg: 'dark:bg-indigo-950/40',
        darkText: 'dark:text-indigo-400',
      },
    },
    {
      name: t('nav.sharedWorkflows', 'Shared Workflows'),
      path: '/workflows',
      icon: Workflow,
      color: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-500',
        darkBg: 'dark:bg-emerald-950/40',
        darkText: 'dark:text-emerald-400',
      },
    },
    {
      name: t('nav.articles', 'Articles'),
      path: '/articles',
      icon: FileText,
      color: {
        bg: 'bg-amber-50',
        text: 'text-amber-500',
        darkBg: 'dark:bg-amber-950/40',
        darkText: 'dark:text-amber-400',
      },
    },
    {
      name: t('nav.courseEvaluations', 'Course Evaluations'),
      path: '/course-evaluations',
      icon: Sparkles,
      color: {
        bg: 'bg-purple-50',
        text: 'text-purple-500',
        darkBg: 'dark:bg-purple-950/40',
        darkText: 'dark:text-purple-400',
      },
    },
    {
      name: t('nav.studyMaterials', 'Study Materials'),
      path: '/materials',
      icon: Download,
      color: {
        bg: 'bg-teal-50',
        text: 'text-teal-500',
        darkBg: 'dark:bg-teal-950/40',
        darkText: 'dark:text-teal-400',
      },
    },
    {
      name: t('nav.questions', 'Questions'),
      path: '/discussions',
      icon: HelpCircle,
      color: {
        bg: 'bg-orange-50',
        text: 'text-orange-500',
        darkBg: 'dark:bg-orange-950/40',
        darkText: 'dark:text-orange-400',
      },
    },
  ];

  const isSchoolRep =
    currentUser?.role === 'School Representative' || currentUser?.role === 'Admin';
  const isAlumni = currentUser?.role === 'Alumni';

  const commNav: NavItemConfig[] = [
    {
      name: t('nav.schoolNews', 'School News'),
      path: '/news',
      icon: Newspaper,
      badge: isSchoolRep ? 'Rep' : undefined,
      color: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        darkBg: 'dark:bg-blue-950/40',
        darkText: 'dark:text-blue-400',
      },
    },
    {
      name: t('nav.officialBroadcasts', 'Official Broadcasts'),
      path: '/broadcasts',
      icon: Radio,
      badge: isSchoolRep ? 'Rep' : undefined,
      color: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
        darkBg: 'dark:bg-cyan-950/40',
        darkText: 'dark:text-cyan-400',
      },
    },
    ...(isAlumni
      ? [
          {
            name: t('nav.alumniDesk', 'Alumni Desk'),
            path: '/alumni',
            icon: GraduationCap,
            badge: 'Alumni',
            color: {
              bg: 'bg-amber-50',
              text: 'text-amber-600',
              darkBg: 'dark:bg-amber-950/40',
              darkText: 'dark:text-amber-400',
            },
          },
        ]
      : []),
    {
      name: t('nav.messages', 'Messages'),
      path: '/messages',
      icon: Users,
      color: {
        bg: 'bg-sky-50',
        text: 'text-sky-500',
        darkBg: 'dark:bg-sky-950/40',
        darkText: 'dark:text-sky-400',
      },
    },
    {
      name: t('nav.bookmarks', 'Bookmarks'),
      path: '/bookmarks',
      icon: Bookmark,
      color: {
        bg: 'bg-fuchsia-50',
        text: 'text-fuchsia-500',
        darkBg: 'dark:bg-fuchsia-950/40',
        darkText: 'dark:text-fuchsia-400',
      },
    },
  ];

  const personalNav: NavItemConfig[] = [
    {
      name: t('nav.myProfile', 'My Profile'),
      path: myProfilePath,
      icon: Award,
      color: {
        bg: 'bg-violet-50',
        text: 'text-violet-500',
        darkBg: 'dark:bg-violet-950/40',
        darkText: 'dark:text-violet-400',
      },
    },
    {
      name: t('nav.notifications', 'Notifications'),
      path: '/notifications',
      icon: Megaphone,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
      color: {
        bg: 'bg-rose-50',
        text: 'text-rose-500',
        darkBg: 'dark:bg-rose-950/40',
        darkText: 'dark:text-rose-400',
      },
    },
    {
      name: t('nav.settings', 'Preferences & Privacy'),
      path: '/settings',
      icon: Settings2,
      color: {
        bg: 'bg-slate-100',
        text: 'text-slate-500',
        darkBg: 'dark:bg-slate-800',
        darkText: 'dark:text-slate-400',
      },
    },
    {
      name: t('nav.supportTickets', 'Support Tickets'),
      path: '/tickets',
      icon: LifeBuoy,
      color: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        darkBg: 'dark:bg-amber-950/40',
        darkText: 'dark:text-amber-400',
      },
    },
  ];

  const isMac =
    typeof window !== 'undefined' &&
    navigator.platform?.toUpperCase().indexOf('MAC') >= 0;

  // Render a Single Navigation Item
  const renderNavItem = (item: NavItemConfig) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.end}
        className={({ isActive }) =>
          `group relative flex items-center ${
            isExpanded ? 'justify-between px-2.5 py-1.5' : 'justify-center p-1.5'
          } rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            isActive
              ? 'bg-[#EC4899] text-white shadow-[0_4px_12px_rgba(236,72,153,0.35)]'
              : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-[#FCE7F3] dark:hover:bg-pink-950/25 hover:text-[#DB2777] dark:hover:text-pink-300'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Pastel Icon Badge */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-xs'
                    : `${item.color.bg} ${item.color.text} ${item.color.darkBg} ${item.color.darkText} group-hover:bg-[#FCE7F3] group-hover:text-[#DB2777] dark:group-hover:bg-pink-900/40 dark:group-hover:text-pink-300`
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              </div>

              {/* Text Label: visible only when expanded */}
              {isExpanded && (
                <span
                  className={`truncate transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-slate-600 dark:text-slate-300 group-hover:text-[#DB2777] dark:group-hover:text-pink-300'
                  }`}
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {item.name}
                </span>
              )}
            </div>

            {/* Pill Badge (Expanded Mode) */}
            {isExpanded && item.badge !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white text-[#EC4899]'
                    : 'bg-pink-100 text-[#DB2777] dark:bg-pink-950/60 dark:text-pink-300 group-hover:bg-[#EC4899] group-hover:text-white'
                }`}
              >
                {item.badge}
              </span>
            )}

            {/* Notification Pulse Dot (Collapsed Mode) */}
            {!isExpanded && item.badge !== undefined && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EC4899]"></span>
              </span>
            )}

            {/* Floating Tooltip: Strictly ONLY displayed in Collapsed Mode */}
            {!isExpanded && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900/95 dark:bg-slate-800/95 text-white text-[11px] font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 whitespace-nowrap z-50 translate-x-1 group-hover:translate-x-0 flex items-center gap-1.5 border border-slate-700/50">
                <span>{item.name}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#EC4899] text-white">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hidden lg:flex fixed left-0 z-40 flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 transition-[width,box-shadow] duration-300 select-none overflow-x-hidden"
      style={{
        top: 'var(--header-height, 64px)',
        height: 'calc(100dvh - var(--header-height, 64px))',
        width: 'var(--sidebar-width, 64px)',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isExpanded
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          : undefined,
      }}
    >
      {/* 1. Middle Section: Scrollable Navigation Menu (Starts immediately below header, no logo) */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-2 pb-2 px-1.5 space-y-2.5">
        {/* Section A: MAIN NAVIGATION */}
        <div>
          {isExpanded && (
            <h4 className="px-2 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 whitespace-nowrap">
              {t('nav.mainNavigation', 'MAIN NAVIGATION')}
            </h4>
          )}
          <nav className="space-y-0.5">
            {mainNav.map((item) => renderNavItem(item))}
          </nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-1 mx-1.5" />

        {/* Section B: COMMUNICATION */}
        <div>
          {isExpanded && (
            <h4 className="px-2 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 whitespace-nowrap">
              {t('nav.communication', 'COMMUNICATION')}
            </h4>
          )}
          <nav className="space-y-0.5">
            {commNav.map((item) => renderNavItem(item))}
          </nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-1 mx-1.5" />

        {/* Section C: PERSONAL */}
        <div>
          {isExpanded && (
            <h4 className="px-2 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 whitespace-nowrap">
              {t('nav.personal', 'PERSONAL')}
            </h4>
          )}
          <nav className="space-y-0.5">
            {personalNav.map((item) => renderNavItem(item))}
          </nav>
        </div>
      </div>

      {/* 2. Bottom Section: Expand / Collapse / Pin Toggle Button (Fixed at bottom) */}
      <div className="shrink-0 p-2 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={handleTogglePin}
          className={`w-full flex items-center ${
            isExpanded ? 'justify-between px-2.5 py-1.5' : 'justify-center p-1.5'
          } rounded-xl text-slate-500 hover:text-[#DB2777] dark:hover:text-pink-400 hover:bg-[#FCE7F3]/70 dark:hover:bg-pink-950/20 transition-all duration-200 group cursor-pointer`}
          title={
            isPinned
              ? t('nav.collapseSidebar', 'Thu gọn sidebar (Ctrl + [)')
              : t('nav.expandSidebar', 'Mở rộng sidebar (Ctrl + [)')
          }
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-transform duration-250 ${
                isPinned ? 'rotate-180' : ''
              }`}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {isExpanded ? (
                <ChevronsLeft className="w-4 h-4 transition-transform group-hover:scale-110" />
              ) : (
                <ChevronsRight className="w-4 h-4 transition-transform group-hover:scale-110" />
              )}
            </div>
            {isExpanded && (
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#DB2777] dark:group-hover:text-pink-300 whitespace-nowrap transition-colors">
                {isPinned ? t('nav.collapse', 'Thu gọn') : t('nav.pinSidebar', 'Ghim mở rộng')}
              </span>
            )}
          </div>

          {isExpanded && (
            <kbd className="px-1.5 py-0.2 text-[9px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded border border-slate-200/80 dark:border-slate-700/60 shrink-0">
              {isMac ? '⌘[' : 'Ctrl['}
            </kbd>
          )}
        </button>
      </div>
    </aside>
  );
};
