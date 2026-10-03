import React, { useState } from 'react';
import { Hash, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';

interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

export const TopicManagementPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([
    { id: '1', name: 'Software Architecture', slug: 'software-architecture', description: 'Kiến trúc phần mềm và microservices', postCount: 142 },
    { id: '2', name: 'Database & SQL', slug: 'database-sql', description: 'Cơ sở dữ liệu quan hệ và NoSQL', postCount: 98 },
    { id: '3', name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'CI/CD, Docker, Kubernetes, Azure', postCount: 75 },
    { id: '4', name: 'Frontend & UI/UX', slug: 'frontend-uiux', description: 'React, Tailwind CSS, Next.js', postCount: 110 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openCreate = () => {
    setEditingTopic(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEdit = (t: Topic) => {
    setEditingTopic(t);
    setName(t.name);
    setDescription(t.description);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa Topic này?')) {
      setTopics(topics.filter((t) => t.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingTopic) {
      setTopics(
        topics.map((t) =>
          t.id === editingTopic.id
            ? { ...t, name, slug: name.toLowerCase().replace(/\s+/g, '-'), description }
            : t
        )
      );
    } else {
      const newTopic: Topic = {
        id: `topic-${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        postCount: 0,
      };
      setTopics([...topics, newTopic]);
    }
    setIsModalOpen(false);
  };

  const columns: Column<Topic>[] = [
    {
      header: 'Tên Topic & Slug',
      accessorKey: 'name',
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-[#2563eb]" /> {item.name}
          </span>
          <span className="text-[11px] font-mono text-slate-400">/{item.slug}</span>
        </div>
      ),
    },
    {
      header: 'Mô tả chủ đề',
      accessorKey: 'description',
      cell: (item) => <span className="text-xs text-slate-600 dark:text-slate-400">{item.description}</span>,
    },
    {
      header: 'Số bài viết',
      accessorKey: 'postCount',
      cell: (item) => <Badge variant="neutral" size="sm">{item.postCount} bài</Badge>,
      className: 'w-28',
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
            <Hash className="w-6 h-6 text-[#2563eb]" />
            <span>Topic Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý các chủ đề bài viết và thảo luận học thuật (Academic Taxonomy Service).
          </p>
        </div>

        <Button variant="primary" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Thêm Topic mới
        </Button>
      </div>

      <Table columns={columns} data={topics} keyExtractor={(t) => t.id} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTopic ? 'Cập nhật Topic' : 'Tạo Topic mới'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit}>Lưu Topic</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Tên chủ đề"
            placeholder="Ví dụ: Cloud & DevOps"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Textarea
            label="Mô tả chủ đề"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};

