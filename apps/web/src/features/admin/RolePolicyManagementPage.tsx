import React, { useState } from 'react';
import { KeyRound, Shield, Plus, Check, X, Users, Lock } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';

interface Policy {
  id: string;
  name: string;
  description: string;
  service: string;
}

interface RoleItem {
  id: string;
  name: string;
  description: string;
  policies: string[];
}

export const RolePolicyManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'policies'>('roles');

  const [policies, setPolicies] = useState<Policy[]>([
    { id: 'p1', name: 'CAN_LOCK_DISCUSSION', description: 'Quyền khóa hoặc mở khóa topic thảo luận', service: 'Governance' },
    { id: 'p2', name: 'CAN_HIDE_CONTENT', description: 'Quyền ẩn/hiện nội dung vi phạm tiêu chuẩn cộng đồng', service: 'Governance' },
    { id: 'p3', name: 'CAN_VERIFY_ANSWER', description: 'Quyền gắn nhãn Mod Verified cho câu trả lời', service: 'Governance' },
    { id: 'p4', name: 'CAN_POST_BROADCAST', description: 'Quyền đăng thông báo chính thức toàn trường', service: 'Content' },
    { id: 'p5', name: 'CAN_ENDORSE_ALUMNI', description: 'Quyền gắn huy hiệu bảo chứng cho bài viết chuyên sâu', service: 'Governance' },
    { id: 'p6', name: 'CAN_MANAGE_CAMPUS', description: 'Quyền thêm/sửa/xóa Campus và Taxonomy', service: 'Academic Taxonomy' },
  ]);

  const [roles, setRoles] = useState<RoleItem[]>([
    { id: 'r1', name: 'Admin', description: 'Toàn quyền quản trị hệ thống', policies: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'] },
    { id: 'r2', name: 'Staff', description: 'Cán bộ quản trị và vận hành', policies: ['p1', 'p2', 'p4'] },
    { id: 'r3', name: 'Community Moderator', description: 'Điều hành viên diễn đàn sinh viên', policies: ['p1', 'p2', 'p3'] },
    { id: 'r4', name: 'School Representative', description: 'Đại diện truyền thông và thông báo', policies: ['p4'] },
    { id: 'r5', name: 'Alumni', description: 'Cựu sinh viên & Cố vấn chuyên môn', policies: ['p5'] },
  ]);

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicyDesc, setNewPolicyDesc] = useState('');
  const [newPolicyService, setNewPolicyService] = useState('Governance');

  const togglePolicyInRole = (roleId: string, policyId: string) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        const exists = r.policies.includes(policyId);
        return {
          ...r,
          policies: exists ? r.policies.filter((p) => p !== policyId) : [...r.policies, policyId],
        };
      })
    );
  };

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyName.trim()) return;

    const newP: Policy = {
      id: `p-${Date.now()}`,
      name: newPolicyName.toUpperCase().replace(/\s+/g, '_'),
      description: newPolicyDesc,
      service: newPolicyService,
    };
    setPolicies([...policies, newP]);
    setIsPolicyModalOpen(false);
    setNewPolicyName('');
    setNewPolicyDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-[#005da7]" />
            <span>Role & Policy Management (IAM)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản trị phân quyền truy cập, danh sách vai trò và chính sách bảo mật (Identity Service).
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsPolicyModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Tạo Policy mới
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'roles', label: 'Quản lý Roles & Gán Policy', icon: <Shield className="w-4 h-4" /> },
          { id: 'policies', label: 'Danh mục Policies', count: policies.length, icon: <Lock className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      {activeTab === 'roles' ? (
        <div className="space-y-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardBody className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{role.name}</h3>
                      <Badge variant="purple" size="sm">{role.policies.length} Policies</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{role.description}</p>
                  </div>
                </div>

                {/* Policies matrix for this role */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    Bật / Tắt chính sách áp dụng cho vai trò này:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {policies.map((p) => {
                      const isAttached = role.policies.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePolicyInRole(role.id, p.id)}
                          className={`flex items-start gap-2 p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                            isAttached
                              ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-[#005da7]'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center text-white shrink-0 mt-0.5 ${isAttached ? 'bg-[#005da7]' : 'bg-slate-300'}`}>
                            {isAttached && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <span className="font-mono font-bold block text-[11px]">{p.name}</span>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{p.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p) => (
            <Card key={p.id}>
              <CardBody className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">{p.service}</Badge>
                  <span className="text-[10px] font-mono text-slate-400">ID: {p.id}</span>
                </div>
                <h4 className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">{p.name}</h4>
                <p className="text-xs text-slate-500">{p.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create Policy Modal */}
      <Modal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        title="Định nghĩa Security Policy mới"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPolicyModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreatePolicy}>Tạo Policy</Button>
          </>
        }
      >
        <form onSubmit={handleCreatePolicy} className="space-y-4 text-xs">
          <Input
            label="Tên Policy (Mã định danh)"
            placeholder="CAN_EXPORT_GLOBAL_REPORT"
            value={newPolicyName}
            onChange={(e) => setNewPolicyName(e.target.value)}
            required
          />
          <Input
            label="Service sở hữu"
            placeholder="Governance / Identity / Academic Taxonomy"
            value={newPolicyService}
            onChange={(e) => setNewPolicyService(e.target.value)}
          />
          <Textarea
            label="Mô tả chức năng và phạm vi cho phép của Policy"
            rows={3}
            value={newPolicyDesc}
            onChange={(e) => setNewPolicyDesc(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
