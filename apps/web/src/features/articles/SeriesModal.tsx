import React, { useState } from 'react';
import { Layers, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Series } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { seriesApi } from '../../services/api/contentApi';

export interface SeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (series: Series) => void;
  initialSeries?: Series;
}

export const SeriesModal: React.FC<SeriesModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialSeries,
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialSeries?.title || '');
  const [description, setDescription] = useState(initialSeries?.description || '');
  const [items, setItems] = useState<Series['items']>(
    initialSeries?.items || []
  );

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<'ARTICLE' | 'WORKFLOW' | 'QUESTION'>('ARTICLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    const newItem = {
      id: `item-${Date.now()}`,
      type: newItemType,
      title: newItemTitle.trim(),
      orderIndex: items.length + 1,
      url: `/articles/art-${Date.now()}`,
    };
    setItems([...items, newItem]);
    setNewItemTitle('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id).map((it, idx) => ({ ...it, orderIndex: idx + 1 })));
  };

  const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const nextItems = [...items];
    const temp = nextItems[index];
    nextItems[index] = nextItems[targetIdx];
    nextItems[targetIdx] = temp;
    setItems(nextItems.map((it, idx) => ({ ...it, orderIndex: idx + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (initialSeries && !isNaN(Number(initialSeries.id))) {
        await seriesApi.updateSeries(initialSeries.id, {
          title: title.trim(),
          description: description.trim(),
          status: 'PUBLISHED',
        });
      } else {
        const created = await seriesApi.createSeries({
          title: title.trim(),
          description: description.trim(),
        });
        if (created) {
          const savedSeries: Series = {
            id: String(created.seriesId),
            title: created.title,
            description: created.description || '',
            author: {
              id: currentUser?.id || 'u-self',
              fullName: currentUser?.fullName || t("Sinh viên FHub"),
              avatarUrl: currentUser?.avatarUrl,
            },
            itemCount: items.length,
            items,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
          };
          onSaved(savedSeries);
          setIsSubmitting(false);
          onClose();
          return;
        }
      }
    } catch (err) {
      console.warn('Backend series API not responding, saving locally', err);
    }

    const savedSeries: Series = {
      id: initialSeries?.id || `series-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      author: {
        id: currentUser?.id || 'u-self',
        fullName: currentUser?.fullName || t("Sinh viên FHub"),
        avatarUrl: currentUser?.avatarUrl,
      },
      itemCount: items.length,
      items,
      createdAt: initialSeries?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaved(savedSeries);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSeries ? t('seriesModal.titleEdit', 'Chỉnh sửa Series chuyên đề') : t('seriesModal.titleCreate', 'Tạo mới Series chuyên đề (Series Management)')}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>{t('common.cancel', 'Hủy')}</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>{initialSeries ? t('seriesModal.saveEdit', 'Cập nhật Series') : t('seriesModal.saveCreate', 'Tạo Series')}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label={t('seriesModal.seriesTitleLabel', 'Tiêu đề Series *')}
          placeholder={t('seriesModal.seriesTitlePlaceholder', 'Ví dụ: Lộ trình làm chủ C# & .NET 9 cho sinh viên SE')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label={t('seriesModal.seriesDescLabel', 'Mô tả mục tiêu của Series')}
          placeholder={t('seriesModal.seriesDescPlaceholder', 'Mô tả ngắn về kiến thức chuỗi bài viết / workflow mang lại...')}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Series Items Manager */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              {t('seriesModal.itemsListHeading', 'Danh sách bài trong Series')} ({items.length})
            </span>
          </div>

          {/* Quick Add Item Bar */}
          <div className="flex gap-2">
            <select
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="ARTICLE">{t("Article")}</option>
              <option value="WORKFLOW">{t("Workflow")}</option>
              <option value="QUESTION">{t("Q&A Post")}</option>
            </select>
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder={t('seriesModal.itemTitlePlaceholder', 'Nhập tên bài viết muốn thêm vào chuỗi...')}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#0076D1]"
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-[#0076D1] text-white rounded-xl text-xs font-bold hover:bg-[#005DA7] transition-colors cursor-pointer"
            >
              {t('seriesModal.addItemBtn', '+ Thêm bài')}
            </button>
          </div>

          {/* Reorderable Items List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0076D1] text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                    {item.type}
                  </span>
                  <span className="font-semibold text-slate-800 truncate">{item.title}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'UP')}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    title={t('seriesModal.moveUp', 'Di chuyển lên')}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => handleMove(idx, 'DOWN')}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    title={t('seriesModal.moveDown', 'Di chuyển xuống')}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                    title={t('seriesModal.removeItem', 'Xóa khỏi series')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};
