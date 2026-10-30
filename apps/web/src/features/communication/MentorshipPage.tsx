import { useLanguage } from '../../context/LanguageContext';
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
  const { formatDate, t } = useLanguage();
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<MentorshipPairing[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('SWP391');
  const [topic, setTopic] = useState('');
  const [mentorName, setMentorName] = useState('Alumni Mentor');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newReq: MentorshipPairing = {
      id: `m-${Date.now()}`,
      mentorName,
      mentorRole: 'Alumni Mentor',
      menteeName: currentUser?.fullName || t("Sinh viên FHub"),
      topic,
      courseCode,
      status: 'PENDING',
      startDate: new Date().toISOString(),
    };

    setRequests([newReq, ...requests]);
    setIsModalOpen(false);
    setTopic('');
  };

  const handleTerminate = (id: string) => {
    if (confirm(t("Bạn có chắc muốn kết thúc ghép đôi Mentorship này?"))) {
      setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'TERMINATED' } : r)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Users className="w-6 h-6 text-blue-600" />
            <span>{t("Mentorship Pairing Program")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("Kết nối sinh viên với các Cựu sinh viên (Alumni) và Tiền bối đạt danh hiệu xuất sắc để cố vấn học tập & đồ án.")}</p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />} className="shadow-xs">
          {t("Gửi yêu cầu ghép đôi Mentor")}</Button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100 shadow-xs">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold text-slate-700">{t("Chưa có yêu cầu ghép đôi Mentorship nào")}</p>
          <p className="text-xs text-slate-400 mt-1">{t("Nhấn \"Gửi yêu cầu ghép đôi Mentor\" để kết nối với cựu sinh viên.")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardBody className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">{req.courseCode}</Badge>
                  {req.status === 'ACTIVE' ? (
                    <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>{t("Đang diễn ra")}</Badge>
                  ) : req.status === 'PENDING' ? (
                    <Badge variant="warning" size="sm" icon={<Clock className="w-3 h-3" />}>{t("Chờ Mentor xác nhận")}</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">{t("Đã kết thúc")}</Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{req.topic}</h3>
                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <div><strong>{t("Mentor:")}</strong> {req.mentorName} ({req.mentorRole})</div>
                    <div><strong>{t("Mentee:")}</strong> {req.menteeName}</div>
                    <div><strong>{t("Ngày bắt đầu:")}</strong> {formatDate(req.startDate)}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Button variant="outline" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                    {t("Nhắn tin trao đổi")}</Button>
                  {req.status === 'ACTIVE' && (
                    <Button variant="danger" size="sm" onClick={() => handleTerminate(req.id)}>
                      {t("Kết thúc")}</Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("Đăng ký nhận Mentor cố vấn học tập")}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>{t("Hủy")}</Button>
            <Button variant="primary" onClick={handleCreateRequest}>{t("Gửi yêu cầu (+10 Karma)")}</Button>
          </>
        }
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          <Select
            label={t("Chọn Mentor mong muốn")}
            value={mentorName}
            onChange={(e) => setMentorName(e.target.value)}
            options={[
              { value: 'Lê Hoàng Long (Alumni - Senior .NET)', label: t("Lê Hoàng Long (Alumni - Senior .NET Engineer)") },
              { value: 'Phạm Minh Đức (Mod - AI Spec)', label: t("Phạm Minh Đức (Community Moderator - AI Spec)") },
            ]}
          />
          <Input
            label={t("Môn học / Đồ án cần hỗ trợ")}
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />
          <Textarea
            label={t("Mục tiêu & nội dung cần cố vấn")}
            placeholder={t("Nêu rõ khó khăn hiện tại, định hướng đồ án và mong muốn được hỗ trợ...")}
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
