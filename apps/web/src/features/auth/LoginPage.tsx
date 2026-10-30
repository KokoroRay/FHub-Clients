import { GoogleSignInButton } from '../../components/common/GoogleSignInButton';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authApi } from '../../services/api/adminApi';
import { User } from '../../types';
import { validateFptEmail } from '../../utils/fptEmailValidator';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage(t("Vui lòng nhập email trường hoặc mã sinh viên."));
      return;
    }
    // Kiểm tra định dạng Email theo chính sách K18 / K19 của trường
    if (email.trim().includes('@')) {
      const emailCheck = validateFptEmail(email.trim());
      if (!emailCheck.isValid) {
        setErrorMessage(emailCheck.error || t("Email không đúng định dạng quy định của Trường Đại học FPT."));
        return;
      }
    }
    if (!password) {
      setErrorMessage(t("Vui lòng nhập mật khẩu."));
      return;
    }
    if (password.length < 6) {
      setErrorMessage(t("Mật khẩu phải chứa ít nhất 6 ký tự."));
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authApi.login(email.trim(), password);
      if (result.accessToken) {
        if (rememberMe) {
          localStorage.setItem('fhub_token', result.accessToken);
        } else {
          sessionStorage.setItem('fhub_token', result.accessToken);
        }
      }
      if (result.refreshToken) {
        if (rememberMe) {
          localStorage.setItem('fhub_refresh_token', result.refreshToken);
        } else {
          sessionStorage.setItem('fhub_refresh_token', result.refreshToken);
        }
      }
      const roles = result.user?.roles || [];
      let mappedRole: User['role'] = 'Student';
      if (roles.includes('Admin')) {
        mappedRole = 'Admin';
      } else if (roles.includes('CommunityModerator') || roles.includes('Moderator')) {
        mappedRole = 'Community Moderator';
      } else if (roles.includes('Staff')) {
        mappedRole = 'Staff';
      } else if (roles.includes('SchoolRepresentative')) {
        mappedRole = 'School Representative';
      } else if (roles.includes('Alumni')) {
        mappedRole = 'Alumni';
      }

      const userObj: User = {
        id: String(result.user?.userId || `u-${Date.now()}`),
        email: result.user?.email || email,
        fullName: result.user?.fullName || email.split('@')[0],
        studentId: result.user?.studentCode || '',
        role: mappedRole,
        campus: (result.user?.campusCode as any) || '',
        avatarUrl: result.user?.avatarUrl || '',
        karma: 0,
        status: 'ACTIVE',
        badges: [],
      };
      login(userObj, result.accessToken, result.refreshToken);

      if (mappedRole === 'Admin') {
        navigate('/admin-console');
      } else if (mappedRole === 'Community Moderator') {
        navigate('/admin-console/moderation');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t("Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin xác thực.");
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleSuccess = async (idToken: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Kiểm tra chính sách Email FPT từ ID Token phía Client
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
      // Bỏ qua nếu không parse được token client, để backend kiểm tra tiếp
    }

    try {
      const result = await authApi.googleLogin(idToken);
      if (result.accessToken) {
        if (rememberMe) {
          localStorage.setItem('fhub_token', result.accessToken);
        } else {
          sessionStorage.setItem('fhub_token', result.accessToken);
        }
      }
      if (result.refreshToken) {
        if (rememberMe) {
          localStorage.setItem('fhub_refresh_token', result.refreshToken);
        } else {
          sessionStorage.setItem('fhub_refresh_token', result.refreshToken);
        }
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
        fullName: result.user?.fullName || result.user?.email?.split('@')[0] || 'FPT Student',
        studentId: result.user?.studentCode || '',
        role: mappedRole,
        campus: (result.user?.campusCode as any) || '',
        avatarUrl: result.user?.avatarUrl || '',
        karma: 0,
        status: 'ACTIVE',
        badges: [],
      };
      login(userObj, result.accessToken, result.refreshToken);

      if (mappedRole === 'Admin') navigate('/admin-console');
      else if (mappedRole === 'Community Moderator') navigate('/admin-console/moderation');
      else navigate('/');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || t("Đăng nhập Google không thành công."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Outer Card Shell (Figma #72:159) */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Column: Form (7 cols) */}
        <div className="p-8 sm:p-10 md:col-span-7 flex flex-col justify-between">
          <div>
            {/* Form Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <img src="/fhub-remove-background.png" alt={t("FHub Logo")} className="w-7 h-7 object-contain" />
                <span className="font-extrabold text-sm tracking-tight text-slate-800">
                  {t("FHub")} <span className="text-[10px] px-1 py-0.2 bg-blue-50 text-[#0076D1] rounded font-bold border border-blue-100">{t("EDU")}</span>
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {t('auth.welcomeBack', 'Welcome Back')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('auth.signInSubtitle', 'Enter your university credentials to access your FHub workspace.')}
              </p>
            </div>

            {/* Social SSO Buttons */}
            <div className="grid grid-cols-1 gap-3 mb-5">
              <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={isLoading} />

              <button
                type="button"
                onClick={() => navigate('/fpt-sso')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5">
                  <div className="bg-[#f25022]" />
                  <div className="bg-[#7fba00]" />
                  <div className="bg-[#00a4ef]" />
                  <div className="bg-[#ffb900]" />
                </div>
                <span>{t("Microsoft 365")}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('auth.signInTitle', 'OR SIGN IN WITH EMAIL')}
              </span>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {t(errorMessage)}
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('auth.email', 'University Email / Student ID')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("student.name@fpt.edu.vn")}
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('auth.password', 'Password')}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#0076D1] hover:underline"
                  >
                    {t('auth.forgotPassword', 'Forgot password?')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & 256-bit TLS badge */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0076D1] border-slate-300 focus:ring-[#0076D1]"
                  />
                  <span className="text-slate-600 font-medium">{t('auth.rememberMe', 'Remember me')}</span>
                </label>

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{t("256-bit TLS")}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? t('common.loading', 'SIGNING IN...') : t('auth.signInBtn', 'SIGN IN')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="pt-6 text-center text-xs text-slate-500">
            {t('auth.noAccount', "Don't have an account?")}{' '}
            <Link to="/register" className="font-bold text-[#0076D1] hover:underline">
              {t('header.signUp', 'Sign Up')}
            </Link>
          </div>
        </div>

        {/* Right Column: Overlay (Figma #72:230) (5 cols) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#0076D1] to-[#005DA7] p-8 text-white flex-col justify-between relative overflow-hidden">
          {/* Subtle background circle decoration */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          {/* Top badge */}
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 text-white backdrop-blur-sm border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              {t("Academic Portal")}</span>
          </div>

          {/* Main Greeting Center */}
          <div className="relative space-y-4 my-auto py-6">
            <h3 className="text-3xl font-black text-white tracking-tight">
              {t("Hello, Friend!")}</h3>
            <p className="text-xs text-blue-100/90 leading-relaxed max-w-xs">
              {t("Enter your personal details and start your journey with FHub academic network.")}</p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white border-2 border-white hover:bg-white hover:text-[#0076D1] transition-all shadow-md"
              >
                <span>{t("SIGN UP")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Subtle mini highlights footer */}
          <div className="relative pt-6 border-t border-white/15 grid grid-cols-2 gap-3 text-left">
            <div>
              <span className="block text-xs font-extrabold text-white">{t("4+ Campuses")}</span>
              <span className="text-[10px] text-blue-200">{t("Active FPT Community")}</span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-white">{t("10,000+ Students")}</span>
              <span className="text-[10px] text-blue-200">{t("Collaborating Daily")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Brand Footer (Figma #72:259) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <span>{t("FPT University")}</span>
          <span>•</span>
          <span>{t("FHub Academic Network")}</span>
          <span>•</span>
          <span>{t("Spring 2025")}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/tickets" className="hover:text-slate-600 transition-colors">
            {t("Support Desk")}</Link>
          <Link to="/settings" className="hover:text-slate-600 transition-colors">
            {t("Privacy Policy")}</Link>
        </div>
      </div>
    </div>
  );
};
