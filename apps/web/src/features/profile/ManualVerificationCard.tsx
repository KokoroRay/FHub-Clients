import React, { useState, useEffect } from 'react';
import { BadgeCheck, Clock, XCircle, Send, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';
import {
  manualVerificationStudentApi,
  ManualVerificationRecord,
} from '../../services/api/studentApi';
import { contentMediaApi } from '../../services/api/contentApi';

export const ManualVerificationCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [existingReq, setExistingReq] = useState<ManualVerificationRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [verificationType, setVerificationType] = useState<'STUDENT_ID' | 'ORGANIZATION' | 'PROFESSIONAL'>('STUDENT_ID');
  const [studentCode, setStudentCode] = useState(currentUser?.studentId || '');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [requestReason, setRequestReason] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const uid = Number(currentUser?.id);
    if (!uid || Number.isNaN(uid)) return;
    let mounted = true;
    setLoading(true);
    manualVerificationStudentApi
      .getByUserId(uid)
      .then((rec) => {
        if (mounted) setExistingReq(rec);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [currentUser?.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const uploaded = await contentMediaApi.uploadMedia(file, 'verification', currentUser?.id);
      if (uploaded?.publicUrl) {
        setEvidenceUrl(uploaded.publicUrl);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || t('Không thể tải ảnh minh chứng. Bạn có thể dán URL trực tiếp.'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (verificationType === 'STUDENT_ID' && !studentCode.trim()) {
      setErrorMsg(t('Vui lòng nhập Mã sinh viên (MSSV) khi xác minh thẻ sinh viên.'));
      return;
    }

    setSubmitting(true);
    try {
      const created = await manualVerificationStudentApi.submitRequest({
        verificationType,
        studentCode: studentCode.trim() || undefined,
        evidenceUrl: evidenceUrl.trim() || undefined,
        requestReason: requestReason.trim() || undefined,
      });
      setExistingReq(created);
      setSuccessMsg(
        t('Đã gửi yêu cầu xác minh thành công! Hồ sơ của bạn đang chờ Admin/Moderator duyệt.')
      );
      setIsModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        t('Không thể gửi yêu cầu xác minh. Vui lòng thử lại.');
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = () => {
    const st = (existingReq?.status || '').toUpperCase();
    if (st === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <BadgeCheck className="w-3 h-3" /> {t('Đã duyệt')}
        </span>
      );
    }
    if (st === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <Clock className="w-3 h-3" /> {t('Chờ duyệt')}
        </span>
      );
    }
    if (st === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
          <XCircle className="w-3 h-3" /> {t('Từ chối')}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {t('Chưa gửi')}
      </span>
    );
  };

  const canSubmitNew = !existingReq || existingReq.status?.toUpperCase() === 'REJECTED';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-[#0076D1]" />
          <span>{t('settings.manualVerificationTitle', 'Xác minh Vai trò & Thẻ SV')}</span>
        </h3>
        {statusBadge()}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        {t(
          'settings.manualVerificationDesc',
          'Gửi thẻ sinh viên hoặc minh chứng để Admin/Moderator xét duyệt thủ công (Student ID, Cựu sinh viên Alumni, hoặc Tổ chức).'
        )}
      </p>

      {successMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('Đang kiểm tra trạng thái...')}
        </div>
      ) : existingReq ? (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-[11px] space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">{t('Loại xác minh:')}</span>
            <strong className="text-slate-800 dark:text-slate-200">{existingReq.verificationType}</strong>
          </div>
          {existingReq.studentCode && (
            <div className="flex justify-between">
              <span className="text-slate-500">{t('MSSV:')}</span>
              <strong className="text-slate-800 dark:text-slate-200">{existingReq.studentCode}</strong>
            </div>
          )}
          {existingReq.decisionNote && (
            <p className="text-slate-600 dark:text-slate-300 pt-1 italic">
              "{existingReq.decisionNote}"
            </p>
          )}
        </div>
      ) : null}

      {canSubmitNew && (
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => {
            setErrorMsg(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Send className="w-3.5 h-3.5" />}
        >
          {t('Gửi yêu cầu xác minh')}
        </Button>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('Gửi yêu cầu xác minh thủ công (Manual Verification)')}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('Hủy')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting || uploading}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              {submitting ? t('Đang gửi...') : t('Gửi xét duyệt')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              {errorMsg}
            </div>
          )}

          <Select
            label={t('Loại xác minh')}
            value={verificationType}
            onChange={(e) =>
              setVerificationType(e.target.value as 'STUDENT_ID' | 'ORGANIZATION' | 'PROFESSIONAL')
            }
            options={[
              { value: 'STUDENT_ID', label: t('STUDENT_ID — Xác minh Thẻ sinh viên FPT') },
              { value: 'PROFESSIONAL', label: t('PROFESSIONAL — Xác minh Cựu sinh viên (Alumni) / Chuyên gia') },
              { value: 'ORGANIZATION', label: t('ORGANIZATION — Xác minh Tổ chức / Đại diện Nhà trường') },
            ]}
          />

          <Input
            label={
              verificationType === 'STUDENT_ID'
                ? t('Mã sinh viên (MSSV) *')
                : t('Mã sinh viên / Mã định danh (tùy chọn)')
            }
            placeholder={t('Ví dụ: CE181522 hoặc HE140001')}
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            required={verificationType === 'STUDENT_ID'}
          />

          <div className="space-y-2">
            <Input
              label={t('Link ảnh minh chứng (Thẻ SV / Bằng tốt nghiệp)')}
              placeholder="https://..."
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
            />
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-semibold">
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploading ? t('Đang tải ảnh...') : t('Hoặc tải ảnh minh chứng từ máy')}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <Textarea
            label={t('Lý do / Ghi chú gửi Admin & Moderator')}
            placeholder={t('Ví dụ: Em nộp ảnh thẻ sinh viên để xác minh tài khoản FPTU Cần Thơ...')}
            rows={3}
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
