import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface CampusItem {
  code: string;
  name: string;
  city: string;
  description: string;
}

const CAMPUSES: CampusItem[] = [
  { code: 'HN', name: 'Phân hiệu Hà Nội', city: 'Hà Nội', description: 'Khu Giáo dục và Đào tạo - Khu Công nghệ cao Hòa Lạc' },
  { code: 'HCM', name: 'Phân hiệu TP. Hồ Chí Minh', city: 'TP.HCM', description: 'Đường D1, Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức' },
  { code: 'DN', name: 'Phân hiệu Đà Nẵng', city: 'Đà Nẵng', description: 'Khu đô thị FPT City, P. Hòa Hải, Q. Ngũ Hành Sơn' },
  { code: 'CT', name: 'Phân hiệu Cần Thơ', city: 'Cần Thơ', description: 'Số 600 đường Nguyễn Văn Cừ (nối dài), P. An Bình, Q. Ninh Kiều' },
  { code: 'QN', name: 'Phân hiệu Quy Nhơn', city: 'Bình Định', description: 'Khu đô thị An Phú Thịnh, P. Nhơn Bình, TP. Quy Nhơn' },
];

export const CampusSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedCampus, setSelectedCampus] = useState<string>(() => {
    return localStorage.getItem('fhub_selected_campus') || 'HN';
  });

  const handleConfirmCampus = () => {
    localStorage.setItem('fhub_selected_campus', selectedCampus);
    navigate('/auth-options');
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#0076D1] text-xs font-bold mx-auto">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('auth.campusStep', 'Bước 1: Chọn Cơ Sở Đào Tạo')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('auth.campusTitle', 'Campus Selection')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {t('auth.campusSubtitle', 'Vui lòng chọn cơ sở đào tạo của bạn để hệ thống tối ưu hóa dữ liệu môn học và thông báo học vụ tương ứng.')}
          </p>
        </div>

        {/* Campus Options List */}
        <div className="space-y-2.5">
          {CAMPUSES.map((c) => {
            const isSelected = selectedCampus === c.code;
            return (
              <div
                key={c.code}
                onClick={() => setSelectedCampus(c.code)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#0076D1] bg-blue-50/40 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{c.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {c.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                </div>
                <div className="shrink-0 pl-3">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-[#0076D1]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons Matching Diagram */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/landing')}
            className="w-full sm:w-1/3 py-3 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('auth.back', 'Back')}</span>
          </button>
          <button
            type="button"
            onClick={handleConfirmCampus}
            className="w-full sm:w-2/3 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('auth.confirmCampus', 'Confirm Campus')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
