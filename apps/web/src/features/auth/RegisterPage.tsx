import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCurrentUser, mockCampuses } from '../../services/mockData';
import { CampusCode } from '../../types';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [campus, setCampus] = useState<CampusCode>('HL');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsLoading(true);
    setTimeout(() => {
      login({
        ...mockCurrentUser,
        fullName,
        email,
        studentId,
        campus,
      });
      setIsLoading(false);
      navigate('/');
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
          Tạo tài khoản FHub
        </h2>
        <p className="text-xs text-slate-500">
          Tham gia mạng lưới học thuật dành riêng cho sinh viên FPT
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4 text-xs">
        <Input
          label="Họ và tên sinh viên"
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mã số sinh viên (MSSV)"
            placeholder="HE163421"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />

          <Select
            label="Cơ sở Campus"
            value={campus}
            onChange={(e) => setCampus(e.target.value as any)}
            options={mockCampuses.map((c) => ({ value: c.code, label: `${c.code} - ${c.name}` }))}
          />
        </div>

        <Input
          label="Email trường FPT (@fpt.edu.vn)"
          type="email"
          placeholder="anguyenvana.se@fpt.edu.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Mật khẩu"
          type="password"
          placeholder="Tối thiểu 8 ký tự"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Button variant="primary" type="submit" className="w-full" isLoading={isLoading}>
          Đăng ký tài khoản
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-bold text-[#005da7] hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};
