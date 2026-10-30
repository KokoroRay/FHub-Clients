import { useLanguage } from '../../context/LanguageContext';
import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, HelpCircle, ArrowLeft, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-lg w-full p-8 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0076D1] border border-blue-100 flex items-center justify-center mx-auto shadow-2xs font-mono text-2xl font-black">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#181C22]">
            {t("Không tìm thấy trang")}</h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {t("Đường dẫn bạn yêu cầu không tồn tại hoặc đã được thay đổi cấu trúc trong hệ thống FHub.")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <Link
            to="/"
            className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200/80 hover:border-blue-200 transition-all group flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0076D1] shrink-0 group-hover:bg-[#0076D1] group-hover:text-white transition-colors">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#0076D1] transition-colors">{t("Global Feed")}</h4>
              <p className="text-[10px] text-slate-400">{t("Xem bảng tin học thuật")}</p>
            </div>
          </Link>

          <Link
            to="/courses"
            className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200/80 hover:border-blue-200 transition-all group flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shrink-0 group-hover:bg-[#0076D1] group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#0076D1] transition-colors">{t("Course Hub")}</h4>
              <p className="text-[10px] text-slate-400">{t("Tra cứu ngân hàng môn học")}</p>
            </div>
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0076D1] font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("Quay lại trang trước")}</span>
          </Link>

          <Link
            to="/tickets"
            className="inline-flex items-center gap-1 text-[#0076D1] font-semibold hover:underline"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t("Báo cáo sự cố liên kết")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
