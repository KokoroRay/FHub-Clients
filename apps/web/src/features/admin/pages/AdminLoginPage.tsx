import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Server,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  SlidersHorizontal,
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
      // Call actual Identity Service login API
      const result = await authApi.login(email.trim(), password);

      if (result.requiresTwoFactor && result.twoFactorToken) {
        setIs2FaStep(true);
        setTwoFactorToken(result.twoFactorToken);
        setIsLoading(false);
        return;
      }

      // Successful login
      completeAdminLogin(result);
    } catch (err: any) {
      console.warn('API login failed:', err);
      setErrorMessage(err.message || 'Email hoặc mật khẩu quản trị viên không chính xác. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) {
      setErrorMessage('Vui lòng nhập mã xác thực OTP 6 chữ số.');
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
    const userObj: User = {
      id: String(result.user?.userId || '1'),
      fullName: 'System Administrator',
      email: result.user?.email || email,
      role: 'Admin',
      campus: 'HL',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      karma: 9999,
      status: 'ACTIVE',
      bio: 'FHub Central Operations Administrator',
      badges: []
    };
    login(userObj, result.accessToken);

    const redirectPath = searchParams.get('redirect') || '/';
    navigate(redirectPath, { replace: true });
  };

  const setPreset = (type: 'admin' | 'admin2fa') => {
    if (type === 'admin') {
      setEmail('admin@fhub.com.vn');
      setPassword('Admin@123456');
    } else {
      setEmail('admin2fa@fhub.com.vn');
      setPassword('Admin@123456');
    }
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-950 via-[#002347] to-[#004a87] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Decorative Grid & Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,149,255,0.25),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full px-6 py-4 flex items-center justify-between relative z-10 border-b border-white/10 backdrop-blur-md bg-slate-950/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md border border-white/20 flex items-center justify-center p-0.5 shrink-0">
            <img
              src="/fhub.jpg"
              alt="FHub Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white">FHub Operations Console</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                ADMIN SUBDOMAIN
              </span>
            </div>
            <p className="text-[11px] text-sky-200/70">5 Campus Partition Academic Governance</p>
          </div>
        </div>

        <button
          onClick={() => setSubdomainMode('main')}
          className="text-xs font-semibold text-sky-200/80 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-all border border-white/10 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Về Cổng Sinh Viên</span>
        </button>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header Info */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-1">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Đăng Nhập Quản Trị Viên
            </h1>
            <p className="text-xs text-sky-100/70 max-w-xs mx-auto">
              Hệ thống xác thực tập trung SEP Core v2.4 bảo mật theo chuẩn ISO/IEC 27001
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-xs text-rose-200 flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preset Buttons for Quick Testing */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tài khoản mẫu Backend (Seed Data):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreset('admin')}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-sky-200 text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-white">Root Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@fhub.com.vn</div>
              </button>
              <button
                type="button"
                onClick={() => setPreset('admin2fa')}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-sky-200 text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-white">Admin + 2FA</div>
                <div className="text-[10px] text-slate-400 truncate">admin2fa@fhub.com.vn</div>
              </button>
            </div>
          </div>

          {/* Form */}
          {!is2FaStep ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sky-100 mb-1.5">
                  Email Quản Trị
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
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-100 mb-1.5">
                  Mật Khẩu Hệ Thống
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
                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-sky-200/70 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-0" />
                  <span>Duy trì phiên đăng nhập</span>
                </label>
                <span className="text-slate-400">256-Bit TLS Encrypted</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực với Identity Service...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng Nhập Bảng Điều Hành</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* 2FA Step Form */
            <form onSubmit={handle2FaSubmit} className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-blue-500/10 border border-blue-400/20 rounded-xl text-xs text-sky-200">
                Tài khoản này yêu cầu xác thực 2 lớp (2FA). Vui lòng nhập mã OTP 6 số từ Google Authenticator hoặc ứng dụng TOTP của bạn.
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-100 mb-1.5">
                  Mã Xác Thực 2FA (OTP)
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
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-center text-lg tracking-widest text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIs2FaStep(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Xác Nhận 2FA</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer Features */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-3 text-center text-[10px] text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>7 Microservices</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>5 Campuses</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>ISO 27001 Log</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full px-6 py-3 text-center text-[11px] text-sky-200/50 border-t border-white/10 relative z-10 backdrop-blur-xs bg-slate-950/20">
        © 2026 FHub Platform • FPT University Student Educational Ecosystem • SEP Core Version 2.4
      </footer>
    </div>
  );
};
