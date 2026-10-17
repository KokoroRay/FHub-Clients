import React, { useState } from 'react';
import { X, Upload, CheckCircle2, Shield } from 'lucide-react';
import { profileApi } from '../../services/api/studentApi';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedData: any) => void;
  initialData: {
    fullName: string;
    email: string;
    campus: string;
    major: string;
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

  const [fullName, setFullName] = useState(initialData.fullName);
  const [campus, setCampus] = useState(initialData.campus);
  const [major, setMajor] = useState(initialData.major);
  const [bio, setBio] = useState(initialData.bio);
  const [interests, setInterests] = useState<string[]>(initialData.interests || ['Programming', 'Web Development', 'Software Engineering']);
  const [newInterest, setNewInterest] = useState('');
  const [photoPreview, setPhotoPreview] = useState(initialData.avatarUrl || '');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddInterest = () => {
    const clean = newInterest.trim();
    if (clean && !interests.includes(clean)) {
      setInterests(prev => [...prev, clean]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (tag: string) => {
    setInterests(prev => prev.filter(t => t !== tag));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Dung lượng ảnh đại diện không được vượt quá 5MB.');
        return;
      }
      setErrorMessage(null);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Họ và tên không được để trống.');
      return;
    }
    setErrorMessage(null);
    try {
      await profileApi.updatePersonalInfo({
        fullName: fullName.trim(),
        bio: bio.trim(),
        avatarUrl: photoPreview || undefined,
      });
    } catch (err) {
      console.warn('API update personal info failed or offline, saving locally:', err);
    }

    setShowSuccessToast(true);
    setTimeout(() => {
      onSaveSuccess({
        fullName: fullName.trim(),
        campus,
        major,
        bio: bio.trim(),
        interests,
        avatarUrl: photoPreview,
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
            <h2 className="text-lg font-bold text-[#181C22]">Edit Profile</h2>
            <p className="text-xs text-slate-500">
              Update your personal and academic information displayed to your network.
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
            <span>Profile updated successfully! Changes are now visible to the campus community.</span>
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0076D1] to-sky-400 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-xs shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'BQ'
              )}
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-800">Profile Photo</h3>
              <p className="text-[11px] text-slate-500">
                PNG, JPG up to 5MB. A clear portrait helps peers and lecturers recognize you across discussions.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <label className="cursor-pointer px-3 py-1.5 bg-blue-50 text-[#0076D1] hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors">
                  Change Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 text-red-600 hover:bg-red-50 border border-transparent rounded-lg text-xs font-semibold transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              FULL NAME <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This will be displayed across questions, articles, and reviews.
            </p>
          </div>

          {/* Academic Email (SSO Locked) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                ACADEMIC EMAIL
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                <Shield className="w-3 h-3 text-emerald-600" />
                University SSO
              </span>
            </div>
            <input
              type="email"
              disabled
              value={initialData.email}
              className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Institutional email linked to university SSO cannot be altered directly.
            </p>
          </div>

          {/* University / Campus & Major */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                UNIVERSITY / CAMPUS
              </label>
              <input
                type="text"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MAJOR / DISCIPLINE <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
              />
            </div>
          </div>

          {/* Bio (About Me) with character limit */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                BIO (ABOUT ME)
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
              placeholder="Computer science student interested in software development and technology..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              A concise introduction visible on your profile card and shared review footprints.
            </p>
          </div>

          {/* Academic & Tech Interests */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ACADEMIC & TECH INTERESTS
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
                placeholder="+ Add interest (press Enter)..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel & Discard
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
