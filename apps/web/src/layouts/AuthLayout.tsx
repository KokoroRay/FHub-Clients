import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex flex-col items-center gap-2 mb-3 group">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-md flex items-center justify-center font-black text-2xl group-hover:scale-105 transition-transform">
            F
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900">
            FHub
          </span>
        </Link>
        <p className="text-xs text-slate-500 font-medium">
          Mạng lưới Học thuật & Chia sẻ Tri thức Sinh viên FPT University
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 sm:rounded-2xl sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
