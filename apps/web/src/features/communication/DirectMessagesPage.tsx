import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Search,
  Trash2,
  ShieldCheck,
  Check,
  CheckCheck,
  MoreVertical,
  Ban,
  Unlock,
  X,
  AlertTriangle,
  UserCheck,
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Maximize2,
  Download,
  Smile,
  Volume2,
  VolumeX,
  User,
  FolderArchive,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRealtime } from '../../context/RealtimeContext';
import { directMessageApi } from '../../services/api/studentApi';
import { contentMediaApi } from '../../services/api/contentApi';
import { validateImage, normalizeMediaUrl } from '../../utils/mediaUtils';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  text: string;
  time: string;
  isYou: boolean;
  status?: 'sent' | 'delivered' | 'read';
  messageType?: string;
  attachmentUrl?: string;
}

interface ConversationItem {
  id: string;
  participantId: string;
  name: string;
  initials: string;
  initialsBg: string;
  studentId: string;
  courseTag: string;
  role: string;
  statusText: string;
  isActiveNow: boolean;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  taskTitle?: string;
  isBlocked?: boolean;
}

interface BlockedItem {
  blockId: string | number;
  userId: string | number;
  name: string;
  studentCode: string;
  reason: string;
  blockedAt: string;
}

const POPULAR_GIFS = [
  { id: '1', title: 'Thumbs Up', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif' },
  { id: '2', title: 'Celebration', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
  { id: '3', title: 'Typing Code', url: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif' },
  { id: '4', title: 'Awesome', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif' },
  { id: '5', title: 'Clapping', url: 'https://media.giphy.com/media/nbvFVPiEiJH6Q/giphy.gif' },
  { id: '6', title: 'Cat Typing', url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif' },
  { id: '7', title: 'Thank You', url: 'https://media.giphy.com/media/osAcIGJnyeRqaJAbrC/giphy.gif' },
  { id: '8', title: 'Mind Blown', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
  { id: '9', title: 'High Five', url: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif' },
  { id: '10', title: 'Laughing', url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif' },
  { id: '11', title: 'Happy Dance', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif' },
  { id: '12', title: 'Confused', url: 'https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy.gif' },
];

export const DirectMessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { formatDate, formatTime, locale, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>(() => {
    return searchParams.get('conversationId') || searchParams.get('convId') || '';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const { on, send, isSoundEnabled, setIsSoundEnabled, playNotificationSound } = useRealtime();
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimerRef = useRef<any>(null);

  // Uploading and GIF Picker States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [gifResults, setGifResults] = useState<{ id: string; title: string; url: string }[]>(POPULAR_GIFS);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);

  // Modals & Panels
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showMediaPanel, setShowMediaPanel] = useState(false);
  const [mediaTab, setMediaTab] = useState<'images' | 'files'>('images');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [confirmDeleteMsgId, setConfirmDeleteMsgId] = useState<string | null>(null);
  const [confirmBlockConv, setConfirmBlockConv] = useState<ConversationItem | null>(null);
  const [confirmUnblockItem, setConfirmUnblockItem] = useState<BlockedItem | null>(null);
  const [blockedList, setBlockedList] = useState<BlockedItem[]>([]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await directMessageApi.getConversations();
      if (data && data.length > 0) {
        const mapped: ConversationItem[] = data.map((c) => {
          const initials = c.participantName ? c.participantName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SV';
          return {
            id: String(c.conversationId),
            participantId: String(c.participantId),
            name: c.participantName || t("Sinh viên #{p0}", undefined, { p0: c.participantId }),
            initials,
            initialsBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
            studentId: c.participantCode || `SE-${c.participantId}`,
            courseTag: c.courseTag || 'FHub',
            role: c.role || t("Thành viên FHub"),
            statusText: t("Hoạt động"),
            isActiveNow: true,
            lastMessage: c.lastMessage || '',
            lastTime: c.lastMessageAt ? c.lastMessageAt : t("Vừa xong"),
            unreadCount: c.unreadCount || 0,
            isBlocked: c.isBlocked || false,
          };
        });
        setConversations(mapped);

        // Auto-select conversation: respect query param if present, else pick first conversation
        const queryConv = searchParams.get('conversationId') || searchParams.get('convId');
        const queryUserId = searchParams.get('userId');
        if (queryConv && mapped.some(c => c.id === queryConv)) {
          setActiveConvId(queryConv);
        } else if (queryUserId) {
          const found = mapped.find(c => String(c.participantId) === String(queryUserId));
          if (found) {
            setActiveConvId(found.id);
          }
        } else if (!activeConvId && mapped.length > 0) {
          setActiveConvId(mapped[0].id);
        }
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.warn('Failed to fetch conversations:', err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedUsers = async () => {
    try {
      const data = await directMessageApi.getBlockedUsers();
      if (data && data.length > 0) {
        const mapped: BlockedItem[] = data.map((b: any) => ({
          blockId: b.user_block_id || b.userBlockId || b.id || 1,
          userId: b.blocked_user_id || b.blocked_account_id || 10,
          name: b.name || `Phu THG (CE182003)`,
          studentCode: b.student_code || 'CE182003',
          reason: b.reason || 'Chặn tin nhắn trực tiếp',
          blockedAt: b.created_at ? b.created_at : 'Hôm qua',
        }));
        setBlockedList(mapped);
      } else {
        setBlockedList([]);
      }
    } catch {
      setBlockedList([]);
    }
  };

  useEffect(() => {
    loadConversations();
    loadBlockedUsers();
  }, []);

  // When navigated with ?userId=..., ensure conversation exists or create it
  useEffect(() => {
    const queryUserId = searchParams.get('userId');
    if (!queryUserId || !currentUser) return;
    const existing = conversations.find(c => String(c.participantId) === String(queryUserId));
    if (existing) {
      setActiveConvId(existing.id);
    } else {
      directMessageApi.createConversation(queryUserId).then((conv) => {
        if (conv?.conversation_id) {
          loadConversations().then(() => {
            setActiveConvId(String(conv.conversation_id));
          });
        }
      });
    }
  }, [searchParams.get('userId')]);

  // Update query params when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      setSearchParams({ conversationId: activeConvId }, { replace: true });
    }
  }, [activeConvId, setSearchParams]);

  useEffect(() => {
    if (!activeConvId) return;
    let isMounted = true;
    const loadMessages = async () => {
      try {
        const data = await directMessageApi.getMessages(activeConvId);
        if (isMounted && data && data.length > 0) {
          const mapped: Message[] = data.map((m) => {
            const isMine = String(m.senderId) === String(currentUser?.id) || m.senderName === 'Bạn';
            return {
              id: String(m.messageId),
              senderId: String(m.senderId),
              senderName: isMine ? 'Bạn' : m.senderName,
              senderInitials: isMine ? 'ME' : (m.senderName ? m.senderName.slice(0, 2).toUpperCase() : 'SV'),
              text: m.content,
              time: m.createdAt ? m.createdAt : t("Vừa xong"),
              isYou: isMine,
              status: 'read',
              messageType: m.messageType || 'TEXT',
              attachmentUrl: m.attachmentUrl,
            };
          });
          setMessages(prev => ({ ...prev, [activeConvId]: mapped }));
        }
      } catch (err) {
        console.warn('Failed to load messages for conversation:', err);
      }
    };
    loadMessages();
    return () => { isMounted = false; };
  }, [activeConvId, currentUser]);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeMessages = messages[activeConvId] || [];

  // Filter shared images & files in current active conversation
  const sharedImages = activeMessages.filter(
    m => m.attachmentUrl && (m.messageType === 'IMAGE' || m.messageType === 'GIF' || /\.(jpe?g|png|gif|webp)$/i.test(m.attachmentUrl))
  );
  const sharedFiles = activeMessages.filter(
    m => m.attachmentUrl && !sharedImages.some(img => img.id === m.id)
  );

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[activeConvId]?.length, activeConvId]);

  // Real-time listener for direct messages and typing status
  useEffect(() => {
    const unsubMsg = on('CHAT_MESSAGE_RECEIVED', (evt) => {
      const { conversationId, message, senderId } = evt.payload || {};
      const convIdStr = String(conversationId || '');
      const incomingMsgId = String(message?.id || message?.message_id || Date.now());
      const body = message?.body || message?.content || '';
      const messageType = message?.message_type || message?.messageType || 'TEXT';
      const attachmentUrl = message?.attachment_url || message?.attachmentUrl;

      // If message is in currently active conversation
      if (convIdStr === String(activeConvId)) {
        const isFromMe = String(senderId) === String(currentUser?.id);
        const newMsgItem: Message = {
          id: incomingMsgId,
          senderId: String(senderId || ''),
          senderName: isFromMe ? 'Bạn' : (activeConv?.name || 'Đối tác'),
          senderInitials: isFromMe ? 'ME' : (activeConv?.initials || 'SV'),
          text: body,
          time: t('Vừa xong'),
          isYou: isFromMe,
          status: 'delivered',
          messageType,
          attachmentUrl,
        };

        setMessages((prev) => {
          const currentList = prev[convIdStr] || [];
          if (currentList.some((m) => m.id === newMsgItem.id)) return prev;
          return {
            ...prev,
            [convIdStr]: [...currentList, newMsgItem],
          };
        });
        setIsPartnerTyping(false);
      }

      // Update conversations list (move to top and update snippet)
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === convIdStr);
        if (index === -1) {
          loadConversations();
          return prev;
        }
        const updated = [...prev];
        const conv = { ...updated[index] };
        conv.lastMessage = body || (messageType === 'IMAGE' ? t('Đã gửi một ảnh') : t('Đã gửi một tệp'));
        conv.lastTime = new Date().toISOString();
        if (convIdStr !== String(activeConvId)) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
        updated.splice(index, 1);
        updated.unshift(conv);
        return updated;
      });

      if (String(senderId) !== String(currentUser?.id) && isSoundEnabled) {
        playNotificationSound();
      }
    });

    const unsubTyping = on('CHAT_TYPING', (evt) => {
      const { conversationId } = evt.payload || {};
      if (String(conversationId) === String(activeConvId)) {
        setIsPartnerTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          setIsPartnerTyping(false);
        }, 3000);
      }
    });

    return () => {
      unsubMsg();
      unsubTyping();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [activeConvId, currentUser?.id, isSoundEnabled, activeConv?.name, activeConv?.initials]);

  // Send text message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText ?? inputText;
    if (!textToSend.trim() || !activeConv || activeConv.isBlocked) return;

    const trimmed = textToSend.trim();
    if (!customText) setInputText('');

    const optimisticId = `m-temp-${Date.now()}`;
    const newMsg: Message = {
      id: optimisticId,
      senderId: String(currentUser?.id || '1'),
      senderName: currentUser?.fullName || 'Bạn',
      senderInitials: 'ME',
      text: trimmed,
      time: t('Vừa xong'),
      isYou: true,
      status: 'sent',
      messageType: 'TEXT',
    };

    setMessages(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg]
    }));

    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === activeConvId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        lastMessage: trimmed,
        lastTime: new Date().toISOString(),
      };
      return updated;
    });

    try {
      const res = await directMessageApi.sendMessage(activeConvId, trimmed);
      setMessages(prev => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map(m => m.id === optimisticId ? { ...m, id: String(res.messageId), status: 'delivered' } : m)
      }));

      if (activeConv.participantId) {
        send('CHAT_MESSAGE_RECEIVED', {
          conversationId: activeConvId,
          senderId: currentUser?.id,
          message: {
            id: res.messageId,
            body: trimmed,
            message_type: 'TEXT',
          }
        }, { recipientId: activeConv.participantId });
      }
    } catch (err) {
      console.warn('Failed to send message via API:', err);
    }
  };

  // Upload and send image to Cloudflare R2
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv || activeConv.isBlocked) return;

    try {
      validateImage(file, 10);
    } catch (err: any) {
      alert(err?.message || 'Ảnh không hợp lệ.');
      return;
    }

    setIsUploadingImage(true);
    const localBlobUrl = URL.createObjectURL(file);
    const optimisticId = `m-img-${Date.now()}`;
    const newMsg: Message = {
      id: optimisticId,
      senderId: String(currentUser?.id || '1'),
      senderName: currentUser?.fullName || 'Bạn',
      senderInitials: 'ME',
      text: '',
      time: t('Vừa xong'),
      isYou: true,
      status: 'sent',
      messageType: 'IMAGE',
      attachmentUrl: localBlobUrl,
    };

    setMessages(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg]
    }));

    try {
      const uploadedMedia = await contentMediaApi.uploadMedia(file, 'ATTACHMENT');
      const finalR2Url = uploadedMedia.publicUrl;

      if (!finalR2Url) throw new Error('Không nhận được URL ảnh từ server');

      const res = await directMessageApi.sendMessage(activeConvId, {
        body: '',
        messageType: 'IMAGE',
        attachmentUrl: finalR2Url,
      });

      setMessages(prev => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map(m => m.id === optimisticId ? {
          ...m,
          id: String(res.messageId),
          attachmentUrl: finalR2Url,
          status: 'delivered'
        } : m)
      }));

      if (activeConv.participantId) {
        send('CHAT_MESSAGE_RECEIVED', {
          conversationId: activeConvId,
          senderId: currentUser?.id,
          message: {
            id: res.messageId,
            body: '',
            message_type: 'IMAGE',
            attachment_url: finalR2Url,
          }
        }, { recipientId: activeConv.participantId });
      }
    } catch (err) {
      console.warn('Failed to upload & send image:', err);
      alert(t('Không thể tải ảnh lên. Vui lòng thử lại.'));
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Send GIF
  const handleSelectGif = async (gifUrl: string) => {
    if (!activeConv || activeConv.isBlocked) return;
    setShowGifPicker(false);

    const optimisticId = `m-gif-${Date.now()}`;
    const newMsg: Message = {
      id: optimisticId,
      senderId: String(currentUser?.id || '1'),
      senderName: currentUser?.fullName || 'Bạn',
      senderInitials: 'ME',
      text: '',
      time: t('Vừa xong'),
      isYou: true,
      status: 'sent',
      messageType: 'GIF',
      attachmentUrl: gifUrl,
    };

    setMessages(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg]
    }));

    try {
      const res = await directMessageApi.sendMessage(activeConvId, {
        body: '',
        messageType: 'GIF',
        attachmentUrl: gifUrl,
      });

      setMessages(prev => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map(m => m.id === optimisticId ? { ...m, id: String(res.messageId), status: 'delivered' } : m)
      }));
    } catch (err) {
      console.warn('Failed to send GIF:', err);
    }
  };

  const executeDeleteMessage = async () => {
    if (!confirmDeleteMsgId || !activeConvId) return;
    const msgId = confirmDeleteMsgId;
    setMessages(prev => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).filter(m => m.id !== msgId)
    }));
    setConfirmDeleteMsgId(null);
    try {
      await directMessageApi.deleteMessage(activeConvId, msgId);
    } catch (err) {
      console.warn('Failed to delete message on backend:', err);
    }
  };

  const executeBlockUser = async () => {
    if (!confirmBlockConv) return;
    const target = confirmBlockConv;
    setConversations(prev => prev.map(c =>
      c.id === target.id ? { ...c, isBlocked: true } : c
    ));
    setBlockedList(prev => [
      ...prev,
      {
        blockId: Date.now(),
        userId: target.participantId,
        name: target.name,
        studentCode: target.studentId,
        reason: 'Chặn tin nhắn trực tiếp',
        blockedAt: 'Hôm nay',
      }
    ]);
    setConfirmBlockConv(null);
    setIsOptionsOpen(false);
    try {
      await directMessageApi.blockUser(target.participantId, t("Chặn tin nhắn trực tiếp"));
    } catch (err) {
      console.warn('Backend block user notice:', err);
    }
  };

  const executeUnblockUser = async () => {
    if (!confirmUnblockItem) return;
    const item = confirmUnblockItem;
    setBlockedList(prev => prev.filter(b => b.blockId !== item.blockId));
    setConversations(prev => prev.map(c =>
      String(c.participantId) === String(item.userId) ? { ...c, isBlocked: false } : c
    ));
    setConfirmUnblockItem(null);
    try {
      await directMessageApi.unblockUser(item.blockId);
    } catch (err) {
      console.warn('Backend unblock user notice:', err);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.courseTag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadTotal = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="space-y-3 w-full h-[calc(100vh-140px)] flex flex-col min-h-[520px] pb-0">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageFileSelect}
      />

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#181C22] dark:text-slate-100">{t('messages.title', 'Messages')}</h1>
            {unreadTotal > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF5FF] dark:bg-blue-950/60 text-[#0076D1] dark:text-blue-400 border border-[#BFDBFE] dark:border-blue-800">
                {unreadTotal} {t('messages.unread', 'chưa đọc')}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('messages.subtitle', 'Trao đổi trực tiếp theo thời gian thực, học nhóm và hướng dẫn đồ án.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Blocked Users Button */}
          <button
            id="btn-blocked-users"
            type="button"
            onClick={() => setShowBlockedModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5 text-red-500" />
            <span>{t('messages.blockedUsers', 'Đã chặn')} ({blockedList.length})</span>
          </button>
        </div>
      </div>

      {/* Main Messaging Container: Split layout with Conversations, Chat Pane and Media Drawer */}
      <div className="flex bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex-1 min-h-0 h-full">
        {/* Left Column: Conversations List */}
        <div
          id="conversations-sidebar"
          className={`${
            activeConvId ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex-col h-full bg-slate-50/40 dark:bg-slate-900/40 shrink-0`}
        >
          {/* Search Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-conversations-input"
                type="text"
                placeholder={t('messages.searchPlaceholder', 'Tìm tin nhắn, bạn học hoặc môn học...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0076D1]" />
                <p className="text-xs">{t('messages.loading', 'Đang tải cuộc trò chuyện...')}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-[#0076D1]" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('messages.emptyTitle', 'Chưa có cuộc trò chuyện nào')}
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {t('Theo dõi bạn bè hoặc người hướng dẫn trên trang cá nhân của họ để mở tính năng trò chuyện trực tiếp.')}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    id={`conversation-item-${conv.id}`}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
                    }}
                    className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-[#0076D1]'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {/* Peer Avatar & Status Indicator */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${conv.initialsBg}`}>
                        {conv.initials}
                      </div>
                      {conv.isActiveNow && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </div>

                    {/* Metadata & Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {conv.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatTime(conv.lastTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {conv.studentId}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#0076D1] dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                          {conv.courseTag}
                        </span>
                      </div>

                      <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {conv.lastMessage || t("Chưa có tin nhắn")}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#0076D1] text-white text-[10px] font-bold flex items-center justify-center shrink-0 self-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Middle Column: Active Conversation & Messages */}
        <div
          id="active-conversation-pane"
          className={`${
            activeConvId ? 'flex' : 'hidden md:flex'
          } flex-1 min-w-0 flex-col h-full bg-white dark:bg-slate-900`}
        >
          {activeConv ? (
            <>
              {/* Conversation Header Bar with View Profile & Media Drawer links */}
              <div id="conversation-header" className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setActiveConvId('')}
                    className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg"
                    title={t('common.back', 'Quay lại danh sách')}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Clickable Avatar to View Profile */}
                  <Link
                    to={`/profile/${activeConv.participantId}`}
                    title={t('Xem trang cá nhân của {p0}', undefined, { p0: activeConv.name })}
                    className="relative shrink-0 group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${activeConv.initialsBg} group-hover:ring-2 ring-[#0076D1] transition-all`}>
                      {activeConv.initials}
                    </div>
                    {activeConv.isActiveNow && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </Link>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${activeConv.participantId}`}
                        title={t('Xem trang cá nhân')}
                        className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-[#0076D1] dark:hover:text-blue-400 transition-colors truncate flex items-center gap-1 group"
                      >
                        <span>{activeConv.name}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                      </Link>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#0076D1] dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                        {activeConv.courseTag}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{activeConv.role}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {activeConv.statusText}
                      </span>
                      {isPartnerTyping && (
                        <>
                          <span>•</span>
                          <span className="text-[#0076D1] dark:text-blue-400 font-semibold animate-pulse">
                            {t('messages.typing', 'đang soạn tin...')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Tools on Header */}
                <div className="flex items-center gap-1.5 relative">
                  {/* Toggle Media & Documents Drawer */}
                  <button
                    type="button"
                    onClick={() => setShowMediaPanel(!showMediaPanel)}
                    title={t('Tài liệu & Ảnh đã gửi')}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      showMediaPanel
                        ? 'text-[#0076D1] bg-blue-50 dark:bg-blue-950/60'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FolderArchive className="w-4 h-4" />
                  </button>

                  {/* Sound Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !isSoundEnabled;
                      setIsSoundEnabled(nextVal);
                      if (nextVal) playNotificationSound();
                    }}
                    title={isSoundEnabled ? t('messages.muteSound', 'Tắt âm thanh thông báo') : t('messages.unmuteSound', 'Bật âm thanh thông báo')}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isSoundEnabled
                        ? 'text-[#0076D1] hover:bg-blue-50 dark:hover:bg-blue-950/40'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  </button>

                  {/* 3-dots options menu */}
                  <button
                    type="button"
                    onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isOptionsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-30">
                      {/* View Profile */}
                      <Link
                        to={`/profile/${activeConv.participantId}`}
                        onClick={() => setIsOptionsOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>{t('Xem trang cá nhân')}</span>
                      </Link>

                      {/* View Shared Media & Docs */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowMediaPanel(true);
                          setIsOptionsOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2 cursor-pointer"
                      >
                        <FolderArchive className="w-3.5 h-3.5 text-purple-600" />
                        <span>{t('Ảnh & Tài liệu đã gửi')}</span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                      {/* Block User */}
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmBlockConv(activeConv);
                          setIsOptionsOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{t('messages.blockUser', 'Chặn người dùng này')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/20 dark:bg-slate-900/20">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-20 text-[#0076D1]" />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {t('messages.noHistory', 'Bắt đầu cuộc trò chuyện với')} {activeConv.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t('messages.safeAcademicNotice', 'Mọi trao đổi được bảo vệ theo Quy tắc Học thuật của FHub.')}
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 items-end ${msg.isYou ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        msg.isYou
                          ? 'bg-[#0076D1] text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {msg.senderInitials}
                      </div>

                      {/* Bubble */}
                      <div className={`max-w-[78%] sm:max-w-[65%] space-y-1 ${msg.isYou ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          msg.isYou
                            ? 'bg-[#0076D1] text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-xs'
                        }`}>
                          {/* Image Attachment (Stored in Cloudflare R2) */}
                          {msg.attachmentUrl && (msg.messageType === 'IMAGE' || msg.messageType === 'GIF') && (
                            <div className="mb-2 relative group overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950">
                              <img
                                src={normalizeMediaUrl(msg.attachmentUrl)}
                                alt="Attachment"
                                className="max-h-60 sm:max-h-72 w-auto object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => setPreviewLightboxUrl(normalizeMediaUrl(msg.attachmentUrl))}
                              />
                              <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg p-1 text-white">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewLightboxUrl(normalizeMediaUrl(msg.attachmentUrl));
                                  }}
                                  title="Phóng to"
                                  className="p-1 hover:bg-white/20 rounded cursor-pointer"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={normalizeMediaUrl(msg.attachmentUrl)}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Tải về"
                                  className="p-1 hover:bg-white/20 rounded"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Message Body Text */}
                          {msg.text && (
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          )}
                        </div>

                        {/* Meta & Delete Action */}
                        <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${msg.isYou ? 'justify-end' : 'justify-start'}`}>
                          <span>{formatTime(msg.time)}</span>
                          {msg.isYou && (
                            <span>
                              {msg.status === 'read' ? (
                                <CheckCheck className="w-3 h-3 text-[#0076D1] dark:text-blue-400 inline" />
                              ) : (
                                <Check className="w-3 h-3 inline" />
                              )}
                            </span>
                          )}
                          {msg.isYou && (
                            <button
                              id={`btn-delete-msg-${msg.id}`}
                              type="button"
                              onClick={() => setConfirmDeleteMsgId(msg.id)}
                              title={t('messages.deleteMessage', 'Xóa tin nhắn')}
                              className="text-slate-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Quick Chips */}
              <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  {t('messages.suggestions', 'GỢI Ý:')}
                </span>
                {[
                  "Chào bạn! Cho mình hỏi về bài tập lớn môn này với.",
                  "Bạn có tài liệu ôn thi môn này không, chia sẻ cho mình với?",
                  "Cảm ơn bạn nhiều nhé, giải thích rất dễ hiểu!",
                ].map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => handleSendMessage(sugg)}
                    className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-[#0076D1] dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {sugg}
                  </button>
                ))}
              </div>

              {/* Message Composer Dock */}
              <div id="message-composer" className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
                {/* Uploading progress notification banner */}
                {isUploadingImage && (
                  <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-2 text-xs text-[#0076D1] dark:text-blue-400 font-semibold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('messages.uploadingImageR2', 'Đang tải ảnh lên Cloudflare R2...')}</span>
                  </div>
                )}

                {/* GIF Picker Popover */}
                {showGifPicker && (
                  <div className="absolute bottom-20 left-4 z-40 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 w-80 sm:w-96 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>{t('messages.sendGif', 'Gửi ảnh GIF')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGifPicker(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* GIF search */}
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t('messages.searchGifPlaceholder', 'Tìm kiếm GIF trên Giphy...')}
                        value={gifSearchQuery}
                        onChange={(e) => setGifSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    {/* GIF categories */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none mb-2">
                      {['Thịnh hành', 'Lập trình', 'Vỗ tay', 'Haha', 'Cảm ơn', 'Mèo'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setGifSearchQuery(cat === 'Thịnh hành' ? '' : cat)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-slate-600 whitespace-nowrap cursor-pointer"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* GIF Results Grid */}
                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {isLoadingGifs ? (
                        <div className="col-span-2 py-8 text-center text-slate-400 text-xs">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-purple-600" />
                          <span>{t('common.loading', 'Đang tìm kiếm...')}</span>
                        </div>
                      ) : gifResults.length === 0 ? (
                        <div className="col-span-2 py-6 text-center text-slate-400 text-xs">
                          <span>{t('messages.noGifFound', 'Không tìm thấy GIF phù hợp')}</span>
                        </div>
                      ) : (
                        gifResults.map(gif => (
                          <div
                            key={gif.id}
                            onClick={() => handleSelectGif(gif.url)}
                            className="h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer hover:scale-105 transition-transform"
                          >
                            <img src={gif.url} alt={gif.title} className="w-full h-full object-cover" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    id="message-composer-input"
                    rows={2}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (activeConv && activeConv.participantId) {
                        send('CHAT_TYPING', { conversationId: activeConvId }, { recipientId: activeConv.participantId });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={t('messages.composerPlaceholder', 'Nhập tin nhắn... (Nhấn Enter để gửi, Shift + Enter để xuống dòng)')}
                    className="w-full p-3 pr-24 pl-24 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] resize-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />

                  {/* Left Attachment Actions (Image & GIF) */}
                  <div className="absolute left-3 bottom-3 flex items-center gap-1.5">
                    {/* Send Image (R2) */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      title={t('messages.sendImageTooltip', 'Gửi ảnh (Lưu trữ Cloudflare R2)')}
                      className="p-1.5 text-slate-500 hover:text-[#0076D1] hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>

                    {/* GIF Picker Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowGifPicker(!showGifPicker)}
                      title={t('messages.sendGifTooltip', 'Gửi ảnh GIF động')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        showGifPicker
                          ? 'text-purple-600 bg-purple-50 dark:bg-purple-950/60'
                          : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Send Action Button */}
                  <button
                    id="btn-send-message"
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    className="absolute right-3 bottom-3 p-2 bg-[#0076D1] hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8 space-y-3">
              <MessageSquare className="w-12 h-12 opacity-25 text-[#0076D1]" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('messages.selectConversation', 'Chọn một cuộc trò chuyện để bắt đầu')}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                {t('Nhắn tin trực tiếp với bạn học hoặc giảng viên bằng cách theo dõi họ từ trang cá nhân.')}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Shared Media & Documents Drawer */}
        {showMediaPanel && activeConv && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shrink-0 z-20 animate-in slide-in-from-right duration-200">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-100">
                <FolderArchive className="w-4 h-4 text-[#0076D1]" />
                <span>{t('Tài liệu & Ảnh đã gửi')}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaPanel(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs: Ảnh & GIF vs Tài liệu */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 gap-1 bg-slate-50/50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setMediaTab('images')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  mediaTab === 'images'
                    ? 'bg-white dark:bg-slate-800 text-[#0076D1] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('Ảnh & GIF')} ({sharedImages.length})
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('files')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  mediaTab === 'files'
                    ? 'bg-white dark:bg-slate-800 text-[#0076D1] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('Tài liệu')} ({sharedFiles.length})
              </button>
            </div>

            {/* Media list */}
            <div className="flex-1 overflow-y-auto p-3">
              {mediaTab === 'images' ? (
                sharedImages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    {t('Chưa có ảnh nào được chia sẻ trong cuộc trò chuyện.')}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {sharedImages.map((img) => (
                      <div
                        key={img.id}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        onClick={() => setPreviewLightboxUrl(normalizeMediaUrl(img.attachmentUrl))}
                      >
                        <img
                          src={normalizeMediaUrl(img.attachmentUrl)}
                          alt="shared media"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <span className="p-1 text-white bg-black/50 rounded-lg">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                sharedFiles.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    {t('Chưa có tệp tin hoặc tài liệu nào được gửi.')}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sharedFiles.map((file) => (
                      <div key={file.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0076D1] shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {file.text || 'Tài liệu chia sẻ'}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatTime(file.time)}
                            </span>
                          </div>
                        </div>
                        {file.attachmentUrl && (
                          <a
                            href={normalizeMediaUrl(file.attachmentUrl)}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-[#0076D1] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Image Preview Modal */}
      {previewLightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewLightboxUrl(null)}
              className="absolute -top-10 right-0 p-1.5 text-white/80 hover:text-white rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewLightboxUrl}
              alt="Preview"
              className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-3 flex items-center gap-2">
              <a
                href={previewLightboxUrl}
                download
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('Tải về')}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Users Modal */}
      {showBlockedModal && (
        <div id="modal-blocked-users" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t('messages.blockedUsers', 'Danh sách đã chặn')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t("Những người dùng này không thể gửi tin nhắn cho bạn")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBlockedModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {blockedList.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t("Không có người dùng nào bị chặn")}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t("Danh sách chặn của bạn hiện đang trống.")}</p>
                </div>
              ) : (
                blockedList.map(item => (
                  <div key={item.blockId} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.studentCode} • {item.reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmUnblockItem(item)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#0076D1] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer"
                    >
                      {t("Bỏ chặn")}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowBlockedModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                {t("common.close", "Đóng")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Message */}
      {confirmDeleteMsgId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("Xác nhận xóa tin nhắn?")}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("Tin nhắn này sẽ bị xóa khỏi cuộc trò chuyện của cả hai bên và không thể phục hồi.")}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteMsgId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                {t("common.cancel", "Hủy")}
              </button>
              <button
                type="button"
                onClick={executeDeleteMessage}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                {t("Xóa tin nhắn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Block User */}
      {confirmBlockConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60">
                <Ban className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("Chặn người dùng này?")}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("Bạn sẽ không nhận được tin nhắn trực tiếp từ")} <strong>{confirmBlockConv.name}</strong> {t("nữa. Bạn có thể bỏ chặn bất kỳ lúc nào.")}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmBlockConv(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                {t("common.cancel", "Hủy")}
              </button>
              <button
                type="button"
                onClick={executeBlockUser}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                {t("Chặn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Unblock User */}
      {confirmUnblockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#0076D1]">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60">
                <Unlock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("Bỏ chặn người dùng?")}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("Sau khi bỏ chặn, bạn và")} <strong>{confirmUnblockItem.name}</strong> {t("có thể gửi tin nhắn cho nhau bình thường.")}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmUnblockItem(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                {t("common.cancel", "Hủy")}
              </button>
              <button
                type="button"
                onClick={executeUnblockUser}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                {t("Xác nhận bỏ chặn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
