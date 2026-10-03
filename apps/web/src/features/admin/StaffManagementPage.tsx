import React, { useState } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Mail, Shield, MapPin } from 'lucide-react';
import { CampusCode } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';

interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  department: string;
  campus: CampusCode;
  role: 'Staff' | 'Admin';
  isActive: boolean;
  createdAt: string;
}

export const StaffManagementPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffUser[]>([
    { id: 'st-1', fullName: 'Ngô Thanh Tùng', email: 'tungnt.staff@fpt.edu.vn', department: 'Phòng Quản lý Đào tạo', campus: 'HL', role: 'Staff', isActive: true, createdAt: '2025-08-01' },
    { id: 'st-2', fullName: 'Trần Hương Ly', email: 'lyth.staff@fpt.edu.vn', department: 'Phòng Công tác Sinh viên (IC-PDP)', campus: 'HCM', role: 'Staff', isActive: true, createdAt: '2025-09-15' },
    { id: 'st-3', fullName: 'Admin Quản trị viên', email: 'admin.fhub@fpt.edu.vn', department: 'Trung tâm Phát triển CNTT', campus: 'HL', role: 'Admin', isActive: true, createdAt: '2025-01-01' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Phòng Quản lý Đào tạo');
  const [campus, setCampus] = useState<CampusCode>('HL');
  const [role, setRole] = useState<'Staff' | 'Admin'>('Staff');

  const openCreate = () => {
    setEditingStaff(null);
    setFullName('');
    setEmail('');
    setDepartment('Phòng Quản lý Đào tạo');
    setCampus('HL');
    setRole('Staff');
    setIsModalOpen(true);
  };

  const openEdit = (st: StaffUser) => {
    setEditingStaff(st);
    setFullName(st.fullName);
    setEmail(st.email);
    setDepartment(st.department);
    setCampus(st.campus);
    setRole(st.role);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa tài khoản Staff này?')) {
      setStaffList(staffList.filter((s) => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    if (editingStaff) {
      setStaffList(
        staffList.map((s) =>
          s.id === editingStaff.id ? { ...s, fullName, email, department, campus, role } : s
        )
      );
    } else {
      const newStaff: StaffUser = {
        id: `st-${Date.now()}`,
        fullName,
        email,
        department,
        campus,
        role,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setStaffList([...staffList, newStaff]);
    }
    setIsModalOpen(false);
  };

  const columns: Column<StaffUser>[] = [
    {
      header: 'Cán bộ Staff',
      accessorKey: 'fullName',
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{item.fullName}</span>
          <span className="text-[11px] text-slate-400 block font-mono">{item.email}</span>
        </div>
      ),
    },
    {
      header: 'Phòng ban / Đơn vị',
      accessorKey: 'department',
      cell: (item) => <span className="text-xs text-slate-600 dark:text-slate-300">{item.department}</span>,
    },
    {
      header: 'Cơ sở Campus',
      accessorKey: 'campus',
      cell: (item) => <Badge variant="neutral" size="sm">{item.campus}</Badge>,
      className: 'w-28',
    },
    {
      header: 'Vai trò IAM',
      accessorKey: 'role',
      cell: (item) => <Badge variant={item.role === 'Admin' ? 'danger' : 'primary'} size="sm">{item.role}</Badge>,
      className: 'w-24',
    },
    {
      header: 'Hành động',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(item)} className="p-1.5 text-slate-500 hover:text-[#2563eb] hover:bg-slate-100 rounded-lg cursor-pointer">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'w-24 text-right',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#2563eb]" />
            <span>Staff Account Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản trị danh sách tài khoản cán bộ phòng ban (Identity Service).
          </p>
        </div>

        <Button variant="primary" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Thêm Staff mới
        </Button>
      </div>

      <Table columns={columns} data={staffList} keyExtractor={(s) => s.id} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Cập nhật tài khoản Staff' : 'Tạo tài khoản Staff mới'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit}>Lưu thông tin</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Họ và tên cán bộ"
            placeholder="Ngô Thanh Tùng"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Email công vụ (@fpt.edu.vn)"
            placeholder="tungnt.staff@fpt.edu.vn"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Cơ sở công tác"
              value={campus}
              onChange={(e) => setCampus(e.target.value as any)}
              options={[
                { value: 'HL', label: 'HL - Hà Nội' },
                { value: 'HCM', label: 'HCM - TP.HCM' },
                { value: 'DN', label: 'DN - Đà Nẵng' },
                { value: 'CT', label: 'CT - Cần Thơ' },
                { value: 'QN', label: 'QN - Quy Nhơn' },
              ]}
            />
            <Select
              label="Vai trò"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              options={[
                { value: 'Staff', label: 'Staff' },
                { value: 'Admin', label: 'Admin' },
              ]}
            />
          </div>
          <Input
            label="Phòng ban"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};

