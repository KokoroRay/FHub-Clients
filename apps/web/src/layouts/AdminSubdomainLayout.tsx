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
  Settings,
  HelpCircle,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockCampuses } from '../services/mockData';
import { Dropdown } from '../components/common/Dropdown';
import { setSubdomainMode } from '../utils/subdomain';

export const AdminSubdomainLayout: React.FC = () => {
  const { currentUser, currentCampus, setCurrentCampus, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartition, setSelectedPartition] = useState<string>('ALL');
  const navigate = useNavigate();

  const navGroups = [
    {
      title: 'MAIN NAVIGATION',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Users', path: '/users', icon: Users, badge: '12.4k', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Support Tickets', path: '/tickets', icon: LifeBuoy, badge: '24', badgeColor: 'bg-amber-100 text-amber-700' },
        { name: 'Reputation Rules', path: '/reputation', icon: Zap },
        { name: 'Achievement Badges', path: '/badges', icon: Award },
      ],
    },
    {
      title: 'ACADEMIC TAXONOMY',
      items: [
        { name: 'Campuses', path: '/campuses', icon: Building2, badge: '5', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Majors', path: '/majors', icon: GraduationCap, badge: '32', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Course Nodes', path: '/course-nodes', icon: Network, badge: '186', badgeColor: 'bg-slate-100 text-slate-600' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Audit Logs', path: '/audit-logs', icon: FileSpreadsheet, badge: 'Live', badgeColor: 'bg-emerald-100 text-emerald-700' },
        { name: 'System Health', path: '/health', icon: Activity },
      ],
    },
  ];

  const bottomNavItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Docs', path: '/help', icon: HelpCircle },
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
    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
      isActive
        ? 'bg-blue-600 text-white font-semibold shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <div className="h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-700 overflow-hidden">
      {/* Top Header (Figma Header) */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/fhub-remove-background.png"
                  alt="FHub Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                  FHub Community
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded font-semibold border border-blue-200">
                    Admin
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Academic Platform Control</span>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleGlobalSearch} className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, tickets, courses, logs..."
                className="w-full bg-slate-100/80 border border-slate-200 rounded-lg pl-9 pr-12 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                Ctrl K
              </span>
            </div>
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Campus Switcher */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/70 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedPartition === 'ALL' ? 'All Campuses (5 Nodes)' : `Campus: ${selectedPartition}`}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              }
              items={[
                { id: 'ALL', label: 'All Campuses (5 Phân hiệu)', onClick: () => setSelectedPartition('ALL') },
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

            {/* Exit to Main Student Portal Button */}
            <button
              onClick={handleSwitchToMainPortal}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border border-blue-200/60"
              title="Quay về Cổng sinh viên"
            >
              <span>Student Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Notification Bell */}
            <Link
              to="/tickets"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="Support Tickets"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
            </Link>

            {/* Admin Profile */}
            <Dropdown
              trigger={
                <div className="flex items-center gap-2 pl-1 cursor-pointer">
                  <img
                    src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="Admin User"
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800">
                      {currentUser?.fullName || currentUser?.email?.split('@')[0] || 'Administrator'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {currentUser?.role || 'System Admin'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden xl:block" />
                </div>
              }
              items={[
                { id: 'dash', label: 'Dashboard Control', icon: <LayoutDashboard className="w-4 h-4" />, onClick: () => navigate('/') },
                { id: 'main-portal', label: 'Quay về Student Portal', icon: <ArrowUpRight className="w-4 h-4 text-blue-600" />, onClick: handleSwitchToMainPortal },
                { id: 'logout', label: 'Đăng xuất', icon: <LogOut className="w-4 h-4 text-rose-500" />, danger: true, divider: true, onClick: logout },
              ]}
            />
          </div>
        </div>
      </header>

      {/* Main Layout Body (Sidebar + Content) */}
      <div className="w-full flex-1 flex overflow-hidden">
        {/* Left Sidebar (Figma Aside) - Fixed/Locked Navigation */}
        <aside className="w-60 shrink-0 hidden lg:flex flex-col justify-between bg-white border-r border-slate-200 h-full overflow-y-auto p-4 space-y-6">
          <div className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <h4 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {group.title}
                </h4>
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink key={item.path} to={item.path} end={item.path === '/'} className={linkClass}>
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2.5">
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
                              <span>{item.name}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : item.badgeColor || 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="pt-4 border-t border-slate-100 space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.name}</span>
                    </div>
                  )}
                </NavLink>
              );
            })}

            <button
              onClick={handleSwitchToMainPortal}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Exit to Community</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
