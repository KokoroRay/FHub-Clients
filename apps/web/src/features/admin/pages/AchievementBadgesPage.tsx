import React, { useState } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  Code,
  Share2,
  ShieldCheck,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import { mockDetailedBadges, DetailedBadge } from '../../../services/adminMockData';

export const AchievementBadgesPage: React.FC = () => {
  const [badges, setBadges] = useState<DetailedBadge[]>(mockDetailedBadges);
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newTier, setNewTier] = useState<'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGENDARY'>('GOLD');
  const [newCategory, setNewCategory] = useState<'CONTRIBUTOR' | 'EXPERT' | 'MODERATOR' | 'ALUMNI' | 'COMMUNITY'>('CONTRIBUTOR');
  const [newCriteria, setNewCriteria] = useState('');
  const [newPoints, setNewPoints] = useState(100);
  const [newDesc, setNewDesc] = useState('');

  const filteredBadges = badges.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === 'ALL' || b.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const handleCreateBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const created: DetailedBadge = {
      id: `bg-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      description: newDesc.trim() || 'Huy hiệu thành tích sinh viên FHub.',
      icon: 'Award',
      tier: newTier,
      category: newCategory,
      triggerCriteria: newCriteria.trim() || 'auto_milestone_trigger',
      pointValue: Number(newPoints) || 100,
      awardedCount: 0,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setBadges((prev) => [...prev, created]);
    setShowCreateModal(false);
    setSuccessNotice(`Đã tạo mới huy hiệu danh giá: ${created.name} (${created.tier})`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleDeleteBadge = (badgeId: string, badgeName: string) => {
    if (window.confirm(`Xóa huy hiệu ${badgeName}?`)) {
      setBadges((prev) => prev.filter((b) => b.id !== badgeId));
      setSuccessNotice(`Đã xóa huy hiệu ${badgeName}`);
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Interaction & Gamification</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Achievement Badges Catalogue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý các danh hiệu vinh danh, phân cấp huy hiệu (Bronze, Silver, Gold, Platinum, Legendary) và điều kiện kích hoạt.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Huy Hiệu Mới</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Mã huy hiệu hoặc Tên hiển thị..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          className="w-full md:w-48 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">Tất cả Cấp Bậc (Tiers)</option>
          <option value="BRONZE">BRONZE (Đồng)</option>
          <option value="SILVER">SILVER (Bạc)</option>
          <option value="GOLD">GOLD (Vàng)</option>
          <option value="PLATINUM">PLATINUM (Bạch Kim)</option>
          <option value="LEGENDARY">LEGENDARY (Huyền Thoại)</option>
        </select>
      </div>

      {/* Badges Grid (Figma 57:6275) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:border-[#005da7] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center shadow-xs ${
                      badge.tier === 'LEGENDARY'
                        ? 'bg-linear-to-tr from-purple-600 via-pink-500 to-amber-400 text-white'
                        : badge.tier === 'PLATINUM'
                        ? 'bg-linear-to-tr from-cyan-600 to-indigo-600 text-white'
                        : badge.tier === 'GOLD'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                        : badge.tier === 'SILVER'
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {badge.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">{badge.code}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full ${
                    badge.tier === 'LEGENDARY'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : badge.tier === 'PLATINUM'
                      ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                      : badge.tier === 'GOLD'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {badge.tier}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {badge.description}
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Điều kiện Trigger:</span>
                <span className="text-slate-700 dark:text-slate-300 text-[11px]">{badge.triggerCriteria}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Đã trao tặng:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{badge.awardedCount} Sinh viên</strong>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600">+{badge.pointValue} pts Karma</span>
              <button
                onClick={() => handleDeleteBadge(badge.id, badge.name)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Xóa huy hiệu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Badge */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Thêm Mới Huy Hiệu Danh Dự</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBadge} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mã Huy Hiệu:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: TOP_CONTRIBUTOR_2026"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tên Huy Hiệu:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Top Contributor 2026"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Cấp Bậc (Tier):</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-2 py-2 text-xs"
                  >
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                    <option value="LEGENDARY">LEGENDARY</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Điểm Thưởng Karma:</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Biểu Thức Trigger:</label>
                <input
                  type="text"
                  placeholder="VD: articles_count >= 10"
                  value={newCriteria}
                  onChange={(e) => setNewCriteria(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mô Tả Huy Hiệu:</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ý nghĩa và cách đạt được..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#005da7] text-white text-xs font-bold cursor-pointer"
                >
                  Tạo Huy Hiệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
