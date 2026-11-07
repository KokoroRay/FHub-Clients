import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Flag, Link2, Check, Trash2 } from 'lucide-react';
import { ReportContentModal, ReportTargetType } from './ReportContentModal';
import { useLanguage } from '../../context/LanguageContext';

export interface ContentActionMenuProps {
  targetType: ReportTargetType;
  targetId: string | number;
  targetTitle: string;
  shareUrl?: string;
  className?: string;
  isOwner?: boolean;
  onDelete?: () => void | Promise<void>;
  deleteLabel?: string;
}

export const ContentActionMenu: React.FC<ContentActionMenuProps> = ({
  targetType,
  targetId,
  targetTitle,
  shareUrl,
  className = '',
  isOwner = false,
  onDelete,
  deleteLabel,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDeleteConfirm(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
    setIsOpen(false);
  };

  const handleOpenReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    setIsReportModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    setShowDeleteConfirm(false);
    if (onDelete) {
      await onDelete();
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
          setShowDeleteConfirm(false);
        }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title={t('common.actions', 'Tùy chọn khác')}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-52 rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer transition-colors"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">{t('common.copied', 'Đã chép link!')}</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('common.copyLink', 'Sao chép liên kết')}</span>
              </>
            )}
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          {isOwner && onDelete ? (
            showDeleteConfirm ? (
              <div className="px-3 py-2 space-y-1.5 bg-rose-50/70 dark:bg-rose-950/40 rounded-lg mx-1 border border-rose-200 dark:border-rose-900/60">
                <p className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                  {t('common.confirmDelete', 'Xác nhận xóa nội dung này?')}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="flex-1 px-2 py-1 text-center text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
                  >
                    {t('common.delete', 'Xóa')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDeleteConfirm(false);
                    }}
                    className="flex-1 px-2 py-1 text-center text-xs font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded transition-colors"
                  >
                    {t('common.cancel', 'Hủy')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>{deleteLabel || t('common.delete', 'Xóa bài viết')}</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={handleOpenReport}
              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Flag className="w-3.5 h-3.5 text-rose-500" />
              <span>{t('Report Content', 'Báo cáo vi phạm')}</span>
            </button>
          )}
        </div>
      )}

      {/* Report Modal */}
      <ReportContentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetTitle={targetTitle}
      />
    </div>
  );
};
