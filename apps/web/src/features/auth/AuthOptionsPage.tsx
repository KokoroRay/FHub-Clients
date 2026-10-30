import { GoogleSignInButton } from '../../components/common/GoogleSignInButton';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authApi } from '../../services/api/adminApi';
import { validateFptEmail } from '../../utils/fptEmailValidator';
import { User } from '../../types';

export const AuthOptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const campus = localStorage.getItem('fhub_selected_campus') || 'HN';
    setSelectedCampus(campus);
  }, []);


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
        fullName: result.user?.fullName || 'FPT Student',
        studentId: result.user?.studentCode || '',
        role: mappedRole,
        campus: (result.user?.campusCode as any) || (selectedCampus as any) || 'HN',
        avatarUrl: result.user?.avatarUrl || '',
        karma: 0,
        status: 'ACTIVE',
        badges: [],
      };
      login(userObj, result.accessToken, result.refreshToken);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t("Đăng nhập Google không thành công.");
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#0076D1] text-xs font-bold mx-auto">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('auth.optionsStep', 'Bước 2: Phương Thức Xác Thực')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('auth.optionsTitle', 'Authentication Options')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {t('auth.optionsSubtitle', 'Lựa chọn phương thức xác thực tài khoản phù hợp tại Đại học FPT.')}
          </p>
          {selectedCampus && (
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-lg font-semibold">
              <MapPin className="w-3 h-3 text-[#0076D1]" />
              <span>{t('auth.selectedCampus', 'Cơ sở đã chọn:')} <strong>{selectedCampus}</strong></span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {t(errorMessage)}
          </div>
        )}

        {/* Main Authentication Buttons */}
        <div className="space-y-3.5">
          {/* Button 1: Continue with Google SSO */}
          <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={isLoading} />

          {/* Button 2: Continue with Email */}
          <button
            type="button"
            onClick={() => navigate('/email-auth')}
            className="w-full p-4 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/70 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3.5 text-left">
              <Mail className="w-5 h-5 text-slate-600 shrink-0" />
              <div>
                <span className="block font-black text-sm text-slate-800 group-hover:text-slate-900 transition-colors">
                  {t('auth.continueEmail', 'Continue with Email')}
                </span>
                <span className="text-[11px] text-slate-500">
                  {t('auth.emailDesc', 'Đăng nhập bằng Email và mật khẩu riêng hệ thống')}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {t("Tiếp tục &rarr;")}</span>
          </button>
        </div>

        {/* Back Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate('/campus-selection')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('auth.back', 'Back')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
