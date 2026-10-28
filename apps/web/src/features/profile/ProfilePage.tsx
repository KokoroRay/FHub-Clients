import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  Award, 
  BookOpen, 
  ThumbsUp, 
  FileText, 
  Settings, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Star, 
  ArrowUpRight,
  ExternalLink,
  Tag,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { EditProfileModal } from './EditProfileModal';
import { profileApi, badgeApi, voteApi } from '../../services/api/studentApi';
import { normalizeMediaUrl } from '../../utils/mediaUtils';



export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, updateUser } = useAuth();
  const { t } = useLanguage();

  const isOwnProfile = !id || id === currentUser?.id || id === 'me';

  // Profile Data State
  const [profileData, setProfileData] = useState({
    fullName: (currentUser as any)?.fullName || (currentUser as any)?.name || 'Sinh viên FHub',
    studentId: currentUser?.studentId || 'Chưa cập nhật',
    email: currentUser?.email || '',
    campus: 'FPT University',
    community: 'FHub Community',
    major: 'Chuyên ngành',
    role: 'Student',
    status: 'Sinh viên FPTU',
    memberSince: 'Gần đây',
    bio: 'Chưa có thông tin giới thiệu.',
    detailedBio: '',
    interests: [] as string[],
    avatarUrl: currentUser?.avatarUrl || '',
    stats: {
      articlesPublished: 0,
      articlesSubtext: '0 bài viết',
      studyMaterialsShared: 0,
      materialsSubtext: '0 lượt tải',
      courseReviewsWritten: 0,
      reviewsSubtext: '0 đánh giá',
      questionsCount: 0,
      answersCount: 0,
      helpfulVotes: 0,
      badgesCount: 0,
    }
  });

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [userVoteHistory, setUserVoteHistory] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      const targetUserId = id && id !== 'me' ? id : (currentUser?.id || 1);
      try {
        const live = await profileApi.getProfile(targetUserId);
        if (isMounted && live) {
          setProfileData(prev => ({
            ...prev,
            fullName: live.fullName || prev.fullName,
            email: live.email || prev.email,
            bio: live.bio || prev.bio,
            avatarUrl: live.avatarUrl || prev.avatarUrl,
            studentId: live.studentCode || prev.studentId,
            major: live.majorCode || prev.major,
            campus: live.campusCode ? `FPT University ${live.campusCode}` : prev.campus,
            stats: {
              ...prev.stats,
              helpfulVotes: live.karma || 0,
            }
          }));
        }
      } catch (err) {
        console.warn('Could not fetch user profile from Profile service:', err);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [id, currentUser?.id]);

  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'answers' | 'badges' | 'votes'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchInteractions = async () => {
      const targetUserId = id && id !== 'me' ? id : (currentUser?.id || 1);
      try {
        const apiBadges = isOwnProfile ? await badgeApi.getMyBadges() : await badgeApi.getUserBadges(targetUserId);
        if (isMounted) {
          if (apiBadges && apiBadges.length > 0) {
            const mapped = apiBadges.map((b) => ({
              id: String(b.badge_id || b.user_badge_id),
              name: b.badge?.name || 'Huy hiệu cống hiến',
              description: b.badge?.description || 'Huy hiệu thành tích cộng đồng FHub',
              icon: '🏅',
              color: 'bg-amber-50 text-amber-800 border-amber-200',
              earnedDate: b.awarded_at ? new Date(b.awarded_at).toLocaleDateString('vi-VN') : 'Gần đây',
            }));
            setUserBadges(mapped);
          } else {
            setUserBadges([]);
          }
        }
      } catch (err) {
        console.warn('Backend badges unavailable:', err);
        if (isMounted) setUserBadges([]);
      }

      if (isOwnProfile) {
        try {
          const myVotes = await voteApi.getMyVotes();
          if (isMounted) {
            if (myVotes && myVotes.length > 0) {
              const mappedVotes = myVotes.map((v) => ({
                id: String(v.voteId),
                targetTitle: `${v.targetType} #${v.targetId}`,
                type: v.targetType,
                vote: v.voteValue > 0 ? 'Upvote (+1)' : 'Downvote (-1)',
                date: v.createdAt ? new Date(v.createdAt).toLocaleDateString('vi-VN') : 'Gần đây',
                author: 'FHub Member',
              }));
              setUserVoteHistory(mappedVotes);
            } else {
              setUserVoteHistory([]);
            }
          }
        } catch (err) {
          console.warn('Backend vote history unavailable:', err);
          if (isMounted) setUserVoteHistory([]);
        }
      }
    };

    fetchInteractions();
    return () => { isMounted = false; };
  }, [id, currentUser?.id, isOwnProfile]);

  const handleSaveProfile = (updated: any) => {
    setProfileData(prev => ({
      ...prev,
      fullName: updated.fullName,
      campus: updated.campus,
      major: updated.major,
      specialization: updated.specialization,
      bio: updated.bio,
      interests: updated.interests,
      avatarUrl: updated.avatarUrl,
    }));
    updateUser({
      fullName: updated.fullName,
      avatarUrl: updated.avatarUrl,
      campus: updated.campus,
    });
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181C22]">
            {isOwnProfile ? t('profile.myProfile', 'My Profile') : profileData.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isOwnProfile 
              ? t('profile.subtitle', 'View your personal information and community activity.') 
              : `${t(profileData.role) || profileData.role} · ${t(profileData.major) || profileData.major} · FPT University`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isOwnProfile ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-[#0076D1] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                {t('profile.editProfile', 'Edit Profile')}
              </button>
              <Link
                to="/settings"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                title="Preferences & Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <Link
              to="/messages"
              className="px-4 py-2 bg-[#0076D1] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('profile.message', 'Message')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Profile Info Card (Figma #106:7320 & #92:3384) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar Initials Circle */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0076D1] to-sky-400 flex items-center justify-center text-white font-bold text-2xl overflow-hidden shadow-xs shrink-0">
            {profileData.avatarUrl ? (
              <img src={normalizeMediaUrl(profileData.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profileData.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'BQ'
            )}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-[#181C22]">
                {profileData.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                {t(profileData.role) || profileData.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
                {profileData.studentId === 'Chưa cập nhật' ? t('profile.notUpdated', 'Chưa cập nhật') : profileData.studentId}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {profileData.bio === 'Chưa có thông tin giới thiệu.' ? t('profile.defaultBio', 'Chưa có thông tin giới thiệu.') : profileData.bio}
            </p>
          </div>
        </div>

        {/* 4-Item Meta Bar (Figma #106:7335) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
          <div>
            <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('profile.email', 'EMAIL')}
            </span>
            <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5">
              {profileData.email}
            </span>
          </div>

          <div>
            <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('profile.community', 'COMMUNITY')}
            </span>
            <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5">
              {profileData.community}
            </span>
          </div>

          <div>
            <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('profile.major', 'MAJOR')}
            </span>
            <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5">
              {profileData.major === 'Chuyên ngành' ? t('profile.defaultMajor', 'Chuyên ngành') : profileData.major}
            </span>
          </div>

          <div>
            <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('profile.campusStatus', 'CAMPUS / STATUS')}
            </span>
            <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5">
              {profileData.campus}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Stats Highlights Cards (Figma #106:7369) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {t('profile.articlesPublished', 'ARTICLES PUBLISHED')}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-[#181C22]">
              {profileData.stats.articlesPublished}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {profileData.stats.articlesPublished} {t('profile.articlesCount', 'bài viết')}
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {t('profile.materialsShared', 'STUDY MATERIALS SHARED')}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-[#181C22]">
              {profileData.stats.studyMaterialsShared}
            </span>
            <span className="text-xs font-semibold text-[#0076D1] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {profileData.stats.studyMaterialsShared} {t('profile.downloadsCount', 'lượt tải')}
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {t('profile.reviewsWritten', 'COURSE REVIEWS WRITTEN')}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-[#181C22]">
              {profileData.stats.courseReviewsWritten}
            </span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              {profileData.stats.courseReviewsWritten} {t('profile.reviewsCount', 'đánh giá')}
            </span>
          </div>
        </div>
      </div>

      {/* About Me Section (Figma #106:7410) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#181C22]">{t('profile.aboutMe', 'About Me')}</h3>
            <p className="text-xs text-slate-400">{t('profile.academicInfo', 'Academic Profile Info')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('profile.memberSince', 'MEMBER SINCE')}
            </span>
            <span className="text-xs font-semibold text-slate-800 block mt-0.5">
              {profileData.memberSince === 'Gần đây' ? t('profile.recent', 'Gần đây') : profileData.memberSince}
            </span>
          </div>

          <div>
            <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('profile.studentStatus', 'STUDENT STATUS')}
            </span>
            <span className="text-xs font-semibold text-slate-800 block mt-0.5">
              {profileData.status === 'Sinh viên FPTU' ? t('profile.defaultStatus', 'Sinh viên FPTU') : profileData.status}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
            {t('profile.interests', 'ACADEMIC & TECH INTERESTS')}
          </span>
          <div className="flex flex-wrap gap-2">
            {profileData.interests.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
          {profileData.detailedBio}
        </p>
      </div>

      {/* Interactive Activity & Contributions Tabs (Figma #92:3543) */}
      <div className="space-y-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: t('profile.tabOverview', 'Overview') },
            { id: 'questions', label: `${t('profile.tabQuestions', 'Questions')} (${questions.length})` },
            { id: 'answers', label: `${t('profile.tabAnswers', 'Answers')} (${answers.length})` },
            { id: 'badges', label: `${t('profile.tabBadges', 'Badges')} (${userBadges.length})` },
            { id: 'votes', label: `${t('profile.tabVotes', 'Vote History')} (${userVoteHistory.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#0076D1] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-800">{t('profile.recentContributions', 'Recent Contributions')}</h4>
                {questions.length > 0 && (
                  <button 
                    onClick={() => setActiveTab('questions')}
                    className="text-xs font-semibold text-[#0076D1] hover:underline"
                  >
                    {t('View All')}
                  </button>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  {t('profile.emptyContributions', 'Chưa có hoạt động đóng góp nào gần đây.')}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {questions.map((q) => (
                    <div key={q.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <Link to={`/discussions/${q.id}`} className="text-xs font-bold text-slate-800 hover:text-[#0076D1] line-clamp-1">
                          {q.title}
                        </Link>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">
                            {q.course}
                          </span>
                          <span>{q.votes} {t('votes')}</span>
                          <span>{q.answers} {t('answers')}</span>
                          {q.isSolved && (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                              {t('profile.acceptedSolution', 'Accepted Solution')}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{q.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Badges Preview */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-800">{t('profile.earnedBadges', 'Earned Badges')}</h4>
                <div className="flex items-center gap-3">
                  <Link
                    to="/reputation-rules"
                    className="text-xs font-semibold text-slate-500 hover:text-[#0076D1] hover:underline"
                  >
                    {t('profile.reputationRules', 'Reputation Rules')}
                  </Link>
                  {userBadges.length > 0 && (
                    <button 
                      onClick={() => setActiveTab('badges')}
                      className="text-xs font-semibold text-[#0076D1] hover:underline"
                    >
                      {t('View All')} ({userBadges.length})
                    </button>
                  )}
                </div>
              </div>

              {userBadges.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  {t('profile.emptyBadges', 'Chưa có huy hiệu thành tích nào. Hãy tích cực hoạt động để nhận huy hiệu!')}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {userBadges.map((b) => (
                    <div key={b.id} className={`p-3.5 rounded-xl border text-center space-y-1.5 ${b.color}`}>
                      <span className="text-2xl">{b.icon}</span>
                      <h5 className="text-xs font-bold">{t(b.name) || b.name}</h5>
                      <p className="text-[10px] opacity-75">{b.earnedDate}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Questions */}
        {activeTab === 'questions' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            {questions.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                {t('profile.emptyQuestions', 'Chưa có câu hỏi nào được tạo.')}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {questions.map((q) => (
                  <div key={q.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {q.course}
                        </span>
                        <Link to={`/discussions/${q.id}`} className="text-sm font-bold text-slate-800 hover:text-[#0076D1]">
                          {q.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{q.votes} {t('votes')}</span>
                        <span>•</span>
                        <span>{q.answers} {t('answers')}</span>
                        {q.isSolved && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              {t('Solved')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{q.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Answers */}
        {activeTab === 'answers' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            {answers.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                {t('profile.emptyAnswers', 'Chưa có câu trả lời nào.')}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {answers.map((a) => (
                  <div key={a.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {a.course}
                        </span>
                        <h5 className="text-xs font-bold text-slate-800">
                          {t('profile.answeredOn', 'Answered on:')} <span className="hover:text-[#0076D1] cursor-pointer">{a.questionTitle}</span>
                        </h5>
                      </div>
                      {a.isBestAnswer && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          {t('profile.bestAnswer', 'Best Answer')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                      "{a.excerpt}"
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-600">{a.upvotes} {t('profile.helpfulUpvotes', 'helpful upvotes')}</span>
                      <span>•</span>
                      <span>{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Badges */}
        {activeTab === 'badges' && (
          <div>
            {userBadges.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-xs text-center text-xs text-slate-400">
                {t('profile.emptyBadges', 'Chưa có huy hiệu nào được trao.')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userBadges.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-start gap-4">
                    <div className="text-3xl p-3 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
                      {b.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800">{t(b.name) || b.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{t('profile.earned', 'Earned')} {b.earnedDate}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {t(b.description) || b.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Vote History */}
        {activeTab === 'votes' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            {userVoteHistory.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                {t('profile.emptyVotes', 'Chưa có lịch sử bình chọn nào.')}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {userVoteHistory.map((v) => (
                  <div key={v.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#0076D1] border border-blue-200">
                        {v.type}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 hover:text-[#0076D1] cursor-pointer">
                          {v.targetTitle}
                        </h5>
                        <p className="text-[11px] text-slate-400">By {v.author}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-600">{v.vote}</span>
                      <p className="text-[10px] text-slate-400">{v.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal (Figma #106:7604) */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveSuccess={handleSaveProfile}
        initialData={{
          fullName: profileData.fullName,
          email: profileData.email,
          campus: profileData.campus,
          major: profileData.major,
          specialization: (profileData as any).specialization,
          bio: profileData.bio,
          interests: profileData.interests,
          avatarUrl: profileData.avatarUrl,
        }}
      />
    </div>
  );
};
