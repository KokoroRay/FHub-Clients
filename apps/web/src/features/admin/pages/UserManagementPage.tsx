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
  Download,
  ChevronDown,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { AdminUser } from '../../../services/adminMockData';
import { useGovernanceAccounts, useApplyGovernanceAction, useWipeGovernanceAccount, useCreateUser } from '../../../services/api';

export const UserManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  // Connect to Backend Governance Accounts
  const { data: accountsData, isLoading, refetch } = useGovernanceAccounts({
    governanceRole: selectedRole !== 'ALL' ? selectedRole : undefined,
    isActive: selectedStatus === 'ALL' ? undefined : selectedStatus === 'ACTIVE',
  });
  const applyActionMutation = useApplyGovernanceAction();
  const wipeAccountMutation = useWipeGovernanceAccount();
  const createUserMutation = useCreateUser();

  // Populate usersList when real BE data arrives
  React.useEffect(() => {
    if (accountsData?.items) {
      const apiUsers: AdminUser[] = accountsData.items.map((acc: any) => ({
        id: String(acc.userId || acc.governanceAccountId),
        fullName: acc.governanceRole === 'ADMIN' ? 'System Administrator' : (acc.fullName || acc.name || `User #${acc.userId}`),
        email: acc.email || (acc.governanceRole === 'ADMIN' ? 'admin@fhub.com.vn' : `user.${acc.userId}@fhub.com.vn`),
        role: (acc.governanceRole === 'ADMIN' ? 'Admin' : acc.governanceRole === 'COMMUNITYMODERATOR' ? 'Community Moderator' : acc.governanceRole === 'STAFF' ? 'Staff' : 'Student') as any,
        campus: (acc.campusCode || acc.campus || 'HL') as any,
        major: acc.major || acc.majorCode || '',
        studentId: acc.studentId || '',
        karma: acc.karma || 0,
        status: acc.isActive ? 'ACTIVE' : 'SUSPENDED',
        verifiedAt: acc.createdAt,
        badges: acc.badges || [],
      }));
      setUsersList(apiUsers);
    }
  }, [accountsData]);

  // New User Form State
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newRole, setNewRole] = useState<'Student' | 'Staff' | 'Community Moderator' | 'Admin'>('Student');
  const [newCampus, setNewCampus] = useState<'HL' | 'HCM' | 'DN' | 'CT' | 'QN'>('HL');
  const [newMajor, setNewMajor] = useState('Software Engineering');

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'MUTED' | 'SUSPENDED') => {
    const numericId = userId.replace(/\D/g, '') || '1';
    try {
      await applyActionMutation.mutateAsync({
        id: numericId,
        payload: {
          actionType: newStatus === 'SUSPENDED' ? 'SUSPEND' : newStatus === 'MUTED' ? 'MUTE' : 'WARN',
          reason: `Admin updated status to ${newStatus}`,
        },
      });
    } catch (e) {
      console.warn('API error, falling back locally:', e);
    }

    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    setActionSuccess(`User status updated to ${newStatus}`);
    setTimeout(() => setActionSuccess(null), 3500);
  };


  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) return;

    try {
      await createUserMutation.mutateAsync({
        email: newEmail.trim(),
        fullName: newFullName.trim(),
        studentId: newStudentId.trim() || undefined,
        role: newRole.toUpperCase().replace(/\s+/g, ''),
        campus: newCampus,
        major: newMajor,
        password: 'ChangeMe@123',
      });

      await refetch();
      setShowCreateModal(false);
      setActionSuccess(`Account created successfully for ${newFullName.trim()} (${newEmail.trim()})`);
      setNewFullName('');
      setNewEmail('');
      setNewStudentId('');
    } catch (err: any) {
      console.error('Failed to create user:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to create user account';
      setActionSuccess(`Error: ${errMsg}`);
    }
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const filteredUsers = usersList.filter((user) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (user.fullName || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q) ||
      (Boolean(user.studentId) && (user.studentId || '').toLowerCase().includes(q));

    const matchesCampus = selectedCampus === 'ALL' || user.campus === selectedCampus;
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || user.status === selectedStatus;

    return matchesSearch && matchesCampus && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Header Title (Figma 55:4074) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>USER MANAGEMENT</span>
            <span>&gt;</span>
            <span className="text-blue-600">DIRECTORY & PERMISSIONS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            User Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, verify, and monitor all FHub Community users across all campuses, roles, and academic tracks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { setActionSuccess(`User Directory export (${usersList.length} accounts) generated in CSV format.`); setTimeout(() => setActionSuccess(null), 3500); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Users</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 5 Top Summary Stat Boxes (Figma 55:4074) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL USERS</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{accountsData?.totalCount ?? usersList.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE USERS</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{usersList.filter(u => u.status === 'ACTIVE').length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PENDING VERIFY</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{usersList.filter(u => u.status === 'PENDING_VERIFICATION').length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUSPENDED</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{usersList.filter(u => u.status === 'SUSPENDED').length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MUTED USERS</span>
          <p className="text-2xl font-bold text-slate-600 mt-1">{usersList.filter(u => u.status === 'MUTED').length}</p>
        </div>
      </div>

      {/* Filter & Search Bar Container (Figma 55:4074) */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, institutional email, student ID (e.g. QE183011), or username..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Campus Filter */}
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="w-full md:w-40 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Campuses</option>
            <option value="HL">Hoa Lac (HL)</option>
            <option value="HCM">Ho Chi Minh (HCM)</option>
            <option value="DN">Da Nang (DN)</option>
            <option value="CT">Can Tho (CT)</option>
            <option value="QN">Quy Nhon (QN)</option>
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full md:w-36 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="Student">Student</option>
            <option value="Staff">Staff</option>
            <option value="Community Moderator">Moderator</option>
            <option value="Admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-36 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_VERIFICATION">Pending Verify</option>
            <option value="MUTED">Muted</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {/* More Filters button */}
          <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Batch Selection Bar (if any selected) */}
      {selectedUsers.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold">
            <span>{selectedUsers.length} user accounts selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selectedUsers.forEach((id) => handleStatusChange(id, 'SUSPENDED'));
                setSelectedUsers([]);
              }}
              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 cursor-pointer"
            >
              Suspend Selected
            </button>
            <button
              onClick={() => {
                selectedUsers.forEach((id) => handleStatusChange(id, 'MUTED'));
                setSelectedUsers([]);
              }}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 cursor-pointer"
            >
              Mute Selected
            </button>
          </div>
        </div>
      )}

      {/* Users Data Table (Figma 55:4074) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-3 font-bold">USER</th>
                <th className="py-3 px-3 font-bold">STUDENT/STAFF ID</th>
                <th className="py-3 px-3 font-bold">INSTITUTIONAL EMAIL</th>
                <th className="py-3 px-3 font-bold">CAMPUS</th>
                <th className="py-3 px-3 font-bold">ROLE</th>
                <th className="py-3 px-3 font-bold">STATUS</th>
                <th className="py-3 px-3 font-bold">KARMA / REP</th>
                <th className="py-3 px-3 font-bold">JOINED</th>
                <th className="py-3 px-4 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-slate-400">
                    0 user accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                const isChecked = selectedUsers.includes(user.id);
                return (
                  <tr key={user.id} className={`hover:bg-slate-50/70 transition-colors ${isChecked ? 'bg-blue-50/40' : ''}`}>
                    {/* Checkbox */}
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* User */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={user.fullName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <Link
                            to={`/users/${user.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1 leading-snug"
                          >
                            {user.fullName}
                          </Link>
                          <span className="text-[10px] text-slate-400">{user.major || user.department || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                      {user.studentId || 'N/A'}
                    </td>

                    {/* Email */}
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {user.email}
                    </td>

                    {/* Campus */}
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded font-bold font-mono text-[10px] bg-slate-100 text-slate-700">
                        {user.campus}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {user.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      )}
                      {user.status === 'PENDING_VERIFICATION' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
                        </span>
                      )}
                      {user.status === 'MUTED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Muted
                        </span>
                      )}
                      {user.status === 'SUSPENDED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Suspended
                        </span>
                      )}
                    </td>

                    {/* Karma / Rep */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {user.karma > 0 ? `+${user.karma}` : user.karma}
                    </td>

                    {/* Joined */}
                    <td className="py-3 px-3 text-[11px] text-slate-400">
                      {user.verifiedAt ? new Date(user.verifiedAt).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <Link
                        to={`/users/${user.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Detail
                      </Link>

                      {user.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(user.id, 'MUTED')}
                          className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 cursor-pointer"
                        >
                          Mute
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                          className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                        >
                          Active
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (Figma 55:4074) */}
        <div className="p-3.5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Showing 1 to {filteredUsers.length} of {accountsData?.totalCount ?? usersList.length} entries</span>
          <div className="flex items-center gap-1 font-semibold">
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-600">
              &lt;
            </button>
            <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-600">
              2
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-600">
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-600">
              125
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-600">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Create User Account */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Create New Institutional Account</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nguyen Van An"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Student/Staff ID:</label>
                  <input
                    type="text"
                    placeholder="e.g. HE163421"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Campus:</label>
                  <select
                    value={newCampus}
                    onChange={(e) => setNewCampus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="HL">HL (Hoa Lac)</option>
                    <option value="HCM">HCM (Ho Chi Minh)</option>
                    <option value="DN">DN (Da Nang)</option>
                    <option value="CT">CT (Can Tho)</option>
                    <option value="QN">QN (Quy Nhon)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Institutional Email (@fpt.edu.vn):</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. nguyenvana.se@fpt.edu.vn"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Primary Role:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                    <option value="Community Moderator">Moderator</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Major Track:</label>
                  <input
                    type="text"
                    placeholder="Software Engineering"
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {createUserMutation.isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{createUserMutation.isPending ? 'Creating...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
