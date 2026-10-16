import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  RefreshCw,
  GitMerge,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot,
  Hash,
  Activity,
  Layers,
} from 'lucide-react';
import {
  semanticTagsApi,
  SemanticTagItemDto,
  CreateSemanticTagPayload,
  UpdateSemanticTagPayload,
  MergeSemanticTagsPayload,
} from '../../../services/api/adminApi';
import { useAuth } from '../../../context/AuthContext';

export const SemanticTagsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [tags, setTags] = useState<SemanticTagItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateSemanticTagPayload>({
    tagName: '',
    description: '',
    isAiGenerated: false,
    status: 'ACTIVE',
  });

  const [editingTag, setEditingTag] = useState<SemanticTagItemDto | null>(null);
  const [editForm, setEditForm] = useState<UpdateSemanticTagPayload>({
    tagName: '',
    description: '',
    status: 'ACTIVE',
  });

  const [mergeDestinationId, setMergeDestinationId] = useState<number>(0);
  const [mergeSourceIds, setMergeSourceIds] = useState<number[]>([]);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const data = await semanticTagsApi.getTags({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        pageSize: 50,
      });
      if (data && data.items) {
        setTags(data.items);
      }
    } catch (err: any) {
      console.warn('Could not fetch tags from backend, falling back to cached list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTags();
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.tagName.trim()) return;

    try {
      await semanticTagsApi.createTag(createForm);
      setFeedback({ type: 'success', message: `Thẻ "${createForm.tagName}" đã được tạo thành công!` });
      setIsCreateModalOpen(false);
      setCreateForm({ tagName: '', description: '', isAiGenerated: false, status: 'ACTIVE' });
      fetchTags();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi tạo thẻ mới.' });
    }
  };

  const openEditModal = (tag: SemanticTagItemDto) => {
    setEditingTag(tag);
    setEditForm({
      tagName: tag.tagName,
      description: tag.description || '',
      status: tag.status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !editForm.tagName.trim()) return;

    try {
      await semanticTagsApi.updateTag(editingTag.semanticTagId, editForm);
      setFeedback({ type: 'success', message: `Cập nhật thẻ "${editForm.tagName}" thành công!` });
      setIsEditModalOpen(false);
      fetchTags();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi cập nhật thẻ.' });
    }
  };

  const handleMergeTags = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeDestinationId || mergeSourceIds.length === 0) {
      setFeedback({ type: 'error', message: 'Vui lòng chọn thẻ đích và ít nhất một thẻ nguồn cần gộp.' });
      return;
    }

    try {
      const payload: MergeSemanticTagsPayload = {
        destinationTagId: mergeDestinationId,
        sourceTagIds: mergeSourceIds,
      };
      const res = await semanticTagsApi.mergeTags(payload);
      setFeedback({ type: 'success', message: res.message || 'Gộp thẻ thành công theo quy tắc BR-56!' });
      setIsMergeModalOpen(false);
      setMergeSourceIds([]);
      fetchTags();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi thực hiện gộp thẻ.' });
    }
  };

  const handleDeleteTag = async (tag: SemanticTagItemDto) => {
    if (!window.confirm(`Bạn có chắc muốn vô hiệu hóa / xóa thẻ "${tag.tagName}"?`)) return;

    try {
      await semanticTagsApi.deleteTag(tag.semanticTagId);
      setFeedback({ type: 'success', message: `Đã vô hiệu hóa thẻ "${tag.tagName}".` });
      fetchTags();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi xóa thẻ.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Quản lý Thẻ Ngữ Nghĩa (Semantic Tags)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Taxonomy WBS 18
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý từ khóa tri thức, phân loại nội dung học thuật và hợp nhất thẻ trùng lặp theo quy chuẩn BR-56.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMergeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors cursor-pointer"
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Gộp Thẻ (Merge)</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thẻ Mới</span>
          </button>
        </div>
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
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên thẻ hoặc mô tả..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="MERGED">Đã gộp (MERGED)</option>
            <option value="DEPRECATED">Ngừng dùng (DEPRECATED)</option>
          </select>

          <button
            onClick={fetchTags}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tags Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Tên Thẻ</th>
                <th className="py-3 px-4">Mô tả</th>
                <th className="py-3 px-4">Lượt sử dụng</th>
                <th className="py-3 px-4">Nguồn gốc</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {isLoading ? 'Đang tải dữ liệu thẻ...' : 'Không tìm thấy thẻ ngữ nghĩa nào.'}
                  </td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr key={tag.semanticTagId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-blue-600" />
                        <span>{tag.tagName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {tag.description || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {tag.usageCount ?? 0} bài
                    </td>
                    <td className="py-3 px-4">
                      {tag.isAiGenerated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <Bot className="w-3 h-3" />
                          AI Đề xuất
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          Thủ công
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          tag.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tag.status === 'MERGED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tag.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(tag)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Vô hiệu hóa"
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

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                Tạo Thẻ Ngữ Nghĩa Mới
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTag} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên thẻ (Tag Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: clean-architecture, ef-core"
                  value={createForm.tagName}
                  onChange={(e) => setCreateForm({ ...createForm, tagName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả khái niệm</label>
                <textarea
                  rows={3}
                  placeholder="Giải thích ngắn gọn ý nghĩa và ngữ cảnh sử dụng thẻ..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.isAiGenerated}
                    onChange={(e) => setCreateForm({ ...createForm, isAiGenerated: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Đánh dấu do AI tạo</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                  >
                    Lưu Thẻ
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                Chỉnh Sửa Thẻ: #{editingTag.tagName}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTag} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên thẻ *</label>
                <input
                  type="text"
                  required
                  value={editForm.tagName}
                  onChange={(e) => setEditForm({ ...editForm, tagName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trạng thái</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="DEPRECATED">Ngừng dùng (DEPRECATED)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MERGE MODAL */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-indigo-600" />
                Gộp Thẻ Ngữ Nghĩa (Merge Tags - BR-56)
              </h3>
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800">
              <span className="font-bold">Quy tắc BR-56:</span> Khi gộp thẻ, toàn bộ bài viết và tài liệu gắn thẻ nguồn
              sẽ được chuyển sang thẻ đích. Thẻ nguồn sẽ tự động chuyển sang trạng thái <strong>MERGED</strong>.
            </div>

            <form onSubmit={handleMergeTags} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thẻ Đích (Giữ lại)</label>
                <select
                  value={mergeDestinationId}
                  onChange={(e) => setMergeDestinationId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value={0}>-- Chọn thẻ đích chuẩn --</option>
                  {tags
                    .filter((t) => t.status === 'ACTIVE')
                    .map((t) => (
                      <option key={t.semanticTagId} value={t.semanticTagId}>
                        #{t.tagName} ({t.usageCount} bài viết)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chọn các thẻ nguồn cần gộp vào thẻ đích:
                </label>
                <div className="max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  {tags
                    .filter((t) => t.semanticTagId !== mergeDestinationId)
                    .map((t) => (
                      <label
                        key={t.semanticTagId}
                        className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={mergeSourceIds.includes(t.semanticTagId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMergeSourceIds([...mergeSourceIds, t.semanticTagId]);
                            } else {
                              setMergeSourceIds(mergeSourceIds.filter((id) => id !== t.semanticTagId));
                            }
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span className="font-medium text-slate-800">#{t.tagName}</span>
                        <span className="text-[10px] text-slate-400">({t.status})</span>
                      </label>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMergeModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!mergeDestinationId || mergeSourceIds.length === 0}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Xác nhận Gộp ({mergeSourceIds.length} thẻ)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
