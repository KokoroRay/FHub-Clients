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
import { apiClient } from '../../services/api/client';
import { normalizeMediaUrl, validateImage, IMAGE_ACCEPT } from '../../utils/mediaUtils';
import { resolveUserMajorName, FPT_CAMPUSES } from '../../utils/taxonomyUtils';
import { extractStudentIdFromEmail } from '../../utils/fptEmailValidator';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();
  const { formatDate, formatTime, locale, t } = useLanguage();

  const myStudentCode = (currentUser as any)?.studentCode || currentUser?.studentId || extractStudentIdFromEmail(currentUser?.email) || '';
  const isOwnProfile = !id || id === 'me' || String(id).toUpperCase() === String(currentUser?.id).toUpperCase() || (myStudentCode && String(id).toUpperCase() === String(myStudentCode).toUpperCase());

  // Resolved numeric user id
  const [targetUserId, setTargetUserId] = useState<number>(() => {
    if (isOwnProfile) return Number(currentUser?.id || 1);
    const num = Number(id);
    return !isNaN(num) && num > 0 ? num : 0;
  });

  // Profile Data State
  const [profileData, setProfileData] = useState(() => {
    if (isOwnProfile) {
      return {
        fullName: (currentUser as any)?.fullName || (currentUser as any)?.name || 'Sinh viên FHub',
        studentId: myStudentCode,
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
      };
    }
    return {
      fullName: 'Đang tải...',
      studentId: typeof id === 'string' && isNaN(Number(id)) ? id.toUpperCase() : '',
      email: '',
      campus: 'FPT University',
      campusId: undefined,
      campusCode: undefined,
      community: 'FHub Community',
      major: '',
      majorId: undefined,
      majorCode: undefined,
      specialization: undefined,
      specializationId: undefined,
      specializationCode: undefined,
      role: 'Student',
      status: 'Sinh viên FPTU',
      memberSince: 'Gần đây',
      bio: 'Chưa có thông tin giới thiệu.',
      detailedBio: '',
      interests: [] as string[],
      avatarUrl: '',
      coverUrl: '',
      stats: {
        articlesPublished: 0,
        articlesSubtext: '0 articles',
        studyMaterialsShared: 0,
        materialsSubtext: '0 downloads',
        courseReviewsWritten: 0,
        reviewsSubtext: '0 reviews',
        questionsCount: 0,
        answersCount: 0,
        helpfulVotes: 0,
        badgesCount: 0,
      }
    };
  });

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [userVoteHistory, setUserVoteHistory] = useState<any[]>([]);

  // Follow State
  const [followStats, setFollowStats] = useState<FollowStats>({
    user_id: 0,
    followers_count: 0,
    following_count: 0,
    is_following: false,
  });
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isMessageStarting, setIsMessageStarting] = useState(false);

  // Follow list modal state
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [followListItems, setFollowListItems] = useState<any[]>([]);
  const [isFollowListLoading, setIsFollowListLoading] = useState(false);

  // Quick cover upload state
  const [isUploadingQuickCover, setIsUploadingQuickCover] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'answers' | 'badges' | 'votes'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Scroll to top and resolve target user id whenever id or currentUser changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    let isMounted = true;

    if (isOwnProfile) {
      setTargetUserId(Number(currentUser?.id || 1));
      // Normalize own URL to /profile/MSSV if currently on generic /profile or numeric id
      if (myStudentCode && (!id || id === 'me' || id === String(currentUser?.id))) {
        navigate(`/profile/${myStudentCode}`, { replace: true });
      }
      return;
    }

    const num = Number(id);
    if (!isNaN(num) && num > 0) {
      setTargetUserId(num);
      return;
    }

    // If id is a string studentCode like CE181522, resolve it from identity API
    const resolveByStudentCode = async () => {
      try {
        const res = await apiClient.get<any>('/api/users', { params: { search: id } });
        const items = res.data?.items || res.data?.data?.items || (Array.isArray(res.data?.data) ? res.data.data : []);
        if (isMounted && items && items.length > 0) {
          const matched = items.find((u: any) => 
            String(u.studentCode || u.student_code || '').toUpperCase() === String(id).toUpperCase() ||
            String(u.email || '').toUpperCase().includes(String(id).toUpperCase())
          ) || items[0];
          const foundId = Number(matched.userId || matched.id);
          if (foundId > 0) {
            setTargetUserId(foundId);
          }
        }
      } catch (err) {
        console.warn('Could not resolve user by student code:', err);
      }
    };
    resolveByStudentCode();

    return () => { isMounted = false; };
  }, [id, currentUser?.id, isOwnProfile, myStudentCode]);

  // Load Follow stats whenever targetUserId changes
  useEffect(() => {
    if (targetUserId <= 0) return;
    let isMounted = true;
    const loadFollowStats = async () => {
      try {
        const stats = await followApi.getFollowStats(targetUserId);
        if (isMounted) setFollowStats(stats);
      } catch (err) {
        console.warn('Could not fetch follow stats:', err);
      }
    };
    loadFollowStats();
    return () => { isMounted = false; };
  }, [targetUserId]);

  // Fetch Questions for the target user
  useEffect(() => {
    if (targetUserId <= 0) return;
    let isMounted = true;
    const fetchUserQuestions = async () => {
      try {
        const res = await questionApi.getQuestions({
          mine: isOwnProfile ? true : undefined,
          pageSize: 30,
        });
        if (isMounted && res?.items) {
          let list = res.items;
          if (!isOwnProfile) {
            list = list.filter((q: any) => Number(q.authorUserId || q.author?.id) === targetUserId);
          }
          const items = list.map((q: any) => ({
            id: q.questionId,
            course: q.courseCode || (q.courseId ? `COURSE-${q.courseId}` : 'FHub'),
            title: q.title,
            votes: (q.upvoteCount || 0) - (q.downvoteCount || 0),
            answers: q.answerCount || 0,
            isSolved: !!q.bestAnswerId,
            time: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Vừa xong',
          }));
          setQuestions(items);

          // Populate answers tab for the user
          try {
            const allQ = await questionApi.getQuestions({ pageSize: 30 });
            if (isMounted && allQ?.items) {
              const foundAnswers: any[] = [];
              const sampleQ = allQ.items.slice(0, 10);
              await Promise.allSettled(sampleQ.map(async (q: any) => {
                try {
                  const ansList = await questionApi.getAnswers(q.questionId);
                  if (Array.isArray(ansList)) {
                    ansList.filter((a: any) => Number(a.authorUserId) === targetUserId).forEach((a: any) => {
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
  }, [targetUserId, isOwnProfile]);

  // Fetch Profile details from profile-service
  useEffect(() => {
    if (targetUserId <= 0) return;
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const live = await profileApi.getProfile(targetUserId);
        if (isMounted && live) {
          const resolvedMajor = resolveUserMajorName(live);
          const resolvedCampus = live.campusCode 
            ? (FPT_CAMPUSES[live.campusCode] || `FPT University - ${live.campusCode}`)
            : (live.campusId ? (FPT_CAMPUSES[live.campusId] || 'FPT University') : 'FPT University');

          let cover = '';
          if (live.coverUrl) {
            cover = live.coverUrl;
          } else if (live.links && Array.isArray(live.links)) {
            const cLink = live.links.find((l: any) => (l.platformName || l.PlatformName) === 'COVER_IMAGE');
            if (cLink) cover = cLink.url || cLink.Url || '';
          }

          const studentCode = live.studentCode || live.studentId || extractStudentIdFromEmail(live.email) || (typeof id === 'string' && isNaN(Number(id)) ? id.toUpperCase() : '');

          // Replace numeric ID in URL with MSSV if available
          if (!isOwnProfile && studentCode && id && !isNaN(Number(id))) {
            navigate(`/profile/${studentCode}`, { replace: true });
          }

          setProfileData(prev => ({
            ...prev,
            fullName: live.displayName || live.fullName || (isOwnProfile ? currentUser?.fullName : 'Sinh viên FHub') || 'Sinh viên FHub',
            email: isOwnProfile ? (currentUser?.email || live.email || '') : (live.email || ''),
            bio: (live.bio && live.bio !== 'Chưa có thông tin giới thiệu.') ? live.bio : 'Chưa có thông tin giới thiệu.',
            avatarUrl: live.avatarUrl || (isOwnProfile ? currentUser?.avatarUrl || '' : ''),
            coverUrl: cover,
            studentId: studentCode || (isOwnProfile ? myStudentCode : ''),
            major: resolvedMajor,
            campus: resolvedCampus,
            campusId: live.campusId,
            campusCode: live.campusCode,
            majorId: live.majorId,
            majorCode: live.majorCode,
            specialization: live.specializationName || live.specialization,
            specializationId: live.specializationId,
            specializationCode: live.specializationCode,
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
  }, [targetUserId, isOwnProfile, currentUser?.id]);

  // Fetch badges & votes
  useEffect(() => {
    if (targetUserId <= 0) return;
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
              'bg-rose-50 text-rose-800 border-rose-200'
            ];
            const mapped = apiBadges.map((b: any, index: number) => ({
              id: b.userBadgeId || b.id || index,
              name: b.name || b.badgeCode,
              description: b.description || 'Thành tích hoạt động học thuật FHub',
              icon: badgeIcons[index % badgeIcons.length],
              earnedDate: b.awardedAt || 'Gần đây',
              color: badgeColors[index % badgeColors.length]
            }));
            setUserBadges(mapped);
          } else {
            setUserBadges([]);
          }
        }
      } catch (err) {
        if (isMounted) setUserBadges([]);
      }

      if (isOwnProfile) {
        try {
          const apiVotes = await voteApi.getMyVotes();
          if (isMounted && apiVotes && apiVotes.length > 0) {
            const mappedVotes = apiVotes.map((v: any, index: number) => ({
              id: index,
              type: v.targetType === 'QUESTION' ? 'Câu hỏi' : 'Câu trả lời',
              targetTitle: v.targetTitle || `Bài đăng #${v.targetId}`,
              author: v.authorName || 'Bạn học',
              vote: v.voteValue === 1 ? '+1 Upvote' : '-1 Downvote',
              date: v.createdAt || new Date().toISOString()
            }));
            setUserVoteHistory(mappedVotes);
          }
        } catch {}
      }
    };
    fetchInteractions();
    return () => { isMounted = false; };
  }, [targetUserId, isOwnProfile]);

  const handleSaveProfile = (updated: any) => {
    setProfileData(prev => ({
      ...prev,
      fullName: updated.fullName,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl || prev.avatarUrl,
      coverUrl: updated.coverUrl ?? prev.coverUrl,
      major: updated.major,
      campus: updated.campus,
      campusId: updated.campusId,
      campusCode: updated.campusCode,
      specialization: updated.specialization,
      specializationId: updated.specializationId,
      interests: updated.interests,
    }));
    updateUser({
      fullName: updated.fullName,
      avatarUrl: updated.avatarUrl,
      ...(updated.coverUrl ? { coverUrl: updated.coverUrl } : {}),
      ...(updated.campus ? { campus: updated.campus } : {}),
      ...(updated.campusId ? { campusId: updated.campusId } : {}),
      ...(updated.major ? { major: updated.major } : {}),
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
    if (isFollowLoading || targetUserId <= 0) return;
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

  // Handle direct message navigation
  const handleStartMessage = async () => {
    if (isMessageStarting || targetUserId <= 0) return;
    setIsMessageStarting(true);
    try {
      const conv = await directMessageApi.createConversation(targetUserId);
      if (conv?.conversation_id) {
        navigate(`/messages?conversationId=${conv.conversation_id}`);
      } else {
        navigate(`/messages?userId=${targetUserId}`);
      }
    } catch (err) {
      navigate(`/messages?userId=${targetUserId}`);
    } finally {
      setIsMessageStarting(false);
    }
  };

  // Open modal for followers / following with enriched profiles
  const openFollowListModal = async (type: 'followers' | 'following') => {
    if (targetUserId <= 0) return;
    setFollowModalType(type);
    setIsFollowListLoading(true);
    try {
      const res = type === 'followers'
        ? await followApi.getFollowers(targetUserId)
        : await followApi.getFollowing(targetUserId);
      const rawItems: FollowUserItem[] = res.items || [];

      // Enrich with real user profiles
      const enriched = await Promise.all(
        rawItems.map(async (item) => {
          try {
            const uProf = await profileApi.getProfile(item.user_id);
            const sCode = uProf?.studentCode || extractStudentIdFromEmail(uProf?.email) || `CE${item.user_id}`;
            return {
              ...item,
              fullName: uProf?.displayName || uProf?.fullName || `Sinh viên #${item.user_id}`,
              avatarUrl: uProf?.avatarUrl || '',
              studentId: sCode,
            };
          } catch {
            return {
              ...item,
              fullName: `Sinh viên #${item.user_id}`,
              avatarUrl: '',
              studentId: `CE${item.user_id}`,
            };
          }
        })
      );
      setFollowListItems(enriched);
    } catch (err) {
      console.warn('Failed to load follow list:', err);
      setFollowListItems([]);
    } finally {
      setIsFollowListLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner / Actions Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181C22] dark:text-slate-100">
            {isOwnProfile ? t('profile.myProfileTitle', 'Hồ sơ của tôi') : profileData.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isOwnProfile
              ? t('profile.myProfileSubtitle', 'Xem thông tin cá nhân và hoạt động cộng đồng của bạn.')
              : t('Xem hồ sơ sinh viên và trao đổi học tập.')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isOwnProfile ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0076D1] hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {t('profile.editProfile', 'Chỉnh sửa hồ sơ')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
                title={t('Cài đặt')}
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
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
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>{t('Đang theo dõi')}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{t('Theo dõi')}</span>
                  </>
                )}
              </button>

              {/* Direct Message Button */}
              <button
                type="button"
                onClick={handleStartMessage}
                disabled={isMessageStarting}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                {isMessageStarting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                <span>{t('Nhắn tin')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Profile Card Container */}
      <div className="bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent dark:hover:border-[#444444] shadow-xs overflow-hidden transition-colors">
        {/* Cover Image Banner */}
        <div className="relative w-full h-48 sm:h-64 md:h-72 bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-800 rounded-t-2xl overflow-hidden shadow-inner">
          {profileData.coverUrl ? (
            <img
              src={normalizeMediaUrl(profileData.coverUrl)}
              alt={t('Ảnh bìa')}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
              <Sparkles className="w-12 h-12 mb-2 stroke-[1.2]" />
              <span className="text-xs font-medium tracking-wider uppercase">{profileData.campus}</span>
            </div>
          )}

          {/* Quick Cover Change Button (Only visible on own profile) */}
          {isOwnProfile && (
            <div className="absolute top-4 right-4 z-20">
              <label
                className="px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md cursor-pointer transition-all flex items-center gap-1.5 shadow-md border border-white/20"
                title={t('Thay đổi ảnh bìa nhanh')}
              >
                {isUploadingQuickCover ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <span>{t('Đổi ảnh bìa')}</span>
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

        {/* Profile Details Content: Avatar Overlap + Name & Actions (Clean, NO overlap bug) */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            {/* Left: Avatar (overlaps cover) + Full Name, Role, Student ID & Bio (CLEARLY VISIBLE) */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 sm:-mt-20">
              {/* Avatar overlapping Cover */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-[#0076D1] to-sky-400 flex items-center justify-center text-white font-bold text-3xl overflow-hidden shadow-xl ring-4 ring-white dark:ring-[#272727] shrink-0 z-10 bg-white dark:bg-[#272727]">
                {profileData.avatarUrl ? (
                  <img src={normalizeMediaUrl(profileData.avatarUrl)} alt={t("Avatar")} className="w-full h-full object-cover" />
                ) : (
                  profileData.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'FH'
                )}
              </div>

              {/* User Identity - placed next to avatar, bottom-aligned so it sits below the banner */}
              <div className="space-y-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                    {profileData.fullName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                    {t(profileData.role) || profileData.role}
                  </span>
                  {profileData.studentId && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                      {profileData.studentId}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  {profileData.bio === 'Chưa có thông tin giới thiệu.' ? t('Chưa có thông tin giới thiệu.') : profileData.bio}
                </p>

                {/* Followers & Following Stats */}
                <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => openFollowListModal('followers')}
                    className="hover:text-[#0076D1] dark:hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span className="font-bold text-slate-900 dark:text-slate-100">{followStats.followers_count}</span>
                    <span>{t('profile.followers', 'người theo dõi')}</span>
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => openFollowListModal('following')}
                    className="hover:text-[#0076D1] dark:hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span className="font-bold text-slate-900 dark:text-slate-100">{followStats.following_count}</span>
                    <span>{t('profile.followingCount', 'đang theo dõi')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold block">{t('EMAIL')}</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                {profileData.email || 'Chưa cập nhật'}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold block">{t('CỘNG ĐỒNG')}</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                {profileData.community}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold block">{t('CHUYÊN NGÀNH')}</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                {profileData.specialization || profileData.major || 'Kỹ thuật phần mềm (SE)'}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold block">{t('CƠ SỞ / TRẠNG THÁI')}</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                {profileData.campus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Activity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#272727] p-5 rounded-2xl border border-slate-200/90 dark:border-transparent dark:hover:border-[#444444] shadow-xs transition-colors">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">{t('CÂU HỎI ĐÃ ĐẶT')}</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{questions.length}</span>
            <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
              {questions.length} {t('Câu hỏi')}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#272727] p-5 rounded-2xl border border-slate-200/90 dark:border-transparent dark:hover:border-[#444444] shadow-xs transition-colors">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">{t('ĐIỂM UY TÍN (KARMA)')}</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{profileData.stats.helpfulVotes}</span>
            <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
              {profileData.stats.helpfulVotes} {t('điểm')}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#272727] p-5 rounded-2xl border border-slate-200/90 dark:border-transparent dark:hover:border-[#444444] shadow-xs transition-colors">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">{t('HUY HIỆU ĐÃ ĐẠT')}</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{userBadges.length}</span>
            <span className="text-xs text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 rounded-full font-semibold">
              {userBadges.length} {t('Huy hiệu')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs and Content List */}
      <div className="bg-white dark:bg-[#272727] rounded-2xl border border-slate-200/90 dark:border-transparent dark:hover:border-[#444444] shadow-xs p-6 transition-colors">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: t('Tổng quan') },
            { id: 'questions', label: `${t('Câu hỏi')} (${questions.length})` },
            { id: 'answers', label: `${t('Câu trả lời')} (${answers.length})` },
            { id: 'badges', label: `${t('Huy hiệu')} (${userBadges.length})` },
            ...(isOwnProfile ? [{ id: 'votes', label: t('Lịch sử bình chọn') }] : []),
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-[#0076D1] dark:bg-blue-950/60 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="pt-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">{t('Giới thiệu bản thân')}</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {profileData.bio}
            </p>
          </div>
        )}

        {/* Tab 2: Questions */}
        {activeTab === 'questions' && (
          <div className="pt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">{t('Chưa có câu hỏi nào.')}</div>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0076D1] dark:bg-blue-950/60 dark:text-blue-400">
                      #{q.course}
                    </span>
                    <Link
                      to={`/discussions/${q.id}`}
                      className="block text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-[#0076D1] dark:hover:text-blue-400 transition-colors truncate"
                    >
                      {q.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                    <span>{q.votes} votes</span>
                    <span>{q.answers} replies</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Answers */}
        {activeTab === 'answers' && (
          <div className="pt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {answers.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">{t('Chưa có câu trả lời nào.')}</div>
            ) : (
              answers.map((a) => (
                <div key={a.id} className="py-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0076D1]">
                      #{a.course}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                      {a.questionTitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2">{a.excerpt}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Badges */}
        {activeTab === 'badges' && (
          <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userBadges.length === 0 ? (
              <div className="col-span-full text-center py-8 text-slate-400 text-xs">{t('Chưa có huy hiệu nào.')}</div>
            ) : (
              userBadges.map((b) => (
                <div key={b.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">{b.icon}</span>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{b.name}</h5>
                    <p className="text-[10px] text-slate-400 truncate">{b.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Votes (Own Profile Only) */}
        {activeTab === 'votes' && isOwnProfile && (
          <div className="pt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {userVoteHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">{t('Chưa có lượt bình chọn nào.')}</div>
            ) : (
              userVoteHistory.map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{v.targetTitle}</span>
                  <span className="text-xs font-bold text-emerald-600">{v.vote}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Followers / Following Details Modal */}
      {followModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0076D1]" />
                <h3 className="text-sm font-bold text-[#181C22] dark:text-slate-100">
                  {followModalType === 'followers'
                    ? `${t('Người theo dõi')} (${followStats.followers_count})`
                    : `${t('Đang theo dõi')} (${followStats.following_count})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFollowModalType(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
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
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {followListItems.map((item) => (
                    <div key={item.user_id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0076D1] border border-blue-200 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                          {item.avatarUrl ? (
                            <img src={normalizeMediaUrl(item.avatarUrl)} alt={item.fullName} className="w-full h-full object-cover" />
                          ) : (
                            item.fullName ? item.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : `U${item.user_id}`
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {item.fullName}
                          </p>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-semibold">
                            {item.studentId}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/profile/${item.studentId || item.user_id}`}
                        onClick={() => setFollowModalType(null)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#0076D1] hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors shrink-0 cursor-pointer"
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
