import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminSubdomainLayout } from '../layouts/AdminSubdomainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { isAdminSubdomain } from '../utils/subdomain';

// Feed & Academic Pages
import { FeedPage } from '../features/feed/FeedPage';
import { CourseListPage } from '../features/courses/CourseListPage';
import { CourseDetailPage } from '../features/courses/CourseDetailPage';
import { QuestionListPage } from '../features/discussions/QuestionListPage';
import { QuestionDetailPage } from '../features/discussions/QuestionDetailPage';
import { ArticleListPage } from '../features/articles/ArticleListPage';
import { ArticleDetailPage } from '../features/articles/ArticleDetailPage';
import { CreateArticlePage } from '../features/articles/CreateArticlePage';
import { WorkflowListPage } from '../features/workflows/WorkflowListPage';
import { WorkflowDetailPage } from '../features/workflows/WorkflowDetailPage';
import { StudyMaterialListPage } from '../features/materials/StudyMaterialListPage';
import { MarketplaceListPage } from '../features/marketplace/MarketplaceListPage';
import { MarketplaceDetailPage } from '../features/marketplace/MarketplaceDetailPage';

// Profile & Communication & Support
import { ProfilePage } from '../features/profile/ProfilePage';
import { ProfileSettingsPage } from '../features/profile/ProfileSettingsPage';
import { DirectMessagesPage } from '../features/communication/DirectMessagesPage';
import { MentorshipPage } from '../features/communication/MentorshipPage';
import { SupportTicketsPage } from '../features/governance/SupportTicketsPage';
import { BookmarksPage } from '../features/bookmarks/BookmarksPage';

// Special Roles Desk
import { ModeratorToolsPage } from '../features/moderator/ModeratorToolsPage';
import { OfficialBroadcastsPage } from '../features/moderator/OfficialBroadcastsPage';
import { AlumniKarmaPage } from '../features/moderator/AlumniKarmaPage';

// Admin Subdomain Core Pages (Figma Mapped)
import {
  AdminDashboardPage,
  UserManagementPage,
  UserDetailPage,
  SupportTicketsAdminPage,
  CampusesPage,
  CampusDetailPage,
  MajorsPage,
  MajorDetailPage,
  CourseNodesAdminPage,
  CourseNodeDetailPage,
  ReputationRulesPage,
  AchievementBadgesPage,
  AuditLogsPage,
  AuditLogDetailPage,
  SystemHealthAdminPage,
  AdminLoginPage,
} from '../features/admin/pages';

// Admin & Staff Governance (Legacy / Domain Portal)
import { CampusManagementPage } from '../features/admin/CampusManagementPage';
import { MajorManagementPage } from '../features/admin/MajorManagementPage';
import { CourseNodeManagementPage } from '../features/admin/CourseNodeManagementPage';
import { TopicManagementPage } from '../features/admin/TopicManagementPage';
import { RolePolicyManagementPage } from '../features/admin/RolePolicyManagementPage';
import { StaffManagementPage } from '../features/admin/StaffManagementPage';
import { BadgeReputationPage } from '../features/admin/BadgeReputationPage';
import { SystemAuditLogsPage } from '../features/admin/SystemAuditLogsPage';
import { AIModerationPage } from '../features/admin/AIModerationPage';
import { UserAccountsPage } from '../features/staff/UserAccountsPage';
import { VerificationQueuePage } from '../features/staff/VerificationQueuePage';
import { SystemHealthDashboardPage } from '../features/staff/SystemHealthDashboardPage';

// Auth Pages
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';

/**
 * Subdomain Routes Definition (admin.fhub.edu.vn / admin.localhost)
 * Clean URLs mapped directly to root:
 * - / -> AdminDashboardPage (Figma 55:2)
 * - /login -> AdminLoginPage
 * - /users -> UserManagementPage (Figma 55:4074)
 * - /users/:id -> UserDetailPage (Figma 55:3199)
 * - /tickets -> SupportTicketsAdminPage (Figma 56:4833)
 * - /campuses -> CampusesPage (Figma 57:6972)
 * - /campuses/:code -> CampusDetailPage (Figma 58:8220)
 * - /majors -> MajorsPage (Figma 59:9018)
 * - /majors/:code -> MajorDetailPage (Figma 59:9908)
 * - /course-nodes -> CourseNodesAdminPage (Figma 61:10719)
 * - /course-nodes/:code -> CourseNodeDetailPage (Figma 62:11573)
 * - /reputation -> ReputationRulesPage (Figma 56:5629)
 * - /badges -> AchievementBadgesPage (Figma 57:6275)
 * - /audit-logs -> AuditLogsPage (Figma 64:12427)
 * - /audit-logs/:id -> AuditLogDetailPage (Figma 65:13172)
 * - /health -> SystemHealthAdminPage
 */
const getSubdomainRoutes = () => [
  {
    path: '/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/',
    element: <AdminSubdomainLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: 'tickets', element: <SupportTicketsAdminPage /> },
      { path: 'campuses', element: <CampusesPage /> },
      { path: 'campuses/:code', element: <CampusDetailPage /> },
      { path: 'majors', element: <MajorsPage /> },
      { path: 'majors/:code', element: <MajorDetailPage /> },
      { path: 'course-nodes', element: <CourseNodesAdminPage /> },
      { path: 'course-nodes/:code', element: <CourseNodeDetailPage /> },
      { path: 'reputation', element: <ReputationRulesPage /> },
      { path: 'badges', element: <AchievementBadgesPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'audit-logs/:id', element: <AuditLogDetailPage /> },
      { path: 'health', element: <SystemHealthAdminPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

/**
 * Main Portal Routes Definition (fhub.edu.vn / localhost)
 */
const getMainPortalRoutes = () => [
  // Main Academic Hub & Student Portal
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: 'courses', element: <CourseListPage /> },
      { path: 'courses/:code', element: <CourseDetailPage /> },
      { path: 'discussions', element: <QuestionListPage /> },
      { path: 'discussions/:id', element: <QuestionDetailPage /> },
      { path: 'articles', element: <ArticleListPage /> },
      { path: 'articles/:id', element: <ArticleDetailPage /> },
      { path: 'articles/create', element: <CreateArticlePage /> },
      { path: 'workflows', element: <WorkflowListPage /> },
      { path: 'workflows/:id', element: <WorkflowDetailPage /> },
      { path: 'materials', element: <StudyMaterialListPage /> },
      { path: 'marketplace', element: <MarketplaceListPage /> },
      { path: 'marketplace/:id', element: <MarketplaceDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <ProfileSettingsPage /> },
      { path: 'messages', element: <DirectMessagesPage /> },
      { path: 'mentorship', element: <MentorshipPage /> },
      { path: 'tickets', element: <SupportTicketsPage /> },
      { path: 'bookmarks', element: <BookmarksPage /> },
      { path: 'moderator', element: <ModeratorToolsPage /> },
      { path: 'broadcasts', element: <OfficialBroadcastsPage /> },
      { path: 'alumni', element: <AlumniKarmaPage /> },
    ],
  },

  // Admin Subdomain Direct Preview from Main Domain (e.g. /admin-console/*)
  {
    path: '/admin-console',
    element: <AdminSubdomainLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: 'tickets', element: <SupportTicketsAdminPage /> },
      { path: 'campuses', element: <CampusesPage /> },
      { path: 'campuses/:code', element: <CampusDetailPage /> },
      { path: 'majors', element: <MajorsPage /> },
      { path: 'majors/:code', element: <MajorDetailPage /> },
      { path: 'course-nodes', element: <CourseNodesAdminPage /> },
      { path: 'course-nodes/:code', element: <CourseNodeDetailPage /> },
      { path: 'reputation', element: <ReputationRulesPage /> },
      { path: 'badges', element: <AchievementBadgesPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'audit-logs/:id', element: <AuditLogDetailPage /> },
      { path: 'health', element: <SystemHealthAdminPage /> },
    ],
  },

  // Admin & Staff Governance Layout (Legacy compatibility)
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { path: 'admin/campus', element: <CampusManagementPage /> },
      { path: 'admin/majors', element: <MajorManagementPage /> },
      { path: 'admin/course-nodes', element: <CourseNodeManagementPage /> },
      { path: 'admin/topics', element: <TopicManagementPage /> },
      { path: 'admin/roles-policies', element: <RolePolicyManagementPage /> },
      { path: 'admin/staff-accounts', element: <StaffManagementPage /> },
      { path: 'admin/badges', element: <BadgeReputationPage /> },
      { path: 'admin/audit-logs', element: <SystemAuditLogsPage /> },
      { path: 'admin/ai-moderation', element: <AIModerationPage /> },
      { path: 'staff/accounts', element: <UserAccountsPage /> },
      { path: 'staff/verification', element: <VerificationQueuePage /> },
      { path: 'staff/health', element: <SystemHealthDashboardPage /> },
    ],
  },

  // Auth Routes
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'admin-login', element: <AdminLoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],

  },

  // Fallback redirect
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export const router = createBrowserRouter(
  isAdminSubdomain() ? getSubdomainRoutes() : getMainPortalRoutes()
);
