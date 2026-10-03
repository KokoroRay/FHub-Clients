import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, KeyRound } from 'lucide-react';
import { ThreeBackground } from '../components/ThreeBackground';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isSignUp && !formData.username.trim()) {
      tempErrors.username = 'Họ tên là bắt buộc';
    }

    if (!formData.email) {
      tempErrors.email = 'Email là bắt buộc';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      tempErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Mật khẩu phải dài ít nhất 6 ký tự';
    }

    if (isSignUp && !formData.agreeToTerms) {
      tempErrors.agreeToTerms = 'Bạn phải đồng ý với điều khoản dịch vụ';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert(`Đăng nhập/Đăng ký thành công!\nEmail: ${formData.email}`);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans select-none bg-[#05020a]">
      {/* 3D Background */}
      <ThreeBackground />

      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-black/45 border border-white/10 rounded-2xl shadow-2xl p-8 transition-all duration-500 hover:border-purple-500/20">
          
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-lg shadow-blue-500/20 p-1">
              <img
                src="/fhub-remove-background.png"
                alt="FHub Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-wide">
              {isSignUp ? 'Tạo Tài Khoản' : 'Chào Mừng Trở Lại'}
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              {isSignUp ? 'Trải nghiệm nền tảng FHub ngay hôm nay' : 'Đăng nhập vào cổng thông tin fhub.com.vn'}
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-200 transition duration-300 hover:bg-white/10 hover:border-white/20 active:scale-95 cursor-pointer">
              {/* Brand Colored Google Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-200 transition duration-300 hover:bg-white/10 hover:border-white/20 active:scale-95 cursor-pointer">
              {/* White GitHub Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <span className="relative z-10 px-3 bg-[#0d0a1b]/0 text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Hoặc dùng Email
            </span>
          </div>

          {/* Login / Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username (Only for Sign Up) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nguyễn Văn A"
                    className={`w-full py-3 pl-11 pr-4 bg-white/5 border rounded-xl text-white placeholder-gray-500 text-sm outline-none transition duration-300 focus:bg-white/10 ${
                      errors.username ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username}</p>}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Địa chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="a@fhub.com.vn"
                  className={`w-full py-3 pl-11 pr-4 bg-white/5 border rounded-xl text-white placeholder-gray-500 text-sm outline-none transition duration-300 focus:bg-white/10 ${
                    errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mật khẩu</label>
                {!isSignUp && (
                  <a href="#forgot" className="text-xs text-purple-400 hover:text-purple-300 transition">
                    Quên mật khẩu?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full py-3 pl-11 pr-11 bg-white/5 border rounded-xl text-white placeholder-gray-500 text-sm outline-none transition duration-300 focus:bg-white/10 ${
                    errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Terms and Conditions (Only for Sign Up) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-0.5 rounded border-white/10 text-purple-600 focus:ring-purple-500/20 bg-white/5 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-gray-400 leading-tight">
                    Tôi đồng ý với{' '}
                    <a href="#terms" className="text-purple-400 hover:underline">
                      Điều khoản dịch vụ
                    </a>{' '}
                    và{' '}
                    <a href="#privacy" className="text-purple-400 hover:underline">
                      Chính sách bảo mật
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && <p className="text-xs text-red-400 mt-1">{errors.agreeToTerms}</p>}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-sm font-semibold text-white transition duration-300 hover:from-purple-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-purple-500/20 active:scale-98 cursor-pointer mt-2"
            >
              <span>{isSignUp ? 'Đăng Ký' : 'Đăng Nhập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
                className="font-semibold text-purple-400 hover:text-purple-300 transition"
              >
                {isSignUp ? 'Đăng nhập ngay' : 'Tạo tài khoản mới'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
