import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Users,
  Bookmark,
  Star,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { mockCourses, mockMajors } from '../../services/mockData';

export const CourseListPage: React.FC = () => {
  const [selectedMajor, setSelectedMajor] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'rating' | 'popular'>('code');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState(mockCourses);
  const [bookmarkedCodes, setBookmarkedCodes] = useState<Set<string>>(new Set());

  const toggleBookmark = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        const matchMajor = selectedMajor === 'ALL' || c.majorCode === selectedMajor;
        const matchSemester = selectedSemester === 'ALL' || String(c.semester) === selectedSemester;
        const matchSearch =
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchMajor && matchSemester && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.averageRating - a.averageRating;
        if (sortBy === 'popular') return b.followerCount - a.followerCount;
        return a.code.localeCompare(b.code);
      });
  }, [courses, selectedMajor, selectedSemester, sortBy, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header (Figma #93:4640) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#181C22] tracking-tight">
              Course Hub
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D3E3FF] text-[#001C39]">
              <BookOpen className="w-3.5 h-3.5 text-[#0076D1]" />
              <span>{filteredCourses.length} of {courses.length} Courses</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#404753] mt-1">
            Explore courses, connect with classmates, and find course resources.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar (Figma #93:4660) */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Left: Search input (5 cols) */}
        <div className="relative md:col-span-5">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by name or code..."
            className="w-full bg-[#F0F3FD] border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-[#707785] focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
          />
        </div>

        {/* Major / Department filter (3 cols) */}
        <div className="md:col-span-3">
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {mockMajors.map((m) => (
              <option key={m.code} value={m.code}>
                {m.code} - {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester filter (2 cols) */}
        <div className="md:col-span-2">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
              <option key={s} value={String(s)}>
                Term {s}
              </option>
            ))}
          </select>
        </div>

        {/* Sort by dropdown (2 cols) */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0076D1] cursor-pointer"
          >
            <option value="code">Sort: Course Code</option>
            <option value="rating">Sort: Highest Rating</option>
            <option value="popular">Sort: Most Enrolled</option>
          </select>
        </div>
      </div>

      {/* Course Cards Grid: 3-column desktop layout (Figma #93:4702) */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          Không tìm thấy môn học nào khớp với bộ lọc tìm kiếm.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((c) => {
            const isBookmarked = bookmarkedCodes.has(c.code);
            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#0076D1]/40 transition-all p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top row: Code Pill & Bookmark button (Figma #93:4706) */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#D3E3FF] text-[#0076D1]">
                      {c.code}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(c.code, e)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'bg-blue-50 border-blue-200 text-[#0076D1]'
                          : 'border-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                      title="Bookmark Course"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#0076D1]' : ''}`} />
                    </button>
                  </div>

                  {/* Course Title (Figma #93:4712) */}
                  <Link
                    to={`/courses/${c.code}`}
                    className="font-bold text-sm sm:text-base text-[#181C22] group-hover:text-[#0076D1] transition-colors line-clamp-1 block leading-snug"
                  >
                    {c.title}
                  </Link>

                  {/* Description (Figma #93:4714) */}
                  <p className="text-xs text-[#404753] line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Metadata Row: Term, Credits, Rating (Figma #93:4716) */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-1">
                    <span>Term {c.semester}</span>
                    <span>•</span>
                    <span>{c.credits} Credits</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{c.averageRating}</span>
                    </span>
                  </div>

                  {/* Topic / Department Chips (Figma #93:4723) */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-[#404753]">
                      {c.majorCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-[#404753]">
                      {c.credits >= 4 ? 'Core Discipline' : 'Major Required'}
                    </span>
                  </div>
                </div>

                {/* View Course Action Button (Figma #93:4728) */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{c.followerCount.toLocaleString()} enrolled</span>
                  </span>

                  <Link
                    to={`/courses/${c.code}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0076D1] group-hover:underline"
                  >
                    <span>View Course</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
