import React, { useState } from 'react';
import { ShieldCheck, Lock, Pin, CheckCircle2, AlertTriangle, Layers, Tag, EyeOff, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';

export const ModeratorToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'actions' | 'series' | 'tags'>('actions');

  const [seriesList, setSeriesList] = useState([
    { id: 's1', title: 'ASP.NET Core Master Series', author: 'Lê Hoàng Long (Alumni)', postCount: 5, views: '12.4k' },
    { id: 's2', title: 'Data Structures & Algorithms in Java', author: 'Phạm Minh Đức (Mod)', postCount: 8, views: '28.1k' },
  ]);

  const [semanticTags, setSemanticTags] = useState([
    { id: 't1', name: 'dotnet-8', aliasOf: 'dotnet', count: 420 },
    { id: 't2', name: 'ef-core', aliasOf: 'efcore', count: 310 },
    { id: 't3', name: 'clean-arch', aliasOf: 'clean-architecture', count: 280 },
  ]);

  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [seriesTitle, setSeriesTitle] = useState('');

  const handleCreateSeries = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesTitle.trim()) return;

    setSeriesList([
      ...seriesList,
      { id: `s-${Date.now()}`, title: seriesTitle, author: 'Community Moderator', postCount: 1, views: '100' },
    ]);
    setIsSeriesModalOpen(false);
    setSeriesTitle('');
  };

  const handleMergeTag = (tagId: string) => {
    alert(`Đã hợp nhất Semantic Tag ID ${tagId} theo cây từ khóa chuẩn.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-600" />
          <span>Community Moderator Control Desk</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Công cụ dành cho Điều hành viên diễn đàn: Khóa thảo luận, Ghim bài viết, Quản lý Series và Gộp Semantic Tags.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'actions', label: 'Quy trình kiểm duyệt & Cảnh cáo', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'series', label: 'Quản trị Series bài viết', count: seriesList.length, icon: <Layers className="w-4 h-4" /> },
          { id: 'tags', label: 'Hợp nhất Semantic Tags', count: semanticTags.length, icon: <Tag className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Gửi cảnh cáo vi phạm tới người dùng (Issue Warning)</span>
              </h3>
            </CardHeader>
            <CardBody className="p-5 space-y-3 text-xs">
              <Input label="Email hoặc MSSV người nhận cảnh cáo" placeholder="user@fpt.edu.vn" />
              <Textarea label="Lý do cảnh cáo" rows={3} placeholder="Vi phạm quy tắc đăng bài spam hoặc ngôn từ không chuẩn mực..." />
              <Button variant="danger" size="sm" onClick={() => alert('Đã gửi cảnh cáo chính thức tới sinh viên!')}>
                Phát lệnh cảnh cáo (Strike 1)
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Xác thực Mod Verified nhanh</span>
              </h3>
            </CardHeader>
            <CardBody className="p-5 space-y-3 text-xs">
              <Input label="ID Câu hỏi hoặc ID Câu trả lời" placeholder="q-1 hoặc ans-1" />
              <p className="text-slate-400">
                Gắn nhãn bảo chứng chất lượng chuyên môn giúp sinh viên dễ dàng nhận diện câu trả lời chuẩn xác.
              </p>
              <Button variant="primary" size="sm" onClick={() => alert('Đã cấp nhãn Mod Verified!')}>
                Gắn nhãn Mod Verified
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'series' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Danh sách Series bài viết tuyển chọn</h3>
            <Button variant="primary" size="sm" onClick={() => setIsSeriesModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Tạo Series mới
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seriesList.map((s) => (
              <Card key={s.id}>
                <CardBody className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple" size="sm">{s.postCount} Bài viết</Badge>
                    <span className="text-xs text-slate-400 font-mono">{s.views} views</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{s.title}</h4>
                  <p className="text-xs text-slate-400">Tác giả: {s.author}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tags' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Hợp nhất các Semantic Tag từ đồng nghĩa thành một chuẩn duy nhất để tối ưu hóa tìm kiếm.
          </p>
          {semanticTags.map((t) => (
            <Card key={t.id}>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs font-mono text-slate-800 dark:text-slate-200">#{t.name}</span>
                  <span className="text-xs text-purple-600 font-mono ml-2">→ Hợp nhất vào: #{t.aliasOf}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Áp dụng cho {t.count} bài viết</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleMergeTag(t.id)}>
                  Thực hiện gộp Tag
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Series Modal */}
      <Modal
        isOpen={isSeriesModalOpen}
        onClose={() => setIsSeriesModalOpen(false)}
        title="Tạo Tuyển tập Series bài viết mới"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSeriesModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateSeries}>Tạo Series</Button>
          </>
        }
      >
        <form onSubmit={handleCreateSeries} className="space-y-4 text-xs">
          <Input
            label="Tên Tuyển tập Series"
            placeholder="Ví dụ: Lộ trình chinh phục Đồ án Tốt nghiệp Capstone"
            value={seriesTitle}
            onChange={(e) => setSeriesTitle(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
