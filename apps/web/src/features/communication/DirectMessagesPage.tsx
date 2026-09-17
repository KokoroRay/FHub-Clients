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
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#005da7]" />
          <span>Direct Messages & Chat Hub</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
                className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-[#005da7]"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
            {conversations.map((c) => {
              const isSelected = c.id === activeConvId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-sky-50/70 dark:bg-sky-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="relative">
                    <img src={c.participant.avatarUrl} alt={c.participant.fullName} className="w-10 h-10 rounded-full object-cover" />
                    {c.participant.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{c.participant.fullName}</span>
                      <span className="text-[10px] text-slate-400">{c.lastMessageAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/40">
          {/* Chat Header */}
          <div className="p-3.5 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <img src={activeConv.participant.avatarUrl} alt={activeConv.participant.fullName} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{activeConv.participant.fullName}</span>
                  <Badge variant="purple" size="sm">{activeConv.participant.role}</Badge>
                </h4>
                <span className="text-[10px] text-emerald-600 font-semibold">Đang hoạt động</span>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            {activeMessages.map((msg) => {
              const isMine = msg.senderId === (currentUser?.id || 'usr-1');
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                  <div className="max-w-[75%] space-y-1">
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMine
                          ? 'bg-[#005da7] text-white rounded-br-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/80 dark:border-slate-700 shadow-2xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <span>{msg.createdAt}</span>
                      {isMine && <CheckCheck className="w-3 h-3 text-[#005da7]" />}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#005da7]"
            />
            <Button variant="primary" type="submit">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
