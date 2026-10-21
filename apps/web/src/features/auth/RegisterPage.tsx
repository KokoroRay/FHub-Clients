import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Sparkles,
  School
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { authApi, campusesApi } from '../../services/api/adminApi';
import {
  validateFptEmail,
  FptEmailValidationResult,
  MAJOR_LETTER_MAP
} from '../../utils/fptEmailValidator';

type RegisterStep = 'form' | 'otp' | 'success';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState<RegisterStep>('form');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [campus, setCampus] = useState('');
  const [campuses, setCampuses] = useState<Array<{ code: string; name: string }>>([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Email validation state
  const [emailInfo, setEmailInfo] = useState<FptEmailValidationResult | null>(null);

  // OTP Verification state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Loading & error state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load campuses from API
  useEffect(() => {
    let isMounted = true;
    const loadCampuses = async () => {
      try {
        const res = await campusesApi.getCampuses();
        const items = (res as any)?.items || res || [];
        if (isMounted && Array.isArray(items) && items.length > 0) {
          const mapped = items.map((c: any) => ({
            code: c.code || c.campusCode,
            name: c.name || c.campusName || c.code,
          }));
          setCampuses(mapped);
          if (mapped[0] && !campus) setCampus(mapped[0].code);
        }
      } catch (err) {
        console.warn('Failed to load campuses in RegisterPage:', err);
      }
    };
    loadCampuses();
    return () => { isMounted = false; };
  }, []);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'otp' && timerSeconds > 0) {
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
  }, [step, timerSeconds]);

  // Handle email change and auto-extract FPT metadata
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val.trim()) {
      setEmailInfo(null);
      return;
    }
    const res = validateFptEmail(val);
    setEmailInfo(res);

    // If K19+ Gmail format, auto-fill studentId and campus!
    if (res.isValid && res.type === 'GMAIL_K19_PLUS' && res.studentCode) {
      setStudentId(res.studentCode);
      if (res.campusCode) {
        setCampus(res.campusCode);
      }
    }
  };

  // Step 1: Validate Form & Request OTP
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    // Kiểm tra định dạng Email theo chính sách K18 / K19 của trường
    const emailValidation = validateFptEmail(email);
    if (!emailValidation.isValid) {
      setErrorMessage(emailValidation.error || 'Email không hợp lệ theo quy chế của trường.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự.');
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
    try {
      // Gửi yêu cầu mã OTP xác nhận tài khoản tới email sinh viên
      try {
        await authApi.requestPasswordRecovery(email.trim());
      } catch {
        // Cho phép đi tiếp vào giao diện nhập OTP xác nhận
      }

      setStep('otp');
      setTimerSeconds(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP inputs
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = val;
    setOtp(nextOtp);

    // Auto-focus next input box
    if (val && index < 5) {
      const nextInput = document.getElementById(`reg-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`reg-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authApi.requestPasswordRecovery(email.trim());
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

  // Step 2: Confirm OTP & Finalize Registration
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã xác thực OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const finalStudentCode = (studentId.trim() || emailInfo?.studentCode || '').toUpperCase();
      const finalCampus = campus || emailInfo?.campusCode || 'HN';

      const result = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        studentCode: finalStudentCode || undefined,
        campus: finalCampus,
      });

      const userObj: User = {
        id: String(result.user?.userId || `u-${Date.now()}`),
        email: result.user?.email || email.trim(),
        fullName: result.user?.fullName || fullName.trim(),
        studentId: result.user?.studentCode || finalStudentCode || '',
        role: 'Student',
        campus: (result.user?.campusCode as any) || (finalCampus as any) || '',
        avatarUrl: result.user?.avatarUrl || '',
        karma: 0,
        status: 'ACTIVE',
        badges: [],
      };

      login(userObj, result.accessToken, result.refreshToken);
      setStep('success');

      // Tự động chuyển hướng sau 2.5s
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Mã OTP không chính xác hoặc đăng ký thất bại. Vui lòng kiểm tra lại.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Outer Card Shell */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Column: Overlay (Figma Branding & Highlights) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#0076D1] to-[#005DA7] p-8 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          {/* Top badge */}
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 text-white backdrop-blur-sm border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              Cổng Đăng Ký Sinh Viên FPT
            </span>
          </div>

          {/* Main Greeting Center */}
          <div className="relative space-y-4 my-auto py-6">
            <h3 className="text-3xl font-black text-white tracking-tight leading-tight">
              Gia nhập Mạng Tri thức FHub!
            </h3>
            <p className="text-xs text-blue-100/90 leading-relaxed max-w-xs">
              Mạng xã hội học thuật chính thống kết nối sinh viên 5 cơ sở FPT University. Chia sẻ quy trình đồ án, tra cứu Course Node và trao đổi cùng bạn học.
            </p>

            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Chính sách Email mới:</span>
              </div>
              <ul className="text-[11px] text-blue-50/90 space-y-1 list-disc pl-4 leading-relaxed">
                <li><strong>K18 trở về trước:</strong> Sử dụng mail edu <code className="bg-white/20 px-1 py-0.5 rounded text-[10px]">@fpt.edu.vn</code></li>
                <li><strong>K19 trở đi:</strong> Sử dụng Gmail sinh viên chuẩn <code className="bg-white/20 px-1 py-0.5 rounded text-[10px]">TanLT.CE190370@gmail.com</code></li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white border-2 border-white hover:bg-white hover:text-[#0076D1] transition-all shadow-md cursor-pointer"
              >
                <span>ĐÃ CÓ TÀI KHOẢN? ĐĂNG NHẬP</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Highlights Footer */}
          <div className="relative pt-6 border-t border-white/15 grid grid-cols-2 gap-3 text-left">
            <div>
              <span className="block text-xs font-extrabold text-white">5 Campuses</span>
              <span className="text-[10px] text-blue-200">HN • HCM • DN • CT • QN</span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-white">Xác thực 100%</span>
              <span className="text-[10px] text-blue-200">Bảo mật mã OTP Sinh viên</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Form Area */}
        <div className="p-8 sm:p-10 md:col-span-7 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <img src="/fhub-remove-background.png" alt="FHub Logo" className="w-7 h-7 object-contain" />
                  <span className="font-extrabold text-sm tracking-tight text-slate-800">
                    FHub <span className="text-[10px] px-1 py-0.2 bg-blue-50 text-[#0076D1] rounded font-bold border border-blue-100">EDU</span>
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {step === 'form' && 'Đăng Ký Tài Khoản'}
                  {step === 'otp' && 'Xác Thực Tài Khoản (OTP)'}
                  {step === 'success' && 'Đăng Ký Thành Công!'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {step === 'form' && 'Nhập thông tin sinh viên để thiết lập tài khoản cá nhân.'}
                  {step === 'otp' && `Nhập mã 6 chữ số đã gửi đến email ${email}`}
                  {step === 'success' && 'Tài khoản của bạn đã được kích hoạt thành công.'}
                </p>
              </div>

              {step === 'otp' && (
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Sửa thông tin</span>
                </button>
              )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 1: REGISTRATION FORM */}
            {/* ============================================================== */}
            {step === 'form' && (
              <form onSubmit={handleProceedToOtp} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và Tên *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Lê Tấn"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mã Số Sinh Viên (MSSV)
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                      placeholder="CE190370"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                    />
                  </div>
                </div>

                {/* Email with FPT Real-time Validator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Sinh Viên *
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      K18: @fpt.edu.vn • K19+: @gmail.com
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="TanLT.CE190370@gmail.com"
                      className={`w-full bg-slate-50/60 border rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        emailInfo
                          ? emailInfo.isValid
                            ? 'border-emerald-400 focus:ring-emerald-500/20 focus:border-emerald-600'
                            : 'border-amber-300 focus:ring-amber-500/20 focus:border-amber-600'
                          : 'border-slate-200 focus:ring-[#0076D1]/20 focus:border-[#0076D1]'
                      }`}
                      required
                    />
                  </div>

                  {/* Real-time Email Policy Detection Hint */}
                  {emailInfo && (
                    <div className="mt-1.5 text-[11px] leading-tight">
                      {emailInfo.isValid ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {emailInfo.type === 'GMAIL_K19_PLUS'
                              ? `Đã nhận diện: Sinh viên Khóa K${emailInfo.cohort} • ${emailInfo.campusName} • Ngành: ${MAJOR_LETTER_MAP[emailInfo.majorLetter || ''] || 'Kỹ thuật'}`
                              : 'Đã nhận diện: Email giáo dục FPT (@fpt.edu.vn / @fe.edu.vn)'}
                          </span>
                        </div>
                      ) : (
                        <div className="text-amber-700 font-medium bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
                          ⚠️ {emailInfo.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cơ Sở Học Tập (Campus) *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all cursor-pointer"
                      >
                        {campuses.length > 0 ? (
                          campuses.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code} - {c.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="CT">CT - Phân hiệu Cần Thơ</option>
                            <option value="HN">HN - Phân hiệu Hà Nội (Hòa Lạc)</option>
                            <option value="HCM">HCM - Phân hiệu TP. Hồ Chí Minh</option>
                            <option value="DN">DN - Phân hiệu Đà Nẵng</option>
                            <option value="QN">QN - Phân hiệu Quy Nhơn</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mật Khẩu *
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Xác Nhận Mật Khẩu *
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
                      Tôi đồng ý với <Link to="/settings" className="text-[#0076D1] font-semibold underline">Điều khoản dịch vụ</Link> và <Link to="/settings" className="text-[#0076D1] font-semibold underline">Quy chế Cộng đồng FHub</Link>.
                    </span>
                  </label>
                </div>

                {/* Submit to OTP Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'ĐANG XỬ LÝ...' : 'TIẾP TỤC & NHẬN MÃ XÁC THỰC OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* ============================================================== */}
            {/* STEP 2: OTP VERIFICATION */}
            {/* ============================================================== */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-6">
                <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0076D1]">
                    <KeyRound className="w-4 h-4" />
                    <span>Xác nhận danh tính sinh viên</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hệ thống đã gửi mã xác thực gồm <strong>6 chữ số</strong> tới địa chỉ email: <strong className="text-slate-900 font-mono">{email}</strong>. Vui lòng nhập mã để kích hoạt tài khoản.
                  </p>
                </div>

                {/* 6-box OTP Input */}
                <div className="space-y-2">
                  <label className="block text-center text-xs font-bold text-slate-700">
                    Mã xác thực OTP (6 chữ số)
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`reg-otp-${idx}`}
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
                </div>

                {/* Resend OTP Timer */}
                <div className="text-center text-xs text-slate-500">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 font-bold text-[#0076D1] hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Gửi lại mã OTP</span>
                    </button>
                  ) : (
                    <span className="text-slate-400">
                      Gửi lại mã xác thực sau <strong>{timerSeconds}s</strong>
                    </span>
                  )}
                </div>

                {/* Confirm Button */}
                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'ĐANG KÍCH HOẠT...' : 'XÁC NHẬN & HOÀN TẤT ĐĂNG KÝ'}</span>
                </button>
              </form>
            )}

            {/* ============================================================== */}
            {/* STEP 3: SUCCESS CONFIRMATION */}
            {/* ============================================================== */}
            {step === 'success' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">
                    Chào mừng bạn gia nhập FHub!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Tài khoản sinh viên của bạn đã được xác minh thành công. Đang tự động chuyển hướng đến trang chủ FHub...
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-left text-xs space-y-1.5 max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Họ và tên:</span>
                    <span className="font-bold text-slate-800">{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mã sinh viên:</span>
                    <span className="font-mono font-bold text-[#0076D1]">{studentId || emailInfo?.studentCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-mono text-slate-700">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cơ sở:</span>
                    <span className="font-bold text-slate-800">{campus}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all cursor-pointer shadow-md"
                  >
                    <span>VÀO BẢNG TIN NGAY</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 text-center text-xs text-slate-500">
            Đã có tài khoản sinh viên FHub?{' '}
            <Link to="/login" className="font-bold text-[#0076D1] hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 px-2">
        <span>FPT University Academic Portal • Mạng trao đổi tri thức sinh viên FPT</span>
        <div className="flex items-center gap-3">
          <Link to="/tickets" className="hover:text-slate-600 transition-colors">
            Hỗ trợ kỹ thuật
          </Link>
          <Link to="/settings" className="hover:text-slate-600 transition-colors">
            Chính sách bảo mật
          </Link>
        </div>
      </div>
    </div>
  );
};
