import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  VolumeX,
  ExternalLink,
  ChevronRight,
  MapPin,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { mockAdminUsers, AdminUser } from '../../../services/adminMockData';

export const UserManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [usersList, setUsersList] = useState<AdminUser[]>(mockAdminUsers);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStatusChange = (userId: string, newStatus: 'ACTIVE' | 'MUTED' | 'SUSPENDED') => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    setActionSuccess(`Đã cập nhật trạng thái tài khoản thành ${newStatus}`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleWipeData = (userId: string, userName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn Wipe Data / Xóa tài khoản ${userName}? Hành động này được ghi nhận vào Audit Log.`)) {
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      setActionSuccess(`Đã xóa vĩnh viễn dữ liệu tài khoản ${userName} (Wipe Data completed)`);
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.studentId && user.studentId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCampus = selectedCampus === 'ALL' || user.campus === selectedCampus;
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || user.status === selectedStatus;

    return matchesSearch && matchesCampus && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#005da7] uppercase tracking-wider">Identity & Access Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            User Directory & Permissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý tài khoản toàn bộ 5 phân hiệu, gán Role/Policy và giám sát trạng thái vi phạm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Chức năng tạo tài khoản Staff/Admin')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Tài Khoản Mới</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Status Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Tổng Tài Khoản</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">12,450</p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600">Đang Hoạt Động (Active)</span>
          <p className="text-xl font-black text-emerald-600 mt-0.5">11,890</p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600">Chờ Xác Minh</span>
          <p className="text-xl font-black text-amber-600 mt-0.5">320</p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-600">Bị Đình Chỉ / Muted</span>
          <p className="text-xl font-black text-rose-600 mt-0.5">240</p>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Tên, Email @fpt.edu.vn, Mã SV (HE163421)..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005da7]/20"
            />
          </div>

          {/* Campus Filter */}
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="w-full md:w-44 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả Cơ sở</option>
            <option value="HL">Hòa Lạc (HL)</option>
            <option value="HCM">Hồ Chí Minh (HCM)</option>
            <option value="DN">Đà Nẵng (DN)</option>
            <option value="CT">Cần Thơ (CT)</option>
            <option value="QN">Quy Nhơn (QN)</option>
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full md:w-44 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả Vai trò</option>
            <option value="Student">Student</option>
            <option value="Staff">Staff</option>
            <option value="Community Moderator">Community Moderator</option>
            <option value="Admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-44 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="ACTIVE">ACTIVE (Hoạt động)</option>
            <option value="PENDING_VERIFICATION">Chờ xác minh</option>
            <option value="MUTED">MUTED (Khóa chat)</option>
            <option value="SUSPENDED">SUSPENDED (Đình chỉ)</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">User Info</th>
                <th className="py-3 px-3 font-semibold">Role & Major</th>
                <th className="py-3 px-3 font-semibold">Campus</th>
                <th className="py-3 px-3 font-semibold">Karma Score</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* User Profile */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={user.fullName}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <Link
                          to={`/users/${user.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-[#005da7] flex items-center gap-1.5"
                        >
                          {user.fullName}
                          {user.studentId && (
                            <span className="text-[10px] font-mono text-slate-400">({user.studentId})</span>
                          )}
                        </Link>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role & Major */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {user.role}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{user.major || user.department || 'N/A'}</div>
                  </td>

                  {/* Campus */}
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3 h-3 text-[#005da7]" /> {user.campus}
                    </span>
                  </td>

                  {/* Karma */}
                  <td className="py-3 px-3">
                    <span className={`font-mono font-bold ${user.karma < 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                      {user.karma > 0 ? `+${user.karma}` : user.karma}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    {user.status === 'ACTIVE' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                    {user.status === 'MUTED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <VolumeX className="w-3 h-3" /> MUTED
                      </span>
                    )}
                    {user.status === 'SUSPENDED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <XCircle className="w-3 h-3" /> SUSPENDED
                      </span>
                    )}
                    {user.status === 'PENDING_VERIFICATION' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#005da7] dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        <AlertTriangle className="w-3 h-3" /> PENDING
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right space-x-1">
                    <Link
                      to={`/users/${user.id}`}
                      className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#005da7] bg-sky-50 dark:bg-sky-950/50 hover:bg-[#cfe1fe] transition-colors"
                    >
                      Detail
                    </Link>

                    {user.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleStatusChange(user.id, 'MUTED')}
                        className="inline-flex items-center px-2 py-1.5 rounded-lg text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Mute chat/bình luận"
                      >
                        Mute
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                        className="inline-flex items-center px-2 py-1.5 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors cursor-pointer"
                        title="Khôi phục hoạt động"
                      >
                        Active
                      </button>
                    )}

                    <button
                      onClick={() => handleWipeData(user.id, user.fullName)}
                      className="inline-flex items-center p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Wipe / Xóa tài khoản"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
