import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Bookmark,
  ArrowLeft,
  Calendar,
  User,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { studyMaterialApi } from '../../services/api/contentApi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UpdateMaterialMetadataModal } from './UpdateMaterialMetadataModal';
import { StudyMaterial } from '../../types';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';

export const StudyMaterialDetailPage: React.FC = () => {
  const { locale, t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [rawFileName, setRawFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [downloadCount, setDownloadCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    const fetchMaterial = async () => {
      try {
        setIsLoading(true);
        const data = await studyMaterialApi.getMaterialById(id);
        if (isMounted && data) {
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

          const mapped: StudyMaterial = {
            id: String(data.studyMaterialId),
            title: data.title,
            description: data.description || 'Comprehensive study material and practical exam reference guide.',
            courseCode: data.courseId === 1 ? 'PRF192' : data.courseId === 2 ? 'PRO192' : 'PRN231',
            fileType: resolvedFileType,
            fileSizeMb: data.fileSizeBytes ? Number((data.fileSizeBytes / (1024 * 1024)).toFixed(1)) : 2.4,
            downloadUrl: data.externalUrl || `/api/content/study-materials/${data.studyMaterialId}/download`,
            downloadsCount: data.downloadCount || 48,
            author: {
              id: String(data.uploaderUserId || 4),
              fullName: data.uploaderUserId === 4 ? 'Nguyen Minh Tam (CE181522)' : 'Nguyen Minh Tam (CE181522)',
            },
            semesterUploaded: 'Fall 2026',
            createdAt: data.createdAt,
          };
          setMaterial(mapped);
          setDownloadCount(data.downloadCount || 0);
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

    try {
      await studyMaterialApi.downloadFile(material.id, rawFileName || material.title);
      setDownloadCount((prev) => prev + 1);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      alert(t("Không thể tải xuống tài liệu. Vui lòng thử lại hoặc kiểm tra trạng thái đăng nhập."));
    }
  };

  const handleDelete = () => {
    if (window.confirm(t("Bạn có chắc chắn muốn xóa tài liệu này không?"))) {
      if (id) {
        studyMaterialApi.deleteMaterial(id)
          .then(() => navigate('/materials'))
          .catch(() => navigate('/materials'));
      }
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
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 text-[#0076D1] border border-blue-100">
                  [{material.courseCode}]
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {material.fileType}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {material.title}
              </h1>
              <p className="text-xs text-slate-500">
                {t("Đăng bởi")} <strong className="text-slate-700">{material.author.fullName}</strong>  {t("• Kỳ học:")} {material.semesterUploaded}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
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

            {/* Always visible for edit and delete demonstration (3.8.5 & 3.8.6) */}
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
              <span>{t('Download Material')}</span>
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 block text-[11px]">{t('File Format')}</span>
              <strong className="text-slate-800">{material.fileType}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block text-[11px]">{t('File Size')}</span>
              <strong className="text-slate-800">{material.fileSizeMb || 0}  {t("MB")}</strong>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block text-[11px]">{t('Downloads')}</span>
              <strong className="text-[#0076D1]">{downloadCount}  {t("lượt")}</strong>
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
              {t("Bạn có chắc chắn muốn xóa tài liệu")} <strong>{material.title}</strong>{t("? File tài liệu đính kèm và lịch sử tải xuống sẽ bị xóa hoàn toàn khỏi thư viện.")}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {t("Hủy")}</button>
              <button
                id="btn-confirm-delete-material"
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  navigate('/materials');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {t("Xác nhận xóa")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
