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
  const { formatDate, formatTime, locale, t, language } = useLanguage();

  const isOwnProfile = !id || id === currentUser?.id || id === 'me';

  // Profile Data State
  const [profileData, setProfileData] = useState({
    fullName: (currentUser as any)?.fullName || (currentUser as any)?.name || 'Nguyen Minh Tam',
    studentId: (currentUser as any)?.studentCode || currentUser?.studentId || 'CE181522',
    email: currentUser?.email || 'TamNMCE181522@fpt.edu.vn',
    campus: (currentUser as any)?.campus || 'FPT University - Can Tho',
    community: 'FHub Engineering Community',
    major: (currentUser as any)?.major || 'Software Engineering (K18 - DevOps)',
    role: 'Student',
    status: 'Verified Student · Cohort K18',
    memberSince: 'Sep 2022 (Cohort K18)',
    bio: 'K18 Software Engineering student at FPT University Can Tho (CE181522). Passionate about Cloud Infrastructure, DevOps, CI/CD Pipelines, Docker, Kubernetes, and .NET Microservices.',
    detailedBio: 'Final-year K18 Software Engineering student specializing in DevOps & Cloud-Native Architecture at FPT University Can Tho. Active contributor of PRN231, SWD392, and SEP490 study materials, Docker Compose templates, and automated GitHub Actions deployment workflows.',
    interests: ['DevOps & CI/CD', 'Docker & Kubernetes', '.NET 8 Microservices', 'PostgreSQL', 'GitHub Actions', 'Cloud Infrastructure'] as string[],
    avatarUrl: currentUser?.avatarUrl || '',
    stats: {
      articlesPublished: 4,
      articlesSubtext: '4 articles',
      studyMaterialsShared: 6,
      materialsSubtext: '148 downloads',
      courseReviewsWritten: 3,
      reviewsSubtext: '3 reviews',
      questionsCount: 3,
      answersCount: 5,
      helpfulVotes: 145,
      badgesCount: 4,
    }
  });

  const [questions, setQuestions] = useState<any[]>([
    {
      id: 16,
      course: 'SEP490',
      title: 'Best Practices for Dockerizing .NET 8 Microservices and PostgreSQL Healthchecks in SEP490?',
      votes: 18,
      answers: 4,
      isSolved: true,
      time: '2 days ago',
    },
    {
      id: 15,
      course: 'PRN231',
      title: 'How to Resolve CORS Preflight Errors Between React/Next.js Client and ASP.NET Core API with HttpOnly Cookies?',
      votes: 14,
      answers: 3,
      isSolved: true,
      time: '5 days ago',
    },
    {
      id: 13,
      course: 'SWD392',
      title: 'Configuring Automated GitHub Actions Multi-Stage Docker Builds for Microservices Deployment',
      votes: 11,
      answers: 2,
      isSolved: true,
      time: '1 week ago',
    }
  ]);
  const [answers, setAnswers] = useState<any[]>([
    {
      id: 16,
      course: 'PRN231',
      questionTitle: 'How to Configure Entity Framework Core with PostgreSQL Without Case-Sensitivity Identifier Errors?',
      excerpt: 'Install EFCore.NamingConventions via NuGet and chain .UseSnakeCaseNamingConvention() inside AddDbContext so PostgreSQL maps table and column identifiers cleanly without double-quote errors.',
      upvotes: 24,
      isBestAnswer: true,
      time: '3 days ago',
    },
    {
      id: 15,
      course: 'SWP391',
      questionTitle: 'Should We Choose Microservices or Modular Monolith Architecture for Our SWP391 Project?',
      excerpt: 'For a 10-week SWP391 project, start with a Clean Architecture Modular Monolith and automated GitHub Actions CI checks so your team focuses on core business flows before scaling to Microservices in SEP490.',
      upvotes: 19,
      isBestAnswer: false,
      time: '1 week ago',
    }
  ]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [userVoteHistory, setUserVoteHistory] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      const targetUserId = id && id !== 'me' ? id : (currentUser?.id || 4);
      try {
        const live = await profileApi.getProfile(targetUserId);
        if (isMounted && live) {
          const campusMap: Record<number, string> = {
            1: 'FPT University - Ha Noi (Hoa Lac)',
            2: 'FPT University - Ho Chi Minh City',
            3: 'FPT University - Da Nang',
            4: 'FPT University - Can Tho',
            5: 'FPT University - Quy Nhon',
          };
          const majorMap: Record<number, string> = {
            1: 'Software Engineering (K18 - DevOps)',
            2: 'Computer Science (CS)',
            3: 'Business Administration (BA)',
          };
          setProfileData(prev => ({
            ...prev,
            fullName: live.fullName || prev.fullName,
            email: live.email || prev.email,
            bio: (live.bio && live.bio !== 'Chưa có thông tin giới thiệu.') ? live.bio : prev.bio,
            avatarUrl: live.avatarUrl || prev.avatarUrl,
            studentId: live.studentCode || (currentUser as any)?.studentCode || prev.studentId,
            major: live.majorCode || majorMap[live.majorId] || prev.major,
            campus: live.campusCode ? `FPT University - ${live.campusCode}` : (campusMap[live.campusId] || prev.campus),
            stats: {
              ...prev.stats,
              helpfulVotes: live.karma || prev.stats.helpfulVotes,
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
      const targetUserId = id && id !== 'me' ? id : (currentUser?.id || 4);
      try {
        const apiBadges = isOwnProfile ? await badgeApi.getMyBadges() : await badgeApi.getUserBadges(targetUserId);
        if (isMounted) {
          if (apiBadges && apiBadges.length > 0) {
            const badgeIcons = ['🏅', '🚀', '📚', '⭐', '🏆'];
            const badgeColors = [
              'bg-amber-50 text-amber-800 border-amber-200',
              'bg-blue-50 text-blue-800 border-blue-200',
              'bg-emerald-50 text-emerald-800 border-emerald-200',
              'bg-purple-50 text-purple-800 border-purple-200',
            ];
            const mapped = apiBadges.map((b: any, idx: number) => ({
              id: String(b.user_badge_id || b.badge_id || idx),
              name: b.badge?.name || b.badge_name || b.badgeName || 'FHub Contributor Badge',
              description: b.badge?.description || b.description || b.award_reason || 'Awarded for verified academic contributions on FHub.',
              icon: badgeIcons[idx % badgeIcons.length],
              color: badgeColors[idx % badgeColors.length],
              earnedDate: b.awarded_at ? b.awarded_at : '2026-10-15T09:00:00Z',
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
              const titleCatalog: Record<string, { title: string; author: string }> = {
                'QUESTION_16': { title: 'Best Practices for Dockerizing .NET 8 Microservices and PostgreSQL Healthchecks in SEP490?', author: 'Nguyen Minh Tam (CE181522)' },
                'QUESTION_15': { title: 'How to Resolve CORS Preflight Errors Between React Client and ASP.NET Core API?', author: 'Nguyen Quoc Bao (CE180121)' },
                'QUESTION_14': { title: 'Should We Choose Microservices or Modular Monolith Architecture for SWP391?', author: 'Thai Hoang Gia Phu (CE182003)' },
                'QUESTION_13': { title: 'How to Configure Entity Framework Core with PostgreSQL Without Case-Sensitivity Issues?', author: 'Le Tran Tan (CE190370)' },
                'ARTICLE_21': { title: 'Complete Guide to Scoring 9+ in SWP391 at FPT University: From Team Formation to Defense', author: 'Huynh Le Cong Bien (CE181207)' },
                'ARTICLE_22': { title: 'Automated CI/CD Pipeline Guide: Building & Deploying Dockerized .NET 8 Apps with GitHub Actions', author: 'Nguyen Minh Tam (CE181522)' },
                'ARTICLE_4': { title: 'FPTU Alumni Perspective: Essential Engineering Skills Enterprises Expect from Freshers', author: 'Tran Minh Hoang (K14 Alumni)' },
                'STUDYMATERIAL_25': { title: 'Complete PRN231 C# .NET Web API Practical Exam (PE) Archive with Clean Architecture', author: 'Huynh Le Cong Bien (CE181207)' },
                'StudyMaterial_25': { title: 'Complete PRN231 C# .NET Web API Practical Exam (PE) Archive with Clean Architecture', author: 'Huynh Le Cong Bien (CE181207)' },
                'ANSWER_13': { title: 'Accepted Answer on Configuring EFCore.NamingConventions for PostgreSQL', author: 'Huynh Le Cong Bien (CE181207)' },
              };
              const mappedVotes = myVotes.map((v) => {
                const key = `${v.targetType}_${v.targetId}`;
                const meta = titleCatalog[key] || titleCatalog[key.toUpperCase()];
                return {
                  id: String(v.voteId),
                  targetTitle: meta ? meta.title : `${v.targetType} #${v.targetId}: Verified Academic Post on FHub`,
                  type: String(v.targetType).toUpperCase(),
                  vote: v.voteValue > 0 ? 'Upvote (+1)' : 'Downvote (-1)',
                  date: v.createdAt ? v.createdAt : '2026-10-27T08:30:00Z',
                  author: meta ? meta.author : 'Huynh Le Cong Bien (CE181207)',
                };
              });
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
              : t("{p0} · {p1} · FPT University", undefined, { p0: t(profileData.role) || profileData.role, p1: t(profileData.major) || profileData.major })}
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
                title={t("Preferences & Settings")}
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
              <img src={normalizeMediaUrl(profileData.avatarUrl)} alt={t("Avatar")} className="w-full h-full object-cover" />
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
              id={`tab-${tab.id}`}
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
                    {t('common.viewAll', 'Xem tất cả')}
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
                      <span className="text-xs text-slate-400 whitespace-nowrap">{t(q.time)}</span>
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
                      {t('common.viewAll', 'Xem tất cả')} ({userBadges.length})
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
                      <p className="text-[10px] opacity-75">{formatDate(b.earnedDate)}</p>
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
                    <span className="text-xs text-slate-400 whitespace-nowrap">{t(q.time)}</span>
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
                      <span>{t(a.time)}</span>
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
                        <span className="text-[10px] text-slate-400 font-mono">{t('profile.earned', 'Earned')} {formatDate(b.earnedDate)}</span>
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
                        <p className="text-[11px] text-slate-400">{t("By")} {v.author}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-600">{v.vote}</span>
                      <p className="text-[10px] text-slate-400">{formatDate(v.date)}</p>
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
