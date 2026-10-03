import React, { useState } from 'react';
import { Megaphone, Plus, Bell, Filter, Calendar, MapPin, Send } from 'lucide-react';
import { mockCampuses } from '../../services/mockData';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';

interface Broadcast {
  id: string;
  title: string;
  content: string;
  senderDept: string;
  targetCampus: string;
  targetMajor: string;
  createdAt: string;
}

export const OfficialBroadcastsPage: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([
    {
      id: 'b-1',
      title: 'Thông báo lịch đăng ký môn học và đóng học phí Học kỳ Summer 2026',
      content: 'Phòng Quản lý Đào tạo thông báo thời gian mở cổng đăng ký môn học bắt đầu từ 08:00 ngày 25/03/2026. Sinh viên vui lòng hoàn tất học phí đúng hạn.',
      senderDept: 'Phòng Quản lý Đào tạo (Academic Dept)',
      targetCampus: 'Toàn bộ 5 Campus',
      targetMajor: 'Tất cả chuyên ngành',
      createdAt: '15/03/2026',
    },
    {
      id: 'b-2',
      title: 'Phát động cuộc thi lập trình FPT Edu Hackathon 2026',
      content: 'Tổng giải thưởng lên tới 500 triệu đồng dành cho các bạn sinh viên đam mê AI và Cloud Native Architecture.',
      senderDept: 'Phòng Công tác Sinh viên (IC-PDP)',
      targetCampus: 'HL, HCM, DN',
      targetMajor: 'SE, IA, AI',
      createdAt: '12/03/2026',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetCampus, setTargetCampus] = useState('ALL');
  const [targetMajor, setTargetMajor] = useState('ALL');

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newB: Broadcast = {
      id: `b-${Date.now()}`,
      title,
      content,
      senderDept: 'Đại diện Nhà trường (School Representative)',
      targetCampus: targetCampus === 'ALL' ? 'Toàn bộ 5 Campus' : targetCampus,
      targetMajor: targetMajor === 'ALL' ? 'Tất cả chuyên ngành' : targetMajor,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    setBroadcasts([newB, ...broadcasts]);
    setIsModalOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <span>Official School Broadcasts & Announcements</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kênh phát thông báo chính thức có định hướng đối tượng theo Campus và Ngành học (School Representative).
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />} className="shadow-xs">
          Phát thông báo chính thức
        </Button>
      </div>

      {/* Broadcasts List */}
      <div className="space-y-4">
        {broadcasts.map((bc) => (
          <Card key={bc.id} className="border-blue-200 dark:border-blue-900 bg-blue-50/20">
            <CardBody className="p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="md">OFFICIAL</Badge>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{bc.senderDept}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Cơ sở: <strong className="text-slate-700 dark:text-slate-300">{bc.targetCampus}</strong></span>
                  <span>• Ngành: <strong className="text-slate-700 dark:text-slate-300">{bc.targetMajor}</strong></span>
                  <span>• {bc.createdAt}</span>
                </div>
              </div>

              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {bc.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {bc.content}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Soạn thông báo chính thức từ Nhà trường"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateBroadcast} leftIcon={<Send className="w-3.5 h-3.5" />}>
              Phát thông báo
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateBroadcast} className="space-y-4 text-xs">
          <Input
            label="Tiêu đề thông báo"
            placeholder="Ví dụ: Thông báo về thời gian nộp đồ án tốt nghiệp Fall 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Cơ sở tiếp nhận"
              value={targetCampus}
              onChange={(e) => setTargetCampus(e.target.value)}
              options={[
                { value: 'ALL', label: 'Toàn bộ 5 Campus' },
                ...mockCampuses.map((c) => ({ value: c.code, label: `${c.code} - ${c.name}` })),
              ]}
            />
            <Select
              label="Chuyên ngành tiếp nhận"
              value={targetMajor}
              onChange={(e) => setTargetMajor(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tất cả chuyên ngành' },
                { value: 'SE', label: 'Kỹ thuật phần mềm (SE)' },
                { value: 'IA', label: 'An toàn thông tin (IA)' },
                { value: 'AI', label: 'Trí tuệ nhân tạo (AI)' },
              ]}
            />
          </div>

          <Textarea
            label="Nội dung thông báo chi tiết"
            placeholder="Nhập nội dung đầy đủ..."
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
