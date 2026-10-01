import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Server,
  MapPin,
  Users,
  Network,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { mockDetailedCampuses, DetailedCampus } from '../../../services/adminMockData';

export const CampusesPage: React.FC = () => {
  const [campuses, setCampuses] = useState<DetailedCampus[]>(mockDetailedCampuses);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // New Campus Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDirector, setNewDirector] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const navigate = useNavigate();

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncNotice('Toàn bộ 5 Campus Partition Nodes đã được đồng bộ cấu hình Glocal Routing!');
      setTimeout(() => setSyncNotice(null), 3500);
    }, 700);
  };

  const handleCreateCampus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const created: DetailedCampus = {
      id: `camp-${Date.now()}`,
      code: newCode.trim().toUpperCase() as any,
      name: newName.trim(),
      location: newLocation.trim() || 'FPT University Campus',
      isActive: true,
      studentCount: 1,
      regionalDirector: newDirector.trim() || 'Chưa chỉ định',
      contactEmail: newEmail.trim() || 'contact@fe.edu.vn',
      contactPhone: '024.7300.5588',
      totalFaculty: 50,
      totalMajors: 8,
      activeCourseNodes: 120,
      serverPartition: {
        nodeId: `node-${newCode.toLowerCase()}-primary-01`,
        region: 'ap-southeast-1 (Edge DC)',
        status: 'OPTIMAL',
        latencyMs: 20,
        lastSyncAt: new Date().toISOString(),
        replicationLagSec: 0.2,
        feedGlocalRouting: true,
      },
    };

    setCampuses((prev) => [...prev, created]);
    setShowCreateModal(false);
    setSyncNotice(`Đã khởi tạo thành công Phân hiệu ${created.name} (${created.code})`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#005da7] uppercase tracking-wider">Academic Taxonomy Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Campus Partition & Node Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý 5 cơ sở đào tạo FPT University, hạ tầng phân tán Edge và định tuyến Glocal Sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Đồng Bộ 5 Phân Hiệu</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Phân Hiệu Mới</span>
          </button>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Campus Grid Cards (Figma 57:6972) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {campuses.map((campus) => (
          <div
            key={campus.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:border-[#005da7] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#005da7] to-sky-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
                    {campus.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {campus.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">Node: {campus.serverPartition.nodeId}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> OPTIMAL
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Giám đốc phân hiệu:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{campus.regionalDirector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quy mô sinh viên:</span>
                  <span className="font-black text-[#005da7]">{campus.studentCount.toLocaleString()} SV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số ngành / Course Nodes:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {campus.totalMajors} Ngành / {campus.activeCourseNodes} Môn
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#005da7] shrink-0" />
                  <span className="truncate">{campus.location}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Replication Lag: {campus.serverPartition.replicationLagSec}s</span>
                  <span className="text-emerald-600 font-semibold">{campus.serverPartition.latencyMs}ms Latency</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Glocal Feed Sync: BẬT</span>
              <Link
                to={`/campuses/${campus.code}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#005da7] hover:underline"
              >
                <span>Chi tiết & Cấu hình</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Campus Partition */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Thêm Phân Hiệu Campus Mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampus} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mã Campus:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: HP"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white uppercase"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên Đầy Đủ:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: FPT University Hải Phòng"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Địa Chỉ Cơ Sở:</label>
                <input
                  type="text"
                  placeholder="Khu đô thị mới..."
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Giám Đốc Phân Hiệu:</label>
                  <input
                    type="text"
                    placeholder="TS. Nguyễn Văn..."
                    value={newDirector}
                    onChange={(e) => setNewDirector(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Tuyển Sinh / Liên Hệ:</label>
                  <input
                    type="email"
                    placeholder="tuyensinh@fe.edu.vn"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold cursor-pointer"
                >
                  Khởi Tạo Phân Hiệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
