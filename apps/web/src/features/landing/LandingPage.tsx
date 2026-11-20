import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation, Navigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Clock,
  User as UserIcon,
  GraduationCap,
  MapPin,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { GoogleSignInButton } from '../../components/common/GoogleSignInButton';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { authApi, campusesApi, LoginResponse } from '../../services/api/adminApi';
import { validateFptEmail, FptEmailValidationResult, MAJOR_LETTER_MAP } from '../../utils/fptEmailValidator';
import { User, CampusCode } from '../../types';

const VIETNAMESE_NAME_REGEX = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]{2,50}$/;
const FPT_STUDENT_CODE_REGEX = /^[A-Za-z]{2}\d{4,8}$/;

interface CampusOption {
  code: string;
  name: string;
}

interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
      detail?: string;
    };
  };
  message?: string;
}

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  // Mode derived strictly from URL
  const isRegister = location.pathname.includes('/register') || searchParams.get('mode') === 'register';

  const toggleMode = (targetRegister: boolean) => {
    if (targetRegister) {
      navigate('/register', { replace: true });
    } else {
      navigate('/landing', { replace: true });
    }
  };

  // Sign In State
  const reasonParam = searchParams.get('reason');
  const sessionExpiredNotice = reasonParam === 'session_expired'
    ? t("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    : null;

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);

  // Sign Up State
  const [regStep, setRegStep] = useState<'form' | 'otp' | 'success'>('form');
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [campus, setCampus] = useState('');
  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [emailInfo, setEmailInfo] = useState<FptEmailValidationResult | null>(null);
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [regErrorMessage, setRegErrorMessage] = useState<string | null>(null);

  // Inline OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Load campuses
  useEffect(() => {
    let isMounted = true;
    campusesApi.getCampuses()
      .then((res) => {
        const items = res?.items ?? [];
        if (isMounted && Array.isArray(items) && items.length > 0) {
          const mapped: CampusOption[] = items.map((c) => ({
            code: c.campusCode || '',
            name: c.campusName || c.campusCode || '',
          }));
          setCampuses(mapped);
          setCampus((prev) => prev || mapped[0]?.code || 'HN');
        }
      })
      .catch((err) => {
        console.warn('Failed to load campuses in LandingPage:', err);
      });
    return () => { isMounted = false; };
  }, []);

  // OTP Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (regStep === 'otp' && timerSeconds > 0) {
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
  }, [regStep, timerSeconds]);

  // Login Handlers
  const handleLoginSuccess = (result: LoginResponse, userEmail: string) => {
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
    let mappedRole: User['role'] = 'Student';
    if (roles.includes('Admin')) mappedRole = 'Admin';
    else if (roles.includes('CommunityModerator') || roles.includes('Moderator')) mappedRole = 'Community Moderator';
    else if (roles.includes('Staff')) mappedRole = 'Staff';
    else if (roles.includes('SchoolRepresentative')) mappedRole = 'School Representative';
    else if (roles.includes('Alumni')) mappedRole = 'Alumni';

    const parsedCampus = (result.user?.campusCode || validateFptEmail(result.user?.email || userEmail).campusCode || 'HL') as CampusCode;

    const userObj: User = {
      id: String(result.user?.userId || `u-${Date.now()}`),
      email: result.user?.email || userEmail,
      fullName: result.user?.fullName || userEmail.split('@')[0],
      studentId: result.user?.studentCode || validateFptEmail(result.user?.email || userEmail).studentCode || '',
      role: mappedRole,
      campus: parsedCampus,
      avatarUrl: result.user?.avatarUrl || '',
      karma: 0,
      status: 'ACTIVE',
      badges: [],
    };

    login(userObj, result.accessToken, result.refreshToken);

    if (mappedRole === 'Admin') navigate('/admin-console');
    else if (mappedRole === 'Community Moderator') navigate('/admin-console/moderation');
    else navigate('/');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginErrorMessage(t("Vui lòng nhập email trường hoặc mã sinh viên."));
      return;
    }

    if (loginEmail.trim().includes('@') && !loginEmail.trim().toLowerCase().endsWith('@fhub.com.vn')) {
      const emailCheck = validateFptEmail(loginEmail.trim());
      if (!emailCheck.isValid) {
        setLoginErrorMessage(emailCheck.error || t("Email không đúng định dạng quy định của Trường Đại học FPT."));
        return;
      }
    }

    if (!loginPassword) {
      setLoginErrorMessage(t("Vui lòng nhập mật khẩu."));
      return;
    }

    setIsLoginLoading(true);
    setLoginErrorMessage(null);

    try {
      const result = await authApi.login(loginEmail.trim(), loginPassword);
      handleLoginSuccess(result, loginEmail.trim());
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      const msg =
        apiErr.response?.data?.message ||
        apiErr.message ||
        t("Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin xác thực.");
      setLoginErrorMessage(msg);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setIsLoginLoading(true);
    setLoginErrorMessage(null);

    try {
      const payloadBase64 = idToken.split('.')[1];
      if (payloadBase64) {
        const payloadJson = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))) as { email?: string };
        const googleEmail = (payloadJson.email || '').trim().toLowerCase();
        if (googleEmail) {
          const emailCheck = validateFptEmail(googleEmail);
          if (!emailCheck.isValid) {
            setLoginErrorMessage(emailCheck.error || t("Email không đúng định dạng quy định của Trường Đại học FPT."));
            setIsLoginLoading(false);
            return;
          }
        }
      }
    } catch {
      // Proceed gracefully
    }

    try {
      const result = await authApi.googleLogin(idToken);
      handleLoginSuccess(result, result.user?.email || 'google.student@fpt.edu.vn');
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      setLoginErrorMessage(apiErr.response?.data?.message || apiErr.message || t("Đăng nhập Google SSO không thành công."));
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Register Handlers
  const handleRegEmailChange = (val: string) => {
    setRegEmail(val);
    if (!val.trim()) {
      setEmailInfo(null);
      return;
    }
    const res = validateFptEmail(val);
    setEmailInfo(res);
    if (res.isValid && res.type === 'GMAIL_K19_PLUS' && res.studentCode) {
      setStudentId(res.studentCode);
      if (res.campusCode) setCampus(res.campusCode);
    }
  };

  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMessage(null);

    const trimmedFullName = fullName.trim();
    if (!trimmedFullName) {
      setRegErrorMessage(t("Vui lòng nhập Họ và Tên."));
      return;
    }
    if (!VIETNAMESE_NAME_REGEX.test(trimmedFullName)) {
      setRegErrorMessage(t("Họ và tên không hợp lệ. Vui lòng chỉ nhập chữ cái (tiếng Việt có dấu hoặc không dấu), không bao gồm số và ký tự đặc biệt."));
      return;
    }

    const trimmedStudentId = (studentId.trim() || emailInfo?.studentCode || '').toUpperCase();
    if (!trimmedStudentId) {
      setRegErrorMessage(t("Vui lòng nhập Mã số sinh viên (MSSV)."));
      return;
    }
    if (!FPT_STUDENT_CODE_REGEX.test(trimmedStudentId)) {
      setRegErrorMessage(t("Mã số sinh viên (MSSV) không hợp lệ. Định dạng yêu cầu: 2 chữ cái ngành/cơ sở theo sau bởi các chữ số (ví dụ: SE180000, CE190370)."));
      return;
    }

    const emailCheck = validateFptEmail(regEmail);
    if (!emailCheck.isValid) {
      setRegErrorMessage(emailCheck.error || t("Email không hợp lệ theo quy chế FPT."));
      return;
    }

    if (regPassword.length < 6) {
      setRegErrorMessage(t("Mật khẩu phải chứa ít nhất 6 ký tự."));
      return;
    }

    if (regPassword !== confirmPassword) {
      setRegErrorMessage(t("Mật khẩu xác nhận không khớp."));
      return;
    }

    if (!agreeTerms) {
      setRegErrorMessage(t("Vui lòng đồng ý với điều khoản dịch vụ."));
      return;
    }

    setIsRegLoading(true);
    try {
      await authApi.requestRegisterOtp(regEmail.trim());
      setRegStep('otp');
      setTimerSeconds(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      let msg = apiErr.response?.data?.detail || apiErr.response?.data?.message || apiErr.message || t("Không thể gửi mã xác nhận. Vui lòng thử lại.");
      if (apiErr.response?.status === 409 || msg.toLowerCase().includes('conflict') || msg.toLowerCase().includes('already exists')) {
        msg = t("Email này đã được đăng ký tài khoản trên hệ thống. Vui lòng quay lại đăng nhập hoặc dùng tính năng Quên mật khẩu.");
      }
      setRegErrorMessage(msg);
    } finally {
      setIsRegLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length > 1) {
      const nextOtp = [...otp];
      for (let i = 0; i < digits.length && index + i < 6; i++) {
        nextOtp[index + i] = digits[i];
      }
      setOtp(nextOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      const nextInput = document.getElementById(`inline-reg-otp-${nextIndex}`);
      nextInput?.focus();
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = digits ? digits.slice(-1) : '';
    setOtp(nextOtp);

    if (digits && index < 5) {
      const nextInput = document.getElementById(`inline-reg-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const nextOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      nextOtp[i] = digits[i] || '';
    }
    setOtp(nextOtp);

    const focusIndex = Math.min(digits.length, 5);
    const nextInput = document.getElementById(`inline-reg-otp-${focusIndex}`);
    nextInput?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`inline-reg-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isRegLoading) return;
    setIsRegLoading(true);
    setRegErrorMessage(null);
    try {
      await authApi.requestRegisterOtp(regEmail.trim());
      setTimerSeconds(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      const msg = apiErr.response?.data?.detail || apiErr.response?.data?.message || apiErr.message || t("Không thể gửi lại mã xác nhận. Vui lòng thử lại sau.");
      setRegErrorMessage(msg);
    } finally {
      setIsRegLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      setRegErrorMessage(t("Vui lòng nhập đủ 6 chữ số mã xác thực OTP."));
      return;
    }

    setIsRegLoading(true);
    setRegErrorMessage(null);

    try {
      const finalStudentCode = (studentId.trim() || emailInfo?.studentCode || '').toUpperCase();
      const finalCampus = campus || emailInfo?.campusCode || 'HN';

      const result = await authApi.register({
        fullName: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        studentCode: finalStudentCode || undefined,
        campus: finalCampus,
        otpCode: enteredCode,
      });

      const parsedCampus = (result.user?.campusCode || finalCampus) as CampusCode;

      const userObj: User = {
        id: String(result.user?.userId || `u-${Date.now()}`),
        email: result.user?.email || regEmail.trim(),
        fullName: result.user?.fullName || fullName.trim(),
        studentId: result.user?.studentCode || finalStudentCode || '',
        role: 'Student',
        campus: parsedCampus,
        avatarUrl: result.user?.avatarUrl || '',
        karma: 0,
        status: 'ACTIVE',
        badges: [],
      };

      login(userObj, result.accessToken, result.refreshToken);
      setRegStep('success');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      let msg = apiErr.response?.data?.detail || apiErr.response?.data?.message || apiErr.message || t("Mã OTP không chính xác hoặc đăng ký thất bại. Vui lòng kiểm tra lại.");
      if (apiErr.response?.status === 409 || msg.toLowerCase().includes('conflict') || msg.toLowerCase().includes('already exists')) {
        msg = t("Email này đã được đăng ký tài khoản trên hệ thống. Vui lòng quay lại đăng nhập hoặc dùng tính năng Quên mật khẩu.");
      }
      setRegErrorMessage(msg);
    } finally {
      setIsRegLoading(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Consistent 44px input & select class
  const inputBaseClass = "w-full h-[44px] bg-slate-50/70 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl text-xs text-slate-800 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all box-border";
  const labelBaseClass = "block text-xs font-bold text-slate-700 dark:text-[#F8FAFC] mb-1 leading-tight";

  return (
    <div className="h-screen max-h-screen flex flex-col justify-between bg-[#F8F9FF] dark:bg-[#0B132B] text-slate-900 dark:text-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      
      {/* ─── CSS Rules for Classic Double-Slider Split-Screen ─────────────── */}
      <style>{`
        .auth-split-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 980px;
          height: 560px;
          max-height: calc(100vh - 110px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (min-width: 768px) {
          /* SIGN IN FORM (Starts on left half) */
          .split-sign-in-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 50%;
            height: 100%;
            z-index: 20;
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 1;
            transform: translateX(0%);
            pointer-events: auto;
          }

          .auth-split-wrapper.right-panel-active .split-sign-in-container {
            transform: translateX(100%);
            opacity: 0;
            pointer-events: none;
            z-index: 1;
          }

          /* SIGN UP FORM (Starts on left half, slides right and activates) */
          .split-sign-up-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 50%;
            height: 100%;
            z-index: 1;
            opacity: 0;
            pointer-events: none;
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateX(0%);
          }

          .auth-split-wrapper.right-panel-active .split-sign-up-container {
            transform: translateX(100%);
            opacity: 1;
            pointer-events: auto;
            z-index: 25;
            animation: showSignUpKeyframe 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }

          @keyframes showSignUpKeyframe {
            0%, 49.99% {
              opacity: 0;
              z-index: 1;
            }
            50%, 100% {
              opacity: 1;
              z-index: 25;
            }
          }

          /* OVERLAY CONTAINER (Sliding blue cover, default right half) */
          .split-overlay-container {
            position: absolute;
            top: 0;
            left: 50%;
            width: 50%;
            height: 100%;
            overflow: hidden;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 30;
            background: linear-gradient(145deg, #008BF0 0%, #0076D1 28%, #0060AD 60%, #004686 85%, #00366D 100%);
            box-shadow: 
              0 0 36px -2px rgba(0, 30, 75, 0.32),
              0 0 12px 0 rgba(0, 45, 95, 0.16),
              inset 0 0 45px rgba(0, 25, 60, 0.22);
          }

          .auth-split-wrapper.right-panel-active .split-overlay-container {
            transform: translateX(-100%);
          }

          /* OVERLAY INNER (200% width) - Smooth transparent text content slider */
          .split-overlay-inner {
            background: transparent;
            color: #ffffff;
            position: relative;
            left: -100%;
            height: 100%;
            width: 200%;
            transform: translateX(0%);
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .auth-split-wrapper.right-panel-active .split-overlay-inner {
            transform: translateX(50%);
          }

          /* OVERLAY PANELS */
          .split-overlay-panel {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-direction: column;
            padding: 2rem 2.25rem;
            text-align: center;
            top: 0;
            height: 100%;
            width: 50%;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
          }

          .split-overlay-left {
            left: 0;
            transform: translateX(-20%);
            opacity: 0;
            pointer-events: none;
          }

          .auth-split-wrapper.right-panel-active .split-overlay-left {
            transform: translateX(0%);
            opacity: 1;
            pointer-events: auto;
          }

          .split-overlay-right {
            right: 0;
            transform: translateX(0%);
            opacity: 1;
            pointer-events: auto;
          }

          .auth-split-wrapper.right-panel-active .split-overlay-right {
            transform: translateX(20%);
            opacity: 0;
            pointer-events: none;
          }
        }

        /* MOBILE (< 768px): Hide desktop sliding overlay, toggle cleanly */
        @media (max-width: 767px) {
          .auth-split-wrapper {
            height: auto !important;
            max-height: none !important;
          }
          .split-overlay-container {
            display: none !important;
          }
          .split-sign-in-container,
          .split-sign-up-container {
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            transform: none !important;
            transition: opacity 0.3s ease !important;
          }
          .split-sign-in-container {
            display: block;
          }
          .auth-split-wrapper.right-panel-active .split-sign-in-container {
            display: none !important;
          }
          .split-sign-up-container {
            display: none !important;
          }
          .auth-split-wrapper.right-panel-active .split-sign-up-container {
            display: block !important;
            opacity: 1 !important;
            pointer-events: auto !important;
          }
        }

        /* ─── MODERN PREMIUM DARK UI FOR AUTHENTICATION ────────────────── */
        html.dark .auth-split-wrapper {
          background-color: #1E293B !important;
          border-color: #334155 !important;
          box-shadow: 
            0 25px 60px -15px rgba(0, 0, 0, 0.65),
            0 0 1px 1px rgba(255, 255, 255, 0.05) !important;
        }

        html.dark .split-sign-in-container,
        html.dark .split-sign-up-container {
          background-color: #1E293B !important;
        }

        /* Inputs, Selects & Textareas in Dark Mode: #273449 Bg, #334155 Border, #F8FAFC Text */
        html.dark .auth-split-wrapper input:not([type="checkbox"]):not([type="radio"]),
        html.dark .auth-split-wrapper select,
        html.dark .auth-split-wrapper textarea {
          background-color: #273449 !important;
          border-color: #334155 !important;
          color: #F8FAFC !important;
          transition: all 0.2s ease !important;
        }

        html.dark .auth-split-wrapper input:not([type="checkbox"]):not([type="radio"]):hover,
        html.dark .auth-split-wrapper select:hover,
        html.dark .auth-split-wrapper textarea:hover {
          border-color: #475569 !important;
        }

        html.dark .auth-split-wrapper input:not([type="checkbox"]):not([type="radio"]):focus,
        html.dark .auth-split-wrapper select:focus,
        html.dark .auth-split-wrapper textarea:focus {
          background-color: #273449 !important;
          border-color: #0076D1 !important;
          box-shadow: 0 0 0 2px rgba(0, 118, 209, 0.25) !important;
        }

        html.dark .auth-split-wrapper input::placeholder,
        html.dark .auth-split-wrapper textarea::placeholder {
          color: #94A3B8 !important;
        }

        html.dark .auth-split-wrapper select option {
          background-color: #1E293B !important;
          color: #F8FAFC !important;
        }

        /* Welcome Panel (Overlay) in Dark Mode: Seamless Deep Blue Gradient */
        html.dark .split-overlay-container {
          background: linear-gradient(150deg, #0284C7 0%, #0076D1 32%, #0369A1 65%, #075985 85%, #0C4A6E 100%) !important;
          box-shadow: 
            0 0 42px -2px rgba(2, 132, 199, 0.3),
            0 0 16px 0 rgba(0, 25, 60, 0.45),
            inset 0 0 55px rgba(7, 89, 133, 0.28) !important;
        }

        /* Feature Cards inside Welcome Panel: Background #164B7A, Border #2563A5 */
        html.dark .auth-feature-card {
          background-color: #164B7A !important;
          border-color: #2563A5 !important;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25) !important;
        }

        html.dark .auth-feature-card .auth-feature-title {
          color: #FFFFFF !important;
        }

        html.dark .auth-feature-card .auth-feature-desc {
          color: #BFDBFE !important;
        }
      `}</style>

      {/* Radial gradient background decoration */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-35"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(30, 58, 138, 0.22) 0%, rgba(11, 19, 43, 0) 70%)',
        }}
      />

      {/* 1. Header Bar (Thu gọn diện tích, h-12, z-50 để dropdown ngôn ngữ luôn hiển thị trên card) */}
      <header className="relative z-50 w-full max-w-6xl mx-auto px-4 sm:px-6 py-1.5 shrink-0 flex items-center justify-between h-12">
        <Link to="/landing" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1E293B] shadow-xs border border-slate-200/80 dark:border-[#334155] flex items-center justify-center p-1 transition-transform group-hover:scale-105">
            <img src="/fhub-remove-background.png" alt={t("FHub Logo")} className="w-full h-full object-contain" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-[#F8FAFC] leading-none">
                {t("FHub")}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-blue-50 dark:bg-[#164B7A]/60 text-[#0076D1] dark:text-[#38BDF8] border border-blue-200 dark:border-[#2563A5] uppercase">
                {t("COMMUNITY")}
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-[#94A3B8] leading-none">
              {t("Academic Social Network")}
            </p>
          </div>
        </Link>

        {/* Top Right Controls: Theme Toggle & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5 relative z-50">
          <ThemeToggle size="sm" />
          <LanguageSwitcher variant="compact" />
        </div>
      </header>

      {/* 2. Main Sliding Split-Screen Container (Căn giữa hoàn hảo, không bị tràn màn hình) */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex-1 flex flex-col justify-center items-center my-auto min-h-0">
        
        {/* Mobile Tab Pill Switcher (Shown only on small screens < md) */}
        <div className="md:hidden w-full max-w-sm mb-3 p-1 bg-slate-200/80 dark:bg-[#273449] rounded-2xl flex items-center shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => toggleMode(false)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !isRegister
                ? 'bg-white dark:bg-[#1E293B] text-[#0076D1] dark:text-[#38BDF8] shadow-xs'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            {t("Đăng nhập")}
          </button>
          <button
            type="button"
            onClick={() => toggleMode(true)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isRegister
                ? 'bg-white dark:bg-[#1E293B] text-[#0076D1] dark:text-[#38BDF8] shadow-xs'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            {t("Đăng ký")}
          </button>
        </div>

        {/* Split Screen Card Shell (Chiều cao tối ưu 560px, hiển thị vừa vặn 100vh) */}
        <div className={`auth-split-wrapper bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] border border-slate-200/90 dark:border-[#334155] ${isRegister ? 'right-panel-active' : ''}`}>
          
          {/* =================================================================== */}
          {/* A. SIGN IN FORM CONTAINER (Active when isRegister === false)         */}
          {/* =================================================================== */}
          <div className="split-sign-in-container p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Form Header */}
              <div className="mb-4 space-y-0.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                  {t("Welcome Back")}
                </h1>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-tight">
                  {t("Enter your university credentials to access your FHub workspace.")}
                </p>
              </div>

              {/* Social SSO Buttons */}
              <div className="mb-3">
                <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={isLoginLoading} />
              </div>

              {/* Horizontal Divider */}
              <div className="relative my-2.5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-[#334155]" />
                </div>
                <span className="relative px-3 bg-white dark:bg-[#1E293B] text-[10px] font-extrabold text-slate-400 dark:text-[#94A3B8] uppercase tracking-wider">
                  {t("OR SIGN IN WITH EMAIL")}
                </span>
              </div>

              {/* Session Expiration Notice */}
              {sessionExpiredNotice && !loginErrorMessage && (
                <div className="mb-2.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 leading-snug">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>{sessionExpiredNotice}</span>
                </div>
              )}

              {/* Error Alert */}
              {loginErrorMessage && (
                <div className="mb-2.5 p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start gap-2 text-xs text-red-600 dark:text-red-300 leading-snug">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t(loginErrorMessage)}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleEmailLogin} className="space-y-3">
                {/* University Email / MSSV - h-44px */}
                <div>
                  <label className={labelBaseClass}>
                    {t("University Email / Student ID")}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (loginErrorMessage) setLoginErrorMessage(null);
                      }}
                      placeholder={t("student.name@fpt.edu.vn")}
                      className={`${inputBaseClass} pl-10 pr-3`}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password with Forgot Password link - h-44px */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelBaseClass}>
                      {t("Password")}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[#0076D1] dark:text-[#38BDF8] hover:underline"
                    >
                      {t("Forgot password?")}
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginErrorMessage) setLoginErrorMessage(null);
                      }}
                      placeholder="••••••••••••"
                      className={`${inputBaseClass} pl-10 pr-10`}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#F8FAFC] cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0076D1] border-slate-300 focus:ring-[#0076D1]"
                    />
                    <span className="text-slate-600 dark:text-[#94A3B8] font-medium">{t("Remember me")}</span>
                  </label>
                </div>

                {/* Submit Button - h-44px */}
                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-black text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg dark:shadow-[0_4px_16px_rgba(0,118,209,0.35)] dark:hover:shadow-[0_6px_22px_rgba(0,118,209,0.5)] active:scale-98 cursor-pointer disabled:opacity-50 tracking-wider uppercase"
                >
                  <span>{isLoginLoading ? t("SIGNING IN...") : t("SIGN IN")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Bottom Form Link: Register Switcher */}
            <div className="pt-2 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
              {t("Don't have an account?")}{' '}
              <button
                type="button"
                onClick={() => toggleMode(true)}
                className="font-bold text-[#0076D1] dark:text-[#38BDF8] hover:underline cursor-pointer"
              >
                {t("Register")}
              </button>
            </div>
          </div>

          {/* =================================================================== */}
          {/* B. SIGN UP FORM CONTAINER (Active when isRegister === true)         */}
          {/* =================================================================== */}
          <div className="split-sign-up-container p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight">
                    {regStep === 'form' && t("Tạo tài khoản")}
                    {regStep === 'otp' && t("Xác thực tài khoản (OTP)")}
                    {regStep === 'success' && t("Đăng ký thành công!")}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5 leading-tight">
                    {regStep === 'form' && t("Nhập thông tin sinh viên để thiết lập tài khoản cá nhân.")}
                    {regStep === 'otp' && t("Nhập mã 6 chữ số đã gửi đến email {p0}", undefined, { p0: regEmail })}
                    {regStep === 'success' && t("Tài khoản của bạn đã được kích hoạt thành công.")}
                  </p>
                </div>

                {regStep === 'otp' && (
                  <button
                    type="button"
                    onClick={() => setRegStep('form')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-[#94A3B8] hover:text-[#0076D1] dark:hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t("Sửa")}</span>
                  </button>
                )}
              </div>

              {/* Error Banner */}
              {regErrorMessage && (
                <div className="mb-2.5 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold leading-tight">
                  {t(regErrorMessage)}
                </div>
              )}

              {/* STEP 1: Registration Form */}
              {regStep === 'form' && (
                <form onSubmit={handleProceedToOtp} className="space-y-2.5">
                  {/* Row 1: Full Name & MSSV (Equal 50% width, h-44px) */}
                  <div className="grid grid-cols-2 gap-3 items-start">
                    <div className="w-full">
                      <label className={labelBaseClass}>
                        {t("Họ và tên *")}
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t("Lê Tấn")}
                          className={`${inputBaseClass} pl-10 pr-3`}
                          required
                        />
                      </div>
                    </div>

                    <div className="w-full">
                      <label className={labelBaseClass}>
                        {t("Mã sinh viên (MSSV)")}
                      </label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                          placeholder={t("CE190370")}
                          className={`${inputBaseClass} pl-10 pr-3 uppercase`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Email Sinh Viên (100% width, h-44px) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelBaseClass}>
                        {t("Email sinh viên *")}
                      </label>
                      <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-medium">
                        {t("K18: @fpt.edu.vn • K19+: @gmail.com")}
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => handleRegEmailChange(e.target.value)}
                        placeholder={t("TanLT.CE190370@gmail.com")}
                        className={`${inputBaseClass} pl-10 pr-3 ${
                          emailInfo
                            ? emailInfo.isValid
                              ? 'border-emerald-400 focus:ring-emerald-500/20 focus:border-emerald-600'
                              : 'border-amber-300 focus:ring-amber-500/20 focus:border-amber-600'
                            : ''
                        }`}
                        required
                      />
                    </div>

                    {/* Email Policy Alert */}
                    {emailInfo && (
                      <div className="mt-1 text-[10px] leading-tight">
                        {emailInfo.isValid ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-[#164B7A]/40 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-[#2563A5]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>
                              {emailInfo.type === 'GMAIL_K19_PLUS'
                                ? t("Đã nhận diện: Sinh viên Khóa K{p0} • {p1} • Ngành: {p2}", undefined, { p0: emailInfo.cohort, p1: emailInfo.campusName, p2: MAJOR_LETTER_MAP[emailInfo.majorLetter || ''] || 'Kỹ thuật' })
                                : t("Đã nhận diện: Email giáo dục FPT (@fpt.edu.vn / @fe.edu.vn)")}
                            </span>
                          </div>
                        ) : (
                          <div className="text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
                            ⚠️ {emailInfo.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Row 3: Campus Selection (100% width, h-44px) */}
                  <div>
                    <label className={labelBaseClass}>
                      {t("Cơ sở (Campus) *")}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        className={`${inputBaseClass} pl-10 pr-8 cursor-pointer`}
                      >
                        {campuses.length > 0 ? (
                          campuses.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code} - {c.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="CT">{t("CT - Cần Thơ")}</option>
                            <option value="HN">{t("HN - Hòa Lạc")}</option>
                            <option value="HCM">{t("HCM - TP. Hồ Chí Minh")}</option>
                            <option value="DN">{t("DN - Đà Nẵng")}</option>
                            <option value="QN">{t("QN - Quy Nhơn")}</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Password & Confirm Password (Equal 50% width, h-44px) */}
                  <div className="grid grid-cols-2 gap-3 items-start">
                    <div className="w-full">
                      <label className={labelBaseClass}>
                        {t("Mật khẩu *")}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className={`${inputBaseClass} pl-10 pr-9`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#F8FAFC] cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="w-full">
                      <label className={labelBaseClass}>
                        {t("Xác nhận mật khẩu *")}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className={`${inputBaseClass} pl-10 pr-9`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#F8FAFC] cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 5: Agreement */}
                  <div className="pt-0.5">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#0076D1] border-slate-300 focus:ring-[#0076D1] mt-0.5"
                      />
                      <span className="text-[10px] text-slate-600 dark:text-[#94A3B8] leading-snug">
                        {t("Tôi đồng ý với")} <Link to="/settings" className="text-[#0076D1] dark:text-[#38BDF8] font-semibold underline">{t("Điều khoản dịch vụ")}</Link> {t("và")} <Link to="/settings" className="text-[#0076D1] dark:text-[#38BDF8] font-semibold underline">{t("Quy chế cộng đồng")}</Link>.
                      </span>
                    </label>
                  </div>

                  {/* Row 6: Submit Button (h-44px) */}
                  <button
                    type="submit"
                    disabled={isRegLoading}
                    className="w-full h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-black text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg dark:shadow-[0_4px_16px_rgba(0,118,209,0.35)] dark:hover:shadow-[0_6px_22px_rgba(0,118,209,0.5)] active:scale-98 cursor-pointer disabled:opacity-50 tracking-wider uppercase"
                  >
                    <span>{isRegLoading ? t("ĐANG XỬ LÝ...") : t("TIẾP TỤC & NHẬN MÃ OTP")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: Inline OTP Verification */}
              {regStep === 'otp' && (
                <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4 pt-2">
                  <div className="bg-blue-50/70 dark:bg-[#164B7A]/40 border border-blue-200/80 dark:border-[#2563A5] rounded-2xl p-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0076D1] dark:text-[#38BDF8]">
                      <KeyRound className="w-4 h-4" />
                      <span>{t("Xác nhận danh tính sinh viên")}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                      {t("Mã OTP 6 chữ số đã gửi đến")} <strong className="text-slate-900 dark:text-[#F8FAFC] font-mono">{regEmail}</strong>.
                    </p>
                  </div>

                  {/* 6-box OTP Input (h-44px boxes) */}
                  <div className="space-y-1.5">
                    <label className="block text-center text-xs font-bold text-slate-700 dark:text-[#F8FAFC]">
                      {t("Mã xác thực OTP (6 chữ số)")}
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`inline-reg-otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          className="w-10 h-[44px] text-center text-lg font-black font-mono bg-slate-50 dark:bg-[#273449] border-2 border-slate-200 dark:border-[#334155] rounded-xl text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:border-[#0076D1] focus:ring-4 focus:ring-[#0076D1]/10 transition-all shadow-xs box-border"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend OTP Timer */}
                  <div className="text-center text-xs text-slate-500 dark:text-[#94A3B8]">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isRegLoading}
                        className="inline-flex items-center gap-1.5 font-bold text-[#0076D1] dark:text-[#38BDF8] hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t("Gửi lại mã OTP")}</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 dark:text-[#94A3B8]">
                        {t("Gửi lại mã sau")} <strong>{timerSeconds}s</strong>
                      </span>
                    )}
                  </div>

                  {/* Submit OTP Button (h-44px) */}
                  <button
                    type="submit"
                    disabled={isRegLoading || otp.join('').length < 6}
                    className="w-full h-[44px] flex items-center justify-center gap-2 rounded-xl text-xs font-black text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg dark:shadow-[0_4px_16px_rgba(0,118,209,0.35)] dark:hover:shadow-[0_6px_22px_rgba(0,118,209,0.5)] active:scale-98 cursor-pointer disabled:opacity-50 tracking-wider uppercase"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isRegLoading ? t("ĐANG KÍCH HOẠT...") : t("XÁC NHẬN & HOÀN TẤT ĐĂNG KÝ")}</span>
                  </button>
                </form>
              )}

              {/* STEP 3: Success Confirmation */}
              {regStep === 'success' && (
                <div className="py-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-black text-slate-900 dark:text-[#F8FAFC]">
                      {t("Chào mừng bạn gia nhập FHub!")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] max-w-sm mx-auto">
                      {t("Tài khoản sinh viên đã xác minh thành công. Đang tự động chuyển hướng...")}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#273449] rounded-xl border border-slate-200/80 dark:border-[#334155] text-left text-xs space-y-1 max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-[#94A3B8]">{t("Họ và tên:")}</span>
                      <span className="font-bold text-slate-800 dark:text-[#F8FAFC]">{fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-[#94A3B8]">{t("Mã sinh viên:")}</span>
                      <span className="font-mono font-bold text-[#0076D1] dark:text-[#38BDF8]">{studentId || emailInfo?.studentCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-[#94A3B8]">{t("Email:")}</span>
                      <span className="font-mono text-slate-700 dark:text-[#94A3B8]">{regEmail}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Form Link: Sign In Switcher */}
            <div className="pt-2 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
              {t("Đã có tài khoản sinh viên FHub?")}{' '}
              <button
                type="button"
                onClick={() => toggleMode(false)}
                className="font-bold text-[#0076D1] dark:text-[#38BDF8] hover:underline cursor-pointer"
              >
                {t("Đăng nhập ngay")}
              </button>
            </div>
          </div>

          {/* =================================================================== */}
          {/* C. SLIDING SPLIT-SCREEN OVERLAY (Desktop only: hidden md:block)     */}
          {/* =================================================================== */}
          <div className="split-overlay-container hidden md:block">
            {/* Unified Ambient Glow & Blur Orbs (Anchored to the blue sliding slab, travelling seamlessly with it) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              {/* 1. Top-Right Soft Cyan/Sky Luminous Glow (Cyan #67E8F9) */}
              <div className="absolute -top-14 -right-14 w-64 h-64 rounded-full bg-cyan-300/25 blur-[55px]" />
              {/* 2. Center Ambient Blue Radial Light behind Greeting & Button (#60A5FA) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-300/18 blur-[65px]" />
              {/* 3. Bottom-Left Deep Navy Grounding Shadow */}
              <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-blue-950/45 blur-[50px]" />
            </div>

            <div className="split-overlay-inner relative z-10">
              
              {/* Overlay Left Panel (Active when in Register mode -> Prompts user to SIGN IN) */}
              <div className="split-overlay-panel split-overlay-left">
                {/* Top Badge */}
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-white/15 text-white backdrop-blur-md border border-white/25 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                    {t("FHub Academic Ecosystem")}
                  </span>
                </div>

                {/* Center Content */}
                <div className="space-y-3.5 my-auto py-2 relative z-10">
                  <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                    {t("Welcome Back!")}
                  </h2>
                  <p className="text-xs text-blue-50/95 leading-relaxed max-w-xs mx-auto drop-shadow-xs">
                    {t("Để duy trì kết nối và đồng hành cùng cộng đồng sinh viên FPT, vui lòng đăng nhập bằng tài khoản của bạn.")}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleMode(false)}
                      className="h-[44px] inline-flex items-center gap-2 px-7 rounded-xl text-xs font-black text-white bg-white/10 hover:bg-white hover:text-[#0076D1] border-2 border-white/90 backdrop-blur-sm transition-all shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)] active:scale-95 cursor-pointer uppercase tracking-wider"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{t("SIGN IN")}</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Highlights */}
                <div className="w-full pt-3.5 border-t border-white/18 grid grid-cols-2 gap-3 text-left relative z-10">
                  <div className="auth-feature-card p-2.5 rounded-xl bg-white/[0.08] dark:bg-[#164B7A] backdrop-blur-sm border border-white/15 dark:border-[#2563A5] shadow-xs">
                    <span className="auth-feature-title block text-xs font-black text-white">{t("5 Campuses")}</span>
                    <span className="auth-feature-desc text-[10px] text-blue-100 dark:text-[#BFDBFE] font-medium">{t("HN • HCM • DN • CT • QN")}</span>
                  </div>
                  <div className="auth-feature-card p-2.5 rounded-xl bg-white/[0.08] dark:bg-[#164B7A] backdrop-blur-sm border border-white/15 dark:border-[#2563A5] shadow-xs">
                    <span className="auth-feature-title block text-xs font-black text-white">{t("Academic First")}</span>
                    <span className="auth-feature-desc text-[10px] text-blue-100 dark:text-[#BFDBFE] font-medium">{t("Đồ án & Học liệu FPT")}</span>
                  </div>
                </div>
              </div>

              {/* Overlay Right Panel (Active when in Login mode -> Prompts user to SIGN UP) */}
              <div className="split-overlay-panel split-overlay-right">
                {/* Top Badge */}
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-white/15 text-white backdrop-blur-md border border-white/25 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    {t("Cổng sinh viên FPT")}
                  </span>
                </div>

                {/* Center Content */}
                <div className="space-y-3.5 my-auto py-2 relative z-10">
                  <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                    {t("Hello, Friend!")}
                  </h2>
                  <p className="text-xs text-blue-50/95 leading-relaxed max-w-xs mx-auto drop-shadow-xs">
                    {t("Enter your personal details and start your journey with FHub academic network.")}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleMode(true)}
                      className="h-[44px] inline-flex items-center gap-2 px-7 rounded-xl text-xs font-black text-white bg-white/10 hover:bg-white hover:text-[#0076D1] border-2 border-white/90 backdrop-blur-sm transition-all shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)] active:scale-95 cursor-pointer uppercase tracking-wider"
                    >
                      <span>{t("SIGN UP")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Highlights */}
                <div className="w-full pt-3.5 border-t border-white/18 grid grid-cols-2 gap-3 text-left relative z-10">
                  <div className="auth-feature-card p-2.5 rounded-xl bg-white/[0.08] dark:bg-[#164B7A] backdrop-blur-sm border border-white/15 dark:border-[#2563A5] shadow-xs">
                    <span className="auth-feature-title block text-xs font-black text-white">{t("Xác thực 100%")}</span>
                    <span className="auth-feature-desc text-[10px] text-blue-100 dark:text-[#BFDBFE] font-medium">{t("Bảo mật mã OTP sinh viên")}</span>
                  </div>
                  <div className="auth-feature-card p-2.5 rounded-xl bg-white/[0.08] dark:bg-[#164B7A] backdrop-blur-sm border border-white/15 dark:border-[#2563A5] shadow-xs">
                    <span className="auth-feature-title block text-xs font-black text-white">{t("K18 & K19+")}</span>
                    <span className="auth-feature-desc text-[10px] text-blue-100 dark:text-[#BFDBFE] font-medium">{t("Hỗ trợ chuẩn email FPT")}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* 3. Bottom Brand Footer (Thu gọn diện tích, h-9) */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-1 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-[#94A3B8] border-t border-slate-200/60 dark:border-[#334155]/60 h-9">
        <div className="flex items-center gap-2">
          <span>{t("FHub Academic Network")}</span>
          <span>•</span>
          <span>{t("FPT University Ecosystem")}</span>
          <span>•</span>
          <span className="font-mono text-slate-400 dark:text-[#94A3B8]">{t("v2.4 Core")}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{t("Hệ sinh thái học tập & nghiên cứu FPT")}</span>
          <span>•</span>
          <span>{t("Bảo mật & Chuẩn mực học thuật")}</span>
        </div>
      </footer>
    </div>
  );
};
