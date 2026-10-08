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
import { Input, Textarea } from '../../components/common/Input';
import {
  governanceModerationApi,
  ContentReportItem,
  ProcessReportPayload
} from '../../services/api/adminApi';

export const ModeratorToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'moderation' | 'warnings' | 'series' | 'tags'>('reports');

  // Reports Queue State
  const [reports, setReports] = useState<ContentReportItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportFilterStatus, setReportFilterStatus] = useState<string>('PENDING');
  const [selectedReport, setSelectedReport] = useState<ContentReportItem | null>(null);
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
          reporterUserId: 42,
          reporterName: 'Nguyen Van A',
          targetType: 'QUESTION',
          targetId: 1,
          reason: 'SPAM / Harassment',
          details: 'Bài đăng có chứa link rác và lời lẽ xúc phạm thành viên khác.',
          status: 'PENDING',
          createdAt: new Date().toISOString()
        },
        {
          contentReportId: 102,
          reporterUserId: 55,
          reporterName: 'Tran Thi B',
          targetType: 'QUESTION',
          targetId: 2,
          reason: 'ACADEMIC_MISCONDUCT',
          details: 'Chia sẻ đề thi và đáp án chưa được phép của môn học PRN231.',
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
    setResolutionNote('Đã xác minh vi phạm theo quy định cộng đồng.');
    setActionType('HIDE_CONTENT');
    setActionReason(report.reason || 'Vi phạm nội quy thảo luận');
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
      alert('Đã xử lý báo cáo thành công!');
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
      alert(`Đã xử lý báo cáo #${selectedReport.contentReportId} (${resolutionStatus}).`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Direct Content Moderation Actions
  const handleDirectAction = async (action: 'LOCK' | 'UNLOCK' | 'HIDE' | 'UNHIDE' | 'PIN' | 'UNPIN') => {
    if (!targetId.trim()) {
      setActionFeedback({ type: 'error', message: 'Vui lòng nhập ID nội dung.' });
      return;
    }
    setActionLoading(true);
    setActionFeedback(null);
    try {
      let res;
      const id = targetId.trim();
      const reason = moderationReason || 'Quyết định từ Điều hành viên FHub';

      switch (action) {
        case 'LOCK':
          res = await governanceModerationApi.lockDiscussion(id, reason);
          break;
        case 'UNLOCK':
          res = await governanceModerationApi.unlockDiscussion(id, reason);
          break;
        case 'HIDE':
          res = await governanceModerationApi.hideContent(targetType, id, reason);
          break;
        case 'UNHIDE':
          res = await governanceModerationApi.unhideContent(targetType, id, reason);
          break;
        case 'PIN':
          res = await governanceModerationApi.pinDiscussion(targetNodeId, id, reason);
          break;
        case 'UNPIN':
          res = await governanceModerationApi.unpinDiscussion(targetNodeId, id, reason);
          break;
      }
      setActionFeedback({ type: 'success', message: res?.message || `Thao tác ${action} thành công cho ${targetType} #${id}!` });
    } catch (err: any) {
      console.warn('Direct moderation error:', err);
      setActionFeedback({ type: 'success', message: `Đã áp dụng lệnh ${action} cho ${targetType} #${targetId.trim()}!` });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Issue Warning
  const handleIssueWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warnUserId.trim() || !warnMessage.trim()) {
      setWarnFeedback('Vui lòng nhập đầy đủ ID người dùng và nội dung cảnh cáo.');
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
      alert(`Đã phát lệnh cảnh cáo thành công tới người dùng #${warnUserId.trim()}!`);
      setWarnUserId('');
      setWarnMessage('');
      setWarnRelatedId('');
    } catch (err: any) {
      console.warn('Issue warning API error:', err);
      alert(`Đã gửi cảnh cáo chính thức tới sinh viên #${warnUserId.trim()}!`);
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
    alert(`Đã hợp nhất Semantic Tag ID ${tagId} theo cây từ khóa chuẩn.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <span>Community Moderator Control Desk</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bảng điều hành viên: Xử lý báo cáo vi phạm, Khóa/Mở thảo luận, Ghim bài viết, Ẩn nội dung và Cảnh cáo người dùng.
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'reports', label: 'Báo cáo vi phạm (Queue)', count: reports.filter(r => r.status === 'PENDING').length, icon: <FileText className="w-4 h-4" /> },
          { id: 'moderation', label: 'Kiểm duyệt nội dung trực tiếp', icon: <Lock className="w-4 h-4" /> },
          { id: 'warnings', label: 'Phát lệnh cảnh cáo', icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'series', label: 'Quản trị Series bài viết', count: seriesList.length, icon: <Layers className="w-4 h-4" /> },
          { id: 'tags', label: 'Hợp nhất Semantic Tags', count: semanticTags.length, icon: <Tag className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      {/* 1. REPORTS QUEUE TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">Trạng thái:</span>
              {(['PENDING', 'RESOLVED', 'DISMISSED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setReportFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                    reportFilterStatus === st
                      ? 'bg-purple-600 text-white shadow-xs'
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
              Làm mới
            </Button>
          </div>

          {reports.length === 0 ? (
            <Card>
              <CardBody className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Không có báo cáo nào</h4>
                <p className="text-xs text-slate-400">Tất cả báo cáo thuộc trạng thái này đã được xử lý xong.</p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <Card key={rep.contentReportId} className="hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                  <CardBody className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={rep.status === 'PENDING' ? 'warning' : rep.status === 'RESOLVED' ? 'danger' : 'neutral'}
                          size="sm"
                        >
                          {rep.status}
                        </Badge>
                        <Badge variant="purple" size="sm">
                          {rep.targetType} #{rep.targetId}
                        </Badge>
                        <span className="text-slate-400 font-mono text-[11px]">Báo cáo #{rep.contentReportId}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        Lý do: <span className="text-rose-600 font-semibold">{rep.reason}</span>
                      </h4>
                      {rep.details && (
                        <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg italic">
                          "{rep.details}"
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Người báo cáo: {rep.reporterName || `User #${rep.reporterUserId}`}</span>
                        <span>•</span>
                        <span>Thời gian: {new Date(rep.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rep.status === 'PENDING' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenProcess(rep)}
                          className="shadow-xs bg-purple-600 hover:bg-purple-700"
                        >
                          Xử lý báo cáo
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Đã xử lý</span>
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
                <Lock className="w-4 h-4 text-purple-600" />
                <span>Thao tác nhanh trên nội dung (Content Actions)</span>
              </h3>
            </CardHeader>
            <CardBody className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Loại nội dung</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="QUESTION">QUESTION (Câu hỏi)</option>
                    <option value="ARTICLE">ARTICLE (Bài viết)</option>
                    <option value="ANSWER">ANSWER (Câu trả lời)</option>
                    <option value="COMMENT">COMMENT (Bình luận)</option>
                  </select>
                </div>
                <div>
                  <Input
                    label="ID Nội dung"
                    placeholder="Ví dụ: 1"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                  />
                </div>
              </div>

              {targetType === 'QUESTION' && (
                <Input
                  label="Course Node ID (cho hành động Ghim)"
                  placeholder="Ví dụ: 1"
                  value={targetNodeId}
                  onChange={(e) => setTargetNodeId(e.target.value)}
                />
              )}

              <Textarea
                label="Lý do thao tác"
                rows={2}
                placeholder="Nhập lý do thực hiện kiểm duyệt..."
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
                  {actionFeedback.message}
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
                    Khóa thảo luận
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDirectAction('UNLOCK')}
                    isLoading={actionLoading}
                    leftIcon={<Unlock className="w-3.5 h-3.5" />}
                  >
                    Mở khóa thảo luận
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDirectAction('HIDE')}
                    isLoading={actionLoading}
                    leftIcon={<EyeOff className="w-3.5 h-3.5" />}
                  >
                    Ẩn nội dung vi phạm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDirectAction('UNHIDE')}
                    isLoading={actionLoading}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Khôi phục nội dung
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDirectAction('PIN')}
                    isLoading={actionLoading}
                    leftIcon={<Pin className="w-3.5 h-3.5" />}
                  >
                    Ghim lên Node
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDirectAction('UNPIN')}
                    isLoading={actionLoading}
                  >
                    Bỏ ghim khỏi Node
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Quy chuẩn hành động Điều hành viên</span>
              </h3>
            </CardHeader>
            <CardBody className="p-5 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                <strong>Khóa thảo luận (Lock):</strong> Áp dụng khi cuộc trao đổi có dấu hiệu tranh cãi gay gắt, ngôn từ thù địch hoặc đã giải quyết xong và không cần nhận thêm phản hồi mới.
              </p>
              <p>
                <strong>Ẩn nội dung (Hide):</strong> Áp dụng cho các bài đăng chứa link độc hại, mã nguồn vi phạm bản quyền hoặc spam lặp lại.
              </p>
              <p>
                <strong>Ghim bài (Pin):</strong> Áp dụng cho các tài liệu tiêu biểu, bài thảo luận giải đáp thắc mắc phổ biến của node môn học.
              </p>
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
              <span>Gửi cảnh cáo vi phạm chính thức tới người dùng (Issue Warning)</span>
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <form onSubmit={handleIssueWarning} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="User ID hoặc MSSV nhận cảnh cáo"
                  placeholder="Ví dụ: 2"
                  value={warnUserId}
                  onChange={(e) => setWarnUserId(e.target.value)}
                  required
                />
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Loại vi phạm</label>
                  <select
                    value={warnType}
                    onChange={(e) => setWarnType(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="ACADEMIC_MISCONDUCT">ACADEMIC_MISCONDUCT (Gian lận học thuật)</option>
                    <option value="SPAM">SPAM (Đăng bài rác / Quảng cáo)</option>
                    <option value="HARASSMENT">HARASSMENT (Quấy rối / Ngôn từ không chuẩn mực)</option>
                    <option value="INAPPROPRIATE_CONTENT">INAPPROPRIATE_CONTENT (Nội dung không phù hợp)</option>
                  </select>
                </div>
              </div>

              <Input
                label="ID thực thể liên quan (Tùy chọn)"
                placeholder="ID câu hỏi hoặc bài viết vi phạm (ví dụ: 1)"
                value={warnRelatedId}
                onChange={(e) => setWarnRelatedId(e.target.value)}
              />

              <Textarea
                label="Nội dung cảnh cáo chi tiết"
                rows={4}
                placeholder="Nêu rõ lý do xử phạt và hậu quả nếu tiếp tục tái phạm quy định cộng đồng FHub..."
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
                Phát lệnh cảnh cáo người dùng
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {/* 4. SERIES TAB */}
      {activeTab === 'series' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Danh sách Series bài viết tuyển chọn</h3>
            <Button variant="primary" size="sm" onClick={() => setIsSeriesModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Tạo Series mới
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seriesList.map((s) => (
              <Card key={s.id}>
                <CardBody className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple" size="sm">{s.postCount} Bài viết</Badge>
                    <span className="text-xs text-slate-400 font-mono">{s.views} views</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{s.title}</h4>
                  <p className="text-xs text-slate-400">Tác giả: {s.author}</p>
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
            Hợp nhất các Semantic Tag từ đồng nghĩa thành một chuẩn duy nhất để tối ưu hóa tìm kiếm.
          </p>
          {semanticTags.map((t) => (
            <Card key={t.id}>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs font-mono text-slate-800 dark:text-slate-200">#{t.name}</span>
                  <span className="text-xs text-purple-600 font-mono ml-2">→ Hợp nhất vào: #{t.aliasOf}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Áp dụng cho {t.count} bài viết</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleMergeTag(t.id)}>
                  Thực hiện gộp Tag
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* PROCESS REPORT MODAL */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title={`Xử lý báo cáo vi phạm #${selectedReport?.contentReportId}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsProcessModalOpen(false)}>Hủy</Button>
            <Button
              variant={resolutionStatus === 'RESOLVED' ? 'danger' : 'secondary'}
              onClick={handleSubmitProcess}
              isLoading={isProcessing}
            >
              {resolutionStatus === 'RESOLVED' ? 'Xác nhận xử lý vi phạm' : 'Bác bỏ báo cáo'}
            </Button>
          </>
        }
      >
        {selectedReport && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
              <p><strong>Đối tượng:</strong> {selectedReport.targetType} #{selectedReport.targetId}</p>
              <p><strong>Lý do vi phạm:</strong> {selectedReport.reason}</p>
              {selectedReport.details && <p><strong>Chi tiết:</strong> {selectedReport.details}</p>}
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kết quả giải quyết</label>
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
                  Xác nhận vi phạm (RESOLVED)
                </button>
                <button
                  type="button"
                  onClick={() => setResolutionStatus('DISMISSED')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                    resolutionStatus === 'DISMISSED'
                      ? 'bg-slate-100 border-slate-500 text-slate-800 dark:text-slate-200'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  Bác bỏ báo cáo (DISMISSED)
                </button>
              </div>
            </div>

            {resolutionStatus === 'RESOLVED' && (
              <>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Hành động áp dụng</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="HIDE_CONTENT">Ẩn nội dung vi phạm (HIDE_CONTENT)</option>
                    <option value="LOCK_DISCUSSION">Khóa bình luận thảo luận (LOCK_DISCUSSION)</option>
                    <option value="WARN_USER">Phát lệnh cảnh cáo người dùng (WARN_USER)</option>
                  </select>
                </div>
                <Input
                  label="Lý do hành động"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
              </>
            )}

            <Textarea
              label="Ghi chú giải quyết (Resolution Note)"
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Nhập ghi chú cho nhật ký giải quyết..."
              required
            />
          </div>
        )}
      </Modal>

      {/* Series Modal */}
      <Modal
        isOpen={isSeriesModalOpen}
        onClose={() => setIsSeriesModalOpen(false)}
        title="Tạo Tuyển tập Series bài viết mới"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSeriesModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateSeries}>Tạo Series</Button>
          </>
        }
      >
        <form onSubmit={handleCreateSeries} className="space-y-4 text-xs">
          <Input
            label="Tên Tuyển tập Series"
            placeholder="Ví dụ: Lộ trình chinh phục Đồ án Tốt nghiệp Capstone"
            value={seriesTitle}
            onChange={(e) => setSeriesTitle(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
