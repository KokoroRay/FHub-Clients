import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { mockDetailedMajors, DetailedMajor } from '../../../services/adminMockData';
import { useMajorDetail, useAddCourseToSemester, useRemoveCourseFromSemester } from '../../../services/api';

export const MajorDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { data: majorDetailData, refetch } = useMajorDetail(code);
  const addCourseMutation = useAddCourseToSemester();
  const removeCourseMutation = useRemoveCourseFromSemester();

  const [majors, setMajors] = useState<DetailedMajor[]>(mockDetailedMajors);
  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form State
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState(3);
  const [newPrerequisites, setNewPrerequisites] = useState('');

  useEffect(() => {
    if (majorDetailData) {
      const d = majorDetailData;
      const mapped: DetailedMajor = {
        id: String(d.majorId),
        code: d.majorCode,
        name: d.majorName,
        vietnameseName: d.vietnameseName || d.majorName,
        description: d.description || `Chương trình đào tạo ${d.vietnameseName || d.majorName} tại FPT University.`,
        department: d.department || 'Công nghệ thông tin',
        headOfDepartment: d.headOfDepartment || 'Chưa chỉ định',
        totalCreditsRequired: d.totalCreditsRequired || 144,
        durationSemesters: d.durationSemesters || 9,
        totalCourses: d.totalCourses || 36,
        isActive: d.isActive ?? true,
        curriculumRoadmap: (d.curriculumRoadmap && d.curriculumRoadmap.length > 0)
          ? d.curriculumRoadmap.map((s: any) => ({
              semester: s.semester,
              semesterName: s.semesterName || `Học kỳ ${s.semester}`,
              courses: s.courses || [],
            }))
          : (mockDetailedMajors.find(m => m.code === code)?.curriculumRoadmap || []),
      };
      setMajors((prev) => {
        const idx = prev.findIndex((m) => m.code === d.majorCode);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = mapped;
          return copy;
        }
        return [mapped, ...prev];
      });
    }
  }, [majorDetailData, code]);

  const major = majors.find((m) => m.code === code) || majors[0];

  const handleAddCourseToSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseTitle.trim()) return;

    const prereqs = newPrerequisites
      .split(',')
      .map((p) => p.trim().toUpperCase())
      .filter(Boolean);

    try {
      await addCourseMutation.mutateAsync({
        majorId: major.id,
        payload: {
          semesterNumber: selectedSemester,
          courseCode: newCourseCode.trim().toUpperCase(),
          courseTitle: newCourseTitle.trim(),
          credits: Number(newCourseCredits) || 3,
          prerequisites: prereqs,
          isMandatory: true,
        },
      });
      refetch();
    } catch (err) {
      console.warn('Backend curriculum course add fallback to local:', err);
    }

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
    setSuccessNotice(`Added course ${newCourseCode.toUpperCase()} to Semester ${selectedSemester}`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleRemoveCourse = async (semNum: number, courseCode: string) => {
    if (window.confirm(`Remove course ${courseCode} from Semester ${semNum}?`)) {
      try {
        await removeCourseMutation.mutateAsync({
          majorId: major.id,
          courseCode,
          semester: semNum,
        });
        refetch();
      } catch (err) {
        console.warn('Backend curriculum remove fallback to local:', err);
      }

      const updatedRoadmap = major.curriculumRoadmap.map((s) =>
        s.semester === semNum
          ? { ...s, courses: s.courses.filter((c) => c.code !== courseCode) }
          : s
      );

      setMajors((prev) =>
        prev.map((m) => (m.id === major.id ? { ...m, curriculumRoadmap: updatedRoadmap } : m))
      );

      setSuccessNotice(`Removed course ${courseCode} from Semester ${semNum}`);
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/majors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Major Tracks
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Curriculum v2026.1</span>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Major Banner Card (Figma 59:9908) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 font-bold text-xl flex items-center justify-center shrink-0">
              {major.code}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-slate-900">{major.vietnameseName}</h1>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ABET ACCREDITED
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{major.name} • Department: {major.department}</p>
              <p className="text-xs text-slate-400 mt-0.5">Chair: <strong>{major.headOfDepartment}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course to Sem {selectedSemester}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Graduation Requirement</span>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{major.totalCreditsRequired} Credits</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Duration</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">9 Semesters (3 Years)</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Industry Internship</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">OJT Semester 6</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Graduation Thesis</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">Capstone Semester 9</p>
          </div>
        </div>
      </div>

      {/* Semester Selector Bar (Semesters 1 to 9) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedSemester === sem
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Semester {sem} {sem === 6 ? '(OJT)' : sem === 9 ? '(Capstone)' : ''}
          </button>
        ))}
      </div>

      {/* Selected Semester Course Matrix */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Course Nodes Matrix - Semester {selectedSemester}
            </h2>
            <p className="text-xs text-slate-400">
              Mandatory and elective course nodes assigned to this semester.
            </p>
          </div>

          <button
            onClick={() => setShowAddCourseModal(true)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Course
          </button>
        </div>

        {(() => {
          const currentSemData = major.curriculumRoadmap.find((s) => s.semester === selectedSemester);
          const courses = currentSemData?.courses || [];

          if (courses.length === 0) {
            return (
              <div className="p-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                No course nodes assigned to Semester {selectedSemester} yet. Click "+ Add Course" to map nodes.
              </div>
            );
          }

          return (
            <div className="divide-y divide-slate-100">
              {courses.map((c) => (
                <div key={c.code} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-blue-600 font-bold font-mono text-xs flex items-center justify-center">
                      {c.code.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/course-nodes/${c.code}`} className="font-bold text-xs text-blue-600 hover:underline font-mono">
                          {c.code}
                        </Link>
                        <span className="font-semibold text-xs text-slate-800">{c.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span>{c.credits} Credits</span>
                        {c.prerequisites.length > 0 ? (
                          <span className="text-amber-700 font-semibold">
                            Prerequisites: {c.prerequisites.join(', ')}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">No prerequisites</span>
                        )}
                        <span className="text-slate-500">
                          {c.isMandatory ? '● Mandatory' : '○ Elective'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/course-nodes/${c.code}`}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      Syllabus
                    </Link>
                    <button
                      onClick={() => handleRemoveCourse(selectedSemester, c.code)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Remove from semester"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Add Course Node to Semester {selectedSemester}
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
                  <label className="text-xs font-semibold text-slate-700">Course Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="PRN231"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Credits:</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newCourseCredits}
                    onChange={(e) => setNewCourseCredits(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Course Title:</label>
                <input
                  type="text"
                  required
                  placeholder="Building Cross-Platform Web API with .NET"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Prerequisites (comma-separated):</label>
                <input
                  type="text"
                  placeholder="PRN211, DBI202"
                  value={newPrerequisites}
                  onChange={(e) => setNewPrerequisites(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700"
                >
                  Assign to Sem {selectedSemester}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
