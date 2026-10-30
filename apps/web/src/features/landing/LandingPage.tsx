import { GoogleSignInButton } from '../../components/common/GoogleSignInButton';
import { useLanguage } from '../../context/LanguageContext';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building2,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api/adminApi';
import { validateFptEmail } from '../../utils/fptEmailValidator';
import { User } from '../../types';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const handleLoginSuccess = (result: any, userEmail: string) => {
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
      email: result.user?.email || userEmail,
      fullName: result.user?.fullName || userEmail.split('@')[0],
      studentId: result.user?.studentCode || '',
      role: mappedRole,
      campus: (result.user?.campusCode as any) || 'HL',
      avatarUrl: result.user?.avatarUrl || '',
      karma: 0,
      status: 'ACTIVE',
      badges: [],
    };

    login(userObj, result.accessToken, result.refreshToken);

    if (mappedRole === 'Admin') navigate('/admin-console');
    else if (mappedRole === 'Community Moderator') navigate('/admin-console/moderation');
    else navigate('/');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage(t("Vui lòng nhập email trường hoặc mã sinh viên."));
      return;
    }

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

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authApi.login(email.trim(), password);
      handleLoginSuccess(result, email.trim());
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        t("Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin xác thực.");
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setIsLoading(true);
    setErrorMessage(null);

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
      handleLoginSuccess(result, result.user?.email || 'google.student@fpt.edu.vn');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || t("Đăng nhập Google SSO không thành công."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-900 relative">
      {/* Radial gradient background decoration from Figma #74:532 / #72:156 */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(64, 96, 137, 0.14) 0%, rgba(248, 249, 255, 0) 70%)',
        }}
      />

      {/* 1. Header Bar (Figma #72:282) */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/landing" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
            <img src="/fhub-remove-background.png" alt={t("FHub Logo")} className="w-full h-full object-contain" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                {t("FHub")}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider bg-blue-50 text-[#0076D1] border border-blue-200 uppercase">
                {t("COMMUNITY")}</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              {t("Academic Social Network")}</p>
          </div>
        </Link>

        {/* Top Right Links & Status (Figma #72:294) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-white/90 text-slate-600 border border-slate-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t("Mekong Delta & Campuses Connected")}</span>
          </div>

          <Link
            to="/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0076D1] transition-colors py-1.5 px-3 rounded-xl bg-white/80 border border-slate-200/80 hover:border-blue-200 shadow-2xs"
          >
            <LifeBuoy className="w-4 h-4 text-slate-400 group-hover:text-[#0076D1]" />
            <span>{t("Support")}</span>
          </Link>
        </div>
      </header>

      {/* 2. Main Split Container (Figma #72:158) */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 my-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          
          {/* LEFT COLUMN: Sign In Form (7 cols) (Figma #72:161) */}
          <div className="p-8 sm:p-10 md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Form Header (Figma #72:162) */}
              <div className="mb-6 space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {t("Welcome Back")}</h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t("Enter your university credentials to access your FHub workspace.")}</p>
              </div>

              {/* Social SSO Buttons (Figma #72:167) */}
              <div className="mb-5">
                {/* 1. Login with Google Button -> Google Identity */}
                <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={isLoading} />
              </div>

              {/* Horizontal Divider (Figma #72:181) */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative px-3 bg-white text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {t("OR SIGN IN WITH EMAIL")}</span>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-600 leading-snug">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t(errorMessage)}</span>
                </div>
              )}

              {/* Sign In Form (Figma #72:185) */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {/* University Email / MSSV */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t("University Email / Student ID")}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder={t("student.name@fpt.edu.vn")}
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password with Forgot Password link */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {t("Password")}</label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[#0076D1] hover:underline"
                    >
                      {t("Forgot password?")}</Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me & 256-bit TLS (Figma #72:208) */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0076D1] border-slate-300 focus:ring-[#0076D1]"
                    />
                    <span className="text-slate-600 font-medium">{t("Remember me")}</span>
                  </label>

                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{t("256-bit TLS")}</span>
                  </div>
                </div>

                {/* Submit Button (Figma #72:218) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 tracking-wider uppercase"
                >
                  <span>{isLoading ? t("SIGNING IN...") : t("SIGN IN")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Bottom Form Link: Register Link (Figma #72:224) */}
            <div className="pt-6 text-center text-xs text-slate-500">
              {t("Don't have an account?")}{' '}
              <Link to="/register" className="font-bold text-[#0076D1] hover:underline">
                {t("Register")}</Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Overlay (5 cols) (Figma #72:230) */}
          <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#0076D1] to-[#005DA7] p-8 text-white flex-col justify-between relative overflow-hidden">
            {/* Subtle background circle decoration */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none" />

            {/* Top badge */}
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 text-white backdrop-blur-sm border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                {t("FHub Academic Ecosystem")}</span>
            </div>

            {/* Main Greeting Center */}
            <div className="relative space-y-4 my-auto py-6">
              <h2 className="text-3xl font-black text-white tracking-tight">
                {t("Hello, Friend!")}</h2>
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

            {/* Subtle mini highlights footer inside overlay (Figma #72:250) */}
            <div className="relative pt-6 border-t border-white/15 grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="block text-xs font-extrabold text-white">12,450+</span>
                <span className="text-[10px] text-blue-200">{t("Active Students")}</span>
              </div>
              <div>
                <span className="block text-xs font-extrabold text-white">{t("186 Nodes")}</span>
                <span className="text-[10px] text-blue-200">{t("Curriculum Syllabi")}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Bottom Brand Footer (Figma #72:259) */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 border-t border-slate-200/60">
        <div className="flex items-center gap-2">
          <span>{t("FHub Academic Network")}</span>
          <span>•</span>
          <span>{t("FPT University Ecosystem")}</span>
          <span>•</span>
          <span className="font-mono text-slate-400">{t("v2.4 Core")}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <Link to="/tech-blog" className="hover:text-slate-800 transition-colors">
            {t("Tech Blog")}</Link>
          <Link to="/workflows" className="hover:text-slate-800 transition-colors">
            {t("Workflows")}</Link>
          <Link to="/course-ratings" className="hover:text-slate-800 transition-colors">
            {t("Course Ratings")}</Link>
          <Link to="/settings" className="hover:text-slate-800 transition-colors">
            {t("Privacy Policy")}</Link>
          <Link to="/tickets" className="hover:text-slate-800 transition-colors">
            {t("Support Desk")}</Link>
        </div>
      </footer>
    </div>
  );
};
