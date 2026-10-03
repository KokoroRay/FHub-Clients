import React, { useState } from 'react';
import { Activity, BellRing, CheckCircle2, AlertTriangle, Send, Server, Cpu, HardDrive } from 'lucide-react';
import { mockHealthStatuses } from '../../services/mockData';
import { ServiceHealthStatus } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Input, Textarea, Select } from '../../components/common/Input';

export const SystemHealthDashboardPage: React.FC = () => {
  const [healthList] = useState<ServiceHealthStatus[]>(mockHealthStatuses);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'INFO' | 'WARNING' | 'ALERT'>('INFO');
  const [isSending, setIsSending] = useState(false);

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertMessage.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      alert(`Đã phát đi thông báo khẩn toàn hệ thống (${alertType}): ${alertTitle}`);
      setAlertTitle('');
      setAlertMessage('');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#2563eb]" />
          <span>System Health Dashboard & Alert Broadcasting</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Giám sát trạng thái hoạt động của các Microservices và phát đi thông báo khẩn cấp toàn hệ thống (Governance Service).
        </p>
      </div>

      {/* System Health Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {healthList.map((svc) => (
          <Card key={svc.serviceName}>
            <CardBody className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{svc.serviceName}</span>
                </div>
                <Badge variant="success" size="sm">99.9%</Badge>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Độ trễ: <strong className="text-emerald-600 font-mono">{svc.latencyMs}ms</strong></span>
                <span>{svc.lastChecked}</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Send System-Wide Alert Section */}
      <Card className="border-amber-200 dark:border-amber-900/60 bg-amber-50/20">
        <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-600" />
            <span>Phát thông báo khẩn toàn trường (Send System-Wide Alert)</span>
          </h3>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSendAlert} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Tiêu đề thông báo cảnh báo"
                  placeholder="Ví dụ: Lịch bảo trì hệ thống học tập FHub định kỳ"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  required
                />
              </div>

              <Select
                label="Mức độ nghiêm trọng"
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as any)}
                options={[
                  { value: 'INFO', label: 'INFO - Thông báo thường' },
                  { value: 'WARNING', label: 'WARNING - Cảnh báo lịch bảo trì' },
                  { value: 'ALERT', label: 'ALERT - Khẩn cấp / Sự cố' },
                ]}
              />
            </div>

            <Textarea
              label="Nội dung chi tiết thông báo hiển thị cho toàn bộ sinh viên"
              placeholder="Nhập nội dung chi tiết..."
              rows={3}
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              required
            />

            <div className="flex justify-end">
              <Button variant="primary" type="submit" isLoading={isSending} leftIcon={<Send className="w-4 h-4" />}>
                Phát đi thông báo toàn hệ thống
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

