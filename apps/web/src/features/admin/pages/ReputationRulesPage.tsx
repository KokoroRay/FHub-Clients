import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { ReputationRule } from '../../../services/adminMockData';
import { useReputationRules, useCreateReputationRule, useUpdateReputationRule } from '../../../services/api';

export const ReputationRulesPage: React.FC = () => {
  const { data: rulesData, isLoading, refetch } = useReputationRules();
  const createRuleMutation = useCreateReputationRule();
  const updateRuleMutation = useUpdateReputationRule();

  const [rules, setRules] = useState<ReputationRule[]>([]);
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

  useEffect(() => {
    if (Array.isArray(rulesData)) {
      setRules(rulesData);
    }
  }, [rulesData]);

  const filteredRules = rules.filter((r) => {
    const actionName = (r?.actionName || (r as any)?.rule_name || '').toLowerCase();
    const actionCode = (r?.actionCode || (r as any)?.rule_code || '').toLowerCase();
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = actionName.includes(q) || actionCode.includes(q);
    const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleToggleRule = async (ruleId: string) => {
    const target = rules.find((r) => r.id === ruleId);
    if (target) {
      try {
        await updateRuleMutation.mutateAsync({
          id: ruleId,
          payload: { ...target, isActive: !target.isActive },
        });
        refetch();
      } catch (e) {
        console.warn('Update rule fallback to local:', e);
      }
    }
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
    setSuccessNotice('Updated reputation rule active status');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionCode.trim() || !newActionName.trim()) return;

    try {
      await createRuleMutation.mutateAsync({
        actionCode: newActionCode.trim().toUpperCase(),
        actionName: newActionName.trim(),
        category: newCategory,
        pointDelta: Number(newPointDelta),
        dailyCap: Number(newDailyCap) || 100,
        description: newDesc.trim() || 'Gamification karma delta rule.',
      });
      refetch();
    } catch (e) {
      console.warn('Create rule fallback to local:', e);
    }

    const created: ReputationRule = {
      id: `rep-${Date.now()}`,
      actionCode: newActionCode.trim().toUpperCase(),
      actionName: newActionName.trim(),
      category: newCategory,
      pointDelta: Number(newPointDelta),
      description: newDesc.trim() || 'Gamification karma delta rule.',
      dailyCap: Number(newDailyCap) || 100,
      cooldownSeconds: 0,
      isActive: true,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedBy: 'Nguyen Admin',
    };

    setRules((prev) => [...prev, created]);
    setShowCreateModal(false);
    setSuccessNotice(`Created reputation rule: ${created.actionName} (${created.pointDelta > 0 ? `+${created.pointDelta}` : created.pointDelta} pts)`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    try {
      await updateRuleMutation.mutateAsync({
        id: editingRule.id,
        payload: editingRule,
      });
      refetch();
    } catch (e) {
      console.warn('Edit rule fallback to local:', e);
    }

    setRules((prev) =>
      prev.map((r) => (r.id === editingRule.id ? editingRule : r))
    );
    setEditingRule(null);
    setSuccessNotice(`Saved configuration for ${editingRule.actionName}`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>GAMIFICATION & REPUTATION</span>
            <span>&gt;</span>
            <span className="text-blue-600">RULES ENGINE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Reputation Points & Karma Rules
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure action-based positive and negative karma point deltas, daily caps, and anti-abuse cooldowns.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Reputation Rule</span>
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
            placeholder="Search by action code (e.g. BEST_ANSWER_ACCEPTED) or rule title..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          <option value="DISCUSSION">DISCUSSION</option>
          <option value="ACADEMIC">ACADEMIC</option>
          <option value="CONTENT">CONTENT</option>
          <option value="PENALTY">PENALTY</option>
        </select>
      </div>

      {/* Rules Table (Figma 56:5629) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">ACTION & CODE</th>
                <th className="py-3 px-3 font-bold">CATEGORY</th>
                <th className="py-3 px-3 font-bold">POINT DELTA</th>
                <th className="py-3 px-3 font-bold">DAILY CAP</th>
                <th className="py-3 px-3 font-bold">STATUS</th>
                <th className="py-3 px-4 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    0 reputation rules found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{rule.actionName}</div>
                    <div className="font-mono text-[10px] text-blue-600">{rule.actionCode}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{rule.description}</p>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700">
                      {rule.category}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        rule.pointDelta > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {rule.pointDelta > 0 ? `+${rule.pointDelta}` : rule.pointDelta} pts
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                    {rule.dailyCap ? `${rule.dailyCap} pts/day` : 'Unlimited'}
                  </td>

                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        rule.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {rule.isActive ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Rule */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Edit Karma Delta: {editingRule.actionName}
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
                  <label className="text-xs font-semibold text-slate-700">Point Delta:</label>
                  <input
                    type="number"
                    value={editingRule.pointDelta}
                    onChange={(e) => setEditingRule({ ...editingRule, pointDelta: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Daily Cap:</label>
                  <input
                    type="number"
                    value={editingRule.dailyCap || 0}
                    onChange={(e) => setEditingRule({ ...editingRule, dailyCap: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description:</label>
                <textarea
                  rows={2}
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Rule */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Add New Reputation Rule</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Action Code:</label>
                <input
                  type="text"
                  required
                  placeholder="STUDY_GROUP_HOSTED"
                  value={newActionCode}
                  onChange={(e) => setNewActionCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Action Name:</label>
                <input
                  type="text"
                  required
                  placeholder="Host collaborative study session"
                  value={newActionName}
                  onChange={(e) => setNewActionName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs"
                  >
                    <option value="DISCUSSION">DISCUSSION</option>
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="CONTENT">CONTENT</option>
                    <option value="PENALTY">PENALTY</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Points:</label>
                  <input
                    type="number"
                    value={newPointDelta}
                    onChange={(e) => setNewPointDelta(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Daily Cap:</label>
                  <input
                    type="number"
                    value={newDailyCap}
                    onChange={(e) => setNewDailyCap(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description:</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Criteria to trigger point award..."
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
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
