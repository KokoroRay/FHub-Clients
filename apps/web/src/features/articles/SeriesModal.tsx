import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Check,
  Loader2,
  FileText,
  GitBranch,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Series } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  seriesApi,
  articleApi,
  workflowApi,
  questionApi,
} from '../../services/api/contentApi';

export interface SeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (series: Series) => void;
  initialSeries?: Series;
}

type SeriesContentType = 'ARTICLE' | 'WORKFLOW' | 'QUESTION';

interface UserContentOption {
  contentId: number;
  type: SeriesContentType;
  title: string;
  status?: string;
  createdAt?: string;
  url: string;
}

const getContentUrl = (type: SeriesContentType, contentId: number): string => {
  if (type === 'WORKFLOW') return `/workflows/${contentId}`;
  if (type === 'QUESTION') return `/discussions/${contentId}`;
  return `/articles/${contentId}`;
};

const getTypeBadgeStyle = (type: SeriesContentType): string => {
  if (type === 'WORKFLOW') return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800';
  if (type === 'QUESTION') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  return 'bg-blue-50 text-[#0076D1] border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
};

const getTypeLabel = (type: SeriesContentType, t: (key: string, fallback?: string) => string): string => {
  if (type === 'WORKFLOW') return t('Workflow');
  if (type === 'QUESTION') return t('Q&A');
  return t('Article');
};

const getContentKey = (type: SeriesContentType, contentId?: number, fallbackId?: string): string =>
  `${type}_${contentId ?? fallbackId ?? ''}`;

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
  const [items, setItems] = useState<Series['items']>(initialSeries?.items || []);

  const [userContents, setUserContents] = useState<UserContentOption[]>([]);
  const [isLoadingContents, setIsLoadingContents] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | SeriesContentType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form state whenever modal opens or initialSeries changes
  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialSeries?.title || '');
    setDescription(initialSeries?.description || '');
    setItems(initialSeries?.items || []);
    setFilterType('ALL');
    setSearchQuery('');
    setErrorMessage(null);
  }, [isOpen, initialSeries]);

  // Fetch logged-in user's own Articles, Workflows, and Q&A Questions
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const loadUserContents = async () => {
      setIsLoadingContents(true);
      const numericUserId = currentUser?.id ? Number(String(currentUser.id).replace(/\D/g, '')) : undefined;

      const [articlesRes, workflowsRes, questionsRes] = await Promise.allSettled([
        articleApi.getArticles({ mine: true, pageSize: 100 }),
        workflowApi.getWorkflows({
          authorId: numericUserId && !isNaN(numericUserId) ? numericUserId : undefined,
          pageSize: 100,
        }),
        questionApi.getQuestions({ mine: true, pageSize: 100 }),
      ]);

      if (!isMounted) return;

      const merged: UserContentOption[] = [];

      if (articlesRes.status === 'fulfilled' && articlesRes.value?.items) {
        for (const art of articlesRes.value.items) {
          if (art.status === 'DELETED') continue;
          merged.push({
            contentId: art.articleId,
            type: 'ARTICLE',
            title: art.title,
            status: art.status,
            createdAt: art.createdAt,
            url: getContentUrl('ARTICLE', art.articleId),
          });
        }
      }

      if (workflowsRes.status === 'fulfilled' && workflowsRes.value?.items) {
        for (const wf of workflowsRes.value.items) {
          if (wf.status === 'DELETED') continue;
          if (numericUserId && wf.authorUserId && Number(wf.authorUserId) !== numericUserId) continue;
          merged.push({
            contentId: wf.workflowId,
            type: 'WORKFLOW',
            title: wf.title,
            status: wf.status,
            createdAt: wf.createdAt,
            url: getContentUrl('WORKFLOW', wf.workflowId),
          });
        }
      }

      if (questionsRes.status === 'fulfilled' && questionsRes.value?.items) {
        for (const q of questionsRes.value.items) {
          if (q.status === 'DELETED') continue;
          merged.push({
            contentId: q.questionId,
            type: 'QUESTION',
            title: q.title,
            status: q.status,
            createdAt: q.createdAt,
            url: getContentUrl('QUESTION', q.questionId),
          });
        }
      }

      merged.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });

      setUserContents(merged);
      setIsLoadingContents(false);
    };

    void loadUserContents();
    return () => {
      isMounted = false;
    };
  }, [isOpen, currentUser?.id]);

  const selectedKeys = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      const parsedId = it.contentId ?? Number((it.url || '').split('/').pop());
      set.add(getContentKey(it.type, !isNaN(parsedId) && parsedId > 0 ? parsedId : undefined, it.id));
    }
    return set;
  }, [items]);

  const typeCounts = useMemo(() => {
    return {
      ALL: userContents.length,
      ARTICLE: userContents.filter((c) => c.type === 'ARTICLE').length,
      WORKFLOW: userContents.filter((c) => c.type === 'WORKFLOW').length,
      QUESTION: userContents.filter((c) => c.type === 'QUESTION').length,
    };
  }, [userContents]);

  const filteredContents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return userContents.filter((c) => {
      if (filterType !== 'ALL' && c.type !== filterType) return false;
      if (q && !c.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [userContents, filterType, searchQuery]);

  const handleToggleOption = (option: UserContentOption) => {
    const key = getContentKey(option.type, option.contentId);
    if (selectedKeys.has(key)) {
      setItems((prev) =>
        prev
          .filter((it) => {
            const parsedId = it.contentId ?? Number((it.url || '').split('/').pop());
            return getContentKey(it.type, !isNaN(parsedId) && parsedId > 0 ? parsedId : undefined, it.id) !== key;
          })
          .map((it, idx) => ({ ...it, orderIndex: idx + 1 }))
      );
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: `new-${option.type}-${option.contentId}`,
        contentId: option.contentId,
        type: option.type,
        title: option.title,
        orderIndex: prev.length + 1,
        url: option.url,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) =>
      prev.filter((it) => it.id !== id).map((it, idx) => ({ ...it, orderIndex: idx + 1 }))
    );
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

  const resolveContentId = (item: Series['items'][number]): number | undefined => {
    if (item.contentId && item.contentId > 0) return item.contentId;
    const fromUrl = Number((item.url || '').split('/').pop());
    return !isNaN(fromUrl) && fromUrl > 0 ? fromUrl : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let savedSeriesId: number | null = null;
      let createdAt = initialSeries?.createdAt || new Date().toISOString();
      let updatedAt = new Date().toISOString();
      let finalItems: Series['items'] = items;

      if (initialSeries && !isNaN(Number(initialSeries.id))) {
        const seriesId = Number(initialSeries.id);
        savedSeriesId = seriesId;

        await seriesApi.updateSeries(seriesId, {
          title: title.trim(),
          description: description.trim(),
          status: 'PUBLISHED',
        });

        // Sync items against backend series
        const initialMap = new Map<string, { seriesItemId: number; contentId: number; type: SeriesContentType }>();
        for (const oldItem of initialSeries.items || []) {
          const cid = resolveContentId(oldItem);
          const sid = Number(oldItem.id);
          if (cid && !isNaN(sid) && sid > 0) {
            initialMap.set(getContentKey(oldItem.type, cid), {
              seriesItemId: sid,
              contentId: cid,
              type: oldItem.type,
            });
          }
        }

        const currentKeys = new Set<string>();
        for (const it of items) {
          const cid = resolveContentId(it);
          if (cid) currentKeys.add(getContentKey(it.type, cid));
        }

        // 1. Remove deleted items
        for (const [key, oldInfo] of initialMap.entries()) {
          if (!currentKeys.has(key)) {
            await seriesApi.removeItem(seriesId, oldInfo.seriesItemId);
          }
        }

        // 2. Add newly selected items
        for (const it of items) {
          const cid = resolveContentId(it);
          if (!cid) continue;
          const key = getContentKey(it.type, cid);
          if (!initialMap.has(key)) {
            await seriesApi.addItem(seriesId, {
              contentType: it.type,
              contentId: cid,
            });
          }
        }

        // 3. Reload series & reorder if needed
        const refreshed = await seriesApi.getSeriesById(seriesId);
        if (refreshed?.items && refreshed.items.length > 1) {
          const keyToItemId = new Map<string, number>();
          for (const dto of refreshed.items) {
            keyToItemId.set(
              getContentKey(dto.contentType as SeriesContentType, dto.contentId),
              dto.seriesItemId
            );
          }
          const reorderPayload = items
            .map((it, idx) => {
              const cid = resolveContentId(it);
              const sid = cid ? keyToItemId.get(getContentKey(it.type, cid)) : undefined;
              return sid ? { seriesItemId: sid, newPosition: idx + 1 } : null;
            })
            .filter((x): x is { seriesItemId: number; newPosition: number } => x !== null);

          if (reorderPayload.length === refreshed.items.length) {
            const needsReorder = refreshed.items.some((dto) => {
              const target = reorderPayload.find((p) => p.seriesItemId === dto.seriesItemId);
              return target && target.newPosition !== dto.position;
            });
            if (needsReorder) {
              try {
                await seriesApi.reorderItems(seriesId, reorderPayload);
              } catch (reorderErr) {
                console.warn('Could not reorder series items:', reorderErr);
              }
            }
          }
        }

        const latest = await seriesApi.getSeriesById(seriesId);
        createdAt = latest.createdAt;
        updatedAt = latest.updatedAt;
        const titleLookup = new Map<string, string>();
        for (const it of items) {
          const cid = resolveContentId(it);
          if (cid) titleLookup.set(getContentKey(it.type, cid), it.title);
        }
        finalItems = (latest.items || []).map((dto, idx) => {
          const ctype = (dto.contentType as SeriesContentType) || 'ARTICLE';
          return {
            id: String(dto.seriesItemId),
            contentId: dto.contentId,
            type: ctype,
            title: dto.title || titleLookup.get(getContentKey(ctype, dto.contentId)) || `#${dto.contentId}`,
            orderIndex: dto.position || idx + 1,
            url: getContentUrl(ctype, dto.contentId),
          };
        });
      } else {
        const created = await seriesApi.createSeries({
          title: title.trim(),
          description: description.trim(),
        });
        savedSeriesId = created.seriesId;
        createdAt = created.createdAt;
        updatedAt = created.updatedAt;

        const addedItemResults: Series['items'] = [];
        for (let idx = 0; idx < items.length; idx++) {
          const it = items[idx];
          const cid = resolveContentId(it);
          if (!cid) continue;
          const updatedDetail = await seriesApi.addItem(created.seriesId, {
            contentType: it.type,
            contentId: cid,
          });
          const matchedDto = updatedDetail.items?.find(
            (d) => d.contentType === it.type && d.contentId === cid
          );
          addedItemResults.push({
            id: matchedDto ? String(matchedDto.seriesItemId) : it.id,
            contentId: cid,
            type: it.type,
            title: matchedDto?.title || it.title,
            orderIndex: matchedDto?.position || idx + 1,
            url: getContentUrl(it.type, cid),
          });
        }

        // Publish series so it appears in the public Series directory
        try {
          const published = await seriesApi.updateSeries(created.seriesId, {
            title: title.trim(),
            description: description.trim(),
            status: 'PUBLISHED',
          });
          updatedAt = published.updatedAt;
        } catch (pubErr) {
          console.warn('Could not auto-publish series:', pubErr);
        }

        finalItems = addedItemResults;
      }

      const savedSeries: Series = {
        id: savedSeriesId ? String(savedSeriesId) : initialSeries?.id || `series-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        author: {
          id: currentUser?.id || 'u-self',
          fullName: currentUser?.fullName || t('Sinh viên FHub'),
          avatarUrl: currentUser?.avatarUrl,
        },
        itemCount: finalItems.length,
        items: finalItems,
        createdAt,
        updatedAt,
      };
      onSaved(savedSeries);
      onClose();
    } catch (err: any) {
      console.error('Failed to save series:', err);
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          t('Không thể lưu Series. Vui lòng thử lại.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialSeries
          ? t('seriesModal.titleEdit', 'Chỉnh sửa Series chuyên đề')
          : t('seriesModal.titleCreate', 'Tạo mới Series chuyên đề (Series Management)')
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel', 'Hủy')}
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting} disabled={!title.trim()}>
            {initialSeries
              ? t('seriesModal.saveEdit', 'Cập nhật Series')
              : t('seriesModal.saveCreate', 'Tạo Series')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMessage && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label={t('seriesModal.seriesTitleLabel', 'Tiêu đề Series *')}
          placeholder={t(
            'seriesModal.seriesTitlePlaceholder',
            'Ví dụ: Lộ trình làm chủ C# & .NET 9 cho sinh viên SE'
          )}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label={t('seriesModal.seriesDescLabel', 'Mô tả mục tiêu của Series')}
          placeholder={t(
            'seriesModal.seriesDescPlaceholder',
            'Mô tả ngắn về kiến thức chuỗi bài viết / workflow mang lại...'
          )}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* User's Published Content Picker */}
        <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              {t('Chọn từ bài viết đã đăng của bạn')}
            </span>
            <div className="flex items-center gap-1">
              {(
                [
                  { key: 'ALL', label: t('Tất cả'), count: typeCounts.ALL },
                  { key: 'ARTICLE', label: t('Article'), count: typeCounts.ARTICLE },
                  { key: 'WORKFLOW', label: t('Workflow'), count: typeCounts.WORKFLOW },
                  { key: 'QUESTION', label: t('Q&A'), count: typeCounts.QUESTION },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterType(tab.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    filterType === tab.key
                      ? 'bg-[#0076D1] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Tìm kiếm trong các Article, Workflow, Q&A bạn đã đăng...')}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#0076D1]"
            />
          </div>

          {/* Available Posts List */}
          <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {isLoadingContents ? (
              <div className="p-6 flex items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-[#0076D1]" />
                <span>{t('Đang tải danh sách bài viết của bạn...')}</span>
              </div>
            ) : filteredContents.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                {userContents.length === 0
                  ? t('Bạn chưa đăng tải Article, Workflow hoặc Q&A nào để thêm vào Series.')
                  : t('Không tìm thấy bài viết phù hợp với bộ lọc hiện tại.')}
              </div>
            ) : (
              filteredContents.map((option) => {
                const key = getContentKey(option.type, option.contentId);
                const isSelected = selectedKeys.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggleOption(option)}
                    className={`w-full px-3 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold shrink-0 ${getTypeBadgeStyle(
                          option.type
                        )}`}
                      >
                        {option.type === 'ARTICLE' && <FileText className="w-3 h-3" />}
                        {option.type === 'WORKFLOW' && <GitBranch className="w-3 h-3" />}
                        {option.type === 'QUESTION' && <HelpCircle className="w-3 h-3" />}
                        {getTypeLabel(option.type, t)}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {option.title}
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                        <Check className="w-3 h-3" />
                        {t('Đã chọn')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold shrink-0">
                        <Plus className="w-3 h-3" />
                        {t('Thêm')}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Selected & Reorderable Series Items */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              {t('seriesModal.itemsListHeading', 'Danh sách bài trong Series')} ({items.length})
            </span>
          </div>

          {items.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400">
              {t('Chưa có bài nào được chọn. Nhấn vào các bài viết phía trên để ghép thành Series.')}
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0076D1] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded border text-[10px] font-bold shrink-0 ${getTypeBadgeStyle(
                        item.type
                      )}`}
                    >
                      {getTypeLabel(item.type, t)}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {item.title}
                    </span>
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
          )}
        </div>
      </form>
    </Modal>
  );
};
