import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdminSubdomain } from '../utils/subdomain';

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token');
  const hasValidAuth = isAuthenticated || !!token;
  const isOperationalRole =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Community Moderator' ||
    currentUser?.role === 'School Representative' ||
    currentUser?.role === 'Staff';

  if (!hasValidAuth || !isOperationalRole) {
    const redirectUrl = location.pathname !== '/login' ? `${location.pathname}${location.search}` : '/';
    const loginTarget = isAdminSubdomain()
      ? `/login?redirect=${encodeURIComponent(redirectUrl)}`
      : `/landing?redirect=${encodeURIComponent(redirectUrl)}`;

    return <Navigate to={loginTarget} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
