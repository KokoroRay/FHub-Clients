import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#005da7] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
      </Link>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
          Khôi phục mật khẩu
        </h2>
        <p className="text-xs text-slate-500">
          Nhập email tài khoản trường của bạn để nhận liên kết đặt lại mật khẩu
        </p>
      </div>

      {isSent ? (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
          <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">Đã gửi email khôi phục!</h4>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
            Vui lòng kiểm tra hòm thư Outlook sinh viên <strong>{email}</strong> để hoàn tất đặt lại mật khẩu.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Email sinh viên FPT"
            type="email"
            placeholder="anguyenvana.se@fpt.edu.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button variant="primary" type="submit" className="w-full" isLoading={isLoading}>
            Gửi liên kết khôi phục
          </Button>
        </form>
      )}
    </div>
  );
};
