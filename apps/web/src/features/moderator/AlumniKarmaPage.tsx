import React, { useState } from 'react';
import { Award, ShieldCheck, TrendingUp, Star, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';

export const AlumniKarmaPage: React.FC = () => {
  const [endorsedCount, setEndorsedCount] = useState(12);

  const leaderboard = [
    { rank: 1, name: 'Lê Hoàng Long', classOf: 'K13', role: 'Staff Engineer @ Tech Corp', karma: 2890, endorsedPosts: 24, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { rank: 2, name: 'Trần Đình Nam', classOf: 'K14', role: 'Solutions Architect', karma: 2310, endorsedPosts: 18, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
    { rank: 3, name: 'Phạm Quỳnh Nga', classOf: 'K15', role: 'Senior Product Manager', karma: 1950, endorsedPosts: 15, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Award className="w-6 h-6 text-[#005da7]" />
          <span>Alumni Endorsement Desk & Karma Leaderboard</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Kênh vinh danh Cựu sinh viên FPT (Alumni) và gắn huy hiệu bảo chứng chuyên môn (Endorsement Badge) cho các bài viết xuất sắc.
        </p>
      </div>

      {/* Alumni Endorsement Feature Box */}
      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/20">
        <CardBody className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Quyền hạn Cựu sinh viên (Alumni Endorsement)
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Là cựu sinh viên có nhiều năm kinh nghiệm trong ngành, bạn có quyền gắn huy hiệu <strong>"Alumni Endorsed"</strong> cho các bài viết, câu trả lời hoặc workflow có giá trị cao để tăng độ uy tín và nhân đôi điểm Karma cho tác giả.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
            <span className="text-amber-700">Đã bảo chứng: <strong>{endorsedCount} bài viết</strong></span>
            <Button variant="primary" size="sm" onClick={() => setEndorsedCount(endorsedCount + 1)}>
              Bảo chứng bài viết mới
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#005da7]" />
            <span>Bảng xếp hạng Cựu sinh viên đóng góp tích cực (Alumni Hall of Fame)</span>
          </h3>
        </CardHeader>
        <CardBody className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
          {leaderboard.map((item) => (
            <div key={item.rank} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-4">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                  item.rank === 1 ? 'bg-amber-400 text-slate-900' : item.rank === 2 ? 'bg-slate-300 text-slate-900' : 'bg-amber-700 text-white'
                }`}>
                  {item.rank}
                </span>
                <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.name}</h4>
                    <Badge variant="purple" size="sm">{item.classOf}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.role}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-sm text-[#005da7] font-mono block">{item.karma.toLocaleString()} Karma</span>
                <span className="text-[10px] text-slate-400">{item.endorsedPosts} bài bảo chứng</span>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
};
