import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  CheckCircle2,
  Clock,
  User,
  ArrowLeft,
  X,
} from 'lucide-react';
import { QuestionPost } from '../../types';

export interface VotingStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuestionPost;
  upvotesCount: number;
  downvotesCount?: number;
}

export const VotingStatsModal: React.FC<VotingStatsModalProps> = ({
  isOpen,
  onClose,
  question,
  upvotesCount,
  downvotesCount = 0,
}) => {
  if (!isOpen) return null;
  const { t } = useLanguage();

  const totalVotes = Math.max(1, upvotesCount + downvotesCount);
  const upvotePercent = upvotesCount + downvotesCount === 0 ? 0 : Math.round((upvotesCount / (upvotesCount + downvotesCount)) * 100);
  const downvotePercent = upvotesCount + downvotesCount === 0 ? 0 : 100 - upvotePercent;

  const votersHistory: Array<{
    id: string;
    name: string;
    role: string;
    vote: 'UP' | 'DOWN';
    karmaWeight: string;
    avatar?: string;
    time: string;
  }> = [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col z-10 overflow-hidden">
        {/* Header (Figma #91:2922) */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#F8F9FF]">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-[#181C22]">
              {t('votingStatsModal.title', 'Voting Stats Detail')}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Question Summary (Figma #91:2943) */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {question.courseCode && (
                  <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-blue-50 text-[#0076D1] border border-blue-100">
                    {question.courseCode}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {t('common.total', 'Tổng')} {totalVotes} {t('votingStatsModal.totalVotesRegistered', 'lượt vote được ghi nhận')}
                </span>
              </div>

              {question.isSolved && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t('votingStatsModal.verifiedSolution', 'Verified Solution')}</span>
                </span>
              )}
            </div>

            <h4 className="font-bold text-sm text-[#181C22] line-clamp-2">
              {question.title}
            </h4>

            <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
              <span>{t('votingStatsModal.askedBy', 'Asked by')} <strong className="text-slate-700">{question.author.fullName}</strong></span>
              <span>·</span>
              <span>
                {new Date(question.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* 3 Stat Cards in a row (Figma #91:2962) */}
          <div className="grid grid-cols-3 gap-3">
            {/* UPVOTES */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 tracking-wider">{t('votingStatsModal.upvotesLabel', 'UPVOTES')}</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <ThumbsUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-2">
                {upvotesCount}
              </div>
            </div>

            {/* DOWNVOTES */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 tracking-wider">{t('votingStatsModal.downvotesLabel', 'DOWNVOTES')}</span>
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <ThumbsDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-700 mt-2">
                {downvotesCount}
              </div>
            </div>

            {/* TOTAL VOTES */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-800 tracking-wider">{t('votingStatsModal.totalLabel', 'TOTAL')}</span>
                <div className="w-7 h-7 rounded-lg bg-[#0076D1]/10 flex items-center justify-center text-[#0076D1]">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#0076D1] mt-2">
                {totalVotes}
              </div>
            </div>
          </div>

          {/* Vote Distribution Progress Bar (Figma #91:2990) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs text-[#181C22]">{t('votingStatsModal.distributionTitle', 'Vote Distribution')}</h5>
              <span className="text-xs font-semibold text-emerald-700">
                {upvotePercent}% {t('votingStatsModal.positiveSuffix', 'Positive')}
              </span>
            </div>

            {/* Dual color progress bar */}
            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${upvotePercent}%` }}
                className="bg-emerald-500 transition-all duration-300"
              />
              <div
                style={{ width: `${downvotePercent}%` }}
                className="bg-rose-400 transition-all duration-300"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Upvotes: <strong>{upvotePercent}%</strong> ({upvotesCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>Downvotes: <strong>{downvotePercent}%</strong> ({downvotesCount})</span>
              </span>
            </div>
          </div>

          {/* Vote History List (View Vote History List requirement) */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-xs text-[#181C22] uppercase tracking-wider text-slate-500">
              {t('votingStatsModal.recentAuditLog', 'Recent Vote Audit Log')}
            </h5>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {votersHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  {t('votingStatsModal.noAuditHistory', 'Chưa có lịch sử vote nào được ghi nhận.')}
                </div>
              ) : (
                votersHistory.map((v) => (
                  <div key={v.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      {v.avatar && (
                        <img
                          src={v.avatar}
                          alt={v.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <span className="font-bold text-slate-800 block leading-tight">{v.name}</span>
                        <span className="text-[10px] text-slate-400">{v.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400">{v.time}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          v.vote === 'UP'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {v.vote === 'UP' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                        <span>{v.karmaWeight}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >{t('votingStatsModal.closeBtn', 'Close')}</button>
        </div>
      </div>
    </div>
  );
};
