import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Send, Edit2, Trash2, Eye, Newspaper } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';
import { broadcastApi } from '../../services/api/studentApi';
import { newsApi } from '../../services/api/contentApi';

interface Broadcast {
  id: string;
  itemType: 'BROADCAST' | 'NEWS';
  title: string;
  content: string;
  summary?: string;
  coverImageUrl?: string;
  senderDept: string;
  targetCampus: string;
  targetMajor: string;
  targetCampusCode?: string;
  targetMajorCode?: string;
  createdAt: string;
}

export const OfficialBroadcastsPage: React.FC = () => {
  const { formatDate, t } = useLanguage();
  const { currentUser } = useAuth();
  const canManageBroadcasts =
    currentUser?.role === 'School Representative' || currentUser?.role === 'Admin';

  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(null);
  const [deletingBroadcast, setDeletingBroadcast] = useState<Broadcast | null>(null);
  const [viewingBroadcast, setViewingBroadcast] = useState<Broadcast | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetCampus, setTargetCampus] = useState('ALL');
  const [targetMajor, setTargetMajor] = useState('ALL');

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const [broadcastRes, newsRes] = await Promise.all([
        broadcastApi.getBroadcasts({ page_size: 20 }).catch(() => ({ items: [], total_count: 0 })),
        newsApi.getNews({ status: 'PUBLISHED', pageSize: 20 }).catch(() => ({ items: [] })),
      ]);

      const mappedBroadcasts: Broadcast[] = (broadcastRes?.items || []).map((b) => ({
        id: String(b.campaignId),
        itemType: 'BROADCAST',
        title: b.title,
        content: b.body,
        senderDept: 'Đại diện Nhà trường (School Representative)',
        targetCampus: b.targetCampusId ? `Campus #${b.targetCampusId}` : t('Toàn bộ 5 Campus'),
        targetMajor: b.targetMajorId
          ? t('Ngành #{p0}', undefined, { p0: b.targetMajorId })
          : t('Tất cả chuyên ngành'),
        targetCampusCode: b.targetCampusId ? String(b.targetCampusId) : 'ALL',
        targetMajorCode: b.targetMajorId ? String(b.targetMajorId) : 'ALL',
        createdAt: b.createdAt || new Date().toISOString(),
      }));

      const mappedNews: Broadcast[] = (newsRes?.items || []).map((n: any) => ({
        id: `news-${n.articleId}`,
        itemType: 'NEWS',
        title: n.title,
        summary: n.summary || '',
        content: n.content || n.summary || '',
        coverImageUrl: n.coverImageUrl || '',
        senderDept: 'Tin tức Nhà trường (School News)',
        targetCampus: t('Toàn bộ 5 Campus'),
        targetMajor: t('Tất cả chuyên ngành'),
        createdAt: n.publishedAt || n.createdAt || new Date().toISOString(),
      }));

      const combined = [...mappedBroadcasts, ...mappedNews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBroadcasts(combined);
    } catch (err) {
      console.warn('Backend broadcasts unavailable:', err);
      setBroadcasts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const openViewDetail = async (bc: Broadcast) => {
    setViewingBroadcast(bc);
    if (bc.itemType === 'BROADCAST' && !bc.id.startsWith('b-')) {
      setDetailLoading(true);
      try {
        const detail = await broadcastApi.getBroadcastById(bc.id);
        if (detail) {
          setViewingBroadcast({
            ...bc,
            title: detail.title || bc.title,
            content: detail.body || bc.content,
          });
        }
      } catch {
        // keep card data
      } finally {
        setDetailLoading(false);
      }
    } else if (bc.itemType === 'NEWS') {
      const numericId = bc.id.replace('news-', '');
      setDetailLoading(true);
      try {
        const detail = await newsApi.getNewsById(numericId);
        if (detail) {
          setViewingBroadcast({
            ...bc,
            title: detail.title || bc.title,
            content: detail.content || detail.summary || bc.content,
            summary: detail.summary || bc.summary,
            coverImageUrl: detail.coverImageUrl || bc.coverImageUrl,
          });
        }
      } catch {
        // keep card data
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const openCreateModal = () => {
    setEditingBroadcast(null);
    setTitle('');
    setContent('');
    setTargetCampus('ALL');
    setTargetMajor('ALL');
    setIsModalOpen(true);
  };

  const openEditModal = (bc: Broadcast) => {
    setEditingBroadcast(bc);
    setTitle(bc.title);
    setContent(bc.content);
    setTargetCampus(bc.targetCampusCode || 'ALL');
    setTargetMajor(bc.targetMajorCode || 'ALL');
    setIsModalOpen(true);
  };

  const handleSaveBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    const audienceType =
      targetCampus !== 'ALL' ? 'CAMPUS' : targetMajor !== 'ALL' ? 'MAJOR' : 'ALL';

    try {
      if (editingBroadcast) {
        // UC23.2: Update Official Broadcast
        const updated = await broadcastApi.updateBroadcast(editingBroadcast.id, {
          title: title.trim(),
          body: content.trim(),
          audienceType,
          deliveryChannels: 'IN_APP',
          isMandatory: true,
        });
        setBroadcasts((prev) =>
          prev.map((item) =>
            item.id === editingBroadcast.id
              ? {
                  ...item,
                  title: updated?.title || title.trim(),
                  content: updated?.body || content.trim(),
                  targetCampus: targetCampus === 'ALL' ? t('Toàn bộ 5 Campus') : targetCampus,
                  targetMajor: targetMajor === 'ALL' ? t('Tất cả chuyên ngành') : targetMajor,
                  targetCampusCode: targetCampus,
                  targetMajorCode: targetMajor,
                }
              : item
          )
        );
      } else {
        // UC23.1: Create Official Broadcast with Filters
        const created = await broadcastApi.createBroadcast({
          title: title.trim(),
          body: content.trim(),
          audienceType,
          deliveryChannels: 'IN_APP',
          isMandatory: true,
        });
        const newB: Broadcast = {
          id: created?.campaignId ? String(created.campaignId) : `b-${Date.now()}`,
          itemType: 'BROADCAST',
          title: created?.title || title.trim(),
          content: created?.body || content.trim(),
          senderDept: 'Đại diện Nhà trường (School Representative)',
          targetCampus: targetCampus === 'ALL' ? t('Toàn bộ 5 Campus') : targetCampus,
          targetMajor: targetMajor === 'ALL' ? t('Tất cả chuyên ngành') : targetMajor,
          targetCampusCode: targetCampus,
          targetMajorCode: targetMajor,
          createdAt: created?.createdAt || new Date().toISOString(),
        };
        setBroadcasts((prev) => [newB, ...prev]);
      }
      setIsModalOpen(false);
      setEditingBroadcast(null);
      setTitle('');
      setContent('');
    } catch (err) {
      console.warn('Backend broadcast save failed, updating local view:', err);
      if (editingBroadcast) {
        setBroadcasts((prev) =>
          prev.map((item) =>
            item.id === editingBroadcast.id
              ? {
                  ...item,
                  title: title.trim(),
                  content: content.trim(),
                  targetCampus: targetCampus === 'ALL' ? t('Toàn bộ 5 Campus') : targetCampus,
                  targetMajor: targetMajor === 'ALL' ? t('Tất cả chuyên ngành') : targetMajor,
                  targetCampusCode: targetCampus,
                  targetMajorCode: targetMajor,
                }
              : item
          )
        );
      } else {
        const newB: Broadcast = {
          id: `b-${Date.now()}`,
          itemType: 'BROADCAST',
          title: title.trim(),
          content: content.trim(),
          senderDept: 'Đại diện Nhà trường (School Representative)',
          targetCampus: targetCampus === 'ALL' ? t('Toàn bộ 5 Campus') : targetCampus,
          targetMajor: targetMajor === 'ALL' ? t('Tất cả chuyên ngành') : targetMajor,
          targetCampusCode: targetCampus,
          targetMajorCode: targetMajor,
          createdAt: new Date().toISOString(),
        };
        setBroadcasts((prev) => [newB, ...prev]);
      }
      setIsModalOpen(false);
      setEditingBroadcast(null);
      setTitle('');
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBroadcast) return;
    setSubmitting(true);
    try {
      // UC23.3: Delete Official Broadcast
      await broadcastApi.deleteBroadcast(deletingBroadcast.id);
    } catch (err) {
      console.warn('Backend broadcast delete notice:', err);
    } finally {
      setBroadcasts((prev) => prev.filter((item) => item.id !== deletingBroadcast.id));
      setDeletingBroadcast(null);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <span>{t('Official School Broadcasts & Announcements')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('Kênh thông báo chính thức và tin tức từ Nhà trường theo Campus và Chuyên ngành.')}
          </p>
        </div>

        {canManageBroadcasts && (
          <Button
            variant="primary"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-xs"
          >
            {t('Phát thông báo chính thức')}
          </Button>
        )}
      </div>

      {/* Broadcasts & Official Announcements List (UC19.2) */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-400 border border-slate-100 dark:border-slate-800 shadow-xs">
            <p className="text-xs">{t('broadcasts.loading', 'Đang tải thông báo chính thức...')}</p>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-400 border border-slate-100 dark:border-slate-800 shadow-xs">
            <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('broadcasts.emptyTitle', 'Chưa có thông báo chính thức nào')}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {t('broadcasts.emptyDesc', 'Các thông báo mới từ Nhà trường sẽ xuất hiện tại đây.')}
            </p>
          </div>
        ) : (
          broadcasts.map((bc) => (
            <Card key={bc.id} className="border-blue-200 dark:border-blue-900 bg-blue-50/20">
              <CardBody className="p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={bc.itemType === 'NEWS' ? 'success' : 'primary'} size="md">
                      {bc.itemType === 'NEWS' ? (
                        <span className="inline-flex items-center gap-1">
                          <Newspaper className="w-3 h-3" /> {t('SCHOOL NEWS')}
                        </span>
                      ) : (
                        t('OFFICIAL')
                      )}
                    </Badge>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {bc.senderDept}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>
                      {t('Cơ sở:')}{' '}
                      <strong className="text-slate-700 dark:text-slate-300">{bc.targetCampus}</strong>
                    </span>
                    <span>
                      {t('• Ngành:')}{' '}
                      <strong className="text-slate-700 dark:text-slate-300">{t(bc.targetMajor)}</strong>
                    </span>
                    <span>• {formatDate(bc.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <h2
                      onClick={() => openViewDetail(bc)}
                      className="text-base font-extrabold text-slate-900 dark:text-slate-100 hover:text-[#0076D1] cursor-pointer transition-colors"
                    >
                      {bc.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 whitespace-pre-line">
                      {bc.summary || bc.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewDetail(bc)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      {t('Xem chi tiết')}
                    </Button>
                    {canManageBroadcasts && bc.itemType === 'BROADCAST' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(bc)}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          {t('Chỉnh sửa')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingBroadcast(bc)}
                          leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                          className="text-rose-600 hover:bg-rose-50 border-rose-200"
                        >
                          {t('Xóa')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* View Detail Modal (UC19.1) */}
      <Modal
        isOpen={Boolean(viewingBroadcast)}
        onClose={() => setViewingBroadcast(null)}
        title={viewingBroadcast?.title || t('Chi tiết thông báo chính thức')}
        size="lg"
        footer={
          <Button variant="primary" onClick={() => setViewingBroadcast(null)}>
            {t('Đóng')}
          </Button>
        }
      >
        {viewingBroadcast && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Badge variant={viewingBroadcast.itemType === 'NEWS' ? 'success' : 'primary'} size="sm">
                {viewingBroadcast.itemType === 'NEWS' ? t('SCHOOL NEWS') : t('OFFICIAL')}
              </Badge>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {viewingBroadcast.senderDept}
              </span>
              <span>• {viewingBroadcast.targetCampus}</span>
              <span>• {viewingBroadcast.targetMajor}</span>
              <span>• {formatDate(viewingBroadcast.createdAt)}</span>
            </div>

            {viewingBroadcast.coverImageUrl && (
              <img
                src={viewingBroadcast.coverImageUrl}
                alt={viewingBroadcast.title}
                className="w-full max-h-64 object-cover rounded-xl border border-slate-100 dark:border-slate-800"
              />
            )}

            {detailLoading ? (
              <p className="text-xs text-slate-400 py-4">{t('Đang tải chi tiết...')}</p>
            ) : (
              <div className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {viewingBroadcast.content}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create / Edit Broadcast Modal (UC23.1 & UC23.2) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBroadcast(null);
        }}
        title={
          editingBroadcast
            ? t('Chỉnh sửa thông báo chính thức')
            : t('Soạn thông báo chính thức từ Nhà trường')
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingBroadcast(null);
              }}
            >
              {t('Hủy')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveBroadcast}
              disabled={submitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              {editingBroadcast ? t('Lưu thay đổi') : t('Phát thông báo')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveBroadcast} className="space-y-4 text-xs">
          <Input
            label={t('Tiêu đề thông báo')}
            placeholder={t('Ví dụ: Thông báo về thời gian nộp đồ án tốt nghiệp Fall 2026')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('Cơ sở tiếp nhận')}
              value={targetCampus}
              onChange={(e) => setTargetCampus(e.target.value)}
              options={[
                { value: 'ALL', label: t('Toàn bộ 5 Campus') },
                { value: 'HL', label: t('HL - FPTU Hòa Lạc') },
                { value: 'HCM', label: t('HCM - FPTU TP. Hồ Chí Minh') },
                { value: 'DN', label: t('DN - FPTU Đà Nẵng') },
                { value: 'CT', label: t('CT - FPTU Cần Thơ') },
                { value: 'QN', label: t('QN - FPTU Quy Nhơn') },
              ]}
            />
            <Select
              label={t('Chuyên ngành tiếp nhận')}
              value={targetMajor}
              onChange={(e) => setTargetMajor(e.target.value)}
              options={[
                { value: 'ALL', label: t('Tất cả chuyên ngành') },
                { value: 'SE', label: t('Kỹ thuật phần mềm (SE)') },
                { value: 'IA', label: t('An toàn thông tin (IA)') },
                { value: 'AI', label: t('Trí tuệ nhân tạo (AI)') },
              ]}
            />
          </div>

          <Textarea
            label={t('Nội dung thông báo chi tiết')}
            placeholder={t('Nhập nội dung đầy đủ...')}
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal (UC23.3) */}
      <Modal
        isOpen={Boolean(deletingBroadcast)}
        onClose={() => setDeletingBroadcast(null)}
        title={t('Xác nhận xóa thông báo chính thức')}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeletingBroadcast(null)}>
              {t('Hủy')}
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmDelete}
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {t('Xác nhận xóa')}
            </Button>
          </>
        }
      >
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {t('Bạn có chắc chắn muốn xóa thông báo')} <strong>"{deletingBroadcast?.title}"</strong>?
        </p>
      </Modal>
    </div>
  );
};
