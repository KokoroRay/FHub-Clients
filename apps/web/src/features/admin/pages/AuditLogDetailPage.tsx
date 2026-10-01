import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  Terminal,
  Cpu,
  Fingerprint,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { mockDetailedAuditLogs, DetailedAuditLog } from '../../../services/adminMockData';

export const AuditLogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const log: DetailedAuditLog =
    mockDetailedAuditLogs.find((l) => l.id === id) || mockDetailedAuditLogs[0];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/audit-logs"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#005da7] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Audit Logs
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Ledger Seal: ISO 27001 Certified</span>
      </div>

      {/* Header Banner Card (Figma 65:13172) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono font-black text-xl flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-black text-lg text-[#005da7]">{log.eventId}</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-500" />
                  SIGNATURE VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{log.service} • {log.action}</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">{log.details}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400">Timestamp (UTC+7)</span>
            <div className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">{log.timestamp}</div>
          </div>
        </div>

        {/* Actor Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block mb-0.5">Caller / Actor:</span>
            <p className="font-bold text-slate-900 dark:text-white">{log.actorEmail}</p>
            <span className="text-[11px] text-slate-400 font-mono">Role: {log.actorRole} ({log.actorId})</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block mb-0.5">Origin IP Address:</span>
            <p className="font-mono font-bold text-slate-900 dark:text-white">{log.ipAddress}</p>
            <span className="text-[11px] text-slate-400">{log.location}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block mb-0.5">Compliance Standard:</span>
            <p className="font-bold text-emerald-600">{log.isoStandardStamp}</p>
          </div>
        </div>
      </div>

      {/* Cryptographic Merkle Hash Chain Block */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md space-y-4 font-mono text-xs border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs text-slate-200 font-sans uppercase tracking-wider">
              Cryptographic Immutability Chain (SHA-256 Proof)
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
            MERKLE PROOF 100% MATCH
          </span>
        </div>

        <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-slate-800 text-[11px]">
          <div>
            <span className="text-slate-400 block mb-0.5 font-sans">Current Event Hash:</span>
            <p className="text-emerald-400 break-all select-all font-bold">{log.immutableHash}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-sans">Previous Block Hash (Parent):</span>
            <p className="text-sky-300 break-all select-all">{log.previousHash}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-sans">Merkle Root:</span>
            <p className="text-amber-300 break-all select-all">{log.merkleRoot}</p>
          </div>
        </div>
      </div>

      {/* Before vs After State Diff Viewer */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          State Mutation Diff (Before State ➔ After State)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before State */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Before State Payload:
            </span>
            <pre className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto border border-slate-200 dark:border-slate-700">
              {JSON.stringify(log.beforeStatePayload || { status: 'N/A' }, null, 2)}
            </pre>
          </div>

          {/* After State */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> After State Payload (Mutated):
            </span>
            <pre className="p-3.5 bg-emerald-50/50 dark:bg-slate-800 rounded-xl text-xs font-mono text-emerald-900 dark:text-emerald-300 overflow-x-auto border border-emerald-200 dark:border-emerald-800">
              {JSON.stringify(log.afterStatePayload || { status: 'MUTATED' }, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Client Telemetry & User Agent */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 text-xs">
        <h3 className="font-bold text-slate-400 uppercase text-[11px]">Client User-Agent Fingerprint</h3>
        <p className="font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 break-all">
          {log.userAgent}
        </p>
      </div>
    </div>
  );
};
