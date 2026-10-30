import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../services/api/adminApi';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const email = sessionStorage.getItem('fhub_reset_email') || '';
  const otpCode = sessionStorage.getItem('fhub_reset_otp') || '';

  const handleConfirmNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage(t("Mật khẩu mới phải có ít nhất 6 ký tự."));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage(t("Mật khẩu xác nhận không khớp."));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (email && otpCode) {
        await authApi.resetPassword(email, otpCode, newPassword.trim());
      }
      sessionStorage.removeItem('fhub_reset_email');
      sessionStorage.removeItem('fhub_reset_otp');
      setIsSuccess(true);

      setTimeout(() => {
        navigate('/landing');
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
      setErrorMessage(msg);
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
            onClick={() => navigate('/otp-verify?mode=forgot')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('auth.back', 'Back')}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#0076D1]" />
            <span className="font-extrabold text-xs text-slate-800">{t("New Password")}</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('auth.resetPasswordTitle', 'Reset Password')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('auth.resetPasswordSubtitle', 'Thiết lập mật khẩu mới cho tài khoản email')} <strong className="text-slate-800 font-mono">{email}</strong>
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {t(errorMessage)}
          </div>
        )}

        {isSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{t("Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...")}</span>
          </div>
        )}

        <form onSubmit={handleConfirmNewPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('auth.newPasswordLabel', 'Mật Khẩu Mới *')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('auth.confirmPasswordLabel', 'Xác Nhận Mật Khẩu Mới *')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                required
              />
            </div>
          </div>

          {/* Button: "Confirm New Password" */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? t('auth.processing', 'ĐANG CẬP NHẬT...') : t('auth.confirmNewPasswordBtn', 'Confirm New Password')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
