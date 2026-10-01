import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  LifeBuoy,
  Network,
  ShieldCheck,
  Building2,
  GraduationCap,
  Zap,
  Award,
  FileSpreadsheet,
  Activity,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Server,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Database,
  Search,
} from 'lucide-react';
import { mockDetailedCampuses, mockAdminUsers, mockDetailedSupportTickets, mockDetailedAuditLogs, mockAISensitivityConfig } from '../../../services/adminMockData';
import { mockHealthStatuses } from '../../../services/mockData';

export const AdminDashboardPage: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSyncNotice('Telemetry & Campus Partition sync completed (0.18s latency)');
      setTimeout(() => setSyncNotice(null), 3500);
    }, 600);
  };

  const handleTriggerGlocalSync = () => {
    setSyncNotice('Đã kích hoạt Glocal Routing Sync cho 5 phân hiệu (HL, HCM, DN, CT, QN)');
    setTimeout(() => setSyncNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Controls */}
      <div className="bg-linear-to-r from-slate-900 via-[#004a87] to-[#005da7] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                FHub SEP Core v2.4
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> All 5 Partitions Online
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Admin Operations Console</h1>
            <p className="text-xs sm:text-sm text-sky-100/80 mt-1 max-w-2xl">
              Hệ thống điều hành phân cấp học thuật, quản trị danh tính sinh viên, kiểm duyệt AI và phân vùng 5 cơ sở FPT University.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRefreshTelemetry}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Làm mới Telemetry'}</span>
            </button>
            <button
              onClick={handleTriggerGlocalSync}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#005da7] hover:bg-sky-50 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Glocal Sync Toàn Quốc</span>
            </button>
          </div>
        </div>

        {syncNotice && (
          <div className="mt-4 p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-100 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}
      </div>

      {/* 4 Key Metric Stat Cards (Figma 55:2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Total Users */}
        <Link
          to="/users"
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#005da7] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#005da7] dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +12.4%
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">12,450</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng người dùng (11.8k Active)</p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>5 Campus Đồng Bộ</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#005da7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        {/* Metric 2: Open Tickets */}
        <Link
          to="/tickets"
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
              4 Khẩn Cấp
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">24</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Yêu cầu hỗ trợ đang mở</p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>SLA &lt; 15 phút</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        {/* Metric 3: Active Course Nodes */}
        <Link
          to="/course-nodes"
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
              32 Majors
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">186</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Course Nodes (Môn học active)</p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Chuẩn ABET & MOET</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        {/* Metric 4: Immutable Audit Events */}
        <Link
          to="/audit-logs"
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              100% SHA-256
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">1,429</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Audit Events (24 giờ qua)</p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>ISO 27001 Sealed</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Main Grid: Campus Telemetry & Quick Action Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Campus Traffic Partition Status */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#005da7]" />
              <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Campus Partition & Microservice Telemetry
              </h2>
            </div>
            <Link to="/campuses" className="text-xs font-bold text-[#005da7] hover:underline flex items-center gap-1">
              Quản lý 5 Cơ sở <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Campus Breakdown Bars */}
          <div className="space-y-3 pt-1">
            {mockDetailedCampuses.map((campus) => {
              const percentage = Math.round((campus.studentCount / 45800) * 100);
              return (
                <div key={campus.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/60 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#005da7] text-white font-extrabold text-xs flex items-center justify-center">
                        {campus.code}
                      </span>
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{campus.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2">Node: {campus.serverPartition.nodeId}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {campus.studentCount.toLocaleString()} SV
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-2">
                        {campus.serverPartition.latencyMs}ms
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-linear-to-r from-[#005da7] to-sky-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage * 2}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                    <span>{campus.activeCourseNodes} Course Nodes hoạt động</span>
                    <span className="text-emerald-500 font-semibold">● Replication lag: {campus.serverPartition.replicationLagSec}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & AI Governance */}
        <div className="space-y-6">
          {/* Quick Action Buttons */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Quick Admin Actions
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => navigate('/campuses?action=create')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#cfe1fe]/40 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-[#005da7]" />
                  <span>Thêm Phân Hiệu Mới (Campus)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/majors?action=create')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#cfe1fe]/40 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-[#005da7]" />
                  <span>Khai Báo Ngành Học (Major)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/course-nodes?action=create')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#cfe1fe]/40 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Network className="w-4 h-4 text-[#005da7]" />
                  <span>Tạo Course Node (Môn Học)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/reputation')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#cfe1fe]/40 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Cấu hình Điểm Karma / Reputation</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/health')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-[#cfe1fe]/40 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Kiểm Tra Microservices SLA</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* AI Content Processing Card */}
          <div className="bg-linear-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Sparkles className="w-4 h-4 text-amber-400" /> AI Moderation Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tự động quét nội dung thảo luận, phát hiện câu hỏi trùng lặp và tóm tắt đề cương môn học theo thời gian thực.
            </p>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span>Toxicity Threshold:</span>
                <span className="font-mono font-bold text-sky-300">{mockAISensitivityConfig.toxicityThreshold * 100}%</span>
              </div>
              <div className="flex justify-between">
                <span>Academic Dishonesty:</span>
                <span className="font-mono font-bold text-sky-300">{mockAISensitivityConfig.academicDishonestyThreshold * 100}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Immutable Audit Stream */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Live Immutable Audit Event Log
            </h2>
          </div>
          <Link to="/audit-logs" className="text-xs font-bold text-[#005da7] hover:underline flex items-center gap-1">
            Xem toàn bộ Audit Logs <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Event ID / Time</th>
                <th className="py-2.5 px-3 font-semibold">Service</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">Actor</th>
                <th className="py-2.5 px-3 font-semibold">Details</th>
                <th className="py-2.5 px-3 font-semibold text-right">Cryptographic Seal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockDetailedAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-[#005da7]">{log.eventId}</div>
                    <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{log.service}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-sky-50 dark:bg-sky-950/60 text-[#005da7] dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{log.actorEmail}</div>
                    <div className="text-[10px] text-slate-400">{log.ipAddress}</div>
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300">
                    {log.details}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> SHA-256 Valid
                    </span>
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
