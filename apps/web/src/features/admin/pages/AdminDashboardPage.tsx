import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  LifeBuoy,
  Network,
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
import { mockDetailedCampuses, mockAdminUsers, mockDetailedSupportTickets, mockDetailedAuditLogs } from '../../../services/adminMockData';
import { fetchAdminDashboardStats, AdminDashboardData } from '../../../services/adminDashboardService';

export const AdminDashboardPage: React.FC = () => {
  const [activityTimeframe, setActivityTimeframe] = useState<'Today' | '7 Days' | '30 Days'>('Today');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Greeting & Action Header (Figma 55:2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, Admin
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
            <span>Sunday, Oct 24, 2026</span>
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
                  <span>Add Campus Partition</span>
                </button>
                <button
                  onClick={() => { setShowQuickActions(false); navigate('/majors?action=create'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add Major Track</span>
                </button>
                <button
                  onClick={() => { setShowQuickActions(false); navigate('/course-nodes?action=create'); }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Network className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add Course Node</span>
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
              {dashboardData?.topStats.usersDelta ?? '+12.4% vs last mo'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {dashboardData?.topStats.totalUsers.toLocaleString() ?? '12,450'}
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
              {dashboardData?.topStats.ticketsQueueNote ?? '12 in queue'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {dashboardData?.topStats.supportTickets ?? 24}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{dashboardData?.topStats.urgentTicketsCount ?? 4} urgent priority</p>
        </Link>

        {/* Card 3: COURSE NODES */}
        <Link
          to="/course-nodes"
          className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COURSE NODES</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
              142 active discussions
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {dashboardData?.topStats.courseNodes ?? 186}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Across {dashboardData?.academicOverview.majorsCount ?? 32} majors</p>
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
            {dashboardData?.topStats.activeCampuses ?? 5}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">HL • HCM • DN • CT • QN</p>
        </Link>

        {/* Card 5: SYSTEM ALERTS */}
        <Link
          to="/health"
          className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-rose-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SYSTEM ALERTS</span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
              Action required
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {dashboardData?.topStats.systemAlerts ?? 3}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">2 warning, 1 critical</p>
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
                  <span className="text-lg font-bold text-slate-900">8,940</span>
                  <span className="text-[10px] font-bold text-emerald-600">+7.2%</span>
                </div>
              </div>
              <div className="border-l border-slate-100 pl-6">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">New Signups</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-slate-900">412</span>
                  <span className="text-[10px] font-bold text-emerald-600">+3.4%</span>
                </div>
              </div>
              <div className="border-l border-slate-100 pl-6">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Discussions</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-slate-900">94</span>
                  <span className="text-[10px] text-slate-400">Daily avg</span>
                </div>
              </div>
            </div>

            {/* SVG Curved Area Chart */}
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
                  <path
                    d="M 0 95 Q 60 70, 120 78 T 240 50 T 360 65 T 440 25 T 500 40 L 500 120 L 0 120 Z"
                    fill="url(#blueGradient)"
                  />
                  {/* Curved Stroke */}
                  <path
                    d="M 0 95 Q 60 70, 120 78 T 240 50 T 360 65 T 440 25 T 500 40"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Data Points */}
                  <circle cx="240" cy="50" r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="440" cy="25" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

              {/* X Axis Timestamps */}
              <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span className="font-semibold text-slate-700">Now (Today)</span>
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
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold">12 Open</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-bold">6 In Prog</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">4 Waiting</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">2 Resolved</span>
                  </div>
                </div>

                <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
                  <div className="pt-2 first:pt-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-800 text-[11px] leading-snug line-clamp-1">
                        Cannot access PRN211 course in Ho Chi Minh campus
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                        High
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Campus HL</span>
                      <span>•</span>
                      <span>10m ago</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-800 text-[11px] leading-snug line-clamp-1">
                        Duplicate marketplace listing report
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        Med
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Campus HCM</span>
                      <span>•</span>
                      <span>25m ago</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-800 text-[11px] leading-snug line-clamp-1">
                        Karma points calculation error on Best Answer
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        Low
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Campus DN</span>
                      <span>•</span>
                      <span>1h ago</span>
                    </div>
                  </div>
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
                  <div className="pt-2 first:pt-0 flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                      alt="User"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-slate-800 leading-snug">
                        <strong>Nguyen Van A</strong> upvoted study node <strong>PRN211</strong>
                      </div>
                      <span className="text-[10px] text-slate-400">2m ago</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                      alt="User"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-slate-800 leading-snug">
                        <strong>Pham Thi B</strong> published marketplace item <strong>Giáo trình CSD201</strong>
                      </div>
                      <span className="text-[10px] text-slate-400">14m ago</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                      alt="User"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-slate-800 leading-snug">
                        <strong>Tran Minh C</strong> earned badge <strong>Verified Mod</strong>
                      </div>
                      <span className="text-[10px] text-slate-400">32m ago</span>
                    </div>
                  </div>
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
                <div className="text-lg font-bold text-slate-900">5</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">CAMPUSES</div>
                <div className="text-[9px] text-slate-400">All nodes synced</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-lg font-bold text-slate-900">32</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">MAJORS</div>
                <div className="text-[9px] text-slate-400">Software Eng, IS, AI...</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-lg font-bold text-slate-900">186</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">COURSE NODES</div>
                <div className="text-[9px] text-slate-400">Syllabus live</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-lg font-bold text-slate-900">2,480</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">MATERIALS</div>
                <div className="text-[9px] text-slate-400">Uploaded & verified</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-lg font-bold text-slate-900">4,320</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">DISCUSSIONS</div>
                <div className="text-[9px] text-slate-400">Total resolved: 92%</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <div className="text-lg font-bold text-slate-900">856</div>
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
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">14:20:10</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Nguyen Admin</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Suspended User
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">HE172109 - QE183011</td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">13:45:00</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Tran Moderator</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Updated Course Node
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">PRN211 - .NET Track</td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">11:15:30</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Nguyen Admin</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Revoked Auth Token
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Token #941 (usr-6)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">09:00:12</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Le Moderator</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Resolved Ticket
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">TKT-2026-089</td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">08:00:00</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">System Auto-Task</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        Cleaned Temp Files
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">Cache Disk</td>
                  </tr>
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
                  <span className="font-mono text-emerald-600 font-bold">99.98%</span>
                  <span className="text-[10px] text-slate-400 block">Master + 2 replicas</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-slate-800">API Cluster</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-slate-800 font-bold">42ms Latency</span>
                  <span className="text-[10px] text-slate-400 block">4/4 nodes active</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-slate-800">Search Service</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-600 font-bold">Optimal</span>
                  <span className="text-[10px] text-slate-400 block">Elastic cluster</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-slate-800">CDN Delivery</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-600 font-bold">99.9% Uptime</span>
                  <span className="text-[10px] text-slate-400 block">Edge DC cache 98%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Tasks Card (Figma 55:2) */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Pending Tasks</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                8 Tasks
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">24 Support Tickets</div>
                  <div className="text-[10px] text-rose-600 font-bold">4 urgent priority</div>
                </div>
                <Link to="/tickets" className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 shadow-2xs">
                  Review
                </Link>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">3 Verifications</div>
                  <div className="text-[10px] text-amber-600">Student ID cards pending</div>
                </div>
                <Link to="/users" className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 shadow-2xs">
                  Verify
                </Link>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">2 Reported Listings</div>
                  <div className="text-[10px] text-slate-400">Marketplace spam report</div>
                </div>
                <Link to="/tickets" className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 shadow-2xs">
                  Inspect
                </Link>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">1 System Alerts</div>
                  <div className="text-[10px] text-blue-600">Partition sync notice</div>
                </div>
                <Link to="/health" className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 shadow-2xs">
                  Details
                </Link>
              </div>
            </div>
          </div>

          {/* Campus Distribution Card (Figma 55:2) */}
          <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Campus Distribution</h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700">Hoa Lac (HL)</span>
                  <span className="text-slate-500">4,521 students (38%)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '38%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700">Ho Chi Minh (HCM)</span>
                  <span className="text-slate-500">4,110 students (35%)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700">Da Nang (DN)</span>
                  <span className="text-slate-500">1,870 students (15%)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700">Can Tho (CT)</span>
                  <span className="text-slate-500">1,120 students (8%)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '8%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700">Quy Nhon (QN)</span>
                  <span className="text-slate-500">829 students (4%)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '4%' }} />
                </div>
              </div>
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
