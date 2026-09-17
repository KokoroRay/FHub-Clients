import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, currentRole, isAuthenticated } = useAuth();

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    // If not allowed, redirect to Home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
