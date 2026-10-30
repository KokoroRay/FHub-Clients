import { RecordDialog } from '../../../components/common/RecordDialog';
import { Button } from '../../../components/common/Button';
import { majorsApi } from '../../../services/api/adminApi';
import { useConfirmDialog } from '../../../components/common/useConfirmDialog';
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
import { DetailedMajor } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { useMajors, useCreateMajor, useDeleteMajor } from '../../../services/api';

export const MajorsPage: React.FC = () => {
  const { confirm, confirmationDialog } = useConfirmDialog();
  const { t } = useLanguage();
  const { data: majorsData, isLoading, refetch } = useMajors();
  const createMajorMutation = useCreateMajor();
  const deleteMajorMutation = useDeleteMajor();

  const [majors, setMajors] = useState<DetailedMajor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMajor, setEditingMajor] = useState<DetailedMajor | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newVnName, setNewVnName] = useState('');
  const [newDept, setNewDept] = useState('Công nghệ thông tin');
  const [newHead, setNewHead] = useState('');
  const [newCredits, setNewCredits] = useState(144);

  useEffect(() => {
    if (majorsData?.items) {
      const mapped: DetailedMajor[] = majorsData.items.map((m: any) => ({
        id: String(m.majorId),
        code: m.majorCode || '',
        name: m.majorName || '',
        vietnameseName: m.vietnameseName || m.majorName || '',
        description: m.description || t("Chương trình đào tạo {p0} tại FPT University.", undefined, { p0: m.vietnameseName || m.majorName || '' }),
        department: m.department || t("Công nghệ thông tin"),
        headOfDepartment: m.headOfDepartment || t("Chưa chỉ định"),
        totalCreditsRequired: m.totalCreditsRequired || 0,
        durationSemesters: m.durationSemesters || 0,
        totalCourses: m.totalCourses || 0,
        isActive: m.isActive ?? true,
        curriculumRoadmap: m.curriculumRoadmap || [],
      }));
      setMajors(mapped);
    }
  }, [majorsData]);

  const filteredMajors = majors.filter((m) => {
    const q = (searchQuery || '').toLowerCase();
    const codeMatch = (m?.code || '').toLowerCase().includes(q);
    const nameMatch = (m?.name || '').toLowerCase().includes(q);
    const vnNameMatch = (m?.vietnameseName || '').toLowerCase().includes(q);
    const matchesSearch = codeMatch || nameMatch || vnNameMatch;
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
        headOfDepartment: newHead.trim() || t("Chưa chỉ định"),
        totalCreditsRequired: Number(newCredits) || 0,
        description: `Chương trình đào tạo ${newVnName || newName} tại FPT University.`,
        isActive: true,
      });

      setShowCreateModal(false);
      setSuccessNotice(t("Created major track in DB: {p0} ({p1})", undefined, { p0: newVnName || newName, p1: newCode.toUpperCase() }));
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
        headOfDepartment: newHead.trim() || t("Chưa chỉ định"),
        totalCreditsRequired: Number(newCredits) || 0,
        durationSemesters: 0,
        totalCourses: 0,
        isActive: true,
        curriculumRoadmap: [],
      };
      setMajors((prev) => [...prev, created]);
      setShowCreateModal(false);
      setSuccessNotice(t("Created major track locally: {p0} ({p1})", undefined, { p0: created.vietnameseName, p1: created.code }));
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const handleDeleteMajor = async (majorId: string, majorName: string) => {
    if (await confirm(t("Delete major track {p0}?", undefined, { p0: majorName }))) {
      try {
        const numericId = majorId.replace(/\D/g, '');
        if (numericId) {
          await deleteMajorMutation.mutateAsync(numericId);
        }
      } catch (e) {
        console.warn('Delete major fallback to local:', e);
      }
      setMajors((prev) => prev.filter((m) => m.id !== majorId));
      setSuccessNotice(t("Deleted major track {p0}", undefined, { p0: majorName }));
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {editingMajor && <RecordDialog title={t('Edit Major')} onClose={() => setEditingMajor(null)} fields={[
        {key:'code', label:'Major Code', value:editingMajor.code, readOnly:true},
        {key:'name', label:'Major Name', value:editingMajor.name},
        {key:'description', label:'Description', value:editingMajor.description, multiline:true},
        {key:'active', label:'Status', value:editingMajor.isActive ? 'Active' : 'Inactive', options:['Active','Inactive']},
      ]} onSave={async v => { await majorsApi.updateMajor(editingMajor.id, {majorName:v.name, description:v.description, isActive:v.active === 'Active'}); await refetch(); }} />}
      {confirmationDialog}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>{t("ACADEMIC TAXONOMY")}</span>
            <span>{t("&gt;")}</span>
            <span className="text-blue-600">{t("DEGREE TRACKS (MAJORS)")}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t("Degree Tracks & Curriculums")}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("Manage all")} {majors.length}  {t("undergraduate and graduate academic programs, department chairs, and credit requirements.")}</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('Add New')}</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t(successNotice)}</span>
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
            placeholder={t("Search by major code (SE, IA, AI), English title, or Vietnamese name...")}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full md:w-56 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="ALL">{t('Tất cả') || 'All Departments'}</option>
          <option value="Công nghệ thông tin">{t("Information Technology")}</option>
          <option value="An toàn thông tin">{t("Information Assurance")}</option>
          <option value="Khoa học máy tính">{t("Computer Science")}</option>
          <option value="Thiết kế đồ họa">{t("Graphic Design")}</option>
          <option value="Quản trị kinh doanh">{t("Business Administration")}</option>
        </select>
      </div>

      {/* Majors Grid (Figma 59:9018) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMajors.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            {t("0 degree tracks found matching your filter criteria.")}</div>
        ) : (
          filteredMajors.map((major) => (
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
                    {t("ACTIVE")}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("Department:")}</span>
                    <span className="font-semibold text-slate-800">{major.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("Department Chair:")}</span>
                    <span className="font-semibold text-slate-800">{major.headOfDepartment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("Credits & Duration:")}</span>
                    <span className="font-bold text-blue-600">
                      {major.totalCreditsRequired}  {t("Credits (")}{major.durationSemesters}  {t("Semesters)")}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {major.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button size="sm" variant="ghost" onClick={() => setEditingMajor(major)}>{t('Edit')}</Button>
                <button
                  onClick={() => handleDeleteMajor(major.id, major.vietnameseName)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                  title={t("Delete major")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link
                  to={`/majors/${major.code}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <span>{major.durationSemesters > 0 ? t("{p0}-Semester Roadmap", undefined, { p0: major.durationSemesters }) : t("Curriculum Roadmap")}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Major */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{t("Add New Major Track")}</h2>
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
                  <label className="text-xs font-semibold text-slate-700">{t("Code:")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("SE")}
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold uppercase"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">{t("Vietnamese Title:")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("Kỹ thuật phần mềm")}
                    value={newVnName}
                    onChange={(e) => setNewVnName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t("English Title:")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("Software Engineering")}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">{t("Department:")}</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Công nghệ thông tin">{t("Công nghệ thông tin")}</option>
                    <option value="An toàn thông tin">{t("An toàn thông tin")}</option>
                    <option value="Khoa học máy tính">{t("Khoa học máy tính")}</option>
                    <option value="Thiết kế đồ họa">{t("Thiết kế đồ họa")}</option>
                    <option value="Quản trị kinh doanh">{t("Quản trị kinh doanh")}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">{t("Department Chair:")}</label>
                  <input
                    type="text"
                    placeholder={t("Dr. Kieu Trong...")}
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
                  {t("Cancel")}</button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700"
                >
                  {t("Create Major")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
