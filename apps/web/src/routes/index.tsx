import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';

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

// Admin & Staff Governance
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

export const router = createBrowserRouter([
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

  // Admin & Staff Governance Layout
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
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // Fallback redirect
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
