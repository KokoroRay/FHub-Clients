import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  MapPin,
  Users,
  Check,
  UserPlus,
  MessageCircle,
  ExternalLink,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { profileApi, followApi, FollowStats } from '../../services/api/studentApi';
import { normalizeMediaUrl } from '../../utils/mediaUtils';
import { resolveUserMajorName, FPT_CAMPUSES } from '../../utils/taxonomyUtils';
import { extractStudentIdFromEmail } from '../../utils/fptEmailValidator';

export interface UserHoverCardProps {
  userId?: number | string | null;
  initialData?: {
    fullName?: string;
    avatarUrl?: string;
    major?: string;
    campus?: string;
    studentId?: string;
  };
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface CachedUserData {
  profile: any;
  stats: FollowStats;
  isFollowing: boolean;
  fetchedAt: number;
}

// Global in-memory cache to prevent repeated rapid fetches when hovering
const hoverCardCache = new Map<number, CachedUserData>();

export const UserHoverCard: React.FC<UserHoverCardProps> = ({
  userId,
  initialData,
  children,
  className = '',
  disabled = false,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const numUserId = Number(userId);
  const isValidUser = Boolean(numUserId && !isNaN(numUserId) && numUserId > 0 && !disabled);
  const isOwnProfile = Boolean(currentUser?.id && Number(currentUser.id) === numUserId);

  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'bottom' | 'top' }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [userData, setUserData] = useState<{
    fullName: string;
    avatarUrl: string;
    major: string;
    campus: string;
    studentId: string;
    followersCount: number;
    isFollowing: boolean;
  }>({
    fullName: initialData?.fullName || '',
    avatarUrl: initialData?.avatarUrl || '',
    major: initialData?.major || 'Công nghệ thông tin',
    campus: initialData?.campus || 'FPT University',
    studentId: initialData?.studentId || '',
    followersCount: 0,
    isFollowing: false,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const enterTimerRef = useRef<any>(null);
  const leaveTimerRef = useRef<any>(null);

  // Position calculation
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const cardWidth = 330;
    const cardHeight = 210;

    let placement: 'bottom' | 'top' = 'bottom';
    let top = rect.bottom + 8;

    // Flip to top if overflowing window bottom
    if (rect.bottom + cardHeight + 16 > window.innerHeight && rect.top - cardHeight - 8 > 0) {
      top = rect.top - cardHeight - 8;
      placement = 'top';
    }

    // Horizontal positioning: align left with trigger, clamp within viewport
    let left = rect.left;
    if (left + cardWidth > window.innerWidth - 12) {
      left = window.innerWidth - cardWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    setCoords({ top, left, placement });
  }, []);

  // Fetch details when popover opens
  const loadUserDetails = useCallback(async () => {
    if (!isValidUser) return;

    // Check cache first (valid for 60 seconds)
    const cached = hoverCardCache.get(numUserId);
    const now = Date.now();
    if (cached && now - cached.fetchedAt < 60000) {
      const p = cached.profile;
      const resolvedMajor = resolveUserMajorName(p) || initialData?.major || 'Công nghệ thông tin';
      const resolvedCampus = p.campusCode
        ? (FPT_CAMPUSES[p.campusCode] || p.campusCode)
        : (p.campusId ? (FPT_CAMPUSES[p.campusId] || 'FPT University') : initialData?.campus || 'FPT University');

      setUserData({
        fullName: p.displayName || p.fullName || initialData?.fullName || 'Sinh viên FHub',
        avatarUrl: p.avatarUrl || initialData?.avatarUrl || '',
        major: resolvedMajor,
        campus: resolvedCampus,
        studentId: p.studentCode || p.studentId || extractStudentIdFromEmail(p.email) || String(numUserId),
        followersCount: cached.stats?.followers_count || 0,
        isFollowing: cached.isFollowing,
      });
      return;
    }

    setIsLoading(true);
    try {
      const [profileRes, statsRes, statusRes] = await Promise.allSettled([
        profileApi.getProfile(numUserId),
        followApi.getFollowStats(numUserId),
        !isOwnProfile ? followApi.getFollowStatus(numUserId) : Promise.resolve({ is_following: false }),
      ]);

      const profile = profileRes.status === 'fulfilled' ? profileRes.value : {};
      const stats: FollowStats = statsRes.status === 'fulfilled' ? statsRes.value : { user_id: numUserId, followers_count: 0, following_count: 0, is_following: false };
      const isFollowing = statusRes.status === 'fulfilled' ? Boolean(statusRes.value?.is_following) : false;

      // Cache it
      hoverCardCache.set(numUserId, {
        profile,
        stats,
        isFollowing,
        fetchedAt: Date.now(),
      });

      const resolvedMajor = resolveUserMajorName(profile) || initialData?.major || 'Công nghệ thông tin';
      const resolvedCampus = profile?.campusCode
        ? (FPT_CAMPUSES[profile.campusCode] || profile.campusCode)
        : (profile?.campusId ? (FPT_CAMPUSES[profile.campusId] || 'FPT University') : initialData?.campus || 'FPT University');

      const resolvedStudentId = profile?.studentCode || extractStudentIdFromEmail(profile?.email) || initialData?.studentId || '';
      setUserData({
        fullName: profile?.displayName || profile?.fullName || initialData?.fullName || 'Sinh viên FHub',
        avatarUrl: profile?.avatarUrl || initialData?.avatarUrl || '',
        major: resolvedMajor,
        campus: resolvedCampus,
        studentId: resolvedStudentId,
        followersCount: stats?.followers_count || 0,
        isFollowing,
      });
    } catch (err) {
      console.warn('Failed to fetch user hovercard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [numUserId, isValidUser, isOwnProfile, initialData]);

  // Handle open with delay
  const handleMouseEnter = () => {
    if (!isValidUser) return;
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    enterTimerRef.current = setTimeout(() => {
      updatePosition();
      setIsOpen(true);
      loadUserDetails();
    }, 280);
  };

  // Handle close with grace delay
  const handleMouseLeave = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleCardMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  // Close instantly on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => {
      updatePosition();
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Quick Follow / Unfollow
  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowLoading || !isValidUser || isOwnProfile) return;

    try {
      setIsFollowLoading(true);
      if (userData.isFollowing) {
        await followApi.unfollowUser(numUserId);
        setUserData(prev => {
          const updated = {
            ...prev,
            isFollowing: false,
            followersCount: Math.max(0, prev.followersCount - 1),
          };
          // Update cache
          const c = hoverCardCache.get(numUserId);
          if (c) {
            c.isFollowing = false;
            c.stats.followers_count = updated.followersCount;
          }
          return updated;
        });
      } else {
        await followApi.followUser(numUserId);
        setUserData(prev => {
          const updated = {
            ...prev,
            isFollowing: true,
            followersCount: prev.followersCount + 1,
          };
          // Update cache
          const c = hoverCardCache.get(numUserId);
          if (c) {
            c.isFollowing = true;
            c.stats.followers_count = updated.followersCount;
          }
          return updated;
        });
      }
    } catch (err) {
      console.warn('Failed to toggle follow on hover card:', err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleGoToProfile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    const dest = userData.studentId ? `/profile/${userData.studentId}` : `/profile/${numUserId}`;
    navigate(dest);
  };

  const handleDirectMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    navigate(`/messages?userId=${numUserId}`);
  };

  return (
    <div
      ref={triggerRef}
      className={`inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Click trigger opens profile */}
      <div
        onClick={handleGoToProfile}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
      >
        {children}
      </div>

      {/* Floating Card via Portal */}
      {isOpen &&
        isValidUser &&
        createPortal(
          <div
            ref={cardRef}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="w-80 sm:w-84 bg-[#242526] text-white rounded-2xl shadow-2xl border border-[#3e4042] p-4 animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            {/* Header: Avatar, Name & Close button */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Large Avatar */}
                <div
                  onClick={handleGoToProfile}
                  className="w-14 h-14 rounded-full ring-2 ring-[#0076D1] bg-[#18191a] shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center font-bold text-lg text-white"
                >
                  {userData.avatarUrl ? (
                    <img
                      src={normalizeMediaUrl(userData.avatarUrl)}
                      alt={userData.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {userData.fullName
                        ? userData.fullName
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()
                        : 'FH'}
                    </span>
                  )}
                </div>

                {/* Name & Title */}
                <div className="min-w-0 flex-1">
                  <div
                    onClick={handleGoToProfile}
                    className="font-bold text-base text-white hover:underline cursor-pointer truncate"
                    title={userData.fullName}
                  >
                    {userData.fullName || t('Sinh viên FHub')}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {isOwnProfile ? t('Hồ sơ của bạn') : t('Thành viên FHub')}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors shrink-0 cursor-pointer"
                title={t('common.close', 'Đóng')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Academic & Followers Meta Information */}
            <div className="mt-3.5 pt-3 border-t border-[#3e4042]/70 space-y-2 text-xs text-slate-300">
              {/* Ngành học */}
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate" title={userData.major}>
                  {userData.major}
                </span>
              </div>

              {/* Cơ sở */}
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate" title={userData.campus}>
                  {userData.campus}
                </span>
              </div>

              {/* Lượt người theo dõi */}
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-200">
                  {userData.followersCount.toLocaleString()}{' '}
                  <span className="text-slate-400 font-normal">
                    {t('người theo dõi')}
                  </span>
                </span>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-4 pt-3 border-t border-[#3e4042]/70 flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  type="button"
                  onClick={handleGoToProfile}
                  className="w-full py-2 px-3 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t('Xem trang cá nhân của bạn')}
                </button>
              ) : (
                <>
                  {/* Quick Follow Button */}
                  <button
                    type="button"
                    disabled={isFollowLoading}
                    onClick={handleToggleFollow}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      userData.isFollowing
                        ? 'bg-[#3a3b3c] hover:bg-[#4e4f50] text-slate-200 hover:text-white'
                        : 'bg-[#0076D1] hover:bg-blue-600 text-white shadow-sm'
                    }`}
                  >
                    {isFollowLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : userData.isFollowing ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t('Đang theo dõi')}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{t('Theo dõi')}</span>
                      </>
                    )}
                  </button>

                  {/* Nhắn tin Button */}
                  <button
                    type="button"
                    onClick={handleDirectMessage}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{t('Nhắn tin')}</span>
                  </button>

                  {/* View Full Profile Icon Button */}
                  <button
                    type="button"
                    onClick={handleGoToProfile}
                    className="p-2 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={t('Xem trang cá nhân chi tiết')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
