import React, { useState } from 'react';
import { Users, Plus, CheckCircle2, XCircle, Clock, Award, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';

interface MentorshipPairing {
  id: string;
  mentorName: string;
  mentorRole: string;
  menteeName: string;
  topic: string;
  courseCode: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  startDate: string;
}

export const MentorshipPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<MentorshipPairing[]>([
    {
      id: 'm-1',
      mentorName: 'Lê Hoàng Long',
      mentorRole: 'Alumni (Senior .NET Engineer)',
      menteeName: 'Nguyễn Văn A',
      topic: 'Hướng dẫn kiến trúc Microservices và chuẩn bị phỏng vấn OJT kỳ 6',
      courseCode: 'PRN231 / SWP391',
      status: 'ACTIVE',
      startDate: '01/03/2026',
    },
    {
      id: 'm-2',
      mentorName: 'Phạm Minh Đức',
      mentorRole: 'Community Moderator (AI Specialization)',
      menteeName: 'Trần Thị B',
      topic: 'Tư vấn đồ án tốt nghiệp Capstone Project',
      courseCode: 'SEP490',
      status: 'PENDING',
      startDate: '15/03/2026',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('SWP391');
  const [topic, setTopic] = useState('');
  const [mentorName, setMentorName] = useState('Lê Hoàng Long (Alumni)');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newReq: MentorshipPairing = {
      id: `m-${Date.now()}`,
      mentorName,
      mentorRole: 'Alumni Mentor',
      menteeName: currentUser?.fullName || 'Sinh viên FHub',
      topic,
      courseCode,
      status: 'PENDING',
      startDate: new Date().toLocaleDateString('vi-VN'),
    };

    setRequests([newReq, ...requests]);
    setIsModalOpen(false);
    setTopic('');
  };

  const handleTerminate = (id: string) => {
    if (confirm('Bạn có chắc muốn kết thúc ghép đôi Mentorship này?')) {
      setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'TERMINATED' } : r)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Mentorship Pairing Program</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kết nối sinh viên với các Cựu sinh viên (Alumni) và Tiền bối đạt danh hiệu xuất sắc để cố vấn học tập & đồ án.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />} className="shadow-xs">
          Gửi yêu cầu ghép đôi Mentor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((req) => (
          <Card key={req.id}>
            <CardBody className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="primary" size="sm">{req.courseCode}</Badge>
                {req.status === 'ACTIVE' ? (
                  <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>Đang diễn ra</Badge>
                ) : req.status === 'PENDING' ? (
                  <Badge variant="warning" size="sm" icon={<Clock className="w-3 h-3" />}>Chờ Mentor xác nhận</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">Đã kết thúc</Badge>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{req.topic}</h3>
                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  <div><strong>Mentor:</strong> {req.mentorName} ({req.mentorRole})</div>
                  <div><strong>Mentee:</strong> {req.menteeName}</div>
                  <div><strong>Ngày bắt đầu:</strong> {req.startDate}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button variant="outline" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                  Nhắn tin trao đổi
                </Button>
                {req.status === 'ACTIVE' && (
                  <Button variant="danger" size="sm" onClick={() => handleTerminate(req.id)}>
                    Kết thúc
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Đăng ký nhận Mentor cố vấn học tập"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateRequest}>Gửi yêu cầu (+10 Karma)</Button>
          </>
        }
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          <Select
            label="Chọn Mentor mong muốn"
            value={mentorName}
            onChange={(e) => setMentorName(e.target.value)}
            options={[
              { value: 'Lê Hoàng Long (Alumni - Senior .NET)', label: 'Lê Hoàng Long (Alumni - Senior .NET Engineer)' },
              { value: 'Phạm Minh Đức (Mod - AI Spec)', label: 'Phạm Minh Đức (Community Moderator - AI Spec)' },
            ]}
          />
          <Input
            label="Môn học / Đồ án cần hỗ trợ"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />
          <Textarea
            label="Mục tiêu & nội dung cần cố vấn"
            placeholder="Nêu rõ khó khăn hiện tại, định hướng đồ án và mong muốn được hỗ trợ..."
            rows={4}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
