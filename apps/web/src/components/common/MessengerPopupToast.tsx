import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface MessengerToastData {
  id: string;
  conversationId: string | number;
  senderId: string | number;
  senderName: string;
  message: string;
  messageType?: string;
  attachmentUrl?: string;
  avatarUrl?: string;
  time: string;
}

export const MessengerPopupToast: React.FC = () => {
  const { on, playNotificationSound } = useRealtime();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [toasts, setToasts] = useState<MessengerToastData[]>([]);

  useEffect(() => {
    const unsub = on('CHAT_MESSAGE_RECEIVED', (evt) => {
      const { conversationId, message, senderId } = evt.payload || {};
      const sId = String(senderId || '');
      
      // Do not notify self
      if (currentUser?.id && String(currentUser.id) === sId) {
        return;
      }

      // If user is already on /messages and viewing this conversation, skip popup
      const isViewingThisChat = location.pathname.startsWith('/messages');
      if (isViewingThisChat) {
        // Can still play sound or let page handle it
        return;
      }

      playNotificationSound();

      const newToast: MessengerToastData = {
        id: String(message?.id || message?.message_id || Date.now()),
        conversationId: conversationId || 1,
        senderId: sId,
        senderName: message?.sender_name || message?.senderName || t('common.peerStudent', 'Bạn học FHub'),
        message: message?.body || message?.content || '',
        messageType: message?.message_type || message?.messageType || 'TEXT',
        attachmentUrl: message?.attachment_url || message?.attachmentUrl,
        avatarUrl: message?.sender_avatar || '',
        time: t('common.justNow', 'Vừa xong'),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 2)]);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== newToast.id));
      }, 6500);
    });

    return () => {
      unsub();
    };
  }, [on, currentUser, location.pathname, playNotificationSound, t]);

  const removeToast = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenConversation = (convId: string | number) => {
    navigate(`/messages?conversationId=${convId}`);
    setToasts([]);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => handleOpenConversation(toast.conversationId)}
          className="pointer-events-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-slate-800 p-3.5 flex items-start gap-3 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-slate-800/80 transition-all transform hover:-translate-y-0.5 animate-in slide-in-from-bottom-5 duration-300"
          style={{ boxShadow: '0 10px 30px -5px rgba(0, 118, 209, 0.25)' }}
        >
          {/* Avatar with Messenger-style badge */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0076D1] to-blue-400 text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
              {toast.avatarUrl ? (
                <img src={toast.avatarUrl} alt={toast.senderName} className="w-full h-full object-cover" />
              ) : (
                toast.senderName.slice(0, 2).toUpperCase()
              )}
            </div>
            {/* FB Messenger blue dot icon badge */}
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0076D1] text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              <MessageSquare className="w-2.5 h-2.5 fill-current" />
            </span>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {toast.senderName}
              </h4>
              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                {toast.time}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {toast.messageType === 'IMAGE' ? (
                <span className="inline-flex items-center gap-1 text-[#0076D1] dark:text-blue-400 font-semibold">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {t('messages.sentImage', 'Đã gửi một hình ảnh')}
                </span>
              ) : toast.messageType === 'GIF' ? (
                <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('messages.sentGif', 'Đã gửi một GIF động')}
                </span>
              ) : (
                toast.message || t('messages.newMessage', 'Tin nhắn mới')
              )}
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => removeToast(toast.id, e)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title={t('common.close', 'Đóng')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
