import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { mockCampuses } from '../../services/mockData';
import { Campus, CampusCode } from '../../types';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';

export const CampusManagementPage: React.FC = () => {
  const [campuses, setCampuses] = useState<Campus[]>(mockCampuses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);

  const [code, setCode] = useState<CampusCode>('HL');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [studentCount, setStudentCount] = useState('10000');

  const openCreate = () => {
    setEditingCampus(null);
    setCode('HL');
    setName('');
    setLocation('');
    setStudentCount('10000');
    setIsModalOpen(true);
  };

  const openEdit = (campus: Campus) => {
    setEditingCampus(campus);
    setCode(campus.code);
    setName(campus.name);
    setLocation(campus.location);
    setStudentCount(String(campus.studentCount));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa Campus này khỏi hệ thống?')) {
      setCampuses(campuses.filter((c) => c.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCampus) {
      setCampuses(
        campuses.map((c) =>
          c.id === editingCampus.id
            ? { ...c, code, name, location, studentCount: Number(studentCount) || 0 }
            : c
        )
      );
    } else {
      const newCampus: Campus = {
        id: `campus-${Date.now()}`,
        code,
        name,
        location,
        isActive: true,
        studentCount: Number(studentCount) || 0,
      };
      setCampuses([...campuses, newCampus]);
    }
    setIsModalOpen(false);
  };

  const columns: Column<Campus>[] = [
    {
      header: 'Mã Code',
      accessorKey: 'code',
      cell: (item) => <Badge variant="primary" size="md">{item.code}</Badge>,
      className: 'w-24',
    },
    {
      header: 'Tên Campus / Cơ sở',
      accessorKey: 'name',
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
          <p className="text-[11px] text-slate-400 mt-0.5">{item.location}</p>
        </div>
      ),
    },
    {
      header: 'Số sinh viên',
      accessorKey: 'studentCount',
      cell: (item) => <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{item.studentCount.toLocaleString()}</span>,
      className: 'w-32',
    },
    {
      header: 'Trạng thái',
      accessorKey: 'isActive',
      cell: (item) => (
        <Badge variant={item.isActive ? 'success' : 'danger'} size="sm">
          {item.isActive ? 'Active' : 'Disabled'}
        </Badge>
      ),
      className: 'w-28',
    },
    {
      header: 'Hành động',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(item)}
            className="p-1.5 text-slate-500 hover:text-[#005da7] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            title="Chỉnh sửa"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'w-28 text-right',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#005da7]" />
            <span>Campus Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý danh sách các phân hiệu và cơ sở đào tạo FPT University (Academic Taxonomy Service).
          </p>
        </div>

        <Button variant="primary" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Thêm Campus mới
        </Button>
      </div>

      <Table columns={columns} data={campuses} keyExtractor={(c) => c.id} />

      {/* Campus Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCampus ? 'Chỉnh sửa thông tin Campus' : 'Thêm Campus mới'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit}>Lưu thông tin</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Mã Code Campus"
              value={code}
              onChange={(e) => setCode(e.target.value as any)}
              options={[
                { value: 'HL', label: 'HL - Hà Nội (Hòa Lạc)' },
                { value: 'HCM', label: 'HCM - TP. Hồ Chí Minh' },
                { value: 'DN', label: 'DN - Đà Nẵng' },
                { value: 'CT', label: 'CT - Cần Thơ' },
                { value: 'QN', label: 'QN - Quy Nhơn' },
              ]}
            />

            <Input
              label="Quy mô sinh viên"
              type="number"
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
            />
          </div>

          <Input
            label="Tên phân hiệu đầy đủ"
            placeholder="Ví dụ: FPT University Hà Nội"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Địa chỉ chi tiết"
            placeholder="Khu CNC Hòa Lạc, Km29 Đại lộ Thăng Long, Hà Nội"
            rows={3}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
