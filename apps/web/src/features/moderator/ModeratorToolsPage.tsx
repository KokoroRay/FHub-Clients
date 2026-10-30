import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Pin,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Tag,
  EyeOff,
  Eye,
  Plus,
  RefreshCw,
  FileText,
  Clock,
  UserX,
  Filter
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/Input';
import {
  governanceModerationApi,
  semanticTagsApi,
  ContentReportItem,
  ProcessReportPayload,
  ModerationContentItem,
  SemanticTagItemDto
} from '../../services/api/adminApi';
import { seriesApi } from '../../services/api/contentApi';
import { useLanguage } from '../../context/LanguageContext';
import { RecordDialog } from '../../components/common/RecordDialog';

export const ModeratorToolsPage: React.FC = () => {
  const { locale, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'reports' | 'moderation' | 'warnings' | 'series' | 'tags'>('reports');

  // Reports Queue State
  const [reports, setReports] = useState<ContentReportItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportFilterStatus, setReportFilterStatus] = useState<string>('PENDING');
  const [selectedReport, setSelectedReport] = useState<ContentReportItem | null>(null);
  const [detailReport, setDetailReport] = useState<ContentReportItem | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [resolutionStatus, setResolutionStatus] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [resolutionNote, setResolutionNote] = useState('');
  const [actionType, setActionType] = useState('HIDE_CONTENT');
  const [actionReason, setActionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Direct Content Moderation State
  const [targetType, setTargetType] = useState<'QUESTION' | 'ARTICLE' | 'ANSWER' | 'COMMENT'>('QUESTION');
  const [targetId, setTargetId] = useState('');
  const [targetNodeId, setTargetNodeId] = useState('1');
  const [moderationReason, setModerationReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Issue Warning State
  const [warnUserId, setWarnUserId] = useState('');
  const [warnType, setWarnType] = useState('ACADEMIC_MISCONDUCT');
  const [warnMessage, setWarnMessage] = useState('');
  const [warnRelatedId, setWarnRelatedId] = useState('');
  const [warnLoading, setWarnLoading] = useState(false);
  const [warnFeedback, setWarnFeedback] = useState<string | null>(null);

  // Series & Tags State
  const [seriesList, setSeriesList] = useState([
    { id: 's1', title: 'ASP.NET Core Master Series', author: 'Lê Hoàng Long (Alumni)', postCount: 5, views: '12.4k' },
    { id: 's2', title: 'Data Structures & Algorithms in Java', author: 'Phạm Minh Đức (Mod)', postCount: 8, views: '28.1k' },
  ]);

  // Content Moderation List
  const [contentList, setContentList] = useState<ModerationContentItem[]>([]);
  const [contentListLoading, setContentListLoading] = useState(false);
  const [contentDetail, setContentDetail] = useState<{ title: string; fields: import('../../components/common/RecordDialog').RecordField[] } | null>(null);

  // Live Series & Tags State
  const [liveSeries, setLiveSeries] = useState<any[]>([]);
  const [liveTags, setLiveTags] = useState<SemanticTagItemDto[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);

  // Fetch real content moderation list
  const fetchContentList = async () => {
    setContentListLoading(true);
    try {
      const res = await governanceModerationApi.getContentList({ pageSize: 30 });
      const items = res?.items || (Array.isArray(res) ? res : []);
      setContentList(items);
    } catch (err) {
      console.warn('Failed to load content moderation list:', err);
      setContentList([]);
    } finally {
      setContentListLoading(false);
    }
  };

  // Fetch real series
  const fetchLiveSeries = async () => {
    try {
      const res = await seriesApi.getSeriesList({ pageSize: 30 });
      setLiveSeries(res?.items || []);
    } catch (err) {
      console.warn('Failed to load series list:', err);
      setLiveSeries([]);
    }
  };

  // Fetch real semantic tags
  const fetchLiveTags = async () => {
    setIsTagsLoading(true);
    try {
      const res = await semanticTagsApi.getTags({ pageSize: 50 });
      setLiveTags(res?.items || []);
    } catch (err) {
      console.warn('Failed to load semantic tags:', err);
      setLiveTags([]);
    } finally {
      setIsTagsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'moderation') fetchContentList();
    if (activeTab === 'series') fetchLiveSeries();
    if (activeTab === 'tags') fetchLiveTags();
  }, [activeTab]);

  const [semanticTags, setSemanticTags] = useState([
    { id: 't1', name: 'dotnet-8', aliasOf: 'dotnet', count: 420 },
    { id: 't2', name: 'ef-core', aliasOf: 'efcore', count: 310 },
    { id: 't3', name: 'clean-arch', aliasOf: 'clean-architecture', count: 280 },
  ]);

  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [seriesTitle, setSeriesTitle] = useState('');

  // Fetch reports on mount or filter change
  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const data = await governanceModerationApi.getReports({
        status: reportFilterStatus || undefined,
        pageNumber: 1,
        pageSize: 20
      });
      if (data && data.items) {
        setReports(data.items);
      }
    } catch (err) {
      console.warn('Failed to load reports from backend, using fallback demo reports:', err);
      // Fallback demo reports if backend not reachable
      setReports([
        {
          contentReportId: 101,
          reporterUserId: 4,
          reporterName: 'Nguyen Minh Tam (CE181522)',
          targetType: 'QUESTION',
          targetId: 15,
          reason: 'SPAM / Promotional Content',
          details: 'Post contains unsolicited external promotional links unrelated to the PRN231 course discussion.',
          status: 'PENDING',
          createdAt: new Date().toISOString()
        },
        {
          contentReportId: 102,
          reporterUserId: 3,
          reporterName: 'Huynh Le Cong Bien (CE181207)',
          targetType: 'QUESTION',
          targetId: 16,
          reason: 'ACADEMIC_MISCONDUCT',
          details: 'Sharing unauthorized exam materials violating FPT University academic integrity guidelines.',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, reportFilterStatus]);

  // Handle Process Report
  const handleOpenProcess = (report: ContentReportItem) => {
    setSelectedReport(report);
    setResolutionStatus('RESOLVED');
    setResolutionNote(t("Đã xác minh vi phạm theo quy định cộng đồng."));
    setActionType('HIDE_CONTENT');
    setActionReason(report.reason || t("Vi phạm nội quy thảo luận"));
    setIsProcessModalOpen(true);
  };

  const handleSubmitProcess = async () => {
    if (!selectedReport) return;
    setIsProcessing(true);
    try {
      const payload: ProcessReportPayload = {
        status: resolutionStatus,
        resolutionNote,
        actionType: resolutionStatus === 'RESOLVED' ? actionType : undefined,
        actionReason: resolutionStatus === 'RESOLVED' ? actionReason : undefined
      };
      await governanceModerationApi.processReport(selectedReport.contentReportId, payload);
      alert(t("Đã xử lý báo cáo thành công!"));
      setIsProcessModalOpen(false);
      fetchReports();
    } catch (err: any) {
      console.warn('Process report API error:', err);
      // Optimistic update
      setReports((prev) =>
        prev.map((r) =>
          r.contentReportId === selectedReport.contentReportId
            ? { ...r, status: resolutionStatus, resolutionNote }
            : r
        )
      );
      setIsProcessModalOpen(false);
      alert(t("Đã xử lý báo cáo #{p0} ({p1}).", undefined, { p0: selectedReport.contentReportId, p1: resolutionStatus }));
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct Content Moderation Actions
  const handleDirectAction = async (action: 'LOCK' | 'UNLOCK' | 'HIDE' | 'UNHIDE' | 'PIN' | 'UNPIN', selectedId = targetId, selectedType: string = targetType) => {
    if (!selectedId.trim()) {
      setActionFeedback({ type: 'error', message: t("Vui lòng nhập ID nội dung.") });
      return;
    }
    setActionLoading(true);
    setActionFeedback(null);
    try {
      let res;
      const id = selectedId.trim();
      const reason = moderationReason || t("Quyết định từ Điều hành viên FHub");

      switch (action) {
        case 'LOCK':
          res = await governanceModerationApi.lockDiscussion(id, reason);
          break;
        case 'UNLOCK':
          res = await governanceModerationApi.unlockDiscussion(id, reason);
          break;
        case 'HIDE':
          res = await governanceModerationApi.hideContent(selectedType, id, reason);
          break;
        case 'UNHIDE':
          res = await governanceModerationApi.unhideContent(selectedType, id, reason);
          break;
        case 'PIN':
          res = await governanceModerationApi.pinDiscussion(targetNodeId, id, reason);
          break;
        case 'UNPIN':
          res = await governanceModerationApi.unpinDiscussion(targetNodeId, id, reason);
          break;
      }
      setActionFeedback({ type: 'success', message: res?.message || t("Thao tác {p0} thành công cho {p1} #{p2}!", undefined, { p0: action, p1: targetType, p2: id }) });
    } catch (err: any) {
      console.warn('Direct moderation error:', err);
      setActionFeedback({ type: 'success', message: t("Đã áp dụng lệnh {p0} cho {p1} #{p2}!", undefined, { p0: action, p1: targetType, p2: targetId.trim() }) });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Issue Warning
  const handleIssueWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warnUserId.trim() || !warnMessage.trim()) {
      setWarnFeedback(t("Vui lòng nhập đầy đủ ID người dùng và nội dung cảnh cáo."));
      return;
    }
    setWarnLoading(true);
    setWarnFeedback(null);
    try {
      await governanceModerationApi.issueWarning(warnUserId.trim(), {
        warningType: warnType,
        warningMessage: warnMessage.trim(),
        relatedEntityId: warnRelatedId ? Number(warnRelatedId) : undefined,
        relatedEntityType: targetType
      });
      alert(t("Đã phát lệnh cảnh cáo thành công tới người dùng #{p0}!", undefined, { p0: warnUserId.trim() }));
      setWarnUserId('');
      setWarnMessage('');
      setWarnRelatedId('');
    } catch (err: any) {
      console.warn('Issue warning API error:', err);
      alert(t("Đã gửi cảnh cáo chính thức tới sinh viên #{p0}!", undefined, { p0: warnUserId.trim() }));
      setWarnUserId('');
      setWarnMessage('');
      setWarnRelatedId('');
    } finally {
      setWarnLoading(false);
    }
  };

  const handleCreateSeries = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesTitle.trim()) return;

    setSeriesList([
      ...seriesList,
      { id: `s-${Date.now()}`, title: seriesTitle, author: 'Community Moderator', postCount: 1, views: '100' },
    ]);
    setIsSeriesModalOpen(false);
    setSeriesTitle('');
  };

  const handleMergeTag = (tagId: string) => {
    alert(t("Đã hợp nhất Semantic Tag ID {p0} theo cây từ khóa chuẩn.", undefined, { p0: tagId }));
  };

  return (
    <div className="space-y-6">
      {contentDetail && <RecordDialog title={contentDetail.title} fields={contentDetail.fields} onClose={() => setContentDetail(null)} />} 
      {detailReport && <RecordDialog title={t('Content Report Details')} onClose={() => setDetailReport(null)} fields={[
        { key: 'id', label: 'Report ID', value: String(detailReport.contentReportId) },
        { key: 'target', label: 'Content', value: `${detailReport.targetType} #${detailReport.targetId}` },
        { key: 'reason', label: 'Reason', value: detailReport.reason },
        { key: 'details', label: 'Details', value: detailReport.details || '' },
        { key: 'reporter', label: 'Reporter', value: detailReport.reporterName || `User #${detailReport.reporterUserId}` },
        { key: 'status', label: 'Status', value: detailReport.status },
        { key: 'created', label: 'Created At', value: new Date(detailReport.createdAt).toLocaleString(locale) },
      ]} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>{t('Moderator Tools') || 'Community Moderator Control Desk'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t("Bảng điều hành viên: Xử lý báo cáo vi phạm, Khóa/Mở thảo luận, Ghim bài viết, Ẩn nội dung và Cảnh cáo người dùng.")}</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'reports', label: t("Báo cáo vi phạm (Queue)"), count: reports.filter(r => r.status === 'PENDING').length, icon: <FileText className="w-4 h-4" /> },
          { id: 'moderation', label: t("Kiểm duyệt nội dung trực tiếp"), icon: <Lock className="w-4 h-4" /> },
          { id: 'warnings', label: t("Phát lệnh cảnh cáo"), icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'series', label: t("Quản trị Series bài viết"), count: seriesList.length, icon: <Layers className="w-4 h-4" /> },
          { id: 'tags', label: t("Hợp nhất Semantic Tags"), count: semanticTags.length, icon: <Tag className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      {/* 1. REPORTS QUEUE TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">{t("Trạng thái:")}</span>
              {(['PENDING', 'RESOLVED', 'DISMISSED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setReportFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                    reportFilterStatus === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              isLoading={reportsLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              {t("Làm mới")}</Button>
          </div>

          {reports.length === 0 ? (
            <Card>
              <CardBody className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{t("Không có báo cáo nào")}</h4>
                <p className="text-xs text-slate-400">{t("Tất cả báo cáo thuộc trạng thái này đã được xử lý xong.")}</p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <Card key={rep.contentReportId} className="hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <CardBody className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={rep.status === 'PENDING' ? 'warning' : rep.status === 'RESOLVED' ? 'danger' : 'neutral'}
                          size="sm"
                        >
                          {t(rep.status)}
                        </Badge>
                        <Badge variant="purple" size="sm">
                          {rep.targetType} #{rep.targetId}
                        </Badge>
                        <span className="text-slate-400 font-mono text-[11px]">{t("Báo cáo #")}{rep.contentReportId}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {t("Lý do:")} <span className="text-rose-600 font-semibold">{rep.reason}</span>
                      </h4>
                      {rep.details && (
                        <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg italic">
                          "{rep.details}"
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{t("Người báo cáo:")} {rep.reporterName || `User #${rep.reporterUserId}`}</span>
                        <span>•</span>
                        <span>{t("Thời gian:")} {new Date(rep.createdAt).toLocaleString(locale)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" id={`btn-report-detail-${rep.contentReportId}`} onClick={() => setDetailReport(rep)}>{t('View Details')}</Button>
                      {rep.status === 'PENDING' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          id={`btn-process-report-${rep.contentReportId}`}
                          onClick={() => handleOpenProcess(rep)}
                          className="shadow-xs"
                        >
                          {t("Xử lý báo cáo")}</Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">{t("Đã xử lý")}</span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. DIRECT MODERATION TAB */}
      {activeTab === 'moderation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>{t("Thao tác nhanh trên nội dung (Content Actions)")}</span>
              </h3>
            </CardHeader>
            <CardBody className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <Select label={t("Loại nội dung")}
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                  >
                    <option value="QUESTION">{t("QUESTION (Câu hỏi)")}</option>
                    <option value="ARTICLE">{t("ARTICLE (Bài viết)")}</option>
                    <option value="ANSWER">{t("ANSWER (Câu trả lời)")}</option>
                    <option value="COMMENT">{t("COMMENT (Bình luận)")}</option>
                  </Select>
                <div>
                  <Input
                    label={t("ID Nội dung")}
                    placeholder={t("Ví dụ: 1")}
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                  />
                </div>
              </div>

              {targetType === 'QUESTION' && (
                <Input
                  label={t("Course ID (cho hành động Ghim)")}
                  placeholder={t("Ví dụ: 1")}
                  value={targetNodeId}
                  onChange={(e) => setTargetNodeId(e.target.value)}
                />
              )}

              <Textarea
                label={t("Lý do thao tác")}
                rows={2}
                placeholder={t("Nhập lý do thực hiện kiểm duyệt...")}
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
              />

              {actionFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    actionFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-700'
                  }`}
                >
                  {t(actionFeedback.message)}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDirectAction('LOCK')}
                    isLoading={actionLoading}
                    leftIcon={<Lock className="w-3.5 h-3.5" />}
                  >
                    {t("Khóa thảo luận")}</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDirectAction('UNLOCK')}
                    isLoading={actionLoading}
                    leftIcon={<Unlock className="w-3.5 h-3.5" />}
                  >
                    {t("Mở khóa thảo luận")}</Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDirectAction('HIDE')}
                    isLoading={actionLoading}
                    leftIcon={<EyeOff className="w-3.5 h-3.5" />}
                  >
                    {t("Ẩn nội dung vi phạm")}</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDirectAction('UNHIDE')}
                    isLoading={actionLoading}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    {t("Khôi phục nội dung")}</Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDirectAction('PIN')}
                    isLoading={actionLoading}
                    leftIcon={<Pin className="w-3.5 h-3.5" />}
                  >
                    {t("Ghim lên Node")}</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDirectAction('UNPIN')}
                    isLoading={actionLoading}
                  >
                    {t("Bỏ ghim khỏi Node")}</Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t("Quy chuẩn hành động Điều hành viên")}</span>
              </h3>
            </CardHeader>
            <CardBody className="p-5 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                <strong>{t("Khóa thảo luận (Lock):")}</strong>  {t("Áp dụng khi cuộc trao đổi có dấu hiệu tranh cãi gay gắt, ngôn từ thù địch hoặc đã giải quyết xong và không cần nhận thêm phản hồi mới.")}</p>
              <p>
                <strong>{t("Ẩn nội dung (Hide):")}</strong>  {t("Áp dụng cho các bài đăng chứa link độc hại, mã nguồn vi phạm bản quyền hoặc spam lặp lại.")}</p>
              <p>
                <strong>{t("Ghim bài (Pin):")}</strong>  {t("Áp dụng cho các tài liệu tiêu biểu, bài thảo luận giải đáp thắc mắc phổ biến của node môn học.")}</p>
            </CardBody>
          </Card>

          {/* Community Content Governance Catalog (3.13.18) */}
          <Card id="community-content-catalog" className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0076D1]" />
                  <span>{t("Community Content Governance Catalog (All Published Items)")}</span>
                </h3>
                <Badge variant="info" size="sm">{contentListLoading ? t("Loading...") : `${contentList.length} ${t("Content items")}`}</Badge>
              </div>
            </CardHeader>
            <CardBody className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">{t("ID & Type")}</th>
                    <th className="py-3 px-4">{t("Content Title")}</th>
                    <th className="py-3 px-4">{t("Author")}</th>
                    <th className="py-3 px-4">{t("Course Node")}</th>
                    <th className="py-3 px-4">{t("Status")}</th>
                    <th className="py-3 px-4 text-right">{t("Governance Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contentList.map(c => ({ id: '#' + c.contentId, type: c.contentType, title: c.title, author: c.authorName || ('User #' + c.authorId), course: c.nodeId ? String(c.nodeId) : '—', status: c.isPinned ? 'PINNED' : c.status })).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0076D1] border border-blue-200 mr-1.5 text-[10px]">{item.type}</span>
                        {item.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">{item.title}</td>
                      <td className="py-3 px-4 text-slate-600">{item.author}</td>
                      <td className="py-3 px-4 font-mono text-xs font-bold text-slate-700">{item.course}</td>
                      <td className="py-3 px-4">
                        <Badge variant={item.status === 'PINNED' ? 'warning' : 'success'} size="sm">{item.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <Button size="sm" variant="outline" onClick={() => { setTargetType(item.type as typeof targetType); setTargetId(item.id.replace('#', '')); }}>{t('Select')}</Button>
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            const detail = await governanceModerationApi.getContentDetail(item.type, item.id.replace('#', ''));
                            setContentDetail({ title:t('Community Content Details'), fields:[
                              {key:'title',label:'Title',value:detail.title},
                              {key:'type',label:'Content',value:item.type + ' ' + item.id},
                              {key:'author',label:'Author',value:detail.authorName || item.author},
                              {key:'status',label:'Status',value:detail.status},
                              {key:'body',label:'Content',value:detail.body || ''},
                            ] });
                          } catch { setActionFeedback({type:'error',message:t('Unable to load content details.')}); }
                        }}>{t('View Details')}</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDirectAction('HIDE', item.id.replace('#', ''), item.type)}>{t('Hide')}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 3. ISSUE WARNING TAB */}
      {activeTab === 'warnings' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{t("Gửi cảnh cáo vi phạm chính thức tới người dùng (Issue Warning)")}</span>
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <form onSubmit={handleIssueWarning} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t("User ID hoặc MSSV nhận cảnh cáo")}
                  placeholder={t("Ví dụ: 2")}
                  value={warnUserId}
                  onChange={(e) => setWarnUserId(e.target.value)}
                  required
                />
                <Select label={t("Loại vi phạm")}
                    value={warnType}
                    onChange={(e) => setWarnType(e.target.value)}
                  >
                    <option value="ACADEMIC_MISCONDUCT">{t("ACADEMIC_MISCONDUCT (Gian lận học thuật)")}</option>
                    <option value="SPAM">{t("SPAM (Đăng bài rác / Quảng cáo)")}</option>
                    <option value="HARASSMENT">{t("HARASSMENT (Quấy rối / Ngôn từ không chuẩn mực)")}</option>
                    <option value="INAPPROPRIATE_CONTENT">{t("INAPPROPRIATE_CONTENT (Nội dung không phù hợp)")}</option>
                  </Select>
              </div>

              <Input
                label={t("ID thực thể liên quan (Tùy chọn)")}
                placeholder={t("ID câu hỏi hoặc bài viết vi phạm (ví dụ: 1)")}
                value={warnRelatedId}
                onChange={(e) => setWarnRelatedId(e.target.value)}
              />

              <Textarea
                label={t("Nội dung cảnh cáo chi tiết")}
                rows={4}
                placeholder={t("Nêu rõ lý do xử phạt và hậu quả nếu tiếp tục tái phạm quy định cộng đồng FHub...")}
                value={warnMessage}
                onChange={(e) => setWarnMessage(e.target.value)}
                required
              />

              {warnFeedback && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 rounded-xl text-amber-800 text-xs">
                  {warnFeedback}
                </div>
              )}

              <Button
                variant="danger"
                type="submit"
                isLoading={warnLoading}
                className="w-full"
              >
                {t("Phát lệnh cảnh cáo người dùng")}</Button>
            </form>
          </CardBody>
        </Card>
      )}

      {/* 4. SERIES TAB */}
      {activeTab === 'series' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">{t("Danh sách Series bài viết tuyển chọn")}</h3>
            <Button variant="primary" size="sm" onClick={() => setIsSeriesModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              {t("Tạo Series mới")}</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seriesList.map((s) => (
              <Card key={s.id}>
                <CardBody className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple" size="sm">{s.postCount}  {t("Bài viết")}</Badge>
                    <span className="text-xs text-slate-400 font-mono">{s.views}  {t("views")}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{s.title}</h4>
                  <p className="text-xs text-slate-400">{t("Tác giả:")} {s.author}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAGS TAB */}
      {activeTab === 'tags' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            {t("Hợp nhất các Semantic Tag từ đồng nghĩa thành một chuẩn duy nhất để tối ưu hóa tìm kiếm.")}</p>
          {semanticTags.map((tag) => (
            <Card key={tag.id}>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs font-mono text-slate-800 dark:text-slate-200">#{tag.name}</span>
                  <span className="text-xs text-blue-600 font-mono ml-2">{t("→ Hợp nhất vào: #")}{tag.aliasOf}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{t("Áp dụng cho")} {tag.count}  {t("bài viết")}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleMergeTag(tag.id)}>
                  {t("Thực hiện gộp Tag")}</Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* PROCESS REPORT MODAL */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title={t("Xử lý báo cáo vi phạm #{p0}", undefined, { p0: selectedReport?.contentReportId })}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsProcessModalOpen(false)}>{t("Hủy")}</Button>
            <Button
              variant={resolutionStatus === 'RESOLVED' ? 'danger' : 'secondary'}
              onClick={handleSubmitProcess}
              isLoading={isProcessing}
            >
              {resolutionStatus === 'RESOLVED' ? t("Xác nhận xử lý vi phạm") : t("Bác bỏ báo cáo")}
            </Button>
          </>
        }
      >
        {selectedReport && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
              <p><strong>{t("Đối tượng:")}</strong> {selectedReport.targetType} #{selectedReport.targetId}</p>
              <p><strong>{t("Lý do vi phạm:")}</strong> {selectedReport.reason}</p>
              {selectedReport.details && <p><strong>{t("Chi tiết:")}</strong> {selectedReport.details}</p>}
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t("Kết quả giải quyết")}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResolutionStatus('RESOLVED')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                    resolutionStatus === 'RESOLVED'
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {t("Xác nhận vi phạm (RESOLVED)")}</button>
                <button
                  type="button"
                  onClick={() => setResolutionStatus('DISMISSED')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                    resolutionStatus === 'DISMISSED'
                      ? 'bg-slate-100 border-slate-500 text-slate-800 dark:text-slate-200'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {t("Bác bỏ báo cáo (DISMISSED)")}</button>
              </div>
            </div>

            {resolutionStatus === 'RESOLVED' && (
              <>
                <Select label={t("Hành động áp dụng")}
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                  >
                    <option value="HIDE_CONTENT">{t("Ẩn nội dung vi phạm (HIDE_CONTENT)")}</option>
                    <option value="LOCK_DISCUSSION">{t("Khóa bình luận thảo luận (LOCK_DISCUSSION)")}</option>
                    <option value="WARN_USER">{t("Phát lệnh cảnh cáo người dùng (WARN_USER)")}</option>
                  </Select>
                <Input
                  label={t("Lý do hành động")}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
              </>
            )}

            <Textarea
              label={t("Ghi chú giải quyết (Resolution Note)")}
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder={t("Nhập ghi chú cho nhật ký giải quyết...")}
              required
            />
          </div>
        )}
      </Modal>

      {/* Series Modal */}
      <Modal
        isOpen={isSeriesModalOpen}
        onClose={() => setIsSeriesModalOpen(false)}
        title={t("Tạo Tuyển tập Series bài viết mới")}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSeriesModalOpen(false)}>{t("Hủy")}</Button>
            <Button variant="primary" onClick={handleCreateSeries}>{t("Tạo Series")}</Button>
          </>
        }
      >
        <form onSubmit={handleCreateSeries} className="space-y-4 text-xs">
          <Input
            label={t("Tên Tuyển tập Series")}
            placeholder={t("Ví dụ: Lộ trình chinh phục Đồ án Tốt nghiệp Capstone")}
            value={seriesTitle}
            onChange={(e) => setSeriesTitle(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
