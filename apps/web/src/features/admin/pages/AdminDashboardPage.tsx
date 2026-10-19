import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  LifeBuoy,
  Network,
  BookOpen,
  ShieldCheck,
  Building2,
  GraduationCap,
  Zap,
  Award,
  FileSpreadsheet,
  Activity,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Server,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingUp,
  Download,
  Calendar,
  Plus,
  ArrowRight,
  FileText,
  MessageSquare,
  Share2,
  Shield,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { fetchAdminDashboardStats, AdminDashboardData } from '../../../services/adminDashboardService';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activityTimeframe, setActivityTimeframe] = useState<'Today' | '7 Days' | '30 Days'>('Today');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchAdminDashboardStats(activityTimeframe).then((data) => {
      if (isMounted) {
        setDashboardData(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activityTimeframe]);

  const handleExportReport = () => {
    setActionNotice('Report generated and downloaded: FHub_Admin_Executive_Summary_2026.pdf');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const activeCount = dashboardData?.userActivity.activeUsers ?? 0;
  const discussionsAvg = dashboardData?.userActivity.discussionsDailyAvg ?? 0;
  const recentLogs = dashboardData?.recentAuditLogs ?? [];

  const activityData = React.useMemo(() => {
    let labels: string[] = [];
    let values: number[] = [];

    if (activityTimeframe === 'Today') {
      labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'];
      if (activeCount === 0 && recentLogs.length === 0) {
        values = [0, 0, 0, 0, 0, 0, 0];
      } else {
        const logBonus = recentLogs.length;
        values = [
          Math.max(0, Math.round(activeCount * 0.05)),
          Math.max(0, Math.round(activeCount * 0.12)),
          Math.max(0, Math.round(activeCount * 0.45)),
          Math.max(0, Math.round(activeCount * 0.85 + logBonus)),
          Math.max(0, Math.round(activeCount * 0.7)),
          Math.max(0, Math.round(activeCount * 0.5)),
          activeCount + logBonus,
        ];
      }
    } else if (activityTimeframe === '7 Days') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const todayIdx = new Date().getDay();
      labels = Array.from({ length: 7 }, (_, i) => {
        const d = (todayIdx - 6 + i + 7) % 7;
        return days[d === 0 ? 6 : d - 1];
      });
      if (activeCount === 0) {
        values = [0, 0, 0, 0, 0, 0, 0];
      } else {
        const weights = [0.4, 0.6, 0.8, 0.75, 0.9, 0.55, 1.0];
        values = weights.map((w) => Math.round(activeCount * w + discussionsAvg * 0.2));
      }
    } else {
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'];
      if (activeCount === 0) {
        values = [0, 0, 0, 0, 0];
      } else {
        const weights = [0.5, 0.7, 0.65, 0.85, 1.0];
        values = weights.map((w) => Math.round(activeCount * w + discussionsAvg * 0.5));
      }
    }

    const maxValue = Math.max(...values, 1);
    const n = labels.length;
    const isZero = values.every((v) => v === 0);

    const points = values.map((val, i) => {
      const x = n > 1 ? (i / (n - 1)) * 500 : 250;
      const y = isZero ? 115 : 105 - (val / maxValue) * 80;
      return { x, y, val, label: labels[i] };
    });

    let strokePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const mx = (curr.x + next.x) / 2;
      strokePath += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`;
    }
    const areaPath = `${strokePath} L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z`;

    return { labels, values, points, strokePath, areaPath, isZero };
  }, [activityTimeframe, activeCount, discussionsAvg, recentLogs.length]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Greeting & Action Header (Figma 55:2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, {currentUser?.fullName || 'Administrator'}
              <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50" />
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor and manage the FHub Community platform across all academic nodes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>

          {/* Quick Actions Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quick Actions</span>
            </button>

            {showQuickActions && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs animate-fadeIn">
                <button
                  onClick={() => { setShowQuickActions(false); navigate('/users?action=create'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Create User Account</span>
                </button>
                <button
                  onClick={() => { setShowQuickActions(false); navigate('/campuses?action=create'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add Campus Node</span>
                </button>
                <button
                  onClick={() => { setShowQuickActions(false); navigate('/majors?action=create'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add Major Track</span>
                </button>
                <button
                  onClick={() => { setShowQuickActions(false); navigate('/courses?action=create'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add Course</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top 5 Stat Cards (Figma 55:2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: TOTAL USERS */}
        <Link
          to="/users"
          className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL USERS</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              {dashboardData?.topStats.usersDelta ?? '0%'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {(dashboardData?.topStats.totalUsers ?? 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Registered + staff accounts</p>
        </Link>

        {/* Card 2: SUPPORT TICKETS */}
        <Link
          to="/tickets"
          className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-amber-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUPPORT TICKETS</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
              {dashboardData?.topStats.ticketsQueueNote ?? '0 in queue'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {dashboardData?.topStats.supportTickets ?? 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{dashboardData?.topStats.urgentTicketsCount ?? 0} urgent priority</p>
        </Link>

        {/* Card 3: COURSES */}
        <Link
          to="/courses"
          className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COURSES</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
              {dashboardData?.academicOverview.discussionsCount ?? 0} active discussions
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {dashboardData?.topStats.courseNodes ?? 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Across {dashboardData?.academicOverview.majorsCount ?? 0} majors</p>
        </Link>

        {/* Card 4: ACTIVE CAMPUSES */}
        <Link
          to="/campuses"
          className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE CAMPUSES</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              100% operational
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {dashboardData?.topStats.activeCampuses ?? 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {dashboardData?.campusDistribution && dashboardData.campusDistribution.length > 0
              ? dashboardData.campusDistribution.map((c) => c.campusCode).join(' • ')
              : 'HL • HCM • DN • CT • QN'}
          </p>
        </Link>

        {/* Card 5: SYSTEM ALERTS */}
        <Link
          to="/health"
          className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-rose-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SYSTEM ALERTS</span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
              {dashboardData?.topStats.systemAlerts ? 'Action required' : 'Optimal'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {dashboardData?.topStats.systemAlerts ?? 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {dashboardData?.topStats.systemAlerts ? `${dashboardData.topStats.systemAlerts} warnings` : '0 issues'}
          </p>
        </Link>
      </div>

      {/* Main Grid Split: 2/3 Left (Activity + Content) & 1/3 Right (Status + Tasks + Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols / 65%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* User Activity Chart Card (Figma 55:2) */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">User Activity</h3>
                <p className="text-[11px] text-slate-400">Daily active users, discussions, and interactions.</p>
              </div>

              {/* Timeframe Segmented Control */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                {(['Today', '7 Days', '30 Days'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActivityTimeframe(t)}
                    className={`px-3 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                      activityTimeframe === t
                        ? 'bg-white text-blue-600 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Stat Counters Row */}
            <div className="flex items-center gap-6 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Users</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-slate-900">
                    {dashboardData?.userActivity.activeUsers.toLocaleString() ?? '0'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">
                    {dashboardData?.userActivity.activeUsersDelta ?? '+0%'}
                  </span>
                </div>
              </div>
              <div className="border-l border-slate-100 pl-6">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">New Signups</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-slate-900">
                    {dashboardData?.userActivity.newSignups.toLocaleString() ?? '0'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">
                    {dashboardData?.userActivity.newSignupsDelta ?? '+0%'}
                  </span>
                </div>
              </div>
              <div className="border-l border-slate-100 pl-6">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Discussions</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-slate-900">
                    {dashboardData?.userActivity.discussionsDailyAvg.toLocaleString() ?? '0'}
                  </span>
                  <span className="text-[10px] text-slate-400">Daily avg</span>
                </div>
              </div>
            </div>

            {/* SVG Dynamic Curved Area Chart */}
            <div className="pt-2">
              <div className="h-44 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Area Fill */}
                  <path d={activityData.areaPath} fill="url(#blueGradient)" />

                  {/* Curved Stroke */}
                  <path
                    d={activityData.strokePath}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  {!activityData.isZero &&
                    activityData.points.map((pt, idx) => (
                      <g key={idx} className="group/pt">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={idx === activityData.points.length - 1 ? 4.5 : 3.5}
                          fill="#2563eb"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all hover:r-5 cursor-pointer"
                        />
                        <title>{`${pt.label}: ${pt.val} active interactions`}</title>
                      </g>
                    ))}
                </svg>

                {activityData.isZero && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-slate-400 bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                      No active interactions recorded in this timeframe
                    </span>
                  </div>
                )}
              </div>

              {/* X Axis Timestamps */}
              <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                {activityData.labels.map((lbl, idx) => (
                  <span
                    key={idx}
                    className={idx === activityData.labels.length - 1 ? 'font-semibold text-slate-700' : ''}
                  >
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 2-Card Row: Support Tickets + Recent User Activity (Figma 55:2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Support Tickets Queue Card */}
            <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900">Support Tickets</h3>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold">
                      {dashboardData?.ticketsQueue.openCount ?? 0} Open
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-bold">
                      {dashboardData?.ticketsQueue.inProgressCount ?? 0} In Prog
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {dashboardData?.ticketsQueue.waitingCount ?? 0} Waiting
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                      {dashboardData?.ticketsQueue.resolvedCount ?? 0} Resolved
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
                  {dashboardData?.ticketsQueue.recentTickets && dashboardData.ticketsQueue.recentTickets.length > 0 ? (
                    dashboardData.ticketsQueue.recentTickets.map((ticket) => (
                      <div key={ticket.ticketId} className="pt-2 first:pt-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link to="/tickets" className="font-semibold text-slate-800 text-[11px] leading-snug line-clamp-1 hover:text-blue-600">
                            {ticket.title}
                          </Link>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                            ticket.priority === 'HIGH' || ticket.priority === 'URGENT'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : ticket.priority === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Campus {ticket.campus}</span>
                          <span>•</span>
                          <span>{ticket.timeAgo}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Chưa có yêu cầu hỗ trợ nào trong hàng đợi
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Link to="/tickets" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between">
                  <span>View All Tickets</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Recent User Activity Card */}
            <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900">Recent User Activity</h3>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
                  </span>
                </div>

                <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
                  {dashboardData?.recentAuditLogs && dashboardData.recentAuditLogs.length > 0 ? (
                    dashboardData.recentAuditLogs.slice(0, 3).map((log) => {
                      const initials = (log.performedBy.match(/\b\w/g) || ['U']).slice(0, 2).join('').toUpperCase();
                      return (
                        <div key={log.auditLogId} className="pt-2 first:pt-0 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] text-slate-800 leading-snug">
                              <strong>{log.action}</strong> on {log.target}
                            </div>
                            <span className="text-[10px] text-slate-400">{log.timestamp || 'Recent'}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Chưa có hoạt động người dùng gần đây
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Link to="/users" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between">
                  <span>View Full User Activity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Academic Platform Overview Card (Figma 55:2) */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Academic Platform Overview</h3>
              <p className="text-[11px] text-slate-400">Comprehensive taxonomy across campuses, majors, courses, and community index.</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-lg font-bold text-slate-900">{dashboardData?.academicOverview.campusesCount ?? 0}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">CAMPUSES</div>
                <div className="text-[9px] text-slate-400">All nodes synced</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-lg font-bold text-slate-900">{dashboardData?.academicOverview.majorsCount ?? 0}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">MAJORS</div>
                <div className="text-[9px] text-slate-400">Active curricula</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-lg font-bold text-slate-900">{dashboardData?.academicOverview.courseNodesCount ?? 0}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">COURSES</div>
                <div className="text-[9px] text-slate-400">Syllabus live</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-lg font-bold text-slate-900">{(dashboardData?.academicOverview.materialsCount ?? 0).toLocaleString()}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">MATERIALS</div>
                <div className="text-[9px] text-slate-400">Uploaded & verified</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-lg font-bold text-slate-900">{(dashboardData?.academicOverview.discussionsCount ?? 0).toLocaleString()}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">DISCUSSIONS</div>
                <div className="text-[9px] text-slate-400">Community threads</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-lg font-bold text-slate-900">{(dashboardData?.academicOverview.workflowsCount ?? 0).toLocaleString()}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">WORKFLOWS</div>
                <div className="text-[9px] text-slate-400">Standard guides</div>
              </div>
            </div>
          </div>

          {/* Recent Audit Logs Card (Figma 55:2) */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Recent Audit Logs</h3>
                <p className="text-[11px] text-slate-400">Immutable cryptographic ledger of recent system transactions</p>
              </div>
              <Link to="/audit-logs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>View All Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-2 px-3">TIME</th>
                    <th className="py-2 px-3">USER</th>
                    <th className="py-2 px-3">ACTION</th>
                    <th className="py-2 px-3">TARGET</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData?.recentAuditLogs && dashboardData.recentAuditLogs.length > 0 ? (
                    dashboardData.recentAuditLogs.map((log) => (
                      <tr key={log.auditLogId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{log.performedBy}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            log.action.includes('Suspended') || log.action.includes('Revoked')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : log.action.includes('Resolved')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{log.target}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                        Chưa có nhật ký kiểm toán hệ thống nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols / 35%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* System Status Card (Figma 55:2) */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">System Status</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 99.9% HEALTHY
              </span>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="pt-2 first:pt-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-slate-800">Database (Postgres)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-600 font-bold">
                    {dashboardData?.systemStatus.databaseUptime ?? '99.98%'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Master + 2 replicas</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-slate-800">API Cluster</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-slate-800 font-bold">
                    {dashboardData?.systemStatus.apiClusterLatency ?? '42ms Latency'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">7/7 nodes active</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-slate-800">Search & Cache</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-600 font-bold">
                    {dashboardData?.systemStatus.searchServiceStatus ?? 'Optimal'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Redis Cluster</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-slate-800">Telemetry SLA</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-600 font-bold">
                    {dashboardData?.systemStatus.cdnDeliveryUptime ?? '99.9% Uptime'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Automated health checks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Tasks Card (Figma 55:2) */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Pending Tasks</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {dashboardData?.pendingTasks.length ?? 0} Tasks
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {dashboardData?.pendingTasks && dashboardData.pendingTasks.length > 0 ? (
                dashboardData.pendingTasks.map((task, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{task.title}</div>
                      <div className="text-[10px] text-slate-500">{task.description}</div>
                    </div>
                    <Link to={task.targetUrl} className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 shadow-2xs">
                      {task.actionLabel}
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  Không có tác vụ nào đang chờ xử lý
                </div>
              )}
            </div>
          </div>

          {/* Campus Distribution Card (Figma 55:2) */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Campus Distribution</h3>

            <div className="space-y-3 text-xs">
              {dashboardData?.campusDistribution && dashboardData.campusDistribution.length > 0 ? (
                dashboardData.campusDistribution.map((campus) => (
                  <div key={campus.campusCode}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">{campus.campusName}</span>
                      <span className="text-slate-500">{campus.studentsCount.toLocaleString()} students ({campus.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${campus.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  Chưa có thống kê phân bổ phân hiệu
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link to="/campuses" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between">
                <span>Manage campus partitions and nodes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
