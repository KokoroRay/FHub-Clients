import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  GitBranch,
  Star,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api/adminApi';
import { validateFptEmail } from '../../utils/fptEmailValidator';
import { User } from '../../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Login form states (Facebook-style direct authentication)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập email trường hoặc mã sinh viên.');
      return;
    }

    if (email.trim().includes('@')) {
      const emailCheck = validateFptEmail(email.trim());
      if (!emailCheck.isValid) {
        setErrorMessage(emailCheck.error || 'Email không đúng quy chuẩn của trường.');
        return;
      }
    }

    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authApi.login(email.trim(), password);
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

      if (mappedRole === 'Admin') navigate('/admin-console');
      else if (mappedRole === 'Community Moderator') navigate('/admin-console/moderation');
      else navigate('/');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin xác thực.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header - Public Explorations Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img src="/fhub-remove-background.png" alt="FHub Logo" className="w-8 h-8 object-contain" />
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-xl tracking-tight text-[#0076D1]">fhub</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-blue-50 text-[#0076D1] rounded border border-blue-200 uppercase">
              Academic
            </span>
          </div>
        </div>

        {/* Public Resources Quick Access (UC02) */}
        <nav className="flex items-center gap-3 sm:gap-6 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => navigate('/tech-blog')}
            className="hover:text-[#0076D1] transition-colors cursor-pointer hidden sm:inline-flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Read Tech Blog</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/workflows')}
            className="hover:text-[#0076D1] transition-colors cursor-pointer hidden sm:inline-flex items-center gap-1"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Preview Workflows</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/course-ratings')}
            className="hover:text-[#0076D1] transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Check Course Ratings</span>
          </button>
        </nav>
      </header>

      {/* Main Container - Facebook-style 2-Column Split */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-16 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* Left Column: Branding & Value Proposition */}
        <div className="flex-1 space-y-6 text-left max-w-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0076D1] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mạng Xã Hội Học Thuật Chính Thức • Đại học FPT</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Khám phá <br />
              những điều <span className="text-[#0076D1]">bạn yêu</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              FHub giúp bạn kết nối và chia sẻ tri thức với sinh viên, cựu sinh viên và giảng viên tại 5 phân hiệu FPT University.
            </p>
          </div>

          {/* Quick Highlights */}
          <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-semibold">Định danh K18 @fpt.edu.vn</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold">Gmail K19+ chuẩn trường</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="font-semibold">Kho tài liệu 5 phân hiệu</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-semibold">Bảo chứng cựu sinh viên</span>
            </div>
          </div>
        </div>

        {/* Right Column: Facebook-style Direct Authentication Card */}
        <div className="w-full max-w-[420px] flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-6 sm:p-8 space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Đăng nhập vào FHub</h2>
              <p className="text-xs text-slate-500">Dùng tài khoản trường hoặc email sinh viên FPT</p>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-600 leading-snug">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Email / MSSV Input */}
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Email hoặc mã số sinh viên"
                    className="w-full pl-3.5 pr-3.5 py-3 rounded-xl text-sm bg-white border border-slate-300 focus:border-[#0076D1] focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Mật khẩu"
                    className="w-full pl-3.5 pr-10 py-3 rounded-xl text-sm bg-white border border-slate-300 focus:border-[#0076D1] focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                    autoComplete="current-password"
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

              {/* Submit Button: Click "Login" */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-base font-extrabold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
              </button>

              {/* Forgot Password Link: Click "Forgot password" */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-semibold text-[#0076D1] hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase">Hoặc</span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* Register Account Button: Click "Register Account" */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/email-reg')}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-[#0076D1] bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
                >
                  Tạo tài khoản mới
                </button>
              </div>

              {/* SSO Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/auth-options')}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3.5 h-3.5" />
                  <span>Đăng nhập với Google</span>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            <span>Dành cho cán bộ, giảng viên và sinh viên FPT University</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2025 FHub • Nền tảng mạng xã hội học thuật Đại học FPT</p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <button type="button" onClick={() => navigate('/tech-blog')} className="hover:underline">
              Tech Blog
            </button>
            <button type="button" onClick={() => navigate('/workflows')} className="hover:underline">
              Workflows
            </button>
            <button type="button" onClick={() => navigate('/course-ratings')} className="hover:underline">
              Course Ratings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
