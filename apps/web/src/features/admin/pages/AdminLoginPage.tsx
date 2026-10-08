import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../../../services/api/adminApi';
import { setSubdomainMode } from '../../../utils/subdomain';
import { User } from '../../../types';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('admin@fhub.com.vn');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2FA state
  const [is2FaStep, setIs2FaStep] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email quản trị viên và Mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authApi.login(email.trim(), password);

      if (result.requiresTwoFactor && result.twoFactorToken) {
        setIs2FaStep(true);
        setTwoFactorToken(result.twoFactorToken);
        setIsLoading(false);
        return;
      }

      completeAdminLogin(result);
    } catch (err: any) {
      console.warn('API login failed:', err);
      setErrorMessage(err.message || 'Email hoặc mật khẩu quản trị viên không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) {
      setErrorMessage('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authApi.verify2FA(twoFactorToken, twoFactorCode.trim());
      completeAdminLogin(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Mã xác thực 2FA không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeAdminLogin = (result: any) => {
    if (result.accessToken) {
      localStorage.setItem('fhub_token', result.accessToken);
    }
    const roles: string[] = result.user?.roles || [];
    let mappedRole: User['role'] = 'Admin';
    let defaultTitle = 'System Administrator';

    if (roles.includes('CommunityModerator') || roles.includes('Moderator')) {
      mappedRole = 'Community Moderator';
      defaultTitle = 'Community Moderator';
    } else if (roles.includes('SchoolRepresentative')) {
      mappedRole = 'School Representative';
      defaultTitle = 'School Representative';
    } else if (roles.includes('Staff')) {
      mappedRole = 'Staff';
      defaultTitle = 'Staff Member';
    }

    const userObj: User = {
      id: String(result.user?.userId || '1'),
      fullName: result.user?.fullName || defaultTitle,
      email: result.user?.email || email,
      role: mappedRole,
      campus: 'HL',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      karma: 9999,
      status: 'ACTIVE',
      bio: `FHub ${defaultTitle}`,
      badges: []
    };
    login(userObj, result.accessToken);

    const redirectPath = searchParams.get('redirect') || '/';
    navigate(redirectPath, { replace: true });
  };

  const setPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('Admin@123456');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col justify-between font-sans">
      {/* Simple Top Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-2xs">
            <img
              src="/fhub.jpg"
              alt="FHub Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 tracking-tight">FHub Portal</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
              Admin Center
            </span>
          </div>
        </div>

        <button
          onClick={() => setSubdomainMode('main')}
          className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về Cổng Sinh Viên</span>
        </button>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 shadow-sm space-y-6">
          {/* Header Title & Subtitle */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 mx-auto flex items-center justify-center shadow-2xs">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Đăng nhập Quản trị
            </h1>
            <p className="text-xs text-slate-500">
              Dành riêng cho Quản trị viên & Cán bộ Nhà trường
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          {!is2FaStep ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Quản trị
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@fhub.com.vn"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <span className="text-[11px] text-slate-400">Bảo mật SSL 256-bit</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* 2FA Step Form */
            <form onSubmit={handle2FaSubmit} className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 leading-relaxed">
                Tài khoản yêu cầu xác thực 2 lớp (2FA). Vui lòng nhập mã OTP 6 số từ ứng dụng Authenticator của bạn.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mã xác thực 2FA (OTP)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-center text-lg tracking-widest text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIs2FaStep(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Xác nhận</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Quick Preset Selector for Easy Testing */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="flex items-center gap-1 font-medium text-slate-500">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Tài khoản mẫu:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreset('admin@fhub.com.vn')}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer text-[11px] ${
                  email === 'admin@fhub.com.vn'
                    ? 'border-blue-300 bg-blue-50/50 text-blue-700 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-semibold text-slate-800">Admin Thường</div>
                <div className="text-[10px] text-slate-400 truncate">admin@fhub.com.vn</div>
              </button>
              <button
                type="button"
                onClick={() => setPreset('admin2fa@fhub.com.vn')}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer text-[11px] ${
                  email === 'admin2fa@fhub.com.vn'
                    ? 'border-blue-300 bg-blue-50/50 text-blue-700 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-semibold text-slate-800">Admin + 2FA</div>
                <div className="text-[10px] text-slate-400 truncate">admin2fa@fhub.com.vn</div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Clean Footer */}
      <footer className="w-full px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white">
        © 2026 FHub Platform • Đại học FPT
      </footer>
    </div>
  );
};
