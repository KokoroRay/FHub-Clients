import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/navigation/Header';
import { LeftSidebar } from '../components/navigation/LeftSidebar';
import { RightSidebar } from '../components/navigation/RightSidebar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9fd] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#cfe1fe] selection:text-[#005da7]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex gap-6">
        <LeftSidebar />
        <main className="flex-1 min-w-0 pb-12">
          <Outlet />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};
