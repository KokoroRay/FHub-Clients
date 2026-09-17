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
      {/* Page Header (Figma 20:1892) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Questions & Discussions</span>
            <Badge variant="primary" size="md">{filteredQuestions.length}</Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Đặt câu hỏi, giải đáp thắc mắc bài tập và trao đổi học thuật cùng cộng đồng sinh viên FHub.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Đặt câu hỏi mới
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm câu hỏi, từ khóa, môn học..."
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#005da7]"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === f.id
                  ? 'bg-[#005da7] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Tag Clearer */}
      {selectedTag && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Đang lọc theo tag:</span>
          <Badge variant="purple" size="sm">
            #{selectedTag}
          </Badge>
          <button
            onClick={() => setSelectedTag(null)}
            className="text-xs text-rose-500 hover:underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Không tìm thấy câu hỏi phù hợp. Hãy là người đầu tiên đặt câu hỏi!
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <Card key={q.id} hoverable>
              <CardBody className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={q.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={q.author.fullName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {q.author.fullName}
                      </span>
                      {q.author.isAnonymous && <span className="text-[10px] text-slate-400 ml-1.5">(Ẩn danh)</span>}
                    </div>
                    {q.courseCode && (
                      <Link to={`/courses/${q.courseCode}`}>
                        <Badge variant="primary" size="sm">
                          {q.courseCode}
                        </Badge>
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {q.isModVerified && (
                      <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                        Mod Verified
                      </Badge>
                    )}
                    {q.isSolved && (
                      <Badge variant="primary" size="sm">
                        Đã có lời giải
                      </Badge>
                    )}
                  </div>
                </div>

                <Link
                  to={`/discussions/${q.id}`}
                  className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-[#005da7] transition-colors block leading-snug"
                >
                  {q.title}
                </Link>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {q.content}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {q.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#cfe1fe] hover:text-[#005da7] transition-colors cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-semibold text-[#005da7]">
                      <ThumbsUp className="w-3.5 h-3.5" /> {q.upvotes} Upvotes
                    </span>
                    <Link to={`/discussions/${q.id}`} className="flex items-center gap-1 hover:text-[#005da7]">
                      <MessageSquare className="w-3.5 h-3.5" /> {q.answersCount} Câu trả lời
                    </Link>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {q.viewsCount} Xem
                    </span>
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
