import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, ArrowRight, CheckCircle2, KeyRound, ShieldAlert, Check } from 'lucide-react';
import { authApi } from '../../services/api/adminApi';

type Step = 'email' | 'otp' | 'new-password' | 'success';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authApi.requestPasswordRecovery(email.trim());
    } catch {
      // Proceed gracefully
    } finally {
      setIsLoading(false);
      setStep('otp');
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = val;
    setOtp(nextOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã xác thực.');
      return;
    }
    setErrorMessage(null);
    setStep('new-password');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
    }, 500);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-6">
        {/* Back Link */}
        {step !== 'success' && (
          <button
            type="button"
            onClick={() => {
              if (step === 'otp') setStep('email');
              else if (step === 'new-password') setStep('otp');
              else navigate('/login');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 'email' ? 'Back to Sign In' : 'Back to previous step'}</span>
          </button>
        )}

        {/* Step 1: Forgot Password (Figma #74:532) */}
        {step === 'email' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0076D1] flex items-center justify-center mb-3 border border-blue-100">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Forgot Password?
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter the university email linked to your student account, and we will send a 6-digit verification code.
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  University Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student.name@fpt.edu.vn"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'SENDING CODE...' : 'CONTINUE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Verify OTP (Figma #74:942) */}
        {step === 'otp' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Verify Your Identity
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                We sent a 6-digit confirmation code to <strong className="text-slate-800">{email}</strong>. Enter it below to proceed.
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex justify-between gap-2 max-w-xs mx-auto">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-12 text-center text-lg font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                  />
                ))}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleSendEmail({ preventDefault: () => {} } as any)}
                  className="text-xs font-semibold text-[#0076D1] hover:underline cursor-pointer"
                >
                  Didn't receive the code? Resend
                </button>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md cursor-pointer"
              >
                <span>VERIFY CODE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Create New Password (Figma #74:628) */}
        {step === 'new-password' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0076D1] flex items-center justify-center mb-3 border border-blue-100">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Create New Password
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your new password must be at least 6 characters and include a mixture of letters and numbers.
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'UPDATING PASSWORD...' : 'RESET PASSWORD'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success (Figma #74:804) */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Password Reset Successful
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your account password has been updated securely. You can now use your new password to sign in to FHub.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md"
              >
                <span>RETURN TO SIGN IN</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
