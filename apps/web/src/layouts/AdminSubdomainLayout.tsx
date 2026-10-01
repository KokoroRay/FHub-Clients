import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  LifeBuoy,
  Building2,
  GraduationCap,
  Network,
  Award,
  Zap,
  FileSpreadsheet,
  Activity,
  ShieldCheck,
  Search,
  Bell,
  MapPin,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  LogOut,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockCampuses } from '../services/mockData';
import { Dropdown } from '../components/common/Dropdown';
import { Badge } from '../components/common/Badge';
import { setSubdomainMode } from '../utils/subdomain';

export const AdminSubdomainLayout: React.FC = () => {
  const { currentUser, currentCampus, setCurrentCampus, currentRole, switchRole, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartition, setSelectedPartition] = useState<string>('ALL');
  const navigate = useNavigate();

  const navGroups = [
    {
      title: 'MAIN NAVIGATION',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'User Management', path: '/users', icon: Users, badge: '12.4k' },
        { name: 'Support Tickets', path: '/tickets', icon: LifeBuoy, badge: '24' },
      ],
    },
    {
      title: 'ACADEMIC TAXONOMY',
      items: [
        { name: 'Campuses', path: '/campuses', icon: Building2, badge: '5' },
        { name: 'Majors', path: '/majors', icon: GraduationCap, badge: '32' },
        { name: 'Course Nodes', path: '/course-nodes', icon: Network, badge: '186' },
      ],
    },
    {
      title: 'SYSTEM & GOVERNANCE',
      items: [
        { name: 'Reputation Rules', path: '/reputation', icon: Zap },
        { name: 'Achievement Badges', path: '/badges', icon: Award },
        { name: 'Audit Logs', path: '/audit-logs', icon: FileSpreadsheet, badge: 'Live' },
        { name: 'System Health', path: '/health', icon: Activity },
      ],
    },
  ];

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/users?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSwitchToMainPortal = () => {
    setSubdomainMode('main');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
      isActive
        ? 'bg-[#005da7] text-white shadow-sm font-bold'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
    }`;

  return (
    <div className="min-h-screen bg-[#faf9fd] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#cfe1fe] selection:text-[#005da7]">
      {/* Admin Top Header (Figma 55:2 Header) */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Console Tag */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#005da7] via-[#004a87] to-[#1e1b4b] flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                F
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  FHub Admin
                  <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 rounded-md font-bold border border-rose-200 dark:border-rose-800">
                    CONSOLE
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">SEP Core Control Center</span>
              </div>
            </Link>

            {/* Live Telemetry Pill */}
            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-[11px]">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync 99.8%
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                admin.fhub.edu.vn
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleGlobalSearch} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tài khoản, môn học, cơ sở, ticket..."
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl pl-9 pr-12 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005da7]/20 focus:border-[#005da7] transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
                Ctrl K
              </span>
            </div>
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Campus Partition Switcher */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-[#005da7]" />
                  <span>{selectedPartition === 'ALL' ? 'Toàn bộ 5 Campus' : `Cơ sở: ${selectedPartition}`}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              }
              items={[
                { id: 'ALL', label: 'Toàn bộ 5 Phân hiệu (All Campuses)', onClick: () => setSelectedPartition('ALL') },
                ...mockCampuses.map((c) => ({
                  id: c.code,
                  label: `${c.code} - ${c.name}`,
                  onClick: () => {
                    setSelectedPartition(c.code);
                    setCurrentCampus(c.code);
                  },
                })),
              ]}
            />

            {/* Back to Student Portal Button */}
            <button
              onClick={handleSwitchToMainPortal}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#005da7] bg-[#cfe1fe]/70 hover:bg-[#cfe1fe] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Chuyển về cổng sinh viên"
            >
              <span>Main Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Notification Bell */}
            <Link
              to="/tickets"
              className="p-2 text-slate-500 hover:text-[#005da7] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
              title="Support Tickets"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </Link>

            {/* Admin User Profile */}
            <Dropdown
              trigger={
                <div className="flex items-center gap-2 pl-1 cursor-pointer">
                  <img
                    src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="Admin User"
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#005da7]"
                  />
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {currentUser?.fullName || 'Admin User'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> System Admin
                    </span>
                  </div>
                </div>
              }
              items={[
                { id: 'dash', label: 'Dashboard Control', icon: <LayoutDashboard className="w-4 h-4" />, onClick: () => navigate('/') },
                { id: 'main-portal', label: 'Quay về Main Portal', icon: <ArrowUpRight className="w-4 h-4 text-[#005da7]" />, onClick: handleSwitchToMainPortal },
                { id: 'logout', label: 'Đăng xuất', icon: <LogOut className="w-4 h-4 text-rose-500" />, danger: true, divider: true, onClick: logout },
              ]}
            />
          </div>
        </div>
      </header>

      {/* Admin Content Area (Sidebar + Main) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex gap-6">
        {/* Admin Navigation Sidebar (Figma Aside) */}
        <aside className="w-64 shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-5.5rem)] overflow-y-auto pr-2 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <h4 className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </h4>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.path} to={item.path} end={item.path === '/'} className={linkClass}>
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-[#cfe1fe] group-hover:text-[#005da7]">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Quick Subdomain Info Card */}
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2 text-xs shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[11px] text-sky-400">ADMIN SUBDOMAIN</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full font-mono">LIVE</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Môi trường quản trị độc lập triển khai tại <strong>admin.fhub.edu.vn</strong>
            </p>
          </div>
        </aside>

        {/* Main Routed Content */}
        <main className="flex-1 min-w-0 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
