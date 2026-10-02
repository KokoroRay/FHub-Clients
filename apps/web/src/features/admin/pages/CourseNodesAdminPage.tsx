import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { mockDetailedCourseNodes, DetailedCourseNode } from '../../../services/adminMockData';
import { useCourseNodes, useCreateCourseNode, useDeleteCourseNode } from '../../../services/api';

export const CourseNodesAdminPage: React.FC = () => {
  const { data: courseNodesData, isLoading, refetch } = useCourseNodes();
  const createCourseMutation = useCreateCourseNode();
  const deleteCourseMutation = useDeleteCourseNode();

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

  useEffect(() => {
    if (courseNodesData?.items && courseNodesData.items.length > 0) {
      const mapped: DetailedCourseNode[] = courseNodesData.items.map((c: any) => ({
        id: String(c.courseNodeId),
        code: c.courseCode,
        title: c.courseName,
        vietnameseTitle: c.vietnameseTitle || c.courseName,
        description: c.description || `Môn học ${c.courseName} tại FPT University.`,
        majorCode: c.majorCode || 'SE',
        department: c.department || 'Kỹ thuật phần mềm',
        syllabusVersion: c.syllabusVersion || 'v2026.1',
        semester: c.semester || 1,
        credits: c.creditCount || 3,
        followerCount: c.followerCount || 0,
        discussionCount: c.discussionCount || 0,
        materialCount: c.materialCount || 0,
        workflowCount: c.workflowCount || 0,
        reviewCount: c.reviewCount || 0,
        averageRating: c.averageRating || 5.0,
        prerequisites: c.prerequisites || [],
        learningObjectives: c.learningObjectives || ['Nắm vững kiến thức cốt lõi môn học'],
        campusOfferings: c.campusOfferings || [
          { campusCode: 'HL', activeClasses: 5, enrolledStudents: 150, lecturers: ['Bộ môn'] },
          { campusCode: 'HCM', activeClasses: 5, enrolledStudents: 150, lecturers: ['Bộ môn'] },
        ],
        topics: c.topics || [],
      }));
      setCourses(mapped);
    }
  }, [courseNodesData]);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vietnameseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMajor = selectedMajor === 'ALL' || c.majorCode === selectedMajor;
    const matchesSem = selectedSemester === 'ALL' || c.semester.toString() === selectedSemester;

    return matchesSearch && matchesMajor && matchesSem;
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) return;

    const prereqList = newPrereqs
      .split(',')
      .map((p) => p.trim().toUpperCase())
      .filter(Boolean);

    try {
      await createCourseMutation.mutateAsync({
        courseCode: newCode.trim().toUpperCase(),
        courseName: newTitle.trim(),
        creditCount: Number(newCredits) || 3,
        description: `Môn học ${newTitle.trim()} thuộc chuyên ngành ${newMajor} tại FPT University.`,
        isActive: true,
      });

      setShowCreateModal(false);
      setSuccessNotice(`Created Course Node in DB: ${newCode.toUpperCase()} - ${newTitle}`);
      setTimeout(() => setSuccessNotice(null), 3500);
      refetch();
    } catch (err: any) {
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
      setSuccessNotice(`Created Course Node locally: ${created.code} - ${created.title}`);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const handleDeleteCourse = async (courseId: string, code: string) => {
    if (window.confirm(`Delete Course Node ${code}?`)) {
      try {
        const numericId = courseId.replace(/\D/g, '');
        if (numericId) {
          await deleteCourseMutation.mutateAsync(numericId);
        }
      } catch (e) {
        console.warn('Delete course node fallback to local:', e);
      }
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setSuccessNotice(`Deleted Course Node ${code}`);
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
            <span className="text-blue-600">COURSE NODES REGISTRY (186 NODES)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Course Nodes Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage course syllabus, prerequisites, credit mappings, and campus offerings across all degrees.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Course Node</span>
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
            placeholder="Search by course code (PRN211, SWP391), English title, or Vietnamese name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedMajor}
          onChange={(e) => setSelectedMajor(e.target.value)}
          className="w-full md:w-44 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Majors</option>
          <option value="SE">Software Engineering (SE)</option>
          <option value="IA">Information Assurance (IA)</option>
          <option value="AI">Artificial Intelligence (AI)</option>
          <option value="GD">Graphic Design (GD)</option>
        </select>

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-full md:w-40 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
            <option key={s} value={s.toString()}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      {/* Course Nodes Data Table (Figma 61:10719) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">COURSE CODE & TITLE</th>
                <th className="py-3 px-3 font-bold">MAJOR & SEM</th>
                <th className="py-3 px-3 font-bold">CREDITS</th>
                <th className="py-3 px-3 font-bold">CAMPUSES ACTIVE</th>
                <th className="py-3 px-3 font-bold">MATERIALS / Q&A</th>
                <th className="py-3 px-4 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {c.code.substring(0, 3)}
                      </div>
                      <div>
                        <Link
                          to={`/course-nodes/${c.code}`}
                          className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1.5"
                        >
                          <span className="font-mono text-blue-600">{c.code}</span>
                          <span>- {c.title}</span>
                        </Link>
                        <div className="text-[11px] text-slate-400">{c.vietnameseTitle}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 rounded font-bold font-mono text-[10px] bg-slate-100 text-slate-700">
                      {c.majorCode}
                    </span>
                    <span className="text-slate-500 text-[11px] ml-1.5">Sem {c.semester}</span>
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-800">
                    {c.credits} Credits
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {c.campusOfferings.map((co) => (
                        <span
                          key={co.campusCode}
                          className="w-5 h-5 rounded bg-slate-100 text-slate-600 font-mono font-bold text-[9px] flex items-center justify-center"
                          title={`${co.campusCode}: ${co.enrolledStudents} students`}
                        >
                          {co.campusCode}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-500">
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-blue-500" /> {c.materialCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-amber-500" /> {c.discussionCount}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right space-x-1.5">
                    <Link
                      to={`/course-nodes/${c.code}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      Syllabus
                    </Link>

                    <button
                      onClick={() => handleDeleteCourse(c.id, c.code)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete course node"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Add Course Node</h2>
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
                  <label className="text-xs font-semibold text-slate-700">Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="PRM392"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">English Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="Mobile Programming"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Vietnamese Title:</label>
                <input
                  type="text"
                  placeholder="Lập trình thiết bị di động"
                  value={newVnTitle}
                  onChange={(e) => setNewVnTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Major:</label>
                  <select
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs"
                  >
                    <option value="SE">SE</option>
                    <option value="IA">IA</option>
                    <option value="AI">AI</option>
                    <option value="GD">GD</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Sem:</label>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={newSemester}
                    onChange={(e) => setNewSemester(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Credits:</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Prerequisites (comma-separated):</label>
                <input
                  type="text"
                  placeholder="PRO192, CSD201"
                  value={newPrereqs}
                  onChange={(e) => setNewPrereqs(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
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
                  Add Course Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
