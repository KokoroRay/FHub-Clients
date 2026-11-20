import { useLanguage } from '../../context/LanguageContext';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Newspaper,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  ImagePlus,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';
import { ArticleEditor, finalizeContentImages } from '../../components/common/ArticleEditor';
import { MarkdownPreview } from '../../components/common/MarkdownPreview';
import {
  newsApi,
  contentMediaApi,
  ArticleListItem,
  ArticleDetailDto,
  ArticleRequest,
} from '../../services/api/contentApi';
import { IMAGE_ACCEPT, validateImage, normalizeMediaUrl } from '../../utils/mediaUtils';
import { useAuth } from '../../context/AuthContext';

export const NewsManagementPage: React.FC = () => {
  const { locale, t } = useLanguage();
  const { currentUser } = useAuth();
  const canManageNews =
    currentUser?.role === 'School Representative' || currentUser?.role === 'Admin';
  const [newsList, setNewsList] = useState<ArticleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<ArticleListItem | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ArticleDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<ArticleRequest>({
    title: '',
    summary: '',
    content: '',
    coverImageUrl: '',
    status: 'PUBLISHED',
  });
  const [editorInitialContent, setEditorInitialContent] = useState('');
  const [editorKey, setEditorKey] = useState(0);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pendingCoverFile = useRef<File | null>(null);
  const originalCoverUrlRef = useRef<string>('');

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const res = await newsApi.getNews({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        pageSize: 50,
      });
      setNewsList(res?.items || []);
    } catch (err: any) {
      console.warn('Failed to load news articles from content-service:', err);
      setNewsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews();
  };

  const resetCoverState = () => {
    if (formData.coverImageUrl && formData.coverImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.coverImageUrl);
    }
    pendingCoverFile.current = null;
    originalCoverUrlRef.current = '';
  };

  const handleSelectCover = (file?: File) => {
    if (!file || formSubmitting || isUploadingCover) return;
    try {
      validateImage(file);
      setFormError(null);
      if (formData.coverImageUrl && formData.coverImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.coverImageUrl);
      }
      pendingCoverFile.current = file;
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, coverImageUrl: previewUrl }));
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : t('Không tải được ảnh bìa. Vui lòng thử lại.')
      );
    }
  };

  const handleRemoveCover = () => {
    const currentCover = formData.coverImageUrl || '';
    if (currentCover.startsWith('blob:')) {
      URL.revokeObjectURL(currentCover);
    } else if (currentCover && currentCover !== originalCoverUrlRef.current) {
      contentMediaApi.deleteMedia(currentCover).catch(() => {});
    }
    pendingCoverFile.current = null;
    setFormData((prev) => ({ ...prev, coverImageUrl: '' }));
  };

  const openCreateModal = () => {
    resetCoverState();
    setFormError(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      coverImageUrl: '',
      status: 'PUBLISHED',
    });
    setEditorInitialContent('');
    setEditorKey((k) => k + 1);
    setIsCreateOpen(true);
  };

  const uploadPendingCoverToR2 = async (): Promise<string> => {
    let finalCoverUrl = formData.coverImageUrl || '';
    if (pendingCoverFile.current) {
      setIsUploadingCover(true);
      try {
        const uploaded = await contentMediaApi.uploadMedia(pendingCoverFile.current, 'article');
        if (finalCoverUrl.startsWith('blob:')) {
          URL.revokeObjectURL(finalCoverUrl);
        }
        finalCoverUrl = uploaded.publicUrl;
        pendingCoverFile.current = null;
      } finally {
        setIsUploadingCover(false);
      }
    }
    return finalCoverUrl;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formSubmitting || isUploadingCover || isUploadingContent) return;
    if (formData.title.trim().length < 8) {
      setFormError(t('Tiêu đề tin tức cần ít nhất 8 ký tự.'));
      return;
    }
    if (!formData.content.trim()) {
      setFormError(t('Vui lòng nhập nội dung chi tiết bản tin.'));
      return;
    }

    setFormError(null);
    setFormSubmitting(true);
    let uploadedCover = '';
    try {
      const finalCoverUrl = await uploadPendingCoverToR2();
      uploadedCover = finalCoverUrl;
      const finalContent = await finalizeContentImages(formData.content.trim(), 'article');

      await newsApi.createNews({
        title: formData.title.trim(),
        summary: formData.summary?.trim() || '',
        content: finalContent,
        coverImageUrl: finalCoverUrl.trim() || undefined,
        status: formData.status || 'PUBLISHED',
      });
      setFeedback({ type: 'success', message: t('Tạo bản tin nhà trường thành công!') });
      setIsCreateOpen(false);
      fetchNews();
    } catch (err: any) {
      if (uploadedCover && !uploadedCover.startsWith('blob:')) {
        contentMediaApi.deleteMedia(uploadedCover).catch(() => {});
      }
      const msg = err.response?.data?.message || err.message || t('Lỗi khi tạo tin tức.');
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openEditModal = async (item: ArticleListItem) => {
    resetCoverState();
    setFormError(null);
    setSelectedNews(item);
    setDetailLoading(true);
    try {
      const detail = await newsApi.getNewsById(item.articleId);
      setSelectedDetail(detail);
      originalCoverUrlRef.current = detail.coverImageUrl || '';
      setFormData({
        title: detail.title,
        summary: detail.summary || '',
        content: detail.content || '',
        coverImageUrl: detail.coverImageUrl || '',
        status: (detail.status as any) || 'PUBLISHED',
      });
      setEditorInitialContent(detail.content || '');
      setEditorKey((k) => k + 1);
      setIsEditOpen(true);
    } catch (err) {
      console.warn('Could not load news detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNews || formSubmitting || isUploadingCover || isUploadingContent) return;
    if (formData.title.trim().length < 8) {
      setFormError(t('Tiêu đề tin tức cần ít nhất 8 ký tự.'));
      return;
    }
    if (!formData.content.trim()) {
      setFormError(t('Vui lòng nhập nội dung chi tiết bản tin.'));
      return;
    }

    setFormError(null);
    setFormSubmitting(true);
    let newlyUploadedCover = '';
    try {
      const hadPendingFile = Boolean(pendingCoverFile.current);
      const finalCoverUrl = await uploadPendingCoverToR2();
      if (hadPendingFile) newlyUploadedCover = finalCoverUrl;

      const finalContent = await finalizeContentImages(formData.content.trim(), 'article');

      await newsApi.updateNews(
        selectedNews.articleId,
        {
          title: formData.title.trim(),
          summary: formData.summary?.trim() || '',
          content: finalContent,
          coverImageUrl: finalCoverUrl.trim() || undefined,
          status: formData.status || 'PUBLISHED',
        },
        selectedDetail?.version ?? selectedNews.version
      );

      if (originalCoverUrlRef.current && originalCoverUrlRef.current !== finalCoverUrl) {
        contentMediaApi.deleteMedia(originalCoverUrlRef.current).catch(() => {});
      }

      setFeedback({ type: 'success', message: t('Cập nhật bản tin thành công!') });
      setIsEditOpen(false);
      fetchNews();
    } catch (err: any) {
      if (newlyUploadedCover) {
        contentMediaApi.deleteMedia(newlyUploadedCover).catch(() => {});
      }
      const msg = err.response?.data?.message || err.message || t('Lỗi khi cập nhật bản tin.');
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDeleteModal = (item: ArticleListItem) => {
    setSelectedNews(item);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedNews) return;
    setFormSubmitting(true);
    try {
      await newsApi.deleteNews(selectedNews.articleId, selectedNews.version);
      setFeedback({ type: 'success', message: t('Đã xóa bản tin nhà trường!') });
      setIsDeleteOpen(false);
      fetchNews();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t('Lỗi khi xóa bản tin.');
      setFeedback({ type: 'error', message: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  const viewDetail = async (item: ArticleListItem) => {
    setSelectedNews(item);
    setDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const detail = await newsApi.getNewsById(item.articleId);
      setSelectedDetail(detail);
    } catch (err) {
      console.warn('Failed to fetch news detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const renderCoverUploader = () => {
    const previewSrc = formData.coverImageUrl
      ? formData.coverImageUrl.startsWith('blob:')
        ? formData.coverImageUrl
        : normalizeMediaUrl(formData.coverImageUrl)
      : '';

    return (
      <div className="space-y-1.5">
        <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
          {t('Ảnh bìa (tùy chọn)')}
        </span>
        <div
          className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 transition-colors hover:border-blue-300"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleSelectCover(event.dataTransfer.files[0]);
          }}
          aria-busy={isUploadingCover}
        >
          {previewSrc ? (
            <>
              <img
                src={previewSrc}
                alt={t('Ảnh bìa bản tin')}
                className="max-h-56 w-full object-cover"
              />
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  disabled={isUploadingCover || formSubmitting}
                  onClick={() => coverInputRef.current?.click()}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-slate-50 cursor-pointer"
                >
                  {t('Thay ảnh')}
                </button>
                <button
                  type="button"
                  aria-label={t('Xóa ảnh bìa')}
                  disabled={isUploadingCover || formSubmitting}
                  onClick={handleRemoveCover}
                  className="rounded-lg bg-white p-1.5 text-rose-600 shadow hover:bg-rose-50 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              disabled={isUploadingCover || formSubmitting}
              onClick={() => coverInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-1.5 p-6 text-slate-500 disabled:opacity-50 cursor-pointer"
            >
              <ImagePlus className="h-6 w-6 text-blue-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {t('Chọn hoặc kéo thả ảnh bìa vào đây')}
              </span>
              <span className="text-[11px] text-slate-400">
                {t('PNG, JPG, WebP hoặc GIF · Tối đa 10MB (Lưu trực tiếp lên R2)')}
              </span>
            </button>
          )}
          {isUploadingCover && (
            <div
              role="status"
              className="absolute inset-0 flex items-center justify-center gap-2 bg-white/85 text-xs text-blue-700 font-semibold"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('Đang tải ảnh bìa lên R2…')}
            </div>
          )}
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          aria-label={t('Chọn ảnh bìa')}
          onChange={(event) => {
            handleSelectCover(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>
    );
  };

  const publishedCount = newsList.filter((n) => n.status === 'PUBLISHED').length;
  const draftCount = newsList.filter((n) => n.status === 'DRAFT').length;

  if (!canManageNews) {
    return <Navigate to="/broadcasts" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Page header: shared neutral surface and primary blue actions. */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900 uppercase tracking-wider">
              {t('School Representative Portal')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-600" />
            <span>{t('Quản lý Tin Tức & Thông Báo Trường (News Management)')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-1 leading-relaxed">
            {t('Kênh truyền thông chính thống từ Đại diện Nhà trường tới toàn thể sinh viên và cán bộ giảng viên FPT.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNews}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            {t('Làm mới')}
          </Button>
          {canManageNews && (
            <Button
              variant="primary"
              size="sm"
              id="btn-create-news"
              onClick={openCreateModal}
              className="shrink-0"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {t('Tạo bản tin mới')}
            </Button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{t(feedback.message)}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0076D1] flex items-center justify-center font-bold">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('Tổng số bản tin')}
              </span>
              <span className="text-xl font-black text-slate-800">{newsList.length}</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('Đang công khai')}
              </span>
              <span className="text-xl font-black text-emerald-600">{publishedCount}</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('Bản nháp (Draft)')}
              </span>
              <span className="text-xl font-black text-amber-600">{draftCount}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardBody className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('Tìm kiếm tiêu đề hoặc nội dung tin tức...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              {t('Tìm')}
            </Button>
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium"
            >
              <option value="ALL">{t('Tất cả trạng thái')}</option>
              <option value="PUBLISHED">{t('PUBLISHED (Công khai)')}</option>
              <option value="DRAFT">{t('DRAFT (Bản nháp)')}</option>
              <option value="ARCHIVED">{t('ARCHIVED (Lưu trữ)')}</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* News Articles List */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-sm text-slate-800">{t('Danh Sách Bản Tin Chính Thức')}</h3>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              {t('news.loadingList', 'Đang tải danh sách tin tức...')}
            </div>
          ) : newsList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              {t('Chưa có bản tin nào. Bấm "Tạo bản tin mới" để bắt đầu.')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">{t('ID / Tiêu đề')}</th>
                    <th className="p-3.5">{t('Tóm tắt')}</th>
                    <th className="p-3.5">{t('Trạng thái')}</th>
                    <th className="p-3.5">{t('Ngày đăng')}</th>
                    <th className="p-3.5 text-right">{t('Thao tác')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {newsList.map((item) => (
                    <tr key={item.articleId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {item.coverImageUrl ? (
                            <img
                              src={normalizeMediaUrl(item.coverImageUrl)}
                              alt=""
                              className="w-12 h-9 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-9 rounded-lg bg-blue-50 text-[#0076D1] flex items-center justify-center font-bold text-[10px] shrink-0">
                              {t('NEWS')}
                            </div>
                          )}
                          <div>
                            <span
                              className="font-bold text-slate-900 block line-clamp-1 hover:text-[#0076D1] cursor-pointer"
                              onClick={() => viewDetail(item)}
                            >
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {t('ID: #')}
                              {item.articleId} · v{item.version}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 max-w-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {item.summary || t('Chưa có tóm tắt ngắn')}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          size="sm"
                          variant={
                            item.status === 'PUBLISHED'
                              ? 'success'
                              : item.status === 'DRAFT'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {t(item.status)}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString(locale)
                          : item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(locale)
                          : '—'}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => viewDetail(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                            title={t('Xem chi tiết')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManageNews && (
                            <>
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                                title={t('Chỉnh sửa')}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(item)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                                title={t('Xóa')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* CREATE MODAL */}
      <Modal
        size="xl"
        isOpen={isCreateOpen}
        onClose={() => {
          resetCoverState();
          setIsCreateOpen(false);
        }}
        title={t('Đăng tin tức nhà trường mới')}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                resetCoverState();
                setIsCreateOpen(false);
              }}
              disabled={formSubmitting}
            >
              {t('Hủy')}
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              isLoading={formSubmitting}
              disabled={isUploadingCover || isUploadingContent}
            >
              {t('Xuất bản tin tức')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          {formError && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              {formError}
            </div>
          )}
          <Input
            label={t('Tiêu đề bản tin *')}
            placeholder={t('Ví dụ: Thông báo Lịch đăng ký Tín chỉ Học kỳ Fall 2026')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          {renderCoverUploader()}
          <Textarea
            label={t('Tóm tắt ngắn (Summary) *')}
            rows={2}
            placeholder={t('Tóm tắt ngắn gọn nội dung thông báo để hiển thị trên bảng tin...')}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            required
          />
          <Suspense
            fallback={
              <p role="status" className="py-6 text-center text-xs text-slate-400">
                {t('Đang tải trình soạn thảo…')}
              </p>
            }
          >
            <ArticleEditor
              key={`news-create-${editorKey}`}
              initialContent={editorInitialContent}
              onChange={(markdown) => setFormData((prev) => ({ ...prev, content: markdown }))}
              onUploadingChange={setIsUploadingContent}
              disabled={formSubmitting}
            />
          </Suspense>
          <Select
            label={t('Trạng thái xuất bản')}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          >
            <option value="PUBLISHED">{t('Công khai ngay (PUBLISHED)')}</option>
            <option value="DRAFT">{t('Lưu bản nháp (DRAFT)')}</option>
          </Select>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        size="xl"
        isOpen={isEditOpen}
        onClose={() => {
          resetCoverState();
          setIsEditOpen(false);
        }}
        title={t('Chỉnh Sửa Bản Tin #{p0}', undefined, { p0: selectedNews?.articleId })}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                resetCoverState();
                setIsEditOpen(false);
              }}
              disabled={formSubmitting}
            >
              {t('Hủy')}
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              isLoading={formSubmitting}
              disabled={isUploadingCover || isUploadingContent}
            >
              {t('Lưu thay đổi')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          {formError && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              {formError}
            </div>
          )}
          <Input
            label={t('Tiêu đề bản tin *')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          {renderCoverUploader()}
          <Textarea
            label={t('Tóm tắt ngắn *')}
            rows={2}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            required
          />
          <Suspense
            fallback={
              <p role="status" className="py-6 text-center text-xs text-slate-400">
                {t('Đang tải trình soạn thảo…')}
              </p>
            }
          >
            <ArticleEditor
              key={`news-edit-${selectedNews?.articleId}-${editorKey}`}
              initialContent={editorInitialContent}
              onChange={(markdown) => setFormData((prev) => ({ ...prev, content: markdown }))}
              onUploadingChange={setIsUploadingContent}
              disabled={formSubmitting}
            />
          </Suspense>
          <Select
            label={t('Trạng thái')}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          >
            <option value="PUBLISHED">{t('PUBLISHED (Công khai)')}</option>
            <option value="DRAFT">{t('DRAFT (Bản nháp)')}</option>
            <option value="ARCHIVED">{t('ARCHIVED (Lưu trữ)')}</option>
          </Select>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={t('Xác nhận xóa bản tin')}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              {t('Hủy')}
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={formSubmitting}>
              {t('Xóa vĩnh viễn')}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            {t('Bạn có chắc chắn muốn xóa bản tin')} <strong>"{selectedNews?.title}"</strong>?
          </p>
          <p className="text-rose-600 font-semibold">
            {t('Hành động này sẽ gỡ bỏ bản tin khỏi trang tin của sinh viên và không thể hoàn tác.')}
          </p>
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        size="lg"
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedDetail?.title || t('Chi tiết bản tin')}
        footer={
          <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
            {t('Đóng')}
          </Button>
        }
      >
        {detailLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {t('news.loadingContent', 'Đang tải nội dung...')}
          </div>
        ) : selectedDetail ? (
          <div className="space-y-4 text-xs">
            {selectedDetail.coverImageUrl && (
              <img
                src={normalizeMediaUrl(selectedDetail.coverImageUrl)}
                alt=""
                className="w-full max-h-60 object-cover rounded-xl"
              />
            )}
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">
                {t(selectedDetail.status)}
              </Badge>
              <span className="text-slate-400">
                {t('Ngày đăng:')}{' '}
                {selectedDetail.publishedAt
                  ? new Date(selectedDetail.publishedAt).toLocaleString(locale)
                  : '—'}
              </span>
            </div>
            {selectedDetail.summary && (
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-blue-900 font-medium">
                {selectedDetail.summary}
              </div>
            )}
            <MarkdownPreview content={selectedDetail.content || ''} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
