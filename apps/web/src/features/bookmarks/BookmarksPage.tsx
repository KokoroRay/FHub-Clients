import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, FileText, Workflow, MessageSquare, BookOpen } from 'lucide-react';
import { mockArticles, mockWorkflows, mockQuestions } from '../../services/mockData';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';

export const BookmarksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'workflows' | 'questions'>('all');

  const [bookmarkedArticles, setBookmarkedArticles] = useState(mockArticles);
  const [bookmarkedWorkflows, setBookmarkedWorkflows] = useState(mockWorkflows);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(mockQuestions.slice(0, 1));

  const removeArticle = (id: string) => setBookmarkedArticles(bookmarkedArticles.filter((a) => a.id !== id));
  const removeWorkflow = (id: string) => setBookmarkedWorkflows(bookmarkedWorkflows.filter((w) => w.id !== id));
  const removeQuestion = (id: string) => setBookmarkedQuestions(bookmarkedQuestions.filter((q) => q.id !== id));

  const totalCount = bookmarkedArticles.length + bookmarkedWorkflows.length + bookmarkedQuestions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Bookmark className="w-6 h-6 text-blue-600 fill-blue-600" />
            <span>Mục đã lưu (Bookmarks)</span>
            <Badge variant="primary" size="md">{totalCount}</Badge>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Danh sách bài viết công nghệ, workflows và câu hỏi bạn đã đánh dấu lưu để xem lại.
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'Tất cả mục đã lưu', count: totalCount },
          { id: 'articles', label: 'Tech Articles', count: bookmarkedArticles.length, icon: <FileText className="w-4 h-4" /> },
          { id: 'workflows', label: 'Workflows', count: bookmarkedWorkflows.length, icon: <Workflow className="w-4 h-4" /> },
          { id: 'questions', label: 'Q&A Thảo luận', count: bookmarkedQuestions.length, icon: <MessageSquare className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      <div className="space-y-3.5">
        {(activeTab === 'all' || activeTab === 'articles') &&
          bookmarkedArticles.map((art) => (
            <Card key={art.id} hoverable>
              <CardBody className="p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="sm">{art.category}</Badge>
                    <span className="text-[11px] text-slate-400">• Tech Article</span>
                  </div>
                  <Link to={`/articles/${art.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 block">
                    {art.title}
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-1">{art.summary}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeArticle(art.id)} title="Bỏ lưu">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </CardBody>
            </Card>
          ))}

        {(activeTab === 'all' || activeTab === 'workflows') &&
          bookmarkedWorkflows.map((wf) => (
            <Card key={wf.id} hoverable>
              <CardBody className="p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{wf.courseCode}</Badge>
                    <span className="text-xs font-bold text-purple-600">{wf.technology}</span>
                  </div>
                  <Link to={`/workflows/${wf.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 block">
                    {wf.title}
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-1">{wf.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeWorkflow(wf.id)} title="Bỏ lưu">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </CardBody>
            </Card>
          ))}

        {(activeTab === 'all' || activeTab === 'questions') &&
          bookmarkedQuestions.map((q) => (
            <Card key={q.id} hoverable>
              <CardBody className="p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{q.courseCode}</Badge>
                    <span className="text-[11px] text-slate-400">• Q&A Discussion</span>
                  </div>
                  <Link to={`/discussions/${q.id}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 block">
                    {q.title}
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-1">{q.content}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeQuestion(q.id)} title="Bỏ lưu">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </CardBody>
            </Card>
          ))}
      </div>
    </div>
  );
};
