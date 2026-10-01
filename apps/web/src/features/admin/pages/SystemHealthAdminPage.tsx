import React, { useState } from 'react';
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
} from 'lucide-react';
import { mockHealthStatuses } from '../../../services/mockData';
import { mockAISensitivityConfig, AISensitivityConfig } from '../../../services/adminMockData';

export const SystemHealthAdminPage: React.FC = () => {
  const [healthList, setHealthList] = useState(mockHealthStatuses);
  const [aiConfig, setAiConfig] = useState<AISensitivityConfig>(mockAISensitivityConfig);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleRefreshHealth = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSaveNotice('Đã cập nhật chỉ số SLA & Health Telemetry toàn bộ 7 Microservices');
      setTimeout(() => setSaveNotice(null), 3000);
    }, 600);
  };

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotice('Đã đồng bộ ngưỡng nhạy cảm AI Content Moderation Engine lên Vertex AI');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">DevOps & Telemetry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Microservices SLA & AI Moderation Health
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Giám sát độ trễ, SLA 99.9% của 7 microservices và tinh chỉnh ngưỡng kiểm duyệt AI theo thời gian thực.
          </p>
        </div>

        <button
          onClick={handleRefreshHealth}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Pinging...' : 'Ping Telemetry'}</span>
        </button>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Cluster Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Overall Uptime SLA</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">99.98%</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Avg p95 Latency</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">22 ms</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Redis Cache Hit Rate</span>
          <p className="text-2xl font-black text-[#005da7] mt-1">98.4%</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">DB Connection Pool</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">48 / 100</p>
        </div>
      </div>

      {/* 7 Microservices SLA Status Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#005da7]" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Microservice Cluster Health</h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 font-bold">ALL 7 CLUSTERS HEALTHY</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {healthList.map((srv) => (
            <div key={srv.serviceName} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950/40" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{srv.serviceName}</span>
                  <div className="text-[10px] text-slate-400">Checked: {srv.lastChecked}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Uptime:</span>
                  <span className="font-mono font-bold text-emerald-600">{srv.uptimePercentage}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Latency:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{srv.latencyMs} ms</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
                  {srv.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Moderation Engine Sensitivity Threshold Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">AI Content Moderation Sensitivity Thresholds</h2>
              <p className="text-xs text-slate-400">Cấu hình mô hình Vertex AI Gemini 1.5 Pro quét nội dung tự động</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 border border-indigo-200">
            Realtime Scan: ON
          </span>
        </div>

        <form onSubmit={handleSaveAiConfig} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Toxicity Threshold */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div className="flex justify-between text-xs">
                <label className="font-bold text-slate-800 dark:text-slate-200">Độc hại / Xúc phạm (Toxicity):</label>
                <span className="font-mono font-bold text-[#005da7]">{(aiConfig.toxicityThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.99"
                step="0.05"
                value={aiConfig.toxicityThreshold}
                onChange={(e) => setAiConfig({ ...aiConfig, toxicityThreshold: parseFloat(e.target.value) })}
                className="w-full accent-[#005da7]"
              />
              <span className="text-[10px] text-slate-400 block">Nếu vượt quá ngưỡng này sẽ tự động gắn cờ kiểm duyệt.</span>
            </div>

            {/* Hate Speech */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div className="flex justify-between text-xs">
                <label className="font-bold text-slate-800 dark:text-slate-200">Thù địch / Công kích cá nhân (Hate Speech):</label>
                <span className="font-mono font-bold text-[#005da7]">{(aiConfig.hateSpeechThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.99"
                step="0.05"
                value={aiConfig.hateSpeechThreshold}
                onChange={(e) => setAiConfig({ ...aiConfig, hateSpeechThreshold: parseFloat(e.target.value) })}
                className="w-full accent-[#005da7]"
              />
              <span className="text-[10px] text-slate-400 block">Ngưỡng lọc ngôn từ gây thù hằn, phân biệt vùng miền.</span>
            </div>

            {/* Spam Threshold */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div className="flex justify-between text-xs">
                <label className="font-bold text-slate-800 dark:text-slate-200">Quảng cáo rác / Spam:</label>
                <span className="font-mono font-bold text-[#005da7]">{(aiConfig.spamThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.99"
                step="0.05"
                value={aiConfig.spamThreshold}
                onChange={(e) => setAiConfig({ ...aiConfig, spamThreshold: parseFloat(e.target.value) })}
                className="w-full accent-[#005da7]"
              />
              <span className="text-[10px] text-slate-400 block">Phát hiện link affiliate, bán tài liệu giả mạo.</span>
            </div>

            {/* Academic Dishonesty */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div className="flex justify-between text-xs">
                <label className="font-bold text-slate-800 dark:text-slate-200">Gian lận thi cử / Đề thi mật:</label>
                <span className="font-mono font-bold text-[#005da7]">{(aiConfig.academicDishonestyThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.99"
                step="0.05"
                value={aiConfig.academicDishonestyThreshold}
                onChange={(e) => setAiConfig({ ...aiConfig, academicDishonestyThreshold: parseFloat(e.target.value) })}
                className="w-full accent-[#005da7]"
              />
              <span className="text-[10px] text-slate-400 block">Quét phát hiện rao bán đề PE/FE trong giờ thi.</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#005da7] hover:bg-[#004a87] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Lưu Cấu Hình AI Sensitivity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
