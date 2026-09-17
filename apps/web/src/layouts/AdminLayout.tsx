import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  Network,
  Hash,
  KeyRound,
  UserCheck,
  Award,
  FileSpreadsheet,
  Cpu,
  Users,
  ShieldAlert,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import { Header } from '../components/navigation/Header';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { currentRole } = useAuth();

  const adminMenu = [
    { title: 'Academic Taxonomy', items: [
      { name: 'Quản lý Campus', path: '/admin/campus', icon: Building2 },
      { name: 'Quản lý Chuyên ngành', path: '/admin/majors', icon: GraduationCap },
      { name: 'Quản lý Course Nodes', path: '/admin/course-nodes', icon: Network },
      { name: 'Quản lý Topics', path: '/admin/topics', icon: Hash },
    ]},
    { title: 'Identity & Staff', items: [
      { name: 'Roles & Policies', path: '/admin/roles-policies', icon: KeyRound },
      { name: 'Quản lý Staff Accounts', path: '/admin/staff-accounts', icon: UserCheck },
    ]},
    { title: 'Interactions & System', items: [
      { name: 'Badges & Karma Rules', path: '/admin/badges', icon: Award },
      { name: 'System Audit Logs', path: '/admin/audit-logs', icon: FileSpreadsheet },
      { name: 'AI Moderation & Scan', path: '/admin/ai-moderation', icon: Cpu },
    ]},
    { title: 'Staff Governance', items: [
      { name: 'Quản trị User Accounts', path: '/staff/accounts', icon: Users },
      { name: 'Duyệt KYC Verification', path: '/staff/verification', icon: ShieldAlert },
      { name: 'System Health Dashboard', path: '/staff/health', icon: Activity },
    ]},
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
      isActive
        ? 'bg-[#005da7] text-white shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="min-h-screen bg-[#faf9fd] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex gap-6">
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block sticky top-20 h-[calc(100vh-5.5rem)] overflow-y-auto pr-2 space-y-6">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xs text-[#005da7] uppercase tracking-wide">
                {currentRole === 'Admin' ? 'Admin Portal' : 'Staff Governance'}
              </h3>
              <p className="text-[10px] text-slate-500">SEP Core Control Center</p>
            </div>
            <Link to="/" className="text-xs text-sky-700 hover:underline flex items-center gap-0.5" title="Về trang chủ">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {adminMenu.map((group) => (
            <div key={group.title} className="space-y-1">
              <h4 className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                {group.title}
              </h4>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={linkClass}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Main Admin Content */}
        <main className="flex-1 min-w-0 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
