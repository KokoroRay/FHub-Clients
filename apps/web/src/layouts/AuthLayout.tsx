import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to main portal
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-5xl">
        <Outlet />
      </div>
    </div>
  );
};

