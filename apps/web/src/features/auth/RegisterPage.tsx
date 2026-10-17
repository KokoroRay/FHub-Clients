import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCampuses, mockCurrentUser } from '../../services/mockData';
import { User } from '../../types';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [campus, setCampus] = useState('HCM');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Vui lòng đồng ý với điều khoản sử dụng FHub.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser: User = {
        ...mockCurrentUser,
        id: `u-${Date.now()}`,
        fullName,
        email,
        studentId: studentId.trim().toUpperCase() || 'SE180001',
        campus: campus as any,
        role: 'Student',
      };
      login(newUser);
      setIsLoading(false);
      navigate('/');
    }, 500);
  };

  return (
    <div className="w-full space-y-4">
      {/* Outer Card Shell (Figma #72:2) */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Column: Overlay (Figma #72:2 Left) (5 cols) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#0076D1] to-[#005DA7] p-8 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          {/* Top badge */}
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 text-white backdrop-blur-sm border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              Student Registration
            </span>
          </div>

          {/* Main Greeting Center */}
          <div className="relative space-y-4 my-auto py-6">
            <h3 className="text-3xl font-black text-white tracking-tight">
              Welcome Back!
            </h3>
            <p className="text-xs text-blue-100/90 leading-relaxed max-w-xs">
              To keep connected with your classmates and course mentors, please login with your personal credentials.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white border-2 border-white hover:bg-white hover:text-[#0076D1] transition-all shadow-md"
              >
                <span>SIGN IN</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Highlights Footer */}
          <div className="relative pt-6 border-t border-white/15 grid grid-cols-2 gap-3 text-left">
            <div>
              <span className="block text-xs font-extrabold text-white">Curated Syllabi</span>
              <span className="text-[10px] text-blue-200">Official Course Nodes</span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-white">Peer Solutions</span>
              <span className="text-[10px] text-blue-200">Verified by Community</span>
            </div>
          </div>
        </div>

        {/* Right Column: Register Form (7 cols) */}
        <div className="p-8 sm:p-10 md:col-span-7 flex flex-col justify-between">
          <div>
            {/* Form Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <img src="/fhub-remove-background.png" alt="FHub Logo" className="w-7 h-7 object-contain" />
                <span className="font-extrabold text-sm tracking-tight text-slate-800">
                  FHub <span className="text-[10px] px-1 py-0.2 bg-blue-50 text-[#0076D1] rounded font-bold border border-blue-100">EDU</span>
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Join the official FPT University academic exchange and repository network.
              </p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyen Van A"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="SE172481"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    University Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anv.se172481@fpt.edu.vn"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campus *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all cursor-pointer"
                    >
                      {mockCampuses.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0076D1] border-slate-300 focus:ring-[#0076D1] mt-0.5"
                  />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    I agree to the FHub <Link to="/settings" className="text-[#0076D1] font-semibold underline">Terms of Service</Link> and <Link to="/settings" className="text-[#0076D1] font-semibold underline">Community Guidelines</Link>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="pt-4 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#0076D1] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 px-2">
        <span>FPT University Academic Portal • Spring 2025</span>
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
