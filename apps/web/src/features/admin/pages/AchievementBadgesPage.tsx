import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { mockDetailedBadges, DetailedBadge } from '../../../services/adminMockData';
import { useBadges, useCreateBadge, useDeleteBadge } from '../../../services/api';

export const AchievementBadgesPage: React.FC = () => {
  const { data: badgesData, isLoading, refetch } = useBadges();
  const createBadgeMutation = useCreateBadge();
  const deleteBadgeMutation = useDeleteBadge();

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

  useEffect(() => {
    if (Array.isArray(badgesData) && badgesData.length > 0) {
      setBadges(badgesData);
    }
  }, [badgesData]);

  const filteredBadges = badges.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === 'ALL' || b.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    try {
      await createBadgeMutation.mutateAsync({
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        description: newDesc.trim() || 'Achievement badge.',
        tier: newTier,
        category: newCategory,
        triggerCriteria: newCriteria.trim() || 'auto_milestone_trigger',
        pointValue: Number(newPoints) || 100,
      });
      refetch();
    } catch (e) {
      console.warn('Create badge fallback to local:', e);
    }

    const created: DetailedBadge = {
      id: `bg-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      description: newDesc.trim() || 'Achievement badge.',
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
    setSuccessNotice(`Created achievement badge: ${created.name} (${created.tier})`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleDeleteBadge = async (badgeId: string, badgeName: string) => {
    if (window.confirm(`Delete badge ${badgeName}?`)) {
      try {
        const numericId = badgeId.replace(/\D/g, '') || badgeId;
        await deleteBadgeMutation.mutateAsync(numericId);
        refetch();
      } catch (e) {
        console.warn('Delete badge fallback to local:', e);
      }
      setBadges((prev) => prev.filter((b) => b.id !== badgeId));
      setSuccessNotice(`Deleted badge ${badgeName}`);
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>GAMIFICATION & RECOGNITION</span>
            <span>&gt;</span>
            <span className="text-blue-600">BADGES CATALOGUE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Achievement Badges Catalogue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student milestone honors, tier rankings (Bronze, Silver, Gold, Platinum, Legendary), and trigger expressions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Badge</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by badge code or name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Tiers</option>
          <option value="BRONZE">BRONZE</option>
          <option value="SILVER">SILVER</option>
          <option value="GOLD">GOLD</option>
          <option value="PLATINUM">PLATINUM</option>
          <option value="LEGENDARY">LEGENDARY</option>
        </select>
      </div>

      {/* Badges Grid (Figma 57:6275) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl font-bold text-base flex items-center justify-center shadow-2xs ${
                      badge.tier === 'LEGENDARY'
                        ? 'bg-purple-100 text-purple-700'
                        : badge.tier === 'PLATINUM'
                        ? 'bg-cyan-100 text-cyan-700'
                        : badge.tier === 'GOLD'
                        ? 'bg-amber-100 text-amber-700'
                        : badge.tier === 'SILVER'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {badge.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">{badge.code}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.2 rounded-full ${
                    badge.tier === 'LEGENDARY'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : badge.tier === 'PLATINUM'
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : badge.tier === 'GOLD'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {badge.tier}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {badge.description}
              </p>

              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5 text-xs font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Trigger Rule:</span>
                <span className="text-slate-700 text-[11px]">{badge.triggerCriteria}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Awarded to:</span>
                <strong className="text-slate-900 font-bold">{badge.awardedCount} Students</strong>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600">+{badge.pointValue} pts Karma</span>
              <button
                onClick={() => handleDeleteBadge(badge.id, badge.name)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                title="Delete badge"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Badge */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Add Milestone Badge</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBadge} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Badge Code:</label>
                <input
                  type="text"
                  required
                  placeholder="TOP_CONTRIBUTOR_2026"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Display Name:</label>
                <input
                  type="text"
                  required
                  placeholder="Top Contributor 2026"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tier:</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs"
                  >
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                    <option value="LEGENDARY">LEGENDARY</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Karma Delta:</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Trigger Expression:</label>
                <input
                  type="text"
                  placeholder="articles_count >= 10"
                  value={newCriteria}
                  onChange={(e) => setNewCriteria(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description:</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Significance of this honor..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700"
                >
                  Create Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
