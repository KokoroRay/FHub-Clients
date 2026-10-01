import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Bell,
  MessageSquare,
  MapPin,
  ChevronDown,
  User as UserIcon,
  Settings,
  Shield,
  LogOut,
  HelpCircle,
  Sparkles,
  BookOpen,
  Code,
  FileText,
  Upload,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCampuses, mockNotifications } from '../../services/mockData';
import { Dropdown } from '../common/Dropdown';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { setSubdomainMode } from '../../utils/subdomain';

export const Header: React.FC = () => {
  const { currentUser, currentCampus, setCurrentCampus, currentRole, switchRole, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const currentCampusObj = mockCampuses.find((c) => c.code === currentCampus) || mockCampuses[0];

  const createMenu = [
    {
      id: 'ask-question',
      label: 'Đặt câu hỏi Q&A',
      icon: <HelpCircle className="w-4 h-4 text-sky-500" />,
      onClick: () => navigate('/discussions?action=create'),
    },
    {
      id: 'share-workflow',
      label: 'Chia sẻ Workflow',
      icon: <Code className="w-4 h-4 text-purple-500" />,
      onClick: () => navigate('/workflows?action=create'),
    },
    {
      id: 'write-article',
      label: 'Viết bài Tech Article',
      icon: <FileText className="w-4 h-4 text-emerald-500" />,
      onClick: () => navigate('/articles/create'),
    },
    {
      id: 'upload-material',
      label: 'Tải lên tài liệu học tập',
      icon: <Upload className="w-4 h-4 text-amber-500" />,
      onClick: () => navigate('/materials?action=upload'),
    },
    {
      id: 'create-listing',
      label: 'Đăng tin Marketplace',
      icon: <ShoppingBag className="w-4 h-4 text-rose-500" />,
      onClick: () => navigate('/marketplace?action=create'),
    },
  ];

  const userMenu = [
    {
      id: 'profile',
      label: 'Trang cá nhân',
      icon: <UserIcon className="w-4 h-4" />,
      onClick: () => navigate('/profile'),
    },
    {
      id: 'settings',
      label: 'Cài đặt tài khoản',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => navigate('/settings'),
    },
    {
      id: 'admin-subdomain',
      label: 'Admin Console (Subdomain)',
      icon: <Shield className="w-4 h-4 text-[#005da7]" />,
      onClick: () => setSubdomainMode('admin'),
    },
    ...(currentRole === 'Admin' || currentRole === 'Staff'
      ? [
          {
            id: 'admin-portal',
            label: currentRole === 'Admin' ? 'Admin Control Center' : 'Staff Governance',
            icon: <Shield className="w-4 h-4 text-[#005da7]" />,
            onClick: () => navigate(currentRole === 'Admin' ? '/admin/campus' : '/staff/accounts'),
          },
        ]
      : []),
    {
      id: 'logout',
      label: 'Đăng xuất',
      icon: <LogOut className="w-4 h-4 text-rose-500" />,
      danger: true,
      divider: true,
      onClick: logout,
    },
  ];

  const roleList: Array<typeof currentRole> = [
    'Student',
    'Admin',
    'Staff',
    'Community Moderator',
    'School Representative',
    'Alumni',
    'Guest',
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Campus Switcher */}
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#005da7] to-[#0284c7] flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                FHub <span className="text-[10px] px-1.5 py-0.2 bg-[#cfe1fe] text-[#005da7] rounded-md font-bold">EDU</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Academic Network</span>
            </div>
          </Link>

          {/* Campus Selector */}
          <div className="hidden lg:flex items-center">
            <Dropdown
              trigger={
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-[#005da7]" />
                  <span>{currentCampusObj.code}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              }
              items={mockCampuses.map((c) => ({
                id: c.code,
                label: (
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.studentCount.toLocaleString()} sinh viên</span>
                  </div>
                ),
                onClick: () => setCurrentCampus(c.code),
              }))}
            />
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm môn học (PRN211...), câu hỏi, workflow, tài liệu..."
              className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl pl-9 pr-12 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005da7]/20 focus:border-[#005da7] transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
              Ctrl K
            </span>
          </div>
        </form>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher for Test & Evaluation */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Role: {currentRole}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
            }
            items={roleList.map((r) => ({
              id: r,
              label: (
                <div className="flex items-center justify-between w-full">
                  <span>{r}</span>
                  {r === currentRole && <span className="text-xs text-[#005da7]">✓</span>}
                </div>
              ),
              onClick: () => switchRole(r),
            }))}
          />

          {/* Admin Subdomain Console Pill */}
          <button
            onClick={() => setSubdomainMode('admin')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-all cursor-pointer shadow-2xs"
            title="Mở Admin Subdomain Console (admin.fhub.edu.vn)"
          >
            <Shield className="w-3 h-3 text-rose-600" />
            <span>Admin Console</span>
          </button>

          {currentUser ? (
            <>
              {/* Quick Create Dropdown */}
              <Dropdown
                trigger={
                  <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                    <span className="hidden sm:inline">Tạo mới</span>
                  </Button>
                }
                items={createMenu}
              />

              {/* Messages Link */}
              <Link
                to="/messages"
                className="p-2 text-slate-500 hover:text-[#005da7] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
                title="Tin nhắn"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              {/* Notifications Link */}
              <button
                onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                className="p-2 text-slate-500 hover:text-[#005da7] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative cursor-pointer"
                title="Thông báo"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              </button>

              {/* User Avatar & Menu */}
              <Dropdown
                trigger={
                  <div className="flex items-center gap-2 pl-1 cursor-pointer">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                    />
                    <div className="hidden xl:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                        {currentUser.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{currentUser.studentId || currentRole}</span>
                    </div>
                  </div>
                }
                items={userMenu}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
