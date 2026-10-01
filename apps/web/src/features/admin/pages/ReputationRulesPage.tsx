import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { mockReputationRules, ReputationRule } from '../../../services/adminMockData';

export const ReputationRulesPage: React.FC = () => {
  const [rules, setRules] = useState<ReputationRule[]>(mockReputationRules);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRule, setEditingRule] = useState<ReputationRule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form State
  const [newActionCode, setNewActionCode] = useState('');
  const [newActionName, setNewActionName] = useState('');
  const [newCategory, setNewCategory] = useState<'CONTENT' | 'DISCUSSION' | 'ACADEMIC' | 'COMMUNITY' | 'PENALTY'>('DISCUSSION');
  const [newPointDelta, setNewPointDelta] = useState(10);
  const [newDailyCap, setNewDailyCap] = useState(100);
  const [newDesc, setNewDesc] = useState('');

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.actionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.actionCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
    setSuccessNotice('Đã cập nhật trạng thái kích hoạt quy tắc tính điểm Reputation');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionCode.trim() || !newActionName.trim()) return;

    const created: ReputationRule = {
      id: `rep-${Date.now()}`,
      actionCode: newActionCode.trim().toUpperCase(),
      actionName: newActionName.trim(),
      category: newCategory,
      pointDelta: Number(newPointDelta),
      description: newDesc.trim() || 'Quy tắc cộng/trừ điểm Karma tương tác sinh viên.',
      dailyCap: Number(newDailyCap) || 100,
      cooldownSeconds: 0,
      isActive: true,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedBy: 'Hoàng Quốc Việt (Admin)',
    };

    setRules((prev) => [...prev, created]);
    setShowCreateModal(false);
    setSuccessNotice(`Đã tạo mới quy tắc ${created.actionName} (${created.pointDelta > 0 ? `+${created.pointDelta}` : created.pointDelta} pts)`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    setRules((prev) =>
      prev.map((r) => (r.id === editingRule.id ? editingRule : r))
    );
    setEditingRule(null);
    setSuccessNotice(`Đã cập nhật cấu hình quy tắc ${editingRule.actionName}`);
    setTimeout(() => setSuccessNotice(null), 3000);
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
            Reputation Points & Karma Engine Rules
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cấu hình định mức điểm thưởng học thuật, phạt gian lận và hạn mức trần tích lũy hàng ngày.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Quy Tắc Mới</span>
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
            placeholder="Tìm theo Mã hành vi (BEST_ANSWER_ACCEPTED) hoặc tên quy tắc..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-48 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">Tất cả Nhóm Hành Vi</option>
          <option value="DISCUSSION">DISCUSSION (Hỏi đáp)</option>
          <option value="ACADEMIC">ACADEMIC (Học thuật)</option>
          <option value="CONTENT">CONTENT (Tài liệu / Bài viết)</option>
          <option value="PENALTY">PENALTY (Chế tài / Phạt)</option>
        </select>
      </div>

      {/* Rules Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Action & Code</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold">Point Delta</th>
                <th className="py-3 px-3 font-semibold">Daily Cap</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{rule.actionName}</div>
                    <div className="font-mono text-[10px] text-slate-400">{rule.actionCode}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{rule.description}</p>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {rule.category}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`font-mono font-black text-sm px-2 py-0.5 rounded-lg ${
                        rule.pointDelta > 0
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                      }`}
                    >
                      {rule.pointDelta > 0 ? `+${rule.pointDelta}` : rule.pointDelta} pts
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {rule.dailyCap ? `${rule.dailyCap} pts/ngày` : 'Không giới hạn'}
                  </td>

                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        rule.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {rule.isActive ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </td>

                  <td className="py-3 px-3 text-right space-x-1">
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#005da7] bg-sky-50 dark:bg-sky-950/50 hover:bg-[#cfe1fe] cursor-pointer"
                    >
                      Chỉnh Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Rule */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Chỉnh Sửa Định Mức Điểm: {editingRule.actionName}
              </h2>
              <button
                onClick={() => setEditingRule(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Điểm Thưởng/Phạt:</label>
                  <input
                    type="number"
                    value={editingRule.pointDelta}
                    onChange={(e) => setEditingRule({ ...editingRule, pointDelta: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hạn Mức Hàng Ngày (Cap):</label>
                  <input
                    type="number"
                    value={editingRule.dailyCap || 0}
                    onChange={(e) => setEditingRule({ ...editingRule, dailyCap: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mô Tả Quy Tắc:</label>
                <textarea
                  rows={2}
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#005da7] text-white text-xs font-bold cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Rule */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Tạo Mới Quy Tắc Reputation</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mã Action Code:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: STUDY_GROUP_HOSTED"
                  value={newActionCode}
                  onChange={(e) => setNewActionCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tên Hành Vi:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Chủ trì nhóm học tập qua Google Meet"
                  value={newActionName}
                  onChange={(e) => setNewActionName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nhóm:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-2 py-2 text-xs"
                  >
                    <option value="DISCUSSION">DISCUSSION</option>
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="CONTENT">CONTENT</option>
                    <option value="PENALTY">PENALTY</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Điểm:</label>
                  <input
                    type="number"
                    value={newPointDelta}
                    onChange={(e) => setNewPointDelta(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Cap Ngày:</label>
                  <input
                    type="number"
                    value={newDailyCap}
                    onChange={(e) => setNewDailyCap(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mô Tả:</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Điều kiện để kích hoạt cộng điểm..."
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
                  Tạo Quy Tắc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
