import React, { useState } from 'react';
import { MessageSquare, Send, Search, User, Trash2, ShieldCheck, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockConversations } from '../../services/mockData';
import { DirectMessage, Conversation } from '../../types';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const DirectMessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConvId, setActiveConvId] = useState<string>(mockConversations[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const [messages, setMessages] = useState<Record<string, DirectMessage[]>>({
    'conv-1': [
      { id: 'm1', conversationId: 'conv-1', senderId: 'usr-2', recipientId: 'usr-1', content: 'Chào bạn, mình thấy bạn có đăng bộ giáo trình PRN211 trên Marketplace.', createdAt: '10:40 AM', isRead: true },
      { id: 'm2', conversationId: 'conv-1', senderId: 'usr-1', recipientId: 'usr-2', content: 'Chào bạn! Đúng rồi bạn ơi, sách còn mới 95% có take note bài tập đầy đủ nhé.', createdAt: '10:42 AM', isRead: true },
      { id: 'm3', conversationId: 'conv-1', senderId: 'usr-2', recipientId: 'usr-1', content: 'Bạn ơi còn sách PRN211 không mình qua KTX lấy với ạ?', createdAt: '10:45 AM', isRead: true },
    ],
    'conv-2': [
      { id: 'm4', conversationId: 'conv-2', senderId: 'usr-4', recipientId: 'usr-1', content: 'Chào bạn, bài viết về Dependency Injection của bạn chất lượng rất tốt.', createdAt: 'Hôm qua', isRead: true },
      { id: 'm5', conversationId: 'conv-2', senderId: 'usr-4', recipientId: 'usr-1', content: 'Bài viết của bạn đã được gắn badge Mod Verified nhé!', createdAt: 'Hôm qua', isRead: true },
    ],
  });

  const [inputMessage, setInputMessage] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const activeMessages = messages[activeConvId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConvId,
      senderId: currentUser?.id || 'usr-1',
      recipientId: activeConv.participant.id,
      content: inputMessage,
      createdAt: 'Vừa xong',
      isRead: true,
    };

    setMessages({
      ...messages,
      [activeConvId]: [...activeMessages, newMsg],
    });

    setConversations(
      conversations.map((c) =>
        c.id === activeConvId ? { ...c, lastMessage: inputMessage, lastMessageAt: 'Vừa xong' } : c
      )
    );

    setInputMessage('');
  };

  const handleDeleteMessage = (msgId: string) => {
    setMessages({
      ...messages,
      [activeConvId]: activeMessages.filter((m) => m.id !== msgId),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <span>Direct Messages & Chat Hub</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Nhắn tin trao đổi học tập và mua bán trao đổi tài liệu thời gian thực (Communication Service).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Conversations List Sidebar */}
        <div className="border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm đoạn chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:border-slate-800">
            {conversations.map((c) => {
              const isSelected = c.id === activeConvId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <img src={c.participant.avatarUrl} alt={c.participant.fullName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{c.participant.fullName}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{c.lastMessageAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Main Area */}
        <div className="md:col-span-2 flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={activeConv.participant.avatarUrl} alt={activeConv.participant.fullName} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{activeConv.participant.fullName}</h3>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Trực tuyến
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
            {activeMessages.map((msg) => {
              const isMe = msg.senderId === (currentUser?.id || 'usr-1');
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-xs shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                      {msg.createdAt}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Composer */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <Button variant="primary" type="submit" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Gửi
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
