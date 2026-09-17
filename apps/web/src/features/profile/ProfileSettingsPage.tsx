import React, { useState } from 'react';
import { Settings, Shield, User, Download, Tag, UserX, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCampuses, mockMajors } from '../../services/mockData';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';

export const ProfileSettingsPage: React.FC = () => {
  const { currentUser, currentCampus, setCurrentCampus } = useAuth();

  const [bio, setBio] = useState(currentUser?.bio || '');
  const [githubUrl, setGithubUrl] = useState(currentUser?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser?.linkedinUrl || '');
  const [major, setMajor] = useState(currentUser?.major || 'Software Engineering');
  const [isSearchVisible, setIsSearchVisible] = useState(true);

  const [mutedTags, setMutedTags] = useState(['spam', 'politics', 'unrelated']);
  const [newMutedTag, setNewMutedTag] = useState('');
  const [blockedUsers, setBlockedUsers] = useState(['spammer.acc@gmail.com']);
  const [newBlockedUser, setNewBlockedUser] = useState('');

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddMutedTag = () => {
    if (!newMutedTag.trim()) return;
    setMutedTags([...mutedTags, newMutedTag.trim().toLowerCase()]);
    setNewMutedTag('');
  };

  const handleRemoveMutedTag = (t: string) => {
    setMutedTags(mutedTags.filter((x) => x !== t));
  };

  const handleAddBlockedUser = () => {
    if (!newBlockedUser.trim()) return;
    setBlockedUsers([...blockedUsers, newBlockedUser.trim()]);
    setNewBlockedUser('');
  };

  const handleRemoveBlockedUser = (u: string) => {
    setBlockedUsers(blockedUsers.filter((x) => x !== u));
  };

  const handleExportData = () => {
    alert('Đang nén toàn bộ dữ liệu cá nhân (Takeout Data .zip). Tải về sẽ bắt đầu trong giây lát!');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#005da7]" />
          <span>Account Preferences & Privacy</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Cập nhật thông tin học thuật, quản trị danh sách chặn và xuất dữ liệu cá nhân (Profile Service).
        </p>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Đã lưu tất cả thay đổi thiết lập thành công!
        </div>
      )}

      {/* Personal & Academic Info Form */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-[#005da7]" />
            <span>Thông tin cá nhân & Học thuật</span>
          </h3>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSaveInfo} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Cơ sở Campus"
                value={currentCampus}
                onChange={(e) => setCurrentCampus(e.target.value as any)}
                options={mockCampuses.map((c) => ({ value: c.code, label: `${c.code} - ${c.name}` }))}
              />
              <Select
                label="Chuyên ngành chính"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                options={mockMajors.map((m) => ({ value: m.name, label: `${m.code} - ${m.name}` }))}
              />
            </div>

            <Textarea
              label="Tiểu sử bản thân (Bio)"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Link GitHub profile"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <Input
                label="Link LinkedIn profile"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <Button variant="primary" type="submit" leftIcon={<Save className="w-4 h-4" />}>
              Lưu thông tin cá nhân
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Muted Tags & Blocked Users */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-600" />
            <span>Muted Tags & Chặn nội dung</span>
          </h3>
        </CardHeader>
        <CardBody className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1">Tags muốn ẩn khỏi bảng tin (Muted Tags):</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nhập tên tag muốn ẩn..."
                value={newMutedTag}
                onChange={(e) => setNewMutedTag(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-1.5 text-xs"
              />
              <Button variant="secondary" size="sm" onClick={handleAddMutedTag}>
                Thêm Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mutedTags.map((t) => (
                <Badge key={t} variant="neutral" size="md">
                  #{t}
                  <button onClick={() => handleRemoveMutedTag(t)} className="ml-1 text-rose-500 font-bold">×</button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="font-bold block mb-1">Danh sách người dùng bị chặn (Blocked Users):</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nhập email người dùng muốn chặn..."
                value={newBlockedUser}
                onChange={(e) => setNewBlockedUser(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-1.5 text-xs"
              />
              <Button variant="secondary" size="sm" onClick={handleAddBlockedUser}>
                Chặn người dùng
              </Button>
            </div>
            <div className="space-y-1.5">
              {blockedUsers.map((u) => (
                <div key={u} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="font-mono text-slate-700 dark:text-slate-300">{u}</span>
                  <button onClick={() => handleRemoveBlockedUser(u)} className="text-xs text-rose-500 hover:underline">
                    Bỏ chặn
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Export Data Takeout */}
      <Card className="border-sky-200 dark:border-sky-900 bg-sky-50/20">
        <CardBody className="p-6 flex items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Xuất toàn bộ dữ liệu cá nhân (Data Takeout)</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Tải về bản sao lưu đầy đủ gồm bài viết, câu hỏi, workflow và lịch sử đánh giá (.zip / .json).
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportData} leftIcon={<Download className="w-4 h-4" />}>
            Export Takeout
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};
