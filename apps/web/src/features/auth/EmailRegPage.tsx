import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import { campusesApi, authApi } from '../../services/api/adminApi';
import { validateFptEmail, FptEmailValidationResult, MAJOR_LETTER_MAP } from '../../utils/fptEmailValidator';

export const EmailRegPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [campus, setCampus] = useState(() => localStorage.getItem('fhub_selected_campus') || 'HN');
  const [campuses, setCampuses] = useState<Array<{ code: string; name: string }>>([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [emailInfo, setEmailInfo] = useState<FptEmailValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    campusesApi.getCampuses().then((res: any) => {
      const items = res?.items || res || [];
      if (isMounted && Array.isArray(items) && items.length > 0) {
        setCampuses(items.map((c: any) => ({
          code: c.code || c.campusCode,
          name: c.name || c.campusName || c.code,
        })));
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    const emailCheck = validateFptEmail(email);
    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.error || 'Email không hợp lệ theo quy chế FPT.');
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
      setErrorMessage('Vui lòng đồng ý với điều khoản dịch vụ.');
      return;
    }

    setIsLoading(true);
    try {
      // Save pending registration payload for OTP step
      sessionStorage.setItem('fhub_pending_reg', JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        studentCode: (studentId.trim() || emailInfo?.studentCode || '').toUpperCase(),
        campus: campus || emailInfo?.campusCode || 'HN',
      }));

      // Request OTP
      try {
        await authApi.requestPasswordRecovery(email.trim());
      } catch {
        // Proceed to OTP page
      }

      navigate('/otp-verify?mode=register');
    } catch (err: any) {
      setErrorMessage('Không thể gửi mã xác thực OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-6">
        {/* Header with Back button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/email-auth')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0076D1] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0076D1]" />
            <span className="font-extrabold text-xs text-slate-800">Email Registration</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Email Registration
          </h1>
          <p className="text-xs text-slate-500">
            Tạo tài khoản sinh viên FHub mới qua email chính sách trường
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSendOTP} className="space-y-4">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Email Sinh Viên *
              </label>
              <span className="text-[10px] text-slate-400">K18: @fpt.edu.vn • K19+: @gmail.com</span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="TanLT.CE190370@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                required
              />
            </div>
            {emailInfo && (
              <div className="mt-1 text-[11px]">
                {emailInfo.isValid ? (
                  <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {emailInfo.type === 'GMAIL_K19_PLUS'
                      ? `Sinh viên K${emailInfo.cohort} • ${emailInfo.campusName} • Ngành: ${MAJOR_LETTER_MAP[emailInfo.majorLetter || ''] || 'Kỹ thuật'}`
                      : 'Email trường (@fpt.edu.vn / @fe.edu.vn)'}
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                    ⚠️ {emailInfo.error}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cơ Sở (Campus) *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all cursor-pointer"
                >
                  {campuses.length > 0 ? (
                    campuses.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="CT">CT - Cần Thơ</option>
                      <option value="HN">HN - Hà Nội</option>
                      <option value="HCM">HCM - TP.HCM</option>
                      <option value="DN">DN - Đà Nẵng</option>
                      <option value="QN">QN - Quy Nhơn</option>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0076D1]/20 focus:border-[#0076D1] transition-all"
                required
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded text-[#0076D1] border-slate-300 focus:ring-[#0076D1] mt-0.5"
              />
              <span className="text-[11px] text-slate-600">Tôi đồng ý với Điều khoản dịch vụ và Quy chế cộng đồng FHub.</span>
            </label>
          </div>

          {/* Button: "Send OTP" */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#0076D1] hover:bg-[#005DA7] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'ĐANG GỬI MÃ...' : 'Send OTP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
