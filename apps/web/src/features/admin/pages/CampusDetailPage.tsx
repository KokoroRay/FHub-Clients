import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Server,
  MapPin,
  Mail,
  Phone,
  Users,
  Network,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { mockDetailedCampuses, mockDetailedMajors } from '../../../services/adminMockData';

export const CampusDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [campuses, setCampuses] = useState(mockDetailedCampuses);
  const [isSyncing, setIsSyncing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const campus = campuses.find((c) => c.code === code) || campuses[0];
  const [glocalRouting, setGlocalRouting] = useState(campus.serverPartition.feedGlocalRouting);

  const handleSyncPartition = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSuccessMessage(`Đã đồng bộ lại dữ liệu partition node ${campus.serverPartition.nodeId} (0.15s)`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 600);
  };

  const handleToggleGlocalRouting = () => {
    const next = !glocalRouting;
    setGlocalRouting(next);
    setSuccessMessage(`Đã ${next ? 'KÍCH HOẠT' : 'TẮT'} Glocal Cross-Campus Feed Routing cho cơ sở ${campus.code}`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/campuses"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#005da7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Cơ sở (Campuses)
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Partition: {campus.serverPartition.nodeId}</span>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Campus Header Card (Figma 58:8220) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-[#005da7] to-sky-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {campus.code}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">{campus.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OPTIMAL 99.9%
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#005da7]" /> {campus.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {campus.contactEmail}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {campus.contactPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncPartition}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Đồng Bộ Lại Partition</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Quy mô sinh viên</span>
            <p className="text-xl font-black text-[#005da7]">{campus.studentCount.toLocaleString()} SV</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Giảng viên / Cán bộ</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">{campus.totalFaculty} Giảng viên</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Chuyên ngành đào tạo</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">{campus.totalMajors} Majors</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Course Nodes Active</span>
            <p className="text-xl font-black text-emerald-600">{campus.activeCourseNodes} Môn học</p>
          </div>
        </div>
      </div>

      {/* 2-Column: Partition Server Infrastructure + Glocal Feed Policy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edge DC Server Telemetry */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#005da7]" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Edge Partition Node Telemetry</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-slate-500">Node Identifier:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{campus.serverPartition.nodeId}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-slate-500">Region DC:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{campus.serverPartition.region}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-slate-500">Node Latency (RTT):</span>
              <span className="font-mono font-bold text-emerald-600">{campus.serverPartition.latencyMs} ms</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-slate-500">Replication Lag to Master:</span>
              <span className="font-mono font-bold text-emerald-600">{campus.serverPartition.replicationLagSec}s (Near Realtime)</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-slate-500">Last Telemetry Heartbeat:</span>
              <span className="font-mono text-slate-500">{new Date(campus.serverPartition.lastSyncAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Glocal Routing Feed Configuration */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Glocal Routing Policy</h3>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${glocalRouting ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {glocalRouting ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Chế độ Glocal (Global + Local) cho phép sinh viên tại {campus.name} ưu tiên thấy các bài viết, tài liệu và marketplace của riêng cơ sở {campus.code}, đồng thời vẫn liên thông thảo luận toàn quốc.
          </p>

          <div className="pt-2">
            <button
              onClick={handleToggleGlocalRouting}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                glocalRouting
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-[#005da7] hover:bg-[#004a87] text-white'
              }`}
            >
              {glocalRouting ? 'Tạm thời Tắt Glocal Sync (Chuyển sang Campus Isolate)' : 'Kích hoạt Glocal Sync Toàn Quốc'}
            </button>
          </div>
        </div>
      </div>

      {/* Majors Active at this Campus */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chương Trình Đào Tạo Phân Hiệu</h3>
          <Link to="/majors" className="text-xs font-bold text-[#005da7] hover:underline">
            Quản lý Majors
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {mockDetailedMajors.map((m) => (
            <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-xs text-[#005da7]">{m.code}</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{m.vietnameseName}</p>
              </div>
              <Link to={`/majors/${m.code}`} className="text-xs text-slate-400 hover:text-[#005da7]">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
