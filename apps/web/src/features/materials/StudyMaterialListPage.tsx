import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Download,
  Search,
  Plus,
  FileDown,
  FileText,
  Archive,
  Presentation,
  Code2,
  FileSpreadsheet,
  Link2,
  Bookmark,
  ExternalLink,
  ArrowRight,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { courseNodesApi, CourseNodeListItem } from '../../services/api/adminApi';
import { StudyMaterial } from '../../types';
import { UploadStudyMaterialModal } from './UploadStudyMaterialModal';
import { AddExternalLinkModal } from './AddExternalLinkModal';
import { studyMaterialApi } from '../../services/api/contentApi';
import { ContentActionMenu } from '../../components/common/ContentActionMenu';

export const StudyMaterialListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shouldOpenUpload = searchParams.get('action') === 'upload';
  const shouldOpenAddLink = searchParams.get('action') === 'add-link';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'downloads' | 'newest'>('downloads');
  const [isUploadOpen, setIsUploadOpen] = useState(shouldOpenUpload);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(shouldOpenAddLink);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseNodeListItem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  React.useEffect(() => {
    courseNodesApi.getCourseNodes({ pageSize: 300 })
      .then((res) => setAvailableCourses(res?.items || []))
      .catch(() => setAvailableCourses([]));
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourse, selectedType, sortBy]);

  React.useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await studyMaterialApi.getMaterials({
          search: searchQuery.trim() || undefined,
          pageSize: 100,
        });
        if (res && res.items) {
          const courseMap = new Map<number, string>();
          availableCourses.forEach(c => {
            const id = Number(c.courseNodeId ?? c.id);
            const code = c.courseCode || c.code || '';
            if (id && code) courseMap.set(id, code);
          });
          const mapped: StudyMaterial[] = res.items.map((item) => {
            const resolvedCode = item.courseId ? (courseMap.get(Number(item.courseId)) || `COURSE-${item.courseId}`) : 'GEN';
            const name = item.fileName || item.title || '';
            const ext = name.split('.').pop()?.toLowerCase();
            let resolvedFileType: 'PDF' | 'DOCX' | 'ZIP' | 'PPTX' | 'CODE' = 'PDF';
            if (item.materialType === 'LINK') resolvedFileType = 'CODE';
            else if (ext === 'pdf') resolvedFileType = 'PDF';
            else if (ext === 'docx' || ext === 'doc') resolvedFileType = 'DOCX';
            else if (ext === 'pptx' || ext === 'ppt') resolvedFileType = 'PPTX';
            else if (['zip', 'rar', '7z'].includes(ext || '')) resolvedFileType = 'ZIP';
            else if (['cs', 'java', 'py', 'sql', 'cpp', 'c', 'json', 'md', 'txt'].includes(ext || '')) resolvedFileType = 'CODE';

            return {
              id: String(item.studyMaterialId),
              title: item.title,
              description: item.description || 'Tài liệu học tập FHub',
              courseCode: resolvedCode,
              fileType: resolvedFileType,
              fileSizeMb: item.fileSizeBytes ? Number((item.fileSizeBytes / (1024 * 1024)).toFixed(1)) : 0,
              downloadUrl: item.externalUrl || `/api/content/study-materials/${item.studyMaterialId}/download`,
              downloadsCount: item.downloadCount || 0,
              author: {
                id: String(item.uploaderUserId),
                fullName: 'Sinh viên FHub',
              },
              semesterUploaded: 'N/A',
              createdAt: item.createdAt || new Date().toISOString(),
            };
          });
          setMaterials(mapped);
        }
      } catch (err) {
        setMaterials([]);
      }
    };
    fetchMaterials();
  }, [searchQuery, availableCourses]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredMaterials = materials
    .filter((m) => {
      const matchType = selectedType === 'ALL' || m.fileType === selectedType;
      const matchCourse = selectedCourse === 'ALL' || m.courseCode === selectedCourse;
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchCourse && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'downloads') return b.downloadsCount - a.downloadsCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalPages = Math.ceil(filteredMaterials.length / pageSize) || 1;
  const paginatedMaterials = filteredMaterials.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getFileBadgeColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'DOCX':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'ZIP':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'CODE':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (Figma #101:3694) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Study Materials
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0076D1] border border-blue-100">
              {filteredMaterials.length} Items
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Find useful resources, lecture notes, exam banks, and cheat sheets shared by the community.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAddLinkOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Link2 className="w-4 h-4 text-slate-500" />
            <span>Add External Link</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Search & Refinement Toolbar (Figma #101:3710) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="relative md:col-span-5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study materials..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1]"
          />
        </div>

        {/* Course Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
          >
            <option value="ALL">All Courses</option>
            {availableCourses.map((c) => {
              const code = c.courseCode || c.code || '';
              const id = c.courseNodeId ?? c.id ?? code;
              return (
                <option key={id} value={code}>
                  {code} - {c.courseName || c.name || ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Type Filter */}
        <div className="md:col-span-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="PDF">PDF Documents</option>
            <option value="DOCX">Word Documents</option>
            <option value="ZIP">Zip Archives</option>
            <option value="CODE">Source Code</option>
          </select>
        </div>

        {/* Sort */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
          >
            <option value="downloads">Most Downloaded</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Materials Two-Column Grid (Figma #101:3746) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedMaterials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            Không tìm thấy tài liệu phù hợp.
          </div>
        ) : (
          paginatedMaterials.map((mat) => (
          <div
            key={mat.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 transition-colors group"
          >
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getFileBadgeColor(
                      mat.fileType
                    )}`}
                  >
                    {mat.fileType}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0076D1] border border-blue-100">
                    [{mat.courseCode}]
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => toggleBookmark(mat.id, e)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      bookmarkedIds.has(mat.id)
                        ? 'bg-blue-50 border-blue-200 text-[#0076D1]'
                        : 'border-transparent text-slate-400 hover:bg-slate-100'
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <ContentActionMenu
                    targetType="STUDY_MATERIAL"
                    targetId={mat.id}
                    targetTitle={mat.title}
                    shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/materials/${mat.id}`}
                  />
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <Link
                  to={`/materials/${mat.id}`}
                  className="font-bold text-sm text-slate-900 group-hover:text-[#0076D1] transition-colors leading-snug line-clamp-1 block"
                >
                  {mat.title}
                </Link>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {mat.description}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-[11px] text-slate-400">
                <span>By <strong className="text-slate-700">{mat.author.fullName}</strong></span>
                <span className="mx-1">•</span>
                <span>{mat.fileSizeMb} MB</span>
              </div>

              <Link
                to={`/materials/${mat.id}`}
                className="text-xs font-bold text-[#0076D1] hover:underline flex items-center gap-1"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-xs text-slate-500">
            Hiển thị <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> -{' '}
            <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, filteredMaterials.length)}</span> trên tổng số{' '}
            <span className="font-semibold text-slate-700">{filteredMaterials.length}</span> tài liệu
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#0076D1] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Trang kế tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadStudyMaterialModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={(newMat) => setMaterials([newMat, ...materials])}
      />

      {/* Add External Link Modal */}
      <AddExternalLinkModal
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        onAdded={(newMat) => setMaterials([newMat, ...materials])}
      />
    </div>
  );
};
