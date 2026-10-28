import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/navigation/Header';
import { LeftSidebar } from '../components/navigation/LeftSidebar';
import { RightSidebar } from '../components/navigation/RightSidebar';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  // In Figma #86:2, only Global Feed (/) has the 3-column layout with RightSidebar
  const showRightSidebar = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex gap-6 items-start">
        <LeftSidebar />
        <main className="flex-1 min-w-0 pb-16 w-full">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        {showRightSidebar && <RightSidebar />}
      </div>
    </div>
  );
};

