import React, { useState } from 'react';
import { Users, Search, Shield, Ban, VolumeX, Trash2, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { User } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';

export const UserAccountsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'u-1',
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana.se@fpt.edu.vn',
      studentId: 'HE163421',
      campus: 'HL',
      major: 'Software Engineering',
      role: 'Student',
      karma: 1250,
      status: 'ACTIVE',
      verifiedAt: '2025-09-01',
      badges: [],
    },
    {
      id: 'u-2',
      fullName: 'Trần Thị B',
      email: 'tranb.he172109@fpt.edu.vn',
      studentId: 'HE172109',
      campus: 'HL',
      major: 'Software Engineering',
      role: 'Student',
      karma: 890,
      status: 'ACTIVE',
      verifiedAt: '2025-10-12',
      badges: [],
    },
    {
      id: 'u-3',
      fullName: 'Lê Văn Spam',
      email: 'spammer.acc@gmail.com',
      studentId: 'HE180000',
      campus: 'HCM',
      major: 'Business Administration',
      role: 'Student',
      karma: -50,
      status: 'MUTED',
      badges: [],
    },
    {
      id: 'u-4',
      fullName: 'Hoàng Vi Phạm',
      email: 'violation.user@fpt.edu.vn',
      studentId: 'HE169999',
      campus: 'DN',
      major: 'Information Assurance',
      role: 'Student',
      karma: -200,
      status: 'SUSPENDED',
      badges: [],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleUpdateStatus = (userId: string, newStatus: User['status']) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
  };

  const handleWipeData = (userId: string) => {
    if (confirm('CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn toàn bộ dữ liệu (Wipe Data) của tài khoản này theo quy định bảo vệ dữ liệu. Tiếp tục?')) {
      setUsers(users.filter((u) => u.id !== userId));
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns: Column<User>[] = [
    {
      header: 'Sinh viên / Người dùng',
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
          <span className="font-mono font-bold text-xs">{item.studentId || 'N/A'}</span>
          <span className="text-[10px] text-slate-400 block">{item.campus} • {item.major}</span>
        </div>
      ),
      className: 'w-40',
    },
    {
      header: 'Karma',
      accessorKey: 'karma',
      cell: (item) => (
        <span className={`font-bold font-mono ${item.karma < 0 ? 'text-rose-600' : 'text-[#2563eb]'}`}>
          {item.karma} pts
        </span>
      ),
      className: 'w-24',
    },
    {
      header: 'Trạng thái tài khoản',
      accessorKey: 'status',
      cell: (item) => (
        <Badge
          variant={
            item.status === 'ACTIVE'
              ? 'success'
              : item.status === 'MUTED'
              ? 'warning'
              : item.status === 'SUSPENDED'
              ? 'danger'
              : 'neutral'
          }
          size="sm"
        >
          {item.status}
        </Badge>
      ),
      className: 'w-32',
    },
    {
      header: 'Hành động',
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(item)}>
            <Eye className="w-4 h-4" />
          </Button>
          {item.status === 'ACTIVE' ? (
            <button
              onClick={() => handleUpdateStatus(item.id, 'MUTED')}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
              title="Mute tài khoản"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleUpdateStatus(item.id, 'ACTIVE')}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
              title="Kích hoạt lại"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleUpdateStatus(item.id, 'SUSPENDED')}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
            title="Đình chỉ (Suspend)"
          >
            <Ban className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'w-36 text-right',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#2563eb]" />
            <span>User Account Management & Governance</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản trị trạng thái tài khoản sinh viên, xử lý vi phạm (Mute, Suspend) và xóa sạch dữ liệu Wipe Data (Governance Service).
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, MSSV..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
          />
        </div>
      </div>

      <Table columns={columns} data={filteredUsers} keyExtractor={(u) => u.id} />

      {/* User Detail & Governance Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Chi tiết tài khoản & Thao tác Quản trị"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Đóng</Button>
            {selectedUser && (
              <Button variant="danger" onClick={() => handleWipeData(selectedUser.id)} leftIcon={<Trash2 className="w-4 h-4" />}>
                Xóa sạch dữ liệu (Wipe Data)
              </Button>
            )}
          </>
        }
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{selectedUser.fullName}</h3>
                <p className="text-slate-500">{selectedUser.email}</p>
              </div>
              <Badge variant={selectedUser.status === 'ACTIVE' ? 'success' : 'danger'} size="md">
                {selectedUser.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-xl">
                <span className="text-slate-400 block">Mã số sinh viên:</span>
                <span className="font-bold text-sm">{selectedUser.studentId || 'Chưa cập nhật'}</span>
              </div>
              <div className="p-3 border rounded-xl">
                <span className="text-slate-400 block">Cơ sở Campus:</span>
                <span className="font-bold text-sm">{selectedUser.campus}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="font-bold block">Thay đổi trạng thái tài khoản:</label>
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={() => handleUpdateStatus(selectedUser.id, 'ACTIVE')}>
                  Active (Bình thường)
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(selectedUser.id, 'MUTED')}>
                  Mute (Chặn đăng bài)
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(selectedUser.id, 'SUSPENDED')}>
                  Suspend (Khóa tài khoản)
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

