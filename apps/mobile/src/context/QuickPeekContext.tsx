import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';

export interface QuickPeekComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  content: string;
  upvotes: number;
  isAccepted?: boolean;
  createdAt?: string;
}

export interface QuickPeekItem {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  authorCampus?: string;
  authorRole?: string;
  createdAt?: string;
  courseCode?: string;
  score?: number;
  tags?: string[];
  type: 'question' | 'article';
  isSolved?: boolean;
  isModVerified?: boolean;
  featuredComments?: QuickPeekComment[];
}

export type GestureAction = 'UP' | 'DOWN' | 'RIGHT' | 'LEFT' | null;

interface ShowPeekOptions {
  item: QuickPeekItem;
  onVote?: (id: string, dir: 'UP' | 'DOWN') => void;
  onOpenDetail?: (item: QuickPeekItem) => void;
}

interface QuickPeekContextValue {
  isPeeking: boolean;
  activeItem: QuickPeekItem | null;
  activeGesture: GestureAction;
  startPeek: (options: ShowPeekOptions) => void;
  updateMove: (dx: number, dy: number) => void;
  releasePeek: () => void;
  cancelPeek: () => void;
}

const QuickPeekContext = createContext<QuickPeekContextValue>({
  isPeeking: false,
  activeItem: null,
  activeGesture: null,
  startPeek: () => {},
  updateMove: () => {},
  releasePeek: () => {},
  cancelPeek: () => {},
});

export const useQuickPeek = () => useContext(QuickPeekContext);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GESTURE_THRESHOLD_Y = 32;
const GESTURE_THRESHOLD_X = 35;

/**
 * Elastic rubber-band dampening function: gives smooth physical resistance to finger drag
 */
const elasticDampen = (val: number, limit = 160) => {
  return (val / (1 + Math.abs(val) / limit)) * 0.75;
};

export const QuickPeekProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPeeking, setIsPeeking] = useState(false);
  const [activeItem, setActiveItem] = useState<QuickPeekItem | null>(null);
  const [activeGesture, setActiveGesture] = useState<GestureAction>(null);

  const onVoteRef = useRef<((id: string, dir: 'UP' | 'DOWN') => void) | undefined>(undefined);
  const onOpenDetailRef = useRef<((item: QuickPeekItem) => void) | undefined>(undefined);
  const activeGestureRef = useRef<GestureAction>(null);
  const activeItemRef = useRef<QuickPeekItem | null>(null);

  // Core Card Animations
  const animScale = useRef(new Animated.Value(0.86)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animPanX = useRef(new Animated.Value(0)).current;
  const animPanY = useRef(new Animated.Value(0)).current;

  // Dedicated spring scale for each of the 4 directional action badges
  const badgeUpScale = useRef(new Animated.Value(1)).current;
  const badgeDownScale = useRef(new Animated.Value(1)).current;
  const badgeRightScale = useRef(new Animated.Value(1)).current;
  const badgeLeftScale = useRef(new Animated.Value(1)).current;

  // Sync gesture ref & trigger organic spring animations on directional badges
  const setGesture = useCallback((g: GestureAction) => {
    activeGestureRef.current = g;
    setActiveGesture(g);

    Animated.parallel([
      Animated.spring(badgeUpScale, {
        toValue: g === 'UP' ? 1.2 : g ? 0.88 : 1.0,
        friction: 5,
        tension: 110,
        useNativeDriver: true,
      }),
      Animated.spring(badgeDownScale, {
        toValue: g === 'DOWN' ? 1.2 : g ? 0.88 : 1.0,
        friction: 5,
        tension: 110,
        useNativeDriver: true,
      }),
      Animated.spring(badgeRightScale, {
        toValue: g === 'RIGHT' ? 1.2 : g ? 0.88 : 1.0,
        friction: 5,
        tension: 110,
        useNativeDriver: true,
      }),
      Animated.spring(badgeLeftScale, {
        toValue: g === 'LEFT' ? 1.2 : g ? 0.88 : 1.0,
        friction: 5,
        tension: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }, [badgeUpScale, badgeDownScale, badgeRightScale, badgeLeftScale]);

  const startPeek = useCallback((options: ShowPeekOptions) => {
    onVoteRef.current = options.onVote;
    onOpenDetailRef.current = options.onOpenDetail;
    activeItemRef.current = options.item;
    setActiveItem(options.item);
    setGesture(null);
    setIsPeeking(true);

    animPanX.setValue(0);
    animPanY.setValue(0);

    Animated.parallel([
      Animated.spring(animScale, {
        toValue: 1,
        friction: 6,
        tension: 85,
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animScale, animOpacity, animPanX, animPanY, setGesture]);

  const updateMove = useCallback((dx: number, dy: number) => {
    // Smooth elastic rubber-band tracking
    const dampedX = elasticDampen(dx, 150);
    const dampedY = elasticDampen(dy, 150);
    animPanX.setValue(dampedX);
    animPanY.setValue(dampedY);

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Direction calculation for 4 cardinal axes (UP, DOWN, RIGHT, LEFT)
    if (dy < -GESTURE_THRESHOLD_Y && absY > absX * 0.72) {
      if (activeGestureRef.current !== 'UP') setGesture('UP');
    } else if (dy > GESTURE_THRESHOLD_Y && absY > absX * 0.72) {
      if (activeGestureRef.current !== 'DOWN') setGesture('DOWN');
    } else if (dx > GESTURE_THRESHOLD_X && absX > absY * 0.72) {
      if (activeGestureRef.current !== 'RIGHT') setGesture('RIGHT');
    } else if (dx < -GESTURE_THRESHOLD_X && absX > absY * 0.72) {
      if (activeGestureRef.current !== 'LEFT') setGesture('LEFT');
    } else {
      if (activeGestureRef.current !== null) setGesture(null);
    }
  }, [animPanX, animPanY, setGesture]);

  const dismissWithAnimation = useCallback((callback?: () => void) => {
    Animated.parallel([
      Animated.timing(animScale, {
        toValue: 0.88,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPeeking(false);
      setActiveItem(null);
      activeItemRef.current = null;
      setGesture(null);
      animPanX.setValue(0);
      animPanY.setValue(0);
      if (callback) callback();
    });
  }, [animScale, animOpacity, animPanX, animPanY, setGesture]);

  const releasePeek = useCallback(() => {
    const finalGesture = activeGestureRef.current;
    const currentItem = activeItemRef.current;

    // Execute intended action upon release
    if (currentItem) {
      if (finalGesture === 'UP' && onVoteRef.current) {
        onVoteRef.current(currentItem.id, 'UP');
      } else if (finalGesture === 'DOWN' && onVoteRef.current) {
        onVoteRef.current(currentItem.id, 'DOWN');
      } else if (finalGesture === 'RIGHT' && onOpenDetailRef.current) {
        onOpenDetailRef.current(currentItem);
      }
      // If 'LEFT' or null: cleanly auto-dismiss without action
    }

    // Auto-dismiss immediately ("buông tay ra tự tắt")
    dismissWithAnimation();
  }, [dismissWithAnimation]);

  const cancelPeek = useCallback(() => {
    dismissWithAnimation();
  }, [dismissWithAnimation]);

  // Dynamic 3D Card Rotation based on horizontal swipe
  const cardRotate = animPanX.interpolate({
    inputRange: [-130, 0, 130],
    outputRange: ['-5deg', '0deg', '5deg'],
    extrapolate: 'clamp',
  });

  const featuredComment = activeItem?.featuredComments?.[0];

  // Dynamic Card Accent & Glow Styling depending on active gesture direction
  const getCardAccentStyle = () => {
    switch (activeGesture) {
      case 'UP':
        return {
          borderColor: '#10B981',
          shadowColor: '#10B981',
          shadowOpacity: 0.42,
          shadowRadius: 28,
        };
      case 'DOWN':
        return {
          borderColor: '#EF4444',
          shadowColor: '#EF4444',
          shadowOpacity: 0.42,
          shadowRadius: 28,
        };
      case 'RIGHT':
        return {
          borderColor: Colors.primary,
          shadowColor: Colors.primary,
          shadowOpacity: 0.42,
          shadowRadius: 28,
        };
      case 'LEFT':
        return {
          borderColor: '#64748B',
          shadowColor: '#64748B',
          shadowOpacity: 0.35,
          shadowRadius: 24,
        };
      default:
        return {
          borderColor: 'rgba(255, 255, 255, 0.88)',
          shadowColor: '#000',
          shadowOpacity: 0.26,
          shadowRadius: 24,
        };
    }
  };

  return (
    <QuickPeekContext.Provider
      value={{
        isPeeking,
        activeItem,
        activeGesture,
        startPeek,
        updateMove,
        releasePeek,
        cancelPeek,
      }}
    >
      {children}

      {/* In-tree Seamless Quick Peek Overlay */}
      {isPeeking && activeItem && (
        <View
          style={[StyleSheet.absoluteFill, { zIndex: 99999 }]}
          pointerEvents="box-none"
        >
          {/* Dimmed Backdrop */}
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: animOpacity,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={cancelPeek}
              style={StyleSheet.absoluteFill}
            />

            {/* 1. TOP ACTION INDICATOR (⬆️ Upvote) */}
            <Animated.View
              style={[
                styles.actionIndicator,
                styles.indicatorTop,
                activeGesture === 'UP' && styles.actionIndicatorActiveUp,
                { transform: [{ scale: badgeUpScale }] },
              ]}
            >
              <View
                style={[
                  styles.badgeIconCircle,
                  activeGesture === 'UP' && styles.badgeIconCircleActiveUp,
                ]}
              >
                <Feather
                  name="arrow-up"
                  size={16}
                  color={activeGesture === 'UP' ? '#FFFFFF' : '#10B981'}
                />
              </View>
              <Text
                style={[
                  styles.actionIndicatorText,
                  { color: '#10B981' },
                  activeGesture === 'UP' && styles.actionIndicatorTextActive,
                ]}
              >
                {activeGesture === 'UP' ? '✨ THẢ TAY ĐỂ UPVOTE (+1)' : 'Vuốt lên: Upvote'}
              </Text>
            </Animated.View>

            {/* 2. LEFT ACTION INDICATOR (⬅️ Dismiss / Close) */}
            <Animated.View
              style={[
                styles.actionIndicator,
                styles.indicatorLeft,
                activeGesture === 'LEFT' && styles.actionIndicatorActiveLeft,
                { transform: [{ scale: badgeLeftScale }] },
              ]}
            >
              <View
                style={[
                  styles.badgeIconCircle,
                  activeGesture === 'LEFT' && styles.badgeIconCircleActiveLeft,
                ]}
              >
                <Feather
                  name="x"
                  size={15}
                  color={activeGesture === 'LEFT' ? '#FFFFFF' : '#64748B'}
                />
              </View>
              <Text
                style={[
                  styles.actionIndicatorText,
                  { color: '#64748B' },
                  activeGesture === 'LEFT' && styles.actionIndicatorTextActive,
                ]}
              >
                {activeGesture === 'LEFT' ? '✕ THẢ TAY ĐỂ ĐÓNG' : 'Vuốt trái: Đóng'}
              </Text>
            </Animated.View>

            {/* 3. RIGHT ACTION INDICATOR (➡️ Open Detail) */}
            <Animated.View
              style={[
                styles.actionIndicator,
                styles.indicatorRight,
                activeGesture === 'RIGHT' && styles.actionIndicatorActiveRight,
                { transform: [{ scale: badgeRightScale }] },
              ]}
            >
              <Text
                style={[
                  styles.actionIndicatorText,
                  { color: Colors.primary },
                  activeGesture === 'RIGHT' && styles.actionIndicatorTextActive,
                ]}
              >
                {activeGesture === 'RIGHT' ? '📖 THẢ TAY ĐỂ MỞ' : 'Vuốt phải: Chi tiết'}
              </Text>
              <View
                style={[
                  styles.badgeIconCircle,
                  activeGesture === 'RIGHT' && styles.badgeIconCircleActiveRight,
                ]}
              >
                <Feather
                  name="arrow-right"
                  size={15}
                  color={activeGesture === 'RIGHT' ? '#FFFFFF' : Colors.primary}
                />
              </View>
            </Animated.View>

            {/* MAIN FLOATING PREVIEW CARD WITH 3D TILT & RUBBER-BAND PHYSICS */}
            <Animated.View
              style={[
                styles.previewCard,
                getCardAccentStyle(),
                {
                  opacity: animOpacity,
                  transform: [
                    { scale: animScale },
                    { translateX: animPanX },
                    { translateY: animPanY },
                    { rotate: cardRotate },
                  ],
                },
              ]}
            >
              {/* TOP SECTION: POST SUMMARY */}
              <View style={styles.topSection}>
                {/* Author row */}
                <View style={styles.authorRow}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorAvatarText}>
                      {activeItem.authorName.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.authorMeta}>
                    <View style={styles.authorNameRow}>
                      <Text style={styles.authorName} numberOfLines={1}>
                        {activeItem.authorName}
                      </Text>
                      {activeItem.isModVerified && (
                        <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                      )}
                    </View>
                    <Text style={styles.authorSub}>
                      {activeItem.authorCampus || 'FPTU'} • {activeItem.createdAt || 'Mới đăng'}
                    </Text>
                  </View>

                  {activeItem.courseCode && (
                    <View style={styles.courseBadge}>
                      <Text style={styles.courseBadgeText}>{activeItem.courseCode}</Text>
                    </View>
                  )}
                </View>

                {/* Dynamic Status / Banner Badge */}
                <View
                  style={[
                    styles.peekBanner,
                    activeGesture === 'UP' && styles.peekBannerUp,
                    activeGesture === 'DOWN' && styles.peekBannerDown,
                    activeGesture === 'RIGHT' && styles.peekBannerRight,
                    activeGesture === 'LEFT' && styles.peekBannerLeft,
                  ]}
                >
                  <Feather
                    name={
                      activeGesture === 'UP'
                        ? 'arrow-up-circle'
                        : activeGesture === 'DOWN'
                        ? 'arrow-down-circle'
                        : activeGesture === 'RIGHT'
                        ? 'external-link'
                        : activeGesture === 'LEFT'
                        ? 'x-circle'
                        : 'zap'
                    }
                    size={12}
                    color={
                      activeGesture === 'UP'
                        ? '#059669'
                        : activeGesture === 'DOWN'
                        ? '#DC2626'
                        : activeGesture === 'RIGHT'
                        ? Colors.primary
                        : activeGesture === 'LEFT'
                        ? '#475569'
                        : Colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.peekBannerText,
                      activeGesture === 'UP' && { color: '#059669' },
                      activeGesture === 'DOWN' && { color: '#DC2626' },
                      activeGesture === 'RIGHT' && { color: Colors.primary },
                      activeGesture === 'LEFT' && { color: '#475569' },
                    ]}
                  >
                    {activeGesture === 'UP'
                      ? 'CHẾ ĐỘ UPVOTE (+1)'
                      : activeGesture === 'DOWN'
                      ? 'CHẾ ĐỘ DOWNVOTE (-1)'
                      : activeGesture === 'RIGHT'
                      ? 'CHẾ ĐỘ MỞ BÀI VIẾT'
                      : activeGesture === 'LEFT'
                      ? 'CHẾ ĐỘ ĐÓNG BẢN XEM'
                      : 'BẢN XEM NHANH TÓM TẮT'}
                  </Text>
                </View>

                {/* Question / Article Title */}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {activeItem.title}
                </Text>

                {/* Excerpt Content */}
                <Text style={styles.cardContent} numberOfLines={4}>
                  {activeItem.content}
                </Text>

                {/* Hashtags & Score */}
                {activeItem.tags && activeItem.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {activeItem.tags.slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.tagPill}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                    {activeItem.score !== undefined && (
                      <View style={styles.scorePill}>
                        <Feather name="thumbs-up" size={11} color={Colors.primary} />
                        <Text style={styles.scoreText}>{activeItem.score} vote</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* CARD DIVIDER */}
              <View style={styles.cardDivider} />

              {/* BOTTOM SECTION: FEATURED COMMENTS */}
              <View style={styles.bottomSection}>
                <View style={styles.featuredCommentHeader}>
                  <View style={styles.commentBadge}>
                    <Feather name="message-square" size={12} color="#0D9488" />
                    <Text style={styles.commentBadgeText}>BÌNH LUẬN NỔI BẬT</Text>
                  </View>
                  {featuredComment?.isAccepted && (
                    <View style={styles.acceptedPill}>
                      <Ionicons name="checkmark-done" size={13} color="#059669" />
                      <Text style={styles.acceptedPillText}>Lời giải chính xác</Text>
                    </View>
                  )}
                </View>

                {featuredComment ? (
                  <View style={styles.commentBox}>
                    <View style={styles.commentAuthorRow}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>
                          {featuredComment.authorName.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.commentAuthorMeta}>
                        <Text style={styles.commentAuthorName} numberOfLines={1}>
                          {featuredComment.authorName}
                        </Text>
                        <Text style={styles.commentTime}>
                          {featuredComment.createdAt || 'Gần đây'}
                        </Text>
                      </View>
                      <View style={styles.commentVoteBadge}>
                        <Feather name="thumbs-up" size={11} color={Colors.primary} />
                        <Text style={styles.commentVoteScore}>{featuredComment.upvotes}</Text>
                      </View>
                    </View>
                    <Text style={styles.commentContent} numberOfLines={3}>
                      {featuredComment.content}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.noCommentBox}>
                    <Text style={styles.noCommentText}>Chưa có câu trả lời nào • Hãy đóng góp lời giải</Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* 4. BOTTOM ACTION INDICATOR (⬇️ Downvote) */}
            <Animated.View
              style={[
                styles.actionIndicator,
                styles.indicatorBottom,
                activeGesture === 'DOWN' && styles.actionIndicatorActiveDown,
                { transform: [{ scale: badgeDownScale }] },
              ]}
            >
              <View
                style={[
                  styles.badgeIconCircle,
                  activeGesture === 'DOWN' && styles.badgeIconCircleActiveDown,
                ]}
              >
                <Feather
                  name="arrow-down"
                  size={16}
                  color={activeGesture === 'DOWN' ? '#FFFFFF' : '#EF4444'}
                />
              </View>
              <Text
                style={[
                  styles.actionIndicatorText,
                  { color: '#EF4444' },
                  activeGesture === 'DOWN' && styles.actionIndicatorTextActive,
                ]}
              >
                {activeGesture === 'DOWN' ? '🔻 THẢ TAY ĐỂ DOWNVOTE (-1)' : 'Vuốt xuống: Downvote'}
              </Text>
            </Animated.View>

            {/* BOTTOM COMPASS & HINT */}
            <View style={styles.bottomHintWrap}>
              <Text style={styles.bottomHintText}>
                💡 Vuốt Lên (+1) • Xuống (-1) • Phải (Mở) • Trái (Đóng) • Buông để chọn
              </Text>
            </View>
          </Animated.View>
        </View>
      )}
    </QuickPeekContext.Provider>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.74)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 99999,
  },
  previewCard: {
    width: Math.min(SCREEN_WIDTH - 40, 390),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    elevation: 25,
    overflow: 'hidden',
  },
  topSection: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  authorAvatarText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  authorMeta: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: Colors.text,
  },
  authorSub: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  courseBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  courseBadgeText: {
    fontSize: FontSize.caption,
    fontWeight: '800',
    color: Colors.primary,
  },
  peekBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: Spacing.sm,
  },
  peekBannerUp: {
    backgroundColor: '#ECFDF5',
  },
  peekBannerDown: {
    backgroundColor: '#FEF2F2',
  },
  peekBannerRight: {
    backgroundColor: '#EFF6FF',
  },
  peekBannerLeft: {
    backgroundColor: '#F1F5F9',
  },
  peekBannerText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: FontSize.titleSm,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  cardContent: {
    fontSize: FontSize.bodySm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    gap: 4,
    marginLeft: 'auto',
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  bottomSection: {
    backgroundColor: '#F8FAFC',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  featuredCommentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  commentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.4,
  },
  acceptedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
    gap: 3,
  },
  acceptedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  commentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  commentAvatarText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  commentAuthorMeta: {
    flex: 1,
  },
  commentAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  commentTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  commentVoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  commentVoteScore: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  commentContent: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  noCommentBox: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  noCommentText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  // Floating Directional Guidance Indicators
  actionIndicator: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    gap: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 100,
  },
  badgeIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconCircleActiveUp: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeIconCircleActiveDown: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeIconCircleActiveRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeIconCircleActiveLeft: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  actionIndicatorText: {
    fontSize: 13,
    fontWeight: '800',
  },
  actionIndicatorTextActive: {
    color: '#FFFFFF',
  },
  indicatorTop: {
    top: 52,
    alignSelf: 'center',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  actionIndicatorActiveUp: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  indicatorBottom: {
    bottom: 74,
    alignSelf: 'center',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionIndicatorActiveDown: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  indicatorRight: {
    right: 12,
    top: '38%',
    borderColor: 'rgba(2, 132, 199, 0.3)',
  },
  actionIndicatorActiveRight: {
    backgroundColor: Colors.primary,
    borderColor: '#0284C7',
  },
  indicatorLeft: {
    left: 12,
    top: '38%',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  actionIndicatorActiveLeft: {
    backgroundColor: '#475569',
    borderColor: '#334155',
  },
  bottomHintWrap: {
    position: 'absolute',
    bottom: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bottomHintText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
