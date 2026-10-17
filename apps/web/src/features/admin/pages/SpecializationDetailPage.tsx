import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import {
  useSpecializationDetail,
  useUpdateSpecialization,
  useDeleteSpecialization
} from '../../../services/api';

export const SpecializationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: spec, isLoading, error, refetch } = useSpecializationDetail(id);
  const updateMutation = useUpdateSpecialization();
  const deleteMutation = useDeleteSpecialization();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenEdit = () => {
    if (!spec) return;
    setFormName(spec.specializationName);
    setFormDescription(spec.description || '');
    setFormIsActive(spec.isActive);
    setFormError(null);
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spec) return;
    setFormError(null);

    try {
      await updateMutation.mutateAsync({
        id: spec.specializationId,
        payload: {
          specializationName: formName.trim(),
          description: formDescription.trim() || undefined,
          isActive: formIsActive
        }
      });
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Không thể cập nhật chuyên ngành.');
    }
  };

  const handleDelete = async () => {
    if (!spec) return;

    try {
      await deleteMutation.mutateAsync(spec.specializationId);
      navigate('/specializations');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Không thể xóa chuyên ngành.');
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Đang tải thông tin chuyên ngành...</p>
      </div>
    );
  }

  if (error || !spec) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy chuyên ngành</h2>
        <p className="text-slate-500 text-sm mt-1">Chuyên ngành yêu cầu không tồn tại hoặc đã bị xóa.</p>
        <Link
          to="/specializations"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top breadcrumb & back */}
      <div className="flex items-center justify-between">
        <Link
          to="/specializations"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Chuyên ngành
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenEdit}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Edit2 className="w-4 h-4 text-blue-600" /> Chỉnh sửa
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-white border border-rose-300 text-rose-600 rounded-lg text-sm font-semibold hover:bg-rose-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> Xóa
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
                {spec.specializationCode}
              </span>
              {spec.isActive ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đang hoạt động
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  <XCircle className="w-3.5 h-3.5" /> Tạm dừng
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{spec.specializationName}</h1>
            <p className="text-slate-500 text-sm mt-2 max-w-2xl">
              {spec.description || 'Chưa có mô tả cho chuyên ngành này.'}
            </p>
          </div>

          <div className="flex flex-col items-end border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngành Trực Thuộc</div>
            <Link
              to={`/majors/${spec.majorCode}`}
              className="mt-1 flex items-center gap-2 group text-right"
            >
              <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {spec.majorName}
              </div>
              <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {spec.majorCode}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Curricula & Audit Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curricula list (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Khung Chương Trình Đào Tạo ({spec.curricula?.length || 0})
            </h2>
          </div>

          {spec.curricula && spec.curricula.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {spec.curricula.map((curr: any) => (
                <div key={curr.curriculumId} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {curr.curriculumCode}
                      </span>
                      <span className="font-semibold text-sm text-slate-900">{curr.curriculumName}</span>
                    </div>
                    {curr.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{curr.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Áp dụng từ: {curr.effectiveFromYear}
                      </span>
                      <span>•</span>
                      <span>{curr.totalCourses || 0} môn học</span>
                    </div>
                  </div>

                  <div>
                    {curr.isActive ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Áp dụng
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Hết hiệu lực
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Chưa có khung chương trình nào liên kết với chuyên ngành này.</p>
            </div>
          )}
        </div>

        {/* Audit & Metadata (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" /> Thông Tin Quản Trị
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Specialization ID</div>
              <div className="font-mono font-bold text-slate-700 mt-0.5">#{spec.specializationId}</div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="text-xs font-semibold text-slate-400 uppercase">Thời Gian Tạo</div>
              <div className="text-slate-700 mt-0.5">{new Date(spec.createdAt).toLocaleString('vi-VN')}</div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="text-xs font-semibold text-slate-400 uppercase">Cập Nhật Lần Cuối</div>
              <div className="text-slate-700 mt-0.5">{new Date(spec.updatedAt).toLocaleString('vi-VN')}</div>
            </div>

            {spec.createdByStaffId && (
              <div className="border-t border-slate-100 pt-3">
                <div className="text-xs font-semibold text-slate-400 uppercase">Người Tạo (Staff ID)</div>
                <div className="text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> #{spec.createdByStaffId}
                </div>
              </div>
            )}

            {spec.updatedByStaffId && (
              <div className="border-t border-slate-100 pt-3">
                <div className="text-xs font-semibold text-slate-400 uppercase">Người Sửa (Staff ID)</div>
                <div className="text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> #{spec.updatedByStaffId}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Edit2 className="w-5 h-5 text-blue-600" /> Chỉnh Sửa Chuyên Ngành: {spec.specializationCode}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên chuyên ngành</label>
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
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  maxLength={1000}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="modalIsActive" className="text-sm font-medium text-slate-700">
                  Kích hoạt chuyên ngành
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              Xác nhận xóa chuyên ngành {spec.specializationCode}?
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Bạn có chắc chắn muốn xóa chuyên ngành <span className="font-semibold text-slate-800">{spec.specializationName}</span>?
            </p>

            {spec.curricula && spec.curricula.length > 0 && (
              <div className="my-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Cảnh báo:</strong> Chuyên ngành này đang liên kết với <strong>{spec.curricula.length} khung chương trình</strong>. Hệ thống sẽ chặn xóa để bảo đảm toàn vẹn dữ liệu.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDelete}
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
