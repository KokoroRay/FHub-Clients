import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Mail, Shield, MapPin, Search, RefreshCw } from 'lucide-react';
import { CampusCode } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { fetchStaffList, createStaff, updateStaff, deleteStaff } from '../../services/adminDashboardService';

interface StaffUser {
  id: string;
  staffCode?: string;
  fullName: string;
  email: string;
  department: string;
  campus: CampusCode;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const StaffManagementPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffUser[]>([
    { id: '1', staffCode: 'REP001', fullName: 'Ngô Thanh Tùng', email: 'tungnt.staff@fpt.edu.vn', department: 'Phòng Quản lý Đào tạo', campus: 'HL', role: 'SchoolRepresentative', isActive: true, createdAt: '2025-08-01' },
    { id: '2', staffCode: 'MOD001', fullName: 'Trần Hương Ly', email: 'lyth.staff@fpt.edu.vn', department: 'Ban Kiểm duyệt Nội dung', campus: 'HCM', role: 'CommunityModerator', isActive: true, createdAt: '2025-09-15' },
    { id: '3', staffCode: 'ADM001', fullName: 'Admin Quản trị viên', email: 'admin.fhub@fpt.edu.vn', department: 'Trung tâm Phát triển CNTT', campus: 'HL', role: 'Admin', isActive: true, createdAt: '2025-01-01' },
  ]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Phòng Quản lý Đào tạo');
  const [campus, setCampus] = useState<CampusCode>('HL');
  const [role, setRole] = useState<string>('SchoolRepresentative');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchStaffList({
        search: search || undefined,
        role: filterRole || undefined,
      });

      if (res && res.data && Array.isArray(res.data.items)) {
        const mapped: StaffUser[] = res.data.items.map((s: any) => ({
          id: String(s.staffId),
          staffCode: s.staffCode,
          fullName: s.fullName || s.email.split('@')[0],
          email: s.email,
          department: s.department || 'Phòng Quản lý Đào tạo',
          campus: (s.campus as CampusCode) || 'HL',
          role: s.roleCode || s.role || 'SchoolRepresentative',
          isActive: s.isActive ?? true,
          createdAt: s.createdAt ? s.createdAt.split('T')[0] : '2026-01-01',
        }));
        setStaffList(mapped);
      }
    } catch {
      // Keep existing list on offline or fallback
    } finally {
      setLoading(false);
    }
  }, [search, filterRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditingStaff(null);
    setFullName('');
    setEmail('');
    setDepartment('Phòng Quản lý Đào tạo');
    setCampus('HL');
    setRole('SchoolRepresentative');
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

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa tài khoản Staff này?')) {
      try {
        await deleteStaff(id, 'Admin deletion from web portal');
      } catch {
        // Fallback
      }
      setStaffList((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    if (editingStaff) {
      try {
        await updateStaff(editingStaff.id, {
          fullName,
          department,
          campus,
          role,
        });
      } catch {
        // Fallback
      }
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id ? { ...s, fullName, email, department, campus, role } : s
        )
      );
    } else {
      try {
        const created = await createStaff({
          email,
          fullName,
          department,
          campus,
          role,
        });
        if (created?.data?.staffId) {
          const newStaff: StaffUser = {
            id: String(created.data.staffId),
            staffCode: created.data.staffCode,
            fullName,
            email,
            department,
            campus,
            role,
            isActive: true,
            createdAt: new Date().toISOString().split('T')[0],
          };
          setStaffList((prev) => [newStaff, ...prev]);
        } else {
          const fallbackStaff: StaffUser = {
            id: `st-${Date.now()}`,
            fullName,
            email,
            department,
            campus,
            role,
            isActive: true,
            createdAt: new Date().toISOString().split('T')[0],
          };
          setStaffList((prev) => [fallbackStaff, ...prev]);
        }
      } catch {
        const fallbackStaff: StaffUser = {
          id: `st-${Date.now()}`,
          fullName,
          email,
          department,
          campus,
          role,
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setStaffList((prev) => [fallbackStaff, ...prev]);
      }
    }
    setIsModalOpen(false);
  };

  const renderRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case 'Admin':
        return <Badge variant="danger" size="sm">Admin</Badge>;
      case 'CommunityModerator':
        return <Badge variant="warning" size="sm">Moderator</Badge>;
      case 'SchoolRepresentative':
        return <Badge variant="primary" size="sm">School Rep</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{roleCode}</Badge>;
    }
  };

  const columns: Column<StaffUser>[] = [
    {
      header: 'Cán bộ Staff',
      accessorKey: 'fullName',
      cell: (item) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">{item.fullName}</span>
            {item.staffCode && (
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
                {item.staffCode}
              </span>
            )}
          </div>
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
      cell: (item) => renderRoleBadge(item.role),
      className: 'w-32',
    },
    {
      header: 'Hành động',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(item)}
            className="p-1.5 text-slate-500 hover:text-[#2563eb] hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Sửa thông tin"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
            title="Xóa tài khoản"
          >
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
            Quản trị danh sách tài khoản cán bộ vận hành: School Representative, Community Moderator, Admin (Identity Service).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} isLoading={loading} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Làm mới
          </Button>
          <Button variant="primary" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Thêm Staff mới
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, email, mã cán bộ..."
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-56">
          <Select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            options={[
              { value: '', label: 'Tất cả vai trò' },
              { value: 'SchoolRepresentative', label: 'School Representative' },
              { value: 'CommunityModerator', label: 'Community Moderator' },
              { value: 'Admin', label: 'Admin' },
              { value: 'Staff', label: 'Staff chung' },
            ]}
          />
        </div>
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
            disabled={!!editingStaff}
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
              label="Vai trò vận hành"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'SchoolRepresentative', label: 'School Representative' },
                { value: 'CommunityModerator', label: 'Community Moderator' },
                { value: 'Admin', label: 'Administrator' },
                { value: 'Staff', label: 'Staff chung' },
              ]}
            />
          </div>
          <Input
            label="Phòng ban / Ban phụ trách"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Phòng Quản lý Đào tạo"
          />
        </form>
      </Modal>
    </div>
  );
};
