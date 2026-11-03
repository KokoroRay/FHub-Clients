import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] w-full flex flex-col items-center justify-center p-8 gap-3 text-slate-500">
    <Loader2 className="w-8 h-8 animate-spin text-[#0076D1]" />
    <span className="text-xs font-medium tracking-wide">Đang tải nội dung...</span>
  </div>
);
