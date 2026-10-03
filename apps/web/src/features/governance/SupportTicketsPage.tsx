import React, { useState } from 'react';
import { LifeBuoy, Plus, MessageSquare, AlertCircle, CheckCircle2, Clock, ShieldAlert, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockSupportTickets } from '../../services/mockData';
import { SupportTicket } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Tabs } from '../../components/common/Tabs';

export const SupportTicketsPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'tickets' | 'reports'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>(mockSupportTickets);

  const [reports, setReports] = useState([
    { id: 'rep-1', targetType: 'QUESTION', targetId: 'q-99', reason: 'Ngôn từ xúc phạm, spam quảng cáo khóa học ngoài', reportedBy: 'Trần Thị B', status: 'PENDING', createdAt: '1 giờ trước' },
    { id: 'rep-2', targetType: 'MARKETPLACE', targetId: 'm-88', reason: 'Nghi vấn lừa đảo không giao sách', reportedBy: 'Nguyễn Văn A', status: 'RESOLVED', createdAt: 'Hôm qua' },
  ]);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New ticket state
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'ACCOUNT' | 'ACADEMIC' | 'TECHNICAL' | 'HARASSMENT'>('ACCOUNT');
  const [ticketPriority, setTicketPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [ticketContent, setTicketContent] = useState('');

  // Report state
  const [reportReason, setReportReason] = useState('');
  const [reportTarget, setReportTarget] = useState('Bài viết vi phạm quy chuẩn');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim()) return;

    const newT: SupportTicket = {
      id: `t-${Date.now()}`,
      ticketCode: `TKT-2026-${Math.floor(Math.random() * 900 + 100)}`,
      title: ticketTitle,
      category: ticketCategory,
      status: 'OPEN',
      priority: ticketPriority,
      author: {
        id: currentUser?.id || 'usr-1',
        fullName: currentUser?.fullName || 'Sinh viên FHub',
        email: currentUser?.email || 'student@fpt.edu.vn',
      },
      repliesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTickets([newT, ...tickets]);
    setIsTicketModalOpen(false);
    setTicketTitle('');
    setTicketContent('');
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    setReports([
      {
        id: `rep-${Date.now()}`,
        targetType: 'POST',
        targetId: 'post-new',
        reason: reportReason,
        reportedBy: currentUser?.fullName || 'Sinh viên',
        status: 'PENDING',
        createdAt: 'Vừa xong',
      },
      ...reports,
    ]);

    setIsReportModalOpen(false);
    setReportReason('');
  };

  const handleResolveReport = (repId: string) => {
    setReports(reports.map((r) => (r.id === repId ? { ...r, status: 'RESOLVED' } : r)));
  };

  const ticketColumns: Column<SupportTicket>[] = [
    {
      header: 'Mã Ticket & Tiêu đề',
      cell: (item) => (
        <div>
          <span className="font-mono font-bold text-blue-600 text-xs">{item.ticketCode}</span>
          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.title}</h4>
          <span className="text-[10px] text-slate-400">Tạo bởi: {item.author.fullName} ({item.author.email})</span>
        </div>
      ),
    },
    {
      header: 'Phân loại',
      accessorKey: 'category',
      cell: (item) => <Badge variant="neutral" size="sm">{item.category}</Badge>,
      className: 'w-28',
    },
    {
      header: 'Mức độ',
      accessorKey: 'priority',
      cell: (item) => (
        <Badge variant={item.priority === 'URGENT' || item.priority === 'HIGH' ? 'danger' : 'warning'} size="sm">
          {item.priority}
        </Badge>
      ),
      className: 'w-24',
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      cell: (item) => (
        <Badge variant={item.status === 'RESOLVED' ? 'success' : item.status === 'IN_PROGRESS' ? 'primary' : 'warning'} size="sm">
          {item.status}
        </Badge>
      ),
      className: 'w-28',
    },
    {
      header: 'Thao tác',
      cell: (item) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(item)}>
          Xem & Trả lời
        </Button>
      ),
      className: 'w-28 text-right',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <LifeBuoy className="w-6 h-6 text-blue-600" />
            <span>Support Tickets & Violation Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gửi yêu cầu trợ giúp kỹ thuật, khiếu nại tài khoản và báo cáo vi phạm nội dung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsReportModalOpen(true)} leftIcon={<ShieldAlert className="w-4 h-4 text-rose-500" />}>
            Báo cáo vi phạm (Report)
          </Button>
          <Button variant="primary" onClick={() => setIsTicketModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />} className="shadow-xs">
            Tạo Ticket hỗ trợ
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'tickets', label: 'Tickets Hỗ trợ người dùng', count: tickets.length, icon: <LifeBuoy className="w-4 h-4" /> },
          { id: 'reports', label: 'Hàng đợi Báo cáo vi phạm (Reports)', count: reports.length, icon: <ShieldAlert className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      {activeTab === 'tickets' ? (
        <Table columns={ticketColumns} data={tickets} keyExtractor={(t) => t.id} />
      ) : (
        <div className="space-y-3">
          {reports.map((rep) => (
            <Card key={rep.id}>
              <CardBody className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="danger" size="sm">{rep.targetType}</Badge>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">Lý do: {rep.reason}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Báo cáo bởi {rep.reportedBy} • {rep.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={rep.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                    {rep.status}
                  </Badge>
                  {rep.status === 'PENDING' && (
                    <Button variant="primary" size="sm" onClick={() => handleResolveReport(rep.id)}>
                      Xử lý xong
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Modal */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Gửi Ticket hỗ trợ kỹ thuật"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsTicketModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateTicket}>Gửi Ticket</Button>
          </>
        }
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <Input
            label="Tiêu đề yêu cầu"
            placeholder="Ví dụ: Không xem được tài liệu môn PRN231"
            value={ticketTitle}
            onChange={(e) => setTicketTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Phân loại vấn đề"
              value={ticketCategory}
              onChange={(e) => setTicketCategory(e.target.value as any)}
              options={[
                { value: 'ACCOUNT', label: 'Tài khoản & Xác minh' },
                { value: 'ACADEMIC', label: 'Học thuật & Môn học' },
                { value: 'TECHNICAL', label: 'Lỗi kỹ thuật hệ thống' },
                { value: 'HARASSMENT', label: 'Bị quấy rối / Spam' },
              ]}
            />
            <Select
              label="Mức độ ưu tiên"
              value={ticketPriority}
              onChange={(e) => setTicketPriority(e.target.value as any)}
              options={[
                { value: 'LOW', label: 'Thấp' },
                { value: 'MEDIUM', label: 'Trung bình' },
                { value: 'HIGH', label: 'Cao' },
                { value: 'URGENT', label: 'Khẩn cấp' },
              ]}
            />
          </div>

          <Textarea
            label="Nội dung chi tiết yêu cầu hỗ trợ"
            placeholder="Mô tả cụ thể sự cố để đội ngũ hỗ trợ xử lý nhanh chóng..."
            rows={4}
            value={ticketContent}
            onChange={(e) => setTicketContent(e.target.value)}
            required
          />
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Báo cáo nội dung vi phạm tiêu chuẩn"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Hủy</Button>
            <Button variant="danger" onClick={handleCreateReport}>Gửi Báo cáo</Button>
          </>
        }
      >
        <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
          <Input
            label="Đối tượng bị báo cáo"
            value={reportTarget}
            onChange={(e) => setReportTarget(e.target.value)}
          />
          <Textarea
            label="Lý do vi phạm cụ thể"
            placeholder="Nêu rõ hành vi spam, xúc phạm, thông tin sai lệch..."
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
