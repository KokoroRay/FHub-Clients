import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Pencil
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
  const pageSize = 15;

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

  // Reset page number on filter changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPageNumber(1);
  };

  const handleMajorChange = (val: string) => {
    setSelectedMajorId(val);
    setPageNumber(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setPageNumber(1);
  };

  // Queries & Mutations
  const { data: majorsData } = useMajors({ pageSize: 100 });
  const {
    data: specsData,
    isLoading,
    isRefetching,
    refetch
  } = useSpecializations({
    search: searchQuery.trim() || undefined,
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
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header aligned with Academic Taxonomy (Majors / Campuses / Courses) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>ACADEMIC TAXONOMY</span>
            <span>&gt;</span>
            <span className="text-blue-600">SPECIALIZATIONS ({totalCount})</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Specializations Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic specializations, curriculum alignments, and parent degree tracks across all campuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Refresh specializations"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Specialization</span>
          </button>
        </div>
      </div>

      {/* Toast Notice */}
      {notice && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all animate-fadeIn ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-[10px] font-bold uppercase tracking-wider underline hover:opacity-75 cursor-pointer ml-3"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 4 Stat Cards Row (Consistent with MajorsPage) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL SPECIALIZATIONS</span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{totalCount}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Defined academic sub-tracks</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">ACTIVE TRACKS</span>
          <h3 className="text-2xl font-bold text-emerald-600 tracking-tight mt-1">{activeCount}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Currently enrolling students</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">CURRICULA LINKED</span>
          <h3 className="text-2xl font-bold text-blue-600 tracking-tight mt-1">{totalCurricula}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Roadmap matrices active</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PARENT MAJORS</span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{majors.length}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Undergraduate degree programs</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by specialization code (SE_IS, SE_AI), title, or parent major..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedMajorId}
            onChange={(e) => handleMajorChange(e.target.value)}
            className="w-full md:w-56 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Majors (Degree Tracks)</option>
            {majors.map((m: any) => (
              <option key={m.majorId} value={m.majorId}>
                {m.majorCode} - {m.majorName}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full md:w-36 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <p className="text-xs font-medium text-slate-500">Loading specializations registry...</p>
          </div>
        ) : specializations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No specializations found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No matching records found. Adjust your search keywords or add a new specialization.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">SPECIALIZATION CODE & TITLE</th>
                  <th className="py-3 px-3 font-bold">PARENT MAJOR</th>
                  <th className="py-3 px-3 font-bold text-center">CURRICULA</th>
                  <th className="py-3 px-3 font-bold">STATUS</th>
                  <th className="py-3 px-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {specializations.map((spec) => (
                  <tr key={spec.specializationId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {spec.specializationCode.substring(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono text-blue-600">{spec.specializationCode}</span>
                            <span>- {spec.specializationName}</span>
                          </div>
                          {spec.description && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-md mt-0.5">
                              {spec.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold font-mono text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                        <GraduationCap className="w-3 h-3" />
                        {spec.majorCode}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1.5">{spec.majorName}</span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        {spec.curriculaCount || 0}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {spec.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(spec)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 cursor-pointer"
                        title="Edit specialization"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingSpec(spec)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete specialization"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalCount > 0 && (
          <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing{' '}
              <span className="font-semibold text-slate-800">
                {(pageNumber - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(pageNumber * pageSize, totalCount)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{totalCount}</span> specializations
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageNumber) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const hasGap = prev && p - prev > 1;
                    return (
                      <React.Fragment key={p}>
                        {hasGap && <span className="px-1 text-slate-400">...</span>}
                        <button
                          onClick={() => setPageNumber(p)}
                          className={`w-7 h-7 rounded text-xs font-semibold transition-colors cursor-pointer ${
                            pageNumber === p
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber >= totalPages}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Specialization */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Add Specialization
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Parent Major (Degree Track) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formMajorId}
                  onChange={(e) => setFormMajorId(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="" disabled>-- Select Degree Track --</option>
                  {majors.map((m: any) => (
                    <option key={m.majorId} value={m.majorId}>
                      {m.majorCode} - {m.majorName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Specialization Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SE_IS, SE_AI, IA_NET"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  maxLength={30}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Specialization Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Information Systems, Artificial Intelligence"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  maxLength={200}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe academic focus, specialization competencies..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  maxLength={1000}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="createIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="createIsActive" className="text-xs text-slate-700 cursor-pointer">
                  Activate specialization immediately
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Specialization</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Specialization */}
      {editingSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" /> Edit Specialization: {editingSpec.specializationCode}
              </h2>
              <button
                onClick={() => setEditingSpec(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Specialization Code (Immutable)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingSpec.specializationCode}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Specialization Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  maxLength={200}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  maxLength={1000}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                <label htmlFor="editIsActive" className="text-xs text-slate-700 cursor-pointer">
                  Active in academic catalog
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSpec(null)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Update Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                Delete {deletingSpec.specializationCode}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-800">{deletingSpec.specializationName}</span>?
              </p>
            </div>

            {deletingSpec.curriculaCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  This specialization has <strong>{deletingSpec.curriculaCount} linked curricula</strong>. Deletion will be rejected if curricula exist.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSpec(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleteMutation.isPending}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {deleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Delete Specialization</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
