import { useLanguage } from '../../context/LanguageContext';
import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Building,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';
import { newsApi, ArticleListItem, ArticleDetailDto, ArticleRequest } from '../../services/api/contentApi';
import { useAuth } from '../../context/AuthContext';

export const NewsManagementPage: React.FC = () => {
  const { locale, t } = useLanguage();
  const { currentUser } = useAuth();
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
  const [formSubmitting, setFormSubmitting] = useState(false);

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

  const openCreateModal = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      coverImageUrl: '',
      status: 'PUBLISHED',
    });
    setIsCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim().length < 8) {
      setFeedback({ type: 'error', message: t("Tiêu đề tin tức cần ít nhất 8 ký tự.") });
      return;
    }
    setFormSubmitting(true);
    try {
      await newsApi.createNews(formData);
      setFeedback({ type: 'success', message: t("Tạo bản tin nhà trường thành công!") });
      setIsCreateOpen(false);
      fetchNews();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t("Lỗi khi tạo tin tức.");
      setFeedback({ type: 'error', message: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  const openEditModal = async (item: ArticleListItem) => {
    setSelectedNews(item);
    setDetailLoading(true);
    try {
      const detail = await newsApi.getNewsById(item.articleId);
      setSelectedDetail(detail);
      setFormData({
        title: detail.title,
        summary: detail.summary || '',
        content: detail.content || '',
        coverImageUrl: detail.coverImageUrl || '',
        status: (detail.status as any) || 'PUBLISHED',
      });
      setIsEditOpen(true);
    } catch (err) {
      console.warn('Could not load news detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNews) return;
    setFormSubmitting(true);
    try {
      await newsApi.updateNews(selectedNews.articleId, formData, selectedNews.version);
      setFeedback({ type: 'success', message: t("Cập nhật bản tin thành công!") });
      setIsEditOpen(false);
      fetchNews();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t("Lỗi khi cập nhật bản tin.");
      setFeedback({ type: 'error', message: msg });
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
      setFeedback({ type: 'success', message: t("Đã xóa bản tin nhà trường!") });
      setIsDeleteOpen(false);
      fetchNews();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t("Lỗi khi xóa bản tin.");
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

  const publishedCount = newsList.filter((n) => n.status === 'PUBLISHED').length;
  const draftCount = newsList.filter((n) => n.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      {/* Page header: shared neutral surface and primary blue actions. */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900 uppercase tracking-wider">
              {t("School Representative Portal")}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-600" />
            <span>{t("Quản lý Tin Tức & Thông Báo Trường (News Management)")}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-1 leading-relaxed">
            {t("Kênh truyền thông chính thống từ Đại diện Nhà trường tới toàn thể sinh viên và cán bộ giảng viên FPT.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNews}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            {t("Làm mới")}</Button>
          <Button
            variant="primary"
            size="sm"
            id="btn-create-news"
            onClick={openCreateModal}
            className="shrink-0"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {t("Tạo bản tin mới")}</Button>
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
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
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
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">{t("Tổng số bản tin")}</span>
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
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">{t("Đang công khai")}</span>
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
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">{t("Bản nháp (Draft)")}</span>
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
                placeholder={t("Tìm kiếm tiêu đề hoặc nội dung tin tức...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">{t("Tìm")}</Button>
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium"
            >
              <option value="ALL">{t("Tất cả trạng thái")}</option>
              <option value="PUBLISHED">{t("PUBLISHED (Công khai)")}</option>
              <option value="DRAFT">{t("DRAFT (Bản nháp)")}</option>
              <option value="ARCHIVED">{t("ARCHIVED (Lưu trữ)")}</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* News Articles List */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-sm text-slate-800">{t("Danh Sách Bản Tin Chính Thức")}</h3>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">{t('news.loadingList', 'Đang tải danh sách tin tức...')}</div>
          ) : newsList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">{t("Chưa có bản tin nào. Bấm \"Tạo bản tin mới\" để bắt đầu.")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">{t("ID / Tiêu đề")}</th>
                    <th className="p-3.5">{t("Tóm tắt")}</th>
                    <th className="p-3.5">{t("Trạng thái")}</th>
                    <th className="p-3.5">{t("Ngày đăng")}</th>
                    <th className="p-3.5 text-right">{t("Thao tác")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {newsList.map((item) => (
                    <tr key={item.articleId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {item.coverImageUrl ? (
                            <img src={item.coverImageUrl} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-9 rounded-lg bg-blue-50 text-[#0076D1] flex items-center justify-center font-bold text-[10px] shrink-0">
                              {t("NEWS")}</div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block line-clamp-1 hover:text-[#0076D1] cursor-pointer" onClick={() => viewDetail(item)}>
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{t("ID: #")}{item.articleId} · v{item.version}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 max-w-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {item.summary || t("Chưa có tóm tắt ngắn")}
                      </td>
                      <td className="p-3.5">
                        <Badge size="sm" variant={item.status === 'PUBLISHED' ? 'success' : item.status === 'DRAFT' ? 'warning' : 'secondary'}>
                          {t(item.status)}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(locale) : item.createdAt ? new Date(item.createdAt).toLocaleDateString(locale) : '—'}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => viewDetail(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                            title={t("Xem chi tiết")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                            title={t("Chỉnh sửa")}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                            title={t("Xóa")}
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
        </CardBody>
      </Card>

      {/* CREATE MODAL */}
      <Modal
        size="lg"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={t("Đăng Tin Tức Nhà Trường Mới")}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{t("Hủy")}</Button>
            <Button variant="primary" onClick={handleCreate} isLoading={formSubmitting}>{t("Xuất bản tin tức")}</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <Input
            label={t("Tiêu đề bản tin *")}
            placeholder={t("Ví dụ: Thông báo Lịch đăng ký Tín chỉ Học kỳ Fall 2026")}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label={t("Ảnh bìa (Cover Image URL)")}
            placeholder={t("https://...")}
            value={formData.coverImageUrl}
            onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
          />
          <Textarea
            label={t("Tóm tắt ngắn (Summary) *")}
            rows={2}
            placeholder={t("Tóm tắt ngắn gọn nội dung thông báo để hiển thị trên bảng tin...")}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            required
          />
          <Textarea
            label={t("Nội dung chi tiết bài viết (Markdown / Text) *")}
            rows={6}
            placeholder={t("Nhập toàn văn thông báo, các mốc thời gian và hướng dẫn cho sinh viên...")}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />
          <Select label={t("Trạng thái xuất bản")}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="PUBLISHED">{t("Công khai ngay (PUBLISHED)")}</option>
              <option value="DRAFT">{t("Lưu bản nháp (DRAFT)")}</option>
            </Select>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        size="lg"
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={t("Chỉnh Sửa Bản Tin #{p0}", undefined, { p0: selectedNews?.articleId })}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>{t("Hủy")}</Button>
            <Button variant="primary" onClick={handleUpdate} isLoading={formSubmitting}>{t("Lưu thay đổi")}</Button>
          </>
        }
      >
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <Input
            label={t("Tiêu đề bản tin *")}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label={t("Ảnh bìa (Cover Image URL)")}
            value={formData.coverImageUrl}
            onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
          />
          <Textarea
            label={t("Tóm tắt ngắn *")}
            rows={2}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            required
          />
          <Textarea
            label={t("Nội dung chi tiết *")}
            rows={6}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />
          <Select label={t("Trạng thái")}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="PUBLISHED">{t("PUBLISHED (Công khai)")}</option>
              <option value="DRAFT">{t("DRAFT (Bản nháp)")}</option>
              <option value="ARCHIVED">{t("ARCHIVED (Lưu trữ)")}</option>
            </Select>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={t("Xác nhận xóa bản tin")}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t("Hủy")}</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={formSubmitting}>{t("Xóa vĩnh viễn")}</Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            {t("Bạn có chắc chắn muốn xóa bản tin")} <strong>"{selectedNews?.title}"</strong>?
          </p>
          <p className="text-rose-600 font-semibold">
            {t("Hành động này sẽ gỡ bỏ bản tin khỏi trang tin của sinh viên và không thể hoàn tác.")}</p>
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedDetail?.title || t("Chi tiết bản tin")}
        footer={<Button variant="outline" onClick={() => setIsDetailOpen(false)}>{t("Đóng")}</Button>}
      >
        {detailLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">{t('news.loadingContent', 'Đang tải nội dung...')}</div>
        ) : selectedDetail ? (
          <div className="space-y-4 text-xs">
            {selectedDetail.coverImageUrl && (
              <img src={selectedDetail.coverImageUrl} alt="" className="w-full max-h-48 object-cover rounded-xl" />
            )}
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">{t(selectedDetail.status)}</Badge>
              <span className="text-slate-400">{t("Ngày đăng:")} {selectedDetail.publishedAt ? new Date(selectedDetail.publishedAt).toLocaleString(locale) : '—'}</span>
            </div>
            {selectedDetail.summary && (
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-blue-900 font-medium">
                {selectedDetail.summary}
              </div>
            )}
            <div className="whitespace-pre-wrap leading-relaxed text-slate-800">
              {selectedDetail.content}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
