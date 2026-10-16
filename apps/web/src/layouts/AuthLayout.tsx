import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-5xl">
        <Outlet />
      </div>
    </div>
  );
};

