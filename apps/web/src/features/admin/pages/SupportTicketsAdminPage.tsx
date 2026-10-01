import React, { useState } from 'react';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  ShieldCheck,
  Send,
  Sparkles,
  ChevronRight,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';
import { mockDetailedSupportTickets } from '../../../services/adminMockData';
import { SupportTicket } from '../../../types';

export const SupportTicketsAdminPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockDetailedSupportTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(mockDetailedSupportTickets[0]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [internalNote, setInternalNote] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.author.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleUpdateStatus = (ticketId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
    setSuccessMessage(`Đã cập nhật trạng thái Ticket thành ${newStatus}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    if (selectedTicket) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id ? { ...t, repliesCount: t.repliesCount + 1, status: 'IN_PROGRESS' } : t
        )
      );
      setSuccessMessage('Đã gửi phản hồi chính thức cho người dùng và cập nhật ticket thành IN_PROGRESS');
      setReplyMessage('');
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Helpdesk & Incident Response</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Support Tickets & SLA Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hàng đợi tiếp nhận khiếu nại, báo cáo gian lận và hỗ trợ học vụ 5 campus FPT University.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            Target SLA: &lt; 15 phút
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-600">Urgent Tickets</span>
          <p className="text-xl font-black text-rose-600 mt-0.5">4</p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600">Đang Xử Lý (In Progress)</span>
          <p className="text-xl font-black text-amber-600 mt-0.5">6</p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-sky-600">Đang Mở (Open)</span>
          <p className="text-xl font-black text-sky-600 mt-0.5">14</p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600">Đã Giải Quyết (Resolved)</span>
          <p className="text-xl font-black text-emerald-600 mt-0.5">128</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Mã Ticket (TKT-2026-089), tiêu đề, tên sinh viên..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-44 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">Tất cả Trạng thái</option>
          <option value="OPEN">OPEN (Chờ tiếp nhận)</option>
          <option value="IN_PROGRESS">IN_PROGRESS (Đang xử lý)</option>
          <option value="RESOLVED">RESOLVED (Đã giải quyết)</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full md:w-44 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">Tất cả Mức ưu tiên</option>
          <option value="URGENT">URGENT (Khẩn cấp)</option>
          <option value="HIGH">HIGH (Ưu tiên cao)</option>
          <option value="MEDIUM">MEDIUM (Trung bình)</option>
          <option value="LOW">LOW (Thấp)</option>
        </select>
      </div>

      {/* 2-Column Split: Ticket List (Left) + Detail & Response Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-5 space-y-3">
          {filteredTickets.map((t) => {
            const isSelected = selectedTicket?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/70 dark:bg-slate-800 border-[#005da7] shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#005da7]">{t.ticketCode}</span>
                  <div className="flex items-center gap-1.5">
                    {t.priority === 'URGENT' && (
                      <span className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-rose-100 text-rose-700">
                        URGENT
                      </span>
                    )}
                    {t.priority === 'HIGH' && (
                      <span className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">
                        HIGH
                      </span>
                    )}
                    {t.priority === 'MEDIUM' && (
                      <span className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-sky-100 text-sky-800">
                        MEDIUM
                      </span>
                    )}
                    {t.priority === 'LOW' && (
                      <span className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-slate-100 text-slate-600">
                        LOW
                      </span>
                    )}

                    <span
                      className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-[#005da7]'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {t.title}
                </h3>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <span>Tác giả: {t.author.fullName}</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> {t.repliesCount} replies
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Ticket Detail & Response Workspace */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6 sticky top-20">
              {/* Ticket Top Info */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#005da7]">{selectedTicket.ticketCode}</span>
                    <span className="text-xs text-slate-400">• Category: {selectedTicket.category}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{selectedTicket.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Gửi bởi: <strong>{selectedTicket.author.fullName}</strong> ({selectedTicket.author.email})
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as any)}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="OPEN">Trạng thái: OPEN</option>
                    <option value="IN_PROGRESS">Trạng thái: IN_PROGRESS</option>
                    <option value="RESOLVED">Trạng thái: RESOLVED</option>
                    <option value="CLOSED">Trạng thái: CLOSED</option>
                  </select>
                </div>
              </div>

              {/* Assigned Staff Info */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#005da7]" />
                  <span>Cán bộ phụ trách tiếp nhận:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedTicket.assignedTo || 'Chưa gán'}</strong>
                </div>
                <button
                  onClick={() => alert('Đã gán cho bạn')}
                  className="text-xs font-bold text-[#005da7] hover:underline cursor-pointer"
                >
                  Nhận xử lý
                </button>
              </div>

              {/* Ticket Response Composer */}
              <form onSubmit={handleSendReply} className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Gửi Phản Hồi Chính Thức (Official Helpdesk Response):
                </label>
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Nhập nội dung giải đáp, hướng dẫn xử lý hoặc quyết định kỷ luật..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005da7]/20"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Phản hồi sẽ được gửi email và notification đến sinh viên.
                  </span>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Phản Hồi</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 text-slate-400 text-xs">
              Chọn một Support Ticket từ danh sách bên trái để xem chi tiết và phản hồi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
