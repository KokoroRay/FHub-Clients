import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminSubdomainLayout } from '../layouts/AdminSubdomainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminProtectedRoute } from './AdminProtectedRoute';
import { isOpsSubdomain } from '../utils/subdomain';
import { LoadingFallback } from '../components/common/LoadingFallback';

// Typesafe helper for lazy named exports
const lazyNamed = <T extends Record<string, any>, K extends keyof T>(
  factory: () => Promise<T>,
  name: K
) => lazy(() => factory().then(m => ({ default: m[name] })));

// Feed & Academic Pages
const FeedPage = lazyNamed(() => import('../features/feed/FeedPage'), 'FeedPage');
const SearchResultsPage = lazyNamed(() => import('../features/search/SearchResultsPage'), 'SearchResultsPage');
const CourseListPage = lazyNamed(() => import('../features/courses/CourseListPage'), 'CourseListPage');
const CourseDetailPage = lazyNamed(() => import('../features/courses/CourseDetailPage'), 'CourseDetailPage');
const QuestionListPage = lazyNamed(() => import('../features/discussions/QuestionListPage'), 'QuestionListPage');
const QuestionDetailPage = lazyNamed(() => import('../features/discussions/QuestionDetailPage'), 'QuestionDetailPage');
const ArticleListPage = lazyNamed(() => import('../features/articles/ArticleListPage'), 'ArticleListPage');
const ArticleDetailPage = lazyNamed(() => import('../features/articles/ArticleDetailPage'), 'ArticleDetailPage');
const CreateArticlePage = lazyNamed(() => import('../features/articles/CreateArticlePage'), 'CreateArticlePage');
const SeriesDetailPage = lazyNamed(() => import('../features/articles/SeriesDetailPage'), 'SeriesDetailPage');
const WorkflowListPage = lazyNamed(() => import('../features/workflows/WorkflowListPage'), 'WorkflowListPage');
const WorkflowDetailPage = lazyNamed(() => import('../features/workflows/WorkflowDetailPage'), 'WorkflowDetailPage');
const StudyMaterialListPage = lazyNamed(() => import('../features/materials/StudyMaterialListPage'), 'StudyMaterialListPage');
const StudyMaterialDetailPage = lazyNamed(() => import('../features/materials/StudyMaterialDetailPage'), 'StudyMaterialDetailPage');
const CourseEvaluationListPage = lazyNamed(() => import('../features/evaluations/CourseEvaluationListPage'), 'CourseEvaluationListPage');
const CourseEvaluationDetailPage = lazyNamed(() => import('../features/evaluations/CourseEvaluationDetailPage'), 'CourseEvaluationDetailPage');

// Profile & Communication & Support
const ProfilePage = lazyNamed(() => import('../features/profile/ProfilePage'), 'ProfilePage');
const ProfileSettingsPage = lazyNamed(() => import('../features/profile/ProfileSettingsPage'), 'ProfileSettingsPage');
const StudentReputationRulesPage = lazyNamed(() => import('../features/profile/StudentReputationRulesPage'), 'StudentReputationRulesPage');
const DirectMessagesPage = lazyNamed(() => import('../features/communication/DirectMessagesPage'), 'DirectMessagesPage');
const NotificationsPage = lazyNamed(() => import('../features/communication/NotificationsPage'), 'NotificationsPage');
const MentorshipPage = lazyNamed(() => import('../features/communication/MentorshipPage'), 'MentorshipPage');
const SupportTicketsPage = lazyNamed(() => import('../features/governance/SupportTicketsPage'), 'SupportTicketsPage');
const BookmarksPage = lazyNamed(() => import('../features/bookmarks/BookmarksPage'), 'BookmarksPage');

// Special Roles Desk
const ModeratorToolsPage = lazyNamed(() => import('../features/moderator/ModeratorToolsPage'), 'ModeratorToolsPage');
const OfficialBroadcastsPage = lazyNamed(() => import('../features/moderator/OfficialBroadcastsPage'), 'OfficialBroadcastsPage');
const AlumniKarmaPage = lazyNamed(() => import('../features/moderator/AlumniKarmaPage'), 'AlumniKarmaPage');
const NewsManagementPage = lazyNamed(() => import('../features/news/NewsManagementPage'), 'NewsManagementPage');

// Admin Subdomain Core Pages (Figma Mapped)
const AdminDashboardPage = lazyNamed(() => import('../features/admin/pages/AdminDashboardPage'), 'AdminDashboardPage');
const UserManagementPage = lazyNamed(() => import('../features/admin/pages/UserManagementPage'), 'UserManagementPage');
const UserDetailPage = lazyNamed(() => import('../features/admin/pages/UserDetailPage'), 'UserDetailPage');
const SupportTicketsAdminPage = lazyNamed(() => import('../features/admin/pages/SupportTicketsAdminPage'), 'SupportTicketsAdminPage');
const CampusesPage = lazyNamed(() => import('../features/admin/pages/CampusesPage'), 'CampusesPage');
const CampusDetailPage = lazyNamed(() => import('../features/admin/pages/CampusDetailPage'), 'CampusDetailPage');
const MajorsPage = lazyNamed(() => import('../features/admin/pages/MajorsPage'), 'MajorsPage');
const MajorDetailPage = lazyNamed(() => import('../features/admin/pages/MajorDetailPage'), 'MajorDetailPage');
const CourseNodesAdminPage = lazyNamed(() => import('../features/admin/pages/CourseNodesAdminPage'), 'CourseNodesAdminPage');
const CourseNodeDetailPage = lazyNamed(() => import('../features/admin/pages/CourseNodeDetailPage'), 'CourseNodeDetailPage');
const ReputationRulesPage = lazyNamed(() => import('../features/admin/pages/ReputationRulesPage'), 'ReputationRulesPage');
const AchievementBadgesPage = lazyNamed(() => import('../features/admin/pages/AchievementBadgesPage'), 'AchievementBadgesPage');
const AuditLogsPage = lazyNamed(() => import('../features/admin/pages/AuditLogsPage'), 'AuditLogsPage');
const AuditLogDetailPage = lazyNamed(() => import('../features/admin/pages/AuditLogDetailPage'), 'AuditLogDetailPage');
const SystemHealthAdminPage = lazyNamed(() => import('../features/admin/pages/SystemHealthAdminPage'), 'SystemHealthAdminPage');
const AdminLoginPage = lazyNamed(() => import('../features/admin/pages/AdminLoginPage'), 'AdminLoginPage');
const SpecializationsPage = lazyNamed(() => import('../features/admin/pages/SpecializationsPage'), 'SpecializationsPage');
const SpecializationDetailPage = lazyNamed(() => import('../features/admin/pages/SpecializationDetailPage'), 'SpecializationDetailPage');
const SemanticTagsPage = lazyNamed(() => import('../features/admin/pages/SemanticTagsPage'), 'SemanticTagsPage');
const StaffAccountsAdminPage = lazyNamed(() => import('../features/admin/pages/StaffAccountsAdminPage'), 'StaffAccountsAdminPage');

// Admin & Staff Governance Pages
const VerificationQueuePage = lazyNamed(() => import('../features/staff/VerificationQueuePage'), 'VerificationQueuePage');

// Auth Pages
const LoginPage = lazyNamed(() => import('../features/auth/LoginPage'), 'LoginPage');
const RegisterPage = lazyNamed(() => import('../features/auth/RegisterPage'), 'RegisterPage');
const ForgotPasswordPage = lazyNamed(() => import('../features/auth/ForgotPasswordPage'), 'ForgotPasswordPage');
const NotFoundPage = lazyNamed(() => import('../features/common/NotFoundPage'), 'NotFoundPage');

// Landing & Public Pages (UC02)
const LandingPage = lazyNamed(() => import('../features/landing/LandingPage'), 'LandingPage');
const TechBlogPage = lazyNamed(() => import('../features/landing/TechBlogPage'), 'TechBlogPage');
const CourseRatingsPage = lazyNamed(() => import('../features/landing/CourseRatingsPage'), 'CourseRatingsPage');

// Standardized Screenflow Auth Pages (UC01)
const CampusSelectionPage = lazyNamed(() => import('../features/auth/CampusSelectionPage'), 'CampusSelectionPage');
const AuthOptionsPage = lazyNamed(() => import('../features/auth/AuthOptionsPage'), 'AuthOptionsPage');
const FPTSSOPage = lazyNamed(() => import('../features/auth/FPTSSOPage'), 'FPTSSOPage');
const EmailAuthPage = lazyNamed(() => import('../features/auth/EmailAuthPage'), 'EmailAuthPage');
const EmailRegPage = lazyNamed(() => import('../features/auth/EmailRegPage'), 'EmailRegPage');
const OTPVerifyPage = lazyNamed(() => import('../features/auth/OTPVerifyPage'), 'OTPVerifyPage');
const ResetPasswordPage = lazyNamed(() => import('../features/auth/ResetPasswordPage'), 'ResetPasswordPage');

/**
 * Subdomain Routes Definition (ops.fhub.com.vn / ops.localhost)
 */
const getSubdomainRoutes = () => [
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AdminLoginPage />
      </Suspense>
    ),
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
      { path: 'settings', element: <ProfileSettingsPage /> },
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
      { path: 'evaluations', element: <CourseEvaluationListPage /> },
      { path: 'evaluations/:id', element: <CourseEvaluationDetailPage /> },
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
      { path: 'search', element: <SearchResultsPage /> },
      { path: 'course-ratings', element: <Navigate to="/course-evaluations" replace /> },
      { path: 'tech-blog', element: <Navigate to="/articles" replace /> },
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
      { path: 'settings', element: <ProfileSettingsPage /> },
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
      { path: 'admin/staff-accounts', element: <Navigate to="/staff" replace /> },
      { path: 'admin/badges', element: <Navigate to="/badges" replace /> },
      { path: 'admin/audit-logs', element: <Navigate to="/audit-logs" replace /> },
      { path: 'staff/accounts', element: <Navigate to="/users" replace /> },
      { path: 'staff/verification', element: <Navigate to="/verifications" replace /> },
      { path: 'staff/health', element: <Navigate to="/health" replace /> },
    ],
  },

  // Public Entry & Resources (UC02)
  {
    path: '/landing',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage />
      </Suspense>
    ),
  },

  // Auth Routes
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'campus-selection', element: <CampusSelectionPage /> },
      { path: 'auth-options', element: <AuthOptionsPage /> },
      { path: 'fpt-sso', element: <FPTSSOPage /> },
      { path: 'email-auth', element: <Navigate to="/landing" replace /> },
      { path: 'login', element: <Navigate to="/landing" replace /> },
      { path: 'admin-login', element: <AdminLoginPage /> },
      { path: 'admin/login', element: <AdminLoginPage /> },
      { path: 'ops-login', element: <AdminLoginPage /> },
      { path: 'ops/login', element: <AdminLoginPage /> },
      { path: 'email-reg', element: <EmailRegPage /> },
      { path: 'register', element: <EmailRegPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'otp-verify', element: <OTPVerifyPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // Fallback 404 page
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];

export const router = createBrowserRouter(
  isOpsSubdomain() ? getSubdomainRoutes() : getMainPortalRoutes()
);
