import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Paperclip, 
  X, 
  ChevronRight, 
  ArrowLeft,
  Shield, 
  MessageSquare,
  FileText,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentSupportTicketApi, StudentTicketItem as ApiTicketItem } from '../../services/api/studentApi';

const mapApiStatus = (status?: string): SupportTicketItem['status'] => {
  const s = (status || '').toUpperCase();
  if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') return 'In Progress';
  if (s === 'RESOLVED') return 'Resolved';
  if (s === 'CLOSED') return 'Closed';
  return 'Open';
};

const mapApiPriority = (p?: string): SupportTicketItem['priority'] => {
  const val = (p || '').toUpperCase();
  if (val === 'LOW') return 'Low';
  if (val === 'HIGH') return 'High';
  if (val === 'URGENT') return 'Urgent';
  return 'Medium';
};

interface TicketReply {
  id: string;
  senderName: string;
  senderInitials: string;
  senderRole: string;
  isStaff: boolean;
  time: string;
  content: string;
}

interface SupportTicketItem {
  id: string;
  ticketId: string;
  title: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  courseCode?: string;
  createdDate: string;
  updatedDate: string;
  reporterName: string;
  reporterId: string;
  reporterInitials: string;
  description: string;
  replies: TicketReply[];
}

export const SupportTicketsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();

  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(id || null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved' | 'Closed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live tickets from Governance Service
  useEffect(() => {
    let isMounted = true;
    const fetchLiveTickets = async () => {
      try {
        setLoading(true);
        const result = await studentSupportTicketApi.getMyTickets({ pageSize: 50 });
        const items = result?.items || (result as any)?.data || [];
        if (isMounted) {
          if (Array.isArray(items) && items.length > 0) {
            const mapped: SupportTicketItem[] = items.map((t: any) => {
              const ticketIdNum = t.supportTicketId || t.ticketId || t.id;
              return {
                id: String(ticketIdNum),
                ticketId: t.ticketNumber || `#TK-${ticketIdNum}`,
                title: t.subject || t.title || 'Support Request',
                category: t.category || 'General',
                priority: mapApiPriority(t.priority),
                status: mapApiStatus(t.status),
                courseCode: t.courseCode || undefined,
                createdDate: t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo',
                updatedDate: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('vi-VN') : 'Mới cập nhật',
                reporterName: (currentUser as any)?.fullName || (currentUser as any)?.name || 'Sinh viên FHub',
                reporterId: currentUser?.studentId || 'SE-STUDENT',
                reporterInitials: ((currentUser as any)?.fullName || 'SV').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
                description: t.description || '',
                replies: [],
              };
            });

            setTickets(mapped);
          } else {
            setTickets([]);
          }
        }
      } catch (err) {
        console.warn('Failed to load tickets from Governance API:', err);
        if (isMounted) setTickets([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLiveTickets();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Fetch ticket details & messages when selecting a ticket
  useEffect(() => {
    if (!selectedTicketId || selectedTicketId.startsWith('t-')) return;

    const fetchDetail = async () => {
      try {
        const detail = await studentSupportTicketApi.getTicketById(selectedTicketId);
        if (detail && Array.isArray((detail as any).messages)) {
          const apiReplies: TicketReply[] = (detail as any).messages.map((m: any) => ({
            id: String(m.supportTicketMessageId || m.messageId || m.id || Date.now()),
            senderName: m.senderType === 'STAFF' || m.senderRole === 'STAFF' ? 'FHub Academic Support' : 'You',
            senderInitials: m.senderType === 'STAFF' ? 'AT' : 'MH',
            senderRole: m.senderType === 'STAFF' ? 'Staff / Helpdesk' : 'Student',
            isStaff: m.senderType === 'STAFF' || m.senderRole === 'STAFF',
            time: m.sentAt ? new Date(m.sentAt).toLocaleString('en-US') : 'Just now',
            content: m.body || m.content || '',
          }));

          setTickets(prev => prev.map(t => t.id === selectedTicketId ? { ...t, replies: apiReplies } : t));
        }
      } catch (err) {
        console.warn('Failed to fetch full ticket messages from API:', err);
      }
    };

    fetchDetail();
  }, [selectedTicketId]);

  // Create Ticket Modal State (Figma #107:9045)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Study Materials');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newCourseCode, setNewCourseCode] = useState('PRN211');
  const [newDescription, setNewDescription] = useState('');
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);

  // Reply State
  const [replyText, setReplyText] = useState('');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId || t.ticketId === selectedTicketId);

  const filteredTickets = tickets.filter(t => {
    if (activeStatusFilter !== 'All' && t.status !== activeStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.ticketId.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.courseCode && t.courseCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim().length < 5) {
      setCreateErrorMessage('Tiêu đề yêu cầu hỗ trợ cần tối thiểu 5 ký tự.');
      return;
    }
    if (newDescription.trim().length < 20) {
      setCreateErrorMessage('Mô tả chi tiết sự cố cần tối thiểu 20 ký tự để đội ngũ hỗ trợ tiếp nhận chính xác.');
      return;
    }

    setCreateErrorMessage(null);
    setIsSubmitting(true);

    try {
      const createdRes = await studentSupportTicketApi.createTicket({
        title: newTitle.trim(),
        category: newCategory,
        description: newDescription.trim(),
        priority: newPriority.toUpperCase(),
      });

      const newId = String((createdRes as any)?.supportTicketId || (createdRes as any)?.ticketId || Date.now());
      const newTicketNumber = (createdRes as any)?.ticketNumber || `#TK-${Math.floor(1000 + Math.random() * 9000)}`;

      const newTicket: SupportTicketItem = {
        id: newId,
        ticketId: newTicketNumber,
        title: newTitle.trim(),
        category: newCategory,
        priority: newPriority,
        status: 'Open',
        courseCode: newCourseCode.trim() || undefined,
        createdDate: 'Just now',
        updatedDate: 'Just now',
        reporterName: (currentUser as any)?.fullName || (currentUser as any)?.name || 'Sinh viên FHub',
        reporterId: currentUser?.studentId || 'SE172481',
        reporterInitials: ((currentUser as any)?.fullName || 'SV').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
        description: newDescription.trim(),
        replies: [],
      };

      setTickets([newTicket, ...tickets]);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setSelectedTicketId(newTicket.id);
    } catch (err: any) {
      console.warn('API ticket creation failed, falling back to local state:', err);
      const newTicket: SupportTicketItem = {
        id: `t-${Date.now()}`,
        ticketId: `#TK-${Math.floor(1000 + Math.random() * 9000)}`,
        title: newTitle.trim(),
        category: newCategory,
        priority: newPriority,
        status: 'Open',
        courseCode: newCourseCode.trim() || undefined,
        createdDate: 'Just now',
        updatedDate: 'Just now',
        reporterName: (currentUser as any)?.fullName || (currentUser as any)?.name || 'Sinh viên FHub',
        reporterId: currentUser?.studentId || 'SE172481',
        reporterInitials: ((currentUser as any)?.fullName || 'SV').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
        description: newDescription.trim(),
        replies: [],
      };

      setTickets([newTicket, ...tickets]);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setSelectedTicketId(newTicket.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    const messageContent = replyText.trim();
    setReplyText('');

    const userDisplayName = (currentUser as any)?.fullName || (currentUser as any)?.name || 'Bạn';
    const newReply: TicketReply = {
      id: `r-${Date.now()}`,
      senderName: `Bạn (${userDisplayName})`,
      senderInitials: userDisplayName.slice(0, 2).toUpperCase(),
      senderRole: 'Student',
      isStaff: false,
      time: 'Vừa xong',
      content: messageContent,
    };

    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          updatedDate: 'Vừa xong',
          replies: [...t.replies, newReply],
        };
      }
      return t;
    }));

    try {
      await studentSupportTicketApi.addReply(selectedTicket.id, messageContent);
    } catch (err) {
      console.warn('Could not post reply to API:', err);
    }
  };

  const handleUpdateStatus = async (newStatus: SupportTicketItem['status']) => {
    if (!selectedTicket) return;

    setTickets(prev => prev.map(t => 
      t.id === selectedTicket.id ? { ...t, status: newStatus, updatedDate: 'Vừa xong' } : t
    ));

    try {
      await studentSupportTicketApi.updateStatus(selectedTicket.id, newStatus);
    } catch (err) {
      console.warn('Could not update status on API:', err);
    }
  };

  const getStatusBadge = (status: SupportTicketItem['status']) => {
    switch (status) {
      case 'In Progress':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">In Progress</span>;
      case 'Open':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0076D1] border border-blue-200">Open</span>;
      case 'Resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Resolved</span>;
      case 'Closed':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Closed</span>;
    }
  };

  const getPriorityBadge = (priority: SupportTicketItem['priority']) => {
    switch (priority) {
      case 'Urgent':
        return <span className="text-red-700 font-bold">Urgent</span>;
      case 'High':
        return <span className="text-orange-700 font-bold">High</span>;
      case 'Medium':
        return <span className="text-amber-700 font-medium">Medium</span>;
      case 'Low':
      default:
        return <span className="text-slate-600">Low</span>;
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* View 1: Ticket Detail View (Figma #108:9539) */}
      {selectedTicket ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedTicketId(null)}
              className="inline-flex items-center gap-1 text-[#0076D1] font-semibold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Support Tickets</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Ticket ID: <strong>{selectedTicket.ticketId}</strong></span>
          </div>

          {/* Ticket Header Bar (Figma #108:9675) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold text-[#181C22]">
                  {selectedTicket.ticketId}: {selectedTicket.title}
                </h1>
                {getStatusBadge(selectedTicket.status)}
              </div>
              <p className="text-xs text-slate-500">
                Opened in course resource hub under{' '}
                <span className="font-mono font-bold text-[#0076D1]">{selectedTicket.courseCode || 'GEN'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedTicket.status !== 'Closed' ? (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('Closed')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Close Ticket
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('Open')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                >
                  Reopen Ticket
                </button>
              )}
            </div>
          </div>

          {/* Ticket Information Card (Metadata + Detailed Description) (Figma #108:9690) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6">
            {/* 4 Metadata Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-5 border-b border-slate-100 text-xs">
              <div>
                <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  CATEGORY
                </span>
                <span className="font-semibold text-slate-800 block mt-1">
                  {selectedTicket.category}
                </span>
              </div>

              <div>
                <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  PRIORITY
                </span>
                <div className="mt-1">
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>

              <div>
                <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  CREATED / UPDATED
                </span>
                <span className="text-slate-800 font-semibold block mt-1">
                  {selectedTicket.createdDate}
                </span>
                <span className="text-[10px] text-slate-400">
                  Updated {selectedTicket.updatedDate}
                </span>
              </div>

              <div>
                <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  REPORTER
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-[#0076D1] font-bold text-[10px] flex items-center justify-center border border-blue-100">
                    {selectedTicket.reporterInitials}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block text-xs leading-none">
                      {selectedTicket.reporterName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedTicket.reporterId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Original Description */}
            <div className="space-y-2">
              <span className="block font-mono text-xs uppercase font-bold text-slate-500 tracking-wider">
                ORIGINAL DESCRIPTION
              </span>
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                {selectedTicket.description}
              </div>
            </div>
          </div>

          {/* Support Conversation Section (Figma #108:9739) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">Conversation & Updates</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0076D1]">
                  {selectedTicket.replies.length} messages
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Official Support Channel
              </span>
            </div>

            {/* Thread Replies */}
            <div className="space-y-4">
              {selectedTicket.replies.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No replies yet. The support desk will update this ticket within 24 hours.
                </p>
              ) : (
                selectedTicket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                      reply.isStaff
                        ? 'bg-blue-50/40 border-blue-100'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                          {reply.senderInitials}
                        </div>
                        <span className="font-bold text-slate-800">{reply.senderName}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-semibold ${
                          reply.isStaff ? 'bg-blue-100 text-[#0076D1]' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {reply.senderRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{reply.time}</span>
                    </div>

                    <p className="text-slate-700 pl-8">
                      {reply.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Post An Update Composer */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="block font-mono text-xs uppercase font-bold text-slate-500 tracking-wider">
                POST AN UPDATE
              </span>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply to the support team..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] resize-none"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach File</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Send Reply</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Replies are visible to FHub IT Helpdesk and course administrators.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* View 2: Tickets List View (Figma #107:8584) */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#181C22]">Support Helpdesk</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF5FF] text-[#0076D1] border border-[#BFDBFE]">
                  {tickets.length} total tickets
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Submit academic inquiries, report resource issues, and track resolutions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0076D1] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Ticket</span>
            </button>
          </div>

          {/* Filter Bar: Status Tabs + Search */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['All', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map(status => {
                const count = status === 'All' 
                  ? tickets.length 
                  : tickets.filter(t => t.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setActiveStatusFilter(status)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      activeStatusFilter === status
                        ? 'bg-[#0076D1] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <span>{status}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeStatusFilter === status ? 'bg-blue-400 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative pt-1 border-t border-slate-100">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets by title, category, course, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
              />
            </div>
          </div>

          {/* Tickets Cards List */}
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100 shadow-xs">
              <LifeBuoy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold text-slate-700">No support tickets found</p>
              <p className="text-xs text-slate-400 mt-1">Click "Create Ticket" to get help from the academic support desk.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:border-slate-200 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0076D1] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {t.ticketId}
                      </span>
                      {getStatusBadge(t.status)}
                      {t.courseCode && (
                        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {t.courseCode}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {t.createdDate}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#181C22] group-hover:text-[#0076D1] transition-colors truncate">
                      {t.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {t.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <span className="block text-[11px] font-semibold text-slate-600">{t.category}</span>
                      <span className="text-[10px] text-slate-400">Priority: {getPriorityBadge(t.priority)}</span>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.replies.length}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0076D1] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Support Ticket Modal (Figma #107:9045) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#181C22]">Create Support Ticket</h2>
                <p className="text-xs text-slate-500">
                  Submit a request to the FHub academic helpdesk and curriculum moderation team.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
              {createErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{createErrorMessage}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ticket Subject / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Study material link broken, SSO verification issue..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="Study Materials">Study Materials</option>
                    <option value="Academic Issue">Academic Issue</option>
                    <option value="Account & SSO">Account & SSO</option>
                    <option value="Course Review">Course Review</option>
                    <option value="Technical Bug">Technical Bug</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="e.g. PRN211"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the issue in detail, include syllabus week or error screenshot links..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
