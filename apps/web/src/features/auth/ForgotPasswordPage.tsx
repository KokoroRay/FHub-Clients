import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';
import { authApi } from '../../services/api/adminApi';
import { validateFptEmail } from '../../utils/fptEmailValidator';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendOtpCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email.');
      return;
    }

    const emailCheck = validateFptEmail(email.trim());
    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.error || 'Email không đúng định dạng của trường.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      sessionStorage.setItem('fhub_reset_email', email.trim());
      try {
        await authApi.requestPasswordRecovery(email.trim());
      } catch {
        // Proceed to OTP verify page
      }
      navigate('/otp-verify?mode=forgot');
    } catch (err: any) {
      setErrorMessage('Không thể gửi mã xác thực. Vui lòng kiểm tra lại email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-6">
        {/* Header with Back button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/landing')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-[#0076D1]" />
            <span className="font-extrabold text-xs text-slate-800">Password Recovery</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Forgot Password
          </h1>
          <p className="text-xs text-slate-500">
            Nhập email tài khoản sinh viên FHub của bạn để nhận mã xác thực OTP đổi mật khẩu.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSendOtpCode} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Sinh Viên / Cán Bộ *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="TanLT.CE190370@gmail.com hoặc user@fpt.edu.vn"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                required
              />
            </div>
          </div>

          {/* Button: "Send OTP Code" */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'ĐANG GỬI MÃ...' : 'Send OTP Code'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
