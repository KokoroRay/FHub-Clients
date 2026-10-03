import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  CheckCircle2,
  Tag,
  Filter,
  Check,
} from 'lucide-react';
import { mockQuestions, mockCourses } from '../../services/mockData';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { AskQuestionModal } from './AskQuestionModal';

export const QuestionListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTag = searchParams.get('tag');
  const shouldOpenCreate = searchParams.get('action') === 'create';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);
  const [filterType, setFilterType] = useState<'all' | 'unanswered' | 'solved' | 'verified'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(shouldOpenCreate);
  const [questions, setQuestions] = useState(mockQuestions);

  const filteredQuestions = questions.filter((q) => {
    const matchSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTag = selectedTag ? q.tags.includes(selectedTag) : true;
    const matchType =
      filterType === 'all'
        ? true
        : filterType === 'unanswered'
        ? q.answersCount === 0
        : filterType === 'solved'
        ? q.isSolved
        : filterType === 'verified'
        ? q.isModVerified
        : true;
    return matchSearch && matchTag && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header (Figma Frame 4: Discussions) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Questions & Discussions
            </h1>
            <Badge variant="primary" size="md">
              {filteredQuestions.length} Thảo luận
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Đặt câu hỏi, giải đáp thắc mắc bài tập & thảo luận học thuật cùng cộng đồng FHub.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-xs"
        >
          Đặt câu hỏi mới
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm câu hỏi, từ khóa, môn học (PRN211...)"
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'unanswered', label: 'Chưa trả lời' },
            { id: 'solved', label: 'Đã giải quyết' },
            { id: 'verified', label: 'Mod Verified' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === f.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Tag Filter clear */}
      {selectedTag && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Đang lọc theo tag:</span>
          <Badge variant="purple" size="sm">
            #{selectedTag}
          </Badge>
          <button
            onClick={() => setSelectedTag(null)}
            className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Question Cards List */}
      <div className="space-y-3.5">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Không tìm thấy câu hỏi phù hợp. Hãy là người đầu tiên đặt câu hỏi!
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <Card key={q.id} hoverable className="transition-all">
              <CardBody className="p-5 flex flex-col sm:flex-row items-start gap-4">
                {/* Left Stats Column: Votes & Answers box */}
                <div className="flex sm:flex-col items-center gap-2 sm:gap-1.5 shrink-0 w-full sm:w-20 text-center">
                  <div className="flex items-center sm:flex-col justify-center px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 w-auto sm:w-full">
                    <span>{q.upvotes}</span>
                    <span className="text-[10px] text-slate-400 sm:font-normal ml-1 sm:ml-0">votes</span>
                  </div>

                  <div
                    className={`flex items-center sm:flex-col justify-center px-2 py-1 rounded-lg text-xs font-bold w-auto sm:w-full ${
                      q.isSolved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{q.answersCount}</span>
                    <span className="text-[10px] sm:font-normal ml-1 sm:ml-0">
                      {q.isSolved ? '✓ answers' : 'answers'}
                    </span>
                  </div>
                </div>

                {/* Right Content Column */}
                <div className="flex-1 space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {q.courseCode && (
                        <Link to={`/courses/${q.courseCode}`}>
                          <Badge variant="primary" size="sm">
                            {q.courseCode}
                          </Badge>
                        </Link>
                      )}
                      {q.isSolved && (
                        <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                          Solved
                        </Badge>
                      )}
                      {q.isModVerified && (
                        <Badge variant="info" size="sm" icon={<Check className="w-3 h-3" />}>
                          Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(q.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <Link
                    to={`/discussions/${q.id}`}
                    className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors line-clamp-2 leading-snug block"
                  >
                    {q.title}
                  </Link>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {q.content}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {q.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                      <img
                        src={q.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={q.author.fullName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{q.author.fullName}</span>
                      <span className="text-slate-400">• {q.viewsCount} lượt xem</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newQ) => {
          setQuestions([newQ, ...questions]);
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
};
