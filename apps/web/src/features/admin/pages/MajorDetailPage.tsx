import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  GraduationCap,
  Plus,
  BookOpen,
  Network,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { mockDetailedMajors, DetailedMajor } from '../../../services/adminMockData';

export const MajorDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [majors, setMajors] = useState<DetailedMajor[]>(mockDetailedMajors);
  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form State
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState(3);
  const [newPrerequisites, setNewPrerequisites] = useState('');

  const major = majors.find((m) => m.code === code) || majors[0];

  const handleAddCourseToSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseTitle.trim()) return;

    const prereqs = newPrerequisites
      .split(',')
      .map((p) => p.trim().toUpperCase())
      .filter(Boolean);

    const updatedRoadmap = [...major.curriculumRoadmap];
    let semObj = updatedRoadmap.find((s) => s.semester === selectedSemester);

    if (!semObj) {
      semObj = {
        semester: selectedSemester,
        semesterName: `Học kỳ ${selectedSemester}`,
        courses: [],
      };
      updatedRoadmap.push(semObj);
    }

    semObj.courses.push({
      code: newCourseCode.trim().toUpperCase(),
      title: newCourseTitle.trim(),
      credits: Number(newCourseCredits) || 3,
      prerequisites: prereqs,
      isMandatory: true,
    });

    setMajors((prev) =>
      prev.map((m) => (m.id === major.id ? { ...m, curriculumRoadmap: updatedRoadmap } : m))
    );

    setShowAddCourseModal(false);
    setNewCourseCode('');
    setNewCourseTitle('');
    setNewPrerequisites('');
    setSuccessNotice(`Đã thêm môn ${newCourseCode.toUpperCase()} vào Học kỳ ${selectedSemester}`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleRemoveCourse = (semNum: number, courseCode: string) => {
    if (window.confirm(`Xóa môn ${courseCode} khỏi Học kỳ ${semNum}?`)) {
      const updatedRoadmap = major.curriculumRoadmap.map((s) =>
        s.semester === semNum
          ? { ...s, courses: s.courses.filter((c) => c.code !== courseCode) }
          : s
      );

      setMajors((prev) =>
        prev.map((m) => (m.id === major.id ? { ...m, curriculumRoadmap: updatedRoadmap } : m))
      );

      setSuccessNotice(`Đã xóa môn ${courseCode} khỏi Học kỳ ${semNum}`);
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/majors"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#005da7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Ngành Học (Majors)
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Curriculum v2026.1</span>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Major Banner Card (Figma 59:9908) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#005da7] dark:text-sky-400 font-black text-2xl flex items-center justify-center">
              {major.code}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">{major.vietnameseName}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ABET ACCREDITED
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{major.name} • Khối {major.department}</p>
              <p className="text-xs text-slate-400 mt-1">Chủ nhiệm bộ môn: <strong>{major.headOfDepartment}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Gán Môn Vào Kỳ {selectedSemester}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Chuẩn Tốt Nghiệp</span>
            <p className="text-xl font-black text-[#005da7]">{major.totalCreditsRequired} Tín chỉ</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Thời Lượng Chương Trình</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">9 Học kỳ (3 năm)</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Thực Tập Doanh Nghiệp</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">OJT Học kỳ 6</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Khóa Luận / Đồ Án TN</span>
            <p className="text-xl font-black text-emerald-600">Capstone Kỳ 9</p>
          </div>
        </div>
      </div>

      {/* Semester Selector Bar (Semesters 1 to 9) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSemester === sem
                ? 'bg-[#005da7] text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            Học kỳ {sem} {sem === 6 ? '(OJT)' : sem === 9 ? '(Capstone)' : ''}
          </button>
        ))}
      </div>

      {/* Selected Semester Course Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Khung Môn Học - Học Kỳ {selectedSemester}
            </h2>
            <p className="text-xs text-slate-500">
              Danh mục các Course Nodes bắt buộc và tự chọn trong giai đoạn này.
            </p>
          </div>

          <button
            onClick={() => setShowAddCourseModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#005da7] hover:underline cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm môn vào kỳ {selectedSemester}
          </button>
        </div>

        {(() => {
          const currentSemData = major.curriculumRoadmap.find((s) => s.semester === selectedSemester);
          const courses = currentSemData?.courses || [];

          if (courses.length === 0) {
            return (
              <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                Chưa có môn học nào được gán cho Học kỳ {selectedSemester}. Bấm "+ Thêm môn vào kỳ {selectedSemester}" để bắt đầu gán Course Node.
              </div>
            );
          }

          return (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses.map((c) => (
                <div key={c.code} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#005da7] font-black text-xs flex items-center justify-center">
                      {c.code.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/course-nodes/${c.code}`} className="font-bold text-xs text-[#005da7] hover:underline">
                          {c.code}
                        </Link>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{c.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>{c.credits} Tín chỉ</span>
                        {c.prerequisites.length > 0 ? (
                          <span className="text-amber-600 font-semibold">
                            Tiên quyết: {c.prerequisites.join(', ')}
                          </span>
                        ) : (
                          <span className="text-emerald-600">Không có tiên quyết</span>
                        )}
                        <span className="text-slate-500">
                          {c.isMandatory ? '● Bắt buộc' : '○ Tự chọn'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/course-nodes/${c.code}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#005da7] bg-sky-50 dark:bg-sky-950/50 hover:bg-[#cfe1fe]"
                    >
                      Syllabus
                    </Link>
                    <button
                      onClick={() => handleRemoveCourse(selectedSemester, c.code)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Gỡ khỏi kỳ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Modal: Add Course to Semester */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Gán Course Node Vào Học Kỳ {selectedSemester}
              </h2>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCourseToSemester} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mã Môn:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: PRN231"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Số Tín Chỉ:</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newCourseCredits}
                    onChange={(e) => setNewCourseCredits(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tên Môn Học:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Building Cross-Platform Web API with .NET"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Môn Tiên Quyết (cách nhau dấu phẩy):</label>
                <input
                  type="text"
                  placeholder="VD: PRN211, DBI202"
                  value={newPrerequisites}
                  onChange={(e) => setNewPrerequisites(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#005da7] text-white text-xs font-bold cursor-pointer"
                >
                  Gán Vào Kỳ {selectedSemester}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
