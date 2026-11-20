import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Workflow,
  FileText,
  MessageSquare,
  Plus,
  ExternalLink,
  Send,
  Briefcase,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';
import { alumniApi, questionApi } from '../../services/api/contentApi';
import { CreateWorkflowModal } from '../workflows/CreateWorkflowModal';

type AlumniTab = 'workflows' | 'articles' | 'questions';

export const AlumniKarmaPage: React.FC = () => {
  const { formatDate, t } = useLanguage();
  const { currentUser } = useAuth();
  const isAlumni = currentUser?.role === 'Alumni';

  const [activeTab, setActiveTab] = useState<AlumniTab>('workflows');
  const [loading, setLoading] = useState(true);

  const [industryWorkflows, setIndustryWorkflows] = useState<any[]>([]);
  const [careerArticles, setCareerArticles] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  // UC21.1 Create Industry Workflow Modal
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  // UC21.3 Answer Question as Alumni Expert Modal
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [industryContext, setIndustryContext] = useState('');
  const [expertAnswerBody, setExpertAnswerBody] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [wfRes, artRes, qRes] = await Promise.all([
        alumniApi.listIndustryWorkflows({ pageSize: 20 }).catch(() => ({ items: [] })),
        alumniApi.listCareerArticles({ pageSize: 20 }).catch(() => ({ items: [] })),
        questionApi.getQuestions({ sortBy: 'newest', pageSize: 20 }).catch(() => ({ items: [] })),
      ]);

      setIndustryWorkflows(Array.isArray(wfRes) ? wfRes : wfRes?.items || []);
      setCareerArticles(Array.isArray(artRes) ? artRes : artRes?.items || []);
      setQuestions(Array.isArray(qRes) ? qRes : qRes?.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenExpertAnswer = (q: any) => {
    setSelectedQuestion(q);
    setIndustryContext('');
    setExpertAnswerBody('');
    setFeedback(null);
  };

  const handleSubmitExpertAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !expertAnswerBody.trim()) return;

    const qId = selectedQuestion.questionId || selectedQuestion.id;
    setSubmittingAnswer(true);
    setFeedback(null);
    try {
      await alumniApi.createExpertAnswer(qId, {
        body: expertAnswerBody.trim(),
        industryContext: industryContext.trim() || 'Alumni Industry Expert',
      });
      setFeedback({
        type: 'success',
        message: t('Đã gửi câu trả lời Chuyên gia Cựu sinh viên (Verified Alumni Expert) thành công!'),
      });
      setSelectedQuestion(null);
      setExpertAnswerBody('');
      setIndustryContext('');
      fetchAllData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        t('Không thể gửi câu trả lời. Vui lòng thử lại.');
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 uppercase tracking-wider">
              {t('UC21 • Verified Industry Knowledge')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <Award className="w-6 h-6 text-amber-500" />
            <span>{t('Trung tâm Đóng góp Tri thức Ngành (Alumni Hub)')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t(
              'Kênh dành riêng cho Cựu sinh viên FPT (Alumni) chia sẻ quy trình thực tế doanh nghiệp, bài viết định hướng nghề nghiệp và giải đáp thắc mắc với tư cách Chuyên gia.'
            )}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAllData}
          disabled={loading}
          leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
        >
          {t('Làm mới')}
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {feedback.message}
          </span>
          <button onClick={() => setFeedback(null)} className="font-bold px-2">
            ×
          </button>
        </div>
      )}

      {/* 3 Core UC21 Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* UC21.1: Create Industry Workflow */}
        <Card className="border-emerald-200/80 dark:border-emerald-900/60 hover:shadow-md transition-shadow">
          <CardBody className="p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <Workflow className="w-5 h-5" />
                </div>
                <Badge variant="success" size="sm">
                  {industryWorkflows.length} {t('Workflows')}
                </Badge>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t('1. Quy trình Thực tế Ngành (Industry Workflow)')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('Chia sẻ quy trình làm việc chuẩn doanh nghiệp (CI/CD, Agile, System Design, Đồ án thực tế) gắn huy hiệu Alumni.')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setIsWorkflowModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                {t('Tạo Industry Workflow')}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* UC21.2: Create Career and Industry Article */}
        <Card className="border-amber-200/80 dark:border-amber-900/60 hover:shadow-md transition-shadow">
          <CardBody className="p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <Badge variant="warning" size="sm">
                  {careerArticles.length} {t('Articles')}
                </Badge>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t('2. Bài viết Nghề nghiệp & Ngành (Career Article)')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('Viết bài chia sẻ kinh nghiệm phỏng vấn, lộ trình sự nghiệp và xu hướng công nghệ cho sinh viên FPT.')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/articles/create" className="flex-1">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  {t('Viết bài Career & Industry')}
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* UC21.3: Answer Questions as an Alumni Expert */}
        <Card className="border-blue-200/80 dark:border-blue-900/60 hover:shadow-md transition-shadow">
          <CardBody className="p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <Badge variant="primary" size="sm">
                  {questions.length} {t('Câu hỏi')}
                </Badge>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t('3. Giải đáp với tư cách Chuyên gia (Expert Q&A)')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('Trả lời câu hỏi học thuật & kỹ thuật của sinh viên kèm bối cảnh thực tế ngành và huy hiệu Alumni Expert.')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab('questions')}
                leftIcon={<Briefcase className="w-3.5 h-3.5" />}
              >
                {t('Chọn câu hỏi để giải đáp')}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'workflows'
              ? 'bg-[#0076D1] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>{t('Industry Workflows')} ({industryWorkflows.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'articles'
              ? 'bg-[#0076D1] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('Career & Industry Articles')} ({careerArticles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-[#0076D1] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('Câu hỏi chờ Alumni giải đáp')} ({questions.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {activeTab === 'workflows' && t('Danh sách Industry Workflows do Alumni đóng góp')}
              {activeTab === 'articles' && t('Danh sách Bài viết Nghề nghiệp & Ngành (Career & Industry)')}
              {activeTab === 'questions' && t('Câu hỏi từ Sinh viên — Trả lời với tư cách Alumni Expert')}
            </h3>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('Đang tải dữ liệu...')}</span>
            </div>
          ) : activeTab === 'workflows' ? (
            industryWorkflows.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Workflow className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs text-slate-500">
                  {t('Chưa có Industry Workflow nào. Hãy tạo quy trình thực tế ngành đầu tiên!')}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsWorkflowModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  {t('Tạo Industry Workflow')}
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {industryWorkflows.map((wf: any) => (
                  <div
                    key={wf.workflowId || wf.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="success" size="sm">
                          {t('VERIFIED INDUSTRY')}
                        </Badge>
                        <Link
                          to={`/workflows/${wf.workflowId || wf.id}`}
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-[#0076D1] truncate"
                        >
                          {wf.title}
                        </Link>
                      </div>
                      {wf.summary && (
                        <p className="text-xs text-slate-500 line-clamp-2">{wf.summary}</p>
                      )}
                    </div>
                    <Link
                      to={`/workflows/${wf.workflowId || wf.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0076D1] shrink-0"
                    >
                      <span>{t('Xem chi tiết')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'articles' ? (
            careerArticles.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs text-slate-500">
                  {t('Chưa có bài viết Career & Industry nào. Hãy chia sẻ kinh nghiệm nghề nghiệp của bạn!')}
                </p>
                <Link to="/articles/create">
                  <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    {t('Viết bài Career & Industry')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {careerArticles.map((art: any) => (
                  <div
                    key={art.articleId || art.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="warning" size="sm">
                          {art.articleType || 'CAREER_ARTICLE'}
                        </Badge>
                        <Link
                          to={`/articles/${art.articleId || art.id}`}
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-[#0076D1] truncate"
                        >
                          {art.title}
                        </Link>
                      </div>
                      {art.summary && (
                        <p className="text-xs text-slate-500 line-clamp-2">{art.summary}</p>
                      )}
                    </div>
                    <Link
                      to={`/articles/${art.articleId || art.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0076D1] shrink-0"
                    >
                      <span>{t('Đọc bài viết')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )
          ) : questions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              {t('Hiện chưa có câu hỏi nào từ sinh viên.')}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {questions.map((q: any) => (
                <div
                  key={q.questionId || q.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0 space-y-1">
                    <Link
                      to={`/discussions/${q.questionId || q.id}`}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-[#0076D1] block truncate"
                    >
                      {q.title}
                    </Link>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{q.answerCount ?? 0} {t('câu trả lời')}</span>
                      {q.createdAt && <span>• {formatDate(q.createdAt)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/discussions/${q.questionId || q.id}`}>
                      <Button variant="outline" size="sm">
                        {t('Xem câu hỏi')}
                      </Button>
                    </Link>
                    {isAlumni && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenExpertAnswer(q)}
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                      >
                        {t('Trả lời Chuyên gia')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* UC21.1 Modal: Create Industry Workflow */}
      <CreateWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        onCreated={() => {
          setIsWorkflowModalOpen(false);
          setFeedback({
            type: 'success',
            message: t('Đã xuất bản Industry Workflow (Alumni) thành công!'),
          });
          setTimeout(fetchAllData, 800);
        }}
      />

      {/* UC21.3 Modal: Answer Question as Alumni Expert */}
      <Modal
        isOpen={Boolean(selectedQuestion)}
        onClose={() => setSelectedQuestion(null)}
        title={t('Trả lời câu hỏi với tư cách Chuyên gia Cựu sinh viên (Alumni Expert)')}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
              {t('Hủy')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitExpertAnswer}
              disabled={submittingAnswer || !expertAnswerBody.trim()}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              {submittingAnswer ? t('Đang gửi...') : t('Gửi câu trả lời Chuyên gia')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitExpertAnswer} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              {t('Câu hỏi đang giải đáp')}
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {selectedQuestion?.title}
            </p>
          </div>

          <Input
            label={t('Bối cảnh thực tế ngành / Kinh nghiệm của bạn (Industry Context)')}
            placeholder={t('Ví dụ: Senior Backend Engineer tại FPT Software (5 năm kinh nghiệm .NET & Microservices)')}
            value={industryContext}
            onChange={(e) => setIndustryContext(e.target.value)}
          />

          <Textarea
            label={t('Nội dung giải đáp chuyên môn *')}
            placeholder={t('Chia sẻ giải pháp thực tế, best practices và lời khuyên áp dụng trong dự án doanh nghiệp...')}
            rows={6}
            value={expertAnswerBody}
            onChange={(e) => setExpertAnswerBody(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
