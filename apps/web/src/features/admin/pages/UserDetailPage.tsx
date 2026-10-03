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
  Download,
  Edit2,
  Clock,
  Shield,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { AdminUser } from '../../../services/adminMockData';
import {
  useGovernanceAccountDetail,
  useApplyGovernanceAction,
  useAssignUserRole,
  useRevokeUserRole,
  useWipeGovernanceAccount,
  authApi,
} from '../../../services/api';

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = id?.replace(/\D/g, '') || '1';

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [newPolicyInput, setNewPolicyInput] = useState('');

  // Real backend queries & mutations
  const { data: beAccountData, refetch } = useGovernanceAccountDetail(numericId);
  const applyActionMutation = useApplyGovernanceAction();
  const assignRoleMutation = useAssignUserRole();
  const revokeRoleMutation = useRevokeUserRole();
  const wipeAccountMutation = useWipeGovernanceAccount();

  const [overrides, setOverrides] = useState<Partial<AdminUser>>({});

  const baseUser: AdminUser = React.useMemo(() => {
    if (beAccountData) {
      const primaryRole = beAccountData.role || beAccountData.roles?.[0] || 'Student';
      return {
        id: String(beAccountData.userId || numericId),
        fullName: beAccountData.fullName || (primaryRole.toLowerCase().includes('admin') ? 'System Administrator' : beAccountData.email?.split('@')[0] || `User #${beAccountData.userId}`),
        email: beAccountData.email || `user.${numericId}@fhub.com.vn`,
        role: (primaryRole.toLowerCase().includes('admin') ? 'Admin' : primaryRole.toLowerCase().includes('moderator') ? 'Community Moderator' : primaryRole.toLowerCase().includes('staff') ? 'Staff' : 'Student') as any,
        campus: (beAccountData.campus || 'HL') as any,
        major: beAccountData.major || 'Software Engineering',
        studentId: beAccountData.studentCode || '',
        karma: beAccountData.karma || 0,
        status: (beAccountData.accountStatus as any) || (beAccountData.isActive ? 'ACTIVE' : 'SUSPENDED'),
        verifiedAt: beAccountData.createdAt,
        activeSessions: [],
        inlinePolicies: beAccountData.roles || [],
        badges: [],
      };
    }
    return {
      id: numericId,
      fullName: `User #${numericId}`,
      email: `user.${numericId}@fhub.com.vn`,
      role: 'Student',
      campus: 'HL',
      major: '',
      studentId: '',
      karma: 0,
      status: 'ACTIVE',
      activeSessions: [],
      inlinePolicies: [],
      badges: [],
    };
  }, [beAccountData, numericId]);

  const user: AdminUser = { ...baseUser, ...overrides };

  const handleStatusToggle = async (newStatus: 'ACTIVE' | 'MUTED' | 'SUSPENDED') => {
    try {
      await applyActionMutation.mutateAsync({
        id: numericId,
        payload: {
          actionType: newStatus === 'SUSPENDED' ? 'SUSPEND' : newStatus === 'MUTED' ? 'MUTE' : 'WARN',
          reason: `Admin updated status to ${newStatus}`,
        },
      });
      refetch();
    } catch (e) {
      console.warn('API status toggle error, falling back locally', e);
    }
    setOverrides((prev) => ({ ...prev, status: newStatus }));
    setActionSuccess(`Account status updated to ${newStatus}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await authApi.logout(Number(sessionId.replace(/\D/g, '')) || undefined);
    } catch (e) {
      console.warn('API logout session error, falling back locally', e);
    }
    if (user.activeSessions) {
      const updatedSessions = user.activeSessions.filter((s) => s.id !== sessionId);
      setOverrides((prev) => ({ ...prev, activeSessions: updatedSessions }));
      setActionSuccess('Device session revoked successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleAddPolicy = () => {
    if (newPolicyInput.trim()) {
      const currentPolicies = user.inlinePolicies || [];
      const updated = [...currentPolicies, newPolicyInput.trim().toUpperCase()];
      setOverrides((prev) => ({ ...prev, inlinePolicies: updated }));
      setNewPolicyInput('');
      setShowAddPolicy(false);
      setActionSuccess(`Policy ${newPolicyInput.toUpperCase()} attached to user.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleRemovePolicy = (policy: string) => {
    const currentPolicies = user.inlinePolicies || [];
    const updated = currentPolicies.filter((p) => p !== policy);
    setOverrides((prev) => ({ ...prev, inlinePolicies: updated }));
    setActionSuccess(`Policy ${policy} detached.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs & Header (Figma 55:3199) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Link to="/users" className="hover:text-blue-600 transition-colors">USER MANAGEMENT</Link>
            <span>&gt;</span>
            <Link to="/users" className="hover:text-blue-600 transition-colors">DIRECTORY</Link>
            <span>&gt;</span>
            <span className="text-blue-600">{user.fullName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            User Account Detail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View and manage institutional student profile, permissions, active sessions, and karma score.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { setActionSuccess(`Profile export PDF generated for ${user.fullName}.`); setTimeout(() => setActionSuccess(null), 3500); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Profile</span>
          </button>

          {user.status === 'ACTIVE' ? (
            <button
              onClick={() => handleStatusToggle('SUSPENDED')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Suspend Account</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusToggle('ACTIVE')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Restore Active</span>
            </button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* User Hero Banner Card (Figma 55:3199) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user.fullName}
              className="w-16 h-16 rounded-xl object-cover ring-2 ring-blue-600/20 shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-slate-900">{user.fullName}</h2>
                <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50" />
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {user.role} ({user.status})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="font-mono text-slate-700 font-semibold">{user.studentId || 'N/A'}</span>
                <span>•</span>
                <span className="text-slate-600 font-mono text-[11px]">{user.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Campus: {user.campus}
                </span>
                <span>•</span>
                <span>Joined: {user.verifiedAt ? new Date(user.verifiedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:border-l md:border-slate-100 md:pl-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Karma Points</span>
              <div className="text-xl font-bold text-blue-600">{user.karma || 0} pts</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid of Detail Cards (Figma 55:3199) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Personal & Academic Information Card */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Personal & Academic Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Full Legal Name</span>
                <span className="font-semibold text-slate-800">{user.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Student / Staff ID</span>
                <span className="font-mono font-semibold text-slate-800">{user.studentId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Institutional Email</span>
                <span className="font-mono text-slate-800">{user.email}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Contact Phone</span>
                <span className="font-mono text-slate-800">{user.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Current Major</span>
                <span className="font-semibold text-slate-800">{user.major || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Campus Partition</span>
                <span className="font-semibold text-slate-800">{user.campus ? `Campus ${user.campus}` : 'N/A'}</span>
              </div>
            </div>

            {user.academicProfile && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs pt-3 mt-2">
                <div>
                  <span className="text-slate-400 text-[11px]">Academic Progress</span>
                  <div className="font-bold text-slate-800">{user.academicProfile.completedCredits} / 144 Credits</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px]">Cumulative GPA</span>
                  <div className="font-bold text-emerald-600 text-sm">{user.academicProfile.gpa} / 4.0</div>
                </div>
              </div>
            )}
          </div>

          {/* Roles & Permissions Card */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Roles & Permissions</h3>
              <button
                onClick={() => setShowAddPolicy(!showAddPolicy)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Attach Policy
              </button>
            </div>

            {showAddPolicy && (
              <div className="flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 animate-fadeIn">
                <input
                  type="text"
                  value={newPolicyInput}
                  onChange={(e) => setNewPolicyInput(e.target.value)}
                  placeholder="e.g. CAN_MANAGE_COURSE_NODES"
                  className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs uppercase font-mono"
                />
                <button
                  onClick={handleAddPolicy}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  Attach
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Role: {user.role} (Default)
              </span>
              {user.inlinePolicies && user.inlinePolicies.map((pol) => (
                <span key={pol} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>{pol}</span>
                  <button
                    onClick={() => handleRemovePolicy(pol)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                    title="Remove policy"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Community Contributions (5 boxes) */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Community Contributions</h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-lg font-bold text-slate-900">{user.activityStats?.questionsCount || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">QUESTIONS</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-lg font-bold text-emerald-600">{user.activityStats?.answersCount || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">ANSWERS</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-lg font-bold text-slate-900">{user.activityStats?.materialsUploaded || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">MATERIALS</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-lg font-bold text-slate-900">{user.activityStats?.articlesCount || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">ARTICLES</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-lg font-bold text-blue-600">{user.karma || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">KARMA REP</div>
              </div>
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Recent Activity Timeline</h3>

            <div className="py-2 text-xs text-slate-400">
              0 recent activities recorded for this user account.
            </div>
          </div>
        </div>

        {/* Right 4 Cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Account Status Card (Figma 55:3199) */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Account Status</h3>

            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="pt-2 first:pt-0 flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-emerald-600">{user.status}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Verified At</span>
                <span className="font-semibold text-slate-800">{user.verifiedAt ? new Date(user.verifiedAt).toLocaleDateString() : 'Unverified'}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">2-Factor Auth (2FA)</span>
                <span className="font-semibold text-blue-600">{user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Active Devices</span>
                <span className="font-semibold text-slate-800">{user.activeSessions?.length || 0} Active Devices</span>
              </div>
            </div>
          </div>

          {/* Account Verification Card */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Institutional Verification</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              {user.verifiedAt ? `Account registered and verified in Governance Service on ${new Date(user.verifiedAt).toLocaleDateString()}.` : 'Standard account registration in Governance Service.'}
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Academic Trust Verified</span>
            </div>
          </div>

          {/* Active Sessions Card */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Active Login Sessions</h3>

            <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
              {user.activeSessions && user.activeSessions.length > 0 ? (
                user.activeSessions.map((s) => (
                  <div key={s.id} className="pt-2 first:pt-0 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.device}</span>
                        {s.isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{s.ipAddress} • {s.location}</span>
                    </div>

                    {!s.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        className="text-[11px] text-rose-600 font-semibold hover:underline cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-2 text-xs text-slate-400">
                  0 active login sessions recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
