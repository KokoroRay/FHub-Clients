import React from 'react';
import { X, ShieldAlert, Bell, ExternalLink, Clock } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../../context/LanguageContext';

export interface NotificationDetailData {
  id: string | number;
  title: string;
  message: string;
  type?: string;
  createdAt?: string;
  actionUrl?: string;
}

export interface NotificationDetailModalProps {
  notification: NotificationDetailData | null;
  onClose: () => void;
  onNavigate?: (url: string) => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  onClose,
  onNavigate,
}) => {
  const { t, locale } = useLanguage();

  if (!notification) return null;

  const isModeration =
    notification.type?.includes('CONTENT') ||
    notification.type?.includes('MODERATION') ||
    notification.type?.includes('APPEAL') ||
    notification.message.includes('tiêu chuẩn cộng đồng') ||
    notification.message.includes('tạm giữ') ||
    notification.message.includes('từ chối') ||
    notification.message.includes('xem xét');

  const actionTarget = notification.actionUrl || (isModeration ? '/profile?tab=quarantine' : '');

  const handleAction = () => {
    if (actionTarget && onNavigate) {
      onClose();
      onNavigate(actionTarget);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isModeration ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'}`}>
              {isModeration ? <ShieldAlert className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                {t('notifications.detailTitle', 'Chi tiết thông báo')}
              </h3>
              {notification.createdAt && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(notification.createdAt).toLocaleString(locale)}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              {t('notifications.subject', 'Tiêu đề thông báo')}
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {notification.title}
            </h4>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              {t('notifications.content', 'Nội dung chi tiết')}
            </span>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
              {notification.message}
            </div>
          </div>

          {isModeration && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {t('notifications.quarantineHint', 'Bài viết đang nằm trong danh sách tạm giữ bảo vệ cộng đồng. Bạn có thời hạn 3 ngày kể từ khi có cảnh báo để gửi lý do kháng cáo tới Ban quản trị xem xét.')}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common.close', 'Đóng')}
          </Button>

          {actionTarget && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleAction}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              {isModeration
                ? t('notifications.viewQuarantine', 'Xem nội dung tạm giữ & Kháng cáo')
                : t('notifications.openAction', 'Đi đến liên kết')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
