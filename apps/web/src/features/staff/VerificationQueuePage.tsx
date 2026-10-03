import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Eye, FileText, User } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';

interface VerificationRequest {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  campus: string;
  studentCardImageUrl: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const VerificationQueuePage: React.FC = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([
    {
      id: 'req-1',
      fullName: 'Phan Quốc Bảo',
      email: 'baopq.he160234@fpt.edu.vn',
      studentId: 'HE160234',
      campus: 'HL',
      studentCardImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      submittedAt: '10 phút trước',
      status: 'PENDING',
    },
    {
      id: 'req-2',
      fullName: 'Vũ Thị Minh Hạnh',
      email: 'hanhvtm.se170112@fpt.edu.vn',
      studentId: 'SE170112',
      campus: 'HCM',
      studentCardImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      submittedAt: '35 phút trước',
      status: 'PENDING',
    },
  ]);

  const [selectedReq, setSelectedReq] = useState<VerificationRequest | null>(null);

  const handleApprove = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r)));
    setSelectedReq(null);
  };

  const handleReject = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r)));
    setSelectedReq(null);
  };

  const columns: Column<VerificationRequest>[] = [
    {
      header: 'Sinh viên nộp hồ sơ',
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{item.fullName}</span>
          <span className="text-[11px] text-slate-400 block font-mono">{item.email}</span>
        </div>
      ),
    },
    {
      header: 'MSSV & Campus',
      cell: (item) => (
        <div>
          <span className="font-mono font-bold text-xs">{item.studentId}</span>
          <span className="text-[10px] text-slate-400 block">{item.campus} Campus</span>
        </div>
      ),
      className: 'w-36',
    },
    {
      header: 'Thời gian nộp',
      accessorKey: 'submittedAt',
      cell: (item) => <span className="text-xs text-slate-500">{item.submittedAt}</span>,
      className: 'w-32',
    },
    {
      header: 'Trạng thái duyệt',
      accessorKey: 'status',
      cell: (item) => (
        <Badge
          variant={item.status === 'APPROVED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'}
          size="sm"
        >
          {item.status}
        </Badge>
      ),
      className: 'w-32',
    },
    {
      header: 'Duyệt hồ sơ',
      cell: (item) => (
        <Button variant="primary" size="sm" onClick={() => setSelectedReq(item)} leftIcon={<Eye className="w-4 h-4" />}>
          Xem thẻ & Duyệt
        </Button>
      ),
      className: 'w-36 text-right',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#2563eb]" />
            <span>Hàng đợi duyệt xác minh danh tính (KYC Queue)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Xử lý duyệt thẻ sinh viên thủ công để cấp quyền thành viên chính thức FHub (Governance Service).
          </p>
        </div>
      </div>

      <Table columns={columns} data={requests} keyExtractor={(r) => r.id} />

      {/* Verification Details Modal */}
      <Modal
        isOpen={!!selectedReq}
        onClose={() => setSelectedReq(null)}
        title="Duyệt hồ sơ thẻ sinh viên FPT"
        size="lg"
        footer={
          selectedReq?.status === 'PENDING' ? (
            <>
              <Button variant="danger" onClick={() => handleReject(selectedReq.id)} leftIcon={<XCircle className="w-4 h-4" />}>
                Từ chối hồ sơ
              </Button>
              <Button variant="success" onClick={() => handleApprove(selectedReq.id)} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Phê duyệt KYC
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setSelectedReq(null)}>Đóng</Button>
          )
        }
      >
        {selectedReq && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <div><strong>Họ tên:</strong> {selectedReq.fullName}</div>
              <div><strong>Email trường:</strong> {selectedReq.email}</div>
              <div><strong>Mã sinh viên:</strong> {selectedReq.studentId} ({selectedReq.campus} Campus)</div>
            </div>

            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">Ảnh chụp thẻ sinh viên / Thư mời nhập học:</span>
              <div className="h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                <img src={selectedReq.studentCardImageUrl} alt="Student Card" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

