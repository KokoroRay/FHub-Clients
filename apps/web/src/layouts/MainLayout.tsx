import React, { Suspense, useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/navigation/Header';
import { LeftSidebar } from '../components/navigation/LeftSidebar';
import { RightSidebar } from '../components/navigation/RightSidebar';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { LoadingFallback } from '../components/common/LoadingFallback';
import { MessengerPopupToast } from '../components/common/MessengerPopupToast';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  // In Figma #86:2, only Global Feed (/) has the 3-column layout with RightSidebar
  const showRightSidebar = location.pathname === '/';
  const isMessagesPage = location.pathname.startsWith('/messages');

  // Sidebar Pin & Hover State for CSS Variable synchronization
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('fhub_sidebar_pinned') === 'true';
  });
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);
  const isExpanded = isSidebarPinned || isSidebarHovered;

  const togglePin = useCallback(() => {
    setIsSidebarPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('fhub_sidebar_pinned', String(next));
      } catch {}
      return next;
    });
  }, []);

  return (
    <div
      className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900"
      style={
        {
          '--header-height': '64px',
          '--sidebar-width': isExpanded ? '230px' : '64px',
        } as React.CSSProperties
      }
    >
      <Header />
      <div className="pt-[var(--header-height,64px)] flex-1 w-full grid grid-cols-1 lg:grid-cols-[var(--sidebar-width,64px)_minmax(0,1fr)] transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        {/* Left Column: Sidebar Slot */}
        <div className="hidden lg:block relative">
          <LeftSidebar
            isPinned={isSidebarPinned}
            isExpanded={isExpanded}
            onTogglePin={togglePin}
            onHoverChange={setIsSidebarHovered}
          />
        </div>

        {/* Right Column: Main Content Area */}
        <div className="min-w-0 w-full flex flex-col">
          <div
            className={`flex-1 w-full flex gap-6 items-start ${
              isMessagesPage
                ? 'py-4 pl-4 sm:pl-6 pr-4 sm:pr-6'
                : 'max-w-[1280px] mx-auto px-4 sm:px-6 py-6'
            }`}
            style={
              isMessagesPage
                ? {
                    paddingLeft: 'max(1.5rem, calc((100% - 1280px) / 2 + 1.5rem))',
                    paddingRight: '1.5rem',
                  }
                : undefined
            }
          >
            <main className={`flex-1 min-w-0 w-full ${isMessagesPage ? 'pb-2' : 'pb-16'}`}>
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <Outlet />
                </Suspense>
              </ErrorBoundary>
            </main>
            {showRightSidebar && <RightSidebar />}
          </div>
        </div>
      </div>
      <MessengerPopupToast />
    </div>
  );
};
