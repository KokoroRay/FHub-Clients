import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Bookmark,
  ArrowLeft,
  Trash2,
  Edit3,
  CheckCircle2,
  Paperclip,
} from 'lucide-react';
import { studyMaterialApi } from '../../services/api/contentApi';
import { courseNodesApi } from '../../services/api/adminApi';
import { bookmarkApi } from '../../services/api/studentApi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UpdateMaterialMetadataModal } from './UpdateMaterialMetadataModal';
import { StudyMaterial, StudyMaterialFile } from '../../types';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const StudyMaterialDetailPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { locale, t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [rawFileName, setRawFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [downloadCount, setDownloadCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<number | string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    const fetchMaterial = async () => {
      try {
        setIsLoading(true);
        const [data, coursesRes] = await Promise.all([
          studyMaterialApi.getMaterialById(id),
          courseNodesApi.getCourseNodes({ pageSize: 2000 }).catch(() => ({ items: [] })),
        ]);

        if (isMounted && data) {
          const courseMap = new Map<number, string>();
          ((coursesRes as any)?.items || []).forEach((c: any) => {
            const cId = Number(c.courseNodeId ?? c.id);
            const code = c.courseCode || c.code || '';
            if (cId && code) courseMap.set(cId, code);
          });

          const resolvedCourseCode = data.courseId
            ? (courseMap.get(Number(data.courseId)) || `COURSE-${data.courseId}`)
            : 'Other';

          const name = data.fileName || data.title || '';
          setRawFileName(data.fileName || '');
          const ext = name.split('.').pop()?.toLowerCase();
          let resolvedFileType: 'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'CODE' = 'PDF';
          if (data.materialType === 'LINK') resolvedFileType = 'CODE';
          else if (ext === 'pdf') resolvedFileType = 'PDF';
          else if (ext === 'docx' || ext === 'doc') resolvedFileType = 'DOCX';
          else if (ext === 'pptx' || ext === 'ppt') resolvedFileType = 'PPTX';
          else if (['zip', 'rar', '7z'].includes(ext || '')) resolvedFileType = 'ZIP';
          else if (['cs', 'java', 'py', 'sql', 'cpp', 'c', 'json', 'md', 'txt'].includes(ext || '')) resolvedFileType = 'CODE';

          const mappedFiles: StudyMaterialFile[] = (data.files || []).map((f) => ({
            id: String(f.studyMaterialFileId),
            fileName: f.fileName,
            fileSizeBytes: f.fileSizeBytes,
            fileSizeMb: Number((f.fileSizeBytes / (1024 * 1024)).toFixed(2)),
            mimeType: f.mimeType,
            displayOrder: f.displayOrder,
          }));

          const mapped: StudyMaterial = {
            id: String(data.studyMaterialId),
            title: data.title,
            description: data.description || 'Comprehensive study material and practical exam reference guide.',
            courseId: data.courseId ?? null,
            courseCode: resolvedCourseCode,
            fileType: resolvedFileType,
            fileSizeMb: data.fileSizeBytes ? Number((data.fileSizeBytes / (1024 * 1024)).toFixed(2)) : 0,
            downloadUrl: data.externalUrl || `/api/content/study-materials/${data.studyMaterialId}/download`,
            downloadsCount: data.downloadCount || 0,
            author: {
              id: String(data.uploaderUserId || currentUser?.id || 4),
              fullName:
                (data.uploaderUserId && currentUser?.id && String(data.uploaderUserId) === String(currentUser.id)
                  ? (currentUser.fullName || null)
                  : null) ||
                (data as any).uploaderDisplayName ||
                (data as any).uploaderName ||
                (data.uploaderUserId ? `Sinh viên FPT (#${data.uploaderUserId})` : 'Thành viên FHub'),
            },
            semesterUploaded: 'Fall 2026',
            files: mappedFiles,
            createdAt: data.createdAt,
          };
          setMaterial(mapped);
          setDownloadCount(data.downloadCount || 0);

          const numId = Number(id ? id.replace(/\D/g, '') : 0);
          if (numId) {
            try {
              const bList = await bookmarkApi.getBookmarks('StudyMaterial');
              const found = bList.find((b: any) => Number(b.targetId || b.externalTargetId) === numId);
              if (found && isMounted) {
                setIsBookmarked(true);
                setBookmarkId(found.id);
              }
            } catch {}
          }
        }
      } catch (err) {
        if (isMounted) setMaterial(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMaterial();
    return () => { isMounted = false; };
  }, [id]);

  const handleDownloadSpecificFile = async (file: StudyMaterialFile) => {
    if (!material) return;
    try {
      setDownloadingFileId(file.id);
      await studyMaterialApi.downloadSpecificFile(material.id, file.id, file.fileName);
      setDownloadCount((prev) => prev + 1);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      alert(t("Không thể tải xuống tài liệu. Vui lòng thử lại hoặc kiểm tra trạng thái đăng nhập."));
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleDownload = async () => {
    if (!material) return;

    if (
      material.downloadUrl &&
      (material.downloadUrl.startsWith('http://') || material.downloadUrl.startsWith('https://'))
    ) {
      window.open(material.downloadUrl, '_blank');
      setDownloadCount((prev) => prev + 1);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
      return;
    }

    if (material.files && material.files.length > 1) {
      try {
        for (const file of material.files) {
          await studyMaterialApi.downloadSpecificFile(material.id, file.id, file.fileName);
        }
        setDownloadCount((prev) => prev + material.files!.length);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      } catch (err) {
        alert(t("Không thể tải xuống tài liệu. Vui lòng thử lại hoặc kiểm tra trạng thái đăng nhập."));
      }
      return;
    }

    try {
      await studyMaterialApi.downloadFile(material.id, rawFileName || material.title);
      setDownloadCount((prev) => prev + 1);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      alert(t("Không thể tải xuống tài liệu. Vui lòng thử lại hoặc kiểm tra trạng thái đăng nhập."));
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        {t('Loading...')}
      </div>
    );
  }

  if (!material) {
    return (
      <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">{t('No data found')}</h3>
        <p className="text-xs text-slate-500">{t("Tài liệu học tập này không tồn tại hoặc đã bị xóa.")}</p>
        <Link to="/materials" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700">
          <ArrowLeft className="w-4 h-4" /> {t('Back to Materials')}
        </Link>
      </div>
    );
  }

  const fileCount = material.files?.length || 0;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/materials"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('Back to Materials')}
        </Link>
      </div>

      {/* Main Material Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0076D1] flex items-center justify-center shrink-0 border border-blue-100">
              <FileText className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                    material.courseCode === 'Other'
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-blue-50 text-[#0076D1] border-blue-100'
                  }`}
                >
                  [{material.courseCode}]
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {material.fileType}
                </span>
                {fileCount > 1 && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {fileCount} files
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {material.title}
              </h1>
              <p className="text-xs text-slate-500">
                {t("Đăng bởi")} <strong className="text-slate-700">{material.author.fullName}</strong> {t("• Kỳ học:")} {material.semesterUploaded}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={async () => {
                const numId = Number(id ? id.replace(/\D/g, '') : 0);
                if (isBookmarked && bookmarkId) {
                  setIsBookmarked(false);
                  try { await bookmarkApi.removeBookmark(bookmarkId); setBookmarkId(null); } catch {}
                } else if (numId) {
                  setIsBookmarked(true);
                  try { const b = await bookmarkApi.addBookmark('StudyMaterial', numId); setBookmarkId(b?.bookmarkId || b?.id || 1); } catch {}
                }
              }}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-blue-50 border-blue-200 text-[#0076D1]'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title={t("Lưu tài liệu")}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <ContentActionMenu
              targetType="STUDY_MATERIAL"
              targetId={material.id}
              targetTitle={material.title}
              shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
            />

            <button
              id="btn-edit-material"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>{t('Edit')}</span>
            </button>
            <button
              id="btn-delete-material"
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title={t("Xóa tài liệu")}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#0076D1] hover:bg-[#005DA7] text-white shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {fileCount > 1
                  ? `${t('Download All', 'Tải tất cả')} (${fileCount})`
                  : t('Download Material')}
              </span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t("Tệp tin đang được tải về thành công! Lượt tải đã được ghi nhận.")}</span>
          </div>
        )}

        {/* Material Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">{t('Description')}</h3>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
            {material.description}
          </p>

          {/* Attached Files List */}
          {material.files && material.files.length > 0 && (
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-[#0076D1]" />
                  <span>{t('Attached Files', 'Tệp đính kèm')} ({material.files.length})</span>
                </h3>
              </div>
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {material.files.map((file, index) => (
                  <div
                    key={`${file.id}-${index}`}
                    className="px-4 py-3 flex items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0076D1] flex items-center justify-center shrink-0 border border-blue-100">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate" title={file.fileName}>
                          {file.fileName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatFileSize(file.fileSizeBytes)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={downloadingFileId === file.id}
                      onClick={() => handleDownloadSpecificFile(file)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0076D1] bg-blue-50 hover:bg-blue-100 border border-blue-200/70 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t('Download', 'Tải xuống')}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 block text-[11px]">{t('File Format')}</span>
              <strong className="text-slate-800">{material.fileType}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block text-[11px]">{t('File Size')}</span>
              <strong className="text-slate-800">{material.fileSizeMb || 0} {t("MB")}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block text-[11px]">{t('Downloads')}</span>
              <strong className="text-[#0076D1]">{downloadCount} {t("lượt")}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block text-[11px]">{t('Upload Date')}</span>
              <strong className="text-slate-800">
                {new Date(material.createdAt).toLocaleDateString(locale)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal (3.8.5) */}
      <UpdateMaterialMetadataModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        material={material}
        onUpdated={(updated) => {
          setMaterial(updated);
          setIsEditModalOpen(false);
        }}
      />

      {/* Delete Confirmation Modal (3.8.6) */}
      {isDeleteModalOpen && (
        <div id="modal-delete-material" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t("Xóa Tài Liệu Học Tập")}</h3>
                <p className="text-xs text-slate-500">{t("Hành động không thể hoàn tác")}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t("Bạn có chắc chắn muốn xóa tài liệu")} <strong>{material.title}</strong>{t("? File tài liệu đính kèm và lịch sử tải xuống sẽ bị xóa hoàn toàn khỏi thư viện.")}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}
              </button>
              <button
                id="btn-confirm-delete-material"
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  if (id) {
                    studyMaterialApi.deleteMaterial(id)
                      .then(() => navigate('/materials'))
                      .catch(() => navigate('/materials'));
                  } else {
                    navigate('/materials');
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Xác nhận xóa")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
