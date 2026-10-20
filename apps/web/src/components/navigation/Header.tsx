import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Bell,
  MessageSquare,
  MapPin,
  ChevronDown,
  User as UserIcon,
  Settings,
  Shield,
  LogOut,
  HelpCircle,
  Sparkles,
  BookOpen,
  Code,
  FileText,
  Upload,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { campusesApi } from '../../services/api/adminApi';
import { notificationApi, NotificationItem } from '../../services/api/studentApi';
import { Dropdown } from '../common/Dropdown';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const Header: React.FC = () => {
  const { currentUser, currentCampus, setCurrentCampus, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [campuses, setCampuses] = useState<Array<{ code: string; name: string }>>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

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
  const navigate = useNavigate();

  React.useEffect(() => {
    let isMounted = true;
    const fetchCampuses = async () => {
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
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const currentCampusObj = campuses.find((c) => c.code === currentCampus) || { code: currentCampus || 'FPTU', name: 'FPT University' };

  const createMenu = [
    {
      id: 'ask-question',
      label: 'Đặt câu hỏi Q&A',
      icon: <HelpCircle className="w-4 h-4 text-blue-500" />,
      onClick: () => navigate('/discussions?action=create'),
    },
    {
      id: 'share-workflow',
      label: 'Chia sẻ Workflow đồ án',
      icon: <Code className="w-4 h-4 text-purple-500" />,
      onClick: () => navigate('/workflows?action=create'),
    },
    {
      id: 'write-article',
      label: 'Viết bài Tech Article',
      icon: <FileText className="w-4 h-4 text-emerald-500" />,
      onClick: () => navigate('/articles/create'),
    },
    {
      id: 'upload-material',
      label: 'Tải lên tài liệu học tập',
      icon: <Upload className="w-4 h-4 text-amber-500" />,
      onClick: () => navigate('/materials?action=upload'),
    },
    {
      id: 'create-listing',
      label: 'Đăng tin Marketplace',
      icon: <ShoppingBag className="w-4 h-4 text-rose-500" />,
      onClick: () => navigate('/marketplace?action=create'),
    },
  ];

  const userMenu = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: <UserIcon className="w-4 h-4 text-blue-600" />,
      onClick: () => navigate('/profile'),
    },
    {
      id: 'settings',
      label: 'Preferences & Privacy',
      icon: <Settings className="w-4 h-4 text-slate-600" />,
      onClick: () => navigate('/settings'),
    },
    {
      id: 'tickets',
      label: 'Support Tickets',
      icon: <HelpCircle className="w-4 h-4 text-amber-600" />,
      onClick: () => navigate('/tickets'),
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4 text-rose-500" />,
      danger: true,
      divider: true,
      onClick: logout,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 transition-colors shrink-0 shadow-2xs">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Branding (Figma #86:837) */}
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
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                  <MapPin className="w-3.5 h-3.5 text-[#0076D1]" />
                  <span>{currentCampusObj.code}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              }
              items={campuses.map((c) => ({
                id: c.code,
                label: (
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs">{c.name}</span>
                    <span className="text-[10px] text-slate-400">Campus {c.code}</span>
                  </div>
                ),
                onClick: () => setCurrentCampus(c.code as any),
              }))}
            />
          </div>
        </div>

        {/* Global Search Bar (Figma #86:837) */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[420px] hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, courses, articles, materials..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 rounded-xl pl-9 pr-14 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0076D1] transition-all"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 shadow-2xs">
              Ctrl K
            </span>
          </div>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              {/* Notifications Link & Live Drawer */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                  className="p-2 text-slate-500 hover:text-[#0076D1] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative cursor-pointer"
                  title="Notifications"
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
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">Thông báo</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-[#0076D1] hover:underline cursor-pointer"
                        >
                          Đọc tất cả
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifLoading ? (
                        <div className="p-6 text-center text-xs text-slate-400">Đang tải thông báo...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">Không có thông báo mới nào.</div>
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
                                {n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN') : ''}
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
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                        {currentUser.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{currentUser.studentId || ''}</span>
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
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
