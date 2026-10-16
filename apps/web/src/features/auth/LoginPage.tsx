import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCurrentUser } from '../../services/mockData';
import { authApi } from '../../services/api/adminApi';
import { User } from '../../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
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
      setErrorMessage('Vui lòng nhập email trường hoặc mã sinh viên.');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự.');
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
      const isAlumni = roles.includes('Alumni');
      const userObj: User = {
        id: String(result.user?.userId || `u-${Date.now()}`),
        email: result.user?.email || email,
        fullName: result.user?.fullName || email.split('@')[0],
        studentId: result.user?.studentCode || 'SE170001',
        role: isAlumni ? 'Alumni' : 'Student',
        campus: (result.user?.campusCode as any) || 'HL',
        avatarUrl: result.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        karma: 100,
        status: 'ACTIVE',
        badges: [],
      };
      login(userObj, result.accessToken, result.refreshToken);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin xác thực.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSSO = () => {
    setErrorMessage('Cổng xác thực tập trung FPT Edu Google SSO đang trong quá trình đồng bộ máy chủ SSO. Vui lòng đăng nhập bằng Email và Mật khẩu.');
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
                <img src="/fhub-remove-background.png" alt="FHub Logo" className="w-7 h-7 object-contain" />
                <span className="font-extrabold text-sm tracking-tight text-slate-800">
                  FHub <span className="text-[10px] px-1 py-0.2 bg-blue-50 text-[#0076D1] rounded font-bold border border-blue-100">EDU</span>
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your university credentials to access your FHub workspace.
              </p>
            </div>

            {/* Social SSO Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={handleGoogleSSO}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google SSO</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleSSO}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5">
                  <div className="bg-[#f25022]" />
                  <div className="bg-[#7fba00]" />
                  <div className="bg-[#00a4ef]" />
                  <div className="bg-[#ffb900]" />
                </div>
                <span>Microsoft 365</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                OR SIGN IN WITH EMAIL
              </span>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  University Email / Student ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student.name@fpt.edu.vn"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#0076D1] hover:underline"
                  >
                    Forgot password?
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
                  <span className="text-slate-600 font-medium">Remember me</span>
                </label>

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>256-bit TLS</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'SIGNING IN...' : 'SIGN IN'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="pt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#0076D1] hover:underline">
              Sign Up
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
              Academic Portal
            </span>
          </div>

          {/* Main Greeting Center */}
          <div className="relative space-y-4 my-auto py-6">
            <h3 className="text-3xl font-black text-white tracking-tight">
              Hello, Friend!
            </h3>
            <p className="text-xs text-blue-100/90 leading-relaxed max-w-xs">
              Enter your personal details and start your journey with FHub academic network.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white border-2 border-white hover:bg-white hover:text-[#0076D1] transition-all shadow-md"
              >
                <span>SIGN UP</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Subtle mini highlights footer */}
          <div className="relative pt-6 border-t border-white/15 grid grid-cols-2 gap-3 text-left">
            <div>
              <span className="block text-xs font-extrabold text-white">4+ Campuses</span>
              <span className="text-[10px] text-blue-200">Active FPT Community</span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-white">10,000+ Students</span>
              <span className="text-[10px] text-blue-200">Collaborating Daily</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Brand Footer (Figma #72:259) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <span>FPT University</span>
          <span>•</span>
          <span>FHub Academic Network</span>
          <span>•</span>
          <span>Spring 2025</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/tickets" className="hover:text-slate-600 transition-colors">
            Support Desk
          </Link>
          <Link to="/settings" className="hover:text-slate-600 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};
