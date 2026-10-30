import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Eye, 
  Tag, 
  ShieldCheck, 
  Laptop, 
  Download, 
  X, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  BookOpen,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';
import { useTheme, AppTheme } from '../../context/ThemeContext';
import { profileApi } from '../../services/api/studentApi';
import { getHideOutOfMajorCompactSetting, setHideOutOfMajorCompactSetting } from '../../utils/courseFilter';

export const ProfileSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  // Feed & Interface Preferences
  const [defaultFeed, setDefaultFeed] = useState<'global' | 'courses' | 'workflows'>('global');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [hideOutOfMajorCompact, setHideOutOfMajorCompact] = useState<boolean>(getHideOutOfMajorCompactSetting);

  // Privacy & Visibility
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'community'>('public');
  const [showAcademicInfo, setShowAcademicInfo] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);
  const [showContributionActivity, setShowContributionActivity] = useState(true);

  // Muted Tags
  const [mutedTags, setMutedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'session-current',
      device: typeof navigator !== 'undefined' && navigator.userAgent.includes('Windows') ? 'Windows PC · Trình duyệt hiện tại' : 'Thiết bị hiện tại',
      location: 'Việt Nam',
      ip: '127.0.0.1',
      lastActive: 'Đang hoạt động',
      isCurrent: true
    }
  ]);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // 1. Load from localStorage cache first
    try {
      const localPrefsStr = localStorage.getItem('fhub_user_preferences');
      if (localPrefsStr) {
        const p = JSON.parse(localPrefsStr);
        // LanguageProvider already restores the explicit language selection.
        if (p.defaultFeed) setDefaultFeed(p.defaultFeed);
        if (p.themeMode && (p.themeMode === 'light' || p.themeMode === 'dark')) {
          setTheme(p.themeMode);
        }
        if (typeof p.emailNotifications === 'boolean') setEmailNotifications(p.emailNotifications);
        if (typeof p.inAppNotifications === 'boolean') setInAppNotifications(p.inAppNotifications);
        if (typeof p.hideOutOfMajorCompact === 'boolean') setHideOutOfMajorCompact(p.hideOutOfMajorCompact);
        if (p.profileVisibility) setProfileVisibility(p.profileVisibility);
        if (typeof p.showAcademicInfo === 'boolean') setShowAcademicInfo(p.showAcademicInfo);
        if (typeof p.allowDirectMessages === 'boolean') setAllowDirectMessages(p.allowDirectMessages);
        if (typeof p.showContributionActivity === 'boolean') setShowContributionActivity(p.showContributionActivity);
        if (Array.isArray(p.mutedTags)) setMutedTags(p.mutedTags);
      }
    } catch {}

    // 2. Sync from backend API
    const fetchUserPrefs = async () => {
      try {
        const prefs: any = await profileApi.getMyPreferences();
        if (prefs) {
          if (prefs.privacy) {
            if (typeof prefs.privacy.showActivity === 'boolean') {
              setShowContributionActivity(prefs.privacy.showActivity);
            }
            if (prefs.privacy.profileVisibility) {
              setProfileVisibility(prefs.privacy.profileVisibility.toLowerCase() as any);
            }
          }
          if (prefs.feedPreferenceJson) {
            try {
              const feedObj = JSON.parse(prefs.feedPreferenceJson);
              // Do not replace a newer local selection with a stale API response.
              if (feedObj.language && !localStorage.getItem('fhub_language')) setLanguage(feedObj.language);
              if (feedObj.defaultFeed) setDefaultFeed(feedObj.defaultFeed);
              if (feedObj.themeMode && (feedObj.themeMode === 'light' || feedObj.themeMode === 'dark')) {
                setTheme(feedObj.themeMode);
              }
              if (typeof feedObj.emailNotifications === 'boolean') setEmailNotifications(feedObj.emailNotifications);
              if (typeof feedObj.inAppNotifications === 'boolean') setInAppNotifications(feedObj.inAppNotifications);
              if (typeof feedObj.hideOutOfMajorCompact === 'boolean') {
                setHideOutOfMajorCompact(feedObj.hideOutOfMajorCompact);
                setHideOutOfMajorCompactSetting(feedObj.hideOutOfMajorCompact);
              }
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Could not load preferences from Profile API, using defaults/cached:', err);
      }
    };

    fetchUserPrefs();
  }, [setLanguage, setTheme]);

  const handleAddMutedTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !mutedTags.includes(trimmed)) {
      setMutedTags([...mutedTags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveMutedTag = (tagToRemove: string) => {
    setMutedTags(mutedTags.filter(t => t !== tagToRemove));
  };

  const handleRevokeSession = (sessionId: string) => {
    setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
  };

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: {
          id: currentUser?.id,
          fullName: currentUser?.fullName,
          email: currentUser?.email,
          studentId: currentUser?.studentId,
          campus: currentUser?.campus,
          major: currentUser?.major,
          role: currentUser?.role,
        },
        preferences: {
          language,
          theme,
          defaultFeed,
          emailNotifications,
          inAppNotifications,
          hideOutOfMajorCompact,
          profileVisibility,
          showAcademicInfo,
          allowDirectMessages,
          showContributionActivity,
          mutedTags,
        }
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fhub_personal_data_export_${Date.now()}.json`;
      a.click();
    }, 1000);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      setHideOutOfMajorCompactSetting(hideOutOfMajorCompact);

      const localPrefs = {
        language,
        defaultFeed,
        themeMode: theme,
        emailNotifications,
        inAppNotifications,
        hideOutOfMajorCompact,
        profileVisibility,
        showAcademicInfo,
        allowDirectMessages,
        showContributionActivity,
        mutedTags,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('fhub_user_preferences', JSON.stringify(localPrefs));

      await Promise.allSettled([
        profileApi.updatePrivacySettings({
          profileVisibility,
          allowSearchEngineIndexing: true,
          showVoteHistory: showContributionActivity,
          showContributionHistory: showContributionActivity,
        }),
        profileApi.updateFeedPreferences({
          language: language as any,
          defaultFeed,
          themeMode: theme as any,
          emailNotifications,
          inAppNotifications,
          showAcademicInfo,
          allowDirectMessages,
          hideOutOfMajorCompact,
        })
      ]);
    } catch (err) {
      console.warn('Could not save settings to Profile service:', err);
    } finally {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    }
  };

  const handleResetDefaults = () => {
    setLanguage('vi');
    setDefaultFeed('global');
    setTheme('light');
    setEmailNotifications(true);
    setInAppNotifications(true);
    setProfileVisibility('public');
    setShowAcademicInfo(true);
    setAllowDirectMessages(true);
    setShowContributionActivity(true);
    setMutedTags([]);
  };

  return (
    <div className="w-full pb-16 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('settings.pageTitle', 'Preferences & Privacy')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('settings.pageSubtitle', 'Manage your display settings, content tuning, and privacy controls.')}
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm font-semibold shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t('settings.savedSuccess', 'All changes were successfully updated to your cloud profile!')}</span>
        </div>
      )}

      {/* Main 2-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Settings Sections */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Feed & Interface Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#0076D1]" />
                <span>{t('settings.feedSectionTitle', 'Feed & Interface Preferences')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('settings.feedSectionDesc', 'Customize default views, language, and notification alert thresholds.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Language Selection: 3 Languages (Việt, Anh, Nhật) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#0076D1]" />
                  <span>{t('settings.displayLanguage', 'Display Language')}</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] cursor-pointer"
                >
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="ja">🇯🇵 日本語</option>
                </select>
              </div>

              {/* Default Feed */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('settings.defaultFeed', 'Default Feed')}
                </label>
                <select
                  value={defaultFeed}
                  onChange={(e) => setDefaultFeed(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] cursor-pointer"
                >
                  <option value="global">{t('settings.defaultFeedGlobal', 'Global Feed')}</option>
                  <option value="courses">{t('settings.defaultFeedCourses', 'Course Hub')}</option>
                  <option value="workflows">{t('settings.defaultFeedWorkflows', 'Curated Workflows')}</option>
                </select>
              </div>
            </div>

            {/* Theme Mode: 2 main themes (Light & Dark) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('settings.themeMode', 'Theme Mode')}
              </label>
              <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700">
                {(['light', 'dark'] as const).map((mode) => {
                  const isSelected = theme === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTheme(mode as AppTheme)}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-slate-700 text-[#0076D1] dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {mode === 'light' ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('settings.themeLight', 'Sáng (Light)')}</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{t('settings.themeDark', 'Tối (Dark)')}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notifications toggles */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#0076D1] transition-colors">
                    {t('settings.emailNotifications', 'Email Notifications')}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('settings.emailNotificationsDesc', 'Receive email digests and critical replies to your university mailbox.')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0076D1] focus:ring-blue-200 border-slate-300 dark:border-slate-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#0076D1] transition-colors">
                    {t('settings.inAppNotifications', 'In-app Notifications')}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('settings.inAppNotificationsDesc', 'Sound & banner alerts for mentions, answers, and study group invitations.')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={inAppNotifications}
                  onChange={(e) => setInAppNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0076D1] focus:ring-blue-200 border-slate-300 dark:border-slate-600 cursor-pointer"
                />
              </label>

              <label className="flex items-start justify-between cursor-pointer group pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="pr-4">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#0076D1]" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#0076D1] transition-colors">
                      {t('settings.outOfMajorFilter', 'Ẩn môn ngoài ngành trong danh sách thu gọn')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {t('settings.outOfMajorFilterDesc', 'Tự động rút gọn danh sách môn học theo đúng chuyên ngành hiện tại của bạn.')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hideOutOfMajorCompact}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHideOutOfMajorCompact(checked);
                    setHideOutOfMajorCompactSetting(checked);
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 2000);
                  }}
                  className="w-4 h-4 rounded text-[#0076D1] focus:ring-blue-200 border-slate-300 dark:border-slate-600 cursor-pointer mt-0.5"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Privacy & Visibility */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0076D1]" />
                <span>{t('settings.privacySectionTitle', 'Privacy & Visibility')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('settings.privacySectionDesc', 'Control who can see your academic details, badges, and contact you.')}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('settings.profileVisibility', 'Profile Visibility')}
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  onClick={() => setProfileVisibility('public')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    profileVisibility === 'public'
                      ? 'border-[#0076D1] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#0076D1]'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="profileVisibility"
                      checked={profileVisibility === 'public'}
                      onChange={() => setProfileVisibility('public')}
                      className="text-[#0076D1] focus:ring-blue-200"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t('settings.visibilityPublic', 'Public')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-5">
                    {t('settings.privacyPublicDesc', 'Anyone in the university can view your questions, answers, and profile.')}
                  </p>
                </div>

                <div 
                  onClick={() => setProfileVisibility('community')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    profileVisibility === 'community'
                      ? 'border-[#0076D1] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#0076D1]'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="profileVisibility"
                      checked={profileVisibility === 'community'}
                      onChange={() => setProfileVisibility('community')}
                      className="text-[#0076D1] focus:ring-blue-200"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t('settings.visibilityCommunity', 'Community Members only')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-5">
                    {t('settings.privacyCommunityDesc', 'Only verified classmates and faculty members can see full details.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#0076D1] transition-colors">
                    {t('settings.showAcademicInfo', 'Show Academic Information')}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('settings.showAcademicDesc', 'Display your campus, major, and enrolled course badges.')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showAcademicInfo}
                  onChange={(e) => setShowAcademicInfo(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0076D1] focus:ring-blue-200 border-slate-300 dark:border-slate-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#0076D1] transition-colors">
                    {t('settings.allowDirectMessages', 'Allow Direct Messages')}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('settings.allowDMsDesc', 'Allow peer students and course mentors to send you direct messages.')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowDirectMessages}
                  onChange={(e) => setAllowDirectMessages(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0076D1] focus:ring-blue-200 border-slate-300 dark:border-slate-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#0076D1] transition-colors">
                    {t('settings.showContributionActivity', 'Show Contribution Activity')}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('settings.showActivityDesc', 'Show your solved questions, accepted answers, and karma badges on your public profile.')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showContributionActivity}
                  onChange={(e) => setShowContributionActivity(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0076D1] focus:ring-blue-200 border-slate-300 dark:border-slate-600 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Muted Tags */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#0076D1]" />
                <span>{t('settings.mutedTagsTitle', 'Muted Tags')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('settings.mutedTagsDesc', 'Muted tags help reduce content you do not want to see in your feed.')}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {mutedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMutedTag(tag)}
                    className="p-0.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {mutedTags.length === 0 && (
                <p className="text-xs text-slate-400 italic">
                  {t('settings.noMutedTags', 'No muted tags active.')}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMutedTag())}
                placeholder={t('settings.addTagPlaceholder', 'Nhập tên thẻ tag rồi nhấn Thêm...')}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1] text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddMutedTag}
                className="px-3.5 py-2 text-xs font-semibold text-[#0076D1] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                + {t('settings.addTagButton', 'Thêm thẻ')}
              </button>
            </div>
          </div>

          {/* Section 4: Active Sessions & Security */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#0076D1]" />
                <span>{t('settings.activeSessionsTitle', 'Active Sessions & Security')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('settings.activeSessionsDesc', 'Overview of devices currently logged into your FHub account.')}
              </p>
            </div>

            <div className="space-y-3">
              {activeSessions.map((s) => (
                <div key={s.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 shrink-0">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{t(s.device)}</span>
                        {s.isCurrent && (
                          <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md">
                            {t('settings.currentDevice', 'Current')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {t(s.location)} · {t('settings.activeNow', 'Active now')}  {t("· IP:")} {s.ip}
                      </p>
                    </div>
                  </div>

                  {!s.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(s.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline shrink-0 cursor-pointer"
                    >
                      {t('settings.revoke', 'Revoke')}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Export Personal Data Box */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('settings.exportData', 'Export Personal Data')}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('settings.exportDataDesc', 'Download a copy of your questions, answers, reviews, and preferences.')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-xs self-start sm:self-auto disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? t('settings.exporting', 'Preparing Archive...') : t('settings.exportData', 'Export JSON Data')}</span>
              </button>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs gap-3">
            <div className="flex items-center gap-2">
              {isSaved ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t('settings.savedSuccess', 'Đã lưu tất cả thay đổi thành công!')}
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  {t('settings.savedSuccess', 'Tất cả thay đổi sẽ được cập nhật vào hồ sơ đám mây của bạn.')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleResetDefaults}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {t('settings.resetDefaults', 'Khôi phục mặc định')}
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('settings.saving', 'Đang lưu...')}</span>
                  </>
                ) : isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('settings.savedSuccess', 'Đã lưu!')}</span>
                  </>
                ) : (
                  <span>{t('settings.saveChanges', 'Lưu thay đổi')}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Account Safety Tips */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('settings.safetyTipsTitle', 'Account Safety Tips')}</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">{t('settings.security', 'Security')}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {t('settings.high', 'High')}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{t('settings.safetyTipsSSOTitle', 'Official University SSO')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('settings.safetyTipsSSODesc', 'Use your official university email (@fpt.edu.vn) to ensure two-factor authentication recovery and verified cohort access.')}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{t('settings.safetyTipsDMsTitle', 'Direct Messages & Mentorship')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('settings.safetyTipsDMsDesc', 'Keep direct messages enabled so course mentors and study groups can reach out for peer review and assignment collaboration.')}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{t('settings.safetyTipsHygieneTitle', 'Public Computer Hygiene')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('settings.safetyTipsHygieneDesc', 'Review active sessions regularly and revoke permissions on public campus library workstations after completing study hours.')}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {t('settings.deleteAccountNotice', 'Need to delete your account or download your revision history?')}
              </p>
              <a
                href="/tickets"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0076D1] dark:text-blue-400 hover:underline"
              >
                <span>{t('settings.contactSupportLink', 'Contact Academic Support')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
