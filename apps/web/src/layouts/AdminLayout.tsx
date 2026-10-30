import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  BookOpen,
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
import { useLanguage } from '../context/LanguageContext';

export const AdminLayout: React.FC = () => {
  const { currentRole } = useAuth();
  const { t } = useLanguage();

  const adminMenu = [
    { 
      title: t('nav.academicTaxonomy', 'Academic Taxonomy'), 
      items: [
        { name: t('nav.campuses', 'Quản lý Campus'), path: '/campuses', icon: Building2 },
        { name: t('nav.majors', 'Quản lý Chuyên ngành'), path: '/majors', icon: GraduationCap },
        { name: t('nav.courses', 'Quản lý Khóa học (Courses)'), path: '/courses', icon: BookOpen },
        { name: t('nav.semanticTags', 'Quản lý Semantic Tags'), path: '/tags', icon: Hash },
      ]
    },
    { 
      title: t('nav.rolesPolicies', 'Identity & Staff'), 
      items: [
        { name: t('nav.rolesPolicies', 'Roles & Policies'), path: '/admin/roles-policies', icon: KeyRound },
        { name: t('nav.staffManagement', 'Quản lý Staff Accounts'), path: '/staff', icon: UserCheck },
      ]
    },
    { 
      title: t('nav.systemPersonnel', 'Interactions & System'), 
      items: [
        { name: t('nav.achievementBadges', 'Quản lý Badges'), path: '/badges', icon: Award },
        { name: t('nav.auditLogs', 'System Audit Logs'), path: '/audit-logs', icon: FileSpreadsheet },
        { name: t('nav.aiModeration', 'AI Moderation & Scan'), path: '/admin/ai-moderation', icon: Cpu },
      ]
    },
    { 
      title: t('nav.moderationDesk', 'Staff Governance'), 
      items: [
        { name: t('nav.users', 'Quản trị User Accounts'), path: '/users', icon: Users },
        { name: t('nav.verificationQueue', 'Duyệt KYC Verification'), path: '/verifications', icon: ShieldAlert },
        { name: t('nav.systemHealth', 'System Health Dashboard'), path: '/health', icon: Activity },
      ]
    },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Header />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex gap-6">
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block sticky top-20 h-[calc(100vh-5.5rem)] overflow-y-auto pr-2 space-y-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                {currentRole === 'Admin' ? t('header.adminPortal', 'Admin Portal') : t('nav.staffManagement', 'Staff Governance')}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{t("SEP Core Control Center")}</p>
            </div>
            <Link to="/" className="text-xs text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-0.5" title={t('header.switchToMain', 'Về trang chủ')}>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {adminMenu.map((group) => (
            <div key={group.title} className="space-y-1">
              <h4 className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
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
