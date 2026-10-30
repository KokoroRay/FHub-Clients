import { useLanguage } from '../../context/LanguageContext';
import React, { useState } from 'react';
import { FileSpreadsheet, Download, Search, Filter, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { mockAuditLogs } from '../../services/mockData';
import { SystemAuditLog } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';

export const SystemAuditLogsPage: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<SystemAuditLog[]>(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<SystemAuditLog | null>(null);

  const handleExportLogs = () => {
    alert(t("Đã tạo và tải về báo cáo System Audit Logs (.csv/.xlsx) thành công!"));
  };

  const handleExportGlobalReport = () => {
    alert(t("Đã xuất báo cáo tổng hợp Global Data Reports toàn hệ thống!"));
  };

  const columns: Column<SystemAuditLog>[] = [
    {
      header: t("Thời gian"),
      accessorKey: 'timestamp',
      cell: (item) => <span className="font-mono text-xs text-slate-500">{item.timestamp}</span>,
      className: 'w-40',
    },
    {
      header: t("Service & Hành động"),
      cell: (item) => (
        <div>
          <div className="flex items-center gap-1.5">
            <Badge variant="primary" size="sm">{item.service}</Badge>
            <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">{item.action}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{item.details}</p>
        </div>
      ),
    },
    {
      header: t("Người thực hiện (Actor)"),
      cell: (item) => (
        <div>
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{item.actorEmail}</span>
          <span className="text-[10px] text-slate-400 block">{t("IP:")} {item.ipAddress}</span>
        </div>
      ),
      className: 'w-48',
    },
    {
      header: t("Trạng thái"),
      accessorKey: 'status',
      cell: (item) => (
        <Badge variant={item.status === 'SUCCESS' ? 'success' : 'danger'} size="sm">
          {t(item.status)}
        </Badge>
      ),
      className: 'w-24',
    },
    {
      header: t("Chi tiết"),
      cell: (item) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(item)}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
      className: 'w-16 text-center',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#2563eb]" />
            <span>{t("System Audit Logs & Reports")}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t("Ghi vết toàn bộ hành vi quản trị, thay đổi cấu hình bảo mật và truy xuất dữ liệu (Interaction Service).")}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportGlobalReport} leftIcon={<Download className="w-4 h-4" />}>
            {t("Export Global Report")}</Button>
          <Button variant="primary" size="sm" onClick={handleExportLogs} leftIcon={<Download className="w-4 h-4" />}>
            {t("Export Audit Logs (.csv)")}</Button>
        </div>
      </div>

      <Table columns={columns} data={logs} keyExtractor={(l) => l.id} />

      {/* Log Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={t("Chi tiết vết kiểm toán (Audit Log Record)")}
        footer={<Button variant="primary" onClick={() => setSelectedLog(null)}>{t("Đóng")}</Button>}
      >
        {selectedLog && (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <div><strong>{t("Log ID:")}</strong> {selectedLog.id}</div>
              <div><strong>{t("Timestamp:")}</strong> {selectedLog.timestamp}</div>
              <div><strong>{t("Target Service:")}</strong> {selectedLog.service}</div>
              <div><strong>{t("Action Name:")}</strong> {selectedLog.action}</div>
              <div><strong>{t("Actor Email:")}</strong> {selectedLog.actorEmail} ({selectedLog.actorRole})</div>
              <div><strong>{t("IP Address:")}</strong> {selectedLog.ipAddress}</div>
              <div><strong>{t("Status:")}</strong> {t(selectedLog.status)}</div>
            </div>
            <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
              <strong>{t("Payload / Chi tiết thay đổi:")}</strong>
              <p className="mt-1 text-slate-600 dark:text-slate-300 font-sans">{selectedLog.details}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

