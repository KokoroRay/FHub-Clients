import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  BookOpen,
  Users,
  CheckCircle2,
  Trash2,
  Edit2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { mockDetailedMajors, DetailedMajor } from '../../../services/adminMockData';

export const MajorsPage: React.FC = () => {
  const [majors, setMajors] = useState<DetailedMajor[]>(mockDetailedMajors);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newVnName, setNewVnName] = useState('');
  const [newDept, setNewDept] = useState('Công nghệ thông tin');
  const [newHead, setNewHead] = useState('');
  const [newCredits, setNewCredits] = useState(144);

  const filteredMajors = majors.filter((m) => {
    const matchesSearch =
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.vietnameseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || m.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleCreateMajor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const created: DetailedMajor = {
      id: `maj-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      vietnameseName: newVnName.trim() || newName.trim(),
      description: `Chương trình đào tạo ${newVnName || newName} tại FPT University.`,
      department: newDept,
      headOfDepartment: newHead.trim() || 'Chưa chỉ định',
      totalCreditsRequired: Number(newCredits) || 144,
      durationSemesters: 9,
      totalCourses: 36,
      isActive: true,
      curriculumRoadmap: [],
    };

    setMajors((prev) => [...prev, created]);
    setShowCreateModal(false);
    setSuccessNotice(`Đã tạo ngành học mới: ${created.vietnameseName} (${created.code})`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleDeleteMajor = (majorId: string, majorName: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa ngành ${majorName}?`)) {
      setMajors((prev) => prev.filter((m) => m.id !== majorId));
      setSuccessNotice(`Đã xóa ngành học ${majorName}`);
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#005da7] uppercase tracking-wider">Academic Taxonomy Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Degree Tracks & Curriculums (Majors)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý danh mục 32 ngành đào tạo, lộ trình khung 9 học kỳ và chuẩn đầu ra ABET / MOET.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Khai Báo Ngành Học Mới</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Mã ngành (SE, IA, AI), tên tiếng Việt, tiếng Anh..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full md:w-56 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">Tất cả Khối Khoa</option>
          <option value="Công nghệ thông tin">Công nghệ thông tin</option>
          <option value="An toàn thông tin">An toàn thông tin</option>
          <option value="Khoa học máy tính">Khoa học máy tính</option>
          <option value="Thiết kế đồ họa">Thiết kế đồ họa</option>
          <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
        </select>
      </div>

      {/* Majors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMajors.map((major) => (
          <div
            key={major.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:border-[#005da7] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#005da7] dark:text-sky-400 font-black text-lg flex items-center justify-center">
                    {major.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {major.vietnameseName}
                    </h3>
                    <span className="text-[11px] text-slate-400">{major.name}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Khối Khoa:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{major.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chủ nhiệm bộ môn:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{major.headOfDepartment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tổng tín chỉ & Thời lượng:</span>
                  <span className="font-black text-[#005da7]">{major.totalCreditsRequired} Tín chỉ (9 Học kỳ)</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {major.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleDeleteMajor(major.id, major.vietnameseName)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Xóa ngành"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <Link
                to={`/majors/${major.code}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#005da7] hover:underline"
              >
                <span>Lộ Trình Khung 9 Kỳ</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Major */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Khai Báo Ngành Học Mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMajor} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mã Ngành:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SE"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white uppercase"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên Tiếng Việt:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Kỹ thuật phần mềm"
                    value={newVnName}
                    onChange={(e) => setNewVnName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên Tiếng Anh (English Title):</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Software Engineering"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Khối Khoa:</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="An toàn thông tin">An toàn thông tin</option>
                    <option value="Khoa học máy tính">Khoa học máy tính</option>
                    <option value="Thiết kế đồ họa">Thiết kế đồ họa</option>
                    <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chủ Nhiệm Bộ Môn:</label>
                  <input
                    type="text"
                    placeholder="TS. Kiều Trọng..."
                    value={newHead}
                    onChange={(e) => setNewHead(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold cursor-pointer"
                >
                  Tạo Ngành Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
