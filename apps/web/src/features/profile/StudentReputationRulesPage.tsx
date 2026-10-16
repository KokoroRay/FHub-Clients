import React, { useState } from 'react';
import { Award, Zap, Shield, Search, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

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

const DEFAULT_RULES: ReputationRuleItem[] = [
  {
    id: 'r-1',
    code: 'ANSWER_ACCEPTED',
    name: 'Answer Marked as Best Solution',
    category: 'DISCUSSION',
    pointDelta: 25,
    dailyCap: 150,
    description: 'Awarded when your answer is chosen by the question author as the best accepted solution.',
    eligibility: 'All verified students and alumni experts.',
  },
  {
    id: 'r-2',
    code: 'QUESTION_UPVOTED',
    name: 'Question Received Upvote',
    category: 'DISCUSSION',
    pointDelta: 5,
    dailyCap: 50,
    description: 'Awarded when peers find your question insightful, clear, and well-researched.',
    eligibility: 'All students.',
  },
  {
    id: 'r-3',
    code: 'ANSWER_UPVOTED',
    name: 'Answer Received Upvote',
    category: 'DISCUSSION',
    pointDelta: 10,
    dailyCap: 100,
    description: 'Awarded when your answer or explanation receives helpful upvotes from the community.',
    eligibility: 'All students.',
  },
  {
    id: 'r-4',
    code: 'ARTICLE_PUBLISHED',
    name: 'Curriculum Article Published',
    category: 'CONTENT',
    pointDelta: 30,
    dailyCap: 90,
    description: 'Awarded when your technical article or curated guide passes community standards and is published.',
    eligibility: 'Students with 50+ base karma.',
  },
  {
    id: 'r-5',
    code: 'STUDY_MATERIAL_DOWNLOADED',
    name: 'Study Material Reached 100 Downloads',
    category: 'ACADEMIC',
    pointDelta: 40,
    dailyCap: 120,
    description: 'Awarded when your shared lecture summary, exam prep slides, or code cheat sheet reaches 100 peer downloads.',
    eligibility: 'All students enrolled in the corresponding course.',
  },
  {
    id: 'r-6',
    code: 'COURSE_EVALUATION_HELPFUL',
    name: 'Course Evaluation Marked Helpful',
    category: 'ACADEMIC',
    pointDelta: 15,
    dailyCap: 60,
    description: 'Awarded when other students mark your detailed syllabus review and workload rating as helpful for registration.',
    eligibility: 'Verified course completers.',
  },
  {
    id: 'r-7',
    code: 'SPAM_FLAGGED',
    name: 'Content Flagged as Inappropriate',
    category: 'PENALTY',
    pointDelta: -50,
    dailyCap: -200,
    description: 'Deducted when a post is removed by moderators for violating academic integrity or spam rules.',
    eligibility: 'Any account with confirmed policy violation.',
  },
];

export const StudentReputationRulesPage: React.FC = () => {
  const [rules] = useState<ReputationRuleItem[]>(DEFAULT_RULES);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'DISCUSSION' | 'CONTENT' | 'ACADEMIC' | 'PENALTY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRule, setSelectedRule] = useState<ReputationRuleItem | null>(null);

  const filteredRules = rules.filter(r => {
    if (activeCategory !== 'ALL' && r.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#181C22]">Reputation & Karma Rules</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF5FF] text-[#0076D1] border border-[#BFDBFE]">
            {rules.length} Active Rules
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Learn how reputation points, karma badges, and community privileges are earned across FHub.
        </p>
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
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        <div className="relative pt-1 border-t border-slate-100">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search rules by name, action code, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
          />
        </div>
      </div>

      {/* Rules Grid */}
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
                  {rule.pointDelta > 0 ? `+${rule.pointDelta}` : rule.pointDelta} Karma
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#181C22] group-hover:text-[#0076D1] transition-colors">
                {rule.name}
              </h3>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {rule.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
              <span>Daily cap: {rule.dailyCap > 0 ? `${rule.dailyCap} pts` : 'No cap'}</span>
              <span className="inline-flex items-center gap-1 text-[#0076D1] font-semibold group-hover:underline">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

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
                  {selectedRule.name}
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
                <span className="text-slate-400 block font-mono text-[10px] uppercase">POINTS REWARD</span>
                <span className={`text-base font-bold ${selectedRule.pointDelta > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {selectedRule.pointDelta > 0 ? `+${selectedRule.pointDelta}` : selectedRule.pointDelta} Karma Points
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">MAX DAILY CAP</span>
                <span className="text-base font-bold text-slate-800">
                  {selectedRule.dailyCap > 0 ? `${selectedRule.dailyCap} Points` : 'No Cap'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-700">Detailed Description</h4>
              <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                {selectedRule.description}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-700">Eligibility & Restrictions</h4>
              <p className="text-slate-500">
                {selectedRule.eligibility}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRule(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                Close Rule Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
