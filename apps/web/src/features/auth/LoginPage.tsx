import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCurrentUser } from '../../services/mockData';
import { authApi } from '../../services/api/adminApi';
import { User } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('student@fhub.com.vn');
  const [password, setPassword] = useState('Student@123456');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLegacyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authApi.login(email.trim(), password);
      if (result.accessToken) {
        localStorage.setItem('fhub_token', result.accessToken);
      }
      const roles = result.user?.roles || [];
      const isAlumni = roles.includes('Alumni');
      const userObj: User = {
        id: String(result.user?.userId || mockCurrentUser.id),
        email: result.user?.email || email,
        fullName: mockCurrentUser.fullName || 'Sinh viên FHub',
        studentId: result.user?.studentCode || 'SE170001',
        role: isAlumni ? 'Alumni' : 'Student',
        campus: 'HL',
        avatarUrl: mockCurrentUser.avatarUrl,
        karma: 100,
        status: 'ACTIVE',
        badges: []
      };
      login(userObj, result.accessToken);
      navigate('/');
    } catch (err: any) {
      console.warn('Backend login error, fallback to demo mode:', err);
      if (email.includes('fpt.edu.vn') || email.includes('fhub')) {
        login(mockCurrentUser);
        navigate('/');
      } else {
        setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSSO = () => {
    setIsLoading(true);
    setTimeout(() => {
      login(mockCurrentUser);
      setIsLoading(false);
      navigate('/');
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
          Đăng nhập vào FHub
        </h2>
        <p className="text-xs text-slate-500">
          Sử dụng tài khoản Email trường (@fpt.edu.vn) hoặc Google SSO
        </p>
      </div>

      {/* Google SSO Button */}
      <button
        type="button"
        onClick={handleGoogleSSO}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-2xs cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Đăng nhập với Google FPT SSO</span>
      </button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 absolute">
          hoặc đăng nhập bằng Email
        </span>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-xs">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleLegacyLogin} className="space-y-4 text-xs">
        <Input
          label="Email sinh viên FPT"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <div>
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
          <div className="flex justify-end mt-1.5">
            <Link to="/forgot-password" className="text-[11px] text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <Button
          variant="primary"
          type="submit"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Đăng nhập ngay
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-bold text-blue-600 hover:underline">
          Đăng ký sinh viên
        </Link>
      </div>
    </div>
  );
};
