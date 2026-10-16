import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Bookmark,
  Share2,
  ArrowLeft,
  Calendar,
  User,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  FileCode,
  Archive,
} from 'lucide-react';
import { mockMaterials } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { UpdateMaterialMetadataModal } from './UpdateMaterialMetadataModal';
import { StudyMaterial } from '../../types';

export const StudyMaterialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const foundMaterial = mockMaterials.find((m) => m.id === id) || mockMaterials[0];
  const [material, setMaterial] = useState<StudyMaterial>(foundMaterial);
  const [downloadCount, setDownloadCount] = useState(material.downloadsCount);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    setDownloadCount((prev) => prev + 1);
    setDownloadSuccess(true);

    // Simulate browser file download
    const element = document.createElement('a');
    const file = new Blob([`Content of ${material.title}\nCourse: ${material.courseCode}`], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = material.title.endsWith('.pdf') ? material.title : `${material.title}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) {
      navigate('/materials');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/materials"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tài liệu
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
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {material.fileType}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {material.title}
              </h1>
              <p className="text-xs text-slate-500">
                Đăng bởi <strong className="text-slate-700">{material.author.fullName}</strong> • Kỳ học: {material.semesterUploaded}
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
              title="Lưu tài liệu"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Chỉnh sửa thông tin"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Xóa tài liệu"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File ({material.fileSizeMb} MB)</span>
            </button>
          </div>
        </div>

        {/* Download Success Notice */}
        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tài liệu đang được tải xuống thiết bị của bạn. Chúc bạn ôn tập tốt!</span>
          </div>
        )}

        {/* File Stats Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Định dạng tệp</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{material.fileType} Document</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Dung lượng</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{material.fileSizeMb} MB</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Lượt tải về</span>
            <span className="font-bold text-[#0076D1] mt-0.5 block">{downloadCount} downloads</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Kiểm duyệt</span>
            <span className="font-bold text-emerald-600 mt-0.5 block">Verified by Peer</span>
          </div>
        </div>

        {/* Description & Usage Guide */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Mô tả & Hướng dẫn sử dụng</h3>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
            {material.description}
          </p>
        </div>

        {/* External Link Notice if applicable */}
        {material.downloadUrl && material.downloadUrl !== '#' && (
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-purple-900">
              <ExternalLink className="w-4 h-4 text-purple-600" />
              <span>Tài liệu này được lưu trữ tại kho tài nguyên ngoài: <strong>{material.downloadUrl}</strong></span>
            </div>
            <a
              href={material.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-purple-700 hover:underline"
            >
              Mở liên kết →
            </a>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <UpdateMaterialMetadataModal
        isOpen={isEditModalOpen}
        material={material}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={(updated) => setMaterial(updated)}
      />
    </div>
  );
};
