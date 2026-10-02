import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { mockDetailedCourseNodes, DetailedCourseNode } from '../../../services/adminMockData';
import { useCourseNodes } from '../../../services/api';

export const CourseNodeDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { data: courseNodesData } = useCourseNodes();
  const [courses, setCourses] = useState<DetailedCourseNode[]>(mockDetailedCourseNodes);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (courseNodesData?.items && courseNodesData.items.length > 0) {
      const found = courseNodesData.items.find(
        (c: any) => c.courseCode.toLowerCase() === code?.toLowerCase()
      );
      if (found) {
        const f = found as any;
        const mapped: DetailedCourseNode = {
          id: String(f.courseNodeId),
          code: f.courseCode,
          title: f.courseName,
          vietnameseTitle: f.vietnameseTitle || f.courseName,
          description: f.description || `Môn học ${f.courseName} tại FPT University.`,
          majorCode: f.majorCode || 'SE',
          department: f.department || 'Kỹ thuật phần mềm',
          syllabusVersion: f.syllabusVersion || 'v2026.1',
          semester: f.semester || 1,
          credits: f.creditCount || 3,
          followerCount: f.followerCount || 0,
          discussionCount: f.discussionCount || 0,
          materialCount: f.materialCount || 0,
          workflowCount: f.workflowCount || 0,
          reviewCount: f.reviewCount || 0,
          averageRating: f.averageRating || 5.0,
          prerequisites: f.prerequisites || [],
          learningObjectives: f.learningObjectives || ['Nắm vững kiến thức cốt lõi môn học'],
          campusOfferings: (f.campusOfferings || [
            { campusCode: 'HL', activeClasses: 5, enrolledStudents: 150, lecturers: ['Bộ môn'] },
            { campusCode: 'HCM', activeClasses: 5, enrolledStudents: 150, lecturers: ['Bộ môn'] },
          ]) as any,
          topics: f.topics || [],
          aiAnalysis: {
            difficultyScore: 7.8,
            prerequisiteReadinessScore: 8.5,
            duplicateQuestionsFiltered: 42,
            summary: `Môn học ${f.courseCode} - ${f.courseName} đã được đồng bộ chuẩn đầu ra ABET từ Taxonomy Service.`,
            suggestedTags: [f.courseCode.toLowerCase(), 'fpt-university', 'academic'],
          },
        };

        setCourses((prev) => {
          const idx = prev.findIndex((c) => c.code.toLowerCase() === code?.toLowerCase());
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = mapped;
            return copy;
          }
          return [mapped, ...prev];
        });
      }
    }
  }, [courseNodesData, code]);

  const course = courses.find((c) => c.code.toLowerCase() === code?.toLowerCase()) || courses[0];

  const handleTriggerAISummary = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      setSuccessMessage('AI Summarizer has re-synthesized the complete course syllabus according to ABET criteria.');
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 800);
  };

  const handleTriggerTagSuggestion = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      setSuccessMessage('AI Tag Engine scanned active Q&A threads and refreshed course taxonomy tags.');
      setTimeout(() => setSuccessMessage(null), 3500);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/course-nodes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course Nodes
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Syllabus: {course.syllabusVersion}</span>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Course Banner Header Card (Figma 62:11573) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 font-mono font-bold text-xl flex items-center justify-center shrink-0">
              {course.code.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-mono font-bold text-blue-600">{course.code}</span>
                <h1 className="text-lg font-bold text-slate-900">{course.title}</h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">{course.vietnameseTitle}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                <span>Major: <strong>{course.majorCode}</strong></span>
                <span>•</span>
                <span>Semester: <strong>Sem {course.semester}</strong></span>
                <span>•</span>
                <span>Credits: <strong>{course.credits} Credits</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" /> {course.averageRating} ({course.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTriggerAISummary}
              disabled={isAiProcessing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isAiProcessing ? 'animate-spin' : ''}`} />
              <span>AI Re-Summarize</span>
            </button>
            <button
              onClick={handleTriggerTagSuggestion}
              disabled={isAiProcessing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Suggest Tags</span>
            </button>
          </div>
        </div>

        {/* Prerequisites & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="font-semibold text-slate-400 block mb-1">Prerequisites:</span>
            <div className="flex items-center gap-2">
              {course.prerequisites && course.prerequisites.length > 0 ? (
                course.prerequisites.map((p) => (
                  <Link
                    key={p}
                    to={`/course-nodes/${p}`}
                    className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  >
                    {p}
                  </Link>
                ))
              ) : (
                <span className="text-emerald-600 font-semibold">None (Foundation)</span>
              )}
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-400 block mb-1">Course Description:</span>
            <p className="text-slate-600 leading-relaxed">{course.description}</p>
          </div>
        </div>
      </div>

      {/* AI Content Intelligence Card */}
      {course.aiAnalysis && (
        <div className="p-5 bg-slate-900 text-white rounded-xl shadow-2xs space-y-3.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">AI Content Intelligence Insights</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Vertex AI Gemini 1.5 Pro
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">
            {course.aiAnalysis.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase">Academic Difficulty:</span>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{course.aiAnalysis.difficultyScore} / 10.0</p>
            </div>
            <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase">Prereq Readiness:</span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{course.aiAnalysis.prerequisiteReadinessScore} / 10.0</p>
            </div>
            <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase">Deduplicated Q&A:</span>
              <p className="text-sm font-bold text-blue-400 mt-0.5">{course.aiAnalysis.duplicateQuestionsFiltered} filtered</p>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap gap-1.5 items-center">
            <span className="text-slate-400 text-[11px] mr-1">Taxonomy Tags:</span>
            {course.aiAnalysis.suggestedTags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded font-mono text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5 Campus Offerings Matrix */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
          Campus Distribution & Offerings (5 Regional Nodes)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {course.campusOfferings.map((co) => (
            <div key={co.campusCode} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                  {co.campusCode}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded font-bold">
                  ACTIVE
                </span>
              </div>
              <div>
                <div className="font-bold text-slate-900">{co.enrolledStudents} Students</div>
                <div className="text-[10px] text-slate-400">{co.activeClasses} Classes</div>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 truncate">
                {co.lecturers.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Syllabus Learning Objectives & Topics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Learning Objectives (ABET)</h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {course.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Topics Syllabus</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {course.topics.map((t) => (
              <div key={t.id} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center">
                    {t.order}
                  </span>
                  <span className="font-medium text-slate-800">{t.title}</span>
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
