import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Sparkles,
  Camera,
  UserPlus,
  UserCheck,
  Loader2,
  X,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { EditProfileModal } from './EditProfileModal';
import { profileApi, badgeApi, voteApi, followApi, directMessageApi, FollowStats, FollowUserItem } from '../../services/api/studentApi';
import { questionApi, contentMediaApi } from '../../services/api/contentApi';
import { normalizeMediaUrl, validateImage, IMAGE_ACCEPT } from '../../utils/mediaUtils';
import { resolveUserMajorName, FPT_CAMPUSES } from '../../utils/taxonomyUtils';
import { extractStudentIdFromEmail } from '../../utils/fptEmailValidator';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();
  const { formatDate, formatTime, locale, t, language } = useLanguage();

  const isOwnProfile = !id || id === currentUser?.id || id === 'me';
  const targetUserId = id && id !== 'me' ? Number(id) : Number(currentUser?.id || 4);

  // Profile Data State
  const [profileData, setProfileData] = useState({
    fullName: (currentUser as any)?.fullName || (currentUser as any)?.name || 'Sinh viên FHub',
    studentId: (currentUser as any)?.studentCode || currentUser?.studentId || extractStudentIdFromEmail(currentUser?.email) || '',
    email: currentUser?.email || '',
    campus: (currentUser as any)?.campus || 'FPT University',
    campusId: (currentUser as any)?.campusId as number | undefined,
    campusCode: (currentUser as any)?.campusCode as string | undefined,
    community: 'FHub Community',
    major: (currentUser as any)?.major || '',
    majorId: (currentUser as any)?.majorId as number | undefined,
    majorCode: (currentUser as any)?.majorCode as string | undefined,
    specialization: (currentUser as any)?.specialization as string | undefined,
    specializationId: (currentUser as any)?.specializationId as number | undefined,
    specializationCode: (currentUser as any)?.specializationCode as string | undefined,
    role: currentUser?.role || 'Student',
    status: 'Sinh viên FPTU',
    memberSince: 'Gần đây',
    bio: 'Chưa có thông tin giới thiệu.',
    detailedBio: '',
    interests: [] as string[],
    avatarUrl: currentUser?.avatarUrl || '',
    coverUrl: (currentUser as any)?.coverUrl || '',
    stats: {
      articlesPublished: 0,
      articlesSubtext: '0 articles',
      studyMaterialsShared: 0,
      materialsSubtext: '0 downloads',
      courseReviewsWritten: 0,
      reviewsSubtext: '0 reviews',
      questionsCount: 0,
      answersCount: 0,
      helpfulVotes: (currentUser as any)?.karma || 0,
      badgesCount: 0,
    }
  });

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [userVoteHistory, setUserVoteHistory] = useState<any[]>([]);

  // Follow State
  const [followStats, setFollowStats] = useState<FollowStats>({
    user_id: targetUserId,
    followers_count: 0,
    following_count: 0,
    is_following: false,
  });
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isMessageStarting, setIsMessageStarting] = useState(false);

  // Follow list modal state
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [followListItems, setFollowListItems] = useState<FollowUserItem[]>([]);
  const [isFollowListLoading, setIsFollowListLoading] = useState(false);

  // Quick cover upload state
  const [isUploadingQuickCover, setIsUploadingQuickCover] = useState(false);

  // Load Follow stats
  const loadFollowStats = async () => {
    try {
      const stats = await followApi.getFollowStats(targetUserId);
      setFollowStats(stats);
    } catch (err) {
      console.warn('Could not fetch follow stats:', err);
    }
  };

  useEffect(() => {
    loadFollowStats();
  }, [targetUserId]);

  useEffect(() => {
    let isMounted = true;
    const fetchUserQuestions = async () => {
      try {
        const res = await questionApi.getQuestions({
          mine: isOwnProfile ? true : undefined,
          pageSize: 20,
        });
        if (isMounted && res?.items) {
          const items = res.items.map((q: any) => ({
            id: q.questionId,
            course: q.courseCode || (q.courseId ? `COURSE-${q.courseId}` : 'FHub'),
            title: q.title,
            votes: (q.upvoteCount || 0) - (q.downvoteCount || 0),
            answers: q.answerCount || 0,
            isSolved: !!q.bestAnswerId,
            time: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Vừa xong',
          }));
          setQuestions(items);

          // Populate answers tab for the user from public discussion questions
          try {
            const allQ = await questionApi.getQuestions({ pageSize: 30 });
            if (isMounted && allQ?.items) {
              const targetUid = targetUserId;
              const foundAnswers: any[] = [];
              const sampleQ = allQ.items.slice(0, 10);
              await Promise.allSettled(sampleQ.map(async (q: any) => {
                try {
                  const ansList = await questionApi.getAnswers(q.questionId);
                  if (Array.isArray(ansList)) {
                    ansList.filter((a: any) => Number(a.authorUserId) === targetUid).forEach((a: any) => {
                      foundAnswers.push({
                        id: String(a.answerId),
                        course: q.courseCode || 'PRN231',
                        questionTitle: q.title,
                        isBestAnswer: !!a.isBestAnswer,
                        excerpt: a.body ? (a.body.length > 150 ? a.body.slice(0, 150) + '...' : a.body) : t('common.academicAnswer', 'Câu trả lời giải đáp'),
                        upvotes: a.upvoteCount || 0,
                        time: a.createdAt || 'Recent',
                      });
                    });
                  }
                } catch {}
              }));
              if (isMounted) setAnswers(foundAnswers);
            }
          } catch {}
        }
      } catch (err) {
        if (isMounted) setQuestions([]);
      }
    };
    fetchUserQuestions();
    return () => { isMounted = false; };
  }, [id, currentUser?.id, isOwnProfile, targetUserId]);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const live = await profileApi.getProfile(targetUserId);
        if (isMounted && live) {
          const resolvedMajor = resolveUserMajorName(live);

          setProfileData(prev => {
            const resolvedCampus = live.campusCode 
              ? (FPT_CAMPUSES[live.campusCode] || `FPT University - ${live.campusCode}`)
              : (live.campusId ? (FPT_CAMPUSES[live.campusId] || prev.campus) : prev.campus);

            let cover = live.coverUrl || prev.coverUrl;
            if (!cover && live.links && Array.isArray(live.links)) {
              const cLink = live.links.find((l: any) => (l.platformName || l.PlatformName) === 'COVER_IMAGE');
              if (cLink) cover = cLink.url || cLink.Url;
            }

            return {
              ...prev,
              fullName: live.displayName || live.fullName || prev.fullName,
              email: live.email || prev.email,
              bio: (live.bio && live.bio !== 'Chưa có thông tin giới thiệu.') ? live.bio : prev.bio,
              avatarUrl: live.avatarUrl || prev.avatarUrl,
              coverUrl: cover || '',
              studentId: live.studentCode || (currentUser as any)?.studentCode || (currentUser as any)?.studentId || extractStudentIdFromEmail(live.email || currentUser?.email) || prev.studentId,
              major: resolvedMajor,
              campus: resolvedCampus,
              campusId: live.campusId ?? prev.campusId,
              campusCode: live.campusCode ?? prev.campusCode,
              majorId: live.majorId ?? prev.majorId,
              majorCode: live.majorCode ?? prev.majorCode,
              specialization: live.specializationName || live.specialization || prev.specialization,
              specializationId: live.specializationId ?? prev.specializationId,
              specializationCode: live.specializationCode ?? prev.specializationCode,
              stats: {
                ...prev.stats,
                helpfulVotes: live.karma || prev.stats.helpfulVotes,
              }
            };
          });
        }
      } catch (err) {
        console.warn('Could not fetch user profile from Profile service:', err);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [id, currentUser?.id, targetUserId]);

  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'answers' | 'badges' | 'votes'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchInteractions = async () => {
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
              const targetNameMap: Record<string, string> = {
                QUESTION: t('common.academicQuestion', 'Câu hỏi thảo luận'),
                ANSWER: t('common.academicAnswer', 'Câu trả lời giải đáp'),
                ARTICLE: t('common.academicArticle', 'Bài viết chuyên sâu'),
                WORKFLOW: t('common.academicWorkflow', 'Quy trình thực hành'),
                STUDYMATERIAL: t('common.studyMaterial', 'Tài liệu học tập'),
              };
              const mappedVotes = myVotes.map((v) => {
                const typeStr = String(v.targetType || 'CONTENT').toUpperCase();
                const friendlyType = targetNameMap[typeStr] || typeStr;
                return {
                  id: String(v.voteId),
                  targetTitle: `${friendlyType} #${v.targetId}`,
                  type: typeStr,
                  vote: v.voteValue > 0 ? 'Upvote (+1)' : 'Downvote (-1)',
                  date: v.createdAt ? v.createdAt : new Date().toISOString(),
                  author: t('common.author', 'Tác giả bài đăng'),
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
  }, [id, currentUser?.id, isOwnProfile, targetUserId]);

  const handleSaveProfile = (updated: any) => {
    setProfileData(prev => ({
      ...prev,
      fullName: updated.fullName,
      campus: updated.campus,
      campusId: updated.campusId ?? prev.campusId,
      campusCode: updated.campusCode ?? prev.campusCode,
      major: updated.major,
      majorId: updated.majorId ?? prev.majorId,
      majorCode: updated.majorCode ?? prev.majorCode,
      specialization: updated.specialization,
      specializationId: updated.specializationId ?? prev.specializationId,
      specializationCode: updated.specializationCode ?? prev.specializationCode,
      bio: updated.bio,
      interests: updated.interests,
      avatarUrl: updated.avatarUrl,
      coverUrl: updated.coverUrl ?? prev.coverUrl,
    }));
    updateUser({
      fullName: updated.fullName,
      avatarUrl: updated.avatarUrl,
      campus: updated.campusCode || updated.campus,
      major: updated.major,
      ...(updated.coverUrl ? { coverUrl: updated.coverUrl } : {}),
      ...(updated.campusId ? { campusId: updated.campusId } : {}),
      ...(updated.majorId ? { majorId: updated.majorId } : {}),
      ...(updated.specializationId ? { specializationId: updated.specializationId } : {}),
    });
  };

  // Quick Cover upload handler
  const handleQuickCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      validateImage(file, 10);
    } catch (err: any) {
      alert(err?.message || 'Ảnh không hợp lệ.');
      return;
    }
    try {
      setIsUploadingQuickCover(true);
      const res = await contentMediaApi.uploadMedia(file, 'GENERAL');
      const finalUrl = res.publicUrl;
      if (finalUrl) {
        await profileApi.updatePersonalInfo({ coverUrl: finalUrl });
        setProfileData(prev => ({ ...prev, coverUrl: finalUrl }));
        updateUser({ coverUrl: finalUrl } as any);
      }
    } catch (err) {
      console.warn('Failed to upload cover:', err);
      alert(t('Không thể tải ảnh bìa lên. Vui lòng thử lại.'));
    } finally {
      setIsUploadingQuickCover(false);
    }
  };

  // Follow / Unfollow handler
  const handleToggleFollow = async () => {
    if (isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (followStats.is_following) {
        await followApi.unfollowUser(targetUserId);
        setFollowStats(prev => ({
          ...prev,
          is_following: false,
          followers_count: Math.max(0, prev.followers_count - 1),
        }));
      } else {
        await followApi.followUser(targetUserId);
        setFollowStats(prev => ({
          ...prev,
          is_following: true,
          followers_count: prev.followers_count + 1,
        }));
      }
    } catch (err) {
      console.warn('Failed to toggle follow status:', err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Start chat handler (When followed -> open conversation)
  const handleStartChat = async () => {
    if (isMessageStarting) return;
    setIsMessageStarting(true);
    try {
      const conv = await directMessageApi.createConversation(targetUserId);
      const convId = conv?.conversation_id || conv?.conversationId;
      if (convId) {
        navigate(`/messages?conversationId=${convId}`);
      } else {
        navigate(`/messages?userId=${targetUserId}`);
      }
    } catch (err) {
      console.warn('Failed to initiate conversation:', err);
      navigate(`/messages?userId=${targetUserId}`);
    } finally {
      setIsMessageStarting(false);
    }
  };

  // Open modal for followers or following
  const openFollowListModal = async (type: 'followers' | 'following') => {
    setFollowModalType(type);
    setIsFollowListLoading(true);
    try {
      const res = type === 'followers'
        ? await followApi.getFollowers(targetUserId)
        : await followApi.getFollowing(targetUserId);
      setFollowListItems(res.items || []);
    } catch (err) {
      console.warn('Failed to load follow list:', err);
      setFollowListItems([]);
    } finally {
      setIsFollowListLoading(false);
    }
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
                className="px-4 py-2 bg-[#0076D1] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
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
            <div className="flex items-center gap-2">
              {/* Follow / Unfollow Button */}
              <button
                type="button"
                onClick={handleToggleFollow}
                disabled={isFollowLoading}
                className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                  followStats.is_following
                    ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200'
                    : 'bg-[#0076D1] hover:bg-blue-700 text-white'
                }`}
              >
                {isFollowLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : followStats.is_following ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('profile.following', 'Đang theo dõi')}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{t('profile.follow', 'Theo dõi')}</span>
                  </>
                )}
              </button>

              {/* Message Button: Active when following or triggers start chat */}
              <button
                type="button"
                onClick={handleStartChat}
                disabled={isMessageStarting || !followStats.is_following}
                className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 ${
                  followStats.is_following
                    ? 'bg-[#0076D1] hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
                title={followStats.is_following ? t('Nhắn tin với người này') : t('Theo dõi người này để mở tính năng trò chuyện')}
              >
                {isMessageStarting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                <span>{t('profile.message', 'Nhắn tin')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Profile Info Card with Cover Photo Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden space-y-0">
        {/* Cover Photo Banner */}
        <div className="relative w-full h-44 sm:h-52 md:h-60 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-700 overflow-hidden">
          {profileData.coverUrl ? (
            <img
              src={normalizeMediaUrl(profileData.coverUrl)}
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-700 via-sky-600 to-indigo-600">
              <span className="text-white/30 font-bold tracking-widest text-2xl uppercase select-none">
                FHub Community
              </span>
            </div>
          )}

          {/* Quick Change Cover Photo Button for Owner */}
          {isOwnProfile && (
            <div className="absolute top-4 right-4">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors shadow-xs">
                {isUploadingQuickCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                <span>{isUploadingQuickCover ? t('Đang tải...') : t('Đổi ảnh bìa')}</span>
                <input
                  type="file"
                  accept={IMAGE_ACCEPT}
                  className="hidden"
                  disabled={isUploadingQuickCover}
                  onChange={handleQuickCoverUpload}
                />
              </label>
            </div>
          )}
        </div>

        {/* Profile Details Content */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 sm:-mt-20">
            {/* Avatar overlapping Cover */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#0076D1] to-sky-400 flex items-center justify-center text-white font-bold text-3xl overflow-hidden shadow-md ring-4 ring-white shrink-0">
              {profileData.avatarUrl ? (
                <img src={normalizeMediaUrl(profileData.avatarUrl)} alt={t("Avatar")} className="w-full h-full object-cover" />
              ) : (
                profileData.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'BQ'
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0 sm:pt-4">
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

              {/* Followers & Following Stats (Simple, minimal style) */}
              <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => openFollowListModal('followers')}
                  className="hover:text-[#0076D1] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="font-bold text-slate-800">{followStats.followers_count}</span>
                  <span className="text-slate-500">{t('profile.followers', 'người theo dõi')}</span>
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => openFollowListModal('following')}
                  className="hover:text-[#0076D1] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="font-bold text-slate-800">{followStats.following_count}</span>
                  <span className="text-slate-500">{t('profile.followingCount', 'đang theo dõi')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4-Item Meta Bar */}
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
      </div>

      {/* 3 Real Dynamic Stats Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Questions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {t('profile.questionsCountLabel', 'CÂU HỎI ĐÃ ĐẶT')}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-[#181C22]">
              {questions.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {questions.length} {t('profile.questionsUnit', 'câu hỏi')}
            </span>
          </div>
        </div>

        {/* Card 2: Karma */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {t('profile.karmaScoreLabel', 'ĐIỂM UY TÍN (KARMA)')}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-[#181C22]">
              {profileData.stats.helpfulVotes}
            </span>
            <span className="text-xs font-semibold text-[#0076D1] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {profileData.stats.helpfulVotes} {t('profile.pointsUnit', 'điểm')}
            </span>
          </div>
        </div>

        {/* Card 3: Badges */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <span className="block font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {t('profile.badgesEarnedLabel', 'HUY HIỆU ĐÃ ĐẠT')}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-[#181C22]">
              {userBadges.length}
            </span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              {userBadges.length} {t('profile.badgesUnit', 'huy hiệu')}
            </span>
          </div>
        </div>
      </div>

      {/* About Me Section */}
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
          {profileData.interests && profileData.interests.length > 0 ? (
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
          ) : (
            <p className="text-xs text-slate-400 italic">
              {t('profile.noInterests', 'Chưa cập nhật sở thích học thuật / công nghệ.')}
            </p>
          )}
        </div>

        {profileData.detailedBio ? (
          <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
            {profileData.detailedBio}
          </p>
        ) : null}
      </div>

      {/* Interactive Activity & Contributions Tabs */}
      <div className="space-y-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: t('profile.tabOverview', 'Overview') },
            { id: 'questions', label: `${t('profile.tabQuestions', 'Questions')} (${questions.length})` },
            { id: 'answers', label: `${t('profile.tabAnswers', 'Answers')} (${answers.length})` },
            { id: 'badges', label: `${t('profile.tabBadges', 'Badges')} (${userBadges.length})` },
            ...(isOwnProfile ? [{ id: 'votes', label: `${t('profile.tabVotes', 'Vote History')} (${userVoteHistory.length})` }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
                    className="text-xs font-semibold text-[#0076D1] hover:underline cursor-pointer"
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
                      className="text-xs font-semibold text-[#0076D1] hover:underline cursor-pointer"
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
        {activeTab === 'votes' && isOwnProfile && (
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

      {/* Followers / Following Details Modal (Simple, standard style) */}
      {followModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0076D1]" />
                <h3 className="text-sm font-bold text-[#181C22]">
                  {followModalType === 'followers'
                    ? `${t('Người theo dõi')} (${followStats.followers_count})`
                    : `${t('Đang theo dõi')} (${followStats.following_count})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFollowModalType(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {isFollowListLoading ? (
                <div className="p-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0076D1]" />
                  <p className="text-xs">{t('Đang tải danh sách...')}</p>
                </div>
              ) : followListItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {followModalType === 'followers'
                    ? t('Chưa có người nào theo dõi.')
                    : t('Chưa theo dõi người dùng nào.')}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {followListItems.map((item) => (
                    <div key={item.user_id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0076D1] border border-blue-200 font-bold text-xs flex items-center justify-center shrink-0">
                          {`U${item.user_id}`}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {t('Sinh viên')} #{item.user_id}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(item.followed_at)}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/profile/${item.user_id}`}
                        onClick={() => setFollowModalType(null)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#0076D1] hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors shrink-0"
                      >
                        {t('Xem hồ sơ')}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveSuccess={handleSaveProfile}
        initialData={{
          fullName: profileData.fullName,
          email: profileData.email,
          campus: profileData.campus,
          campusId: profileData.campusId,
          campusCode: profileData.campusCode,
          major: profileData.major,
          majorId: profileData.majorId,
          majorCode: profileData.majorCode,
          specialization: profileData.specialization,
          specializationId: profileData.specializationId,
          specializationCode: profileData.specializationCode,
          bio: profileData.bio,
          interests: profileData.interests,
          avatarUrl: profileData.avatarUrl,
          coverUrl: profileData.coverUrl,
        }}
      />
    </div>
  );
};
