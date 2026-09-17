import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Users,
  MessageSquare,
  FileText,
  Workflow,
  Star,
  Check,
  Plus,
  Filter,
} from 'lucide-react';
import { mockCourses, mockMajors } from '../../services/mockData';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const CourseListPage: React.FC = () => {
  const [selectedMajor, setSelectedMajor] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState(mockCourses);

  const toggleFollow = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              isFollowed: !c.isFollowed,
              followerCount: c.isFollowed ? c.followerCount - 1 : c.followerCount + 1,
            }
          : c
      )
    );
  };

  const filteredCourses = courses.filter((c) => {
    const matchMajor = selectedMajor === 'ALL' || c.majorCode === selectedMajor;
    const matchSemester = selectedSemester === 'ALL' || c.semester === selectedSemester;
    const matchSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMajor && matchSemester && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Course Hub
            </h1>
            <Badge variant="primary" size="md">
              {filteredCourses.length} Môn học
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Khám phá tài liệu, câu hỏi bài tập và cẩm nang môn học từ các chuyên ngành FPT University.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã môn (PRN211, SWP391...)"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#005da7]"
          />
        </div>
      </div>

      {/* Major Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedMajor('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedMajor === 'ALL'
              ? 'bg-[#005da7] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          Tất cả chuyên ngành
        </button>
        {mockMajors.map((m) => (
          <button
            key={m.code}
            onClick={() => setSelectedMajor(m.code)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedMajor === m.code
                ? 'bg-[#005da7] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {m.code} - {m.name}
          </button>
        ))}
      </div>

      {/* Semester Filter */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-600 dark:text-slate-300">Học kỳ:</span>
        <button
          onClick={() => setSelectedSemester('ALL')}
          className={`px-2 py-0.5 rounded-md ${selectedSemester === 'ALL' ? 'bg-[#cfe1fe] text-[#005da7] font-bold' : 'hover:bg-slate-100'}`}
        >
          Tất cả
        </button>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-2 py-0.5 rounded-md ${selectedSemester === sem ? 'bg-[#cfe1fe] text-[#005da7] font-bold' : 'hover:bg-slate-100'}`}
          >
            HK {sem}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((c) => (
          <Card key={c.id} hoverable className="flex flex-col justify-between">
            <CardBody className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/courses/${c.code}`}
                      className="text-base font-black text-[#005da7] hover:underline"
                    >
                      {c.code}
                    </Link>
                    <Badge variant="neutral" size="sm">
                      {c.credits} Tín chỉ
                    </Badge>
                    <Badge variant="purple" size="sm">
                      HK {c.semester}
                    </Badge>
                  </div>
                  <Link
                    to={`/courses/${c.code}`}
                    className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-1 block hover:text-[#005da7] transition-colors"
                  >
                    {c.title}
                  </Link>
                </div>

                <Button
                  variant={c.isFollowed ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => toggleFollow(c.id)}
                  leftIcon={c.isFollowed ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                >
                  {c.isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
                </Button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {c.description}
              </p>

              {/* Stats badges */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">
                    {c.discussionCount}
                  </span>
                  <span className="text-[10px] text-slate-400">Hỏi đáp</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">
                    {c.materialCount}
                  </span>
                  <span className="text-[10px] text-slate-400">Tài liệu</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">
                    {c.workflowCount}
                  </span>
                  <span className="text-[10px] text-slate-400">Workflow</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="block font-bold text-xs text-amber-600 flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {c.averageRating}
                  </span>
                  <span className="text-[10px] text-slate-400">{c.reviewCount} Review</span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
