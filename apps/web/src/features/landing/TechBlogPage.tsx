import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Compass } from 'lucide-react';
import { ArticleListPage } from '../articles/ArticleListPage';

export const TechBlogPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner with Back to Landing */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/landing')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Landing</span>
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0076D1]" />
            <h1 className="font-black text-sm text-slate-900 tracking-tight">Tech Blog Articles</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/campus-selection')}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-xs cursor-pointer"
        >
          <span>Get Started</span>
        </button>
      </div>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <ArticleListPage />
      </div>
    </div>
  );
};
