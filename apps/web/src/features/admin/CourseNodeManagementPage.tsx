import React, { useState } from 'react';
import { Network, Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { mockCourses, mockMajors } from '../../services/mockData';
import { CourseNode } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';

export const CourseNodeManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseNode[]>(mockCourses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseNode | null>(null);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [majorCode, setMajorCode] = useState('SE');
  const [semester, setSemester] = useState('5');
  const [credits, setCredits] = useState('3');

  const openCreate = () => {
    setEditingCourse(null);
    setCode('');
    setTitle('');
    setDescription('');
    setMajorCode('SE');
    setSemester('5');
    setCredits('3');
    setIsModalOpen(true);
  };

  const openEdit = (c: CourseNode) => {
    setEditingCourse(c);
    setCode(c.code);
    setTitle(c.title);
    setDescription(c.description);
    setMajorCode(c.majorCode);
    setSemester(String(c.semester));
    setCredits(String(c.credits));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa Course Node này?')) {
      setCourses(courses.filter((c) => c.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title) return;

    if (editingCourse) {
      setCourses(
        courses.map((c) =>
          c.id === editingCourse.id
            ? {
                ...c,
                code: code.toUpperCase(),
                title,
                description,
                majorCode,
                semester: Number(semester) || 1,
                credits: Number(credits) || 3,
              }
            : c
        )
      );
    } else {
      const newCourse: CourseNode = {
        id: `c-${Date.now()}`,
        code: code.toUpperCase(),
        title,
        description,
        majorCode,
        semester: Number(semester) || 1,
        credits: Number(credits) || 3,
        followerCount: 0,
        discussionCount: 0,
        materialCount: 0,
        workflowCount: 0,
        reviewCount: 0,
        averageRating: 5.0,
      };
      setCourses([newCourse, ...courses]);
    }
    setIsModalOpen(false);
  };

  const columns: Column<CourseNode>[] = [
    {
      header: 'Mã Môn',
      accessorKey: 'code',
      cell: (item) => <Badge variant="primary" size="md">{item.code}</Badge>,
      className: 'w-24',
    },
    {
      header: 'Tên môn học & Mô tả',
      accessorKey: 'title',
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{item.title}</span>
          <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
        </div>
      ),
    },
    {
      header: 'Ngành & Kỳ',
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="purple" size="sm">{item.majorCode}</Badge>
          <span className="text-xs text-slate-500">HK {item.semester}</span>
        </div>
      ),
      className: 'w-32',
    },
    {
      header: 'Tín chỉ',
      accessorKey: 'credits',
      cell: (item) => <span className="font-bold">{item.credits} TC</span>,
      className: 'w-20',
    },
    {
      header: 'Hành động',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(item)}
            className="p-1.5 text-slate-500 hover:text-[#005da7] hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
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
            <Network className="w-6 h-6 text-[#005da7]" />
            <span>Course Node Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý các nút môn học (Course Nodes), metadata và điều kiện tiên quyết.
          </p>
        </div>

        <Button variant="primary" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Thêm Course Node
        </Button>
      </div>

      <Table columns={columns} data={courses} keyExtractor={(c) => c.id} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Cập nhật Course Node' : 'Tạo Course Node mới'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit}>Lưu Course Node</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã môn học (Code)"
              placeholder="PRN211"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Select
              label="Chuyên ngành"
              value={majorCode}
              onChange={(e) => setMajorCode(e.target.value)}
              options={mockMajors.map((m) => ({ value: m.code, label: `${m.code} - ${m.name}` }))}
            />
          </div>

          <Input
            label="Tên môn học đầy đủ"
            placeholder="Basic Cross-Platform Application Programming with .NET"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Học kỳ (Semester 1-9)"
              type="number"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
            <Input
              label="Số tín chỉ (Credits)"
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
            />
          </div>

          <Textarea
            label="Mô tả tóm tắt môn học"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
