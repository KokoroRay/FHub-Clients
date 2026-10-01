import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Network,
  BookOpen,
  Sparkles,
  CheckCircle2,
  MapPin,
  Users,
  FileText,
  MessageSquare,
  Star,
  RefreshCw,
  Tag,
  Cpu,
  Layers,
  Clock,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { mockDetailedCourseNodes, DetailedCourseNode } from '../../../services/adminMockData';

export const CourseNodeDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [courses, setCourses] = useState<DetailedCourseNode[]>(mockDetailedCourseNodes);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const course = courses.find((c) => c.code === code) || courses[0];

  const handleTriggerAISummary = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      setSuccessMessage('AI Summarizer đã tái phân tích toàn bộ giáo trình và cập nhật tóm tắt chuẩn ABET!');
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 800);
  };

  const handleTriggerTagSuggestion = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      setSuccessMessage('AI Tag Suggestion đã quét 128 bài thảo luận và tối ưu hóa 7 bộ tag môn học!');
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/course-nodes"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#005da7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh mục Course Nodes
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Syllabus: {course.syllabusVersion}</span>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Course Banner Header Card (Figma 62:11573) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#005da7] dark:text-sky-400 font-mono font-black text-2xl flex items-center justify-center shadow-xs">
              {course.code.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-mono font-black text-[#005da7]">{course.code}</span>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">{course.title}</h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">{course.vietnameseTitle}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                <span>Chuyên ngành: <strong>{course.majorCode}</strong></span>
                <span>• Học kỳ: <strong>Kỳ {course.semester}</strong></span>
                <span>• Tín chỉ: <strong>{course.credits} Tín chỉ</strong></span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" /> {course.averageRating} / 5.0 ({course.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTriggerAISummary}
              disabled={isAiProcessing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-[#005da7] hover:from-indigo-700 hover:to-[#004a87] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-amber-300 ${isAiProcessing ? 'animate-spin' : ''}`} />
              <span>AI Re-Summarize</span>
            </button>
            <button
              onClick={handleTriggerTagSuggestion}
              disabled={isAiProcessing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Tag className="w-4 h-4 text-indigo-500" />
              <span>AI Suggest Tags</span>
            </button>
          </div>
        </div>

        {/* Prerequisites & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="font-semibold text-slate-400 block mb-1">Môn học tiên quyết (Prerequisites):</span>
            <div className="flex items-center gap-2">
              {course.prerequisites && course.prerequisites.length > 0 ? (
                course.prerequisites.map((p) => (
                  <Link
                    key={p}
                    to={`/course-nodes/${p}`}
                    className="px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 hover:bg-amber-100"
                  >
                    {p}
                  </Link>
                ))
              ) : (
                <span className="text-emerald-600 font-semibold">Không có môn tiên quyết</span>
              )}
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-400 block mb-1">Mô tả giáo trình tóm tắt:</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{course.description}</p>
          </div>
        </div>
      </div>

      {/* AI Content Intelligence Assistant Card */}
      {course.aiAnalysis && (
        <div className="p-6 bg-linear-to-br from-indigo-950 via-slate-900 to-slate-900 text-white rounded-2xl border border-indigo-800/40 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-indigo-200">AI Content Intelligence Insights</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Vertex AI Model 1.5
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/10">
            {course.aiAnalysis.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-slate-400 text-[11px]">Độ Khó Học Thuật (Difficulty):</span>
              <p className="text-base font-black text-amber-400 mt-0.5">{course.aiAnalysis.difficultyScore} / 10.0</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-slate-400 text-[11px]">Tương Thích Tiên Quyết:</span>
              <p className="text-base font-black text-emerald-400 mt-0.5">{course.aiAnalysis.prerequisiteReadinessScore} / 10.0</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-slate-400 text-[11px]">Câu Hỏi Trùng Đã Khử (Deduplication):</span>
              <p className="text-base font-black text-sky-400 mt-0.5">{course.aiAnalysis.duplicateQuestionsFiltered} câu hỏi</p>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-[11px] text-slate-400 block mb-1.5">AI Suggested Tags:</span>
            <div className="flex flex-wrap gap-1.5">
              {course.aiAnalysis.suggestedTags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5 Campus Offerings Matrix */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Phân Phối & Giảng Dạy Trên 5 Cơ Sở (Campus Offerings)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {course.campusOfferings.map((co) => (
            <div key={co.campusCode} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-[#005da7] text-white font-mono font-bold text-xs flex items-center justify-center">
                  {co.campusCode}
                </span>
                <span className="text-[10px] px-2 py-0.2 bg-emerald-50 text-emerald-700 rounded-full font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="text-xs">
                <div className="font-black text-slate-900 dark:text-white">{co.enrolledStudents} Sinh viên</div>
                <div className="text-[11px] text-slate-400">{co.activeClasses} Lớp học mở</div>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                {co.lecturers.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Syllabus Learning Objectives & Topics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Objectives */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chuẩn Đầu Ra (Learning Objectives)</h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {course.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Topics Breakdown */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nội Dung Chủ Đề (Topics Syllabus)</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {course.topics.map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                    {t.order}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{t.title}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{t.estimatedHours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
