import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api/adminApi';
import { validateFptEmail } from '../../utils/fptEmailValidator';
import { User } from '../../types';

export const FPTSSOPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const GOOGLE_CLIENT_ID = '286107558257-opd8v8nqnogitdmkvidvei0h691rpr15.apps.googleusercontent.com';

  const handleGoogleSuccess = async (idToken: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Validate email from JWT payload
    try {
      const payloadBase64 = idToken.split('.')[1];
      if (payloadBase64) {
        const payloadJson = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        const googleEmail = payloadJson.email || '';
        if (googleEmail) {
          const emailCheck = validateFptEmail(googleEmail);
          if (!emailCheck.isValid) {
            setErrorMessage(`Tài khoản Google (${googleEmail}) không hợp lệ: ${emailCheck.error}`);
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
      const msg = err.response?.data?.message || err.message || 'Xác thực FeID qua Google không thành công.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerGoogleSSO = () => {
    if (typeof (window as any).google === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleClient();
      };
      document.body.appendChild(script);
    } else {
      initGoogleClient();
    }
  };

  const initGoogleClient = () => {
    try {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res: any) => {
            if (res.credential) {
              handleGoogleSuccess(res.credential);
            }
          },
        });
        google.accounts.id.prompt();
      }
    } catch (e) {
      console.warn('Google accounts prompt error:', e);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F26522] to-[#D94F0F] text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
            FeID
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              FPT University SSO
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cổng Đăng Nhập Tập Trung Giáo Dục FPT (FeID Gateway)
            </p>
          </div>
        </div>

        {/* Informational Guidance Box */}
        <div className="bg-orange-50/60 border border-orange-200/80 rounded-xl p-4 text-xs text-orange-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#F26522]">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Chính sách tài khoản sinh viên K19 trở đi:</span>
          </div>
          <p className="leading-relaxed text-slate-700">
            Từ khóa K19, sinh viên đăng nhập hệ thống thông qua hòm thư Gmail đã đăng ký với nhà trường theo định dạng chuẩn:
            <br />
            <strong className="font-mono text-slate-900">TanLT.CE190370@gmail.com</strong>
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Buttons Matching Diagram */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={triggerGoogleSSO}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-[#F26522] hover:bg-[#D94F0F] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isLoading ? 'ĐANG XÁC THỰC...' : 'Login with Google Student Account'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/auth-options')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
