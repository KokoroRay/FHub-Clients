import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Network,
  Plus,
  Search,
  Filter,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Trash2,
  ChevronRight,
  MapPin,
  Users,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { mockDetailedCourseNodes, DetailedCourseNode } from '../../../services/adminMockData';

export const CourseNodesAdminPage: React.FC = () => {
  const [courses, setCourses] = useState<DetailedCourseNode[]>(mockDetailedCourseNodes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form State
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newVnTitle, setNewVnTitle] = useState('');
  const [newMajor, setNewMajor] = useState('SE');
  const [newSemester, setNewSemester] = useState(5);
  const [newCredits, setNewCredits] = useState(3);
  const [newPrereqs, setNewPrereqs] = useState('');

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vietnameseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMajor = selectedMajor === 'ALL' || c.majorCode === selectedMajor;
    const matchesSem = selectedSemester === 'ALL' || c.semester.toString() === selectedSemester;

    return matchesSearch && matchesMajor && matchesSem;
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) return;

    const prereqList = newPrereqs
      .split(',')
      .map((p) => p.trim().toUpperCase())
      .filter(Boolean);

    const created: DetailedCourseNode = {
      id: `cn-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      vietnameseTitle: newVnTitle.trim() || newTitle.trim(),
      description: `Môn học ${newTitle} thuộc chuyên ngành ${newMajor} tại FPT University.`,
      majorCode: newMajor,
      department: 'Kỹ thuật phần mềm',
      syllabusVersion: 'v2026.1',
      semester: Number(newSemester) || 1,
      credits: Number(newCredits) || 3,
      followerCount: 0,
      discussionCount: 0,
      materialCount: 0,
      workflowCount: 0,
      reviewCount: 0,
      averageRating: 5.0,
      prerequisites: prereqList,
      learningObjectives: ['Nắm vững kiến thức cốt lõi môn học'],
      campusOfferings: [
        { campusCode: 'HL', activeClasses: 5, enrolledStudents: 150, lecturers: ['Giảng viên bộ môn'] },
        { campusCode: 'HCM', activeClasses: 5, enrolledStudents: 150, lecturers: ['Giảng viên bộ môn'] },
      ],
      topics: [],
    };

    setCourses((prev) => [...prev, created]);
    setShowCreateModal(false);
    setSuccessNotice(`Đã khởi tạo thành công Course Node: ${created.code} - ${created.title}`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleDeleteCourse = (courseId: string, code: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa Course Node ${code}?`)) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setSuccessNotice(`Đã xóa Course Node ${code}`);
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
            Course Nodes Registry (186 Courses)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản trị danh mục môn học, syllabus, quan hệ tiên quyết và phân phối 5 cơ sở FPT University.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Course Node Mới</span>
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
            placeholder="Tìm theo Mã môn (PRN211, SWP391), tên tiếng Việt, tiếng Anh..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={selectedMajor}
          onChange={(e) => setSelectedMajor(e.target.value)}
          className="w-full md:w-44 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">Tất cả Ngành (Major)</option>
          <option value="SE">Software Engineering (SE)</option>
          <option value="IA">Information Assurance (IA)</option>
          <option value="AI">Artificial Intelligence (AI)</option>
          <option value="GD">Graphic Design (GD)</option>
        </select>

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-full md:w-40 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">Tất cả Học kỳ</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
            <option key={s} value={s.toString()}>
              Học kỳ {s}
            </option>
          ))}
        </select>
      </div>

      {/* Course Nodes Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Course Code & Title</th>
                <th className="py-3 px-3 font-semibold">Major & Semester</th>
                <th className="py-3 px-3 font-semibold">Credits</th>
                <th className="py-3 px-3 font-semibold">Campuses Active</th>
                <th className="py-3 px-3 font-semibold">Materials / Q&A</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCourses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#005da7] dark:text-sky-400 font-mono font-black text-xs flex items-center justify-center">
                        {c.code.substring(0, 3)}
                      </div>
                      <div>
                        <Link
                          to={`/course-nodes/${c.code}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-[#005da7] flex items-center gap-1.5"
                        >
                          <span className="font-mono text-[#005da7]">{c.code}</span>
                          <span>- {c.title}</span>
                        </Link>
                        <div className="text-[11px] text-slate-400">{c.vietnameseTitle}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-bold font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {c.majorCode}
                    </span>
                    <span className="text-slate-500 text-[11px] ml-2">Kỳ {c.semester}</span>
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {c.credits} TC
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {c.campusOfferings.map((co) => (
                        <span
                          key={co.campusCode}
                          className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold text-[9px] flex items-center justify-center"
                          title={`${co.campusCode}: ${co.enrolledStudents} sinh viên`}
                        >
                          {co.campusCode}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-500">
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-indigo-500" /> {c.materialCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-amber-500" /> {c.discussionCount}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right space-x-1">
                    <Link
                      to={`/course-nodes/${c.code}`}
                      className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#005da7] bg-sky-50 dark:bg-sky-950/50 hover:bg-[#cfe1fe] transition-colors"
                    >
                      Syllabus
                    </Link>

                    <button
                      onClick={() => handleDeleteCourse(c.id, c.code)}
                      className="inline-flex items-center p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Xóa course node"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Course Node */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Khởi Tạo Course Node Mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mã Môn:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: PRM392"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tên Tiếng Anh:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Mobile Programming"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tên Tiếng Việt:</label>
                <input
                  type="text"
                  placeholder="VD: Lập trình thiết bị di động"
                  value={newVnTitle}
                  onChange={(e) => setNewVnTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Chuyên Ngành:</label>
                  <select
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="SE">SE</option>
                    <option value="IA">IA</option>
                    <option value="AI">AI</option>
                    <option value="GD">GD</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Học Kỳ:</label>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={newSemester}
                    onChange={(e) => setNewSemester(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Số Tín Chỉ:</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Môn Tiên Quyết (cách nhau dấu phẩy):</label>
                <input
                  type="text"
                  placeholder="VD: PRO192, CSD201"
                  value={newPrereqs}
                  onChange={(e) => setNewPrereqs(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#005da7] text-white text-xs font-bold cursor-pointer"
                >
                  Khởi Tạo Course Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
