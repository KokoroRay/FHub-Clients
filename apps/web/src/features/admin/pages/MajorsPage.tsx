import React, { useState, useEffect } from 'react';
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
  Download,
  Loader2,
} from 'lucide-react';
import { mockDetailedMajors, DetailedMajor } from '../../../services/adminMockData';
import { useMajors, useCreateMajor, useDeleteMajor } from '../../../services/api';

export const MajorsPage: React.FC = () => {
  const { data: majorsData, isLoading, refetch } = useMajors();
  const createMajorMutation = useCreateMajor();
  const deleteMajorMutation = useDeleteMajor();

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

  useEffect(() => {
    if (majorsData?.items && majorsData.items.length > 0) {
      const mapped: DetailedMajor[] = majorsData.items.map((m: any) => ({
        id: String(m.majorId),
        code: m.majorCode,
        name: m.majorName,
        vietnameseName: m.vietnameseName || m.majorName,
        description: m.description || `Chương trình đào tạo ${m.vietnameseName || m.majorName} tại FPT University.`,
        department: m.department || 'Công nghệ thông tin',
        headOfDepartment: m.headOfDepartment || 'Chưa chỉ định',
        totalCreditsRequired: m.totalCreditsRequired || 144,
        durationSemesters: m.durationSemesters || 9,
        totalCourses: m.totalCourses || 36,
        isActive: m.isActive ?? true,
        curriculumRoadmap: m.curriculumRoadmap || [],
      }));
      setMajors(mapped);
    }
  }, [majorsData]);

  const filteredMajors = majors.filter((m) => {
    const matchesSearch =
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.vietnameseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || m.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleCreateMajor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    try {
      await createMajorMutation.mutateAsync({
        majorCode: newCode.trim().toUpperCase(),
        majorName: newName.trim(),
        vietnameseName: newVnName.trim() || newName.trim(),
        department: newDept,
        headOfDepartment: newHead.trim() || 'Chưa chỉ định',
        totalCreditsRequired: Number(newCredits) || 144,
        description: `Chương trình đào tạo ${newVnName || newName} tại FPT University.`,
        isActive: true,
      });

      setShowCreateModal(false);
      setSuccessNotice(`Created major track in DB: ${newVnName || newName} (${newCode.toUpperCase()})`);
      setTimeout(() => setSuccessNotice(null), 3500);
      refetch();
    } catch (err: any) {
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
      setSuccessNotice(`Created major track locally: ${created.vietnameseName} (${created.code})`);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const handleDeleteMajor = async (majorId: string, majorName: string) => {
    if (window.confirm(`Delete major track ${majorName}?`)) {
      try {
        const numericId = majorId.replace(/\D/g, '');
        if (numericId) {
          await deleteMajorMutation.mutateAsync(numericId);
        }
      } catch (e) {
        console.warn('Delete major fallback to local:', e);
      }
      setMajors((prev) => prev.filter((m) => m.id !== majorId));
      setSuccessNotice(`Deleted major track ${majorName}`);
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>ACADEMIC TAXONOMY</span>
            <span>&gt;</span>
            <span className="text-blue-600">DEGREE TRACKS (MAJORS)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Degree Tracks & Curriculums
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage all 32 undergraduate and graduate academic programs, department chairs, and credit requirements.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Major Track</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by major code (SE, IA, AI), English title, or Vietnamese name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full md:w-56 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Departments</option>
          <option value="Công nghệ thông tin">Information Technology</option>
          <option value="An toàn thông tin">Information Assurance</option>
          <option value="Khoa học máy tính">Computer Science</option>
          <option value="Thiết kế đồ họa">Graphic Design</option>
          <option value="Quản trị kinh doanh">Business Administration</option>
        </select>
      </div>

      {/* Majors Grid (Figma 59:9018) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMajors.map((major) => (
          <div
            key={major.id}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-base flex items-center justify-center">
                    {major.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {major.vietnameseName}
                    </h3>
                    <span className="text-[11px] text-slate-400">{major.name}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800">{major.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department Chair:</span>
                  <span className="font-semibold text-slate-800">{major.headOfDepartment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Credits & Duration:</span>
                  <span className="font-bold text-blue-600">{major.totalCreditsRequired} Credits (9 Semesters)</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {major.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDeleteMajor(major.id, major.vietnameseName)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                title="Delete major"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <Link
                to={`/majors/${major.code}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <span>9-Semester Roadmap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Major */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Add New Major Track</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMajor} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="SE"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold uppercase"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Vietnamese Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="Kỹ thuật phần mềm"
                    value={newVnName}
                    onChange={(e) => setNewVnName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">English Title:</label>
                <input
                  type="text"
                  required
                  placeholder="Software Engineering"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Department:</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="An toàn thông tin">An toàn thông tin</option>
                    <option value="Khoa học máy tính">Khoa học máy tính</option>
                    <option value="Thiết kế đồ họa">Thiết kế đồ họa</option>
                    <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Department Chair:</label>
                  <input
                    type="text"
                    placeholder="Dr. Kieu Trong..."
                    value={newHead}
                    onChange={(e) => setNewHead(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700"
                >
                  Create Major
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
