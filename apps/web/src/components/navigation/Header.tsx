import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Bell,
  MapPin,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  HelpCircle,
  Code,
  FileText,
  Upload,
  ShoppingBag,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { campusesApi } from '../../services/api/adminApi';
import { notificationApi, NotificationItem } from '../../services/api/studentApi';
import { normalizeMediaUrl } from '../../utils/mediaUtils';
import { Dropdown } from '../common/Dropdown';
import { Button } from '../common/Button';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export const Header: React.FC = () => {
  const { currentUser, currentCampus, setCurrentCampus, logout } = useAuth();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [campuses, setCampuses] = useState<Array<{ code: string; name: string }>>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const items = await notificationApi.getNotifications({ pageSize: 20 });
      setNotifications(items || []);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  React.useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.warn('Failed to mark notification as read:', err);
      }
    }
    if (notif.actionUrl) {
      setShowNotifDrawer(false);
      navigate(notif.actionUrl);
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    const fetchCampuses = async () => {
      const token = localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token');
      if (!token) return;
      try {
        const res = await campusesApi.getCampuses();
        const items = (res as any)?.items || res || [];
        if (isMounted && Array.isArray(items) && items.length > 0) {
          setCampuses(items.map((c: any) => ({
            code: c.code || c.campusCode,
            name: c.name || c.campusName,
          })));
        }
      } catch (err) {
        console.warn('Backend campuses unavailable:', err);
      }
    };
    fetchCampuses();
    return () => { isMounted = false; };
  }, [currentUser]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const allCampusesList = campuses.length > 0 ? campuses : [
    { code: 'HL', name: 'ĐH FPT Hà Nội (Hòa Lạc)' },
    { code: 'HCM', name: 'ĐH FPT TP. Hồ Chí Minh' },
    { code: 'DN', name: 'ĐH FPT Đà Nẵng' },
    { code: 'CT', name: 'ĐH FPT Cần Thơ' },
    { code: 'QN', name: 'ĐH FPT Quy Nhơn' },
  ];

  const currentCampusObj = (currentCampus === 'ALL' || (currentCampus as any) === 'GLOBAL')
    ? { code: 'Global', name: t('header.allCampuses', 'Toàn quốc (Tất cả cơ sở)') }
    : allCampusesList.find((c) => c.code === currentCampus) || { code: currentCampus || 'HL', name: 'FPT University' };

  const campusDropdownItems = [
    {
      id: 'ALL',
      label: (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-[#0076D1]">{t('header.allCampuses', 'Toàn quốc (Global)')}</span>
          <span className="text-[10px] text-slate-400">Tất cả phân hiệu FPT</span>
        </div>
      ),
      onClick: () => setCurrentCampus('ALL' as any),
    },
    ...allCampusesList.map((c) => ({
      id: c.code,
      label: (
        <div className="flex flex-col">
          <span className="font-semibold text-xs">{c.name}</span>
          <span className="text-[10px] text-slate-400">Campus {c.code}</span>
        </div>
      ),
      onClick: () => setCurrentCampus(c.code as any),
    })),
  ];

  const createMenu = [
    {
      id: 'ask-question',
      label: t('header.askQuestion', 'Đặt câu hỏi Q&A'),
      icon: <HelpCircle className="w-4 h-4 text-blue-500" />,
      onClick: () => navigate('/discussions?action=create'),
    },
    {
      id: 'share-workflow',
      label: t('header.shareWorkflow', 'Chia sẻ Workflow đồ án'),
      icon: <Code className="w-4 h-4 text-purple-500" />,
      onClick: () => navigate('/workflows?action=create'),
    },
    {
      id: 'write-article',
      label: t('header.newArticle', 'Viết bài Tech Article'),
      icon: <FileText className="w-4 h-4 text-emerald-500" />,
      onClick: () => navigate('/articles/create'),
    },
    {
      id: 'upload-material',
      label: t('header.uploadMaterial', 'Tải lên tài liệu học tập'),
      icon: <Upload className="w-4 h-4 text-amber-500" />,
      onClick: () => navigate('/materials?action=upload'),
    },
    {
      id: 'create-listing',
      label: t('nav.marketplace', 'Đăng tin Marketplace'),
      icon: <ShoppingBag className="w-4 h-4 text-rose-500" />,
      onClick: () => navigate('/marketplace?action=create'),
    },
  ];

  const isAdminOrStaff = currentUser?.role === 'Admin' || currentUser?.role === 'Staff' || currentUser?.role === 'Community Moderator';

  const userMenu = [
    {
      id: 'profile',
      label: t('nav.myProfile', 'My Profile'),
      icon: <UserIcon className="w-4 h-4 text-blue-600" />,
      onClick: () => navigate('/profile'),
    },
    {
      id: 'settings',
      label: t('nav.settings', 'Preferences & Privacy'),
      icon: <Settings className="w-4 h-4 text-slate-600" />,
      onClick: () => navigate('/settings'),
    },
    ...(isAdminOrStaff
      ? [
          {
            id: 'admin-console',
            label: t('nav.adminConsole', 'Admin Console'),
            icon: <Shield className="w-4 h-4 text-indigo-600" />,
            onClick: () => navigate('/admin-console'),
          },
        ]
      : []),
    {
      id: 'tickets',
      label: t('nav.supportTickets', 'Support Tickets'),
      icon: <HelpCircle className="w-4 h-4 text-amber-600" />,
      onClick: () => navigate('/tickets'),
    },
    {
      id: 'logout',
      label: t('header.signOut', 'Sign Out'),
      icon: <LogOut className="w-4 h-4 text-rose-500" />,
      danger: true,
      divider: true,
      onClick: logout,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 transition-colors shrink-0 shadow-2xs">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Branding */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/fhub-remove-background.png"
                alt="FHub Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              FHub Community
            </span>
          </Link>

          {/* Campus Selector */}
          <div className="hidden lg:flex items-center">
            <Dropdown
              trigger={
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <MapPin className="w-3.5 h-3.5 text-[#0076D1]" />
                  <span>{currentCampusObj.code}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              }
              items={campusDropdownItems}
            />
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[420px] hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('header.searchPlaceholder', 'Search questions, courses, articles, materials...')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl pl-9 pr-14 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0076D1] transition-all"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 shadow-2xs">
              {t('header.ctrlK', 'Ctrl K')}
            </span>
          </div>
        </form>

        {/* Action Controls: Theme + Language + User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle size="md" />

          {/* Language Selector Dropdown */}
          <LanguageSwitcher variant="compact" />

          {currentUser ? (
            <>
              {/* Quick Create Dropdown */}
              <Dropdown
                trigger={
                  <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0076D1] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('header.quickCreate', 'Tạo')}</span>
                  </button>
                }
                items={createMenu}
              />

              {/* Notifications Link & Live Drawer */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#0076D1] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative cursor-pointer"
                  title={t('header.notifications', 'Notifications')}
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>

                {showNotifDrawer && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 py-3 z-50">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                          {t('header.notifications', 'Thông báo')}
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                            {unreadCount} {t('header.new', 'mới')}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-[#0076D1] hover:underline cursor-pointer"
                        >
                          {t('header.markAllRead', 'Đọc tất cả')}
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifLoading ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          {t('header.loadingNotifications', 'Đang tải thông báo...')}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          {t('header.noNotifications', 'Không có thông báo mới nào.')}
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={String(n.id)}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                              !n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{n.title}</span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {n.createdAt ? new Date(n.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US') : ''}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Menu */}
              <Dropdown
                trigger={
                  <div className="flex items-center gap-2 pl-1 cursor-pointer">
                    {currentUser.avatarUrl ? (
                      <img
                        src={normalizeMediaUrl(currentUser.avatarUrl)}
                        alt={currentUser.fullName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#0076D1] text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                        {currentUser.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                        {currentUser.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {t(`role.${currentUser.role}`, currentUser.role)} {currentUser.studentId ? `· ${currentUser.studentId}` : ''}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </div>
                }
                items={userMenu}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  {t('header.signIn', 'Sign In')}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  {t('header.signUp', 'Sign Up')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
