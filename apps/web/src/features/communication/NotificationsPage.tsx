import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings, 
  Mail, 
  MessageSquare, 
  FileText, 
  BookOpen, 
  Star, 
  Users, 
  ExternalLink,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { notificationApi, NotificationItem as ApiNotificationItem } from '../../services/api/studentApi';

interface NotificationItem {
  id: string;
  type: 'message' | 'article' | 'material' | 'evaluation' | 'community';
  typeLabel: string;
  typeColor: string;
  courseCode?: string;
  time: string;
  title: string;
  description: string;
  actionText: string;
  actionUrl: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'message',
    typeLabel: 'New Message',
    typeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    time: '5 minutes ago',
    title: 'Minh Tran sent you a message.',
    description: '"Hey Minh, do you have the project rubric slides from Prof.…"',
    actionText: 'View Conversation',
    actionUrl: '/messages',
    isRead: false,
  },
  {
    id: 'notif-2',
    type: 'article',
    typeLabel: 'Article Interaction',
    typeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    time: '1 hour ago',
    title: 'Linh Nguyen commented on your article.',
    description: '"Great breakdown of the Entity Framework Core concurrency…"',
    actionText: 'View Comment',
    actionUrl: '/articles/1',
    isRead: false,
  },
  {
    id: 'notif-3',
    type: 'material',
    typeLabel: 'Study Material',
    typeColor: 'bg-blue-50 text-blue-700 border-blue-100',
    courseCode: 'PRN211',
    time: 'Yesterday',
    title: 'A new study material was added to PRN211.',
    description: 'File uploaded: PRN211_Complete_Summary.pdf (14.2 MB)',
    actionText: 'Open Resource',
    actionUrl: '/materials/1',
    isRead: true,
  },
  {
    id: 'notif-4',
    type: 'evaluation',
    typeLabel: 'Course Review',
    typeColor: 'bg-purple-50 text-purple-700 border-purple-100',
    courseCode: 'PRN211',
    time: '2 days ago',
    title: 'Your course review received a helpful vote.',
    description: 'Course: PRN211 • Community karma score +15 points',
    actionText: 'View Evaluation',
    actionUrl: '/course-evaluations/1',
    isRead: true,
  },
  {
    id: 'notif-5',
    type: 'community',
    typeLabel: 'Community Update',
    typeColor: 'bg-sky-50 text-sky-800 border-sky-100',
    time: '3 days ago',
    title: 'A new discussion is available in your course community.',
    description: 'Thread: "Async/await in WinForms UI thread starvation…"',
    actionText: 'Join Discussion',
    actionUrl: '/discussions/1',
    isRead: true,
  },
];

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLiveNotifications = async () => {
      try {
        setLoading(true);
        const liveItems = await notificationApi.getNotifications({ pageSize: 50 });
        if (liveItems && liveItems.length > 0) {
          const mapped: NotificationItem[] = liveItems.map(item => {
            const rawType = (item.type || '').toLowerCase();
            let mappedType: NotificationItem['type'] = 'community';
            let label = 'Community Update';
            let color = 'bg-sky-50 text-sky-800 border-sky-100';

            if (rawType.includes('message')) {
              mappedType = 'message';
              label = 'New Message';
              color = 'bg-indigo-50 text-indigo-700 border-indigo-100';
            } else if (rawType.includes('article')) {
              mappedType = 'article';
              label = 'Article Interaction';
              color = 'bg-emerald-50 text-emerald-700 border-emerald-100';
            } else if (rawType.includes('material')) {
              mappedType = 'material';
              label = 'Study Material';
              color = 'bg-blue-50 text-blue-700 border-blue-100';
            } else if (rawType.includes('evaluation') || rawType.includes('review')) {
              mappedType = 'evaluation';
              label = 'Course Review';
              color = 'bg-purple-50 text-purple-700 border-purple-100';
            }

            return {
              id: String(item.id),
              type: mappedType,
              typeLabel: label,
              typeColor: color,
              time: item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
              title: item.title,
              description: item.message,
              actionText: 'Chi tiết thông báo',
              actionUrl: item.actionUrl || '/notifications',
              isRead: item.isRead,
            };
          });

          // Merge live items with initial fallback items avoiding duplicates
          const liveIds = new Set(mapped.map(m => m.id));
          const remainingFallback = INITIAL_NOTIFICATIONS.filter(f => !liveIds.has(f.id));
          setNotifications([...mapped, ...remainingFallback]);
        }
      } catch (err) {
        console.warn('Failed to load live notifications from Communication service, using fallback feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'read') return n.isRead;
    return true;
  });

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!id.startsWith('notif-')) {
        await notificationApi.markAsRead(id);
      }
    } catch (err) {
      console.warn('Could not mark notification as read on API:', err);
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleToggleRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = notifications.find(n => n.id === id);
    if (!target) return;
    
    if (!target.isRead && !id.startsWith('notif-')) {
      try {
        await notificationApi.markAsRead(id);
      } catch (err) {
        console.warn('Could not mark notification on API:', err);
      }
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!id.startsWith('notif-')) {
        await notificationApi.deleteNotification(id);
      }
    } catch (err) {
      console.warn('Could not delete notification on API:', err);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.warn('Could not mark all notifications as read on API:', err);
    }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleResetFeed = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'article':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'material':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'evaluation':
        return <Star className="w-5 h-5 text-purple-600" />;
      case 'community':
      default:
        return <Users className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header & Interactive Filter Bar (Figma #106:8199) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-[#181C22]">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF5FF] text-[#0076D1] border border-[#BFDBFE]">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Stay updated on activity across the FHub community and academic spaces.
          </p>
        </div>

        {/* Tablist & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-[#0076D1] font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'all' ? 'bg-blue-100 text-[#0076D1]' : 'bg-slate-200 text-slate-600'
              }`}>
                {notifications.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'unread'
                  ? 'bg-white text-[#0076D1] font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Unread</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'unread' ? 'bg-blue-100 text-[#0076D1]' : 'bg-slate-200 text-slate-600'
              }`}>
                {unreadCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('read')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'read'
                  ? 'bg-white text-[#0076D1] font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Read</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'read' ? 'bg-blue-100 text-[#0076D1]' : 'bg-slate-200 text-slate-600'
              }`}>
                {readCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0076D1] hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
            <Link
              to="/settings"
              title="Notification Settings"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Notification List Box (Figma #106:8233) */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        {/* Stream Feed Header Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Stream Feed
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">
              Displaying latest interactions
            </span>
            {loading && (
              <span className="inline-flex items-center gap-1 text-xs text-[#0076D1]">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Đang đồng bộ...</span>
              </span>
            )}
          </div>
          <button
            onClick={handleResetFeed}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#0076D1] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Feed</span>
          </button>
        </div>

        {/* Notifications Items Container */}
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-slate-600">No notifications found</p>
            <p className="text-xs text-slate-400 mt-1">You are all caught up with community updates.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => navigate(notif.actionUrl)}
                className={`flex items-start gap-4 p-5 transition-colors cursor-pointer group hover:bg-slate-50/80 ${
                  !notif.isRead ? 'bg-blue-50/30' : 'bg-white'
                }`}
              >
                {/* Type Icon Container */}
                <div className="shrink-0 mt-0.5 p-2.5 rounded-xl bg-slate-100 border border-slate-200 group-hover:bg-white group-hover:shadow-xs transition-all">
                  {getTypeIcon(notif.type)}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${notif.typeColor}`}>
                      {notif.typeLabel}
                    </span>
                    {notif.courseCode && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {notif.courseCode}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">
                      {notif.time}
                    </span>
                  </div>

                  <h3 className={`text-sm ${!notif.isRead ? 'font-bold text-[#181C22]' : 'font-semibold text-slate-800'}`}>
                    {notif.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {notif.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0076D1] group-hover:underline">
                      <span>{notif.actionText}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Status Dot & Action Controls */}
                <div className="shrink-0 flex items-center gap-1.5 self-center ml-2">
                  {!notif.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0076D1] ring-4 ring-blue-100 mr-2" />
                  )}
                  <button
                    onClick={(e) => handleToggleRead(notif.id, e)}
                    title={notif.isRead ? "Mark as unread" : "Mark as read"}
                    className="p-1.5 text-slate-400 hover:text-[#0076D1] hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(notif.id, e)}
                    title="Delete notification"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Delivery Info Card (Figma #106:8424) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#0076D1] border border-blue-100 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Email Digest Delivery</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              A weekly digest of unread mentions and answers will be sent to your student mail.
            </p>
          </div>
        </div>
        <Link
          to="/settings"
          className="text-xs font-bold text-[#0076D1] hover:underline whitespace-nowrap px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 self-start sm:self-auto"
        >
          Manage Digest Settings
        </Link>
      </div>
    </div>
  );
};
