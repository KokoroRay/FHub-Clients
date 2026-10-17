import React, { useState } from 'react';
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
  ExternalLink,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-1',
    participantId: 'p-1',
    name: 'Minh Tran',
    initials: 'MT',
    initialsBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    studentId: 'SE172481',
    courseTag: 'PRN211',
    role: 'Community Member · Software Eng. (Batch 17)',
    statusText: 'Active now',
    isActiveNow: true,
    lastMessage: 'Sure! Which part are you having trouble with?',
    lastTime: '10:42 AM',
    unreadCount: 1,
    taskTitle: 'Assignment 2: Asynchronous Repository Pattern in .NET 8',
    isBlocked: false,
  },
  {
    id: 'conv-2',
    participantId: 'p-2',
    name: 'Linh Nguyen',
    initials: 'LN',
    initialsBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    studentId: 'SE160892',
    courseTag: 'PRN221',
    role: 'Student Mentor · Batch 16',
    statusText: 'Active 2h ago',
    isActiveNow: false,
    lastMessage: 'Can you explain the solution for this problem?',
    lastTime: 'Yesterday',
    unreadCount: 1,
    taskTitle: 'Lab 4: Entity Framework Core Concurrency Resolution',
    isBlocked: false,
  },
  {
    id: 'conv-3',
    participantId: 'p-3',
    name: 'An Pham',
    initials: 'AP',
    initialsBg: 'bg-amber-50 text-amber-700 border-amber-200',
    studentId: 'SE160914',
    courseTag: 'SWP391',
    role: 'Student · SE160914',
    statusText: 'Offline',
    isActiveNow: false,
    lastMessage: 'I have updated the project document.',
    lastTime: 'Mon',
    unreadCount: 0,
    taskTitle: 'Sprint 2 Requirement Specification and Mockups',
    isBlocked: false,
  },
  {
    id: 'conv-4',
    participantId: 'p-4',
    name: 'Khoa Le',
    initials: 'KL',
    initialsBg: 'bg-sky-50 text-sky-700 border-sky-200',
    studentId: 'SE174129',
    courseTag: 'DBI202',
    role: 'Student · SE174129',
    statusText: 'Offline',
    isActiveNow: false,
    lastMessage: "Let's discuss the assignment.",
    lastTime: 'Sun',
    unreadCount: 0,
    taskTitle: 'Midterm Database Schema Optimization Practice',
    isBlocked: false,
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'm-1',
      senderId: 'p-1',
      senderName: 'Minh Tran',
      senderInitials: 'MT',
      text: 'Hi! I saw your question about the programming assignment.',
      time: '10:35 AM',
      isYou: false,
    },
    {
      id: 'm-2',
      senderId: 'you',
      senderName: 'You',
      senderInitials: 'BQ',
      text: 'Hi Minh, could you help me understand the solution for async/await starvation?',
      time: '10:38 AM',
      isYou: true,
      status: 'delivered',
    },
    {
      id: 'm-3',
      senderId: 'p-1',
      senderName: 'Minh Tran',
      senderInitials: 'MT',
      text: 'Sure! Which part are you having trouble with?',
      time: '10:42 AM',
      isYou: false,
    },
  ],
  'conv-2': [
    {
      id: 'm-201',
      senderId: 'p-2',
      senderName: 'Linh Nguyen',
      senderInitials: 'LN',
      text: 'Hey Bao, I reviewed your EF Core query article, great explanation!',
      time: 'Yesterday, 3:20 PM',
      isYou: false,
    },
    {
      id: 'm-202',
      senderId: 'you',
      senderName: 'You',
      senderInitials: 'BQ',
      text: 'Thanks Linh! Glad it helps with the lab assignment.',
      time: 'Yesterday, 3:25 PM',
      isYou: true,
      status: 'read',
    },
    {
      id: 'm-203',
      senderId: 'p-2',
      senderName: 'Linh Nguyen',
      senderInitials: 'LN',
      text: 'Can you explain the solution for this problem?',
      time: 'Yesterday, 4:10 PM',
      isYou: false,
    },
  ],
};

export const DirectMessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const activeMessages = messages[activeConvId] || [];

  const unreadTotal = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const blockedUsers = conversations.filter(c => c.isBlocked);

  const filteredConversations = conversations.filter(c => 
    !c.isBlocked && (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || inputText.trim();
    if (!content || !activeConv || activeConv.isBlocked) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUser?.id || 'you',
      senderName: 'You',
      senderInitials: 'BQ',
      text: content,
      time: 'Just now',
      isYou: true,
      status: 'delivered',
    };

    setMessages(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }));

    setConversations(prev => prev.map(c => 
      c.id === activeConvId 
        ? { ...c, lastMessage: content, lastTime: 'Just now' }
        : c
    ));

    if (!textToSend) setInputText('');
  };

  const handleDeleteMessage = (msgId: string) => {
    setMessages(prev => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).filter(m => m.id !== msgId),
    }));
  };

  const handleToggleBlock = (convId: string) => {
    setConversations(prev => prev.map(c => 
      c.id === convId ? { ...c, isBlocked: !c.isBlocked } : c
    ));
    setIsOptionsOpen(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="space-y-4 w-full pb-12">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#181C22]">Messages</h1>
            {unreadTotal > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF5FF] text-[#0076D1] border border-[#BFDBFE]">
                {unreadTotal} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time peer discussions, course study groups, and assignment mentorship.
          </p>
        </div>

        {blockedUsers.length > 0 && (
          <button
            type="button"
            onClick={() => setShowBlockedModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Ban className="w-3.5 h-3.5 text-red-500" />
            <span>Blocked Users ({blockedUsers.length})</span>
          </button>
        )}
      </div>

      {/* Main Messaging Container: Two-column split layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden h-[680px]">
        {/* Left Column: Conversations List (Figma #105:6068) */}
        <div className="md:col-span-5 lg:col-span-4 border-r border-slate-100 flex flex-col h-full bg-slate-50/30">
          {/* Search Header */}
          <div className="p-3.5 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages, peers, or courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
              />
            </div>
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
                    }}
                    className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50/60 border-l-4 border-[#0076D1]' 
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
                          {conv.lastTime}
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
                        {conv.lastMessage}
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

        {/* Right Column: Active Conversation (Figma #105:6683) */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Conversation Header Bar */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
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
                      <span className="text-emerald-600 font-semibold">{activeConv.statusText}</span>
                      <span>•</span>
                      <span className="truncate">{activeConv.role}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-0.5 text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        Encrypted
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Header Options */}
                <div className="relative flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isOptionsOpen && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 animate-in fade-in">
                      <button
                        type="button"
                        onClick={() => handleToggleBlock(activeConv.id)}
                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{activeConv.isBlocked ? 'Unblock Peer' : 'Block Peer'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Task / Assignment Reference Bar */}
              {activeConv.taskTitle && (
                <div className="px-5 py-2.5 bg-blue-50/50 border-b border-blue-100/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium truncate">
                    Re: <strong className="text-slate-800">{activeConv.taskTitle}</strong>
                  </span>
                  <a href="/courses" className="text-[#0076D1] font-bold hover:underline shrink-0 ml-2">
                    View Task
                  </a>
                </div>
              )}

              {/* Message History Stream */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono text-slate-400 bg-white border border-slate-200 shadow-2xs">
                    Today, October 24
                  </span>
                </div>

                {activeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 group ${msg.isYou ? 'justify-end' : 'justify-start'}`}
                  >
                    {!msg.isYou && (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] border shrink-0 ${activeConv.initialsBg}`}>
                        {msg.senderInitials}
                      </div>
                    )}

                    <div className={`max-w-md space-y-1 ${msg.isYou ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          msg.isYou
                            ? 'bg-[#0076D1] text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      <div className={`flex items-center gap-1.5 px-1 text-[10px] text-slate-400 ${msg.isYou ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.time}</span>
                        {msg.isYou && msg.status && (
                          <span className="flex items-center text-blue-500">
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                        {msg.isYou && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="Delete message"
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity ml-1"
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
              <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  SUGGESTIONS:
                </span>
                {[
                  "I'm stuck on async/await",
                  "Can we do a quick call?",
                  "Thanks for your help!",
                ].map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => handleSuggestionClick(sugg)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-[#0076D1] bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {sugg}
                  </button>
                ))}
              </div>

              {/* Message Composer Dock */}
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message... (Press Enter to send, Shift + Enter for new line)"
                    className="w-full p-3 pr-24 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] resize-none"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      Ctrl + Enter
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim()}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 disabled:opacity-40 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Send</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>FHub Academic Communication Guidelines apply.</span>
                  <span>Replies typically within 15 minutes.</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      </div>

      {/* Blocked Users Modal */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-500" />
                <span>Blocked Peers</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBlockedModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Blocked peers cannot view your online presence or message you directly.
            </p>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {blockedUsers.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{u.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{u.studentId} • {u.courseTag}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleBlock(u.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    <Unlock className="w-3 h-3" />
                    <span>Unblock</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
