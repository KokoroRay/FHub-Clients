import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  Activity,
  Key,
  Globe,
  Trash2,
  VolumeX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Smartphone,
  Laptop,
  Plus,
  Zap,
  Share2,
  FileText,
  ShoppingBag,
} from 'lucide-react';
import { mockAdminUsers, AdminUser } from '../../../services/adminMockData';

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState<AdminUser[]>(mockAdminUsers);
  const [activeTab, setActiveTab] = useState<'ACADEMIC' | 'ACTIVITY' | 'REPUTATION' | 'SECURITY'>('ACADEMIC');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [newPolicyInput, setNewPolicyInput] = useState('');
  const [showAddPolicy, setShowAddPolicy] = useState(false);

  const user = usersList.find((u) => u.id === id) || usersList[1]; // fallback to usr-1

  const handleStatusToggle = (newStatus: 'ACTIVE' | 'MUTED' | 'SUSPENDED') => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    setActionSuccess(`Đã chuyển trạng thái tài khoản thành ${newStatus}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleRevokeSession = (sessionId: string) => {
    if (user.activeSessions) {
      const updatedSessions = user.activeSessions.filter((s) => s.id !== sessionId);
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, activeSessions: updatedSessions } : u))
      );
      setActionSuccess('Đã thu hồi phiên đăng nhập thành công');
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleAddPolicy = () => {
    if (newPolicyInput.trim()) {
      const currentPolicies = user.inlinePolicies || [];
      const updated = [...currentPolicies, newPolicyInput.trim().toUpperCase()];
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, inlinePolicies: updated } : u))
      );
      setNewPolicyInput('');
      setShowAddPolicy(false);
      setActionSuccess(`Đã gán Policy ${newPolicyInput.toUpperCase()} cho người dùng`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleRemovePolicy = (policy: string) => {
    const currentPolicies = user.inlinePolicies || [];
    const updated = currentPolicies.filter((p) => p !== policy);
    setUsersList((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, inlinePolicies: updated } : u))
    );
    setActionSuccess(`Đã gỡ bỏ Policy ${policy}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#005da7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách User Directory
        </Link>
        <span className="text-[11px] font-mono text-slate-400">UID: {user.id}</span>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* User Header Profile Card (Figma 55:3199) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user.fullName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#005da7]"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">{user.fullName}</h1>
                {user.studentId && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                    {user.studentId}
                  </span>
                )}
                {user.status === 'ACTIVE' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ACTIVE
                  </span>
                )}
                {user.status === 'MUTED' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    MUTED
                  </span>
                )}
                {user.status === 'SUSPENDED' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    SUSPENDED
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-[#005da7]" /> Campus: {user.campus}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {user.status === 'ACTIVE' ? (
              <>
                <button
                  onClick={() => handleStatusToggle('MUTED')}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Mute Chat
                </button>
                <button
                  onClick={() => handleStatusToggle('SUSPENDED')}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Suspend Account
                </button>
              </>
            ) : (
              <button
                onClick={() => handleStatusToggle('ACTIVE')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Restore Active Status
              </button>
            )}

            <button
              onClick={() => alert('Đã gửi email khôi phục mật khẩu FPT SSO')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              Reset Pass / SSO
            </button>
          </div>
        </div>

        {/* User Karma Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Reputation Karma</span>
            <p className="text-lg font-black text-[#005da7]">{user.karma} pts</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Chuyên Ngành (Major)</span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{user.major || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Xác Minh Danh Tính</span>
            <p className="text-xs font-bold text-emerald-600 mt-1">{user.verifiedAt ? 'Đã xác minh (Verified)' : 'Chưa'}</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">2-Factor Auth (2FA)</span>
            <p className="text-xs font-bold text-indigo-600 mt-1">{user.twoFactorEnabled ? 'Bật (TOTP Active)' : 'Tắt'}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('ACADEMIC')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'ACADEMIC'
              ? 'border-[#005da7] text-[#005da7]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Hồ Sơ Học Thuật & Đăng Ký
        </button>
        <button
          onClick={() => setActiveTab('ACTIVITY')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'ACTIVITY'
              ? 'border-[#005da7] text-[#005da7]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Hoạt Động & Đóng Góp
        </button>
        <button
          onClick={() => setActiveTab('REPUTATION')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'REPUTATION'
              ? 'border-[#005da7] text-[#005da7]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Huy Hiệu & Điểm Uy Tín ({user.badges?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'SECURITY'
              ? 'border-[#005da7] text-[#005da7]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Bảo Mật & Phiên Đăng Nhập
        </button>
      </div>

      {/* Tab Content 1: Academic & Enrollment */}
      {activeTab === 'ACADEMIC' && (
        <div className="space-y-6">
          {user.academicProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="font-bold text-xs text-slate-400 uppercase">Học Lực Tổng Quan</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">GPA Tích Lũy:</span>
                    <span className="font-mono font-black text-emerald-600 text-sm">{user.academicProfile.gpa}/4.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tín chỉ hoàn thành:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{user.academicProfile.completedCredits} / 144</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Học kỳ hiện tại:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Kỳ {user.academicProfile.currentSemester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khóa tuyển sinh:</span>
                    <span className="font-bold text-slate-900 dark:text-white">K{user.academicProfile.enrollmentYear - 2006} ({user.academicProfile.enrollmentYear})</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="font-bold text-xs text-slate-400 uppercase">Danh Sách Môn Học Đã/Đang Học</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {user.academicProfile.enrolledCourses.map((c) => (
                    <div key={c.code} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <Link to={`/course-nodes/${c.code}`} className="font-bold text-[#005da7] hover:underline">
                          {c.code}
                        </Link>
                        <span className="text-slate-600 dark:text-slate-300 ml-2">{c.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.grade && (
                          <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Grade: {c.grade}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs">
              Tài khoản thuộc vai trò Quản trị / Cán bộ nhân viên, không có dữ liệu tiến độ môn học sinh viên.
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Activity Stats */}
      {activeTab === 'ACTIVITY' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 font-semibold">Câu Hỏi Đã Đăng</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{user.activityStats?.questionsCount || 0}</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 font-semibold">Câu Trả Lời (Best Ans)</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {user.activityStats?.answersCount || 0} ({user.activityStats?.bestAnswersCount || 0} Best)
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 font-semibold">Tài Liệu Đã Đóng Góp</span>
            <p className="text-2xl font-black text-indigo-600 mt-1">{user.activityStats?.materialsUploaded || 0}</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 font-semibold">Lượt Upvotes Nhận Được</span>
            <p className="text-2xl font-black text-amber-600 mt-1">+{user.activityStats?.upvotesReceived || 0}</p>
          </div>
        </div>
      )}

      {/* Tab Content 3: Reputation & Badges */}
      {activeTab === 'REPUTATION' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user.badges && user.badges.length > 0 ? (
              user.badges.map((b) => (
                <div key={b.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{b.name}</h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-100 text-amber-800">
                        {b.tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{b.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Ngày nhận: {b.earnedAt || 'Gần đây'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Chưa có huy hiệu nào được mở khóa cho tài khoản này.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 4: Security & Active Sessions */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6">
          {/* Inline Policies Section */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-400 uppercase">Attached Inline Policies & Permissions</h3>
              <button
                onClick={() => setShowAddPolicy(!showAddPolicy)}
                className="flex items-center gap-1 text-xs font-bold text-[#005da7] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Gán Policy Mới
              </button>
            </div>

            {showAddPolicy && (
              <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <input
                  type="text"
                  value={newPolicyInput}
                  onChange={(e) => setNewPolicyInput(e.target.value)}
                  placeholder="Nhập mã Policy (VD: CAN_MANAGE_COURSE_NODES)..."
                  className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleAddPolicy}
                  className="px-3 py-1.5 bg-[#005da7] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Gán Policy
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {user.inlinePolicies && user.inlinePolicies.map((pol) => (
                <span key={pol} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Lock className="w-3 h-3 text-indigo-500" />
                  <span>{pol}</span>
                  <button
                    onClick={() => handleRemovePolicy(pol)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer ml-1"
                    title="Gỡ policy"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-400 uppercase">Active Login Sessions</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {user.activeSessions && user.activeSessions.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        {s.device} ({s.browser})
                        {s.isCurrent && (
                          <span className="text-[10px] px-2 py-0.2 bg-emerald-50 text-emerald-700 rounded-full font-bold">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        IP: {s.ipAddress} • {s.location} • Hoạt động: {s.lastActive}
                      </div>
                    </div>
                  </div>

                  {!s.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(s.id)}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
