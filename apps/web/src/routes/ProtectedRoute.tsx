import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { currentRole, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // If not logged in, enforce login screen (like Facebook)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    // If not allowed, redirect to Home
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
