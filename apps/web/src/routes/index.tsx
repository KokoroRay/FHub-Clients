import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminSubdomainLayout } from '../layouts/AdminSubdomainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminProtectedRoute } from './AdminProtectedRoute';
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
import { SeriesDetailPage } from '../features/articles/SeriesDetailPage';
import { WorkflowListPage } from '../features/workflows/WorkflowListPage';
import { WorkflowDetailPage } from '../features/workflows/WorkflowDetailPage';
import { StudyMaterialListPage } from '../features/materials/StudyMaterialListPage';
import { StudyMaterialDetailPage } from '../features/materials/StudyMaterialDetailPage';
import { CourseEvaluationListPage } from '../features/evaluations/CourseEvaluationListPage';
import { CourseEvaluationDetailPage } from '../features/evaluations/CourseEvaluationDetailPage';
import { MarketplaceListPage } from '../features/marketplace/MarketplaceListPage';
import { MarketplaceDetailPage } from '../features/marketplace/MarketplaceDetailPage';

// Profile & Communication & Support
import { ProfilePage } from '../features/profile/ProfilePage';
import { ProfileSettingsPage } from '../features/profile/ProfileSettingsPage';
import { StudentReputationRulesPage } from '../features/profile/StudentReputationRulesPage';
import { DirectMessagesPage } from '../features/communication/DirectMessagesPage';
import { NotificationsPage } from '../features/communication/NotificationsPage';
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
  SpecializationsPage,
  SpecializationDetailPage,
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
import { NotFoundPage } from '../features/common/NotFoundPage';

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
 * - /courses -> CourseNodesAdminPage (Courses Registry)
 * - /courses/:code -> CourseNodeDetailPage (Course Detail)
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
    element: (
      <AdminProtectedRoute>
        <AdminSubdomainLayout />
      </AdminProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: 'tickets', element: <SupportTicketsAdminPage /> },
      { path: 'campuses', element: <CampusesPage /> },
      { path: 'campuses/:code', element: <CampusDetailPage /> },
      { path: 'majors', element: <MajorsPage /> },
      { path: 'majors/:code', element: <MajorDetailPage /> },
      { path: 'specializations', element: <SpecializationsPage /> },
      { path: 'specializations/:id', element: <SpecializationDetailPage /> },
      { path: 'courses', element: <CourseNodesAdminPage /> },
      { path: 'courses/:code', element: <CourseNodeDetailPage /> },
      { path: 'course-nodes', element: <Navigate to="/courses" replace /> },
      { path: 'course-nodes/:code', element: <CourseNodeDetailPage /> },
      { path: 'reputation', element: <ReputationRulesPage /> },
      { path: 'badges', element: <AchievementBadgesPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'audit-logs/:id', element: <AuditLogDetailPage /> },
      { path: 'health', element: <SystemHealthAdminPage /> },
      { path: 'moderation', element: <ModeratorToolsPage /> },
      { path: 'verifications', element: <VerificationQueuePage /> },
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
      { path: 'series/:id', element: <SeriesDetailPage /> },
      { path: 'workflows', element: <WorkflowListPage /> },
      { path: 'workflows/:id', element: <WorkflowDetailPage /> },
      { path: 'materials', element: <StudyMaterialListPage /> },
      { path: 'materials/:id', element: <StudyMaterialDetailPage /> },
      { path: 'course-evaluations', element: <CourseEvaluationListPage /> },
      { path: 'course-evaluations/:id', element: <CourseEvaluationDetailPage /> },
      { path: 'marketplace', element: <MarketplaceListPage /> },
      { path: 'marketplace/:id', element: <MarketplaceDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/:id', element: <ProfilePage /> },
      { path: 'settings', element: <ProfileSettingsPage /> },
      { path: 'messages', element: <DirectMessagesPage /> },
      { path: 'messages/:id', element: <DirectMessagesPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'mentorship', element: <MentorshipPage /> },
      { path: 'tickets', element: <SupportTicketsPage /> },
      { path: 'tickets/:id', element: <SupportTicketsPage /> },
      { path: 'bookmarks', element: <BookmarksPage /> },
      { path: 'moderator', element: <ModeratorToolsPage /> },
      { path: 'broadcasts', element: <OfficialBroadcastsPage /> },
      { path: 'alumni', element: <AlumniKarmaPage /> },
      { path: 'reputation-rules', element: <StudentReputationRulesPage /> },
    ],
  },

  // Admin Subdomain Direct Preview from Main Domain (e.g. /admin-console/*)
  {
    path: '/admin-console',
    element: (
      <AdminProtectedRoute>
        <AdminSubdomainLayout />
      </AdminProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: 'tickets', element: <SupportTicketsAdminPage /> },
      { path: 'campuses', element: <CampusesPage /> },
      { path: 'campuses/:code', element: <CampusDetailPage /> },
      { path: 'majors', element: <MajorsPage /> },
      { path: 'majors/:code', element: <MajorDetailPage /> },
      { path: 'specializations', element: <SpecializationsPage /> },
      { path: 'specializations/:id', element: <SpecializationDetailPage /> },
      { path: 'courses', element: <CourseNodesAdminPage /> },
      { path: 'courses/:code', element: <CourseNodeDetailPage /> },
      { path: 'course-nodes', element: <Navigate to="/admin-console/courses" replace /> },
      { path: 'course-nodes/:code', element: <CourseNodeDetailPage /> },
      { path: 'reputation', element: <ReputationRulesPage /> },
      { path: 'badges', element: <AchievementBadgesPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'audit-logs/:id', element: <AuditLogDetailPage /> },
      { path: 'health', element: <SystemHealthAdminPage /> },
      { path: 'moderation', element: <ModeratorToolsPage /> },
      { path: 'verifications', element: <VerificationQueuePage /> },
    ],
  },

  // Admin & Staff Governance Layout (Legacy compatibility)
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { path: 'admin/campus', element: <CampusManagementPage /> },
      { path: 'admin/majors', element: <MajorManagementPage /> },
      { path: 'admin/courses', element: <CourseNodeManagementPage /> },
      { path: 'admin/course-nodes', element: <Navigate to="/admin/courses" replace /> },
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
      { path: 'admin/login', element: <AdminLoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],

  },

  // Fallback 404 page
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(
  isAdminSubdomain() ? getSubdomainRoutes() : getMainPortalRoutes()
);
