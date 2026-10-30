import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, ArrowLeft, ShieldCheck, RotateCcw } from 'lucide-react';
import { authApi } from '../../services/api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '../../types';

export const OTPVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'forgot'; // 'forgot' or 'register'
  const { login } = useAuth();
  const { t } = useLanguage();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetEmail = mode === 'register'
    ? JSON.parse(sessionStorage.getItem('fhub_pending_reg') || '{}')?.email || ''
    : sessionStorage.getItem('fhub_reset_email') || '';

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = val;
    setOtp(nextOtp);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (targetEmail) {
        await authApi.requestPasswordRecovery(targetEmail);
      }
      setTimerSeconds(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch {
      setTimerSeconds(60);
      setCanResend(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setErrorMessage(t("Vui lòng nhập đủ 6 chữ số mã xác thực OTP."));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'forgot') {
        sessionStorage.setItem('fhub_reset_otp', code);
        navigate('/reset-password');
      } else {
        // Register mode: finalize account creation
        const pendingReg = JSON.parse(sessionStorage.getItem('fhub_pending_reg') || '{}');
        if (!pendingReg.email) {
          setErrorMessage(t("Không tìm thấy thông tin đăng ký. Vui lòng quay lại."));
          setIsLoading(false);
          return;
        }

        const result = await authApi.register(pendingReg);
        sessionStorage.removeItem('fhub_pending_reg');

        const userObj: User = {
          id: String(result.user?.userId || `u-${Date.now()}`),
          email: result.user?.email || pendingReg.email,
          fullName: result.user?.fullName || pendingReg.fullName,
          studentId: result.user?.studentCode || pendingReg.studentCode || '',
          role: 'Student',
          campus: (result.user?.campusCode as any) || (pendingReg.campus as any) || 'HN',
          avatarUrl: result.user?.avatarUrl || '',
          karma: 0,
          status: 'ACTIVE',
          badges: [],
        };

        login(userObj, result.accessToken, result.refreshToken);
        navigate('/landing');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t("Mã xác thực không hợp lệ. Vui lòng thử lại.");
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (mode === 'register') {
      navigate('/email-reg');
    } else {
      navigate('/forgot-password');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-6">
        {/* Header with Back button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('auth.back', 'Back')}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0076D1]" />
            <span className="font-extrabold text-xs text-slate-800">{t("OTP Verification")}</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('auth.otpTitle', 'OTP Verification')}
          </h1>
          <p className="text-xs text-slate-500">
            {t("Nhập mã xác thực 6 chữ số đã được gửi tới:")}<br />
            <strong className="text-slate-800 font-mono text-sm">{targetEmail || t("email của bạn")}</strong>
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {t(errorMessage)}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-box-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-black font-mono bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#0076D1] focus:ring-4 focus:ring-[#0076D1]/10 transition-all shadow-xs"
              />
            ))}
          </div>

          <div className="text-center text-xs text-slate-500">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 font-bold text-[#0076D1] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t("Gửi lại mã OTP")}</span>
              </button>
            ) : (
              <span className="text-slate-400">
                {t("Gửi lại mã sau")} <strong>{timerSeconds}s</strong>
              </span>
            )}
          </div>

          {/* Button: "Verify OTP" for registration, "Confirm OTP" for password recovery */}
          <button
            type="submit"
            disabled={isLoading || otp.join('').length < 6}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>
              {isLoading
                ? t("ĐANG XÁC THỰC...")
                : mode === 'forgot'
                ? 'Confirm OTP'
                : 'Verify OTP'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
