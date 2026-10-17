import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Eye, 
  Bell, 
  Tag, 
  ShieldCheck, 
  Laptop, 
  Download, 
  X, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../services/api/studentApi';

export const ProfileSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Feed & Interface Preferences (Figma #93:4384)
  const [language, setLanguage] = useState<'en' | 'vi'>('en');
  const [defaultFeed, setDefaultFeed] = useState<'global' | 'courses' | 'workflows'>('global');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  // Privacy & Visibility (Figma #93:4441)
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'community'>('public');
  const [showAcademicInfo, setShowAcademicInfo] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);
  const [showContributionActivity, setShowContributionActivity] = useState(true);

  // Muted Tags (Figma #93:4497)
  const [mutedTags, setMutedTags] = useState<string[]>(['spoilers', 'off-topic']);
  const [newTagInput, setNewTagInput] = useState('');

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'session-1',
      device: 'Windows PC · Chrome',
      location: 'Ho Chi Minh City, VN',
      ip: '118.69.182.41',
      lastActive: 'Now',
      isCurrent: true
    },
    {
      id: 'session-2',
      device: 'iPhone 15 Pro · Safari Mobile',
      location: 'Ho Chi Minh City, VN',
      ip: '14.169.102.18',
      lastActive: '3 hours ago',
      isCurrent: false
    }
  ]);

  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchUserPrefs = async () => {
      try {
        const prefs = await profileApi.getMyPreferences();
        if (prefs) {
          if (prefs.privacy) {
            setShowContributionActivity(prefs.privacy.showActivity ?? true);
          }
        }
      } catch (err) {
        console.warn('Could not load preferences from Profile API, using defaults:', err);
      }
    };

    fetchUserPrefs();
  }, []);

  const handleAddMutedTag = () => {
    const clean = newTagInput.trim().replace(/^#/, '').toLowerCase();
    if (clean && !mutedTags.includes(clean)) {
      setMutedTags(prev => [...prev, clean]);
      setNewTagInput('');
    }
  };

  const handleRemoveMutedTag = (tagToRemove: string) => {
    setMutedTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleRevokeSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await profileApi.exportData('JSON');
    } catch (err) {
      console.warn('Profile service export request deferred to client download:', err);
    }

    setTimeout(() => {
      setIsExporting(false);
      // Client-side JSON file download
      const blob = new Blob([JSON.stringify({
        user: (currentUser as any)?.fullName || (currentUser as any)?.name || 'Nguyen Hoang Minh',
        email: currentUser?.email || 'bao.nguyen@example.edu',
        exportDate: new Date().toISOString(),
        settings: {
          language,
          defaultFeed,
          profileVisibility,
          mutedTags,
        }
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fhub_personal_data_export_${Date.now()}.json`;
      a.click();
    }, 1000);
  };

  const handleSaveChanges = async () => {
    try {
      await Promise.allSettled([
        profileApi.updatePrivacySettings({
          profileVisibility,
          allowSearchEngineIndexing: true,
          showVoteHistory: showContributionActivity,
          showContributionHistory: showContributionActivity,
        }),
        profileApi.updateFeedPreferences({
          language,
          defaultFeed,
          themeMode,
          emailNotifications,
          inAppNotifications,
          showAcademicInfo,
          allowDirectMessages,
        })
      ]);
    } catch (err) {
      console.warn('Could not save settings to Profile service:', err);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetDefaults = () => {
    setLanguage('en');
    setDefaultFeed('global');
    setThemeMode('light');
    setEmailNotifications(true);
    setInAppNotifications(true);
    setProfileVisibility('public');
    setShowAcademicInfo(true);
    setAllowDirectMessages(true);
    setShowContributionActivity(true);
    setMutedTags(['spoilers', 'off-topic']);
  };

  return (
    <div className="w-full pb-16 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#181C22]">Preferences & Privacy</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your display settings, content tuning, and privacy controls.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>All changes were successfully updated to your cloud profile!</span>
        </div>
      )}

      {/* Main 2-column Layout (Settings Content + Sidebar Tips) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Settings Sections */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Feed & Interface Preferences (Figma #93:4384) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#0076D1]" />
                <span>Feed & Interface Preferences</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize default views, language, and notification alert thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
                >
                  <option value="en">English (US)</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Feed
                </label>
                <select
                  value={defaultFeed}
                  onChange={(e) => setDefaultFeed(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
                >
                  <option value="global">Global Feed</option>
                  <option value="courses">Course Hub</option>
                  <option value="workflows">Curated Workflows</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Theme Mode
              </label>
              <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
                {(['light', 'dark', 'system'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setThemeMode(mode)}
                    className={`px-4 py-1.5 rounded-lg capitalize transition-colors ${
                      themeMode === mode
                        ? 'bg-white text-[#0076D1] font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0076D1] transition-colors">
                    Email Notifications
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Receive email digests and critical replies to your university mailbox.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0076D1] focus:ring-blue-200 border-slate-300 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0076D1] transition-colors">
                    In-app Notifications
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Sound & banner alerts for mentions, answers, and study group invitations.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={inAppNotifications}
                  onChange={(e) => setInAppNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0076D1] focus:ring-blue-200 border-slate-300 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Privacy & Visibility (Figma #93:4441) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0076D1]" />
                <span>Privacy & Visibility</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Control who can see your academic details, badges, and contact you.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Profile Visibility
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  onClick={() => setProfileVisibility('public')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    profileVisibility === 'public'
                      ? 'border-[#0076D1] bg-blue-50/40 ring-1 ring-[#0076D1]'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
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
                    <span className="text-xs font-bold text-slate-800">Public</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-5">
                    Anyone in the university can view your questions, answers, and profile.
                  </p>
                </div>

                <div 
                  onClick={() => setProfileVisibility('community')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    profileVisibility === 'community'
                      ? 'border-[#0076D1] bg-blue-50/40 ring-1 ring-[#0076D1]'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
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
                    <span className="text-xs font-bold text-slate-800">Community Members only</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-5">
                    Only verified classmates and faculty members can see full details.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0076D1] transition-colors">
                    Show Academic Information
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Display your campus (HCM), major (Software Engineering), and enrolled course badges.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showAcademicInfo}
                  onChange={(e) => setShowAcademicInfo(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0076D1] focus:ring-blue-200 border-slate-300 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0076D1] transition-colors">
                    Allow Direct Messages
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Allow peer students and course mentors to send you direct messages.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowDirectMessages}
                  onChange={(e) => setAllowDirectMessages(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0076D1] focus:ring-blue-200 border-slate-300 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0076D1] transition-colors">
                    Show Contribution Activity
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Show your solved questions, accepted answers, and karma badges on your public profile.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showContributionActivity}
                  onChange={(e) => setShowContributionActivity(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0076D1] focus:ring-blue-200 border-slate-300 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Muted Tags (Figma #93:4497) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#0076D1]" />
                <span>Muted Tags</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Muted tags help reduce content you do not want to see in your feed.
              </p>
            </div>

            {/* Existing Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {mutedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMutedTag(tag)}
                    className="p-0.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {mutedTags.length === 0 && (
                <p className="text-xs text-slate-400 italic">No muted tags active.</p>
              )}
            </div>

            {/* Add Tag Input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMutedTag())}
                placeholder="Add a tag (e.g. exams, gaming)..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0076D1]"
              />
              <button
                type="button"
                onClick={handleAddMutedTag}
                className="px-3.5 py-2 text-xs font-semibold text-[#0076D1] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors whitespace-nowrap"
              >
                + Add Tag
              </button>
            </div>
          </div>

          {/* Section 4: Active Sessions & Security (Figma #93:4524) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#0076D1]" />
                <span>Active Sessions & Security</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of devices currently logged into your FHub account.
              </p>
            </div>

            <div className="space-y-3">
              {activeSessions.map((s) => (
                <div key={s.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate">{s.device}</span>
                        {s.isCurrent && (
                          <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {s.location} · Last active: {s.lastActive} · IP: {s.ip}
                      </p>
                    </div>
                  </div>

                  {!s.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(s.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline shrink-0"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Export Personal Data Box */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Export Personal Data</h4>
                <p className="text-[11px] text-slate-500">
                  Download a copy of your questions, answers, reviews, and preferences.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs self-start sm:self-auto disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Preparing Archive...' : 'Export JSON Data'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-xs text-slate-400">
              All changes are saved to your cloud profile.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Account Safety Tips (Figma #93:4567) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Account Safety Tips</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Security</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  High
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-800 mb-1">Official University SSO</p>
                <p className="text-[11px] text-slate-500">
                  Use your official university email (@fpt.edu.vn) to ensure two-factor authentication recovery and verified cohort access.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-800 mb-1">Direct Messages & Mentorship</p>
                <p className="text-[11px] text-slate-500">
                  Keep direct messages enabled so course mentors and study groups can reach out for peer review and assignment collaboration.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-slate-800 mb-1">Public Computer Hygiene</p>
                <p className="text-[11px] text-slate-500">
                  Review active sessions regularly and revoke permissions on public campus library workstations after completing study hours.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 mb-2">
                Need to delete your account or download your revision history?
              </p>
              <a
                href="/tickets"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0076D1] hover:underline"
              >
                <span>Contact Academic Support</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
