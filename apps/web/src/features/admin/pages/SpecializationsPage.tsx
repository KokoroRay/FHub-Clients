import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Filter,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit2,
  ChevronRight,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  useSpecializations,
  useMajors,
  useCreateSpecialization,
  useUpdateSpecialization,
  useDeleteSpecialization,
  SpecializationItemDto
} from '../../../services/api';

export const SpecializationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajorId, setSelectedMajorId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 20;

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSpec, setEditingSpec] = useState<SpecializationItemDto | null>(null);
  const [deletingSpec, setDeletingSpec] = useState<SpecializationItemDto | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formMajorId, setFormMajorId] = useState<number | ''>('');
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Queries & Mutations
  const { data: majorsData } = useMajors({ pageSize: 100 });
  const {
    data: specsData,
    isLoading,
    isRefetching,
    refetch
  } = useSpecializations({
    search: searchQuery || undefined,
    majorId: selectedMajorId !== 'ALL' ? Number(selectedMajorId) : undefined,
    isActive: selectedStatus !== 'ALL' ? selectedStatus === 'ACTIVE' : undefined,
    pageNumber,
    pageSize
  });

  const createMutation = useCreateSpecialization();
  const updateMutation = useUpdateSpecialization();
  const deleteMutation = useDeleteSpecialization();

  const specializations: SpecializationItemDto[] = specsData?.items || [];
  const totalCount: number = specsData?.totalCount || 0;
  const majors = majorsData?.items || [];

  // Metrics
  const activeCount = specializations.filter((s) => s.isActive).length;
  const totalCurricula = specializations.reduce((sum, s) => sum + (s.curriculaCount || 0), 0);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleOpenCreate = () => {
    setFormMajorId(majors.length > 0 ? majors[0].majorId : '');
    setFormCode('');
    setFormName('');
    setFormDescription('');
    setFormIsActive(true);
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (spec: SpecializationItemDto) => {
    setEditingSpec(spec);
    setFormName(spec.specializationName);
    setFormDescription(spec.description || '');
    setFormIsActive(spec.isActive);
    setFormError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formMajorId) {
      setFormError('Vui lòng chọn ngành đào tạo trực thuộc.');
      return;
    }
    if (!formCode.trim()) {
      setFormError('Mã chuyên ngành không được để trống.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Tên chuyên ngành không được để trống.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        majorId: Number(formMajorId),
        specializationCode: formCode.trim().toUpperCase(),
        specializationName: formName.trim(),
        description: formDescription.trim() || undefined,
        isActive: formIsActive
      });

      setShowCreateModal(false);
      showNotification('success', `Đã tạo thành công chuyên ngành ${formCode.toUpperCase()}`);
      refetch();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể tạo chuyên ngành.';
      setFormError(msg);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpec) return;
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Tên chuyên ngành không được để trống.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingSpec.specializationId,
        payload: {
          specializationName: formName.trim(),
          description: formDescription.trim() || undefined,
          isActive: formIsActive
        }
      });

      setEditingSpec(null);
      showNotification('success', `Cập nhật thành công chuyên ngành ${editingSpec.specializationCode}`);
      refetch();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật chuyên ngành.';
      setFormError(msg);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingSpec) return;

    try {
      await deleteMutation.mutateAsync(deletingSpec.specializationId);
      setDeletingSpec(null);
      showNotification('success', `Đã xóa chuyên ngành ${deletingSpec.specializationCode}`);
      refetch();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa chuyên ngành.';
      showNotification('error', msg);
      setDeletingSpec(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notice */}
      {notice && (
        <div
          className={`p-4 rounded-xl shadow-lg border flex items-center justify-between transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="font-medium text-sm">{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-xs font-semibold uppercase tracking-wider underline hover:opacity-75"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-sky-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" /> Academic Taxonomy
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Specialization Management</h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            Quản lý danh mục chuyên ngành hẹp trực thuộc ngành đào tạo (Majors), cấu hình khung chương trình (Curricula) và định hướng học tập.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all flex items-center justify-center"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Thêm Chuyên Ngành
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Chuyên Ngành</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{totalCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Đang Hoạt Động</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Khung Đào Tạo (Curricula)</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{totalCurricula}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">Ngành Liên Kết</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{majors.length}</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã, tên chuyên ngành, tên ngành..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMajorId}
              onChange={(e) => setSelectedMajorId(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả ngành (Majors)</option>
              {majors.map((m: any) => (
                <option key={m.majorId} value={m.majorId}>
                  {m.majorCode} - {m.majorName}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã vô hiệu hóa</option>
          </select>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Đang tải danh sách chuyên ngành...</p>
          </div>
        ) : specializations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">Không tìm thấy chuyên ngành nào</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Thử thay đổi bộ lọc tìm kiếm hoặc nhấn nút "Thêm Chuyên Ngành" để tạo chuyên ngành mới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Mã Chuyên Ngành</th>
                  <th className="py-3.5 px-4">Tên Chuyên Ngành</th>
                  <th className="py-3.5 px-4">Ngành Trực Thuộc</th>
                  <th className="py-3.5 px-4 text-center">Khung ĐT</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {specializations.map((spec) => (
                  <tr key={spec.specializationId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {spec.specializationCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{spec.specializationName}</div>
                      {spec.description && (
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-md mt-0.5">
                          {spec.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {spec.majorCode}
                      </span>
                      <span className="text-xs text-slate-600 ml-2">{spec.majorName}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        {spec.curriculaCount || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {spec.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          <XCircle className="w-3.5 h-3.5" /> Tạm dừng
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/specializations/${spec.specializationId}`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(spec)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSpec(spec)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa chuyên ngành"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-indigo-600" /> Tạo Mới Chuyên Ngành
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ngành đào tạo trực thuộc (Major) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formMajorId}
                  onChange={(e) => setFormMajorId(Number(e.target.value))}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>-- Chọn ngành --</option>
                  {majors.map((m: any) => (
                    <option key={m.majorId} value={m.majorId}>
                      {m.majorCode} - {m.majorName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mã chuyên ngành (Specialization Code) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: SE_IS, SE_AI, IA_NET"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  maxLength={30}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase font-mono focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-400 mt-1">Chữ cái tiếng Anh, số, dấu gạch nối/dưới, tối đa 30 ký tự.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tên chuyên ngành (Specialization Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Hệ thống thông tin, Trí tuệ nhân tạo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  maxLength={200}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mô tả</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả định hướng đào tạo, kiến thức chuyên sâu..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  maxLength={1000}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="createIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="createIsActive" className="text-sm font-medium text-slate-700">
                  Kích hoạt chuyên ngành này ngay sau khi tạo
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Tạo Chuyên Ngành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Edit2 className="w-5 h-5 text-blue-600" /> Cập Nhật Chuyên Ngành: {editingSpec.specializationCode}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mã chuyên ngành (Không thể thay đổi)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingSpec.specializationCode}
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tên chuyên ngành <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  maxLength={200}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mô tả</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  maxLength={1000}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="editIsActive" className="text-sm font-medium text-slate-700">
                  Trạng thái hoạt động (Active)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSpec(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              Xác nhận xóa chuyên ngành {deletingSpec.specializationCode}?
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Bạn có chắc chắn muốn xóa chuyên ngành <span className="font-semibold text-slate-800">{deletingSpec.specializationName}</span>?
            </p>

            {deletingSpec.curriculaCount > 0 && (
              <div className="my-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Cảnh báo:</strong> Chuyên ngành này đang liên kết với <strong>{deletingSpec.curriculaCount} khung chương trình</strong>. Hệ thống sẽ chặn xóa để bảo đảm toàn vẹn dữ liệu. Vui lòng chuyển hoặc hủy liên kết khung chương trình trước, hoặc chỉ vô hiệu hóa trạng thái chuyên ngành.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingSpec(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleteMutation.isPending}
                className="px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
