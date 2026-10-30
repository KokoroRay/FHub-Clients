import { RecordDialog } from '../../../components/common/RecordDialog';
import { Button } from '../../../components/common/Button';
import { useConfirmDialog } from '../../../components/common/useConfirmDialog';
import { useLanguage } from '../../../context/LanguageContext';
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Building,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  UserCheck,
  UserX,
  Edit2,
  Lock,
  Trash2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import {
  staffApi,
  StaffSummaryDto,
  CreateStaffPayload,
  UpdateStaffPayload,
} from '../../../services/api/adminApi';

export const StaffAccountsAdminPage: React.FC = () => {
  const { confirm, confirmationDialog } = useConfirmDialog();
  const { t } = useLanguage();
  const [staffList, setStaffList] = useState<StaffSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [campusFilter, setCampusFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailStaff, setDetailStaff] = useState<StaffSummaryDto | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffSummaryDto | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState<CreateStaffPayload>({
    email: '',
    fullName: '',
    staffCode: '',
    role: 'CommunityModerator',
    department: 'Ban Đào Tạo & Khảo Thí',
    campus: 'HL',
    password: 'Staff@123456',
  });

  // Edit form
  const [editForm, setEditForm] = useState<UpdateStaffPayload>({
    fullName: '',
    department: '',
    campus: '',
    role: '',
  });

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const data = await staffApi.getStaffList({
        search: search.trim() || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        campus: campusFilter !== 'ALL' ? campusFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        pageSize: 50,
      });
      if (data && data.items) {
        setStaffList(data.items);
      }
    } catch (err: any) {
      console.warn('Could not fetch staff from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [roleFilter, campusFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStaff();
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await staffApi.createStaff(createForm);
      setFeedback({ type: 'success', message: t("Tạo tài khoản nhân viên \"{p0}\" thành công!", undefined, { p0: createForm.fullName }) });
      setIsCreateModalOpen(false);
      setCreateForm({
        email: '',
        fullName: '',
        staffCode: '',
        role: 'CommunityModerator',
        department: 'Ban Đào Tạo & Khảo Thí',
        campus: 'HL',
        password: 'Staff@123456',
      });
      fetchStaff();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || t("Lỗi khi tạo tài khoản nhân viên.") });
    }
  };

  const openEditModal = (staff: StaffSummaryDto) => {
    setEditingStaff(staff);
    setEditForm({
      fullName: staff.fullName,
      department: staff.department,
      campus: staff.campus,
      role: staff.role,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    try {
      await staffApi.updateStaff(editingStaff.staffId, editForm);
      setFeedback({ type: 'success', message: t("Cập nhật thông tin nhân viên \"{p0}\" thành công!", undefined, { p0: editForm.fullName }) });
      setIsEditModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || t("Lỗi khi cập nhật tài khoản.") });
    }
  };

  const handleToggleStatus = async (staff: StaffSummaryDto) => {
    const newStatus = staff.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionName = newStatus === 'ACTIVE' ? t("Kích hoạt lại") : t("Tạm khóa (Suspended)");

    if (!await confirm(t("{p0} tài khoản \"{p1}\"?", undefined, { p0: actionName, p1: staff.fullName }))) return;

    try {
      await staffApi.updateStatus(staff.staffId, newStatus, t("Thao tác bởi Quản trị viên"));
      setFeedback({ type: 'success', message: t("Đã cập nhật trạng thái thành {p0}.", undefined, { p0: newStatus }) });
      fetchStaff();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || t("Lỗi khi cập nhật trạng thái.") });
    }
  };

  const handleDeleteStaff = async (staff: StaffSummaryDto) => {
    if (!await confirm(t("Xóa vĩnh viễn tài khoản nhân sự \"{p0}\"?", undefined, { p0: staff.fullName }))) return;

    try {
      await staffApi.deleteStaff(staff.staffId);
      setFeedback({ type: 'success', message: t("Đã xóa tài khoản \"{p0}\".", undefined, { p0: staff.fullName }) });
      fetchStaff();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || t("Lỗi khi xóa nhân viên.") });
    }
  };

  return (
    <div className="space-y-6">
      {detailStaff && <RecordDialog title={t('Staff Details')} onClose={() => setDetailStaff(null)} fields={[
        {key:'name', label:'Full Name', value:detailStaff.fullName},
        {key:'code', label:'Staff Code', value:detailStaff.staffCode},
        {key:'email', label:'Email', value:detailStaff.email},
        {key:'role', label:'Role', value:detailStaff.role},
        {key:'campus', label:'Campus', value:detailStaff.campus},
        {key:'department', label:'Department', value:detailStaff.department || ''},
        {key:'status', label:'Status', value:detailStaff.status},
      ]} />}
      {confirmationDialog}
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              {t("Quản lý Tài khoản Cán bộ & Vận hành (Staff Accounts)")}</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {t("Admin Only")}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("Quản trị danh sách nhân sự điều hành: Kiểm duyệt viên (Community Moderator), Đại diện trường (School Rep), Quản trị viên (Admin).")}</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t("Tạo Cán bộ Mới")}</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{t(feedback.message)}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            {t("Đóng")}</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Tìm theo tên, email hoặc mã cán bộ...")}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">{t("Tất cả vai trò")}</option>
            <option value="CommunityModerator">{t("Kiểm duyệt viên (Mod)")}</option>
            <option value="SchoolRepresentative">{t("Đại diện trường (School Rep)")}</option>
            <option value="Admin">{t("Quản trị viên (Admin)")}</option>
          </select>

          <select
            value={campusFilter}
            onChange={(e) => setCampusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">{t("Tất cả phân hiệu")}</option>
            <option value="HL">{t("Hòa Lạc (HL)")}</option>
            <option value="HCM">{t("TP. HCM (HCM)")}</option>
            <option value="DN">{t("Đà Nẵng (DN)")}</option>
            <option value="CT">{t("Cần Thơ (CT)")}</option>
            <option value="QN">{t("Quy Nhơn (QN)")}</option>
          </select>

          <button
            onClick={fetchStaff}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            title={t("Làm mới")}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">{t("Cán bộ")}</th>
                <th className="py-3 px-4">{t("Mã số")}</th>
                <th className="py-3 px-4">{t("Vai trò vận hành")}</th>
                <th className="py-3 px-4">{t("Phòng ban & Cơ sở")}</th>
                <th className="py-3 px-4">{t("Trạng thái")}</th>
                <th className="py-3 px-4 text-right">{t("Thao tác")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {isLoading ? t("Đang tải danh sách cán bộ...") : t("Chưa có cán bộ vận hành nào phù hợp.")}
                  </td>
                </tr>
              ) : (
                staffList.map((s) => (
                  <tr key={s.staffId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-slate-900">{s.fullName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{s.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {s.staffCode}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          s.role === 'Admin'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : s.role === 'CommunityModerator' || s.role === 'Moderator'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {t(s.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{s.department || t("Ban Đào Tạo")}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{t("Cơ sở")} {s.campus}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {t(s.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => setDetailStaff(s)}>{t('View Details')}</Button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title={t("Chỉnh sửa")}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title={s.status === 'ACTIVE' ? t("Tạm khóa") : t("Mở khóa")}
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(s)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={t("Xóa vĩnh viễn")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                {t("Cấp Tài Khoản Cán Bộ Vận Hành Mới")}</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("Họ và tên *")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("Nguyễn Văn A")}
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("Mã nhân sự (Staff Code) *")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("FPT-MOD01")}
                    value={createForm.staffCode}
                    onChange={(e) => setCreateForm({ ...createForm, staffCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t("Email trường *")}</label>
                <input
                  type="email"
                  required
                  placeholder={t("mod.hcm@fpt.edu.vn")}
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("Vai trò vận hành *")}</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="CommunityModerator">{t("Kiểm duyệt viên (Moderator)")}</option>
                    <option value="SchoolRepresentative">{t("Đại diện trường (School Rep)")}</option>
                    <option value="Admin">{t("Quản trị viên (Admin)")}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("Phân hiệu (Campus) *")}</label>
                  <select
                    value={createForm.campus}
                    onChange={(e) => setCreateForm({ ...createForm, campus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="HL">{t("Hòa Lạc (HL)")}</option>
                    <option value="HCM">{t("TP. HCM (HCM)")}</option>
                    <option value="DN">{t("Đà Nẵng (DN)")}</option>
                    <option value="CT">{t("Cần Thơ (CT)")}</option>
                    <option value="QN">{t("Quy Nhơn (QN)")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t("Phòng ban / Bộ môn")}</label>
                <input
                  type="text"
                  placeholder={t("ví dụ: Ban Đào Tạo, Khối Ngành CNTT")}
                  value={createForm.department}
                  onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t("Mật khẩu khởi tạo")}</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {t("Hủy")}</button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {t("Tạo Tài Khoản")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {isEditModalOpen && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                {t("Cập Nhật Cán Bộ:")} {editingStaff.fullName}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t("Họ và tên")}</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("Vai trò")}</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="CommunityModerator">{t("Kiểm duyệt viên (Moderator)")}</option>
                    <option value="SchoolRepresentative">{t("Đại diện trường (School Rep)")}</option>
                    <option value="Admin">{t("Quản trị viên (Admin)")}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t("Phân hiệu")}</label>
                  <select
                    value={editForm.campus}
                    onChange={(e) => setEditForm({ ...editForm, campus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="HL">{t("Hòa Lạc (HL)")}</option>
                    <option value="HCM">{t("TP. HCM (HCM)")}</option>
                    <option value="DN">{t("Đà Nẵng (DN)")}</option>
                    <option value="CT">{t("Cần Thơ (CT)")}</option>
                    <option value="QN">{t("Quy Nhơn (QN)")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t("Phòng ban")}</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {t("Hủy")}</button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {t("Cập Nhật")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
