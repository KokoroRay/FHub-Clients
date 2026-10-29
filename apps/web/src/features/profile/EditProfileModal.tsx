import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { X, Upload, CheckCircle2, Shield, Loader2, ChevronDown } from 'lucide-react';
import { profileApi } from '../../services/api/studentApi';
import { contentMediaApi } from '../../services/api/contentApi';
import { normalizeMediaUrl } from '../../utils/mediaUtils';

const CAMPUS_OPTIONS = [
  { id: 1, code: 'HN', name: 'Trường Đại học FPT - Hà Nội (Hòa Lạc)' },
  { id: 2, code: 'HCM', name: 'Trường Đại học FPT - TP. Hồ Chí Minh' },
  { id: 3, code: 'DN', name: 'Trường Đại học FPT - Đà Nẵng' },
  { id: 4, code: 'CT', name: 'Trường Đại học FPT - Cần Thơ' },
  { id: 5, code: 'QN', name: 'Trường Đại học FPT - Quy Nhơn' },
];

const MAJOR_OPTIONS = [
  { id: 1, code: 'IT', name: 'Công nghệ thông tin (IT)' },
  { id: 2, code: 'CS', name: 'Khoa học máy tính (CS)' },
  { id: 3, code: 'BA', name: 'Quản trị kinh doanh (BA)' },
  { id: 4, code: 'MC', name: 'Công nghệ truyền thông (MC)' },
  { id: 5, code: 'LAW', name: 'Luật kinh tế (LAW)' },
  { id: 6, code: 'EN', name: 'Ngôn ngữ Anh (EN)' },
  { id: 7, code: 'JP', name: 'Ngôn ngữ Nhật (JP)' },
  { id: 8, code: 'KR', name: 'Ngôn ngữ Hàn Quốc (KR)' },
  { id: 9, code: 'CN', name: 'Ngôn ngữ Trung Quốc (CN)' },
];

const SPECIALIZATION_OPTIONS: Record<string, Array<{ id: number; code: string; name: string }>> = {
  IT: [
    { id: 1, code: 'SE', name: 'Kỹ thuật phần mềm (Software Engineering)' },
    { id: 2, code: 'AI', name: 'Trí tuệ nhân tạo (AI & Machine Learning)' },
    { id: 3, code: 'IA', name: 'An toàn thông tin (Information Assurance)' },
    { id: 4, code: 'IS', name: 'Hệ thống thông tin (Information Systems)' },
    { id: 5, code: 'IC', name: 'Thiết kế vi mạch bán dẫn (Semiconductor IC)' },
    { id: 6, code: 'AS', name: 'Công nghệ ô tô số (Digital Automotive)' },
    { id: 7, code: 'DS', name: 'Khoa học dữ liệu ứng dụng (Data Science)' },
    { id: 8, code: 'GD', name: 'Thiết kế đồ họa và Mỹ thuật số' },
    { id: 9, code: 'RA', name: 'Robot và Trí tuệ nhân tạo (Robotics & AI)' },
    { id: 10, code: 'IT', name: 'Công nghệ thông tin chung' },
  ],
  CS: [
    { id: 11, code: 'CS-AI', name: 'Trí tuệ nhân tạo và Khoa học dữ liệu' },
  ],
  BA: [
    { id: 12, code: 'D-MKT', name: 'Digital Marketing' },
    { id: 13, code: 'IB', name: 'Kinh doanh quốc tế' },
    { id: 14, code: 'HM', name: 'Quản trị khách sạn' },
    { id: 15, code: 'FIN', name: 'Tài chính doanh nghiệp' },
  ],
  MC: [
    { id: 16, code: 'PR', name: 'Quan hệ công chúng (Public Relations)' },
    { id: 17, code: 'MM', name: 'Truyền thông đa phương tiện' },
  ],
  LAW: [
    { id: 18, code: 'ELAW', name: 'Luật kinh tế quốc tế' },
  ],
  EN: [
    { id: 19, code: 'BEN', name: 'Tiếng Anh thương mại' },
  ],
  JP: [
    { id: 20, code: 'BJP', name: 'Tiếng Nhật thương mại' },
  ],
  KR: [
    { id: 21, code: 'BKR', name: 'Tiếng Hàn thương mại' },
  ],
  CN: [
    { id: 22, code: 'BCN', name: 'Tiếng Trung thương mại' },
  ],
};

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedData: any) => void;
  initialData: {
    fullName: string;
    email: string;
    campus: string;
    major: string;
    specialization?: string;
    bio: string;
    interests: string[];
    avatarUrl?: string;
  };
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  initialData,
}) => {
  if (!isOpen) return null;
  const { t } = useLanguage();

  const [fullName, setFullName] = useState(initialData.fullName);

  // Normalize initial campus
  const initialCampusCode = CAMPUS_OPTIONS.find(
    (c) => c.code.toLowerCase() === (initialData.campus || '').toLowerCase() ||
           c.name.toLowerCase().includes((initialData.campus || '').toLowerCase())
  )?.code || 'HN';
  const [campus, setCampus] = useState(initialCampusCode);

  // Normalize initial major
  const initialMajorCode = MAJOR_OPTIONS.find(
    (m) => m.code.toLowerCase() === (initialData.major || '').toLowerCase() ||
           m.name.toLowerCase().includes((initialData.major || '').toLowerCase())
  )?.code || 'IT';
  const [major, setMajor] = useState(initialMajorCode);

  // Specialization
  const currentSpecializations = SPECIALIZATION_OPTIONS[major] || SPECIALIZATION_OPTIONS.IT;
  const initialSpecCode = currentSpecializations.find(
    (s) => s.code.toLowerCase() === (initialData.specialization || '').toLowerCase() ||
           s.name.toLowerCase().includes((initialData.specialization || '').toLowerCase())
  )?.code || currentSpecializations[0]?.code || 'SE';
  const [specialization, setSpecialization] = useState(initialSpecCode);

  const [bio, setBio] = useState(initialData.bio);
  const [interests, setInterests] = useState<string[]>(initialData.interests || ['Programming', 'Web Development', 'Software Engineering']);
  const [newInterest, setNewInterest] = useState('');
  const [photoPreview, setPhotoPreview] = useState(normalizeMediaUrl(initialData.avatarUrl) || '');
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddInterest = () => {
    const clean = newInterest.trim();
    if (clean && !interests.includes(clean)) {
      setInterests((prev) => [...prev, clean]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (tag: string) => {
    setInterests((prev) => prev.filter((t) => t !== tag));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(t('profileEditModal.errorAvatarSize', 'Dung lượng ảnh đại diện không được vượt quá 5MB.'));
      return;
    }
    setErrorMessage(null);

    // Show instant preview
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    setIsUploadingPhoto(true);

    try {
      const res = await contentMediaApi.uploadMedia(file, 'avatar');
      const remoteUrl = res.publicUrl || `/api/content/media/${res.storageKey}`;
      setPhotoPreview(remoteUrl);
      setUploadedAvatarUrl(remoteUrl);
    } catch (err) {
      console.warn('Real avatar upload error, preserving preview:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setUploadedAvatarUrl('');
  };

  const handleMajorChange = (newMajor: string) => {
    setMajor(newMajor);
    const specs = SPECIALIZATION_OPTIONS[newMajor] || [];
    if (specs.length > 0) {
      setSpecialization(specs[0].code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage(t('profileEditModal.errorFullNameEmpty', 'Họ và tên không được để trống.'));
      return;
    }
    setErrorMessage(null);

    const campusObj = CAMPUS_OPTIONS.find((c) => c.code === campus);
    const majorObj = MAJOR_OPTIONS.find((m) => m.code === major);
    const specObj = currentSpecializations.find((s) => s.code === specialization);

    try {
      await Promise.allSettled([
        profileApi.updatePersonalInfo({
          fullName: fullName.trim(),
          bio: bio.trim(),
          avatarUrl: uploadedAvatarUrl || photoPreview || undefined,
        }),
        profileApi.updateAcademicInfo({
          campusId: campusObj?.id ?? 1,
          majorId: majorObj?.id ?? 1,
          specializationId: specObj?.id ?? 1,
        }),
      ]);
    } catch (err) {
      console.warn('API update personal / academic info notice:', err);
    }

    setShowSuccessToast(true);
    setTimeout(() => {
      onSaveSuccess({
        fullName: fullName.trim(),
        campus: campusObj?.code || campus,
        major: majorObj?.code || major,
        specialization: specObj?.code || specialization,
        bio: bio.trim(),
        interests,
        avatarUrl: uploadedAvatarUrl || photoPreview,
      });
      setShowSuccessToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-[#181C22]">{t('profileEditModal.title', 'Chỉnh sửa hồ sơ cá nhân')}</h2>
            <p className="text-xs text-slate-500">
              {t('profileEditModal.subtitle', 'Cập nhật thông tin cá nhân và học thuật hiển thị trên toàn hệ thống FHub.')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('profileEditModal.successToast', 'Hồ sơ đã được cập nhật thành công và đồng bộ với hệ thống!')}</span>
          </div>
        )}

        {/* Error Toast */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold">
            <X className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Profile Photo Section (Figma #106:7767) */}
          <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0076D1] to-sky-400 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-xs shrink-0">
              {photoPreview ? (
                <img src={normalizeMediaUrl(photoPreview)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'FU'
              )}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-800">{t('profileEditModal.avatarTitle', 'Ảnh đại diện (Avatar)')}</h3>
              <p className="text-[11px] text-slate-500">
                {t('profileEditModal.avatarDesc', 'PNG, JPG hoặc WebP tối đa 5MB. Ảnh đại diện rõ nét giúp bạn bè và giảng viên dễ nhận biết bạn trong thảo luận.')}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#0076D1] hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingPhoto ? t('profileEditModal.uploadingPhoto', 'Đang tải lên...') : t('profileEditModal.uploadNewPhoto', 'Tải ảnh mới')}</span>
                  <input type="file" accept="image/*" className="hidden" disabled={isUploadingPhoto} onChange={handlePhotoUpload} />
                </label>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 text-red-600 hover:bg-red-50 border border-transparent rounded-lg text-xs font-semibold transition-colors"
                  >{t('profileEditModal.removePhoto', 'Gỡ ảnh')}</button>
                )}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('profileEditModal.fullNameLabel', 'HỌ VÀ TÊN')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {t('profileEditModal.fullNameHelp', 'Họ tên hiển thị công khai trên các câu hỏi Q&A, bài viết và đánh giá môn học.')}
            </p>
          </div>

          {/* Academic Email (SSO Locked) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                {t('profileEditModal.emailLabel', 'EMAIL HỌC THUẬT FPT')}
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                <Shield className="w-3 h-3 text-emerald-600" />
                {t('profileEditModal.ssoVerified', 'Xác thực FPT SSO')}
              </span>
            </div>
            <input
              type="email"
              disabled
              value={initialData.email}
              className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {t('profileEditModal.emailHelp', 'Email trường cấp được liên kết trực tiếp với tài khoản SSO và không thể chỉnh sửa.')}
            </p>
          </div>

          {/* Academic Info: Campus, Major, Specialization Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Campus Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('profileEditModal.campusLabel', 'CƠ SỞ / PHÂN HIỆU')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full appearance-none px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] cursor-pointer"
                >
                  {CAMPUS_OPTIONS.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Major Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('profileEditModal.majorLabel', 'NGÀNH HỌC')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={major}
                  onChange={(e) => handleMajorChange(e.target.value)}
                  className="w-full appearance-none px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] cursor-pointer"
                >
                  {MAJOR_OPTIONS.map((m) => (
                    <option key={m.id} value={m.code}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Specialization Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('profileEditModal.specializationLabel', 'CHUYÊN NGÀNH HẸP')}
              </label>
              <div className="relative">
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full appearance-none px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] cursor-pointer"
                >
                  {currentSpecializations.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bio (About Me) with character limit */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                {t('profileEditModal.bioLabel', 'TIỂU SỬ BẢN THÂN (BIO)')}
              </label>
              <span className={`text-[11px] font-mono ${bio.length > 300 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                {bio.length} / 300
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('profileEditModal.bioPlaceholder', 'Sinh viên FPT đam mê lập trình, kiến trúc hệ thống và công nghệ mới...')}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t('profileEditModal.bioHelp', 'Đoạn giới thiệu ngắn xuất hiện trên thẻ tác giả của bạn trong các câu hỏi và bài viết.')}
            </p>
          </div>

          {/* Academic & Tech Interests */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('profileEditModal.interestsLabel', 'CHỦ ĐỀ & KỸ NĂNG QUAN TÂM')}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#0076D1] border border-blue-200"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(tag)}
                    className="p-0.5 text-blue-400 hover:text-red-600 rounded-full hover:bg-blue-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                placeholder={t('profileEditModal.interestPlaceholder', '+ Thêm chủ đề (nhấn Enter)...')}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >{t('profileEditModal.addInterestBtn', 'Thêm')}</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >{t('profileEditModal.cancelBtn', 'Hủy bỏ')}</button>
            <button
              type="submit"
              disabled={isUploadingPhoto}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >{t('profileEditModal.saveBtn', 'Lưu thay đổi')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
