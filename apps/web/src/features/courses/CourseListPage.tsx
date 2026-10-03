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
  Download,
  ArrowRight,
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
      {/* Page Header (Figma Frame 2: Course Hub) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Course Hub
            </h1>
            <Badge variant="primary" size="md">
              {filteredCourses.length} Môn học
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hệ thống tri thức, ngân hàng đề thi & cẩm nang học tập chuẩn CTĐT Đại học FPT.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã môn (PRN211, SWP391...)"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Major Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedMajor('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedMajor === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          Tất cả chuyên ngành
        </button>
        {mockMajors.map((m) => (
          <button
            key={m.code}
            onClick={() => setSelectedMajor(m.code)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedMajor === m.code
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {m.code} - {m.name}
          </button>
        ))}
      </div>

      {/* Semester Filter */}
      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
        <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 mr-1">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Học kỳ:</span>
        </div>
        <button
          onClick={() => setSelectedSemester('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            selectedSemester === 'ALL' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất cả
        </button>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              selectedSemester === sem ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
            }`}
          >
            HK {sem}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((c) => (
          <Card key={c.id} hoverable className="flex flex-col justify-between">
            <CardBody className="p-5 space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/courses/${c.code}`}
                      className="text-lg font-black text-blue-600 dark:text-blue-400 hover:underline tracking-tight"
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
                    className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors line-clamp-1 leading-snug"
                  >
                    {c.title}
                  </Link>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-black text-xs shrink-0 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{c.averageRating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {c.description}
              </p>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center text-xs">
                <div>
                  <div className="font-extrabold text-slate-800 dark:text-slate-200">{c.followerCount.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">Sinh viên theo dõi</div>
                </div>
                <div className="border-x border-slate-200 dark:border-slate-700">
                  <div className="font-extrabold text-blue-600 dark:text-blue-400">48</div>
                  <div className="text-[10px] text-slate-400">Thảo luận Q&A</div>
                </div>
                <div>
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400">32</div>
                  <div className="text-[10px] text-slate-400">Tài liệu học</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <Button
                  size="sm"
                  variant={c.isFollowed ? 'secondary' : 'outline'}
                  onClick={() => toggleFollow(c.id)}
                  leftIcon={c.isFollowed ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Plus className="w-3.5 h-3.5" />}
                >
                  {c.isFollowed ? 'Đã theo dõi' : 'Theo dõi môn'}
                </Button>

                <Link to={`/courses/${c.code}`}>
                  <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Xem chi tiết
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
