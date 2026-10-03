import React, { useState } from 'react';
import { Cpu, Sparkles, Play, ShieldAlert, Sliders, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';

export const AIModerationPage: React.FC = () => {
  const [toxicityThreshold, setToxicityThreshold] = useState(85);
  const [duplicateThreshold, setDuplicateThreshold] = useState(75);
  const [isAutoScanEnabled, setIsAutoScanEnabled] = useState(true);
  const [runningJob, setRunningJob] = useState<string | null>(null);

  const runAITask = (taskName: string) => {
    setRunningJob(taskName);
    setTimeout(() => {
      setRunningJob(null);
      alert(`Đã hoàn tất tác vụ AI: ${taskName}`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-[#2563eb]" />
          <span>AI Content Processing & Moderation Control</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Cấu hình độ nhạy AI kiểm duyệt nội dung, phát hiện câu hỏi trùng lặp và kích hoạt tác vụ AI xử lý dữ liệu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trigger AI Processing Jobs */}
        <Card>
          <CardHeader>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Kích hoạt tác vụ AI (AI Content Processing)</span>
            </h3>
          </CardHeader>
          <CardBody className="p-5 space-y-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Trigger AI Tag Suggestion</h4>
                <p className="text-[11px] text-slate-400">Tự động phân tích và gợi ý Semantic Tags cho các bài viết chưa gắn tag.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => runAITask('Gợi ý Semantic Tags')}
                isLoading={runningJob === 'Gợi ý Semantic Tags'}
              >
                Chạy ngay
              </Button>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Trigger AI Course Summarization</h4>
                <p className="text-[11px] text-slate-400">Tóm tắt các tài liệu và đánh giá sinh viên thành bảng tổng hợp môn học.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => runAITask('Tóm tắt môn học')}
                isLoading={runningJob === 'Tóm tắt môn học'}
              >
                Chạy ngay
              </Button>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Duplicate Question Detection</h4>
                <p className="text-[11px] text-slate-400">Quét toàn bộ cơ sở dữ liệu câu hỏi để gắn cờ các câu hỏi trùng lặp nội dung.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => runAITask('Phát hiện câu hỏi trùng')}
                isLoading={runningJob === 'Phát hiện câu hỏi trùng'}
              >
                Chạy ngay
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* AI Moderation Threshold Settings */}
        <Card>
          <CardHeader>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#2563eb]" />
              <span>Ngưỡng nhạy cảm kiểm duyệt (AI Moderation)</span>
            </h3>
          </CardHeader>
          <CardBody className="p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">Ngưỡng lọc ngôn từ độc hại (Toxicity):</span>
                <span className="font-bold text-[#2563eb]">{toxicityThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={toxicityThreshold}
                onChange={(e) => setToxicityThreshold(Number(e.target.value))}
                className="w-full accent-[#2563eb] cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Bài viết vượt quá ngưỡng này sẽ tự động bị ẩn và chuyển sang hàng đợi kiểm duyệt.</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">Ngưỡng tương đồng trùng lặp (Duplicate Sim):</span>
                <span className="font-bold text-purple-600">{duplicateThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={duplicateThreshold}
                onChange={(e) => setDuplicateThreshold(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200">Realtime Content Scan</span>
                <p className="text-[10px] text-emerald-700">Tự động quét ngay khi sinh viên đăng bài</p>
              </div>
              <input
                type="checkbox"
                checked={isAutoScanEnabled}
                onChange={(e) => setIsAutoScanEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <Button variant="primary" className="w-full" onClick={() => alert('Đã lưu cấu hình ngưỡng AI thành công!')}>
              Lưu cấu hình AI
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

