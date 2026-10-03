import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/navigation/Header';
import { LeftSidebar } from '../components/navigation/LeftSidebar';
import { RightSidebar } from '../components/navigation/RightSidebar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex gap-6 items-start">
        <LeftSidebar />
        <main className="flex-1 min-w-0 pb-16">
          <Outlet />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};
