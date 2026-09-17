import React, { useState } from 'react';
import { Award, Plus, Edit2, Trash2, Zap, Star, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, Column } from '../../components/common/Table';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Tabs } from '../../components/common/Tabs';

interface BadgeRule {
  id: string;
  name: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  condition: string;
  karmaBonus: number;
  unlockedCount: number;
}

interface ReputationRule {
  id: string;
  action: string;
  points: number;
  type: 'ADD' | 'DEDUCT';
  description: string;
}

export const BadgeReputationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'badges' | 'karma'>('badges');

  const [badges] = useState<BadgeRule[]>([
    { id: 'b1', name: 'Code Champion', tier: 'GOLD', condition: 'Có trên 50 câu trả lời được Best Answer', karmaBonus: 500, unlockedCount: 38 },
    { id: 'b2', name: 'Knowledge Sharer', tier: 'SILVER', condition: 'Đóng góp 10+ workflows thực hành', karmaBonus: 250, unlockedCount: 65 },
    { id: 'b3', name: 'Top Reviewer', tier: 'BRONZE', condition: 'Đánh giá 5+ môn học chi tiết', karmaBonus: 100, unlockedCount: 120 },
    { id: 'b4', name: 'Alumni Mentor', tier: 'PLATINUM', condition: 'Cựu sinh viên hướng dẫn 3+ nhóm đồ án', karmaBonus: 1000, unlockedCount: 15 },
  ]);

  const [reputationRules] = useState<ReputationRule[]>([
    { id: 'r1', action: 'POST_UPVOTED', points: 10, type: 'ADD', description: 'Bài viết hoặc câu hỏi nhận được 1 Upvote' },
    { id: 'r2', action: 'BEST_ANSWER_ACCEPTED', points: 50, type: 'ADD', description: 'Câu trả lời được tác giả chọn làm Best Answer' },
    { id: 'r3', action: 'MOD_VERIFIED_BADGE', points: 30, type: 'ADD', description: 'Câu trả lời được Moderator xác thực chuẩn xác' },
    { id: 'r4', action: 'POST_DOWNVOTED', points: 5, type: 'DEDUCT', description: 'Bài viết nhận được 1 Downvote' },
    { id: 'r5', action: 'CONTENT_FLAGGED_VIOLATION', points: 100, type: 'DEDUCT', description: 'Nội dung bị xóa do vi phạm tiêu chuẩn cộng đồng' },
  ]);

  const badgeColumns: Column<BadgeRule>[] = [
    {
      header: 'Tên Huy hiệu & Tier',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
            <Badge variant={item.tier === 'PLATINUM' ? 'purple' : item.tier === 'GOLD' ? 'warning' : 'neutral'} size="sm" className="ml-2">
              {item.tier}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      header: 'Điều kiện mở khóa',
      accessorKey: 'condition',
      cell: (item) => <span className="text-xs text-slate-600 dark:text-slate-300">{item.condition}</span>,
    },
    {
      header: 'Thưởng Karma',
      accessorKey: 'karmaBonus',
      cell: (item) => <span className="font-bold text-emerald-600">+{item.karmaBonus} pts</span>,
      className: 'w-32',
    },
    {
      header: 'Số người đạt',
      accessorKey: 'unlockedCount',
      cell: (item) => <span className="font-bold font-mono text-slate-500">{item.unlockedCount} sinh viên</span>,
      className: 'w-32',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#005da7]" />
            <span>Badges & Reputation Rule Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thiết lập quy tắc cấp Huy hiệu vinh danh và tính điểm danh tiếng Karma (Interaction Service).
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'badges', label: 'Quy tắc Huy hiệu (Badge Rules)', icon: <Award className="w-4 h-4" /> },
          { id: 'karma', label: 'Quy tắc Điểm Karma (Reputation)', icon: <Zap className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      {activeTab === 'badges' ? (
        <Table columns={badgeColumns} data={badges} keyExtractor={(b) => b.id} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reputationRules.map((r) => (
            <Card key={r.id}>
              <CardBody className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">{r.action}</span>
                    <Badge variant={r.type === 'ADD' ? 'success' : 'danger'} size="sm">
                      {r.type === 'ADD' ? `+${r.points} Karma` : `-${r.points} Karma`}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{r.description}</p>
                </div>
                <Button variant="outline" size="sm">Sửa</Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
