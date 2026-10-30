import { GoogleSignInButton } from '../../components/common/GoogleSignInButton';
import { useLanguage } from '../../context/LanguageContext';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api/adminApi';
import { validateFptEmail } from '../../utils/fptEmailValidator';
import { User } from '../../types';

export const FPTSSOPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const handleGoogleSuccess = async (idToken: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Validate email from JWT payload
    try {
      const payloadBase64 = idToken.split('.')[1];
      if (payloadBase64) {
        const payloadJson = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        const googleEmail = (payloadJson.email || '').trim().toLowerCase();
        if (googleEmail) {
          if (!googleEmail.endsWith('@fpt.edu.vn')) {
            setErrorMessage(t("Chỉ tài khoản Google có đuôi email @fpt.edu.vn mới được phép đăng nhập hoặc đăng ký qua Google. (Email hiện tại: {p0})", undefined, { p0: googleEmail }));
            setIsLoading(false);
            return;
          }
        }
      }
    } catch {
      // Proceed gracefully
    }

    try {
      const result = await authApi.googleLogin(idToken);
      if (result.accessToken) {
        localStorage.setItem('fhub_token', result.accessToken);
      }
      if (result.refreshToken) {
        localStorage.setItem('fhub_refresh_token', result.refreshToken);
      }
      const roles = result.user?.roles || [];
      let mappedRole: User['role'] = 'Student';
      if (roles.includes('Admin')) mappedRole = 'Admin';
      else if (roles.includes('CommunityModerator') || roles.includes('Moderator')) mappedRole = 'Community Moderator';
      else if (roles.includes('Staff')) mappedRole = 'Staff';
      else if (roles.includes('SchoolRepresentative')) mappedRole = 'School Representative';
      else if (roles.includes('Alumni')) mappedRole = 'Alumni';

      const userObj: User = {
        id: String(result.user?.userId || `u-${Date.now()}`),
        email: result.user?.email || '',
        fullName: result.user?.fullName || 'FPT K19 Student',
        studentId: result.user?.studentCode || '',
        role: mappedRole,
        campus: (result.user?.campusCode as any) || 'HN',
        avatarUrl: result.user?.avatarUrl || '',
        karma: 0,
        status: 'ACTIVE',
        badges: [],
      };
      login(userObj, result.accessToken, result.refreshToken);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t("Xác thực Google SSO không thành công.");
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0076D1] font-black text-xl flex items-center justify-center mx-auto shadow-md border border-blue-200">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t("FPT University Google SSO")}</h1>
            <p className="text-xs text-slate-500 mt-1">
              {t("Cổng Đăng Nhập Xác Thực Google Đại Học FPT")}</p>
          </div>
        </div>

        {/* Informational Guidance Box */}
        <div className="bg-orange-50/60 border border-orange-200/80 rounded-xl p-4 text-xs text-orange-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#F26522]">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{t("Chính sách tài khoản sinh viên K19 trở đi:")}</span>
          </div>
          <p className="leading-relaxed text-slate-700">
            {t("Từ khóa K19, sinh viên đăng nhập hệ thống thông qua hòm thư Gmail đã đăng ký với nhà trường theo định dạng chuẩn:")}<br />
            <strong className="font-mono text-slate-900">{t("TanLT.CE190370@gmail.com")}</strong>
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {t(errorMessage)}
          </div>
        )}

        {/* Buttons Matching Diagram */}
        <div className="space-y-3 pt-2">
          <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={isLoading} />

          <button
            type="button"
            onClick={() => navigate('/landing')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("Back")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
