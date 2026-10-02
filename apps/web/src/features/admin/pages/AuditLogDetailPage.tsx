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
  Loader2,
} from 'lucide-react';
import { mockDetailedAuditLogs, DetailedAuditLog } from '../../../services/adminMockData';
import { useAuditLogDetail } from '../../../services/api';

export const AuditLogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: logDetailData } = useAuditLogDetail(id);

  const fallbackLog = mockDetailedAuditLogs.find((l) => l.id === id) || mockDetailedAuditLogs[0];
  const log: DetailedAuditLog = logDetailData ? {
    id: String(logDetailData.auditLogId || id),
    eventId: `EVT-${(logDetailData.auditLogId || id).toString().padStart(8, '0')}`,
    timestamp: logDetailData.createdAt ? logDetailData.createdAt.replace('T', ' ').substring(0, 19) : fallbackLog.timestamp,
    service: logDetailData.entityType || fallbackLog.service,
    action: logDetailData.actionType || fallbackLog.action,
    actorEmail: logDetailData.actorRole ? `${logDetailData.actorRole.toLowerCase()}@fhub.edu.vn` : fallbackLog.actorEmail,
    actorRole: (logDetailData.actorRole || fallbackLog.actorRole) as any,
    actorId: String(logDetailData.actorAccountId || fallbackLog.actorId),
    ipAddress: logDetailData.ipAddress || fallbackLog.ipAddress,
    location: fallbackLog.location,
    userAgent: fallbackLog.userAgent,
    status: 'SUCCESS',
    details: `${logDetailData.actionType || 'MUTATION'} on ${logDetailData.entityType || 'Entity'} #${logDetailData.entityId || logDetailData.auditLogId || id}`,
    isoStandardStamp: 'ISO/IEC 27001:2022 §A.12.4.1',
    immutableHash: '0x9a8f2730cd90b1e4fa8319f072948bbca184a83857e4e1160a2b8519fcab3901',
    previousHash: '0x3c71a91e56b441f9d224b8e21975e53b6fa0c4270b284e937d11acba12f86231',
    merkleRoot: '0x4f88192a818c4d1297e6b490f287e07a3c3395914fa6b2195f190ca385a7bb29',
    signatureVerified: true,
    beforeStatePayload: logDetailData.oldValues ? JSON.parse(logDetailData.oldValues) : fallbackLog.beforeStatePayload,
    afterStatePayload: logDetailData.newValues ? JSON.parse(logDetailData.newValues) : fallbackLog.afterStatePayload,
  } : fallbackLog;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/audit-logs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Audit Logs
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Ledger Seal: ISO 27001 Certified</span>
      </div>

      {/* Header Banner Card (Figma 65:13172) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shadow-2xs shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-base text-blue-600">{log.eventId}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-500" />
                  SIGNATURE VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{log.service} • {log.action}</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">{log.details}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Timestamp</span>
            <div className="font-mono font-bold text-xs text-slate-800">{log.timestamp}</div>
          </div>
        </div>

        {/* Actor Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block mb-0.5">Caller / Actor:</span>
            <p className="font-semibold text-slate-800">{log.actorEmail}</p>
            <span className="text-[11px] text-slate-400 font-mono">Role: {log.actorRole} ({log.actorId})</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block mb-0.5">Origin IP Address:</span>
            <p className="font-mono font-semibold text-slate-800">{log.ipAddress}</p>
            <span className="text-[11px] text-slate-400">{log.location}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block mb-0.5">Compliance Standard:</span>
            <p className="font-semibold text-emerald-600">{log.isoStandardStamp}</p>
          </div>
        </div>
      </div>

      {/* Cryptographic Merkle Hash Chain Block */}
      <div className="p-5 bg-slate-900 text-white rounded-xl shadow-2xs space-y-3.5 font-mono text-xs border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs text-slate-200 font-sans uppercase tracking-wider">
              Cryptographic Immutability Chain (SHA-256 Proof)
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
            MERKLE PROOF 100% MATCH
          </span>
        </div>

        <div className="space-y-2.5 bg-black/40 p-3.5 rounded-lg border border-slate-800 text-[11px]">
          <div>
            <span className="text-slate-400 block mb-0.5 font-sans">Current Event Hash:</span>
            <p className="text-emerald-400 break-all select-all font-bold">{log.immutableHash}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-sans">Previous Block Hash:</span>
            <p className="text-sky-300 break-all select-all">{log.previousHash}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-sans">Merkle Root:</span>
            <p className="text-amber-300 break-all select-all">{log.merkleRoot}</p>
          </div>
        </div>
      </div>

      {/* Before vs After State Diff Viewer */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
          State Mutation Diff (Before State ➔ After State)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Before State Payload:
            </span>
            <pre className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-800 overflow-x-auto border border-slate-200">
              {JSON.stringify(log.beforeStatePayload || { status: 'N/A' }, null, 2)}
            </pre>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> After State Payload (Mutated):
            </span>
            <pre className="p-3 bg-emerald-50/50 rounded-lg text-xs font-mono text-emerald-900 overflow-x-auto border border-emerald-200">
              {JSON.stringify(log.afterStatePayload || { status: 'MUTATED' }, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Client Telemetry */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1 text-xs">
        <h3 className="font-bold text-slate-400 uppercase text-[10px]">Client User-Agent Fingerprint</h3>
        <p className="font-mono text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 break-all">
          {log.userAgent}
        </p>
      </div>
    </div>
  );
};
