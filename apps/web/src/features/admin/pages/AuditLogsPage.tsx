import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Search,
  Filter,
  ShieldCheck,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Lock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { mockDetailedAuditLogs, DetailedAuditLog } from '../../../services/adminMockData';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<DetailedAuditLog[]>(mockDetailedAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('ALL');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.eventId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = selectedService === 'ALL' || log.service.includes(selectedService);

    return matchesSearch && matchesService;
  });

  const handleExport = (format: 'CSV' | 'JSON') => {
    setExportNotice(`Đã xuất báo cáo kiểm toán tuân thủ ${format} (Cryptographically signed ISO 27001 report)`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Security & Compliance Ledger</span>
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Lock className="w-3 h-3" /> IMMUTABLE MERKLE TREE
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            System Audit Logs & Cryptographic Proof
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nhật ký kiểm toán bất biến theo chuẩn ISO/IEC 27001 và Nghị định 13/2023/NĐ-CP bảo vệ dữ liệu cá nhân.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('CSV')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('JSON')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Signed</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Event ID (EVT-20260317), Email Actor, Action hoặc chi tiết..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full md:w-56 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">Tất cả Microservices</option>
          <option value="Academic">Academic Taxonomy Service</option>
          <option value="Identity">Identity & Access Service</option>
          <option value="Governance">Governance & Moderation</option>
          <option value="Storage">Storage & Material Service</option>
        </select>
      </div>

      {/* Audit Log Table (Figma 64:12427) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Event ID & Time</th>
                <th className="py-3 px-3 font-semibold">Microservice</th>
                <th className="py-3 px-3 font-semibold">Action</th>
                <th className="py-3 px-3 font-semibold">Actor (Caller)</th>
                <th className="py-3 px-3 font-semibold">Details</th>
                <th className="py-3 px-3 font-semibold text-right">Cryptographic Seal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <Link
                      to={`/audit-logs/${log.id}`}
                      className="font-mono font-bold text-[#005da7] hover:underline block"
                    >
                      {log.eventId}
                    </Link>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{log.service}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-sky-50 dark:bg-sky-950/60 text-[#005da7] dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white">{log.actorEmail}</div>
                    <div className="text-[10px] text-slate-400">IP: {log.ipAddress}</div>
                  </td>

                  <td className="py-3 px-3 max-w-sm text-slate-600 dark:text-slate-300">
                    <div className="truncate">{log.details}</div>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/audit-logs/${log.id}`}
                      className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>SHA-256 Valid</span>
                      <ChevronRight className="w-3 h-3 text-slate-400 ml-0.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
