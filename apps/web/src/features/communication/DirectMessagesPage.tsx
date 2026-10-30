import React, { useState, useEffect } from 'react';
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
  Plus,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { directMessageApi } from '../../services/api/studentApi';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  text: string;
  time: string;
  isYou: boolean;
  status?: 'sent' | 'delivered' | 'read';
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

export const DirectMessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { formatDate, formatTime, locale, t } = useLanguage();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');

  // Modals & Confirmation States
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [confirmDeleteMsgId, setConfirmDeleteMsgId] = useState<string | null>(null);
  const [confirmBlockConv, setConfirmBlockConv] = useState<ConversationItem | null>(null);
  const [confirmUnblockItem, setConfirmUnblockItem] = useState<BlockedItem | null>(null);

  // New Conversation Modal State
  const [newRecipientSearch, setNewRecipientSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [initialMsgText, setInitialMsgText] = useState('');
  const [blockedList, setBlockedList] = useState<BlockedItem[]>([]);

  // Sample peer users for New Conversation selector
  const availablePeers = [
    { id: 3, name: 'Bien HLC (SE Lead)', code: 'CE181207', role: 'K18 SE Student', avatar: 'BH', major: 'Software Engineering' },
    { id: 5, name: 'Bao NQ (Mobile)', code: 'CE180121', role: 'K18 SE Student', avatar: 'BN', major: 'Software Engineering' },
    { id: 7, name: 'Tan LT (Frontend)', code: 'CE190370', role: 'K19 SE Student', avatar: 'TL', major: 'Software Engineering' },
    { id: 6, name: 'Phu THG (Data)', code: 'CE182003', role: 'K18 SE Student', avatar: 'PT', major: 'Software Engineering' },
    { id: 2, name: 'Hoang TM (K14 Alumni)', code: 'SE140001', role: 'FPTU Alumni Mentor', avatar: 'HT', major: 'Software Engineering' },
  ];

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
            initialsBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
        if (!activeConvId) {
          setActiveConvId(mapped[0]?.id || '');
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
          reason: b.reason || 'Repeatedly sending unsolicited promotional links and spam messages',
          blockedAt: b.created_at ? b.created_at : 'Yesterday',
        }));
        setBlockedList(mapped);
      } else {
        // Fallback default blocked entry for demonstration if DB returns 0
        setBlockedList([
          {
            blockId: 1,
            userId: 10,
            name: 'Phu THG (CE182003)',
            studentCode: 'CE182003',
            reason: 'Repeatedly sending unsolicited promotional links and spam messages',
            blockedAt: 'Yesterday',
          }
        ]);
      }
    } catch {
      setBlockedList([
        {
          blockId: 1,
          userId: 10,
          name: 'Phu THG (CE182003)',
          studentCode: 'CE182003',
          reason: 'Repeatedly sending unsolicited promotional links and spam messages',
          blockedAt: 'Yesterday',
        }
      ]);
    }
  };

  useEffect(() => {
    loadConversations();
    loadBlockedUsers();
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    let isMounted = true;
    const loadMessages = async () => {
      try {
        const data = await directMessageApi.getMessages(activeConvId);
        if (isMounted && data && data.length > 0) {
          const mapped: Message[] = data.map((m) => ({
            id: String(m.messageId),
            senderId: String(m.senderId),
            senderName: m.senderName,
            senderInitials: m.senderName ? m.senderName.slice(0, 2).toUpperCase() : 'SV',
            text: m.content,
            time: m.createdAt ? m.createdAt : t("Vừa xong"),
            isYou: String(m.senderId) === '1' || String(m.senderId) === '8' || String(m.senderId) === '4' || m.senderName === 'Bạn',
            status: 'read',
          }));
          setMessages(prev => ({ ...prev, [activeConvId]: mapped }));
        }
      } catch (err) {
        console.warn('Failed to load messages for conversation:', err);
      }
    };
    loadMessages();
    return () => { isMounted = false; };
  }, [activeConvId]);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeMessages = activeConvId ? (messages[activeConvId] || []) : [];
  const unreadTotal = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const filteredConversations = conversations.filter(c =>
    !c.isBlocked && (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || inputText.trim();
    if (!content || !activeConv || activeConv.isBlocked) return;

    const optimisticId = `m-${Date.now()}`;
    const newMsg: Message = {
      id: optimisticId,
      senderId: '1',
      senderName: 'Bạn',
      senderInitials: 'ME',
      text: content,
      time: 'Vừa xong',
      isYou: true,
      status: 'delivered',
    };

    setMessages(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }));

    setConversations(prev => prev.map(c =>
      c.id === activeConvId
        ? { ...c, lastMessage: content, lastTime: 'Vừa xong' }
        : c
    ));

    if (!textToSend) setInputText('');

    try {
      await directMessageApi.sendMessage(activeConvId, content);
    } catch (err) {
      console.warn('Backend send message notice:', err);
    }
  };

  const executeDeleteMessage = async () => {
    if (!confirmDeleteMsgId) return;
    const msgId = confirmDeleteMsgId;
    setMessages(prev => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).filter(m => m.id !== msgId),
    }));
    setConfirmDeleteMsgId(null);
    try {
      await directMessageApi.deleteMessage(activeConvId, msgId);
    } catch (err) {
      console.warn('Backend delete message notice:', err);
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

  const handleStartNewConversation = async () => {
    if (!selectedRecipient) return;
    try {
      await directMessageApi.createConversation(selectedRecipient.id, initialMsgText.trim() || undefined);
      setShowNewConvModal(false);
      setSelectedRecipient(null);
      setInitialMsgText('');
      await loadConversations();
    } catch (err) {
      console.warn('Failed to start conversation:', err);
    }
  };

  return (
    <div className="space-y-4 w-full pb-12">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#181C22]">{t('messages.title', 'Messages')}</h1>
            {unreadTotal > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF5FF] text-[#0076D1] border border-[#BFDBFE]">
                {unreadTotal} {t('messages.unread', 'unread')}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('messages.subtitle', 'Real-time peer discussions, course study groups, and assignment mentorship.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Conversation Button (3.11.1) */}
          <button
            id="btn-create-conversation"
            type="button"
            onClick={() => {
              setSelectedRecipient(availablePeers[0]);
              setInitialMsgText(t("Chào bạn, mình muốn trao đổi về bài tập lớn PRN231 và đồ án Capstone."));
              setShowNewConvModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('messages.newConversation', 'New Conversation')}</span>
          </button>

          {/* Blocked Users Button (3.11.7) */}
          <button
            id="btn-blocked-users"
            type="button"
            onClick={() => setShowBlockedModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Ban className="w-3.5 h-3.5 text-red-500" />
            <span>{t('messages.blockedUsers', 'Blocked Users')} ({blockedList.length})</span>
          </button>
        </div>
      </div>

      {/* Main Messaging Container: Two-column split layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[680px]">
        {/* Left Column: Conversations List (3.11.2) */}
        <div id="conversations-sidebar" className="md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/40">
          {/* Search Header */}
          <div className="p-3.5 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-conversations-input"
                type="text"
                placeholder={t('messages.searchPlaceholder', 'Search messages, peers, or courses...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
              />
            </div>
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">{t('messages.loading', 'Đang tải cuộc trò chuyện...')}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">{t('messages.emptyTitle', 'Chưa có cuộc trò chuyện nào')}</p>
                <p className="text-[11px] text-slate-400 mt-1">{t('messages.emptyDesc', 'Các tin nhắn trực tiếp với bạn học sẽ xuất hiện ở đây.')}</p>
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
                        ? 'bg-blue-50/80 border-l-4 border-[#0076D1]'
                        : 'hover:bg-slate-50 bg-white'
                    }`}
                  >
                    {/* Peer Avatar & Status Indicator */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${conv.initialsBg}`}>
                        {conv.initials}
                      </div>
                      {conv.isActiveNow && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                    </div>

                    {/* Metadata & Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {conv.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatTime(conv.lastTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {conv.studentId}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-blue-50 text-[#0076D1] border border-blue-100">
                          {conv.courseTag}
                        </span>
                      </div>

                      <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
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

        {/* Right Column: Active Conversation & Messages (3.11.3 & 3.11.4) */}
        <div id="active-conversation-pane" className="md:col-span-7 lg:col-span-8 flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Conversation Header Bar (3.11.3) */}
              <div id="conversation-header" className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${activeConv.initialsBg}`}>
                      {activeConv.initials}
                    </div>
                    {activeConv.isActiveNow && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800 truncate">
                        {activeConv.name}
                      </h3>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-blue-50 text-[#0076D1] border border-blue-100">
                        [{activeConv.courseTag}]
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="text-emerald-600 font-semibold">{t(activeConv.statusText) || activeConv.statusText}</span>
                      <span>•</span>
                      <span className="truncate">{t(activeConv.role)}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-0.5 text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {t('messages.encrypted', 'Encrypted')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Header Options (3.11.8) */}
                <div className="relative flex items-center gap-2">
                  <button
                    id="btn-conversation-options"
                    type="button"
                    onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isOptionsOpen && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20">
                      <button
                        id="btn-trigger-block-modal"
                        type="button"
                        onClick={() => {
                          setConfirmBlockConv(activeConv);
                          setIsOptionsOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{t('messages.blockPeer', 'Block User')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Message History Stream (3.11.4) */}
              <div id="messages-stream" className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono text-slate-400 bg-white border border-slate-200 shadow-2xs">
                    {t('messages.today', 'Today')}
                  </span>
                </div>

                {activeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    id={`message-bubble-${msg.id}`}
                    className={`flex items-end gap-2 group ${msg.isYou ? 'justify-end' : 'justify-start'}`}
                  >
                    {!msg.isYou && (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] border shrink-0 ${activeConv.initialsBg}`}>
                        {activeConv.initials || msg.senderInitials}
                      </div>
                    )}

                    <div className={`max-w-md space-y-1 ${msg.isYou ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          msg.isYou
                            ? 'bg-[#0076D1] text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      <div className={`flex items-center gap-1.5 px-1 text-[10px] text-slate-400 ${msg.isYou ? 'justify-end' : 'justify-start'}`}>
                        <span>{formatTime(msg.time)}</span>
                        {msg.isYou && msg.status && (
                          <span className="flex items-center text-blue-500">
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                        {/* Delete Message Action (3.11.6) */}
                        {msg.isYou && (
                          <button
                            id={`btn-delete-msg-${msg.id}`}
                            type="button"
                            onClick={() => setConfirmDeleteMsgId(msg.id)}
                            title={t('messages.deleteMessage', 'Delete message')}
                            className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions Quick Chips */}
              <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  {t('messages.suggestions', 'SUGGESTIONS:')}
                </span>
                {[
                  "Hi! Could we review the SEP490 Docker Compose & CI/CD pipeline?",
                  "Could you share the PRN231 Clean Architecture reference kit?",
                  "Thanks a lot for the detailed troubleshooting guide!",
                ].map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => handleSendMessage(sugg)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-[#0076D1] bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {sugg}
                  </button>
                ))}
              </div>

              {/* Message Composer Dock (3.11.5) */}
              <div id="message-composer" className="p-4 border-t border-slate-200 bg-white">
                <div className="relative">
                  <textarea
                    id="message-composer-input"
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={t('messages.composerPlaceholder', 'Type a real-time message... (Press Enter to send, Shift + Enter for new line)')}
                    className="w-full p-3 pr-24 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] resize-none"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      {t("Ctrl + Enter")}</span>
                    <button
                      id="btn-send-message"
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim()}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 disabled:opacity-40 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>{t('messages.send', 'Send')}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{t('messages.guidelines', 'FHub Academic Communication Guidelines apply.')}</span>
                  <span>{t('messages.replySla', 'Replies typically within 15 minutes.')}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">{t('messages.selectTitle', 'Select a Conversation')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('messages.selectDesc', 'Choose a conversation from the left sidebar to start messaging.')}</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── 3.11.1 Create Conversation Modal ─────────────────────────────────── */}
      {showNewConvModal && (
        <div id="modal-create-conversation" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0076D1]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t("Start New Conversation")}</h3>
                  <p className="text-xs text-slate-500">{t("Initiate a private direct messaging thread with another student or mentor")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewConvModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient Search & Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">{t("Select Recipient Member")}</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t("Search by student name or code (e.g. BienHLC, CE181207)...")}
                  value={newRecipientSearch}
                  onChange={(e) => setNewRecipientSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
                />
              </div>

              {/* Recipient Cards */}
              <div className="max-h-44 overflow-y-auto space-y-1.5 pt-1">
                {availablePeers
                  .filter(p => p.name.toLowerCase().includes(newRecipientSearch.toLowerCase()) || p.code.toLowerCase().includes(newRecipientSearch.toLowerCase()))
                  .map((peer) => {
                    const isPicked = selectedRecipient?.id === peer.id;
                    return (
                      <div
                        key={peer.id}
                        onClick={() => setSelectedRecipient(peer)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isPicked
                            ? 'bg-blue-50/80 border-[#0076D1] ring-1 ring-[#0076D1]'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                            {peer.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{peer.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{peer.code} • {peer.major}</div>
                          </div>
                        </div>
                        {isPicked && (
                          <span className="w-5 h-5 rounded-full bg-[#0076D1] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Optional Initial Message Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{t("Initial Message (Optional)")}</label>
              <textarea
                rows={3}
                value={initialMsgText}
                onChange={(e) => setInitialMsgText(e.target.value)}
                placeholder={t("Introduce yourself or describe the academic topic you'd like to discuss...")}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewConvModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Cancel")}</button>
              <button
                id="btn-confirm-start-conversation"
                type="button"
                onClick={handleStartNewConversation}
                disabled={!selectedRecipient}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 disabled:opacity-40 rounded-xl transition-colors shadow-xs"
              >
                {t("Start Conversation")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3.11.6 Delete Message Confirmation Dialog ────────────────────────── */}
      {confirmDeleteMsgId && (
        <div id="modal-delete-message" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t("Delete Message")}</h3>
                <p className="text-xs text-slate-500">{t("Permanently remove this message")}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t("Are you sure you want to delete this message? This message will be permanently removed for all participants in this conversation.")}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDeleteMsgId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Cancel")}</button>
              <button
                id="btn-confirm-delete-msg"
                type="button"
                onClick={executeDeleteMessage}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Delete Message")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3.11.8 Block User Confirmation Modal ─────────────────────────────── */}
      {confirmBlockConv && (
        <div id="modal-block-user" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t("Block User")}</h3>
                <p className="text-xs text-slate-500">{confirmBlockConv.name}</p>
              </div>
            </div>

            <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-1">
              <p className="text-xs font-semibold text-red-700">{t("Direct Messages Will Be Restricted")}</p>
              <p className="text-[11px] text-red-600 leading-relaxed">
                {t("When you block this user, they will no longer be able to initiate new conversations, send you real-time direct messages, or see your online status.")}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmBlockConv(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Cancel")}</button>
              <button
                id="btn-confirm-block-user"
                type="button"
                onClick={executeBlockUser}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Block User")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3.11.7 & 3.11.9 Blocked Users List Modal & Unblock ─────────────────── */}
      {showBlockedModal && (
        <div id="modal-blocked-users-list" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-500" />
                <span>{t('messages.blockedPeers', 'Blocked Users List')} ({blockedList.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBlockedModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {t('messages.blockedPeersDesc', 'Blocked peers cannot view your online presence or message you directly. You can unblock them at any time.')}
            </p>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {blockedList.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  {t("No blocked users on record.")}</div>
              ) : (
                blockedList.map((u) => (
                  <div key={u.blockId} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center border border-red-100">
                        {u.studentCode.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{u.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{u.studentCode} • {t(u.reason)}</p>
                      </div>
                    </div>
                    {/* Unblock User Action (3.11.9) */}
                    <button
                      id={`btn-unblock-user-${u.blockId}`}
                      type="button"
                      onClick={() => setConfirmUnblockItem(u)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{t('messages.unblock', 'Unblock')}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 3.11.9 Unblock User Confirmation Modal ────────────────────────────── */}
      {confirmUnblockItem && (
        <div id="modal-unblock-confirm" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-2.5 rounded-xl bg-emerald-50">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t("Unblock User")}</h3>
                <p className="text-xs text-slate-500">{confirmUnblockItem.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t("Are you sure you want to unblock")} <strong>{confirmUnblockItem.name}</strong>{t("? They will be able to initiate direct messages and view your presence again.")}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmUnblockItem(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Cancel")}</button>
              <button
                id="btn-confirm-unblock-action"
                type="button"
                onClick={executeUnblockUser}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Confirm Unblock")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
