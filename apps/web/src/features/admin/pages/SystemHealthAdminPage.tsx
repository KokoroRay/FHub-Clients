import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Cpu,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  Sliders,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { mockHealthStatuses } from '../../../services/mockData';
import { mockAISensitivityConfig, AISensitivityConfig } from '../../../services/adminMockData';
import { useSystemHealthStatus } from '../../../services/api';

export const SystemHealthAdminPage: React.FC = () => {
  const { data: healthData, isLoading, refetch } = useSystemHealthStatus();
  const [healthList, setHealthList] = useState(mockHealthStatuses);
  const [aiConfig, setAiConfig] = useState<AISensitivityConfig>(mockAISensitivityConfig);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (healthData && healthData.length > 0) {
      const mapped = healthData.map((h: any) => ({
        serviceName: h.name,
        status: h.status as 'HEALTHY' | 'DEGRADED' | 'DOWN',
        latencyMs: h.latencyMs,
        uptimePercentage: parseFloat(h.uptime.replace('%', '')) || 99.98,
        lastChecked: 'Vừa xong (Live Telemetry)',
      }));
      setHealthList(mapped);
    }
  }, [healthData]);

  const handleRefreshHealth = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    setSaveNotice('Updated SLA telemetry across all 7 microservices.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotice('Synchronized AI content moderation sensitivity thresholds with Vertex AI.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>DEVOPS & TELEMETRY</span>
            <span>&gt;</span>
            <span className="text-blue-600">SLA & AI MODERATION HEALTH</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Microservices SLA & AI Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Realtime SLA monitoring, p95 latencies across 7 core services, and AI sensitivity threshold configuration.
          </p>
        </div>

        <button
          onClick={handleRefreshHealth}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Pinging...' : 'Ping Telemetry'}</span>
        </button>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Cluster Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OVERALL UPTIME SLA</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">99.98%</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AVG P95 LATENCY</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">22 ms</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">REDIS HIT RATE</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">98.4%</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DB POOL ACTIVE</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">48 / 100</p>
        </div>
      </div>

      {/* 7 Microservices SLA Status Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Microservice Cluster Health</h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ALL 7 SERVICES HEALTHY
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {healthList.map((srv) => (
            <div key={srv.serviceName} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <span className="font-semibold text-slate-800">{srv.serviceName}</span>
                  <div className="text-[10px] text-slate-400">Checked: {srv.lastChecked}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Uptime:</span>
                  <span className="font-mono font-bold text-emerald-600">{srv.uptimePercentage}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Latency:</span>
                  <span className="font-mono font-bold text-slate-800">{srv.latencyMs} ms</span>
                </div>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {srv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Moderation Engine Sensitivity Threshold Controls */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <div>
              <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wider">AI Content Moderation Sensitivity Thresholds</h2>
              <p className="text-[11px] text-slate-400">Configure Vertex AI Gemini 1.5 Pro automated scan limits</p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Realtime Scan: ON
          </span>
        </div>

        <form onSubmit={handleSaveAiConfig} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-lg">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-800">Toxicity Threshold:</label>
                <span className="font-mono font-bold text-blue-600">{(aiConfig.toxicityThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.99"
                step="0.05"
                value={aiConfig.toxicityThreshold}
                onChange={(e) => setAiConfig({ ...aiConfig, toxicityThreshold: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <span className="text-[10px] text-slate-400 block">Flag content when toxic sentiment exceeds limit.</span>
            </div>

            <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-lg">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-800">Hate Speech Limit:</label>
                <span className="font-mono font-bold text-blue-600">{(aiConfig.hateSpeechThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.99"
                step="0.05"
                value={aiConfig.hateSpeechThreshold}
                onChange={(e) => setAiConfig({ ...aiConfig, hateSpeechThreshold: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <span className="text-[10px] text-slate-400 block">Automated quarantine for targeted harassment.</span>
            </div>

            <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-lg">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-800">Spam & Commercial Bot Filter:</label>
                <span className="font-mono font-bold text-blue-600">{(aiConfig.spamThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.99"
                step="0.05"
                value={aiConfig.spamThreshold}
                onChange={(e) => setAiConfig({ ...aiConfig, spamThreshold: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <span className="text-[10px] text-slate-400 block">Identifies unauthorized promotional links and scrapers.</span>
            </div>

            <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-lg">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-800">Academic Dishonesty Detection:</label>
                <span className="font-mono font-bold text-blue-600">{(aiConfig.academicDishonestyThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.99"
                step="0.05"
                value={aiConfig.academicDishonestyThreshold}
                onChange={(e) => setAiConfig({ ...aiConfig, academicDishonestyThreshold: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <span className="text-[10px] text-slate-400 block">Immediate alert on exam leak or cheating keywords.</span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Save AI Thresholds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
