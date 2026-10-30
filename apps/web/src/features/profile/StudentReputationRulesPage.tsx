import { useLanguage } from '../../context/LanguageContext';
import React, { useState, useEffect } from 'react';
import { Award, Zap, Shield, Search, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { studentReputationApi } from '../../services/api/studentApi';


interface ReputationRuleItem {
  id: string;
  code: string;
  name: string;
  category: 'DISCUSSION' | 'CONTENT' | 'ACADEMIC' | 'COMMUNITY' | 'PENALTY';
  pointDelta: number;
  dailyCap: number;
  description: string;
  eligibility: string;
}

export const StudentReputationRulesPage: React.FC = () => {
  const { t } = useLanguage();
  const [rules, setRules] = useState<ReputationRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'DISCUSSION' | 'CONTENT' | 'ACADEMIC' | 'PENALTY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRule, setSelectedRule] = useState<ReputationRuleItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRules = async () => {
      try {
        setLoading(true);
        const apiRules = await studentReputationApi.getRules();
        if (isMounted) {
          if (apiRules && apiRules.length > 0) {
            const mapped: ReputationRuleItem[] = apiRules.map((r) => ({
              id: String(r.rule_id),
              code: r.action_type,
              name: r.action_type.replace(/_/g, ' '),
              category: r.karma_delta < 0 ? 'PENALTY' : (r.action_type.includes('ANSWER') || r.action_type.includes('QUESTION') ? 'DISCUSSION' : 'CONTENT'),
              pointDelta: r.karma_delta,
              dailyCap: r.daily_cap,
              description: r.description,
              eligibility: t('All verified students'),
            }));
            setRules(mapped);
          } else {
            setRules([]);
          }
        }
      } catch (err) {
        console.warn('Backend reputation rules API not responding:', err);
        if (isMounted) setRules([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRules();
    return () => { isMounted = false; };
  }, []);

  const filteredRules = rules.filter(r => {
    if (activeCategory !== 'ALL' && r.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#181C22]">{t("Reputation & Karma Rules")}</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF5FF] text-[#0076D1] border border-[#BFDBFE]">
            {rules.length}  {t("Active Rules")}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {t("Learn how reputation points, karma badges, and community privileges are earned across FHub.")}</p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['ALL', 'DISCUSSION', 'CONTENT', 'ACADEMIC', 'PENALTY'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#0076D1] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? t("All Categories") : cat}
            </button>
          ))}
        </div>

        <div className="relative pt-1 border-t border-slate-100">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t("Search rules by name, action code, or keyword...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
          />
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100 shadow-xs">
          <p className="text-xs">{t('reputation.loading', 'Đang tải danh sách quy tắc uy tín...')}</p>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100 shadow-xs">
          <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold text-slate-700">{t("Chưa có quy tắc nào")}</p>
          <p className="text-xs text-slate-400 mt-1">{t("Hệ thống tính điểm uy tín chưa thiết lập quy tắc hoạt động.")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => (
          <div
            key={rule.id}
            onClick={() => setSelectedRule(rule)}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:border-slate-200 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {rule.code}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  rule.pointDelta > 0 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {rule.pointDelta > 0 ? `+${rule.pointDelta}` : rule.pointDelta}  {t("Karma")}</span>
              </div>

              <h3 className="text-sm font-bold text-[#181C22] group-hover:text-[#0076D1] transition-colors">
                {t(rule.name)}
              </h3>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {rule.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
              <span>{t("Daily cap:")} {rule.dailyCap > 0 ? t("{p0} pts", undefined, { p0: rule.dailyCap }) : t("No cap")}</span>
              <span className="inline-flex items-center gap-1 text-[#0076D1] font-semibold group-hover:underline">
                <span>{t("View Details")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            </div>
          ))}
        </div>
      )}

      {/* View Reputation Rule Detail Modal (Figma & Functional Requirement) */}
      {selectedRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="font-mono text-xs font-bold text-[#0076D1] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {selectedRule.code}
                </span>
                <h2 className="text-base font-bold text-[#181C22] pt-1">
                  {t(selectedRule.name)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRule(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">{t("POINTS REWARD")}</span>
                <span className={`text-base font-bold ${selectedRule.pointDelta > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {selectedRule.pointDelta > 0 ? `+${selectedRule.pointDelta}` : selectedRule.pointDelta}  {t("Karma Points")}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">{t("MAX DAILY CAP")}</span>
                <span className="text-base font-bold text-slate-800">
                  {selectedRule.dailyCap > 0 ? t("{p0} Points", undefined, { p0: selectedRule.dailyCap }) : t("No Cap")}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-700">{t("Detailed Description")}</h4>
              <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                {selectedRule.description}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-700">{t("Eligibility & Restrictions")}</h4>
              <p className="text-slate-500">
                {t(selectedRule.eligibility)}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRule(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                {t("Close Rule Detail")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
