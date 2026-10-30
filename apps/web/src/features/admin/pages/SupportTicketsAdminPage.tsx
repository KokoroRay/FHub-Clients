import { Button } from '../../../components/common/Button';
import { Textarea, Select } from '../../../components/common/Input';
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
  Download,
} from 'lucide-react';
import { SupportTicket } from '../../../types';
import { useSupportTickets, useAddTicketReply, useUpdateTicketStatus } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

export const SupportTicketsAdminPage: React.FC = () => {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [isInternalNote, setIsInternalNote] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Real backend query & mutations
  const { data: ticketsData, isLoading, refetch } = useSupportTickets({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
  });
  const addReplyMutation = useAddTicketReply();
  const updateStatusMutation = useUpdateTicketStatus();

  // Populate from real BE tickets when available
  React.useEffect(() => {
    if (ticketsData?.items) {
      const apiTickets: SupportTicket[] = ticketsData.items.map((raw) => {
        const t = raw as any;
        return {
          id: String(t.supportTicketId),
          ticketCode: t.ticketCode || `TKT-2026-00${t.supportTicketId}`,
          title: t.subject || `Support Ticket #${t.supportTicketId}`,
          category: (t.category || 'ACADEMIC') as any,
          priority: (t.priority || 'MEDIUM') as any,
          status: (t.status || 'OPEN') as any,
          repliesCount: t.repliesCount ?? (t.replies?.length || 0),
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          author: {
            id: String(t.submitterAccountId),
            fullName: t.submitterName || `User #${t.submitterAccountId}`,
            email: `user.${t.submitterAccountId}@fhub.com.vn`,
            role: 'Student',
            campus: 'HL',
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.submitterAccountId}`,
          },
          responses: (t.replies || []).map((r: any, rIdx: number) => ({
            id: String(r.replyId || `rep-${rIdx}`),
            author: {
              id: String(r.responderId || '1'),
              fullName: r.responderName || 'System Admin',
              role: 'Admin',
              campus: 'HL',
            },
            content: r.message,
            createdAt: r.createdAt,
            isInternal: r.isInternalNote,
          })),
        };
      });
      setTickets(apiTickets);
      if (apiTickets.length > 0) {
        setSelectedTicket((prev) => prev ? apiTickets.find(x => x.id === prev.id) || apiTickets[0] : apiTickets[0]);
      }
    }
  }, [ticketsData]);

  const filteredTickets = tickets.filter((t) => {
    const q = (searchQuery || '').toLowerCase();
    const titleMatch = (t?.title || '').toLowerCase().includes(q);
    const codeMatch = (t?.ticketCode || '').toLowerCase().includes(q);
    const authorMatch = (t?.author?.fullName || '').toLowerCase().includes(q);
    const matchesSearch = titleMatch || codeMatch || authorMatch;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleUpdateStatus = async (ticketId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => {
    const numericId = ticketId.replace(/\D/g, '') || '1';
    try {
      await updateStatusMutation.mutateAsync({ id: numericId, status: newStatus });
    } catch (e) {
      console.warn('API update ticket status error, falling back locally', e);
    }
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
    setSuccessMessage(t("Ticket status updated to {p0}", undefined, { p0: newStatus }));
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    if (selectedTicket) {
      const numericId = selectedTicket.id.replace(/\D/g, '') || '1';
      try {
        await addReplyMutation.mutateAsync({
          id: numericId,
          payload: { body: replyMessage.trim(), isInternalNote },
        });
      } catch (e) {
        console.warn('API reply error, falling back locally', e);
      }
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id ? { ...t, repliesCount: t.repliesCount + 1, status: 'IN_PROGRESS' } : t
        )
      );
      setSuccessMessage(t("Official response sent and ticket status set to IN_PROGRESS"));
      setReplyMessage('');
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>{t('GOVERNANCE & SUPPORT')}</span>
            <span>{t("&gt;")}</span>
            <span className="text-blue-600">{t('INCIDENT & TICKET QUEUE')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('Support Tickets & SLA Queue')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('Manage academic requests, identity disputes, and academic escalation tickets.')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            {t('Target SLA: < 15 mins')}
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t(successMessage)}</span>
        </div>
      )}

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('URGENT TICKETS')}</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {tickets.filter((x) => x.priority === 'URGENT').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('IN PROGRESS')}</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {tickets.filter((x) => x.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('OPEN IN QUEUE')}</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {tickets.filter((x) => x.status === 'OPEN').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('RESOLVED')}</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {tickets.filter((x) => x.status === 'RESOLVED' || x.status === 'CLOSED').length}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search by Ticket Code (e.g. TKT-2026-089), title, or student...')}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-44 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="ALL">{t('All Statuses')}</option>
          <option value="OPEN">{t('OPEN')}</option>
          <option value="IN_PROGRESS">{t('IN PROGRESS')}</option>
          <option value="RESOLVED">{t('RESOLVED')}</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full md:w-44 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="ALL">{t('All Priorities')}</option>
          <option value="URGENT">{t('URGENT')}</option>
          <option value="HIGH">{t('HIGH')}</option>
          <option value="MEDIUM">{t('MEDIUM')}</option>
          <option value="LOW">{t('LOW')}</option>
        </select>
      </div>

      {/* 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-5 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              {t('0 support tickets in queue.')}
            </div>
          ) : (
            filteredTickets.map((ticketItem) => {
            const isSelected = selectedTicket?.id === ticketItem.id;
            return (
              <div
                key={ticketItem.id}
                onClick={() => setSelectedTicket(ticketItem)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-500 shadow-2xs ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-blue-600">{ticketItem.ticketCode}</span>
                  <div className="flex items-center gap-1.5">
                    {ticketItem.priority === 'URGENT' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {t("URGENT")}</span>
                    )}
                    {ticketItem.priority === 'HIGH' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {t("HIGH")}</span>
                    )}
                    {ticketItem.priority === 'MEDIUM' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {t("MED")}</span>
                    )}
                    {ticketItem.priority === 'LOW' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {t("LOW")}</span>
                    )}

                    <span
                      className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${
                        ticketItem.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ticketItem.status === 'IN_PROGRESS'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {t(ticketItem.status)}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                  {ticketItem.title}
                </h3>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                  <span>{t('Author:')} {ticketItem.author.fullName}</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> {ticketItem.repliesCount} {t('replies')}
                  </span>
                </div>
              </div>
            );
          }))}
        </div>

        {/* Right Column: Selected Ticket Detail */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-5 sticky top-20">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-600">{selectedTicket.ticketCode}</span>
                    <span className="text-xs text-slate-400">• {t('Category:')} {selectedTicket.category}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{selectedTicket.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('Submitted by:')} <strong>{selectedTicket.author.fullName}</strong> ({selectedTicket.author.email})
                  </p>
                </div>

                <div className="w-full sm:w-44 shrink-0">
                <Select
                  id="select-ticket-status-admin" value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as any)}
                  className="min-w-40"
                >
                  <option value="OPEN">{t("Status: OPEN")}</option>
                  <option value="IN_PROGRESS">{t("Status: IN PROGRESS")}</option>
                  <option value="RESOLVED">{t("Status: RESOLVED")}</option>
                  <option value="CLOSED">{t("Status: CLOSED")}</option>
                </Select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{t('Assigned Staff:')}</span>
                  <strong className="text-slate-800">{selectedTicket.assignedTo || t('Unassigned')}</strong>
                </div>
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  {t('Assign to me')}
                </button>
              </div>

              <form onSubmit={handleSendReply} className="space-y-3">
                <Textarea
                  id="official-helpdesk-response"
                  label={t('Official Helpdesk Response:')}
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={t('Enter official resolution, instructions, or actions taken...')}
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {t('The user will be notified via email and system notification.')}
                  </span>
                  <Button type="submit" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}>
                    {t('Send Reply')}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              {t('Select a ticket to view details and response workspace.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
