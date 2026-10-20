import { NewsManagementPage } from '../features/news/NewsManagementPage';
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminSubdomainLayout } from '../layouts/AdminSubdomainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminProtectedRoute } from './AdminProtectedRoute';
import { isOpsSubdomain } from '../utils/subdomain';

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
  SemanticTagsPage,
  StaffAccountsAdminPage,
} from '../features/admin/pages';

// Admin & Staff Governance Pages
import { RolePolicyManagementPage } from '../features/admin/RolePolicyManagementPage';
import { AIModerationPage } from '../features/admin/AIModerationPage';
import { VerificationQueuePage } from '../features/staff/VerificationQueuePage';

// Auth Pages
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { NotFoundPage } from '../features/common/NotFoundPage';

/**
 * Subdomain Routes Definition (ops.fhub.com.vn / ops.localhost)
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
      { path: 'tags', element: <SemanticTagsPage /> },
      { path: 'staff', element: <StaffAccountsAdminPage /> },
      { path: 'news', element: <NewsManagementPage /> },
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
  // Main Academic Hub & Student Portal (Enforce Auth Gate)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
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
      { path: 'news', element: <NewsManagementPage /> },
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
      { path: 'tags', element: <SemanticTagsPage /> },
      { path: 'staff', element: <StaffAccountsAdminPage /> },
    ],
  },

  // Admin & Staff Governance Legacy Redirects
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { path: 'admin/campus', element: <Navigate to="/campuses" replace /> },
      { path: 'admin/majors', element: <Navigate to="/majors" replace /> },
      { path: 'admin/courses', element: <Navigate to="/courses" replace /> },
      { path: 'admin/course-nodes', element: <Navigate to="/courses" replace /> },
      { path: 'admin/topics', element: <Navigate to="/tags" replace /> },
      { path: 'admin/roles-policies', element: <RolePolicyManagementPage /> },
      { path: 'admin/staff-accounts', element: <Navigate to="/staff" replace /> },
      { path: 'admin/badges', element: <Navigate to="/badges" replace /> },
      { path: 'admin/audit-logs', element: <Navigate to="/audit-logs" replace /> },
      { path: 'admin/ai-moderation', element: <AIModerationPage /> },
      { path: 'staff/accounts', element: <Navigate to="/users" replace /> },
      { path: 'staff/verification', element: <Navigate to="/verifications" replace /> },
      { path: 'staff/health', element: <Navigate to="/health" replace /> },
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
      { path: 'ops-login', element: <AdminLoginPage /> },
      { path: 'ops/login', element: <AdminLoginPage /> },
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
  isOpsSubdomain() ? getSubdomainRoutes() : getMainPortalRoutes()
);

