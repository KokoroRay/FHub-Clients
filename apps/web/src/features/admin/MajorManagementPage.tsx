import React, { useState } from 'react';
import { GraduationCap, Plus, Edit2, Trash2 } from 'lucide-react';
import { mockMajors } from '../../services/mockData';
import { Major } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';

export const MajorManagementPage: React.FC = () => {
  const [majors, setMajors] = useState<Major[]>(mockMajors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openCreate = () => {
    setEditingMajor(null);
    setCode('');
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEdit = (m: Major) => {
    setEditingMajor(m);
    setCode(m.code);
    setName(m.name);
    setDescription(m.description);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa Chuyên ngành này?')) {
      setMajors(majors.filter((m) => m.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    if (editingMajor) {
      setMajors(
        majors.map((m) => (m.id === editingMajor.id ? { ...m, code, name, description } : m))
      );
    } else {
      const newMajor: Major = {
        id: `major-${Date.now()}`,
        code: code.toUpperCase(),
        name,
        description,
        totalCourses: 0,
      };
      setMajors([...majors, newMajor]);
    }
    setIsModalOpen(false);
  };

  const columns: Column<Major>[] = [
    {
      header: 'Mã Ngành',
      accessorKey: 'code',
      cell: (item) => <Badge variant="purple" size="md">{item.code}</Badge>,
      className: 'w-24',
    },
    {
      header: 'Tên chuyên ngành',
      accessorKey: 'name',
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
          <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
        </div>
      ),
    },
    {
      header: 'Tổng số môn học',
      accessorKey: 'totalCourses',
      cell: (item) => <span className="font-bold font-mono">{item.totalCourses} Môn</span>,
      className: 'w-36',
    },
    {
      header: 'Hành động',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(item)}
            className="p-1.5 text-slate-500 hover:text-[#2563eb] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
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
            <GraduationCap className="w-6 h-6 text-[#2563eb]" />
            <span>Major Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý danh sách chuyên ngành đào tạo (Academic Taxonomy Service).
          </p>
        </div>

        <Button variant="primary" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Thêm chuyên ngành
        </Button>
      </div>

      <Table columns={columns} data={majors} keyExtractor={(m) => m.id} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMajor ? 'Chỉnh sửa chuyên ngành' : 'Thêm chuyên ngành mới'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit}>Lưu thông tin</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Mã chuyên ngành (Viết tắt)"
            placeholder="Ví dụ: SE, IA, AI, GD..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <Input
            label="Tên tiếng Anh"
            placeholder="Software Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Mô tả / Tên tiếng Việt"
            placeholder="Kỹ thuật phần mềm"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};

